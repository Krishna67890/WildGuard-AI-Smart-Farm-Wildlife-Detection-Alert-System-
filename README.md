# WildGuard AI: Smart Farm Leopard Detection & Alert System

WildGuard AI is a specialized, ethical edge AI surveillance system exclusively designed to detect and deter leopards (*Panthera pardus*) in agricultural zones. The system focuses solely on leopard detection to prevent human-wildlife conflict, enforcing a strict leopard-only deterrence policy using non-lethal acoustic sirens.

---

## 📹 Multi-Source Surveillance Capabilities

WildGuard AI supports three distinct types of surveillance inputs, optimized for different deployment environments:

1. **CCTV (Network/IP):** Connects to professional-grade security cameras via RTSP. This is the primary source for 24/7 high-fidelity monitoring.
2. **PC/Mobile (Hardware):** Leverages internal laptop cameras or connected mobile devices via WebRTC. Ideal for quick deployment or portable monitoring stations.
3. **Still Photo (Snapshot):** Monitors static locations via scheduled HTTP snapshots or local file paths. This source type is specifically designed for low-bandwidth scenarios or for simulating leopard detections using manual image paths.

---

## 🏗️ Core Architecture & Specialized Defense Logic

The system is fine-tuned for a single-species mission: mitigating leopard-related threats while ignoring non-predatory wildlife.

### 1. Leopard-Specific Threat Evaluation Engine (`threatEngineService.ts`)
The risk assessment is strictly optimized for leopard morphology:
$$\text{Threat Score } (T) = w_s \cdot S + w_z \cdot Z + w_c \cdot C + w_d \cdot D + w_m \cdot M + w_n \cdot N$$
Where:
- $S$: Species Danger Weight (Hardcoded for leopards).
- $Z$: Zone Severity (Critical, Warning, Buffer, Safe).
- $C$: Detection Confidence Factor.
- $D$: Duration of presence.
- $M$: Movement/Direction factor.
- $N$: Density Factor.

**Exclusive Leopard Alarm Protocol:**
Acoustic sirens and IoT deterrents are **only** activated when a leopard is verified with high confidence. The system ensures that no other animals or humans trigger the acoustic alarms, maintaining a peaceful environment while providing maximum security against the specific threat of leopards.

### 2. Alert Orchestrator & Hardware Synchronization (`alertOrchestrator.ts`)
- Automatically couples verified **leopard** threats to the ESP32 IoT buzzer/siren subsystem.
- Handles atomic phase transitions: `ACTIVE` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `RESOLVED`.
- Silence is immediate upon acknowledgment.

### 3. Panthera Pardus Digital Archive (`GalleryPage.tsx`)
- Updated with a comprehensive gallery of leopard subspecies using high-resolution local assets and specialized detection data.
- Purged of all non-leopard species to maintain system focus.
- Catalogs comprehensive taxonomy data across all major leopard subspecies:
  - African leopard (*P. p. pardus*)
  - Indian leopard (*P. p. fusca*)
  - Javan leopard (*P. p. melas*)
  - Arabian leopard (*P. p. nimr*)
  - Amur leopard (*P. p. orientalis*)
  - Indochinese leopard (*P. p. delacouri*)
  - Sri Lankan leopard (*P. p. kotiya*)
  - Persian leopard (*P. p. tulliana*)

---

## 💻 Tech Stack & Deployment

### Backend
- **Runtime:** Node.js (TypeScript) with Express
- **Surveillance Engine:** Specialized Computer Vision YOLOv8 pipeline for leopard identification.
- **Database:** Firebase persistent layer with in-memory state management.

### Frontend
- **Framework:** React 18, TypeScript, Tailwind CSS
- **Iconography:** Lucide React
- **Visualization:** Real-time morphological analysis bounding boxes focused on leopard detection.

---

## ⚡ Examiner Simulation Suite

WildGuard AI includes multiple verification pathways for viva/demonstration:

### 1. The Examiner Toolbar (Dashboard)
Use the **"Simulate Leopard"** buttons in the dashboard toolbar for an instant end-to-end test. This bypasses local camera hardware to verify:
- WebSocket event propagation (`NEW_INCIDENT`).
- Dashboard UI flashing and Critical Toast alerts.
- **Acoustic Audio Siren** activation (strictly for leopards).

### 2. Live Edge AI Inference (Webcam Test)
To demonstrate real-time computer vision detection using a leopard photo:
1.  **Start the Backend**: Ensure the Node.js server is running on port 5000.
2.  **Initialize AI Service**:
    ```bash
    cd ai_service
    pip install -r requirements.txt
    python yolo_detector.py
    ```
3.  **Perform Detection**: Show a leopard photo to your webcam.
    - The Python script uses a **morphological proxy map** (mapping 'cat/dog' detections to 'leopard') to allow standard YOLO models to function as leopards for the demo.
    - The Dashboard will display a **red bounding box** instantly via the `RAW_DETECTION` stream.
    - If the leopard is held for $>1$ second, a **confirmed incident** is created, and the siren is triggered.

---
