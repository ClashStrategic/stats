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
    },
    required: ['level11', 'level15'],
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
    },
    required: ['level11', 'level15'],
    additionalProperties: false,
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
        damage: { ...levelBasedStats },
        hitpoints: { ...levelBasedStats },
    },
    required: ['cycles', 'damage', 'hitpoints'],
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
        damage: { ...levelBasedNullStats },
        hitpoints: { ...levelBasedNullStats },
    },
    required: ['cycles', 'damage', 'hitpoints'],
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
        typeAttack: { type: ['string', 'null'] },
        projectile: { type: 'boolean' },
        suicide: { type: 'boolean' },
        fatalDamage: { ...levelBasedStats },
        chargeDamage: { ...levelBasedStats },
        towerDamage: { ...levelBasedStats },
        damage: { ...levelBasedStats },
        hitpoints: { ...levelBasedStats },
        statsEvo: { type: 'object' },
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
    ],
    required: [
        'name', 'id', 'elixirCost', 'targets', 'units', 'duration',
        'evolution', 'typeAttack', 'projectile', 'suicide', 'fatalDamage',
        'chargeDamage', 'towerDamage', 'damage', 'hitpoints', 'statsEvo',
        'hitspeed', 'radius', 'generationSpeed', 'generationUnits', 'speed',
        'range', 'territory', 'rarity', 'type',
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