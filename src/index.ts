export { 
    Card, CardsJson, Levels, CardStatsEvo, CardStatsHero, SkillType,
    TargetValue, SpeedValue, Rarity, CardType,
    HealSkill, StunSkill, SlowSkill, PushbackSkill, ShieldSkill,
    DashSkill, JumpSkill, InvisibilitySkill, SpawnOnDeathSkill,
    PeriodicSpawnSkill, AreaDamageOnDeathSkill, AbilitySkill,
    PierceSkill, BoostSkill, BurrowSkill, MultiplySkill
} from './types.js';
export { cardSchema } from './schema.js';

import cardsData from '../data/cards.json' with { type: 'json' };
import { CardsJson } from './types.js';

export const cards = cardsData as CardsJson;
export default cards;
