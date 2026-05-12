/**
 * @fileoverview Defines the JSON schema for validating the structure of cards.json.
 * This schema is used by Ajv (Another JSON Validator) to ensure that the card data
 * adheres to a predefined structure, promoting data consistency and integrity.
 * @exports cardSchema - The complete JSON schema for card validation.
 */

'use strict';

/**
 * Reusable schema definition for statistics that vary by level (11 and 15).
 * Allows for either a number or null, ensuring flexibility for cards that may not have certain stats.
 * @type {object}
 */
const levelBasedStats = {
    type: 'object',
    properties: {
        level11: { type: ['number', 'null'] },
        level15: { type: ['number', 'null'] },
        level16: { type: ['number', 'null'] },
    },
    required: ['level11', 'level15', 'level16'],
};

/**
 * Reusable schema definition for statistics that must be null.
 * Used for stats objects on cards where those stats are not applicable (e.g., evolution stats for an unevolved card).
 * @type {object}
 */
const levelBasedNullStats = {
    type: 'object',
    properties: {
        level11: { const: null },
        level15: { const: null },
        level16: { const: null },
    },
    required: ['level11', 'level15', 'level16'],
    additionalProperties: false,
};

/**
 * Reusable schema definition for the skills object.
 * Each key is a skill type and its value is an object with specific fields.
 * @type {object}
 */
const skillsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        heal: {
            type: 'object',
            properties: {
                perAttack: { ...levelBasedStats },
                frequency: { type: ['number', 'null'] },
                overHeal: { ...levelBasedStats },
                onSpawn: { ...levelBasedStats },
            },
            required: ['perAttack', 'frequency', 'overHeal', 'onSpawn'],
            additionalProperties: false,
        },
        stun: {
            type: 'object',
            properties: {
                hitSpeedMultiplier: { type: ['number', 'null'] },
                speedMultiplier: { type: ['number', 'null'] },
                spawnSpeedMultiplier: { type: ['number', 'null'] },
                duration: { type: ['number', 'null'] },
            },
            required: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
            additionalProperties: false,
        },
        slow: {
            type: 'object',
            properties: {
                hitSpeedMultiplier: { type: ['number', 'null'] },
                speedMultiplier: { type: ['number', 'null'] },
                spawnSpeedMultiplier: { type: ['number', 'null'] },
                duration: { type: ['number', 'null'] },
            },
            required: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
            additionalProperties: false,
        },
        pushback: {
            type: 'object',
            properties: {
                distance: { type: ['number', 'null'] },
                strength: { type: ['number', 'null'] },
            },
            required: ['distance', 'strength'],
            additionalProperties: false,
        },
        shield: {
            type: 'object',
            properties: {
                hitpoints: { ...levelBasedStats },
                damageReductionPercent: { type: ['number', 'null'] },
            },
            required: ['hitpoints', 'damageReductionPercent'],
            additionalProperties: false,
        },
        dash: {
            type: 'object',
            properties: {
                damage: { ...levelBasedStats },
                minRange: { type: ['number', 'null'] },
                maxRange: { type: ['number', 'null'] },
            },
            required: ['damage', 'minRange', 'maxRange'],
            additionalProperties: false,
        },
        jump: {
            type: 'object',
            properties: {
                height: { type: ['number', 'null'] },
                speed: { type: ['number', 'null'] },
            },
            required: ['height', 'speed'],
            additionalProperties: false,
        },
        invisibility: {
            type: 'object',
            properties: {
                whenNotAttackingTime: { type: ['number', 'null'] },
            },
            required: ['whenNotAttackingTime'],
            additionalProperties: false,
        },
        'spawn-on-death': {
            type: 'object',
            properties: {
                character: { type: ['string', 'boolean', 'null'] },
                damage: { ...levelBasedStats },
                radius: { type: ['number', 'null'] },
                deployTime: { type: ['number', 'null'] },
            },
            required: ['character', 'damage', 'radius', 'deployTime'],
            additionalProperties: false,
        },
        'periodic-spawn': {
            type: 'object',
            properties: {
                pauseTime: { type: ['number', 'null'] },
                character: { type: ['string', 'null'] },
                units: { type: ['number', 'null'] },
            },
            required: ['pauseTime', 'character', 'units'],
            additionalProperties: false,
        },
        'area-damage-on-death': {
            type: 'object',
            properties: {
                areaEffect: { type: ['string', 'boolean', 'null'] },
                damage: { ...levelBasedStats },
                radius: { type: ['number', 'null'] },
            },
            required: ['areaEffect', 'damage', 'radius'],
            additionalProperties: false,
        },
        ability: {
            type: 'object',
            properties: {
                name: { type: ['string', 'null'] },
                elixirCost: { type: ['number', 'null'] },
                cooldown: { type: ['number', 'null'] },
            },
            required: ['name', 'elixirCost', 'cooldown'],
            additionalProperties: false,
        },
        pierce: {
            type: 'object',
            properties: {
                radius: { type: ['number', 'null'] },
                range: { type: ['number', 'null'] },
            },
            required: ['radius', 'range'],
            additionalProperties: false,
        },
    },
};

/**
 * Schema for the `statsEvo` object when a card has an evolution (`evolution: true`).
 * It requires `cycles` to be a number, and `damage` and `hitpoints` to follow the level-based structure.
 * @type {object}
 */
const evolvedStatsSchema = {
    type: 'object',
    properties: {
        cycles: { type: 'number', minimum: 1 },
        skills: { ...skillsSchema },
        damage: { ...levelBasedStats },
        hitpoints: { ...levelBasedStats },
    },
    required: ['cycles', 'skills', 'damage', 'hitpoints'],
    additionalProperties: false,
};

/**
 * Schema for the `statsEvo` object when a card does NOT have an evolution (`evolution: false`).
 * It enforces that all properties within this object must be null.
 * @type {object}
 */
const unevolvedStatsSchema = {
    type: 'object',
    properties: {
        cycles: { const: null },
        skills: { type: 'object', maxProperties: 0 },
        damage: { ...levelBasedNullStats },
        hitpoints: { ...levelBasedNullStats },
    },
    required: ['cycles', 'skills', 'damage', 'hitpoints'],
    additionalProperties: false,
};

/**
 * Schema for the `statsHero` object when a card is a hero (`hero: true`).
 * @type {object}
 */
const heroStatsSchema = {
    type: 'object',
    properties: {
        prestigeCost: { type: 'number', minimum: 1 },
        skills: { ...skillsSchema },
    },
    required: ['prestigeCost', 'skills'],
    additionalProperties: false,
};

/**
 * Schema for the `statsHero` object when a card is NOT a hero (`hero: false`).
 * @type {object}
 */
const nonHeroStatsSchema = {
    type: 'object',
    properties: {
        prestigeCost: { const: null },
        skills: { type: 'object', maxProperties: 0 },
    },
    required: ['prestigeCost', 'skills'],
    additionalProperties: false,
};


/**
 * Defines the schema for an individual card object within the `cards` and `towerCards` arrays.
 * It specifies the data type and constraints for each card property.
 * @type {object}
 */
const cardObjectSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string' },
        id: { type: 'number' },
        elixirCost: { type: 'number' },
        targets: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['ground', 'air', 'buildings'],
            },
        },
        units: { type: 'number' },
        duration: { type: ['number', 'null'] },
        evolution: { type: 'boolean' },
        hero: { type: 'boolean' },
        typeAttack: { type: ['string', 'null'] },
        projectile: { type: 'boolean' },
        suicide: { type: 'boolean' },
        skills: { ...skillsSchema },
        fatalDamage: { ...levelBasedStats },
        chargeDamage: { ...levelBasedStats },
        towerDamage: { ...levelBasedStats },
        damage: { ...levelBasedStats },
        hitpoints: { ...levelBasedStats },
        statsEvo: { type: 'object' },
        statsHero: { type: 'object' },
        hitspeed: { type: ['number', 'null'] },
        radius: { type: ['number', 'null'] },
        generationSpeed: { type: ['number', 'null'] },
        generationUnits: { type: ['number', 'null'] },
        speed: {
            type: ['string', 'null'],
            enum: ['slow', 'medium', 'fast', 'very-fast', null],
        },
        range: { type: ['number', 'null'] },
        territory: {
            type: 'string',
            enum: ['wide', 'restricted'],
        },
        rarity: {
            type: 'string',
            enum: ['common', 'rare', 'epic', 'legendary', 'champion'],
        },
        type: {
            type: 'string',
            enum: ['troop', 'building', 'spell', 'tower'],
        },
        unlockArena: { type: ['string', 'null'] },
        tribe: { type: ['string', 'null'] },
        deployTime: { type: ['number', 'null'] },
        sightRange: { type: ['number', 'null'] },
        collisionRadius: { type: ['number', 'null'] },
        loadTime: { type: ['number', 'null'] },
    },
    allOf: [
        {
            if: {
                properties: { evolution: { const: true } },
            },
            then: {
                properties: { statsEvo: evolvedStatsSchema },
            },
            else: {
                properties: { statsEvo: unevolvedStatsSchema },
            },
        },
        {
            if: {
                properties: { hero: { const: true } },
            },
            then: {
                properties: { statsHero: heroStatsSchema },
            },
            else: {
                properties: { statsHero: nonHeroStatsSchema },
            },
        },
    ],
    required: [
        'name', 'id', 'elixirCost', 'targets', 'units', 'duration',
        'evolution', 'hero', 'typeAttack', 'projectile', 'suicide', 'skills', 'fatalDamage',
        'chargeDamage', 'towerDamage', 'damage', 'hitpoints', 'statsEvo', 'statsHero',
        'hitspeed', 'radius', 'generationSpeed', 'generationUnits', 'speed',
        'range', 'territory', 'rarity', 'type', 'unlockArena', 'tribe',
        'deployTime', 'sightRange', 'collisionRadius', 'loadTime',
    ],
};

/**
 * Schema for an array of card objects.
 * @type {object}
 */
const cardArraySchema = {
    type: 'array',
    items: cardObjectSchema,
};

/**
 * The main schema for the root `cards.json` object.
 * It requires `cards` and `towerCards` properties, both of which must be arrays of cards.
 * @type {object}
 */
const cardSchema = {
    type: 'object',
    properties: {
        cards: cardArraySchema,
        towerCards: cardArraySchema,
    },
    required: ['cards', 'towerCards'],
};

module.exports = { cardSchema };
