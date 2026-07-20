import { JSONSchemaType } from 'ajv';
import { CardsJson } from './types.js';

const levelBasedStats = {
    type: 'object',
    properties: {
        level11: { type: 'number', nullable: true },
        level16: { type: 'number', nullable: true },
    },
    required: ['level11', 'level16'],
    additionalProperties: false,
} as const;

const skillsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        heal: {
            type: 'object',
            properties: {
                perAttack: levelBasedStats,
                frequency: { type: 'number', nullable: true },
                overHeal: levelBasedStats,
                onSpawn: levelBasedStats,
            },
            required: ['perAttack', 'frequency', 'overHeal', 'onSpawn'],
            additionalProperties: false,
        },
        stun: {
            type: 'object',
            properties: {
                hitSpeedMultiplier: { type: 'number', nullable: true },
                speedMultiplier: { type: 'number', nullable: true },
                spawnSpeedMultiplier: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
                strikes: { type: 'number', nullable: true },
                radiusGrowth: { type: 'number', nullable: true },
                delayBetweenStrikes: { type: 'number', nullable: true },
            },
            required: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
            additionalProperties: false,
        },
        slow: {
            type: 'object',
            properties: {
                hitSpeedMultiplier: { type: 'number', nullable: true },
                speedMultiplier: { type: 'number', nullable: true },
                spawnSpeedMultiplier: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
            },
            required: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
            additionalProperties: false,
        },
        pushback: {
            type: 'object',
            properties: {
                distance: { type: 'number', nullable: true },
                strength: { type: 'number', nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                radius: { type: 'number', nullable: true },
            },
            required: ['distance', 'strength'],
            additionalProperties: false,
        },
        shield: {
            type: 'object',
            properties: {
                hitpoints: { ...levelBasedStats, nullable: true },
                damageReductionPercent: { type: 'number', nullable: true },
            },
            required: ['hitpoints', 'damageReductionPercent'],
            additionalProperties: false,
        },
        dash: {
            type: 'object',
            properties: {
                damage: levelBasedStats,
                minRange: { type: 'number', nullable: true },
                maxRange: { type: 'number', nullable: true },
                targetType: { type: 'string', nullable: true },
            },
            required: ['damage', 'minRange', 'maxRange'],
            additionalProperties: false,
        },
        charge: {
            type: 'object',
            properties: {
                damage: levelBasedStats,
                range: { type: 'number', nullable: true },
                speedMultiplier: { type: 'number', nullable: true },
            },
            required: ['damage', 'range', 'speedMultiplier'],
            additionalProperties: false,
        },
        jump: {
            type: 'object',
            properties: {
                height: { type: 'number', nullable: true },
                speed: { type: 'number', nullable: true },
            },
            required: ['height', 'speed'],
            additionalProperties: false,
        },
        invisibility: {
            type: 'object',
            properties: {
                whenNotAttackingTime: { type: 'number', nullable: true },
            },
            required: ['whenNotAttackingTime'],
            additionalProperties: false,
        },
        'spawn-on-death': {
            type: 'object',
            properties: {
                character: { type: ['string', 'boolean'], nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                radius: { type: 'number', nullable: true },
                deployTime: { type: 'number', nullable: true },
                count: { type: 'number', nullable: true },
            },
            required: ['character', 'damage', 'radius', 'deployTime'],
            additionalProperties: false,
        },
        'periodic-spawn': {
            type: 'object',
            properties: {
                pauseTime: { type: 'number', nullable: true },
                character: { type: 'string', nullable: true },
                units: { type: 'number', nullable: true },
            },
            required: ['pauseTime', 'character', 'units'],
            additionalProperties: false,
        },
        'area-damage-on-death': {
            type: 'object',
            properties: {
                areaEffect: { type: ['string', 'boolean'], nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                radius: { type: 'number', nullable: true },
            },
            required: ['areaEffect', 'damage', 'radius'],
            additionalProperties: false,
        },
        ability: {
            type: 'object',
            properties: {
                name: { type: 'string', nullable: true },
                elixirCost: { type: 'number', nullable: true },
                cooldown: { type: 'number', nullable: true },
                skills: { $ref: '#/$defs/abilitySkills' },
            },
            required: ['name', 'elixirCost', 'cooldown', 'skills'],
            additionalProperties: false,
        },
        pierce: {
            type: 'object',
            properties: {
                radius: { type: 'number', nullable: true },
                range: { type: 'number', nullable: true },
                bounces: { type: 'number', nullable: true },
                bounceDistance: { type: 'number', nullable: true },
                bounceMode: { type: 'string', nullable: true, enum: ['nearest', 'linear', null] },
                bounceDelay: { type: 'number', nullable: true },
            },
            required: ['radius', 'range'],
            additionalProperties: false,
        },
        boost: {
            type: 'object',
            properties: {
                hitSpeedMultiplier: { type: 'number', nullable: true },
                speedMultiplier: { type: 'number', nullable: true },
                spawnSpeedMultiplier: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
                rangeMultiplier: { type: 'number', nullable: true },
                radius: { type: 'number', nullable: true },
                enemySpeedMultiplier: { type: 'number', nullable: true },
                enemyHitSpeedMultiplier: { type: 'number', nullable: true },
            },
            required: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
            additionalProperties: false,
        },
        burrow: {
            type: 'object',
            properties: {
                duration: { type: 'number', nullable: true },
            },
            required: ['duration'],
            additionalProperties: false,
        },
        multiply: {
            type: 'object',
            properties: {
                units: { type: 'number', nullable: true },
                interval: { type: 'number', nullable: true },
                maxUnits: { type: 'number', nullable: true },
            },
            required: ['units', 'interval', 'maxUnits'],
            additionalProperties: false,
        },
        reflect: {
            type: 'object',
            properties: {
                damageReductionPercent: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
                radius: { type: 'number', nullable: true },
            },
            required: ['damageReductionPercent', 'duration', 'radius'],
            additionalProperties: false,
        },
        'ramping-damage': {
            type: 'object',
            properties: {
                rampInterval: { type: 'number', nullable: true },
                damageTiers: {
                    type: 'array',
                    items: levelBasedStats,
                },
            },
            required: ['rampInterval', 'damageTiers'],
            additionalProperties: false,
        },
        taunt: {
            type: 'object',
            properties: {
                range: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
                triggerWindow: { type: 'number', nullable: true },
            },
            required: ['range', 'duration', 'triggerWindow'],
            additionalProperties: false,
        },
        pull: {
            type: 'object',
            properties: {
                radius: { type: 'number', nullable: true },
                strength: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
            },
            required: ['radius', 'strength', 'duration'],
            additionalProperties: false,
        },
        snipe: {
            type: 'object',
            properties: {
                range: { type: 'number', nullable: true },
                ammo: { type: 'number', nullable: true },
                rootDuration: { type: 'number', nullable: true },
                damageMultiplier: { type: 'number', nullable: true },
                hitSpeedMultiplier: { type: 'number', nullable: true },
                aoeRadius: { type: 'number', nullable: true },
                closeRange: { type: 'boolean', nullable: true },
                pushbackDistance: { type: 'number', nullable: true },
            },
            required: ['range', 'ammo', 'rootDuration', 'damageMultiplier', 'hitSpeedMultiplier', 'aoeRadius'],
            additionalProperties: false,
        },
        stack: {
            type: 'object',
            properties: {
                maxStacks: { type: 'number', nullable: true },
                hpPerStack: { type: 'number', nullable: true },
                damagePerStack: { type: 'number', nullable: true },
                interval: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
            },
            required: ['maxStacks', 'hpPerStack', 'damagePerStack', 'interval', 'duration'],
            additionalProperties: false,
        },
        spawn: {
            type: 'object',
            properties: {
                character: { type: 'string', nullable: true },
                count: {
                    oneOf: [
                        { type: 'number', nullable: true },
                        {
                            type: 'object',
                            properties: {
                                base: { type: 'number' },
                                perStack: { type: 'number', nullable: true },
                                maxStacks: { type: 'number', nullable: true },
                            },
                            required: ['base'],
                            additionalProperties: false,
                        },
                    ],
                },
                hitpoints: { ...levelBasedStats, nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                lifetime: { type: 'number', nullable: true },
                range: { type: 'number', nullable: true },
                targets: {
                    type: 'array',
                    items: { type: 'string', enum: ['ground', 'air', 'buildings'] },
                },
                radius: { type: 'number', nullable: true },
                interval: { type: 'number', nullable: true },
            },
            required: ['character', 'count', 'hitpoints', 'damage', 'lifetime', 'range', 'targets'],
            additionalProperties: false,
        },
        'spawn-on-kill': {
            type: 'object',
            properties: {
                markDuration: { type: 'number', nullable: true },
                character: { type: 'string', nullable: true },
                count: {
                    oneOf: [
                        { type: 'number', nullable: true },
                        {
                            type: 'object',
                            properties: {
                                base: { type: 'number' },
                                perStack: { type: 'number', nullable: true },
                                maxStacks: { type: 'number', nullable: true },
                            },
                            required: ['base'],
                            additionalProperties: false,
                        },
                    ],
                },
                chance: { type: 'number', nullable: true },
                radius: { type: 'number', nullable: true },
                interval: { type: 'number', nullable: true },
                hitpoints: { ...levelBasedStats, nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                hitspeed: { type: 'number', nullable: true },
                speed: { type: 'string', nullable: true, enum: ['slow', 'medium', 'fast', 'very-fast', null] },
                range: { type: 'number', nullable: true },
                lifetime: { type: 'number', nullable: true },
                targets: {
                    type: 'array',
                    items: { type: 'string', enum: ['ground', 'air', 'buildings'] },
                },
            },
            required: ['character', 'count'],
            additionalProperties: false,
        },
        redeploy: {
            type: 'object',
            properties: {
                range: { type: 'number', nullable: true },
                damage: levelBasedStats,
                knockback: { type: 'number', nullable: true },
                healPercent: { type: 'number', nullable: true },
            },
            required: ['range', 'damage', 'knockback', 'healPercent'],
            additionalProperties: false,
        },
        warp: {
            type: 'object',
            properties: {
                targetType: { type: 'string', nullable: true },
                damage: levelBasedStats,
                bonusDamagePercent: { type: 'number', nullable: true },
            },
            required: ['targetType', 'damage', 'bonusDamagePercent'],
            additionalProperties: false,
        },
        volley: {
            type: 'object',
            properties: {
                projectileCount: { type: 'number', nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                radius: { type: 'number', nullable: true },
                knockback: { type: 'number', nullable: true },
            },
            required: ['projectileCount', 'damage'],
            additionalProperties: false,
        },
        invincible: {
            type: 'object',
            properties: {
                duration: { type: 'number', nullable: true },
                radius: { type: 'number', nullable: true },
                moveSpeedPenalty: { type: 'number', nullable: true },
                attackSpeedPenalty: { type: 'number', nullable: true },
                triggerType: { type: 'string', nullable: true },
            },
            required: ['duration', 'radius'],
            additionalProperties: false,
        },
        poison: {
            type: 'object',
            properties: {
                duration: { type: 'number', nullable: true },
                radius: { type: 'number', nullable: true },
                tickInterval: { type: 'number', nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                maxStacks: { type: 'number', nullable: true },
                tickStunDuration: { type: 'number', nullable: true },
            },
            required: ['duration', 'radius', 'tickInterval', 'damage'],
            additionalProperties: false,
        },
    },
} as const;

const { ability: _, ...abilitySkillsProperties } = skillsSchema.properties;
const abilitySkillsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: abilitySkillsProperties,
} as const;

const cardObjectSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', nullable: true },
        id: { type: 'number', nullable: true },
        elixirCost: { type: 'number', nullable: true },
        targets: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['ground', 'air', 'buildings'],
            },
        },
        units: { type: 'number' },
        duration: { type: 'number', nullable: true },
        evolution: { type: 'boolean' },
        hero: { type: 'boolean' },
        hitType: { type: 'string', nullable: true },
        projectile: { type: 'boolean' },
        projectileNumber: { type: 'number', nullable: true },
        kamikaze: { type: 'boolean' },
        flying: { type: 'boolean' },
        skills: { $ref: '#/$defs/skills' },
        towerDamage: levelBasedStats,
        damage: levelBasedStats,
        hitpoints: levelBasedStats,
        evoStats: {
            type: 'object',
            properties: {
                cycles: { type: 'number', nullable: true },
                skills: { $ref: '#/$defs/skills' },
                towerDamage: levelBasedStats,
                damage: levelBasedStats,
                hitpoints: levelBasedStats,
            },
            required: ['cycles', 'skills', 'towerDamage', 'damage', 'hitpoints'],
            additionalProperties: false,
        },
        heroStats: {
            type: 'object',
            properties: {
                skills: { $ref: '#/$defs/skills' },
            },
            required: ['skills'],
            additionalProperties: false,
        },
        hitspeed: { type: 'number', nullable: true },
        loadTime: { type: 'number', nullable: true },
        radius: { type: 'number', nullable: true },
        collisionRadius: { type: 'number', nullable: true },
        speed: {
            type: 'string',
            nullable: true,
            enum: ['slow', 'medium', 'fast', 'very-fast', null],
        },
        range: { type: 'number', nullable: true },
        sightRange: { type: 'number', nullable: true },
        placement: {
            type: 'string',
            nullable: true,
            enum: ['anywhere', 'own-side', null],
        },
        rarity: {
            type: 'string',
            nullable: true,
            enum: ['common', 'rare', 'epic', 'legendary', 'champion', '', null],
        },
        type: {
            type: 'string',
            nullable: true,
            enum: ['troop', 'building', 'spell', 'tower', null],
        },
        unlockArena: { type: 'string', nullable: true },
        tribe: { type: 'string', nullable: true },
        deployTime: { type: 'number', nullable: true },
    },
    required: [
        'name', 'id', 'elixirCost', 'targets', 'units', 'duration',
        'evolution', 'hero', 'hitType', 'projectile', 'kamikaze', 'flying', 'skills',
        'towerDamage', 'damage', 'hitpoints', 'evoStats', 'heroStats',
        'hitspeed', 'loadTime', 'radius', 'collisionRadius', 'speed',
        'range', 'sightRange', 'placement', 'rarity', 'type', 'unlockArena', 'tribe', 'deployTime'
    ],
} as const;

const towerCardObjectSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', nullable: true },
        id: { type: 'number', nullable: true },
        targets: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['ground', 'air', 'buildings'],
            },
        },
        units: { type: 'number' },
        hitType: { type: 'string', nullable: true },
        projectile: { type: 'boolean' },
        projectileNumber: { type: 'number', nullable: true },
        skills: { $ref: '#/$defs/skills' },
        damage: levelBasedStats,
        hitpoints: levelBasedStats,
        hitspeed: { type: 'number', nullable: true },
        collisionRadius: { type: 'number', nullable: true },
        speed: {
            type: 'string',
            nullable: true,
            enum: ['slow', 'medium', 'fast', 'very-fast', null],
        },
        range: { type: 'number', nullable: true },
        sightRange: { type: 'number', nullable: true },
        rarity: {
            type: 'string',
            nullable: true,
            enum: ['common', 'rare', 'epic', 'legendary', 'champion', '', null],
        },
        type: {
            type: 'string',
            nullable: true,
            enum: ['troop', 'building', 'spell', 'tower', null],
        },
        unlockArena: { type: 'string', nullable: true },
        tribe: { type: 'string', nullable: true },
    },
    required: [
        'name', 'id', 'targets', 'units', 'hitType', 'projectile', 'skills',
        'damage', 'hitpoints', 'hitspeed', 'collisionRadius', 'speed',
        'range', 'sightRange', 'rarity', 'type', 'unlockArena', 'tribe'
    ],
} as const;

export const cardSchema: JSONSchemaType<CardsJson> = {
    type: 'object',
    $defs: {
        skills: skillsSchema as any,
        abilitySkills: abilitySkillsSchema as any,
    },
    properties: {
        cards: {
            type: 'array',
            items: cardObjectSchema as any,
        },
        towerCards: {
            type: 'array',
            items: towerCardObjectSchema as any,
        },
    },
    required: ['cards', 'towerCards'],
    additionalProperties: false,
};
