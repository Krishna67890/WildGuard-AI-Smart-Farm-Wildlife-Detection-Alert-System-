"""
WildGuard AI - External YOLOv8 Inference Pipeline & Detection Server
===================================================================
Features:
1. Real-time object detection using YOLOv8 (yolov8n.pt).
2. Built-in HTTP Detection Server (port 8000) for receiving live frames
   from the React frontend and backend.
3. Software acoustic alarm with 5-second cooldown using audio_alarm.py.
4. Local video/webcam inference preview window (via --source flag).
5. Telemetry synchronization with WildGuard AI backend (port 5000).

NOTE: The bundled yolov8n.pt is a standard COCO model. COCO does NOT include
a 'leopard' class, so leopard detections will only fire when a custom-trained
leopard model is supplied. Do not map other COCO animals (cat, dog, etc.) to
'leopard' – that produces false alerts.
"""

import os
import sys
import time
import argparse
import json
import base64
import requests
import cv2
import numpy as np
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from ultralytics import YOLO

# Add module directory to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from audio_alarm import AudioAlarm, get_alarm_instance

# --- Configuration ---
BACKEND_API_URL = os.environ.get("BACKEND_API_URL", "http://localhost:5000/api/ai/external-detection")
SERVER_PORT = int(os.environ.get("PORT", "8000"))
MODEL_VARIANT = "yolov8n.pt"
MIN_CONFIDENCE = 0.30  # Base detection filter (model returns all candidates >= 0.30)

# Designated Alert Class & Audio Alarm Settings
ALERT_CLASSES = {"leopard"}
ALERT_CONFIDENCE_THRESHOLD = 0.50  # Must be strictly > 0.50 confidence
ALARM_COOLDOWN_SECONDS = 5.0  # Cooldown between successive acoustic alarm triggers
CAMERA_ID = "cam-1"
ZONE_ID = "zone-1"

# COCO to WildGuard Species Mapping
# NOTE: yolov8n.pt is a standard COCO model; COCO has no 'leopard' class.
# The 'leopard' entry below is a forward-compatibility stub: it will only
# match if a custom-trained model that includes a 'leopard' class is loaded.
# Do NOT proxy other COCO animals (cat, dog, bird, etc.) to 'leopard' –
# that produces false detections and misleading alerts.
COCO_TO_WILDGUARD_MAP = {
    "leopard": "leopard",  # Only fires with a custom leopard-trained model
    "person": "human"
}

# Global instances
_global_model = None
_global_alarm = None


def get_model():
    """Load or return the cached YOLO model."""
    global _global_model
    if _global_model is None:
        model_path = os.path.join(CURRENT_DIR, MODEL_VARIANT)
        if not os.path.isfile(model_path):
            model_path = MODEL_VARIANT
        print(f"[WildGuard AI] Loading YOLO model ({model_path})...")
        _global_model = YOLO(model_path)
    return _global_model


def get_alarm():
    """Get or initialize the global AudioAlarm instance."""
    global _global_alarm
    if _global_alarm is None:
        _global_alarm = AudioAlarm(cooldown_seconds=ALARM_COOLDOWN_SECONDS)
    return _global_alarm


def post_detection(species: str, confidence: float, bbox: dict, human_present: bool = False):
    """Transmit detection telemetry vector to backend threat engine."""
    payload = {
        "species": species,
        "confidence": float(confidence),
        "bbox": bbox,
        "cameraId": CAMERA_ID,
        "zoneId": ZONE_ID,
        "distanceToBoundaryMeters": 10.5,
        "durationSeconds": 5,
        "direction": "APPROACHING",
        "humanPresent": human_present,
        "animalCount": 1
    }
    try:
        response = requests.post(BACKEND_API_URL, json=payload, timeout=0.8)
        if response.status_code == 200:
            print(f"[API Sync] Backend notified: {species} ({int(confidence * 100)}%)")
    except Exception:
        # Non-fatal if backend is not running
        pass


def draw_tactical_box(frame, x1: int, y1: int, x2: int, y2: int, color=(0, 0, 255), thickness: int = 3):
    """Draw a high-visibility bounding box with tactical corner accents."""
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
    corner_len = min(24, max(8, int((x2 - x1) * 0.22), int((y2 - y1) * 0.22)))
    corner_color = (255, 255, 255)
    cthick = thickness + 2

    # Corners
    cv2.line(frame, (x1, y1), (x1 + corner_len, y1), corner_color, cthick)
    cv2.line(frame, (x1, y1), (x1, y1 + corner_len), corner_color, cthick)
    cv2.line(frame, (x2, y1), (x2 - corner_len, y1), corner_color, cthick)
    cv2.line(frame, (x2, y1), (x2, y1 + corner_len), corner_color, cthick)
    cv2.line(frame, (x1, y2), (x1 + corner_len, y2), corner_color, cthick)
    cv2.line(frame, (x1, y2), (x1, y2 - corner_len), corner_color, cthick)
    cv2.line(frame, (x2, y2), (x2 - corner_len, y2), corner_color, cthick)
    cv2.line(frame, (x2, y2), (x2, y2 - corner_len), corner_color, cthick)


def process_cv_frame(frame, notify_backend: bool = True):
    """
    Run YOLO inference on an OpenCV BGR frame.
    Returns: (detections_list, leopard_detected, alarm_fired)
    """
    model = get_model()
    alarm = get_alarm()

    results = model(frame, conf=MIN_CONFIDENCE, verbose=False)
    detections = []
    leopard_alert = False
    alarm_fired = False

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            conf = float(box.conf[0])
            target_species = COCO_TO_WILDGUARD_MAP.get(label.lower(), label.lower())

            # Normalized bounding box coordinates [x1, y1, x2, y2]
            b = box.xyxyn[0].tolist()
            bbox = {
                "x": round(float(b[0]), 4),
                "y": round(float(b[1]), 4),
                "width": round(float(b[2] - b[0]), 4),
                "height": round(float(b[3] - b[1]), 4)
            }

            detections.append({
                "label": label,
                "species": target_species,
                "confidence": round(conf, 4),
                "bbox": bbox
            })

            # Check if alert condition is met: a genuine 'leopard' label (custom model)
            # with confidence > 0.50. The stock COCO yolov8n.pt will never produce this
            # label, so this block only fires with a properly trained custom model.
            is_leopard = (label.lower() in ALERT_CLASSES)
            if is_leopard and conf > ALERT_CONFIDENCE_THRESHOLD:
                leopard_alert = True
                # Trigger software audio alarm with 5s cooldown
                fired = alarm.trigger_alarm()
                if fired:
                    alarm_fired = True
                    print(f"🚨 [ALERT: LEOPARD DETECTED] Class: '{label}' | Conf: {conf:.2f} | 🔊 Acoustic Alarm Fired (audio_alarm.py)!")
                else:
                    rem = alarm.get_cooldown_remaining()
                    print(f"⚠️ [LEOPARD DETECTED] Conf: {conf:.2f} | Alarm in cooldown ({rem:.1f}s remaining)")

                if notify_backend:
                    post_detection(target_species, conf, bbox, human_present=False)

    return detections, leopard_alert, alarm_fired


class DetectionServerHandler(BaseHTTPRequestHandler):
    """HTTP request handler for receiving React webcam frames."""

    def _set_cors_headers(self, status: int = 200, content_type: str = "application/json"):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(200)

    def do_GET(self):
        if self.path in ("/", "/health", "/api/health"):
            alarm = get_alarm()
            payload = {
                "status": "OPERATIONAL",
                "service": "WildGuard AI YOLOv8 Inference Server",
                "model": MODEL_VARIANT,
                "cooldownSeconds": ALARM_COOLDOWN_SECONDS,
                "isCoolingDown": alarm.is_cooling_down(),
                "cooldownRemaining": round(alarm.get_cooldown_remaining(), 2)
            }
            body = json.dumps(payload).encode("utf-8")
            self._set_cors_headers(200)
            self.wfile.write(body)
        else:
            self._set_cors_headers(404)
            self.wfile.write(b'{"error": "Not found"}')

    def do_POST(self):
        if self.path in ("/detect", "/api/detect", "/api/ai/detect-frame"):
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self._set_cors_headers(400)
                self.wfile.write(b'{"error": "Empty request body"}')
                return

            try:
                body_bytes = self.rfile.read(content_length)
                data = json.loads(body_bytes.decode("utf-8"))
                image_str = data.get("image") or data.get("frame")

                if not image_str:
                    self._set_cors_headers(400)
                    self.wfile.write(b'{"error": "No image field provided"}')
                    return

                # Strip data URL header if present (e.g. data:image/jpeg;base64,...)
                if "," in image_str:
                    image_str = image_str.split(",", 1)[1]

                img_bytes = base64.b64decode(image_str)
                np_arr = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is None:
                    self._set_cors_headers(400)
                    self.wfile.write(b'{"error": "Failed to decode image"}')
                    return

                detections, leopard_alert, alarm_fired = process_cv_frame(frame, notify_backend=True)
                alarm = get_alarm()

                response_payload = {
                    "success": True,
                    "detections": detections,
                    "leopardAlert": leopard_alert,
                    "alarmTriggered": alarm_fired,
                    "isCoolingDown": alarm.is_cooling_down(),
                    "cooldownRemaining": round(alarm.get_cooldown_remaining(), 2)
                }

                resp_bytes = json.dumps(response_payload).encode("utf-8")
                self._set_cors_headers(200)
                self.wfile.write(resp_bytes)

            except Exception as e:
                print(f"[DetectionServer] Error processing frame: {e}")
                self._set_cors_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

        elif self.path in ("/alarm", "/api/alarm"):
            # Manually trigger alarm test
            alarm = get_alarm()
            fired = alarm.trigger_alarm(force=True)
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"success": True, "alarmTriggered": fired}).encode("utf-8"))

        else:
            self._set_cors_headers(404)
            self.wfile.write(b'{"error": "Not found"}')

    def log_message(self, format, *args):
        # Suppress routine GET/POST logging to keep output clean, print only errors or alerts
        if "404" in str(args) or "500" in str(args):
            super().log_message(format, *args)


def run_server(port: int = 8000, host: str = "0.0.0.0"):
    """Start the multi-threaded HTTP Detection Server."""
    # Preload model and alarm
    get_model()
    get_alarm()

    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, DetectionServerHandler)

    print("=======================================================")
    print(f"🐾 WildGuard AI – YOLOv8 Edge Detection Server ACTIVE")
    print(f"📡 Endpoint: http://localhost:{port}/detect")
    print(f"🔊 Software Acoustic Alarm: audio_alarm.py (Cooldown: {ALARM_COOLDOWN_SECONDS}s)")
    print(f"🎯 Mission: Leopard Detection (Panthera pardus, conf > 0.50)")
    print(f"⚡ Ready to receive webcam frames from React frontend & backend")
    print("=======================================================")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[WildGuard AI] Server shutting down...")
        httpd.server_close()


def run_inference(source=0):
    """
    Execute real-time YOLOv8 object detection with OpenCV preview window.
    Supports webcam index or file path (image / video).
    """
    model = get_model()
    alarm = get_alarm()

    is_image = isinstance(source, str) and source.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.bmp'))

    if is_image:
        print(f"[WildGuard AI] Reading test image: {source}")
        img = cv2.imread(source)
        if img is None:
            print(f"[ERROR] Could not load image file: {source}")
            return
        cap = None
    else:
        print(f"[WildGuard AI] Opening Video Stream / Camera ({source})...")
        try:
            cam_idx = int(source)
            cap = cv2.VideoCapture(cam_idx)
        except ValueError:
            cap = cv2.VideoCapture(source)

        if not cap.isOpened():
            print(f"[ERROR] Could not open video source '{source}'.")
            return

    print("[WildGuard AI] Active surveillance loop started. Press 'q' in preview to exit.")
    last_post_time = 0

    while True:
        if is_image:
            frame = img.copy()
        else:
            success, frame = cap.read()
            if not success:
                break

        h, w = frame.shape[:2]
        detections, leopard_detected, alarm_fired = process_cv_frame(frame, notify_backend=False)

        # Draw overlays
        for det in detections:
            b = det["bbox"]
            x1 = max(0, min(w - 1, int(b["x"] * w)))
            y1 = max(0, min(h - 1, int(b["y"] * h)))
            x2 = max(0, min(w - 1, int((b["x"] + b["width"]) * w)))
            y2 = max(0, min(h - 1, int((b["y"] + b["height"]) * h)))

            if det["species"] == "leopard" and det["confidence"] > ALERT_CONFIDENCE_THRESHOLD:
                draw_tactical_box(frame, x1, y1, x2, y2, color=(0, 0, 255), thickness=3)
                alert_tag = f"ALERT: LEOPARD DETECTED ({int(det['confidence'] * 100)}%)"
                (tw, th), _ = cv2.getTextSize(alert_tag, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
                tag_y = max(th + 10, y1)
                cv2.rectangle(frame, (x1, tag_y - th - 8), (x1 + tw + 10, tag_y + 4), (0, 0, 255), -1)
                cv2.putText(frame, alert_tag, (x1 + 5, tag_y - 2),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)
            else:
                color = (0, 255, 255) if det["species"] == "human" else (0, 200, 0)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{det['species']} {det['confidence']:.2f}", (x1, max(15, y1 - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2, cv2.LINE_AA)

        # Emergency HUD top bar
        if leopard_detected or alarm.is_cooling_down():
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, 0), (w, 58), (0, 0, 215), -1)
            cv2.addWeighted(overlay, 0.88, frame, 0.12, 0, frame)
            cv2.putText(frame, "ALERT: LEOPARD DETECTED", (18, 38),
                        cv2.FONT_HERSHEY_DUPLEX, 0.9, (255, 255, 255), 2, cv2.LINE_AA)

        cv2.imshow("WildGuard AI - Edge Inference Preview", frame)
        key = cv2.waitKey(1 if not is_image else 30) & 0xFF
        if key == ord('q'):
            break

    if cap is not None:
        cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WildGuard AI Edge Inference Pipeline & Detection Server")
    parser.add_argument("--mode", choices=["server", "preview"], default="server",
                        help="Run mode: 'server' (default, HTTP endpoint for React frontend) or 'preview' (OpenCV window)")
    parser.add_argument("--source", default=None,
                        help="Webcam index (0) or path to video/image file (forces preview mode)")
    parser.add_argument("--port", type=int, default=8000,
                        help="Port for HTTP Detection Server (default: 8000)")
    args = parser.parse_args()

    if args.source is not None or args.mode == "preview":
        run_inference(source=args.source if args.source is not None else 0)
    else:
        run_server(port=args.port)
