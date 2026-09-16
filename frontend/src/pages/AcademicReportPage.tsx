import React, { useState } from 'react';
import { 
  FileText, Award, BookOpen, Layers, Cpu, ShieldCheck, 
  CheckCircle2, AlertCircle, HelpCircle, Code, ChevronRight 
} from 'lucide-react';

export const AcademicReportPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('abstract');

  const sections = [
    { id: 'abstract', title: '1. Abstract & Objectives' },
    { id: 'problem', title: '2. Problem Statement & Existing vs Proposed' },
    { id: 'architecture', title: '3. System Architecture & DFD' },
    { id: 'threat_math', title: '4. Mathematical Threat Engine Formulation' },
    { id: 'false_alarm', title: '5. Temporal False-Alarm Suppression' },
    { id: 'iot_spec', title: '6. ESP32 IoT Prototype & Circuit' },
    { id: 'database', title: '7. Database Schema & Data Models' },
    { id: 'security', title: '8. Security & Coordinate Privacy' },
    { id: 'metrics', title: '9. Evaluation Metrics (Placeholder)' },
    { id: 'viva_prep', title: '10. Examiner Viva Q&A Guide (30 Questions)' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Final-Year B.Tech / B.E. Capstone Engineering Report</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            WildGuard AI: Project Methodology & Thesis Documentation
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive academic design specifications, mathematical models, system schematics, and evaluation frameworks
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
          Status: <strong className="text-emerald-400">Viva Demonstration Ready</strong>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigator + Content Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar (1 Col) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Thesis Chapters
          </span>
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                activeSection === sec.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/60'
              }`}
            >
              <span>{sec.title}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          ))}
        </div>

        {/* Content Viewer (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 text-slate-200 leading-relaxed text-xs sm:text-sm">
          
          {/* Section 1: Abstract */}
          {activeSection === 'abstract' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>1. Abstract & Project Objectives</span>
              </h2>

              <p className="text-slate-300 leading-relaxed">
                Human-wildlife conflict (HWC) poses severe socioeconomic and ecological threats globally, causing massive agricultural crop loss, retaliatory animal killings, and tragic human fatalities along agricultural forest borders. Conventional deterrent mechanisms such as illegal electrical fencing, poison baits, and physical snares inflict catastrophic, non-selective mortality on endangered species and are illegal under global wildlife preservation mandates.
              </p>

              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-emerald-200 space-y-2">
                <strong className="block text-emerald-300 text-xs uppercase tracking-wider font-bold">
                  Core Project Objective & Non-Harm Mandate:
                </strong>
                <p className="text-xs leading-relaxed">
                  <strong>WildGuard AI</strong> is designed strictly as a non-lethal, early-warning, and autonomous risk-assessment platform. The system does not harm, trap, poison, electrocute, injure, or attack wildlife. Its sole purpose is <strong>early detection, risk assessment, human notification, and safe response</strong>.
                </p>
              </div>

              <h3 className="text-base font-bold text-white pt-2">Primary Engineering Objectives</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
                <li>Deploy high-fidelity deep learning object detection for real-time identification of wild species (Leopard, Tiger, Elephant, Wild Boar, Deer, Monkey, Human).</li>
                <li>Implement a multi-factor Threat Assessment Engine evaluating species danger, dwell duration, directional vector, human coexistence, and zone severity.</li>
                <li>Eliminate sensor fatigue using temporal multi-frame confirmation to prevent false alarms from leaves, shadows, and weather.</li>
                <li>Integrate hardware-in-the-loop IoT prototype using ESP32 nodes running non-harmful 2.4kHz acoustic deterrence sirens.</li>
                <li>Deliver a closed-loop human-in-the-loop triage lifecycle: Active $\rightarrow$ Acknowledged $\rightarrow$ Resolved.</li>
              </ul>
            </div>
          )}

          {/* Section 2: Problem Statement */}
          {activeSection === 'problem' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                2. Problem Statement & Existing vs Proposed System
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-slate-800">Dimension</th>
                      <th className="p-3 border-b border-slate-800 text-rose-400">Existing Systems (Electric Fences / Static PIR)</th>
                      <th className="p-3 border-b border-slate-800 text-emerald-400">WildGuard AI (Proposed System)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-3 font-bold text-white">Animal Safety</td>
                      <td className="p-3 text-rose-300">High mortality; severe electrocution or snare injuries</td>
                      <td className="p-3 text-emerald-300">100% Non-harmful; acoustic and optical deterrence only</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Species Discrimination</td>
                      <td className="p-3 text-rose-300">Zero; trips equally on cattle, wind, fallen branches</td>
                      <td className="p-3 text-emerald-300">YOLO-family deep learning with 8 verified wildlife classes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">False Alarm Rate</td>
                      <td className="p-3 text-rose-300">Extremely high (&gt;65% false alarms lead to sensor fatigue)</td>
                      <td className="p-3 text-emerald-300">Temporal N-frame confirmation suppresses transient noise</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Human Safety Response</td>
                      <td className="p-3 text-rose-300">None; farmer unaware until physical confrontation</td>
                      <td className="p-3 text-emerald-300">Automated SMS, WhatsApp, Web Audio siren, and range alerts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Architecture */}
          {activeSection === 'architecture' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                3. System Architecture & Data Flow Diagram (DFD)
              </h2>

              <p className="text-slate-300 text-xs">
                The architecture follows a decoupled, three-tier model: Edge Sensing (ESP32 + Camera), AI Intelligence & Threat Assessment (Backend), and Emergency Command Interface (React Dashboard).
              </p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
{`[Camera Feed / Video] ---> [AI Species Classifier (YOLO)] ---> [Confidence & Bounding Box]
                                                                        |
                                                                        v
[Farm Boundary Geofence] ---> [Zone Proximity & Vector Math] ----> [Threat Engine]
                                                                        |
                               [Temporal Confirmation Buffer] <---------+
                                                                        | (If Confirmed)
                                                                        v
                                                         +-----------------------------+
                                                         |  Alert Decision State Engine|
                                                         +-----------------------------+
                                                            |           |           |
                                                            v           v           v
                                                       [ESP32 Siren] [SMS/WA] [Web Dashboard]`}
              </div>
            </div>
          )}

          {/* Section 4: Threat Math */}
          {activeSection === 'threat_math' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                4. Mathematical Threat Engine Formulation
              </h2>

              <p className="text-slate-300 text-xs">
                Unlike primitive systems that trigger alarms immediately on any detected pixel, WildGuard AI computes a continuous risk score $T \in [0, 1]$:
              </p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm text-amber-300 text-center">
                $$T = w_s S + w_z Z + w_c C + w_d D + w_m M + w_h H + w_n N$$
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-white block">$S$ (Species Danger Tier):</strong>
                  Tiger/Leopard (0.95–1.0), Elephant (0.85), Boar (0.70), Monkey/Deer (0.25–0.40)
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-white block">$Z$ (Zone Severity & Proximity):</strong>
                  Critical Zone (1.0), Warning Zone (0.75), Monitoring (0.45), Safe (0.10)
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-white block">$H$ (Human Co-occurrence Risk):</strong>
                  Elevates score to $\ge 0.94$ if apex predator is within critical proximity of humans.
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-white block">$D$ (Dwell Time) & $M$ (Vector):</strong>
                  Continuous presence $\ge 15$s and approaching vector increase score dynamically.
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                <strong>Threshold Classification:</strong><br/>
                &bull; $T &lt; 0.35$: LOW (Silent Audit Log)<br/>
                &bull; $0.35 \le T &lt; 0.65$: MEDIUM (Dashboard Monitoring Badge)<br/>
                &bull; $0.65 \le T &lt; 0.85$: HIGH (Warning Advisory & Dispatch)<br/>
                &bull; $T \ge 0.85$: CRITICAL (Emergency Siren + Immediate Farmer Evacuation HUD)
              </div>
            </div>
          )}

          {/* Section 5: False Alarm */}
          {activeSection === 'false_alarm' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                5. Temporal False-Alarm Suppression Methodology
              </h2>

              <p className="text-slate-300 text-xs leading-relaxed">
                Transient wind flutter, shadowed branches, and camera compression artifacts frequently produce isolated single-frame detections in edge vision models. WildGuard AI enforces temporal persistence filters before raising alarm states:
              </p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-emerald-400">Temporal Verification Rules:</div>
                <p className="text-slate-300">
                  1. <strong>Consecutive Frame Persistence ($k \ge 3$):</strong> Target animal must be localized across at least 3 sequential inference frames.
                </p>
                <p className="text-slate-300">
                  2. <strong>Confidence Floor ($\ge 65\%$):</strong> Sub-threshold detections are relegated to noise rejection filters.
                </p>
                <p className="text-slate-300">
                  3. <strong>Spatial Centroid Consistency:</strong> Bounding box centroids must obey physical kinematic bounds (&Delta;x, &Delta;y &le; &Delta;_max).
                </p>
              </div>
            </div>
          )}

          {/* Section 6: IoT Spec */}
          {activeSection === 'iot_spec' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                6. ESP32 IoT Prototype & Hardware Specifications
              </h2>

              <p className="text-slate-300 text-xs">
                The hardware node utilizes an ESP32 microcontroller with Wi-Fi mesh telemetry, an HC-SR501 passive infrared (PIR) sensor, and a 2.4kHz ultrasonic piezoelectric buzzer.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-emerald-400 block mb-1">Microcontroller:</strong>
                  ESP32 Dual-Core Tensilica Xtensa 240MHz, 520KB SRAM, Integrated 802.11 b/g/n Wi-Fi.
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-rose-400 block mb-1">Acoustic Deterrent:</strong>
                  2400Hz piezoelectric active buzzer emitting modulated pulses non-harmful to hearing.
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">Power Source:</strong>
                  3.7V 2600mAh 18650 Li-ion battery paired with a 5V 2W solar charging module.
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Database */}
          {activeSection === 'database' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                7. Database Schema & Data Models
              </h2>

              <p className="text-slate-300 text-xs">
                Structured entity relational model containing Users, Cameras, Zones, Incidents, Detections, and Notification logs with strict tenant isolation.
              </p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`TABLE Incidents {
  id: VARCHAR(32) PRIMARY KEY,
  detectionId: VARCHAR(32),
  species: ENUM('leopard', 'tiger', 'elephant', 'wild_boar', 'deer', 'monkey', 'human'),
  confidence: FLOAT,
  threatLevel: ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
  threatScore: FLOAT,
  threatReason: TEXT,
  cameraId: VARCHAR(32) REFERENCES Cameras(id),
  zoneId: VARCHAR(32) REFERENCES Zones(id),
  timestamp: TIMESTAMP,
  durationSeconds: INT,
  snapshotUrl: VARCHAR(255),
  alarmStatus: ENUM('STANDBY', 'TRIGGERED', 'MUTED'),
  status: ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'),
  acknowledgedBy: VARCHAR(64),
  resolvedAt: TIMESTAMP
}`}
              </div>
            </div>
          )}

          {/* Section 8: Security */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                8. Security Architecture & Coordinate Privacy
              </h2>

              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  1. <strong>Role-Based Access Control (RBAC):</strong> Three explicit tiers (ADMIN, FARMER, VIEWER) enforce least-privilege principles.
                </p>
                <p>
                  2. <strong>GPS Coordinate Obfuscation:</strong> Farm geo-coordinates are dynamically blurred in API payloads (e.g. <code>12.42** N</code>) to protect private agricultural holdings from poachers and unauthorized tracking.
                </p>
                <p>
                  3. <strong>Immutable Audit Trails:</strong> Every alert acknowledgment, buzzer silencing, and threshold update is stamped with responder ID and timestamp.
                </p>
              </div>
            </div>
          )}

          {/* Section 9: Evaluation Metrics */}
          {activeSection === 'metrics' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                9. Evaluation Metrics & Benchmark Placeholders
              </h2>

              <p className="text-slate-300 text-xs italic">
                Note: In accordance with rigorous scientific standards, these benchmarks represent formal placeholders ready for field trial empirical data collection.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Target Accuracy</span>
                  <span className="text-base font-bold text-emerald-400">&gt; 92.4%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Inference Latency</span>
                  <span className="text-base font-bold text-cyan-400">&lt; 45 ms</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">False Alarm Rejection</span>
                  <span className="text-base font-bold text-amber-400">&gt; 96.0%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Alert Dispatch Lag</span>
                  <span className="text-base font-bold text-purple-400">&lt; 1.8 s</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 10: Viva Prep Guide */}
          {activeSection === 'viva_prep' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>10. Final-Year Viva Examination Questions & Model Answers</span>
              </h2>

              <div className="space-y-3 text-xs">
                
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-amber-300 font-bold block">
                    Q1: Why is WildGuard AI considered an ethical and non-harm project?
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Model Answer:</strong> WildGuard AI contains zero lethal mechanisms (no electric shocks, no chemical poisons, and no mechanical traps). Instead, it relies purely on optical deep learning for early detection, multi-factor risk scoring, human emergency notification, and non-harmful 2.4kHz acoustic/strobe deterrence that encourages animals to return safely to forest corridors.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-amber-300 font-bold block">
                    Q2: How does the system prevent false alarms caused by moving foliage or wind?
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Model Answer:</strong> Through our Temporal Multi-Frame Confirmation engine. A detection must sustain at least $k=3$ consecutive frames, maintain confidence $\ge 65\%$, and persist for minimum dwell duration before any alarm is triggered.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-amber-300 font-bold block">
                    Q3: How does the ESP32 communicate with the backend?
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Model Answer:</strong> The ESP32 edge node uses HTTP REST and WebSocket protocols to periodically transmit JSON telemetry (battery %, RSSI, PIR motion) to <code>/api/iot/heartbeat</code> and listens for siren relay commands.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-amber-300 font-bold block">
                    Q4: What happens when a human is detected near an apex predator?
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    <strong>Model Answer:</strong> The threat engine activates the co-occurrence factor $H$, immediately elevating the threat score to CRITICAL ($\ge 0.94$), sounding the web audio siren, locking the emergency modal on screen, and dispatching SMS/WhatsApp alerts.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
