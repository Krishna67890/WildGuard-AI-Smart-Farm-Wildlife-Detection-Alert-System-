"""
WildGuard AI - External YOLOv8 & OpenCV Inference Pipeline
=========================================================
This module performs real-time object detection using YOLOv8,
processes webcam/RTSP feeds, and transmits confirmed leopard
telemetry to the WildGuard AI backend.
"""

import cv2
import time
import requests
import json
from ultralytics import YOLO

# --- Configuration ---
BACKEND_API_URL = "http://localhost:5000/api/ai/external-detection"
MIN_CONFIDENCE = 0.50  # Lowered slightly for demo robustness with photos
CAMERA_ID = "cam-1"
ZONE_ID = "zone-1"
MODEL_VARIANT = "yolov8n.pt"  # Nano version for real-time speed

# COCO to WildGuard Species Mapping
# Standard YOLO models detect 'cat' or 'dog'. We map these to 'leopard' for the demo.
COCO_TO_WILDGUARD_MAP = {
    "cat": "leopard",
    "dog": "leopard",
    "bird": "leopard", # Broadening for demo photo variety
    "person": "human"
}

def post_detection(species, confidence, bbox, human_present=False):
    """
    Transmit detection vector to WildGuard AI Threat Engine
    """
    payload = {
        "species": species,
        "confidence": float(confidence),
        "bbox": bbox,
        "cameraId": CAMERA_ID,
        "zoneId": ZONE_ID,
        "distanceToBoundaryMeters": 12.5,
        "durationSeconds": 5,
        "direction": "APPROACHING",
        "humanPresent": human_present,
        "animalCount": 1
    }
    
    try:
        response = requests.post(BACKEND_API_URL, json=payload, timeout=1.0)
        if response.status_code == 200:
            print(f"✅ Sent: {species} ({int(confidence*100)}%)")
        else:
            print(f"❌ Server error: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Connection failed: {e}")

def run_inference():
    print(f"🚀 Loading AI Model ({MODEL_VARIANT})...")
    model = YOLO(MODEL_VARIANT)
    
    print(f"📸 Opening Camera (Index 0)...")
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Error: Could not open webcam.")
        return

    print("🐾 WildGuard AI Detection Active. Show a leopard photo to the camera!")
    print("Press 'q' in the preview window to stop.")

    last_post_time = 0
    post_interval = 1.0  # Rate limit to 1 request per second

    while True:
        success, frame = cap.read()
        if not success:
            break

        # Run YOLOv8 inference
        results = model(frame, conf=MIN_CONFIDENCE, verbose=False)

        detected_this_frame = False

        for r in results:
            for box in r.boxes:
                # Get class name
                cls_id = int(box.cls[0])
                label = model.names[cls_id]
                conf = float(box.conf[0])

                # Map COCO classes to WildGuard species
                target_species = COCO_TO_WILDGUARD_MAP.get(label)

                if target_species:
                    # Normalized Bounding Box (0.0 to 1.0)
                    b = box.xyxyn[0].tolist() # [x1, y1, x2, y2]
                    bbox = {
                        "x": b[0],
                        "y": b[1],
                        "width": b[2] - b[0],
                        "height": b[3] - b[1]
                    }

                    # Draw on local preview
                    color = (0, 0, 255) if target_species == "leopard" else (0, 255, 255)
                    cv2.rectangle(frame, (int(b[0]*640), int(b[1]*480)), (int(b[2]*640), int(b[3]*480)), color, 2)
                    cv2.putText(frame, f"{target_species} {conf:.2f}", (int(b[0]*640), int(b[1]*480)-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                    # Post to backend if interval passed
                    now = time.time()
                    if now - last_post_time > post_interval:
                        post_detection(target_species, conf, bbox, human_present=(target_species == "human"))
                        last_post_time = now

                    detected_this_frame = True

        # Show local preview for debugging
        cv2.imshow("WildGuard AI - Edge Inference Preview", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_inference()
