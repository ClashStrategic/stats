import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {
    TargetValue, SpeedValue, Rarity, CardType,
    Levels, EMPTY_LEVELS, SkillsMap, SkillTemplates,
    SkillType, EvoStats, HeroStats, Card, TowerCard, CardsJson,
    HealSkill, StunSkill, SlowSkill, PushbackSkill, ShieldSkill,
    DashSkill, JumpSkill, InvisibilitySkill, SpawnOnDeathSkill,
    PeriodicSpawnSkill, AreaDamageOnDeathSkill, AbilitySkill,
    PierceSkill, BoostSkill, BurrowSkill, MultiplySkill, ReflectSkill, RampingDamageSkill
} from '../src/types.js';
import {
    SpeedTid, TargetTid, LevelMultiplier, CharacterData, ProjectileData,
    BuffData, AreaEffectData, Spell, ApiData, DataSources
} from './types.js';
import { cardSchema } from '../src/schema.js';

const API_URL = 'https://cache.statsroyale.com/gamedata-v5.json';
const CARDS_FILE = path.join(__dirname, '..', 'data', 'cards.json');

const LEVEL_MULTIPLIERS: Record<'standard' | 'tower', LevelMultiplier> = {
    standard: { level11: 2.56, level16: 4.09 },
    tower: { level11: 2.18, level16: 3.46 }
};

const levelsFromStandardLevel11 = (level11: number): Levels => {
    const baseLevel = Math.round(level11 / LEVEL_MULTIPLIERS.standard.level11);
    const exactLevel11 = Math.floor(baseLevel * LEVEL_MULTIPLIERS.standard.level11);
    const level16 = exactLevel11 === level11
        ? Math.floor(baseLevel * LEVEL_MULTIPLIERS.standard.level16)
        : Math.floor(level11 * LEVEL_MULTIPLIERS.standard.level16 / LEVEL_MULTIPLIERS.standard.level11);

    return { level11, level16 };
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

const CARD_SKELETON: Card = {
    name: null, id: null, elixirCost: null, targets: [], units: 0,
    duration: null, deployTime: null, evolution: false, hero: false, hitType: null,
    projectile: false, projectileNumber: null, kamikaze: false, flying: false,
    skills: {},
    towerDamage: { ...EMPTY_LEVELS }, damage: { ...EMPTY_LEVELS },
    hitpoints: { ...EMPTY_LEVELS },
    evoStats: {
        cycles: null, skills: {},
        towerDamage: { ...EMPTY_LEVELS },
        damage: { ...EMPTY_LEVELS }, hitpoints: { ...EMPTY_LEVELS }
    },
    heroStats: { skills: {} },
    hitspeed: null, loadTime: null, radius: null, collisionRadius: null,
    speed: null, range: null, sightRange: null, placement: null, unlockArena: null, tribe: null, rarity: null, type: null
};

const TOWER_CARD_SKELETON: TowerCard = {
    name: null, id: null, targets: [], units: 0, hitType: null,
    projectile: false, projectileNumber: null, skills: {},
    damage: { ...EMPTY_LEVELS }, hitpoints: { ...EMPTY_LEVELS },
    hitspeed: null, collisionRadius: null,
    speed: null, range: null, sightRange: null, unlockArena: null, tribe: null, rarity: null, type: null
};

const SKILL_TEMPLATES: SkillTemplates = {
    'heal': { perAttack: { ...EMPTY_LEVELS }, frequency: null, overHeal: { ...EMPTY_LEVELS }, onSpawn: { ...EMPTY_LEVELS } },
    'stun': { hitSpeedMultiplier: null, speedMultiplier: null, spawnSpeedMultiplier: null, duration: null },
    'slow': { hitSpeedMultiplier: null, speedMultiplier: null, spawnSpeedMultiplier: null, duration: null },
    'pushback': { distance: null, strength: null },
    'shield': { hitpoints: { ...EMPTY_LEVELS }, damageReductionPercent: null },
    'dash': { damage: { ...EMPTY_LEVELS }, minRange: null, maxRange: null },
    'charge': { damage: { ...EMPTY_LEVELS }, range: null, speedMultiplier: null },
    'jump': { height: null, speed: null },
    'invisibility': { whenNotAttackingTime: null },
    'spawn-on-death': { character: null, damage: { ...EMPTY_LEVELS }, radius: null, deployTime: null },
    'periodic-spawn': { pauseTime: null, character: null, units: null },
    'area-damage-on-death': { areaEffect: null, damage: { ...EMPTY_LEVELS }, radius: null },
    'ability': { name: null, elixirCost: null, cooldown: null, skills: {} },
    'pierce': { radius: null, range: null },
    'boost': { hitSpeedMultiplier: null, speedMultiplier: null, spawnSpeedMultiplier: null, duration: null },
    'burrow': { duration: null },
    'multiply': { units: null, interval: null, maxUnits: null },
    'reflect': { damageReductionPercent: null, duration: null, radius: null },
    'ramping-damage': { rampInterval: null, damageTiers: [] }
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
        ? { level11: Math.floor(base * mult.level11), level16: Math.floor(base * mult.level16) }
        : { ...EMPTY_LEVELS };

const mergeLevels = (computed: Levels, existing: Levels | null | undefined): Levels => ({
    level11: computed.level11 ?? existing?.level11 ?? null,
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
    baseHP: number | null = null
): SkillsMap {
    const skills: SkillsMap = {};
    const visited = new Set<object>();

    const setSkill = (type: SkillType, data: Record<string, unknown>): void => {
        const map = skills as Record<string, Record<string, unknown>>;
        if (!map[type]) map[type] = cloneDeep(SKILL_TEMPLATES[type]) as unknown as Record<string, unknown>;
        Object.entries(data).forEach(([k, v]) => {
            if (v != null) {
                if (type === 'ramping-damage' && k === 'damageTiers' && Array.isArray(map[type][k]) && (map[type][k] as any[]).length > (v as any[]).length) {
                    return;
                }
                map[type][k] = v;
            }
        });
    };

    const scan = (
        raw: unknown,
        isSpawn: boolean = false,
        parentDuration: number | null = null,
        currentGroupMaxSize: number | null = null,
        context: SkillType | null = null,
        isRealSpawn: boolean = false
    ): void => {
        if (!raw || typeof raw !== 'object' || visited.has(raw as object)) return;
        visited.add(raw as object);
        const obj = raw as Record<string, any>;

        const isReflect = typeof obj.name === 'string' && (
            obj.name.toLowerCase().includes('reflect') ||
            obj.name.toLowerCase().includes('deflect') ||
            obj.name.toLowerCase().includes('parry')
        );

        const hasMultipliers = isStun(obj.hitSpeedMultiplier) || isStun(obj.speedMultiplier) || isStun(obj.spawnSpeedMultiplier) ||
            isSlow(obj.hitSpeedMultiplier) || isSlow(obj.speedMultiplier) || isSlow(obj.spawnSpeedMultiplier) ||
            isBoost(obj.hitSpeedMultiplier) || isBoost(obj.speedMultiplier) || isBoost(obj.spawnSpeedMultiplier);

        if ((obj.source === 'character_abilities' || obj.source === 'character_buffs') && !hasMultipliers && !isReflect && context !== 'reflect') return;

        const localDuration = (obj.lifeDuration > (obj.buffTime ?? 0)) ? obj.lifeDuration : (obj.buffTime ?? obj.buffOnDamageTime ?? obj.lifeDuration);
        const currentDuration = localDuration ?? parentDuration;
        const groupMaxSize = obj.groupMaxSize ?? currentGroupMaxSize;
        const localRadius = obj.radius ?? obj.areaDamageRadius ?? obj.collisionRadius;

        if (obj.damage > 0 && context) {
            setSkill(context, {
                damage: mult ? scaleLevels(obj.damage, mult) : { ...EMPTY_LEVELS }
            });
        }

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

        if ((isSlow(obj.hitSpeedMultiplier) || isSlow(obj.speedMultiplier) && obj.name != 'ArcherQueenRapid')) {
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

        if (obj.damageSpecial > 0)
            setSkill('charge', {
                damage: mult ? scaleLevels(obj.damageSpecial, mult) : { ...EMPTY_LEVELS },
                range: obj.chargeRange ? obj.chargeRange / 100 : null,
                speedMultiplier: obj.chargeSpeedMultiplier ? obj.chargeSpeedMultiplier : null
            });

        if (obj.invisible || obj.stealth || obj.buffWhenNotAttackingData?.name.includes('Invisibility'))
            setSkill('invisibility', {
                whenNotAttackingTime: obj.buffWhenNotAttackingTime ? toSec(obj.buffWhenNotAttackingTime) : null
            });

        if (obj.deathDamage > 0 && !isRealSpawn) {
            setSkill('area-damage-on-death', {
                damage: mult ? scaleLevels(obj.deathDamage, mult) : { ...EMPTY_LEVELS },
                radius: localRadius ? localRadius / 1000 : null
            });
        }

        if (obj.deathSpawnCharacterData && !isRealSpawn) {
            const spawn = obj.deathSpawnCharacterData as CharacterData;
            if (spawn.hitpoints && spawn.hitpoints > 0) {
                setSkill('spawn-on-death', {
                    character: spawn.name || true,
                    damage: mult ? scaleLevels(spawn.deathDamage, mult) : { ...EMPTY_LEVELS },
                    radius: spawn.collisionRadius ? spawn.collisionRadius / 1000 : null,
                    deployTime: toSec(spawn.deployTime as number)
                });
            }
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
                areaEffect: effect.name || 'death-explosion',
                damage: mult ? scaleLevels(effect.damage || obj.deathDamage, mult) : { ...EMPTY_LEVELS },
                radius: effect.radius ? effect.radius / 1000 : (localRadius ? localRadius / 1000 : null)
            });
        }

        if (obj.projectileRange > 2000 && obj.radius > 0 && (obj.tid === 'TID_SPELL_ATTRIBUTE_AREA_DAMAGE' || obj.tid === 'TID_SPELL_ATTRIBUTE_RANGED_DAMAGE')) {
            setSkill('pierce', {
                range: obj.projectileRange / 1000,
                radius: obj.radius ? obj.radius / 1000 : null
            });
        }

        if (isReflect || context === 'reflect') {
            setSkill('reflect', {
                damageReductionPercent: typeof obj.damageReduction === 'number' ? obj.damageReduction : null,
                duration: currentDuration ? toSec(currentDuration) : null,
                radius: localRadius ? localRadius / 1000 : null
            });
        }

        const damageTiersRaw: number[] = [];
        if (Array.isArray(obj.attackSequenceList)) {
            obj.attackSequenceList.forEach((seq: any) => {
                if (typeof seq.damage === 'number') {
                    damageTiersRaw.push(seq.damage);
                }
            });
        } else if (obj.variableDamage2 > 0 && obj.variableDamage3 > 0) {
            damageTiersRaw.push(obj.damage);
            damageTiersRaw.push(obj.variableDamage2);
            damageTiersRaw.push(obj.variableDamage3);
        }

        if (damageTiersRaw.length > 0) {
            setSkill('ramping-damage', {
                rampInterval: 1.5,
                damageTiers: damageTiersRaw.map(dmg => mult ? scaleLevels(dmg, mult) : { ...EMPTY_LEVELS })
            });
        }

        for (const key in obj) {
            if (typeof obj[key] === 'object' && key !== 'abilityData' && key !== 'baseData') {
                const nextIsSpawn = isSpawn || key === 'spawnAreaObjectData' || key === 'onStartingActionData';

                let nextContext = context;
                if (isReflect) {
                    nextContext = 'reflect';
                }
                if (key === 'deathAreaEffectData') {
                    nextContext = 'area-damage-on-death';
                } else if (key === 'deathSpawnCharacterData') {
                    const spawn = obj[key] as CharacterData;
                    if (spawn.hitpoints && spawn.hitpoints > 0) {
                        scan(obj[key], nextIsSpawn, currentDuration, groupMaxSize, null, true);
                        continue;
                    }
                }

                scan(obj[key], nextIsSpawn, currentDuration, groupMaxSize, nextContext, isRealSpawn);
            }
        }
    };

    const sourcesArray = Array.isArray(sources)
        ? sources
        : (sources && typeof sources === 'object' && ('source' in (sources as any) || 'name' in (sources as any)))
            ? [sources]
            : Object.values(sources || {});

    sourcesArray.forEach(src => scan(src, false, null, null, null, false));
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

function mergeSkills(existing: SkillsMap, incoming: SkillsMap): SkillsMap {
    const merged = { ...existing };
    for (const [type, data] of Object.entries(incoming)) {
        const skillType = type as SkillType;
        if (skillType === 'ability') {
            const incomingAbility = data as any;
            merged.ability = {
                ...incomingAbility,
                skills: {
                    ...(existing.ability?.skills || {}),
                    ...(incomingAbility.skills || {})
                }
            };
        } else {
            merged[skillType] = data as any;
        }
    }
    return merged;
}

function createAbilitySkill(existing: any, abilityData: any, mult: LevelMultiplier | null, baseHP: number | null): any {
    const parsedSkills = extractSkills(abilityData, mult, baseHP);
    delete parsedSkills.ability;

    if (abilityData.name === 'ChampGuardianAbility') {
        parsedSkills.pushback = {
            distance: null,
            strength: 2.5
        };
    }
    if (abilityData.name === 'ArcherQueenRapid') {
        parsedSkills.boost = {
            hitSpeedMultiplier: 280,
            speedMultiplier: null,
            spawnSpeedMultiplier: null,
            duration: 3.5
        };
    }
    if (abilityData.name === 'MightyMinerLaneSwitch') {
        parsedSkills.burrow = {
            duration: null
        };
    }

    return {
        name: abilityData.name || existing?.name || null,
        elixirCost: existing?.elixirCost ?? abilityData.manaCost ?? null,
        cooldown: (abilityData.cooldown && abilityData.cooldown > 0) ? abilityData.cooldown / 1000 : existing?.cooldown ?? null,
        skills: {
            ...(existing?.skills || {}),
            ...parsedSkills
        }
    };
}

function populateCard(card: Card, spell: Spell, mult: LevelMultiplier): void {
    const charData = resolveMainCharacter(spell);
    const { area, proj, buff, spawnProj, spawnChar, deathArea } = resolveDataSources(spell, charData);

    card.elixirCost = spell.manaCost ?? card.elixirCost;
    card.rarity = (spell.rarity || card.rarity || '').toLowerCase() as Card['rarity'];
    card.hero = card.rarity !== 'champion' && !!spell.heroData;
    card.projectileNumber = (spell.multipleProjectiles as number)
        ?? (charData.multipleProjectiles as number)
        ?? (proj.spawnCount as number)
        ?? (spawnProj.spawnCount as number)
        ?? card.projectileNumber;
    card.kamikaze = charData.kamikaze ?? card.kamikaze;
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



    const rawRadius = spell.radius ?? area.radius ?? charData.areaDamageRadius ?? proj.radius ?? proj.customFirstProjectileData?.radius;
    if (rawRadius != null && card.units === 0 && !['Lightning', 'Void', 'Vines'].includes(card.name ?? '')) {
        card.radius = rawRadius / 1000;
        card.hitType = 'splash';
    } else {
        card.hitType = card.hitType || 'unique';
    }

    card.projectile = Object.keys(proj).length > 0 || card.projectile;

    const rawDuration = spell.lifeTime ?? area.lifeDuration ?? deathArea.lifeDuration ?? charData.spawnPathfindMorphData?.lifeTime;
    if (rawDuration != null) card.duration = rawDuration / 1000;

    const towerPct = spell.crownTowerDamagePercent ?? charData.crownTowerDamagePercent ?? proj.crownTowerDamagePercent
        ?? area.crownTowerDamagePercent ?? buff.crownTowerDamagePercent ?? spawnProj.crownTowerDamagePercent ?? spawnChar.crownTowerDamagePercent;
    const baseTowerDmg = towerPct !== undefined && baseDamage ? baseDamage * (100 + towerPct) / 100 : null;

    card.hitpoints = mergeLevels(scaleLevels(baseHP, mult), card.hitpoints);
    card.damage = mergeLevels(scaleLevels(baseDamage, mult), card.damage);
    const computedTowerDmg = baseTowerDmg !== null ? scaleLevels(baseTowerDmg, mult) : { ...EMPTY_LEVELS };
    card.towerDamage = mergeLevels(computedTowerDmg, card.towerDamage);
    if (baseTowerDmg === null && (card.towerDamage.level11 == null && card.towerDamage.level16 == null)) {
        card.towerDamage = { ...card.damage };
    }

    const baseSpell = { ...spell };
    delete baseSpell.evolvedSpellsData;
    delete baseSpell.heroData;
    const newSkills = extractSkills({ spell: baseSpell, charData, area, proj, buff, deathArea }, mult, baseHP ?? null);
    card.skills = mergeSkills(card.skills, newSkills);

    const abilityData = spell.abilityData || (spell as any).summonCharacterData?.abilityData;
    if (abilityData) {
        card.skills.ability = createAbilitySkill(card.skills.ability, abilityData, mult, baseHP ?? null);
    }

    if (spell.heroData) {
        card.heroStats = card.heroStats || { skills: {} };
        card.heroStats.skills.ability = createAbilitySkill(card.heroStats.skills.ability, spell.heroData, mult, baseHP ?? null);
    } else if (card.hero) {
        card.heroStats = card.heroStats || { skills: {} };
        card.heroStats.skills = card.heroStats.skills || {};
    } else {
        delete (card as any).heroStats;
    }

    // Move all non-ability skills into ability.skills for champions
    if (card.rarity === 'champion') {
        const ability = card.skills.ability;
        if (ability) {
            ability.skills = ability.skills || {};
            for (const [key, value] of Object.entries(card.skills)) {
                if (key !== 'ability') {
                    (ability.skills as any)[key] = value;
                    delete card.skills[key as SkillType];
                }
            }
        }
    }

    populateEvolution(card, spell, mult, baseHP, baseDamage);
}

function populateEvolution(card: Card, spell: Spell, mult: LevelMultiplier, baseHP: number | undefined, baseDamage: number | undefined): void {
    if (!spell.evolvedSpellsData) return;

    card.evolution = true;
    const evo = spell.evolvedSpellsData;
    const evoChar: CharacterData = evo.summonCharacterData || evo.areaEffectObjectData?.onStartingActionData?.spawnDataData || {};
    const { area, proj, buff, spawnProj, spawnChar, deathArea } = resolveDataSources(evo, evoChar);

    const evoHP = evoChar.hitpoints || spawnChar.hitpoints || baseHP;
    const evoDmg = evoChar.damage || proj.damage || area.damage || buff.damagePerSecond || spawnProj.damage || spawnChar.damage || baseDamage;

    const evoTowerPct = evo.crownTowerDamagePercent ?? evoChar.crownTowerDamagePercent ?? proj.crownTowerDamagePercent
        ?? area.crownTowerDamagePercent ?? buff.crownTowerDamagePercent ?? spawnProj.crownTowerDamagePercent ?? spawnChar.crownTowerDamagePercent;
    const evoBaseTowerDmg = evoTowerPct !== undefined && evoDmg ? evoDmg * (100 + evoTowerPct) / 100 : null;

    card.evoStats.hitpoints = mergeLevels(scaleLevels(evoHP, mult), card.evoStats.hitpoints);
    card.evoStats.damage = mergeLevels(scaleLevels(evoDmg, mult), card.evoStats.damage);
    const computedEvoTowerDmg = evoBaseTowerDmg !== null ? scaleLevels(evoBaseTowerDmg, mult) : { ...EMPTY_LEVELS };
    card.evoStats.towerDamage = mergeLevels(computedEvoTowerDmg, card.evoStats.towerDamage);
    if (evoBaseTowerDmg === null && (card.evoStats.towerDamage.level11 == null && card.evoStats.towerDamage.level16 == null)) {
        card.evoStats.towerDamage = { ...card.evoStats.damage };
    }

    card.evoStats.cycles = evo.cycles ?? card.evoStats.cycles;
    const evoSkills = extractSkills({ spell: evo, charData: evoChar, area, proj, buff, deathArea }, mult, evoHP ?? null);

    const filteredSkills: SkillsMap = {};
    for (const [type, data] of Object.entries(evoSkills)) {
        if (!isEqual(data, card.skills[type as SkillType])) {
            filteredSkills[type as SkillType] = data as any;
        }
    }

    card.evoStats.skills = mergeSkills(card.evoStats.skills, filteredSkills);
}

function applyDefaults(card: any, isTower: boolean = false): void {
    if (isTower) {
        const keysToRemove = [
            'elixirCost', 'deployTime', 'duration', 'kamikaze', 'evolution', 'hero',
            'flying', 'towerDamage', 'evoStats', 'heroStats', 'loadTime', 'radius', 'placement'
        ];
        keysToRemove.forEach(key => delete card[key]);
    }
    const skeleton = cloneDeep(isTower ? TOWER_CARD_SKELETON : CARD_SKELETON);
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
    const cardsById = new Map<number, any>();
    cardsJson.cards.forEach(c => { if (c.id != null) cardsById.set(c.id, c); });
    cardsJson.towerCards.forEach(c => { if (c.id != null) cardsById.set(c.id, c); });

    let updated = 0, added = 0;

    for (const spell of spells) {
        if (spell.name.startsWith('Super') || spell.notVisible) continue;

        const isTower = spell.tidType === 'TID_TYPE_TOWER_TROOP' || spell.source === 'support_cards';
        const mult = isTower ? LEVEL_MULTIPLIERS.tower : LEVEL_MULTIPLIERS.standard;

        let card = cardsById.get(spell.id);
        if (!card) {
            card = isTower ? (cloneDeep(TOWER_CARD_SKELETON) as any) : cloneDeep(CARD_SKELETON);
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

    cardsJson.cards.forEach(c => applyDefaults(c, false));
    cardsJson.towerCards.forEach(c => applyDefaults(c, true));

    fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsJson, null, 4), 'utf8');
    console.log(`Done: ${updated} updated, ${added} added`);
}

updateCards().catch((e: Error) => { console.error('Error:', e.message); process.exit(1); });
