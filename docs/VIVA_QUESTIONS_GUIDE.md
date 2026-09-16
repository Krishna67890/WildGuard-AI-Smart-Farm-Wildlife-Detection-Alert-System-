# WildGuard AI - Comprehensive Final-Year Project Viva Examination Guide
**Intelligent Wildlife Harm & Intrusion Detection System**

---

## Category 1: Ethical AI & Non-Harm Architecture

### Q1: Why is this project described as an "Ethical & Non-Harm" system?
**Answer:**
Conventional human-wildlife conflict deterrents rely on lethal or harmful methods—such as illegal electric fences, metal snares, and chemical poisons—which cause agonizing injuries or death to endangered species. WildGuard AI strictly rejects all harmful interventions. Its entire operational pipeline is purely defensive:
1. Early Optical Detection via Computer Vision
2. Multi-Factor Risk Assessment (before sounding alarms)
3. Immediate Human Notification & Farm Evacuation
4. Non-Harmful 2.4kHz Acoustic Deterrence & Solar LED Strobe (designed solely to disorient and encourage animals to retreat peacefully back into the forest corridor).

### Q2: What prevents the system from triggering harmful actions autonomously?
**Answer:**
The system adheres to a Human-in-the-Loop (HITL) emergency architecture. The software cannot activate lethal equipment. Furthermore, emergency sirens transition through a strict state machine (`ACTIVE` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `RESOLVED`), requiring verified operator intervention to ensure animal safety.

---

## Category 2: Machine Learning & Computer Vision

### Q3: What computer vision architecture is implemented?
**Answer:**
The system uses a modular object detection architecture compatible with YOLOv8/YOLO11 and OpenCV. For each frame, the inference engine outputs:
- Class label (Leopard, Tiger, Elephant, Wild Boar, Deer, Monkey, Human, Unknown)
- Confidence score ($C \in [0, 1]$)
- Normalized bounding box coordinates $[x, y, w, h]$
- Centroid motion vector (Approaching, Receding, Stationary)
- Timestamp and Camera sector ID.

### Q4: How do you prevent false alarms from leaves, wind, or camera noise?
**Answer:**
Through a **Temporal Multi-Frame Confirmation Filter**:
1. **Consecutive Persistence:** Detections must appear across $k \ge 3$ consecutive frames.
2. **Confidence Threshold:** A configurable cutoff (default: 65%) eliminates low-confidence transient noise.
3. **Minimum Dwell Time:** Animals must persist in the sector for at least $t_{\min} = 2$ seconds.
4. **Spatial Continuity:** The bounding box centroid must obey kinematic distance constraints between adjacent frames.

---

## Category 3: Threat Assessment Engine

### Q5: Explain the mathematical formula used for threat evaluation.
**Answer:**
The continuous threat score $T \in [0, 1]$ is computed as:
$$T = w_s \cdot S + w_z \cdot Z + w_c \cdot C + w_d \cdot D + w_m \cdot M + w_h \cdot H + w_n \cdot N$$
Where:
- $S$: Species Danger Tier (Tiger/Leopard = 1.0, Elephant = 0.85, Boar = 0.70, Deer = 0.25)
- $Z$: Zone Severity & Distance Proximity (Critical = 1.0, Warning = 0.75, Safe = 0.10)
- $C$: Detection Confidence ($0.0 - 1.0$)
- $D$: Dwell Duration (normalized up to 30 seconds)
- $M$: Direction Vector (Approaching = 1.0, Stationary = 0.6, Receding = 0.2)
- $H$: Human Co-occurrence Multiplier (trips to $\ge 0.94$ if human and apex predator are close)
- $N$: Animal Herd Density.

Score Classification:
- **LOW:** $T < 0.35$ (Silent Audit Log)
- **MEDIUM:** $0.35 \le T < 0.65$ (Advisory Monitoring)
- **HIGH:** $0.65 \le T < 0.85$ (Warning & Farmer Push Notification)
- **CRITICAL:** $T \ge 0.85$ (Acoustic Siren + Critical Emergency HUD)

---

## Category 4: IoT & Embedded Hardware

### Q6: What hardware components comprise the prototype node?
**Answer:**
- **ESP32 Microcontroller:** Tensilica 240MHz dual-core with Wi-Fi mesh.
- **HC-SR501 PIR Sensor:** 100-degree passive infrared motion detection for sleep wake-up.
- **2.4kHz Active Piezoelectric Buzzer:** Modulated ultrasonic tone for humane deterrence.
- **Solar LED Strobe:** High-intensity night deterrent driven by an N-channel MOSFET.
- **Power Management:** 3.7V 18650 Li-ion battery with 5V solar trickle charging.

### Q7: How does the ESP32 communicate with the backend?
**Answer:**
The ESP32 runs an embedded C++ Arduino sketch that periodically sends JSON telemetry (`deviceId`, `batteryLevelPercent`, `signalDbm`, `pirTriggered`, `buzzerActive`) via HTTP POST to `/api/iot/heartbeat`. In return, the server payload instructs the node whether to engage or silence the buzzer.

---

## Category 5: Security & Privacy

### Q8: How does the system handle sensitive geospatial farm data?
**Answer:**
To prevent poachers and unauthorized actors from locating endangered wildlife or private agricultural holdings, the system obfuscates GPS coordinates (e.g., blurring to `12.42** N, 75.73** E`) before sending to client viewers. Access is strictly controlled via Role-Based Access Control (Admin, Farmer, Viewer).
