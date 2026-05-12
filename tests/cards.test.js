/**
 * @fileoverview Test suite for validating the cards.json file.
 * This file contains tests for schema validation, data integrity,
 * and logical consistency of the card data.
 */

'use strict';

const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');
const cardsData = require('../cards.json');
const { cardSchema } = require('./card.schema.spec.js');

/**
 * @describe Main test suite for all card-related validations.
 */
describe('Card Data Validation', () => {
  const allCards = [...cardsData.cards, ...cardsData.towerCards];

  /**
   * Helper function to check if level-based stat values are integers (if not null).
   * @param {object} statObject - The stat object (e.g., card.damage).
   */
  const checkLevelBasedStats = (statObject) => {
    if (statObject.level11 !== null) expect(Number.isInteger(statObject.level11)).toBe(true);
    if (statObject.level15 !== null) expect(Number.isInteger(statObject.level15)).toBe(true);
    if (statObject.level16 !== null) expect(Number.isInteger(statObject.level16)).toBe(true);
  };

  /**
   * @describe Tests related to the structure and schema of cards.json.
   */
  describe('Schema and Structural Validation', () => {
    let ajv;

    beforeAll(() => {
      ajv = new Ajv({ allErrors: true });
    });

    /**
     * @it Validates the entire cards.json object against the defined schema.
     * This is the primary check to ensure the overall structure is correct.
     */
    it('should validate the entire cards.json structure against the schema', () => {
      const validate = ajv.compile(cardSchema);
      const valid = validate(cardsData);

      if (!valid) {
        // Log detailed errors to the console for easier debugging.
        console.error('AJV Validation Errors:', JSON.stringify(validate.errors, null, 2));
      }

      expect(validate.errors).toBeNull();
    });

    /**
     * @it Ensures that the 'cards' array exists and is not empty.
     */
    it('should have a non-empty "cards" array', () => {
      expect(cardsData.cards).toBeDefined();
      expect(Array.isArray(cardsData.cards)).toBe(true);
      expect(cardsData.cards.length).toBeGreaterThan(0);
    });

    /**
     * @it Ensures that the 'towerCards' array exists. It can be empty.
     */
    it('should have a "towerCards" array', () => {
      expect(cardsData.towerCards).toBeDefined();
      expect(Array.isArray(cardsData.towerCards)).toBe(true);
    });
  });

  /**
   * @describe Tests for data uniqueness and integrity across all cards.
   */
  describe('Data Uniqueness and Integrity', () => {
    /**
     * @it Checks that all card IDs and names are unique across both 'cards' and 'towerCards'.
     * This prevents data conflicts and ensures each card is uniquely identifiable.
     */
    it('should have unique IDs and names for all cards', () => {
      const ids = allCards.map((card) => card.id);
      const names = allCards.map((card) => card.name);

      const uniqueIds = new Set(ids);
      const uniqueNames = new Set(names);

      expect(uniqueIds.size).toBe(ids.length);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  /**
   * @describe Contains tests for validating the correct data types (integer/float) for numeric fields.
   */
  describe('Data Formatting Rules', () => {
    /**
     * @it Verifies that fields intended to be floats are not represented as integers in the raw JSON file.
     * This enforces a consistent data format (e.g., `1.0` instead of `1`).
     */
    it('should use floats for fields that can have decimal values', () => {
      const jsonPath = path.join(__dirname, '..', 'cards.json');
      const rawJson = fs.readFileSync(jsonPath, 'utf-8');
      const fieldsToCheck = ['duration', 'generationSpeed', 'hitspeed', 'range', 'radius'];
      const allMismatches = [];

      fieldsToCheck.forEach((field) => {
        // Regex to find fields with integer values (e.g., "hitspeed": 1) instead of float (e.g., "hitspeed": 1.0)
        const integerRegex = new RegExp(`"${field}":\\s*\\d+\\s*[,}]`, 'g');
        const matches = rawJson.match(integerRegex);
        if (matches) {
          allMismatches.push(...matches);
        }
      });

      if (allMismatches.length > 0) {
        console.error('Inconsistent Numeric Format: Use floats (e.g., 1.0) for these fields:', allMismatches);
      }

      expect(allMismatches).toHaveLength(0);
    });

    /**
     * @it Validates that numeric fields expected to be integers are, in fact, integers.
     * @param {object} card - The card object to test, provided by `test.each`.
     */
    it.each(allCards)('Card "$name" should use integers for integer-only fields', (card) => {
      const integerFields = ['id', 'elixirCost', 'units'];
      integerFields.forEach((field) => {
        expect(Number.isInteger(card[field])).toBe(true);
      });

      if (card.generationUnits !== null) {
        expect(Number.isInteger(card.generationUnits)).toBe(true);
      }

      if (card.statsEvo.cycles !== null) {
        expect(Number.isInteger(card.statsEvo.cycles)).toBe(true);
      }

      if (card.statsHero.prestigeCost !== null) {
        expect(Number.isInteger(card.statsHero.prestigeCost)).toBe(true);
      }

      checkLevelBasedStats(card.fatalDamage);
      checkLevelBasedStats(card.chargeDamage);
      checkLevelBasedStats(card.towerDamage);
      checkLevelBasedStats(card.damage);
      checkLevelBasedStats(card.hitpoints);
      checkLevelBasedStats(card.statsEvo.damage);
      checkLevelBasedStats(card.statsEvo.hitpoints);
    });
  });

  /**
   * @describe Tests for logical rules specific to each card type (Troop, Building, Spell).
   */
  describe('Type-Specific Logic', () => {
    const troops = allCards.filter((c) => c.type === 'troop');
    const buildings = allCards.filter((c) => c.type === 'building');
    const spellsWithUnits = allCards.filter((c) => c.type === 'spell' && c.units > 0);
    const spellsWithoutUnits = allCards.filter((c) => c.type === 'spell' && c.units === 0);

    /**
     * @it Validates rules specific to troop cards.
     * @param {object} card - The card object to test.
     */
    it.each(troops)('Troop card "$name" should follow troop-specific rules', (card) => {
      expect(card.units).not.toBeNull();
      expect(card.units).toBeGreaterThanOrEqual(1);
      expect(card.speed).not.toBeNull();
      expect(card.hitspeed).not.toBeNull();
      expect(card.hitpoints.level11).not.toBeNull();
      expect(card.hitpoints.level15).not.toBeNull();
      expect(card.hitpoints.level16).not.toBeNull();
    });

    /**
     * @it Validates rules specific to building cards.
     * @param {object} card - The card object to test.
     */
    it.each(buildings)('Building card "$name" should follow building-specific rules', (card) => {
      // Buildings that are not spawners might have null duration (e.g., Elixir Collector)
      if (card.generationSpeed === null) {
        expect(typeof card.duration).toBe('number');
        expect(card.duration).not.toBeNull();
      }
    });

    /**
     * @it Validates rules for spells that spawn units (e.g., Graveyard).
     * @param {object} card - The card object to test.
     */
    it.each(spellsWithUnits)('Spell card "$name" (with units) should have valid unit stats', (card) => {
      expect(card.damage.level11).not.toBeNull();
      expect(card.damage.level15).not.toBeNull();
      expect(card.damage.level16).not.toBeNull();
      expect(card.hitpoints.level11).not.toBeNull();
      expect(card.hitpoints.level15).not.toBeNull();
      expect(card.hitpoints.level16).not.toBeNull();
    });

    /**
     * @it Validates rules for spells that do not spawn units (e.g., Fireball).
     * @param {object} card - The card object to test.
     */
    it.each(spellsWithoutUnits)('Spell card "$name" (no units) should have null hitpoints', (card) => {
      expect(card.damage.level11).not.toBeNull();
      expect(card.damage.level15).not.toBeNull();
      expect(card.damage.level16).not.toBeNull();
      expect(card.towerDamage.level11).not.toBeNull();
      expect(card.towerDamage.level15).not.toBeNull();
      expect(card.towerDamage.level16).not.toBeNull();
      // Direct damage spells should not have their own hitpoints.
      expect(card.hitpoints.level11).toBeNull();
      expect(card.hitpoints.level15).toBeNull();
      expect(card.hitpoints.level16).toBeNull();
      expect(card.chargeDamage.level11).toBeNull();
      expect(card.fatalDamage.level11).toBeNull();
    });
  });

  /**
   * @describe Tests for logic related to card evolutions.
   */
  describe('Evolution Logic', () => {
    const evolvedCards = allCards.filter((c) => c.evolution);

    /**
     * @it Ensures that evolved cards have valid and logical evolution stats (`statsEvo`).
     * @param {object} card - The evolved card object to test.
     */
    it.each(evolvedCards)('Evolved card "$name" should have valid evolution stats', (card) => {
      const { statsEvo, type, units } = card;

      expect(statsEvo).toBeDefined();
      expect(statsEvo.cycles).not.toBeNull();
      expect(Number.isInteger(statsEvo.cycles)).toBe(true);
      expect(statsEvo.damage).toBeDefined();
      expect(statsEvo.damage.level11).not.toBeNull();
      expect(statsEvo.damage.level15).not.toBeNull();
      expect(statsEvo.damage.level16).not.toBeNull();

      // Spells without units (e.g., evolved Zap) should not have evolved hitpoints.
      if (type === 'spell' && units === 0) {
        expect(statsEvo.hitpoints).toBeDefined();
        expect(statsEvo.hitpoints.level11).toBeNull();
        expect(statsEvo.hitpoints.level15).toBeNull();
        expect(statsEvo.hitpoints.level16).toBeNull();
      } else {
        // All other evolved cards (troops, buildings, unit-spawning spells) must have hitpoints.
        expect(statsEvo.hitpoints).toBeDefined();
        expect(statsEvo.hitpoints.level11).not.toBeNull();
        expect(statsEvo.hitpoints.level15).not.toBeNull();
        expect(statsEvo.hitpoints.level16).not.toBeNull();
      }
    });
  });

  /**
   * @describe Tests for logic related to card heroes.
   */
  describe('Hero Logic', () => {
    const heroCards = allCards.filter((c) => c.hero);

    /**
     * @it Ensures that hero cards have valid hero stats (`statsHero`).
     * @param {object} card - The hero card object to test.
     */
    it.each(heroCards)('Hero card "$name" should have valid hero stats', (card) => {
      const { statsHero } = card;

      expect(statsHero).toBeDefined();
      expect(statsHero.prestigeCost).not.toBeNull();
      expect(Number.isInteger(statsHero.prestigeCost)).toBe(true);
      expect(statsHero.prestigeCost).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * @describe Validates that skills follow the keyed object structure and are consistent.
   */
  describe('Skill Validation', () => {
    const SKILL_KEYS = {
      heal: ['perAttack', 'frequency', 'overHeal', 'onSpawn'],
      stun: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
      slow: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
      pushback: ['distance', 'strength'],
      shield: ['hitpoints', 'damageReductionPercent'],
      dash: ['damage', 'minRange', 'maxRange'],
      jump: ['height', 'speed'],
      invisibility: ['whenNotAttackingTime'],
      'spawn-on-death': ['character', 'damage', 'radius', 'deployTime'],
      'periodic-spawn': ['pauseTime', 'character', 'units'],
      'area-damage-on-death': ['areaEffect', 'damage', 'radius'],
      ability: ['name', 'elixirCost', 'cooldown'],
      pierce: ['radius', 'range'],
    };

    it.each(allCards)('Card "$name" should have consistent skill structures', (card) => {
      const skillsToValidate = [card.skills, card.statsEvo.skills, card.statsHero.skills];

      skillsToValidate.forEach((skillsObj) => {
        Object.entries(skillsObj).forEach(([skillType, skillData]) => {
          const expectedKeys = SKILL_KEYS[skillType];
          expect(expectedKeys).toBeDefined();

          const actualKeys = Object.keys(skillData).sort();
          expect(actualKeys).toEqual([...expectedKeys].sort());

          expectedKeys.forEach((key) => {
            expect(skillData).toHaveProperty(key);

            const isLevelBasedSkill =
              (skillType === 'heal' && ['perAttack', 'overHeal', 'onSpawn'].includes(key)) ||
              (skillType === 'shield' && key === 'hitpoints') ||
              (skillType === 'dash' && key === 'damage') ||
              (skillType === 'spawn-on-death' && key === 'damage') ||
              (skillType === 'area-damage-on-death' && key === 'damage');

            if (isLevelBasedSkill) {
              checkLevelBasedStats(skillData[key]);
            }
          });
        });
      });
    });
  });
});
