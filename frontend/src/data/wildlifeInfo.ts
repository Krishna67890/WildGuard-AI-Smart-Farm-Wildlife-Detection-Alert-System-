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
  extendedText?: string;
}

export const wildlifeData: Record<WildlifeSpecies, WildlifeInfo> = {
  leopard: {
    species: 'leopard',
    commonName: 'Leopard',
    scientificName: 'Panthera pardus',
    description: 'The leopard (Panthera pardus) is a member of the genus Panthera and the smallest of the big cats. It is distinguished by its golden fur and dark spots arranged in rosettes.',
    threatLevel: 'CRITICAL',
    dangerScore: 95,
    habitat: 'Diverse habitats ranging from rainforests and savannas to deserts and mountainous regions across Africa and parts of Asia.',
    imageUrl: 'https://images.unsplash.com/photo-1615963244664-5b84436ba15e?auto=format&fit=crop&w=800&q=80',
    deterrentMethod: 'High-intensity strobe lights (White/Blue) & Modulated 2.4kHz acoustic frequencies.',
    behavior: 'Highly adaptable, solitary, and nocturnal. Known for its stealth and ability to climb trees even when carrying heavy prey.',
    extendedText: `The leopard (Panthera pardus) is one of the five extant cat species in the genus Panthera. It is characterized by its slender, muscular body, reaching a length of 92–183 cm (36–72 in) with a 66–102 cm (26–40 in) long tail.

WildGuard AI is specialized exclusively for this apex predator, recognizing its eight distinct subspecies:
1. African Leopard (P. p. pardus)
2. Indian Leopard (P. p. fusca)
3. Javan Leopard (P. p. melas)
4. Arabian Leopard (P. p. nimr)
5. Persian Leopard (P. p. tulliana)
6. Amur Leopard (P. p. orientalis)
7. Indochinese Leopard (P. p. delacouri)
8. Sri Lankan Leopard (P. p. kotiya)

Behavior and Ecology: Leopards are solitary and territorial. They are mainly active from dusk till dawn, resting during the day in thickets, rock crevices, or on tree branches. They are exceptional climbers and can run at speeds exceeding 58 km/h (36 mph).

Detection Philosophy: In this specialized system, every predatory signature is evaluated against the Panthera pardus morphological baseline to ensure maximum precision in human-leopard conflict mitigation.`
  },
  human: {
    species: 'human',
    commonName: 'Human (Co-occurrence Detection)',
    scientificName: 'Homo sapiens',
    description: 'Human presence detected within the monitoring zone. When detected alongside a leopard, threat levels are immediately escalated.',
    threatLevel: 'LOW',
    dangerScore: 10,
    habitat: 'Agricultural settlements and forest border zones.',
    imageUrl: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=800&q=80',
    deterrentMethod: 'No deterrent; triggers safety notifications to personnel.',
    behavior: 'Typically agricultural workers or forest residents.'
  }
};
