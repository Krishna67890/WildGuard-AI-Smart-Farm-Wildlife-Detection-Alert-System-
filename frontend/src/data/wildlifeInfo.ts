import { WildlifeSpecies, ThreatLevel } from '../types';

export interface WildlifeInfo {
  species: WildlifeSpecies;
  commonName: string;
  scientificName: string;
  description: string;
  threatLevel: ThreatLevel;
  dangerScore: number;
  habitat: string;
  imageUrl: string;
  deterrentMethod: string;
  behavior: string;
}

export const wildlifeData: Record<WildlifeSpecies, WildlifeInfo> = {
  leopard: {
    species: 'leopard',
    commonName: 'Indian Leopard',
    scientificName: 'Panthera pardus fusca',
    description: 'A versatile, opportunistic hunter. Highly adaptable to human-dominated landscapes.',
    threatLevel: 'CRITICAL',
    dangerScore: 92,
    habitat: 'Deciduous forests, scrublands, and agricultural borders.',
    imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=1000&auto=format&fit=crop',
    deterrentMethod: 'High-intensity strobe lights (White/Blue) & Ultrasonic predatory frequencies.',
    behavior: 'Solitary, nocturnal, and extremely stealthy. Known to prey on livestock.'
  },
  tiger: {
    species: 'tiger',
    commonName: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    description: 'The largest cat species in the world. An apex predator requiring vast territories.',
    threatLevel: 'CRITICAL',
    dangerScore: 98,
    habitat: 'Tropical rainforests, marshes, and tall grass.',
    imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99739d4?q=80&w=1000&auto=format&fit=crop',
    deterrentMethod: 'Remote siren activation (120dB) & Human-voice mimicry broadcasting.',
    behavior: 'Territorial and powerful. Avoids direct human contact unless threatened or old.'
  },
  elephant: {
    species: 'elephant',
    commonName: 'Asian Elephant',
    scientificName: 'Elephas maximus',
    description: 'Highly intelligent and social megaherbivore. Major cause of crop raiding.',
    threatLevel: 'HIGH',
    dangerScore: 85,
    habitat: 'Forests and grasslands near water sources.',
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1000&auto=format&fit=crop',
    deterrentMethod: 'Low-frequency seismic vibrations & Beehive sound simulation.',
    behavior: 'Travels in herds. Extremely destructive to infrastructure and crops.'
  },
  wild_boar: {
    species: 'wild_boar',
    commonName: 'Wild Boar',
    scientificName: 'Sus scrofa',
    description: 'Extremely resilient and aggressive when cornered. Rapid breeders.',
    threatLevel: 'MEDIUM',
    dangerScore: 65,
    habitat: 'Diverse, from dense forests to open farmland.',
    imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=1000&auto=format&fit=crop',
    deterrentMethod: 'Flash-bang simulations & Ultrasonic bursts.',
    behavior: 'Forages in groups (sounders). Can charge humans if they feel threatened.'
  },
  deer: {
    species: 'deer',
    commonName: 'Spotted Deer (Chital)',
    scientificName: 'Axis axis',
    description: 'Graceful herbivore, often seen in large herds.',
    threatLevel: 'LOW',
    dangerScore: 15,
    habitat: 'Open grasslands and thin forests.',
    imageUrl: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?q=80&w=1000&auto=format&fit=crop',
    deterrentMethod: 'Soft light pulses & Low-volume scent-based deterrents.',
    behavior: 'Flight-oriented. Causes crop damage through grazing.'
  },
  monkey: {
    species: 'monkey',
    commonName: 'Rhesus Macaque',
    scientificName: 'Macaca mulatta',
    description: 'Highly opportunistic and accustomed to human presence.',
    threatLevel: 'MEDIUM',
    dangerScore: 40,
    habitat: 'Forests, urban areas, and farmsteads.',
    imageUrl: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=1000&auto=format&fit=crop',
    deterrentMethod: 'Predator-eye visual patterns & High-pitch distress calls.',
    behavior: 'Agile and raiding-oriented. Can be aggressive in groups.'
  },
  human: {
    species: 'human',
    commonName: 'Intruder / Person',
    scientificName: 'Homo sapiens',
    description: 'Unauthorized human entry into protected agricultural zones.',
    threatLevel: 'HIGH',
    dangerScore: 70,
    habitat: 'Global.',
    imageUrl: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1000&auto=format&fit=crop',
    deterrentMethod: 'Public Address (PA) warning & Floodlight activation.',
    behavior: 'Varies; potential for theft, vandalism, or poaching.'
  },
  unknown: {
    species: 'unknown',
    commonName: 'Unidentified Biological Entity',
    scientificName: 'Unknown',
    description: 'Motion detected but species classification below confidence threshold.',
    threatLevel: 'LOW',
    dangerScore: 0,
    habitat: 'Unknown.',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop',
    deterrentMethod: 'Monitoring Only.',
    behavior: 'Unknown.'
  }
};
