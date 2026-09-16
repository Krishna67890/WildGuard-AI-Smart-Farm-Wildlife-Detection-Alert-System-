import { db } from '../database/store.js';
import { Detection, Incident, AlarmStatus, IncidentStatus } from '../types/index.js';
import { iotBridge } from './iotBridgeService.js';
import { notificationService } from './notificationService.js';

type BroadcastCallback = (event: string, data: any) => void;

export class AlertOrchestrator {
  private broadcastListener?: BroadcastCallback;

  public setBroadcastListener(fn: BroadcastCallback) {
    this.broadcastListener = fn;
  }

  private notifyClients(event: string, data: any) {
    if (this.broadcastListener) {
      this.broadcastListener(event, data);
    }
  }

  /**
   * Generates a new confirmed incident from a high-threat detection
   */
  public createIncidentFromDetection(detection: Detection): Incident {
    // Generate human-readable incident identifier
    const incidentNum = (db.incidents.length + 900).toString().padStart(4, '0');
    const incidentId = `INC-2026-${incidentNum}`;

    const newIncident: Incident = {
      id: incidentId,
      detectionId: detection.id,
      species: detection.species,
      confidence: detection.confidence,
      threatLevel: detection.threatLevel,
      threatScore: detection.threatScore,
      threatReason: detection.threatReason,
      cameraId: detection.cameraId,
      cameraName: detection.cameraName,
      zoneId: detection.zoneId,
      zoneName: detection.zoneName,
      timestamp: detection.timestamp,
      durationSeconds: detection.durationSeconds,
      snapshotUrl: detection.frameImageUrl || `/snapshots/sample_${detection.species}.jpg`,
      bbox: detection.bbox,
      alarmStatus: (detection.threatLevel === 'CRITICAL' || detection.threatLevel === 'HIGH') ? 'TRIGGERED' : 'STANDBY',
      notificationStatus: 'PENDING',
      status: 'ACTIVE'
    };

    // Auto-trigger connected IoT alarm if configured
    if (db.config.autoAlarmOnCritical && (detection.threatLevel === 'CRITICAL' || detection.threatLevel === 'HIGH')) {
      iotBridge.triggerAlarm();
      newIncident.alarmStatus = 'TRIGGERED';
    }

    // Persist to store (and Firebase)
    if ('saveIncident' in db) {
      (db as any).saveIncident(newIncident);
    } else {
      db.incidents.unshift(newIncident);
    }

    // Asynchronously dispatch notifications
    notificationService.dispatchAlert(newIncident).then(() => {
      newIncident.notificationStatus = 'SENT';
      this.notifyClients('INCIDENT_UPDATED', newIncident);
    }).catch(err => {
      console.error('Notification dispatch error:', err);
      newIncident.notificationStatus = 'FAILED';
    });

    // Broadcast new incident to all connected dashboards
    this.notifyClients('NEW_INCIDENT', newIncident);
    this.notifyClients('ALARM_TRIGGERED', { incident: newIncident });

    return newIncident;
  }

  /**
   * Transition: ACTIVE -> ACKNOWLEDGED
   */
  public acknowledgeIncident(incidentId: string, userName: string = 'Ramesh Patel (Lead Farmer)'): Incident | null {
    const incident = db.incidents.find(i => i.id === incidentId);
    if (!incident) return null;

    incident.status = 'ACKNOWLEDGED';
    incident.acknowledgedBy = userName;
    incident.acknowledgedAt = new Date().toISOString();
    incident.alarmStatus = 'MUTED';

    // Silence active IoT siren on acknowledge
    iotBridge.silenceAlarm();

    this.notifyClients('INCIDENT_ACKNOWLEDGED', incident);
    return incident;
  }

  /**
   * Transition: ACKNOWLEDGED / ACTIVE -> RESOLVED
   */
  public resolveIncident(
    incidentId: string, 
    userName: string = 'Prof. S. R. Sharma (Admin)', 
    notes: string = 'Perimeter secured. Wildlife safely navigated away.'
  ): Incident | null {
    const incident = db.incidents.find(i => i.id === incidentId);
    if (!incident) return null;

    incident.status = 'RESOLVED';
    incident.resolvedBy = userName;
    incident.resolvedAt = new Date().toISOString();
    incident.resolutionNotes = notes;
    incident.alarmStatus = 'STANDBY';

    // Ensure all sirens are reset to standby
    iotBridge.silenceAlarm();

    this.notifyClients('INCIDENT_RESOLVED', incident);
    return incident;
  }
}

export const alertOrchestrator = new AlertOrchestrator();
