# WildGuard AI: Smart Farm Leopard Detection & Alert System

WildGuard AI is a specialized, ethical edge AI surveillance system exclusively designed to detect and deter leopards (*Panthera pardus*) in agricultural zones. The system focuses solely on leopard detection to prevent human-wildlife conflict, enforcing a strict leopard-only deterrence policy using non-lethal acoustic sirens.

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

The system includes specific simulation scenarios to verify leopard-only detection logic:

1. **`leopard_critical`**: Simulates a leopard breach. Triggers full-screen alert and acoustic siren.
2. **`human_detection`**: Simulates a human at the boundary. The system logs the event but **does not** trigger the siren (Strict Leopard-Only Logic).
3. **`monitoring_mode`**: General surveillance verification.
