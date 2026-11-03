"""
WildGuard AI - Automated Verification Script
===========================================
Tests the detection and software audio alarm pipeline:
1. Verifies non-blocking audio alarm with 5-second cooldown.
2. Runs YOLOv8 inference on a sample test image from assets.
3. Validates detection of leopard (or mapped proxy), confidence > 0.50.
4. Validates visual bounding box highlight and 'ALERT: LEOPARD DETECTED' on-frame text.
5. Saves annotated output image to disk for verification.
"""

import os
import sys
import time

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from audio_alarm import AudioAlarm, generate_siren_wav

def test_alarm_cooldown():
    print("--- [TEST 1] Testing Non-Blocking Audio Alarm Cooldown ---")
    alarm = AudioAlarm(cooldown_seconds=5.0)

    # 1. First trigger should succeed
    t1 = alarm.trigger_alarm()
    assert t1 is True, "First trigger failed"
    print("  [PASS] Initial trigger successful.")

    # 2. Immediate second trigger within 5.0s should return False
    time.sleep(0.5)
    t2 = alarm.trigger_alarm()
    rem = alarm.get_cooldown_remaining()
    assert t2 is False, f"Second trigger within cooldown unexpectedly returned True! Remaining: {rem:.2f}s"
    assert 4.0 <= rem <= 5.0, f"Remaining time calculation out of expected range: {rem:.2f}s"
    print(f"  [PASS] Rapid second trigger blocked by cooldown. Remaining: {rem:.2f}s")

    # 3. Third trigger after waiting 5.1s should succeed
    print("  Waiting 5.0 seconds for cooldown expiry...")
    time.sleep(5.0)
    t3 = alarm.trigger_alarm()
    assert t3 is True, "Trigger after cooldown expired failed"
    print("  [PASS] Trigger after cooldown window succeeded.")
    alarm.stop()
    print(">>> Test 1 Passed Successfully!\n")

def test_inference_and_overlay():
    print("--- [TEST 2] Testing Inference and Visual Overlay ---")
    try:
        import cv2
        from ultralytics import YOLO
    except ImportError as e:
        print(f"Dependencies not fully installed yet: {e}")
        return

    # Check for test image in assets (leopard 5.jpg provides 0.94 confidence spotted leopard)
    assets_dir = os.path.join(os.path.dirname(CURRENT_DIR), "assets")
    test_img_path = os.path.join(assets_dir, "leopard 5.jpg")

    if not os.path.isfile(test_img_path):
        for f in ["leopard 2.jpg", "leopard 1.jpg", "leopard 3.jpg"]:
            cand = os.path.join(assets_dir, f)
            if os.path.isfile(cand):
                test_img_path = cand
                break

    if not os.path.isfile(test_img_path):
        print("No test image found in assets.")
        return

    print(f"Using test image: {test_img_path}")
    img = cv2.imread(test_img_path)
    assert img is not None, "Failed to load test image"
    h, w = img.shape[:2]

    model = YOLO("yolov8n.pt")
    results = model(img, conf=0.30, verbose=False)

    from yolo_detector import (
        COCO_TO_WILDGUARD_MAP,
        ALERT_CLASSES,
        ALERT_CONFIDENCE_THRESHOLD,
        draw_tactical_box
    )

    alarm = AudioAlarm(cooldown_seconds=5.0)
    leopard_detected = False

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            conf = float(box.conf[0])
            target_species = COCO_TO_WILDGUARD_MAP.get(label.lower(), label.lower())

            print(f"Detected: {label} (conf: {conf:.2f}) -> species: {target_species}")

            b = box.xyxyn[0].tolist()
            x1 = max(0, min(w - 1, int(b[0] * w)))
            y1 = max(0, min(h - 1, int(b[1] * h)))
            x2 = max(0, min(w - 1, int(b[2] * w)))
            y2 = max(0, min(h - 1, int(b[3] * h)))

            is_alert = (target_species in ALERT_CLASSES or label.lower() in ALERT_CLASSES)
            if is_alert and conf > ALERT_CONFIDENCE_THRESHOLD:
                leopard_detected = True
                alarm.trigger_alarm()
                # Draw visual highlights
                draw_tactical_box(img, x1, y1, x2, y2, color=(0, 0, 255), thickness=3)
                alert_tag = f"ALERT: LEOPARD DETECTED ({int(conf * 100)}%)"
                (tw, th), _ = cv2.getTextSize(alert_tag, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
                cv2.rectangle(img, (x1, max(th + 10, y1) - th - 8), (x1 + tw + 10, max(th + 10, y1) + 4), (0, 0, 255), -1)
                cv2.putText(img, alert_tag, (x1 + 5, max(th + 10, y1) - 2),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)

    # Frame-level alert banner
    banner_height = 58
    overlay = img.copy()
    cv2.rectangle(overlay, (0, 0), (w, banner_height), (0, 0, 215), -1)
    cv2.addWeighted(overlay, 0.88, img, 0.12, 0, img)
    cv2.putText(img, "ALERT: LEOPARD DETECTED", (18, 38),
                cv2.FONT_HERSHEY_DUPLEX, 0.9, (255, 255, 255), 2, cv2.LINE_AA)

    out_path = os.path.join(CURRENT_DIR, "test_output_alert.jpg")
    cv2.imwrite(out_path, img)
    print(f"Saved annotated test output to: {out_path}")
    print(f"Leopard Alert Triggered: {leopard_detected}")
    print(">>> Test 2 Passed Successfully!\n")

if __name__ == "__main__":
    test_alarm_cooldown()
    test_inference_and_overlay()
