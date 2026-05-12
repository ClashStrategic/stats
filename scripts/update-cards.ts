import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const API_URL = 'https://cache.statsroyale.com/gamedata-v5.json';
const CARDS_FILE = path.join(__dirname, '..', 'cards.json');

type TargetValue = 'ground' | 'air' | 'buildings';
type SpeedValue = 'slow' | 'medium' | 'fast' | 'very-fast';
type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'champion';
type CardType = 'troop' | 'building' | 'spell' | 'tower';
type SpeedTid = 'TID_SPEED_0' | 'TID_SPEED_1' | 'TID_SPEED_2' | 'TID_SPEED_3' | 'TID_SPEED_4' | 'TID_SPEED_5';
type TargetTid = 'TID_TARGETS_GROUND' | 'TID_TARGETS_AIR_AND_GROUND' | 'TID_TARGETS_BUILDINGS' | 'TID_TARGETS_NONE';

interface Levels {
    level11: number | null;
    level15: number | null;
    level16: number | null;
}

interface LevelMultiplier {
    level11: number;
    level15: number;
    level16: number;
}

const EMPTY_LEVELS: Levels = { level11: null, level15: null, level16: null };

const LEVEL_MULTIPLIERS: Record<'standard' | 'tower', LevelMultiplier> = {
    standard: { level11: 2.56, level15: 3.72, level16: 4.09 },
    tower: { level11: 2.18, level15: 3.16, level16: 3.46 }
};

const SPEED_MAP: Record<SpeedTid, SpeedValue> = {
    'TID_SPEED_0': 'slow', 'TID_SPEED_1': 'slow', 'TID_SPEED_2': 'slow',
    'TID_SPEED_3': 'medium', 'TID_SPEED_4': 'fast', 'TID_SPEED_5': 'very-fast'
};

const TARGETS_MAP: Record<TargetTid, TargetValue[]> = {
    'TID_TARGETS_GROUND': ['ground'],
    'TID_TARGETS_AIR_AND_GROUND': ['air', 'ground'],
    'TID_TARGETS_BUILDINGS': ['buildings'],
    'TID_TARGETS_NONE': []
};

interface HealSkill { perAttack: Levels; frequency: number | null; overHeal: Levels; onSpawn: Levels; }
interface StunSkill { hitSpeedMultiplier: number | null; speedMultiplier: number | null; spawnSpeedMultiplier: number | null; duration: number | null; }
interface SlowSkill { hitSpeedMultiplier: number | null; speedMultiplier: number | null; spawnSpeedMultiplier: number | null; duration: number | null; }
interface PushbackSkill { distance: number | null; strength: number | null; }
interface ShieldSkill { hitpoints: Levels | null; damageReductionPercent: number | null; }
interface DashSkill { damage: Levels; minRange: number | null; maxRange: number | null; }
interface JumpSkill { height: number | null; }
interface InvisibilitySkill { whenNotAttackingTime: number | null; }
interface SpawnOnDeathSkill { character: string | boolean | null; damage: Levels | null; radius: number | null; deployTime: number | null; }
interface PeriodicSpawnSkill { pauseTime: number | null; character: string | null; units: number | null; }
interface AreaDamageOnDeathSkill { areaEffect: string | boolean | null; damage: Levels | null; radius: number | null; }
interface AbilitySkill { name: string | null; elixirCost: number | null; cooldown: number | null; }
interface PierceSkill { radius: number | null; range: number | null; }
interface BoostSkill { hitSpeedMultiplier: number | null; speedMultiplier: number | null; spawnSpeedMultiplier: number | null; duration: number | null; }
interface BurrowSkill { duration: number | null; }
interface MultiplySkill { units: number | null; interval: number | null; maxUnits: number | null; }

interface SkillTemplates {
    heal: HealSkill;
    stun: StunSkill;
    slow: SlowSkill;
    pushback: PushbackSkill;
    shield: ShieldSkill;
    dash: DashSkill;
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
}

type SkillType = keyof SkillTemplates;
type SkillsMap = Partial<SkillTemplates>;

interface CardStatsEvo {
    cycles: number | null;
    skills: SkillsMap;
    damage: Levels;
    hitpoints: Levels;
}

interface CardStatsHero {
    prestigeCost: number | null;
    skills: SkillsMap;
}

interface Card {
    name: string | null;
    id: number | null;
    elixirCost: number | null;
    targets: TargetValue[];
    units: number;
    duration: number | null;
    deployTime: number | null;
    evolution: boolean;
    hero: boolean;
    typeAttack: string | null;
    projectile: boolean;
    suicide: boolean;
    skills: SkillsMap;
    fatalDamage: Levels;
    chargeDamage: Levels;
    towerDamage: Levels;
    damage: Levels;
    hitpoints: Levels;
    statsEvo: CardStatsEvo;
    statsHero: CardStatsHero;
    hitspeed: number | null;
    loadTime: number | null;
    radius: number | null;
    collisionRadius: number | null;
    generationSpeed: number | null;
    generationUnits: number | null;
    speed: SpeedValue | null;
    range: number | null;
    sightRange: number | null;
    territory: 'wide' | 'restricted' | null;
    unlockArena: string | null;
    tribe: string | null;
    rarity: Rarity | '' | null;
    type: CardType | null;
}

interface CardsJson {
    cards: Card[];
    towerCards: Card[];
}

interface CharacterData {
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

interface ProjectileData {
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

interface BuffData {
    damagePerSecond?: number;
    crownTowerDamagePercent?: number;
    [key: string]: unknown;
}

interface AreaEffectData {
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

interface Spell {
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
    summonCharacterData?: CharacterData;
    summonCharacterSecondData?: CharacterData;
    summonCharacterThirdData?: CharacterData;
    statCharacterData?: CharacterData;
    projectileData?: ProjectileData;
    areaEffectObjectData?: AreaEffectData;
    evolvedSpellsData?: Spell;
    [key: string]: unknown;
}

interface ApiData {
    items?: { spells?: Spell[]; };
}

interface DataSources {
    area: AreaEffectData;
    proj: ProjectileData;
    buff: BuffData;
    spawnProj: ProjectileData;
    spawnChar: CharacterData;
    deathArea: AreaEffectData;
}

const CARD_SKELETON: Card = {
    name: null, id: null, elixirCost: null, targets: [], units: 0,
    duration: null, deployTime: null, evolution: false, hero: false, typeAttack: null,
    projectile: false, suicide: false,
    skills: {},
    fatalDamage: { ...EMPTY_LEVELS }, chargeDamage: { ...EMPTY_LEVELS },
    towerDamage: { ...EMPTY_LEVELS }, damage: { ...EMPTY_LEVELS },
    hitpoints: { ...EMPTY_LEVELS },
    statsEvo: {
        cycles: null, skills: {},
        damage: { ...EMPTY_LEVELS }, hitpoints: { ...EMPTY_LEVELS }
    },
    statsHero: { prestigeCost: null, skills: {} },
    hitspeed: null, loadTime: null, radius: null, collisionRadius: null, generationSpeed: null, generationUnits: null,
    speed: null, range: null, sightRange: null, territory: null, unlockArena: null, tribe: null, rarity: null, type: null
};

const SKILL_TEMPLATES: SkillTemplates = {
    'heal': { perAttack: { ...EMPTY_LEVELS }, frequency: null, overHeal: { ...EMPTY_LEVELS }, onSpawn: { ...EMPTY_LEVELS } },
    'stun': { hitSpeedMultiplier: null, speedMultiplier: null, spawnSpeedMultiplier: null, duration: null },
    'slow': { hitSpeedMultiplier: null, speedMultiplier: null, spawnSpeedMultiplier: null, duration: null },
    'pushback': { distance: null, strength: null },
    'shield': { hitpoints: { ...EMPTY_LEVELS }, damageReductionPercent: null },
    'dash': { damage: { ...EMPTY_LEVELS }, minRange: null, maxRange: null },
    'jump': { height: null },
    'invisibility': { whenNotAttackingTime: null },
    'spawn-on-death': { character: null, damage: { ...EMPTY_LEVELS }, radius: null, deployTime: null },
    'periodic-spawn': { pauseTime: null, character: null, units: null },
    'area-damage-on-death': { areaEffect: null, damage: { ...EMPTY_LEVELS }, radius: null },
    'ability': { name: null, elixirCost: null, cooldown: null },
    'pierce': { radius: null, range: null },
    'boost': { hitSpeedMultiplier: null, speedMultiplier: null, spawnSpeedMultiplier: null, duration: null },
    'burrow': { duration: null },
    'multiply': { units: null, interval: null, maxUnits: null }
};

const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
const toSec = (ms: number | null | undefined): number | null => ms ? ms / 1000 : null;
const isStun = (v: unknown): boolean => v === -100;
const isSlow = (v: unknown): boolean => typeof v === 'number' && v < 0 && v > -100;
const isBoost = (v: unknown): boolean => typeof v === 'number' && v > 100;
const resolveTargets = (tid: string | undefined): TargetValue[] =>
    (tid && tid in TARGETS_MAP) ? TARGETS_MAP[tid as TargetTid] : [];

function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    const keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(k => isEqual(a[k], b[k]));
}

function fetchJSON<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = '';
            res.on('data', (chunk: Buffer) => { body += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(body) as T); }
                catch (e) { reject(new Error('Failed to parse response: ' + (e as Error).message)); }
            });
        }).on('error', reject);
    });
}

const scaleLevels = (base: number | null | undefined, mult: LevelMultiplier): Levels =>
    base
        ? { level11: Math.floor(base * mult.level11), level15: Math.floor(base * mult.level15), level16: Math.floor(base * mult.level16) }
        : { ...EMPTY_LEVELS };

const mergeLevels = (computed: Levels, existing: Levels | null | undefined): Levels => ({
    level11: computed.level11 ?? existing?.level11 ?? null,
    level15: computed.level15 ?? existing?.level15 ?? null,
    level16: computed.level16 ?? existing?.level16 ?? null
});

function resolveMainCharacter(spell: Spell): CharacterData {
    return spell.summonCharacterData || spell.statCharacterData
        || spell.areaEffectObjectData?.onStartingActionData?.spawnDataData || {};
}

function resolveDataSources(spell: Spell, charData: CharacterData): DataSources {
    const area: AreaEffectData = spell.areaEffectObjectData || {};
    const proj: ProjectileData = spell.projectileData || charData.projectileData || area.projectileData || {};
    const buff: BuffData = area.buffData || {};
    const spawnProj: ProjectileData = proj.spawnProjectileData || area.projectileData || {};
    const spawnChar: CharacterData = proj.spawnCharacterData || area.spawnCharacterData || {};
    const deathArea: AreaEffectData = charData.deathAreaEffectData || {};
    return { area, proj, buff, spawnProj, spawnChar, deathArea };
}

function findAbilityData(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') return null;
    const o = obj as Record<string, unknown>;
    if (o.abilityData) return o.abilityData;
    for (const key in o) {
        if (typeof o[key] === 'object' && key !== 'evolvedSpellsData') {
            const found = findAbilityData(o[key]);
            if (found) return found;
        }
    }
    return null;
}

type ExtractSources = Record<string, unknown> | unknown[];

function extractSkills(
    sources: ExtractSources,
    mult: LevelMultiplier | null = null,
    baseHP: number | null = null,
    isHeroAbility: boolean = false
): SkillsMap {
    const skills: SkillsMap = {};
    const visited = new Set<object>();

    const setSkill = (type: SkillType, data: Record<string, unknown>): void => {
        const map = skills as Record<string, Record<string, unknown>>;
        if (!map[type]) map[type] = cloneDeep(SKILL_TEMPLATES[type]) as unknown as Record<string, unknown>;
        Object.entries(data).forEach(([k, v]) => { if (v != null) map[type][k] = v; });
    };

    if (isHeroAbility && (Array.isArray(sources) ? sources[0] : sources)) {
        const s = (Array.isArray(sources) ? sources[0] : sources) as any;
        if (s && typeof s === 'object' && (s.name || s.manaCost)) {
            setSkill('ability', {
                name: s.name || null,
                elixirCost: s.manaCost ?? null
            });
        }
    }

    const scan = (raw: unknown, isSpawn: boolean = false, parentDuration: number | null = null, currentGroupMaxSize: number | null = null): void => {
        if (!raw || typeof raw !== 'object' || visited.has(raw as object)) return;
        visited.add(raw as object);
        const obj = raw as Record<string, any>;

        const hasMultipliers = isStun(obj.hitSpeedMultiplier) || isStun(obj.speedMultiplier) || isStun(obj.spawnSpeedMultiplier) ||
            isSlow(obj.hitSpeedMultiplier) || isSlow(obj.speedMultiplier) || isSlow(obj.spawnSpeedMultiplier) ||
            isBoost(obj.hitSpeedMultiplier) || isBoost(obj.speedMultiplier) || isBoost(obj.spawnSpeedMultiplier);

        if ((obj.source === 'character_abilities' || obj.source === 'character_buffs') && !hasMultipliers) return;

        const localDuration = (obj.lifeDuration > (obj.buffTime ?? 0)) ? obj.lifeDuration : (obj.buffTime ?? obj.buffOnDamageTime ?? obj.lifeDuration);
        const currentDuration = localDuration ?? parentDuration;
        const groupMaxSize = obj.groupMaxSize ?? currentGroupMaxSize;

        if (obj.healPerSecond > 0) {
            const scaledHeal = mult ? scaleLevels(obj.healPerSecond, mult) : { ...EMPTY_LEVELS };
            const baseOverHeal = (obj.allowedOverHealPerc > 0 && baseHP && mult)
                ? Math.floor(baseHP * (obj.allowedOverHealPerc / 100)) : null;

            const update: Partial<HealSkill> = {
                frequency: toSec(obj.hitFrequency),
                overHeal: baseOverHeal && mult ? scaleLevels(baseOverHeal, mult) : { ...EMPTY_LEVELS }
            };

            if (isSpawn) update.onSpawn = scaledHeal;
            else update.perAttack = scaledHeal;

            setSkill('heal', update as Record<string, unknown>);
        }

        if (isStun(obj.hitSpeedMultiplier) || isStun(obj.speedMultiplier) || isStun(obj.spawnSpeedMultiplier)) {
            setSkill('stun', {
                hitSpeedMultiplier: isStun(obj.hitSpeedMultiplier) ? -100 : null,
                speedMultiplier: isStun(obj.speedMultiplier) ? -100 : null,
                spawnSpeedMultiplier: isStun(obj.spawnSpeedMultiplier) ? -100 : null,
                duration: toSec(currentDuration)
            });
        }

        if (isSlow(obj.hitSpeedMultiplier) || isSlow(obj.speedMultiplier)) {
            setSkill('slow', {
                hitSpeedMultiplier: isSlow(obj.hitSpeedMultiplier) ? obj.hitSpeedMultiplier : null,
                speedMultiplier: isSlow(obj.speedMultiplier) ? obj.speedMultiplier : null,
                spawnSpeedMultiplier: isSlow(obj.spawnSpeedMultiplier) ? obj.spawnSpeedMultiplier : null,
                duration: toSec(currentDuration)
            });
        }

        if (isBoost(obj.hitSpeedMultiplier) || isBoost(obj.speedMultiplier) || isBoost(obj.spawnSpeedMultiplier)) {
            setSkill('boost', {
                hitSpeedMultiplier: isBoost(obj.hitSpeedMultiplier) ? obj.hitSpeedMultiplier : null,
                speedMultiplier: isBoost(obj.speedMultiplier) ? obj.speedMultiplier : null,
                spawnSpeedMultiplier: isBoost(obj.spawnSpeedMultiplier) ? obj.spawnSpeedMultiplier : null,
                duration: toSec(currentDuration)
            });
        }

        if (obj.spawnPathfindEffect || obj.spawnPathfindMorphData || obj.name === 'Miner' || obj.name === 'GoblinDrill') {
            setSkill('burrow', {
                duration: toSec(obj.lifeTime ?? obj.spawnPathfindMorphData?.lifeTime)
            });
        }

        if ((obj.name?.includes('Duplication') && obj.spawnNumber > 0) || obj.name === 'CloneAction') {
            setSkill('multiply', {
                units: obj.spawnNumber || 1,
                interval: toSec(obj.spawnInterval ?? obj.spawnPauseTime),
                maxUnits: groupMaxSize || null
            });
        }

        if (obj.pushback > 0 || obj.pushBackStrength > 0)
            setSkill('pushback', { distance: (obj.pushback / 1000), strength: obj.pushBackStrength / 1000 });

        if (obj.shieldHitpoints > 0 || obj.damageReduction > 0)
            setSkill('shield', {
                hitpoints: mult ? scaleLevels(obj.shieldHitpoints, mult) : { ...EMPTY_LEVELS },
                damageReductionPercent: obj.damageReduction
            });

        if (obj.dashDamage > 0 || obj.dashMinRange > 0)
            setSkill('dash', {
                damage: mult ? scaleLevels(obj.dashDamage, mult) : { ...EMPTY_LEVELS },
                minRange: toSec(obj.dashMinRange),
                maxRange: toSec(obj.dashMaxRange)
            });

        if (obj.jumpHeight > 0)
            setSkill('jump', {
                height: toSec(obj.jumpHeight),
                speed: toSec(obj.jumpSpeed)
            });

        if (obj.invisible || obj.stealth || obj.buffWhenNotAttackingData?.name.includes('Invisibility'))
            setSkill('invisibility', {
                whenNotAttackingTime: obj.buffWhenNotAttackingTime ? toSec(obj.buffWhenNotAttackingTime) : null
            });

        if (obj.deathSpawnCharacterData) {
            const spawn = obj.deathSpawnCharacterData as CharacterData;
            setSkill('spawn-on-death', {
                character: spawn.name || true,
                damage: mult ? scaleLevels(spawn.deathDamage, mult) : { ...EMPTY_LEVELS },
                radius: toSec(spawn.collisionRadius),
                deployTime: toSec(spawn.deployTime as number)
            });
        }

        if (obj.spawnPauseTime > 0)
            setSkill('periodic-spawn', {
                pauseTime: obj.spawnPauseTime / 1000,
                character: obj.spawnCharacterData?.name || null,
                units: obj.spawnNumber || null
            });

        if (obj.deathAreaEffectData) {
            const effect = obj.deathAreaEffectData as AreaEffectData;
            setSkill('area-damage-on-death', {
                areaEffect: effect.name || true,
                damage: mult ? scaleLevels(effect.damage || obj.deathDamage, mult) : { ...EMPTY_LEVELS },
                radius: toSec(effect.radius)
            });
        }

        if (obj.projectileRange > 2000 && obj.radius > 0 && (obj.tid === 'TID_SPELL_ATTRIBUTE_AREA_DAMAGE' || obj.tid === 'TID_SPELL_ATTRIBUTE_RANGED_DAMAGE')) {
            setSkill('pierce', {
                range: obj.projectileRange / 1000,
                radius: obj.radius ? obj.radius / 1000 : null
            });
        }

        for (const key in obj) {
            if (typeof obj[key] === 'object' && key !== 'abilityData') {
                const nextIsSpawn = isSpawn || key === 'spawnAreaObjectData' || key === 'onStartingActionData';
                scan(obj[key], nextIsSpawn, currentDuration, groupMaxSize);
            }
        }
    };

    (Array.isArray(sources) ? sources : Object.values(sources)).forEach(src => scan(src));
    return skills;
}

interface SummonedCharacter { data: CharacterData; count: number; }

function getSummonedCharacters(spell: Spell): SummonedCharacter[] {
    const chars: SummonedCharacter[] = [];
    if (spell.summonCharacterData) chars.push({ data: spell.summonCharacterData, count: spell.summonNumber || 1 });
    if (spell.summonCharacterSecondData) chars.push({ data: spell.summonCharacterSecondData, count: spell.summonCharacterSecondCount || 1 });
    if (spell.summonCharacterThirdData) chars.push({ data: spell.summonCharacterThirdData, count: spell.summonCharacterThirdCount || 1 });
    return chars;
}

interface StrongestResult {
    maxHP: number;
    strongest: CharacterData;
    highestDamage: number;
    hasProjectile: boolean;
    hitspeedOfStrongest: number;
}

function pickStrongestCharacter(characters: SummonedCharacter[]): StrongestResult {
    let maxHP = 0, highestDamage = 0, hitspeedOfStrongest = 0;
    let strongest: CharacterData = {};
    let hasProjectile = false;
    for (const { data } of characters) {
        const hp = data.hitpoints || 0;
        const dmg = data.damage || data.projectileData?.damage || 0;
        if (hp > maxHP) { maxHP = hp; strongest = data; }
        if (dmg > highestDamage) { highestDamage = dmg; hitspeedOfStrongest = data.hitSpeed || 0; }
        if (data.projectileData && Object.keys(data.projectileData).length > 0) hasProjectile = true;
    }
    return { maxHP, strongest, highestDamage, hasProjectile, hitspeedOfStrongest };
}

function collectAllTargets(spell: Spell, charData: CharacterData): TargetValue[] {
    const tids: (string | undefined)[] = [
        spell.tidTarget, spell.projectileData?.tidTarget,
        charData.tidTarget, charData.spawnCharacterData?.tidTarget
    ];
    const summonKeys = ['summonCharacterData', 'summonCharacterSecondData', 'summonCharacterThirdData'] as const;
    for (const key of summonKeys) {
        const summon = spell[key];
        if (summon) tids.push(summon.tidTarget, summon.spawnCharacterData?.tidTarget);
    }
    return [...new Set(tids.flatMap(resolveTargets))];
}

function populateCard(card: Card, spell: Spell, mult: LevelMultiplier): void {
    const charData = resolveMainCharacter(spell);
    const { area, proj, buff, spawnProj, spawnChar, deathArea } = resolveDataSources(spell, charData);

    card.elixirCost = spell.manaCost ?? card.elixirCost;
    card.rarity = (spell.rarity || card.rarity || '').toLowerCase() as Card['rarity'];
    card.hero = card.rarity !== 'champion' && !!spell.heroData;
    card.unlockArena = spell.unlockArena || card.unlockArena;
    card.tribe = spell.tribe || card.tribe;

    const targets = collectAllTargets(spell, charData);

    const summoned = getSummonedCharacters(spell);
    let baseHP: number | undefined;
    let baseDamage: number | undefined;

    if (summoned.length > 0) {
        const source: SummonedCharacter[] = (charData.deathSpawnCharacterData && charData.kamikaze)
            ? [{ data: charData.deathSpawnCharacterData, count: 1 }]
            : summoned;
        const { maxHP, strongest, highestDamage, hasProjectile, hitspeedOfStrongest } = pickStrongestCharacter(source);

        card.hitspeed = hitspeedOfStrongest ? (hitspeedOfStrongest + (proj.pingpongVisualTime ?? 0)) / 1000 : card.hitspeed;
        card.loadTime = strongest.loadTime ? strongest.loadTime / 1000 : card.loadTime;
        card.range = strongest.range ? strongest.range / 1000 : card.range;
        card.sightRange = strongest.sightRange ? strongest.sightRange / 1000 : card.sightRange;
        card.speed = (strongest.tidSpeed && strongest.tidSpeed in SPEED_MAP)
            ? SPEED_MAP[strongest.tidSpeed as SpeedTid] : card.speed;
        card.projectile = hasProjectile || card.projectile;
        card.collisionRadius = strongest.collisionRadius ? strongest.collisionRadius / 1000 : card.collisionRadius;
        card.deployTime = strongest.deployTime ? strongest.deployTime / 1000 : card.deployTime;
        baseHP = charData.spawnPathfindMorphData?.hitpoints || maxHP || charData.hitpoints || spawnChar.hitpoints;
        baseDamage = highestDamage || charData.damage || proj.damage || area.damage || buff.damagePerSecond || spawnProj.damage || spawnChar.damage || deathArea.damage;
    }

    if (baseDamage !== undefined) baseDamage = baseDamage * (spell.projectileWaves || 1);

    card.generationSpeed = charData.spawnPauseTime ? charData.spawnPauseTime / 1000 : card.generationSpeed;
    card.generationUnits = (charData.spawnNumber !== undefined && charData.spawnNumber > 1) ? charData.spawnNumber : card.generationUnits;

    const rawRadius = spell.radius ?? area.radius ?? charData.areaDamageRadius ?? proj.radius ?? proj.customFirstProjectileData?.radius;
    if (rawRadius != null && card.units === 0 && !['Lightning', 'Void', 'Vines'].includes(card.name ?? '')) {
        card.radius = rawRadius / 1000;
        card.typeAttack = 'splash';
    } else {
        card.typeAttack = card.typeAttack || 'unique';
    }

    card.projectile = Object.keys(proj).length > 0 || card.projectile;

    const rawDuration = spell.lifeTime ?? area.lifeDuration ?? deathArea.lifeDuration ?? charData.spawnPathfindMorphData?.lifeTime;
    if (rawDuration != null) card.duration = rawDuration / 1000;

    const towerPct = spell.crownTowerDamagePercent ?? charData.crownTowerDamagePercent ?? proj.crownTowerDamagePercent
        ?? area.crownTowerDamagePercent ?? buff.crownTowerDamagePercent ?? spawnProj.crownTowerDamagePercent ?? spawnChar.crownTowerDamagePercent;
    const baseTowerDmg = towerPct !== undefined && baseDamage ? baseDamage * (100 + towerPct) / 100 : null;

    card.hitpoints = mergeLevels(scaleLevels(baseHP, mult), card.hitpoints);
    card.damage = mergeLevels(scaleLevels(baseDamage, mult), card.damage);
    card.fatalDamage = mergeLevels(scaleLevels(charData.deathDamage || charData.deathSpawnCharacterData?.deathDamage, mult), card.fatalDamage);
    card.chargeDamage = mergeLevels(scaleLevels(charData.damageSpecial, mult), card.chargeDamage);
    card.towerDamage = mergeLevels(scaleLevels(baseTowerDmg, mult), card.towerDamage);

    const baseSpell: Record<string, unknown> = { ...spell };
    delete baseSpell.evolvedSpellsData;
    delete baseSpell.heroData;
    const newSkills = extractSkills({ spell: baseSpell, charData, area, proj, buff, deathArea }, mult, baseHP ?? null);
    card.skills = { ...card.skills, ...newSkills };

    populateEvolution(card, spell, mult, baseHP, baseDamage);
}

function resolveManualPrestigeCost(card: Card): number | null {
    return typeof card.statsHero.prestigeCost === 'number' ? card.statsHero.prestigeCost : null;
}

function populateHeroStats(card: Card, spell: Spell, mult: LevelMultiplier, baseHP: number | null): void {
    let ability = findAbilityData(spell);
    if (!ability && spell.heroData && typeof spell.heroData === 'object') {
        ability = spell.heroData;
    }
    const abilityRecord: Record<string, unknown> | null = (ability && typeof ability === 'object')
        ? ability as Record<string, unknown> : null;
    const manualPrestigeCost = resolveManualPrestigeCost(card);

    if (card.hero) {
        const heroAbility = (spell.heroData && typeof spell.heroData === 'object') ? spell.heroData as Record<string, any> : null;

        if (heroAbility) {
            card.statsHero.skills = {
                ability: {
                    name: heroAbility.name || null,
                    elixirCost: manualPrestigeCost,
                    cooldown: (heroAbility.cooldown && heroAbility.cooldown > 0) ? heroAbility.cooldown / 1000 : null
                }
            };
        } else {
            card.statsHero.skills = card.statsHero.skills || {};
        }
        card.statsHero.prestigeCost = manualPrestigeCost;
        return;
    }

    card.statsHero.prestigeCost = null;
    card.statsHero.skills = {};
}

function populateEvolution(card: Card, spell: Spell, mult: LevelMultiplier, baseHP: number | undefined, baseDamage: number | undefined): void {
    if (!spell.evolvedSpellsData) return;

    card.evolution = true;
    const evo = spell.evolvedSpellsData;
    const evoChar: CharacterData = evo.summonCharacterData || evo.areaEffectObjectData?.onStartingActionData?.spawnDataData || {};
    const { area, proj, buff, spawnProj, spawnChar, deathArea } = resolveDataSources(evo, evoChar);

    const evoHP = evoChar.hitpoints || spawnChar.hitpoints || baseHP;
    const evoDmg = evoChar.damage || proj.damage || area.damage || buff.damagePerSecond || spawnProj.damage || spawnChar.damage || baseDamage;

    card.statsEvo.hitpoints = mergeLevels(scaleLevels(evoHP, mult), card.statsEvo.hitpoints);
    card.statsEvo.damage = mergeLevels(scaleLevels(evoDmg, mult), card.statsEvo.damage);
    card.statsEvo.cycles = evo.cycles ?? card.statsEvo.cycles;
    const evoSkills = extractSkills({ spell: evo, charData: evoChar, area, proj, buff, deathArea }, mult, evoHP ?? null);

    // Filter redundant skills already present in base version
    const filteredSkills: SkillsMap = {};
    for (const [type, data] of Object.entries(evoSkills)) {
        if (!isEqual(data, card.skills[type as SkillType])) {
            filteredSkills[type as SkillType] = data as any;
        }
    }
    card.statsEvo.skills = { ...card.statsEvo.skills, ...filteredSkills };
}

function applyDefaults(card: Card): void {
    const skeleton = cloneDeep(CARD_SKELETON);
    const source = cloneDeep(card);

    const merge = (target: any, src: any) => {
        for (const key in target) {
            if (src && key in src) {
                if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key]) && target[key] !== null &&
                    src[key] && typeof src[key] === 'object' && !Array.isArray(src[key]) && src[key] !== null) {
                    merge(target[key], src[key]);
                } else if (src[key] !== undefined) {
                    target[key] = src[key];
                }
            }
        }
        if (src) {
            for (const key in src) {
                if (!(key in target)) {
                    target[key] = src[key];
                }
            }
        }
    };

    merge(skeleton, source);

    for (const key in card) delete (card as any)[key];
    Object.assign(card, skeleton);
}

async function updateCards(): Promise<void> {
    const apiData = await fetchJSON<ApiData>(API_URL);
    const spells = apiData?.items?.spells;
    if (!spells) throw new Error('Invalid API data structure');

    const cardsJson: CardsJson = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));
    const cardsById = new Map<number, Card>();
    cardsJson.cards.forEach(c => { if (c.id != null) cardsById.set(c.id, c); });
    cardsJson.towerCards.forEach(c => { if (c.id != null) cardsById.set(c.id, c); });

    let updated = 0, added = 0;

    for (const spell of spells) {
        if (spell.name.startsWith('Super') || spell.notVisible) continue;

        const isTower = spell.tidType === 'TID_TYPE_TOWER_TROOP' || spell.source === 'support_cards';
        const mult = isTower ? LEVEL_MULTIPLIERS.tower : LEVEL_MULTIPLIERS.standard;

        let card = cardsById.get(spell.id);
        if (!card) {
            card = cloneDeep(CARD_SKELETON);
            card.id = spell.id;
            card.name = spell.englishName || spell.name;
            card.type = isTower ? 'tower' : 'troop';
            (isTower ? cardsJson.towerCards : cardsJson.cards).push(card);
            added++;
        } else {
            updated++;
        }

        populateCard(card, spell, mult);
    }

    [...cardsJson.cards, ...cardsJson.towerCards].forEach(applyDefaults);

    fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsJson, null, 4), 'utf8');
    console.log(`Done: ${updated} updated, ${added} added`);
}

updateCards().catch((e: Error) => { console.error('Error:', e.message); process.exit(1); });
