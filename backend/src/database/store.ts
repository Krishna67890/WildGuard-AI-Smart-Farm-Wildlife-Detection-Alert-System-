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

  public cameras: Camera[] = [];

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
