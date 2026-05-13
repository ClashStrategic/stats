import { JSONSchemaType } from 'ajv';
import { CardsJson } from './types.js';

const levelBasedStats = {
    type: 'object',
    properties: {
        level11: { type: 'number', nullable: true },
        level15: { type: 'number', nullable: true },
        level16: { type: 'number', nullable: true },
    },
    required: ['level11', 'level15', 'level16'],
    additionalProperties: false,
} as const;

const levelBasedNullStats = {
    type: 'object',
    properties: {
        level11: { type: 'null' },
        level15: { type: 'null' },
        level16: { type: 'null' },
    },
    required: ['level11', 'level15', 'level16'],
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
            },
            required: ['damage', 'minRange', 'maxRange'],
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
            },
            required: ['name', 'elixirCost', 'cooldown'],
            additionalProperties: false,
        },
        pierce: {
            type: 'object',
            properties: {
                radius: { type: 'number', nullable: true },
                range: { type: 'number', nullable: true },
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
    },
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
        typeAttack: { type: 'string', nullable: true },
        projectile: { type: 'boolean' },
        suicide: { type: 'boolean' },
        skills: skillsSchema,
        fatalDamage: levelBasedStats,
        chargeDamage: levelBasedStats,
        towerDamage: levelBasedStats,
        damage: levelBasedStats,
        hitpoints: levelBasedStats,
        evoStats: {
            type: 'object',
            properties: {
                cycles: { type: 'number', nullable: true },
                skills: skillsSchema,
                damage: levelBasedStats,
                hitpoints: levelBasedStats,
            },
            required: ['cycles', 'skills', 'damage', 'hitpoints'],
            additionalProperties: false,
        },
        heroStats: {
            type: 'object',
            properties: {
                skills: skillsSchema,
            },
            required: ['skills'],
            additionalProperties: false,
        },
        hitspeed: { type: 'number', nullable: true },
        loadTime: { type: 'number', nullable: true },
        radius: { type: 'number', nullable: true },
        collisionRadius: { type: 'number', nullable: true },
        generationSpeed: { type: 'number', nullable: true },
        generationUnits: { type: 'number', nullable: true },
        speed: {
            type: 'string',
            nullable: true,
            enum: ['slow', 'medium', 'fast', 'very-fast', null],
        },
        range: { type: 'number', nullable: true },
        sightRange: { type: 'number', nullable: true },
        territory: {
            type: 'string',
            nullable: true,
            enum: ['wide', 'restricted', null],
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
        'evolution', 'hero', 'typeAttack', 'projectile', 'suicide', 'skills', 'fatalDamage',
        'chargeDamage', 'towerDamage', 'damage', 'hitpoints', 'evoStats', 'heroStats',
        'hitspeed', 'loadTime', 'radius', 'collisionRadius', 'generationSpeed', 'generationUnits', 'speed',
        'range', 'sightRange', 'territory', 'rarity', 'type', 'unlockArena', 'tribe', 'deployTime'
    ],
} as const;

export const cardSchema: JSONSchemaType<CardsJson> = {
    type: 'object',
    properties: {
        cards: {
            type: 'array',
            items: cardObjectSchema as any,
        },
        towerCards: {
            type: 'array',
            items: cardObjectSchema as any,
        },
    },
    required: ['cards', 'towerCards'],
    additionalProperties: false,
};
