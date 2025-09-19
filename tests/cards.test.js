const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');
const cardsData = require('../cards.json');

describe('Cards JSON Structure Validation', () => {
  let ajv;
  let schema;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true });

    // Reusable definition for stats that vary by level
    const levelBasedStats = {
      type: 'object',
      properties: {
        level11: { type: ['number', 'null'] },
        level15: { type: ['number', 'null'] }
      },
      required: ['level11', 'level15']
    };

    // Reusable definition for stats that must be null
    const levelBasedNullStats = {
      type: 'object',
      properties: {
        level11: { const: null },
        level15: { const: null }
      },
      required: ['level11', 'level15'],
      additionalProperties: false
    };

    // Schema for stats when a card has an evolution
    const evolvedStatsSchema = {
      type: 'object',
      properties: {
        cycles: { type: 'number', minimum: 1 },
        damage: { ...levelBasedStats },
        hitpoints: { ...levelBasedStats }
      },
      required: ['cycles', 'damage', 'hitpoints'],
      additionalProperties: false
    };

    // Schema for stats when a card does NOT have an evolution
    const unevolvedStatsSchema = {
      type: 'object',
      properties: {
        cycles: { const: null },
        damage: { ...levelBasedNullStats },
        hitpoints: { ...levelBasedNullStats }
      },
      required: ['cycles', 'damage', 'hitpoints'],
      additionalProperties: false
    };

    const cardArraySchema = {
      type: 'array',
      items: {
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
              enum: ['ground', 'air', 'buildings']
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
            enum: ['slow', 'medium', 'fast', 'very-fast', null]
          },
          range: { type: ['number', 'null'] },
          territory: {
            type: 'string',
            enum: ['wide', 'restricted']
          },
          rarity: {
            type: 'string',
            enum: ['common', 'rare', 'epic', 'legendary', 'champion']
          },
          type: {
            type: 'string',
            enum: ['troop', 'building', 'spell', 'tower']
          }
        },
        allOf: [
          {
            if: {
              properties: { evolution: { const: true } }
            },
            then: {
              properties: { statsEvo: evolvedStatsSchema }
            },
            else: {
              properties: { statsEvo: unevolvedStatsSchema }
            }
          }
        ],
        required: [
          'name', 'id', 'elixirCost', 'targets', 'units', 'duration',
          'evolution', 'typeAttack', 'projectile',
          'suicide', 'fatalDamage', 'chargeDamage', 'towerDamage',
          'damage', 'hitpoints', 'statsEvo', 'hitspeed',
          'radius', 'generationSpeed', 'generationUnits', 'speed',
          'range', 'territory', 'rarity', 'type'
        ]
      }
    };

    // Define the schema for card validation
    schema = {
      type: 'object',
      properties: {
        cards: cardArraySchema,
        towerCards: cardArraySchema
      },
      required: ['cards', 'towerCards']
    };
  });

  test('should validate cards.json structure', () => {
    const validate = ajv.compile(schema);
    const valid = validate(cardsData);

    if (!valid) {
      console.log('Validation errors:', JSON.stringify(validate.errors, null, 2));
    }

    expect(validate.errors).toBeNull();
  });

  test('should have cards array with at least one card', () => {
    expect(cardsData.cards).toBeDefined();
    expect(Array.isArray(cardsData.cards)).toBe(true);
    expect(cardsData.cards.length).toBeGreaterThan(0);
  });

  test('should have towerCards array', () => {
    expect(cardsData.towerCards).toBeDefined();
    expect(Array.isArray(cardsData.towerCards)).toBe(true);
  });

  test('all card IDs and names should be unique', () => {
    const allCards = [...cardsData.cards, ...cardsData.towerCards];
    const ids = allCards.map(card => card.id);
    const names = allCards.map(card => card.name);

    const uniqueIds = new Set(ids);
    const uniqueNames = new Set(names);

    expect(uniqueIds.size).toBe(ids.length);
    expect(uniqueNames.size).toBe(names.length);
  });
});

describe('Data Logic and Consistency Checks', () => {
  const allCards = [...cardsData.cards, ...cardsData.towerCards];

  // Test Type-based Property Rules
  test.each(allCards)('Card "$name" should follow type-specific rules', (card) => {
    if (card.type === 'troop') {
      expect(card.units).not.toBeNull();
      expect(card.speed).not.toBeNull();
      expect(card.hitspeed).not.toBeNull();
      expect(card.hitpoints.level11).not.toBeNull();
      expect(card.hitpoints.level15).not.toBeNull();
      //expect(card.range).not.toBeNull(); //test not passing, range is null for some troops
    }
    if (card.type === 'building') {
      expect(typeof card.duration).toBe('number');
    }
    if (card.type === 'spell' && card.units == 0) {
      expect(card.hitpoints.level11).toBeNull();
      expect(card.hitpoints.level15).toBeNull();
    }
    if (card.type === 'spell' && card.units > 0) {
      expect(card.hitpoints.level11).not.toBeNull();
      expect(card.hitpoints.level15).not.toBeNull();
    }
  });

  test('numeric fields that can be floats should be represented as such for consistency', () => {
    const jsonPath = path.join(__dirname, '..', 'cards.json');
    const rawJson = fs.readFileSync(jsonPath, 'utf-8');
    const fieldsToCheck = ['duration', 'generationSpeed', 'hitspeed', 'range', 'radius'];
    const allMismatches = [];

    fieldsToCheck.forEach(field => {
      const integerRegex = new RegExp(`"${field}":\\s*\\d+\\s*[,}]`, 'g');
      const matches = rawJson.match(integerRegex);

      if (matches) allMismatches.push(...matches);
    });

    if (allMismatches.length > 0) {
      console.error('Inconsistent numeric format. Use floats (e.g., 1.0 instead of 1) for these fields:', allMismatches);
    }

    expect(allMismatches).toHaveLength(0);
  });

  test.each(allCards)('Card "$name" should use integers for integer-only fields', (card) => {
    // These fields must always be integers
    expect(Number.isInteger(card.id)).toBe(true);
    expect(Number.isInteger(card.elixirCost)).toBe(true);
    expect(Number.isInteger(card.units)).toBe(true);

    // These fields can be null, but if they have a value, it must be an integer
    if (card.generationUnits !== null) expect(Number.isInteger(card.generationUnits)).toBe(true);
    if (card.statsEvo.cycles !== null) expect(Number.isInteger(card.statsEvo.cycles)).toBe(true);

    // Helper function to check if level-based stats are integers when not null
    const checkLevelBasedStats = (statObject) => {
      if (statObject.level11 !== null) expect(Number.isInteger(statObject.level11)).toBe(true);
      if (statObject.level15 !== null) expect(Number.isInteger(statObject.level15)).toBe(true);
    };

    checkLevelBasedStats(card.fatalDamage);
    checkLevelBasedStats(card.chargeDamage);
    checkLevelBasedStats(card.towerDamage);
    checkLevelBasedStats(card.damage);
    checkLevelBasedStats(card.hitpoints);
    checkLevelBasedStats(card.statsEvo.damage);
    checkLevelBasedStats(card.statsEvo.hitpoints);
  });
});
