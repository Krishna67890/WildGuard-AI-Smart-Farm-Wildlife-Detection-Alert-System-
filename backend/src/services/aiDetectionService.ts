import { db } from '../database/store.js';
import { Detection, WildlifeSpecies, ThreatLevel, BoundingBox } from '../types/index.js';
import { threatEngine, ThreatEvaluationInput } from './threatEngineService.js';
import { alertOrchestrator } from './alertOrchestrator.js';

export interface ExternalDetectionPayload {
  species: WildlifeSpecies;
  confidence: number;
  bbox?: BoundingBox;
  cameraId?: string;
  humanPresent?: boolean;
  animalCount?: number;
  distanceToBoundaryMeters?: number;
}

export class AIDetectionService {
  /**
   * Generates a fully calculated Detection object, runs threat evaluation,
   * and routes to alertOrchestrator if needed.
   */
  public processDetection(input: ThreatEvaluationInput & { frameImageUrl?: string }): { detection: Detection; incidentCreated: boolean } {
    const evalResult = threatEngine.evaluate(input);
    const camera = db.cameras.find(c => c.id === input.cameraId) || db.cameras[0];
    const zone = db.zones.find(z => z.id === input.zoneId) || db.zones[0];

    const detection: Detection = {
      id: `DET-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
      species: input.species,
      confidence: input.confidence,
      bbox: input.bbox,
      timestamp: new Date().toISOString(),
      cameraId: camera.id,
      cameraName: camera.name,
      zoneId: zone.id,
      zoneName: zone.name,
      threatLevel: evalResult.threatLevel,
      threatScore: evalResult.threatScore,
      threatReason: evalResult.reason,
      distanceToBoundaryMeters: input.distanceToBoundaryMeters,
      durationSeconds: input.durationSeconds,
      direction: input.direction,
      humanPresent: input.humanPresent,
      animalCount: input.animalCount,
      frameImageUrl: input.frameImageUrl || `/snapshots/sample_${input.species}.jpg`,
      isConfirmed: evalResult.isConfirmed
    };

    // Store in latest detections queue (max 50)
    db.latestDetections.unshift(detection);
    if (db.latestDetections.length > 50) {
      db.latestDetections.pop();
    }

    let incidentCreated = false;
    // If threat requires alarm or is confirmed high/critical, create incident
    if (evalResult.shouldTriggerAlarm || evalResult.threatLevel === 'CRITICAL' || evalResult.threatLevel === 'HIGH') {
      alertOrchestrator.createIncidentFromDetection(detection);
      incidentCreated = true;
    }

    return { detection, incidentCreated };
  }

  /**
   * Preset Examiner Demo Scenarios (Leopard-Centric)
   */
  public triggerSimulation(scenarioType: string): { detection: Detection; incidentCreated: boolean } {
    switch (scenarioType) {
      case 'leopard':
      case 'critical_threat': {
        return this.processDetection({
          species: 'leopard',
          confidence: 0.95,
          bbox: { x: 0.32, y: 0.28, width: 0.36, height: 0.44 },
          cameraId: 'cam-1',
          zoneId: 'zone-1',
          distanceToBoundaryMeters: 14,
          durationSeconds: 18,
          direction: 'APPROACHING',
          humanPresent: false,
          animalCount: 1,
          isSimulatedTrigger: true,
          frameImageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=800&q=80'
        });
      }

      case 'leopard_group': {
        return this.processDetection({
          species: 'leopard',
          confidence: 0.89,
          bbox: { x: 0.45, y: 0.42, width: 0.25, height: 0.30 },
          cameraId: 'cam-2',
          zoneId: 'zone-2',
          distanceToBoundaryMeters: 22,
          durationSeconds: 35,
          direction: 'APPROACHING',
          humanPresent: false,
          animalCount: 2,
          isSimulatedTrigger: true,
          frameImageUrl: 'https://images.unsplash.com/photo-1615963244664-5b84436ba15e?auto=format&fit=crop&w=800&q=80'
        });
      }

      case 'leopard_stationary': {
        return this.processDetection({
          species: 'leopard',
          confidence: 0.97,
          bbox: { x: 0.25, y: 0.20, width: 0.50, height: 0.60 },
          cameraId: 'cam-2',
          zoneId: 'zone-2',
          distanceToBoundaryMeters: 38,
          durationSeconds: 52,
          direction: 'STATIONARY',
          humanPresent: false,
          animalCount: 1,
          isSimulatedTrigger: true,
          frameImageUrl: 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=800&q=80'
        });
      }

      case 'human_risk': {
        return this.processDetection({
          species: 'human', // The primary intruder being simulated here is a human for risk assessment
          confidence: 0.93,
          bbox: { x: 0.20, y: 0.25, width: 0.35, height: 0.45 },
          cameraId: 'cam-3',
          zoneId: 'zone-4',
          distanceToBoundaryMeters: 8,
          durationSeconds: 24,
          direction: 'APPROACHING',
          humanPresent: true,
          animalCount: 1,
          isSimulatedTrigger: true,
          frameImageUrl: 'https://images.unsplash.com/photo-1508333706533-1ab43ecb16ad?auto=format&fit=crop&w=800&q=80'
        });
      }

      case 'leopard_cub':
      case 'low_threat': {
        return this.processDetection({
          species: 'leopard',
          confidence: 0.88,
          bbox: { x: 0.55, y: 0.35, width: 0.22, height: 0.38 },
          cameraId: 'cam-4',
          zoneId: 'zone-3',
          distanceToBoundaryMeters: 85,
          durationSeconds: 15,
          direction: 'RECEDING',
          humanPresent: false,
          animalCount: 1,
          isSimulatedTrigger: true,
          frameImageUrl: 'https://images.unsplash.com/photo-1507666405821-432ffb1670ae?auto=format&fit=crop&w=800&q=80'
        });
      }

      default: {
        return this.processDetection({
          species: 'human',
          confidence: 0.82,
          bbox: { x: 0.40, y: 0.30, width: 0.18, height: 0.25 },
          cameraId: 'cam-4',
          zoneId: 'zone-3',
          distanceToBoundaryMeters: 45,
          durationSeconds: 12,
          direction: 'STATIONARY',
          humanPresent: false,
          animalCount: 1,
          isSimulatedTrigger: true,
          frameImageUrl: '/snapshots/sample_human.jpg'
        });
      }
    }
  }
}

export const aiDetection = new AIDetectionService();
