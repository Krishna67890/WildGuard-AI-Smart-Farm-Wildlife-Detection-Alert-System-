import { db } from '../database/store.js';
import { IoTDevice } from '../types/index.js';

export interface IoTTelemetryPayload {
  deviceId: string;
  batteryLevelPercent?: number;
  signalDbm?: number;
  pirTriggered?: boolean;
  buzzerActive?: boolean;
  strobeActive?: boolean;
}

export class IoTBridgeService {
  /**
   * Handle incoming heartbeat/telemetry from an ESP32 device
   */
  public recordHeartbeat(payload: IoTTelemetryPayload): IoTDevice {
    let device = db.iotDevices.find(d => d.id === payload.deviceId);
    
    if (!device) {
      device = {
        id: payload.deviceId,
        name: `ESP32 Remote Node (${payload.deviceId})`,
        type: 'ESP32_NODE',
        status: 'ONLINE',
        ipAddress: '192.168.1.180',
        firmwareVersion: 'v2.4.1-WildGuard-PRO',
        batteryLevelPercent: payload.batteryLevelPercent ?? 90,
        signalDbm: payload.signalDbm ?? -60,
        pirTriggered: !!payload.pirTriggered,
        buzzerActive: !!payload.buzzerActive,
        strobeActive: !!payload.strobeActive,
        lastSeen: new Date().toISOString()
      };
      db.iotDevices.push(device);
    } else {
      device.status = 'ONLINE';
      device.lastSeen = new Date().toISOString();
      if (payload.batteryLevelPercent !== undefined) device.batteryLevelPercent = payload.batteryLevelPercent;
      if (payload.signalDbm !== undefined) device.signalDbm = payload.signalDbm;
      if (payload.pirTriggered !== undefined) device.pirTriggered = payload.pirTriggered;
      if (payload.buzzerActive !== undefined) device.buzzerActive = payload.buzzerActive;
      if (payload.strobeActive !== undefined) device.strobeActive = payload.strobeActive;
    }

    return device;
  }

  /**
   * Activate hardware alarm/siren on connected ESP32 prototype nodes
   */
  public triggerAlarm(targetDeviceId?: string): boolean {
    const devicesToTrigger = targetDeviceId 
      ? db.iotDevices.filter(d => d.id === targetDeviceId)
      : db.iotDevices;

    devicesToTrigger.forEach(dev => {
      dev.buzzerActive = true;
      dev.strobeActive = true;
      dev.status = 'TRIGGERED';
    });

    return true;
  }

  /**
   * Silence or acknowledge alarm on ESP32 prototype nodes
   */
  public silenceAlarm(targetDeviceId?: string): boolean {
    const devicesToSilence = targetDeviceId 
      ? db.iotDevices.filter(d => d.id === targetDeviceId)
      : db.iotDevices;

    devicesToSilence.forEach(dev => {
      dev.buzzerActive = false;
      dev.strobeActive = false;
      dev.status = 'ONLINE';
    });

    return true;
  }

  /**
   * Simulates a PIR sensor motion trigger from hardware
   */
  public simulatePIR(deviceId: string): IoTDevice | null {
    const device = db.iotDevices.find(d => d.id === deviceId);
    if (device) {
      device.pirTriggered = true;
      device.lastSeen = new Date().toISOString();
      setTimeout(() => {
        device.pirTriggered = false;
      }, 5000);
      return device;
    }
    return null;
  }
}

export const iotBridge = new IoTBridgeService();
