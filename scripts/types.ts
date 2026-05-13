export type SpeedTid = 'TID_SPEED_0' | 'TID_SPEED_1' | 'TID_SPEED_2' | 'TID_SPEED_3' | 'TID_SPEED_4' | 'TID_SPEED_5';
export type TargetTid = 'TID_TARGETS_GROUND' | 'TID_TARGETS_AIR_AND_GROUND' | 'TID_TARGETS_BUILDINGS' | 'TID_TARGETS_NONE';

export interface LevelMultiplier {
    level11: number;
    level15: number;
    level16: number;
}

// API related types (only used in scripts)
export interface CharacterData {
    name?: string;
    hitpoints?: number;
    damage?: number;
    range?: number;
    hitSpeed?: number;
    tidSpeed?: string;
    tidTarget?: string;
    deathDamage?: number;
    damageSpecial?: number;
    crownTowerDamagePercent?: number;
    spawnPauseTime?: number;
    spawnNumber?: number;
    kamikaze?: boolean;
    areaDamageRadius?: number;
    collisionRadius?: number;
    sightRange?: number;
    deployTime?: number;
    loadTime?: number;
    abilityData?: unknown;
    projectileData?: ProjectileData;
    spawnCharacterData?: CharacterData;
    deathSpawnCharacterData?: CharacterData;
    deathAreaEffectData?: AreaEffectData;
    spawnPathfindMorphData?: { hitpoints?: number; lifeTime?: number; };
    [key: string]: unknown;
}

export interface ProjectileData {
    damage?: number;
    radius?: number;
    crownTowerDamagePercent?: number;
    pingpongVisualTime?: number;
    tidTarget?: string;
    spawnProjectileData?: ProjectileData;
    spawnCharacterData?: CharacterData;
    customFirstProjectileData?: { radius?: number; };
    [key: string]: unknown;
}

export interface BuffData {
    damagePerSecond?: number;
    crownTowerDamagePercent?: number;
    [key: string]: unknown;
}

export interface AreaEffectData {
    name?: string;
    damage?: number;
    radius?: number;
    lifeDuration?: number;
    crownTowerDamagePercent?: number;
    buffData?: BuffData;
    projectileData?: ProjectileData;
    spawnCharacterData?: CharacterData;
    onStartingActionData?: { spawnDataData?: CharacterData; };
    [key: string]: unknown;
}

export interface Spell {
    id: number;
    name: string;
    englishName?: string;
    notVisible?: boolean;
    tidType?: string;
    source?: string;
    rarity?: string;
    manaCost?: number;
    unlockArena?: string;
    tribe?: string;
    tidTarget?: string;
    heroData?: unknown;
    radius?: number;
    lifeTime?: number;
    crownTowerDamagePercent?: number;
    projectileWaves?: number;
    cycles?: number;
    summonNumber?: number;
    summonCharacterSecondCount?: number;
    summonCharacterThirdCount?: number;
    summonCharacterThirdData?: CharacterData;
    statCharacterData?: CharacterData;
    projectileData?: ProjectileData;
    areaEffectObjectData?: AreaEffectData;
    evolvedSpellsData?: Spell;
    summonCharacterData?: CharacterData;
    summonCharacterSecondData?: CharacterData;
    [key: string]: unknown;
}

export interface ApiData {
    items?: { spells?: Spell[]; };
}

export interface DataSources {
    area: AreaEffectData;
    proj: ProjectileData;
    buff: BuffData;
    spawnProj: ProjectileData;
    spawnChar: CharacterData;
    deathArea: AreaEffectData;
}
