import { db } from '../database/store.js';
import { 
  WildlifeSpecies, ThreatLevel, Zone, ThreatEngineConfig, 
  BoundingBox, Detection 
} from '../types/index.js';

export interface ThreatEvaluationInput {
  species: WildlifeSpecies;
  confidence: number;
  bbox: BoundingBox;
  cameraId: string;
  zoneId: string;
  distanceToBoundaryMeters: number;
  durationSeconds: number;
  direction: 'APPROACHING' | 'RECEDING' | 'STATIONARY';
  humanPresent: boolean;
  animalCount: number;
  isSimulatedTrigger?: boolean;
}

export interface ThreatEvaluationResult {
  threatLevel: ThreatLevel;
  threatScore: number; // 0.0 to 1.0
  reason: string;
  isConfirmed: boolean;
  temporalConfirmationFrames: number;
  shouldTriggerAlarm: boolean;
  shouldNotifyFarmer: boolean;
}

export class ThreatEngineService {
  /**
   * Evaluate a detection event using multi-factor formula and temporal verification
   */
  public evaluate(input: ThreatEvaluationInput): ThreatEvaluationResult {
    const config: ThreatEngineConfig = db.config;
    const zone = db.zones.find(z => z.id === input.zoneId) || db.zones[0];

    // 1. False Alarm Prevention: Minimum Confidence Filter
    if (input.confidence < config.minConfidenceThreshold && !input.isSimulatedTrigger) {
      return {
        threatLevel: 'LOW',
        threatScore: 0.1,
        reason: `Filtered out: Detection confidence (${Math.round(input.confidence * 100)}%) is below configured threshold (${Math.round(config.minConfidenceThreshold * 100)}%).`,
        isConfirmed: false,
        temporalConfirmationFrames: 1,
        shouldTriggerAlarm: false,
        shouldNotifyFarmer: false
      };
    }

    // 2. Temporal Multi-Frame Confirmation Tracking
    let temporalFrames = 1;
    const existingTracking = db.temporalFrameBuffer.get(input.cameraId);
    const now = Date.now();

    if (existingTracking && existingTracking.species === input.species && (now - existingTracking.firstSeen < 15000)) {
      temporalFrames = existingTracking.count + 1;
      db.temporalFrameBuffer.set(input.cameraId, {
        species: input.species,
        count: temporalFrames,
        firstSeen: existingTracking.firstSeen
      });
    } else {
      temporalFrames = 1;
      db.temporalFrameBuffer.set(input.cameraId, {
        species: input.species,
        count: 1,
        firstSeen: now
      });
    }

    // Check if temporal confirmation conditions are satisfied
    const isConfirmed = input.isSimulatedTrigger || (
      temporalFrames >= config.consecutiveFramesRequired || 
      input.durationSeconds >= config.minDetectionDurationSec
    );

    // 3. Multi-Factor Mathematical Formulation:
    // T = w_s*S + w_z*Z + w_c*C + w_d*D + w_m*M + w_h*H + w_n*N
    const speciesWeight = config.speciesDangerMap[input.species] ?? 0.3;
    const zoneSeverity = config.zoneSeverityMap[zone.type] ?? 0.5;
    const confidenceFactor = Math.min(1.0, Math.max(0.0, input.confidence));
    
    // Proximity factor: closer to 0 meters = higher risk (0 to 100m normalized)
    const proximityFactor = Math.max(0.0, 1.0 - (input.distanceToBoundaryMeters / 100));
    
    // Duration factor: sustained presence up to 30 seconds = 1.0
    const durationFactor = Math.min(1.0, input.durationSeconds / 30);
    
    // Direction factor
    const movementFactor = input.direction === 'APPROACHING' ? 1.0 : (input.direction === 'STATIONARY' ? 0.6 : 0.2);
    
    // Human coexistence risk factor (critical multiplier when predators + humans are present)
    const humanFactor = input.humanPresent ? (speciesWeight >= 0.7 ? 1.0 : 0.5) : 0.0;
    
    // Density factor (pack/herd behavior: e.g. multiple boars or elephants)
    const densityFactor = Math.min(1.0, input.animalCount / 5);

    const w = config.weights;
    let computedScore = 
      (w.speciesDanger * speciesWeight) +
      (w.zoneProximity * (0.6 * zoneSeverity + 0.4 * proximityFactor)) +
      (w.confidence * confidenceFactor) +
      (w.duration * durationFactor) +
      (w.movement * movementFactor) +
      (w.humanCoexistence * humanFactor) +
      (w.density * densityFactor);

    // If human is co-located with a top-tier apex predator (tiger, leopard, rogue elephant) within warning/critical zone, force elevate
    if (input.humanPresent && (input.species === 'tiger' || input.species === 'leopard') && (zone.type === 'CRITICAL' || zone.type === 'WARNING')) {
      computedScore = Math.max(computedScore, 0.94);
    }

    computedScore = Math.min(1.0, Math.max(0.05, Math.round(computedScore * 100) / 100));

    // 4. Determine Threat Level Classification
    let threatLevel: ThreatLevel = 'LOW';
    if (computedScore >= 0.85) {
      threatLevel = 'CRITICAL';
    } else if (computedScore >= 0.65) {
      threatLevel = 'HIGH';
    } else if (computedScore >= 0.35) {
      threatLevel = 'MEDIUM';
    } else {
      threatLevel = 'LOW';
    }

    // 5. Generate Evidence-Based Explanation Reason
    const speciesLabel = input.species.toUpperCase().replace('_', ' ');
    const distanceStr = `${Math.round(input.distanceToBoundaryMeters)}m`;
    let reason = '';

    if (threatLevel === 'CRITICAL') {
      if (input.humanPresent) {
        reason = `CRITICAL ALERT: ${speciesLabel} confirmed in close proximity (${distanceStr}) to human activity in ${zone.name}. Immediate safety advisory active.`;
      } else {
        reason = `CRITICAL ALERT: High-danger predator (${speciesLabel}) confirmed within ${zone.name} (${distanceStr} from core perimeter) with ${Math.round(input.confidence * 100)}% confidence over ${input.durationSeconds}s.`;
      }
    } else if (threatLevel === 'HIGH') {
      reason = `HIGH RISK: Dangerous wildlife (${speciesLabel}) breached ${zone.name} (${distanceStr} proximity), moving ${input.direction.toLowerCase()} towards cultivation area.`;
    } else if (threatLevel === 'MEDIUM') {
      reason = `MEDIUM ADVISORY: ${speciesLabel} detected near ${zone.name} (${distanceStr} distance). Continuous surveillance active; non-intrusive monitoring recommended.`;
    } else {
      reason = `LOW RISK: ${speciesLabel} detected outside sensitive zones (${distanceStr} distance). Herbivore/non-threatening behavior observed.`;
    }

    const shouldTriggerAlarm = isConfirmed && (threatLevel === 'CRITICAL' || (threatLevel === 'HIGH' && zone.protectedArea));
    const shouldNotifyFarmer = isConfirmed && (threatLevel !== 'LOW');

    return {
      threatLevel,
      threatScore: computedScore,
      reason,
      isConfirmed,
      temporalConfirmationFrames: temporalFrames,
      shouldTriggerAlarm,
      shouldNotifyFarmer
    };
  }
}

export const threatEngine = new ThreatEngineService();
