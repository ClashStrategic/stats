export type TargetValue = 'ground' | 'air' | 'buildings';
export type SpeedValue = 'slow' | 'medium' | 'fast' | 'very-fast';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'champion';
export type CardType = 'troop' | 'building' | 'spell' | 'tower';
export interface Levels {
    level11: number | null;
    level16: number | null;
}
export declare const EMPTY_LEVELS: Levels;
export interface HealSkill {
    perAttack: Levels;
    frequency: number | null;
    overHeal: Levels;
    onSpawn: Levels;
}
export interface StunSkill {
    hitSpeedMultiplier: number | null;
    speedMultiplier: number | null;
    spawnSpeedMultiplier: number | null;
    duration: number | null;
}
export interface SlowSkill {
    hitSpeedMultiplier: number | null;
    speedMultiplier: number | null;
    spawnSpeedMultiplier: number | null;
    duration: number | null;
}
export interface PushbackSkill {
    distance: number | null;
    strength: number | null;
}
export interface ShieldSkill {
    hitpoints: Levels | null;
    damageReductionPercent: number | null;
}
export interface DashSkill {
    damage: Levels;
    minRange: number | null;
    maxRange: number | null;
    targetType: string | null;
}
export interface ChargeSkill {
    damage: Levels;
    range: number | null;
    speedMultiplier: number | null;
}
export interface JumpSkill {
    height: number | null;
    speed: number | null;
}
export interface InvisibilitySkill {
    whenNotAttackingTime: number | null;
}
export interface SpawnOnDeathSkill {
    character: string | boolean | null;
    damage: Levels | null;
    radius: number | null;
    deployTime: number | null;
}
export interface PeriodicSpawnSkill {
    pauseTime: number | null;
    character: string | null;
    units: number | null;
}
export interface AreaDamageOnDeathSkill {
    areaEffect: string | boolean | null;
    damage: Levels | null;
    radius: number | null;
}
export interface AbilitySkill {
    name: string | null;
    elixirCost: number | null;
    cooldown: number | null;
    skills: Omit<SkillsMap, 'ability'>;
}
export interface PierceSkill {
    radius: number | null;
    range: number | null;
}
export interface BoostSkill {
    hitSpeedMultiplier: number | null;
    speedMultiplier: number | null;
    spawnSpeedMultiplier: number | null;
    duration: number | null;
    rangeMultiplier: number | null;
}
export interface BurrowSkill {
    duration: number | null;
}
export interface MultiplySkill {
    units: number | null;
    interval: number | null;
    maxUnits: number | null;
}
export interface ReflectSkill {
    damageReductionPercent: number | null;
    duration: number | null;
    radius: number | null;
}
export interface RampingDamageSkill {
    rampInterval: number | null;
    damageTiers: Levels[];
}
export interface TauntSkill {
    range: number | null;
    duration: number | null;
    triggerWindow: number | null;
}
export interface PullSkill {
    radius: number | null;
    strength: number | null;
    duration: number | null;
}
export interface SnipeSkill {
    range: number | null;
    ammo: number | null;
    rootDuration: number | null;
    damageMultiplier: number | null;
    hitSpeedMultiplier: number | null;
    aoeRadius: number | null;
}
export interface StackSkill {
    maxStacks: number | null;
    hpPerStack: number | null;
    damagePerStack: number | null;
    interval: number | null;
    duration: number | null;
}
export interface SkillTemplates {
    heal: HealSkill;
    stun: StunSkill;
    slow: SlowSkill;
    pushback: PushbackSkill;
    shield: ShieldSkill;
    dash: DashSkill;
    charge: ChargeSkill;
    jump: JumpSkill;
    invisibility: InvisibilitySkill;
    'spawn-on-death': SpawnOnDeathSkill;
    'periodic-spawn': PeriodicSpawnSkill;
    'area-damage-on-death': AreaDamageOnDeathSkill;
    ability: AbilitySkill;
    pierce: PierceSkill;
    boost: BoostSkill;
    burrow: BurrowSkill;
    multiply: MultiplySkill;
    reflect: ReflectSkill;
    'ramping-damage': RampingDamageSkill;
    taunt: TauntSkill;
    pull: PullSkill;
    snipe: SnipeSkill;
    stack: StackSkill;
}
export type SkillType = keyof SkillTemplates;
export type SkillsMap = Partial<SkillTemplates>;
export interface EvoStats {
    cycles: number | null;
    skills: SkillsMap;
    towerDamage: Levels;
    damage: Levels;
    hitpoints: Levels;
}
export interface HeroStats {
    skills: SkillsMap;
}
export interface Card {
    name: string | null;
    id: number | null;
    elixirCost: number | null;
    targets: TargetValue[];
    units: number;
    duration: number | null;
    deployTime: number | null;
    evolution: boolean;
    hero: boolean;
    hitType: string | null;
    projectile: boolean;
    projectileNumber: number | null;
    kamikaze: boolean;
    flying: boolean;
    skills: SkillsMap;
    towerDamage: Levels;
    damage: Levels;
    hitpoints: Levels;
    evoStats: EvoStats;
    heroStats: HeroStats;
    hitspeed: number | null;
    loadTime: number | null;
    radius: number | null;
    collisionRadius: number | null;
    speed: SpeedValue | null;
    range: number | null;
    sightRange: number | null;
    placement: 'anywhere' | 'own-side' | null;
    unlockArena: string | null;
    tribe: string | null;
    rarity: Rarity | '' | null;
    type: CardType | null;
}
export type TowerCard = Omit<Card, 'elixirCost' | 'deployTime' | 'duration' | 'kamikaze' | 'evolution' | 'hero' | 'flying' | 'towerDamage' | 'evoStats' | 'heroStats' | 'loadTime' | 'radius' | 'placement'>;
export interface CardsJson {
    cards: Card[];
    towerCards: TowerCard[];
}
