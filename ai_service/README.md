# WildGuard AI - External YOLOv8 Inference Module

This directory contains the Python microservice for integrating real-time YOLOv8 / YOLO11 and OpenCV deep learning inference with the **WildGuard AI** central engine.

## Quick Start (Optional External Model Runner)
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the detector
python yolo_detector.py
```

The detections will be automatically ingested into the Node.js backend (`/api/ai/external-detection`), evaluated by the mathematical threat engine, and broadcast to the dashboard via WebSocket.
