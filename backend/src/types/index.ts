export type WildlifeSpecies = 
  | 'leopard'
  | 'tiger'
  | 'elephant'
  | 'wild_boar'
  | 'deer'
  | 'monkey'
  | 'human'
  | 'unknown';

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ZoneType = 'SAFE' | 'MONITORING' | 'WARNING' | 'CRITICAL';

export type IncidentStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type UserRole = 'ADMIN' | 'FARMER' | 'VIEWER';

export type CameraStatus = 
  | 'OFFLINE'
  | 'CONNECTING'
  | 'ONLINE'
  | 'STREAMING'
  | 'AI_ACTIVE'
  | 'STOPPING'
  | 'ERROR'
  | 'DEGRADED'
  | 'CRITICAL';

export type CameraSourceType = 
  | 'IP_NETWORK'
  | 'BROWSER_WEBCAM'
  | 'USB' 
  | 'RTSP' 
  | 'HTTP_HLS'
  | 'WEBRTC'
  | 'ESP32_CAM' 
  | 'SIMULATION';

export type CameraProtocol = 'RTSP' | 'HLS' | 'HTTP' | 'WEBRTC' | 'UDP' | 'TCP';

export type CameraPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type RecordingMode = 'CONTINUOUS' | 'MOTION' | 'AI_DETECTION' | 'EVENT_ONLY' | 'DISABLED';

export interface PerimeterZone {
  id: string;
  name: string;
  type: ZoneType;
  color: string;
  polygon: Array<{ x: number; y: number }>; // Normalized 0-100 coordinates
  dangerMultiplier: number;
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  description?: string;
  color: string;
  polygon: Array<{ x: number; y: number }>;
  dangerMultiplier: number;
  protectedArea?: boolean;
  obfuscatedGpsCenter?: { lat: string; lng: string };
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  id: string;
  species: WildlifeSpecies;
  confidence: number;
  bbox?: BoundingBox;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  zoneId: string;
  zoneName: string;
  threatLevel: ThreatLevel;
  threatScore: number;
  threatReason: string;
  distanceToBoundaryMeters?: number;
  durationSeconds?: number;
  direction?: 'APPROACHING' | 'RECEDING' | 'STATIONARY';
  humanPresent?: boolean;
  animalCount?: number;
  frameImageUrl?: string;
  isConfirmed: boolean;
}

export interface Incident {
  id: string;
  detectionId: string;
  species: WildlifeSpecies;
  confidence: number;
  threatLevel: ThreatLevel;
  threatScore: number;
  threatReason: string;
  cameraId: string;
  cameraName: string;
  zoneId: string;
  zoneName: string;
  timestamp: string;
  durationSeconds: number;
  snapshotUrl: string;
  alarmStatus: AlarmStatus;
  notificationStatus: 'PENDING' | 'SENT' | 'FAILED';
  status: IncidentStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type AlarmStatus = 'STANDBY' | 'TRIGGERED' | 'MUTED' | 'DISMISSED';

export interface DetectionRule {
  id: string;
  name: string;
  species: WildlifeSpecies | 'ALL';
  minConfidence: number;
  targetZone: string | 'ANY';
  minDurationSec: number;
  threatLevel: ThreatLevel;
  actions: string[];
  enabled: boolean;
}

export interface SnapshotRecord {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  species: WildlifeSpecies;
  confidence: number;
  threatLevel: ThreatLevel;
  zoneName: string;
  imageUrl: string;
  incidentId?: string;
  trackId?: string;
}

export interface Camera {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  locationDescription: string;
  zoneId: string;
  status: CameraStatus;
  sourceType: CameraSourceType;
  protocol?: CameraProtocol;
  ipAddress: string;
  port?: number;
  streamPath?: string;
  username?: string;
  password?: string; // Strictly for backend use, not sent to frontend usually
  mainStreamUrl?: string;
  subStreamUrl?: string;
  connectionTimeoutMs?: number;
  priority: CameraPriority;
  resolution: string;
  fps: number;
  bitrate?: number;
  inferenceFps: number;
  latencyMs: number;
  uptimeSeconds: number;
  reconnectAttempts: number;
  lastHeartbeat: string;
  assignedDeviceId?: string;
  mapPosition?: { x: number; y: number }; // Percentage 0-100 for property map

  // AI Detection Settings
  detectionEnabled: boolean;
  minConfidence: number;        // 0.0 to 1.0
  animalCategories: WildlifeSpecies[];

  // Threat Detection Rules
  minDetectionDurationSec: number;
  zoneDetectionEnabled: boolean;
  lineCrossingEnabled: boolean;
  proximityDetectionEnabled: boolean;
  repeatedDetectionEnabled: boolean;

  // Alerts & Notifications
  alarmEnabled: boolean;
  notificationsEnabled: boolean;
  snapshotEnabled: boolean;
  recordingEnabled: boolean;
  alertCooldownSec: number;

  audioEnabled: boolean;
  autoStart: boolean;
  sensitivity: number;          // 0 to 100
  threatThreshold: ThreatLevel;
  recordingMode: RecordingMode;
  notificationMode: 'ALL' | 'CRITICAL_ONLY' | 'MUTED';
  perimeterZones?: PerimeterZone[];
  perimeterLines?: VirtualPerimeterLine[];
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'ESP32_NODE' | 'PIR_SENSOR' | 'SIREN_STROBE';
  status: 'ONLINE' | 'OFFLINE' | 'TRIGGERED';
  ipAddress: string;
  firmwareVersion: string;
  batteryLevelPercent: number;
  signalDbm: number;
  pirTriggered: boolean;
  buzzerActive: boolean;
  strobeActive: boolean;
  lastSeen: string;
}

export interface ThreatEngineConfig {
  minConfidenceThreshold: number;          // Default: 0.65
  consecutiveFramesRequired: number;       // Temporal confirmation: default 3
  minDetectionDurationSec: number;         // Default: 2s
  weights: {
    speciesDanger: number;                 // default: 0.35
    zoneProximity: number;                 // default: 0.25
    confidence: number;                    // default: 0.10
    duration: number;                      // default: 0.10
    movement: number;                      // default: 0.05
    humanCoexistence: number;              // default: 0.10
    density: number;                       // default: 0.05
  };
  speciesDangerMap: Record<WildlifeSpecies, number>;
  zoneSeverityMap: Record<ZoneType, number>;
  autoAlarmOnCritical: boolean;
  smsAlertsEnabled: boolean;
  whatsappAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  farmName: string;
}

export interface NotificationLog {
  id: string;
  incidentId: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'WEBHOOK' | 'IOT_BUZZER';
  recipient: string;
  message: string;
  timestamp: string;
  status: 'DELIVERED' | 'DISPATCHED' | 'FAILED';
}

export interface SystemHealth {
  uptimeSeconds: number;
  aiModelStatus: 'OPTIMAL' | 'DEGRADED' | 'INITIALIZING';
  activeCameras: number;
  totalCameras: number;
  connectedIoTDevices: number;
  activeAlarms: number;
  memoryUsageMb: number;
  cpuLoadPercent: number;
  averageInferenceLatencyMs: number;
  falseAlarmRejectionRatePercent: number;
}
