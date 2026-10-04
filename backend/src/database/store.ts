import { 
  User, Camera, Zone, IoTDevice, Incident, ThreatEngineConfig, 
  NotificationLog, SystemHealth, Detection, WildlifeSpecies 
} from '../types/index.js';
import { db as firestore } from './firebase.js';

class DataStore {
  // Existing local state for rapid simulation access
  public users: User[] = [];
  public incidents: Incident[] = [];
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
      name: 'North Perimeter Gate',
      locationDescription: 'Main entrance from forest side',
      zoneId: 'zone-1',
      status: 'ONLINE',
      sourceType: 'CCTV',
      protocol: 'RTSP',
      ipAddress: '192.168.1.101',
      port: 554,
      streamPath: '/live/ch1',
      priority: 'CRITICAL',
      resolution: '1920x1080',
      fps: 30,
      inferenceFps: 15,
      latencyMs: 45,
      uptimeSeconds: 3600,
      reconnectAttempts: 0,
      lastHeartbeat: new Date().toISOString(),
      detectionEnabled: true,
      minConfidence: 0.65,
      animalCategories: ['leopard'],
      minDetectionDurationSec: 2,
      zoneDetectionEnabled: true,
      lineCrossingEnabled: true,
      proximityDetectionEnabled: true,
      repeatedDetectionEnabled: true,
      alarmEnabled: true,
      notificationsEnabled: true,
      snapshotEnabled: true,
      recordingEnabled: true,
      alertCooldownSec: 60,
      audioEnabled: true,
      autoStart: true,
      sensitivity: 85,
      threatThreshold: 'HIGH',
      recordingMode: 'AI_DETECTION',
      notificationMode: 'ALL'
    },
    {
      id: 'cam-2',
      name: 'East Sugarcane Field',
      locationDescription: 'Overlooking the eastern corridor',
      zoneId: 'zone-2',
      status: 'ONLINE',
      sourceType: 'CCTV',
      protocol: 'RTSP',
      ipAddress: '192.168.1.102',
      port: 554,
      streamPath: '/live/ch1',
      priority: 'HIGH',
      resolution: '1920x1080',
      fps: 30,
      inferenceFps: 12,
      latencyMs: 60,
      uptimeSeconds: 3600,
      reconnectAttempts: 0,
      lastHeartbeat: new Date().toISOString(),
      detectionEnabled: true,
      minConfidence: 0.70,
      animalCategories: ['leopard'],
      minDetectionDurationSec: 3,
      zoneDetectionEnabled: true,
      lineCrossingEnabled: false,
      proximityDetectionEnabled: true,
      repeatedDetectionEnabled: true,
      alarmEnabled: true,
      notificationsEnabled: true,
      snapshotEnabled: true,
      recordingEnabled: true,
      alertCooldownSec: 120,
      audioEnabled: true,
      autoStart: true,
      sensitivity: 75,
      threatThreshold: 'HIGH',
      recordingMode: 'AI_DETECTION',
      notificationMode: 'ALL'
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
    minConfidenceThreshold: 0.50,
    consecutiveFramesRequired: 2,
    minDetectionDurationSec: 1,
    weights: {
      speciesDanger: 0.45,
      zoneProximity: 0.35,
      confidence: 0.10,
      duration: 0.10,
      movement: 0.05,
      humanCoexistence: 0.0,
      density: 0.05
    },
    speciesDangerMap: {
      leopard: 1.0
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
