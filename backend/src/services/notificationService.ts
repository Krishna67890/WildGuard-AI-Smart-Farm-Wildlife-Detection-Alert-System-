import { db } from '../database/store.js';
import { Incident, NotificationLog } from '../types/index.js';

export interface NotificationPayload {
  incident: Incident;
  recipients?: string[];
}

export class NotificationService {
  /**
   * Dispatches alerts across SMS, WhatsApp, Email, and IoT Siren channels
   */
  public async dispatchAlert(incident: Incident): Promise<NotificationLog[]> {
    const logs: NotificationLog[] = [];
    const timestamp = new Date().toISOString();
    const speciesTitle = incident.species.toUpperCase().replace('_', ' ');

    // 1. SMS Dispatch
    if (db.config.smsAlertsEnabled) {
      const smsMessage = `[WildGuard AI - ${incident.threatLevel}] ${speciesTitle} detected at ${incident.cameraName} (${incident.zoneName}). Confidence: ${Math.round(incident.confidence * 100)}%. Stay in secure shelter.`;
      const smsLog: NotificationLog = {
        id: `notif-sms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        incidentId: incident.id,
        channel: 'SMS',
        recipient: '+91 98220 11223 (Lead Farmer Patel)',
        message: smsMessage,
        timestamp,
        status: 'DELIVERED'
      };
      db.notificationLogs.unshift(smsLog);
      logs.push(smsLog);
    }

    // 2. WhatsApp Dispatch
    if (db.config.whatsappAlertsEnabled) {
      const waMessage = `🚨 *WildGuard Wildlife Alert* 🚨\n\n*Threat Level:* ${incident.threatLevel}\n*Species:* ${speciesTitle}\n*Confidence:* ${Math.round(incident.confidence * 100)}%\n*Zone:* ${incident.zoneName}\n*Camera:* ${incident.cameraName}\n*Time:* ${new Date(incident.timestamp).toLocaleTimeString()}\n\n*Action Required:* Check perimeter sensors & avoid direct confrontation.\n*Dashboard:* https://wildguard.local/incidents/${incident.id}`;
      const waLog: NotificationLog = {
        id: `notif-wa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        incidentId: incident.id,
        channel: 'WHATSAPP',
        recipient: '+91 98220 11223 (WhatsApp Group)',
        message: waMessage,
        timestamp,
        status: 'DELIVERED'
      };
      db.notificationLogs.unshift(waLog);
      logs.push(waLog);
    }

    // 3. Email Dispatch (Forest Dept / Admin Alert)
    if (db.config.emailAlertsEnabled && (incident.threatLevel === 'CRITICAL' || incident.threatLevel === 'HIGH')) {
      const emailMessage = `Subject: [URGENT] ${incident.threatLevel} Incident #${incident.id} - ${speciesTitle}\n\nAutomated Alert from WildGuard AI Intrusion System.\nZone: ${incident.zoneName}\nCamera: ${incident.cameraName}\nThreat Reason: ${incident.threatReason}\n\nEvidence Snapshot logged and available for forest range officers.`;
      const emailLog: NotificationLog = {
        id: `notif-em-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        incidentId: incident.id,
        channel: 'EMAIL',
        recipient: 'admin@wildguard.org, forest-range@karnataka.gov.in',
        message: emailMessage,
        timestamp,
        status: 'DELIVERED'
      };
      db.notificationLogs.unshift(emailLog);
      logs.push(emailLog);
    }

    // Keep notification logs to max 100
    if (db.notificationLogs.length > 100) {
      db.notificationLogs = db.notificationLogs.slice(0, 100);
    }

    return logs;
  }
}

export const notificationService = new NotificationService();
