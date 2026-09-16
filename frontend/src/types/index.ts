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

export type AlarmStatus = 'STANDBY' | 'TRIGGERED' | 'ACKNOWLEDGED' | 'MUTED';

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
  bbox: BoundingBox;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  zoneId: string;
  zoneName: string;
  threatLevel: ThreatLevel;
  threatScore: number;
  threatReason: string;
  distanceToBoundaryMeters: number;
  durationSeconds: number;
  direction: 'APPROACHING' | 'RECEDING' | 'STATIONARY';
  humanPresent: boolean;
  animalCount: number;
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
  bbox?: BoundingBox;
  alarmStatus: AlarmStatus;
  notificationStatus: 'SENT' | 'FAILED' | 'PENDING';
  status: IncidentStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  description: string;
  color: string;
  polygon: Array<{ x: number; y: number }>;
  dangerMultiplier: number;
  protectedArea: boolean;
  obfuscatedGpsCenter?: { lat: string; lng: string };
}

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

export interface VirtualPerimeterLine {
  id: string;
  name: string;
  p1: { x: number; y: number }; // Normalized 0-100 coordinates
  p2: { x: number; y: number };
  color: string;
  alertDirection: 'INTRUSION' | 'EXIT' | 'BOTH';
}

export interface Camera {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  locationDescription: string;
  zoneId: string;
  sector?: string;
  status: CameraStatus;
  sourceType: CameraSourceType;
  protocol?: CameraProtocol;
  ipAddress: string;
  port?: number;
  streamPath?: string;
  mainStreamUrl?: string;
  username?: string;
  password?: string;
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
  mapPosition?: { x: number; y: number };

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

  audioEnabled?: boolean;
  autoStart?: boolean;
  sensitivity?: number;
  threatThreshold?: ThreatLevel;
  recordingMode?: RecordingMode;
  notificationMode?: 'ALL' | 'CRITICAL_ONLY' | 'MUTED';
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  farmName: string;
  location?: string;
  address?: string;
}

export interface ThreatEngineConfig {
  minConfidenceThreshold: number;
  consecutiveFramesRequired: number;
  minDetectionDurationSec: number;
  weights: {
    speciesDanger: number;
    zoneProximity: number;
    confidence: number;
    duration: number;
    movement: number;
    humanCoexistence: number;
    density: number;
  };
  speciesDangerMap: Record<WildlifeSpecies, number>;
  zoneSeverityMap: Record<ZoneType, number>;
  autoAlarmOnCritical: boolean;
  smsAlertsEnabled: boolean;
  whatsappAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
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
