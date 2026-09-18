import { 
  User, Camera, Zone, IoTDevice, Incident, ThreatEngineConfig, 
  NotificationLog, SystemHealth, Detection, WildlifeSpecies 
} from '../types/index.js';
import { db as firestore } from './firebase.js';

class DataStore {
  // Existing local state for rapid simulation access
  public users: User[] = [];
  public incidents: Incident[] = [
    {
      id: 'INC-2026-0901',
      detectionId: 'DET-9821',
      species: 'leopard',
      confidence: 0.94,
      threatLevel: 'CRITICAL',
      threatScore: 0.92,
      threatReason: 'Apex predator detected inside North Forest Perimeter advancing towards homestead livestock zone.',
      cameraId: 'cam-1',
      cameraName: 'CAM-01 (North Fence PTZ)',
      zoneId: 'zone-1',
      zoneName: 'North Forest Perimeter',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
      durationSeconds: 26,
      snapshotUrl: 'https://images.unsplash.com/photo-1615963244664-5b84436ba15e?auto=format&fit=crop&w=800&q=80',
      alarmStatus: 'TRIGGERED',
      notificationStatus: 'SENT',
      status: 'RESOLVED'
    },
    {
      id: 'INC-2026-0902',
      detectionId: 'DET-9764',
      species: 'leopard',
      confidence: 0.89,
      threatLevel: 'HIGH',
      threatScore: 0.74,
      threatReason: 'Sub-adult leopard spotted near East Crop Cultivation Belt maize fields.',
      cameraId: 'cam-2',
      cameraName: 'CAM-02 (East Crop Edge)',
      zoneId: 'zone-2',
      zoneName: 'East Crop Cultivation Belt',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      durationSeconds: 42,
      snapshotUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=800&q=80',
      alarmStatus: 'MUTED',
      notificationStatus: 'SENT',
      status: 'ACKNOWLEDGED',
      acknowledgedBy: 'Ramesh Patel (Lead Farmer)',
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString()
    },
    {
      id: 'INC-2026-0898',
      detectionId: 'DET-9610',
      species: 'leopard',
      confidence: 0.96,
      threatLevel: 'CRITICAL',
      threatScore: 0.89,
      threatReason: 'Adult leopard detected near sugarcane fencing along irrigation canal.',
      cameraId: 'cam-2',
      cameraName: 'CAM-02 (East Crop Edge)',
      zoneId: 'zone-2',
      zoneName: 'East Crop Cultivation Belt',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
      durationSeconds: 68,
      snapshotUrl: 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=800&q=80',
      alarmStatus: 'STANDBY',
      notificationStatus: 'SENT',
      status: 'RESOLVED',
      acknowledgedBy: 'Ramesh Patel (Lead Farmer)',
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 13.8).toISOString(),
      resolvedBy: 'Krishna Kumar (Farmer)',
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString(),
      resolutionNotes: 'Acoustic buzzer deployed; forest range guards informed. Leopard moved back to sanctuary reserve safely without harm.'
    },
    {
      id: 'INC-2026-0895',
      detectionId: 'DET-9520',
      species: 'leopard',
      confidence: 0.91,
      threatLevel: 'LOW',
      threatScore: 0.28,
      threatReason: 'Leopard cub spotted in West Orchard Buffer outside crop perimeter; monitoring for mother.',
      cameraId: 'cam-4',
      cameraName: 'CAM-04 (West Buffer Trail)',
      zoneId: 'zone-3',
      zoneName: 'West Orchard Buffer',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      durationSeconds: 110,
      snapshotUrl: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=800&q=80',
      alarmStatus: 'STANDBY',
      notificationStatus: 'SENT',
      status: 'RESOLVED',
      resolvedBy: 'System Auto-Resolver',
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
      resolutionNotes: 'Predator presence logged; no immediate threat to livestock detected.'
    }
  ];
  public notificationLogs: NotificationLog[] = [];
  public latestDetections: Detection[] = [];

  constructor() {
    this.initSync();
  }

  private async initSync() {
    console.log('Firebase Store Initialized for Leopard-Centric Defense');
  }

  public async saveIncident(incident: Incident) {
    this.incidents.unshift(incident);
    try {
      await firestore.collection('incidents').doc(incident.id).set(incident);
    } catch (e) {
      console.error('Firestore save failed:', e);
    }
  }

  public zones: Zone[] = [
    {
      id: 'zone-1',
      name: 'North Forest Perimeter',
      type: 'CRITICAL',
      description: 'Adjacent to National Park boundary fence. High risk of leopard entry.',
      color: '#ef4444',
      polygon: [{ x: 10, y: 10 }, { x: 90, y: 10 }, { x: 85, y: 35 }, { x: 15, y: 35 }],
      dangerMultiplier: 1.0,
      protectedArea: true,
      obfuscatedGpsCenter: { lat: '12.42** N', lng: '75.73** E' }
    },
    {
      id: 'zone-2',
      name: 'East Crop Cultivation Belt',
      type: 'WARNING',
      description: 'Sugarcane and maize farming fields. Primary leopard stalking corridor.',
      color: '#f97316',
      polygon: [{ x: 60, y: 35 }, { x: 90, y: 35 }, { x: 90, y: 75 }, { x: 60, y: 75 }],
      dangerMultiplier: 0.75,
      protectedArea: true,
      obfuscatedGpsCenter: { lat: '12.41** N', lng: '75.74** E' }
    },
    {
      id: 'zone-3',
      name: 'West Orchard Buffer',
      type: 'MONITORING',
      description: 'Coffee plantation buffer zone. Secondary detection zone for leopards.',
      color: '#eab308',
      polygon: [{ x: 10, y: 35 }, { x: 40, y: 35 }, { x: 40, y: 75 }, { x: 10, y: 75 }],
      dangerMultiplier: 0.45,
      protectedArea: false,
      obfuscatedGpsCenter: { lat: '12.41** N', lng: '75.72** E' }
    },
    {
      id: 'zone-4',
      name: 'Central Homestead & Livestock Shed',
      type: 'CRITICAL',
      description: 'Residential quarters and cattle shed - Highest threat impact zone.',
      color: '#dc2626',
      polygon: [{ x: 38, y: 45 }, { x: 62, y: 45 }, { x: 62, y: 70 }, { x: 38, y: 70 }],
      dangerMultiplier: 1.0,
      protectedArea: true,
      obfuscatedGpsCenter: { lat: '12.41** N', lng: '75.73** E' }
    }
  ];

  public cameras: Camera[] = [
    {
      id: 'cam-1',
      name: 'North Gate CCTV',
      brand: 'WildGuard Hardware',
      model: 'CCTV-PRO-X1',
      locationDescription: 'North Boundary - Main Entry Point',
      zoneId: 'zone-1',
      status: 'ONLINE',
      sourceType: 'IP_NETWORK',
      protocol: 'RTSP',
      ipAddress: '192.168.1.101',
      port: 554,
      streamPath: '/streaming/channels/101',
      mainStreamUrl: 'rtsp://192.168.1.101:554/streaming/channels/101',
      priority: 'HIGH',
      resolution: '4K',
      fps: 25,
      inferenceFps: 10,
      latencyMs: 72,
      uptimeSeconds: 86400,
      reconnectAttempts: 0,
      lastHeartbeat: new Date().toISOString(),
      detectionEnabled: true,
      mapPosition: { x: 45, y: 15 },
      minConfidence: 0.65,
      animalCategories: ['leopard', 'human'],
      minDetectionDurationSec: 2,
      zoneDetectionEnabled: true,
      lineCrossingEnabled: true,
      proximityDetectionEnabled: true,
      repeatedDetectionEnabled: true,
      alarmEnabled: true,
      notificationsEnabled: true,
      snapshotEnabled: true,
      recordingEnabled: true,
      alertCooldownSec: 300,
      audioEnabled: false,
      autoStart: true,
      sensitivity: 80,
      threatThreshold: 'HIGH',
      recordingMode: 'AI_DETECTION',
      notificationMode: 'ALL'
    },
    {
      id: 'cam-2',
      name: 'Leopard Trail Cam 1',
      brand: 'Hikvision',
      model: 'DS-2CD2347G2-LU',
      locationDescription: 'North Boundary - Deep Forest Entry',
      zoneId: 'zone-1',
      status: 'ONLINE',
      sourceType: 'IP_NETWORK',
      protocol: 'RTSP',
      ipAddress: '192.168.1.105',
      port: 554,
      streamPath: '/streaming/channels/102',
      mainStreamUrl: 'rtsp://192.168.1.105:554/streaming/channels/102',
      priority: 'NORMAL',
      resolution: '2K',
      fps: 20,
      inferenceFps: 8,
      latencyMs: 85,
      uptimeSeconds: 43200,
      reconnectAttempts: 0,
      lastHeartbeat: new Date().toISOString(),
      detectionEnabled: true,
      mapPosition: { x: 30, y: 25 },
      minConfidence: 0.70,
      animalCategories: ['leopard', 'human'],
      minDetectionDurationSec: 2,
      zoneDetectionEnabled: true,
      lineCrossingEnabled: false,
      proximityDetectionEnabled: true,
      repeatedDetectionEnabled: true,
      alarmEnabled: true,
      notificationsEnabled: true,
      snapshotEnabled: true,
      recordingEnabled: true,
      alertCooldownSec: 300,
      audioEnabled: false,
      autoStart: true,
      sensitivity: 75,
      threatThreshold: 'MEDIUM',
      recordingMode: 'AI_DETECTION',
      notificationMode: 'ALL'
    },
    {
      id: 'cam-3',
      name: 'East Mast CCTV',
      brand: 'Dahua',
      model: 'IPC-HFW5442T-ASE',
      locationDescription: 'East Crop Cultivation Belt - Solar Mast',
      zoneId: 'zone-2',
      status: 'ONLINE',
      sourceType: 'IP_NETWORK',
      protocol: 'RTSP',
      ipAddress: '192.168.1.102',
      port: 554,
      streamPath: '/cam/realmonitor?channel=1&subtype=0',
      mainStreamUrl: 'rtsp://192.168.1.102:554/cam/realmonitor?channel=1&subtype=0',
      priority: 'NORMAL',
      resolution: '1080p',
      fps: 30,
      inferenceFps: 15,
      latencyMs: 45,
      uptimeSeconds: 129600,
      reconnectAttempts: 0,
      lastHeartbeat: new Date().toISOString(),
      detectionEnabled: true,
      mapPosition: { x: 30, y: 25 },
      minConfidence: 0.70,
      animalCategories: ['leopard', 'human'],
      minDetectionDurationSec: 3,
      zoneDetectionEnabled: true,
      lineCrossingEnabled: false,
      proximityDetectionEnabled: true,
      repeatedDetectionEnabled: false,
      alarmEnabled: true,
      notificationsEnabled: true,
      snapshotEnabled: true,
      recordingEnabled: true,
      alertCooldownSec: 600,
      audioEnabled: false,
      autoStart: true,
      sensitivity: 75,
      threatThreshold: 'MEDIUM',
      recordingMode: 'AI_DETECTION',
      notificationMode: 'ALL'
    },
    {
      id: 'cam-4',
      name: 'Livestock Shed Monitor',
      brand: 'Uniview',
      model: 'IPC2324EBR-DPF28',
      locationDescription: 'Central Homestead - Cattle Shed Interior',
      zoneId: 'zone-4',
      status: 'ONLINE',
      sourceType: 'IP_NETWORK',
      protocol: 'RTSP',
      ipAddress: '192.168.1.103',
      port: 554,
      streamPath: '/video1',
      mainStreamUrl: 'rtsp://192.168.1.103:554/video1',
      priority: 'HIGH',
      resolution: '1080p',
      fps: 24,
      inferenceFps: 12,
      latencyMs: 55,
      uptimeSeconds: 98000,
      reconnectAttempts: 0,
      lastHeartbeat: new Date().toISOString(),
      detectionEnabled: true,
      mapPosition: { x: 85, y: 60 },
      minConfidence: 0.60,
      animalCategories: ['leopard', 'human'],
      minDetectionDurationSec: 1,
      zoneDetectionEnabled: true,
      lineCrossingEnabled: true,
      proximityDetectionEnabled: true,
      repeatedDetectionEnabled: true,
      alarmEnabled: true,
      notificationsEnabled: true,
      snapshotEnabled: true,
      recordingEnabled: true,
      alertCooldownSec: 120,
      audioEnabled: true,
      autoStart: true,
      sensitivity: 85,
      threatThreshold: 'CRITICAL',
      recordingMode: 'CONTINUOUS',
      notificationMode: 'ALL'
    },
    {
      id: 'cam-hardware-1',
      name: 'Control Room Hardware',
      brand: 'Internal Hardware',
      model: 'Station Webcam Node',
      locationDescription: 'Main Farmhouse Monitoring Station',
      zoneId: 'zone-4',
      status: 'ONLINE',
      sourceType: 'INTERNAL_HARDWARE',
      protocol: 'WEBRTC',
      ipAddress: '127.0.0.1',
      port: 0,
      streamPath: 'default',
      priority: 'LOW',
      resolution: '1080p',
      fps: 30,
      inferenceFps: 10,
      latencyMs: 5,
      uptimeSeconds: 99999,
      reconnectAttempts: 0,
      lastHeartbeat: new Date().toISOString(),
      detectionEnabled: true,
      mapPosition: { x: 50, y: 50 },
      animalCategories: ['human', 'leopard'],
      minConfidence: 0.65,
      minDetectionDurationSec: 2,
      zoneDetectionEnabled: true,
      lineCrossingEnabled: false,
      proximityDetectionEnabled: true,
      repeatedDetectionEnabled: true,
      alarmEnabled: false,
      notificationsEnabled: true,
      snapshotEnabled: true,
      recordingEnabled: false,
      alertCooldownSec: 300,
      audioEnabled: true,
      autoStart: true,
      sensitivity: 80,
      threatThreshold: 'MEDIUM',
      recordingMode: 'AI_DETECTION',
      notificationMode: 'ALL',
      assignedDeviceId: ''
    }
  ];

  public iotDevices: IoTDevice[] = [
    {
      id: 'iot-esp32-1',
      name: 'ESP32 Node A (Perimeter Mast)',
      type: 'ESP32_NODE',
      status: 'ONLINE',
      ipAddress: '192.168.1.150',
      firmwareVersion: 'v2.4.1-WildGuard-PRO',
      batteryLevelPercent: 94,
      signalDbm: -58,
      pirTriggered: false,
      buzzerActive: false,
      strobeActive: false,
      lastSeen: new Date().toISOString()
    },
    {
      id: 'iot-esp32-2',
      name: 'ESP32 Node B (Homestead Gateway)',
      type: 'SIREN_STROBE',
      status: 'ONLINE',
      ipAddress: '192.168.1.151',
      firmwareVersion: 'v2.4.1-WildGuard-PRO',
      batteryLevelPercent: 100,
      signalDbm: -48,
      pirTriggered: false,
      buzzerActive: false,
      strobeActive: false,
      lastSeen: new Date().toISOString()
    }
  ];

  public config: ThreatEngineConfig = {
    minConfidenceThreshold: 0.65,
    consecutiveFramesRequired: 3,
    minDetectionDurationSec: 2,
    weights: {
      speciesDanger: 0.35,
      zoneProximity: 0.25,
      confidence: 0.10,
      duration: 0.10,
      movement: 0.05,
      humanCoexistence: 0.10,
      density: 0.05
    },
    speciesDangerMap: {
      leopard: 1.0,
      human: 0.10
    },
    zoneSeverityMap: {
      CRITICAL: 1.0,
      WARNING: 0.7,
      MONITORING: 0.4,
      SAFE: 0.1
    },
    autoAlarmOnCritical: true,
    smsAlertsEnabled: true,
    whatsappAlertsEnabled: true,
    emailAlertsEnabled: true
  };

  public temporalFrameBuffer: Map<string, { species: WildlifeSpecies; count: number; firstSeen: number }> = new Map();

  public startTime = Date.now();

  public getHealth(): SystemHealth {
    const activeAlarmsCount = this.incidents.filter(i => i.status === 'ACTIVE' && (i.threatLevel === 'CRITICAL' || i.threatLevel === 'HIGH')).length;
    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      aiModelStatus: 'OPTIMAL',
      activeCameras: this.cameras.filter(c => c.status === 'ONLINE').length,
      totalCameras: this.cameras.length,
      connectedIoTDevices: this.iotDevices.filter(d => d.status === 'ONLINE').length,
      activeAlarms: activeAlarmsCount,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      cpuLoadPercent: 12.4,
      averageInferenceLatencyMs: 38.5,
      falseAlarmRejectionRatePercent: 96.8
    };
  }
}

export const db = new DataStore();
