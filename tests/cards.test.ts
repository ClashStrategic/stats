import { describe, it, expect, beforeAll } from 'vitest';
import Ajv from 'ajv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import cardsDataJson from '../data/cards.json' with { type: 'json' };
import { cardSchema } from '../src/schema.js';
import { CardsJson, Card, Levels } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cardsData = cardsDataJson as unknown as CardsJson;

describe('Card Data Validation', () => {
  const allCards: Card[] = [...cardsData.cards, ...cardsData.towerCards];

  const checkLevelBasedStats = (statObject: Levels) => {
    if (statObject.level11 !== null) expect(Number.isInteger(statObject.level11)).toBe(true);
    if (statObject.level15 !== null) expect(Number.isInteger(statObject.level15)).toBe(true);
    if (statObject.level16 !== null) expect(Number.isInteger(statObject.level16)).toBe(true);
  };

  describe('Schema and Structural Validation', () => {
    let ajv: Ajv;

    beforeAll(() => {
      ajv = new Ajv({ 
        allErrors: true,
        strict: false
      });
    });

    it('should validate the entire cards.json structure against the schema', () => {
      const validate = ajv.compile(cardSchema);
      const valid = validate(cardsData);

      if (!valid) {
        console.error('AJV Validation Errors:', JSON.stringify(validate.errors, null, 2));
      }

      expect(validate.errors).toBeNull();
    });

    it('should have a non-empty "cards" array', () => {
      expect(cardsData.cards).toBeDefined();
      expect(Array.isArray(cardsData.cards)).toBe(true);
      expect(cardsData.cards.length).toBeGreaterThan(0);
    });

    it('should have a "towerCards" array', () => {
      expect(cardsData.towerCards).toBeDefined();
      expect(Array.isArray(cardsData.towerCards)).toBe(true);
    });
  });

  describe('Data Uniqueness and Integrity', () => {
    it('should have unique IDs and names for all cards', () => {
      const ids = allCards.map((card) => card.id);
      const names = allCards.map((card) => card.name);

      const uniqueIds = new Set(ids);
      const uniqueNames = new Set(names);

      expect(uniqueIds.size).toBe(ids.length);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('Data Formatting Rules', () => {
    it('should use floats for fields that can have decimal values', () => {
      const jsonPath = path.join(__dirname, '..', 'data', 'cards.json');
      const rawJson = fs.readFileSync(jsonPath, 'utf-8');
      const fieldsToCheck = ['duration', 'hitspeed', 'range', 'radius', 'deployTime', 'loadTime', 'sightRange', 'collisionRadius'];
      const allMismatches: string[] = [];

      fieldsToCheck.forEach((field) => {
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

    it.each(allCards)('Card "$name" should use integers for integer-only fields', (card) => {
      const integerFields: (keyof Card)[] = ['id', 'elixirCost', 'units'];
      integerFields.forEach((field) => {
        expect(Number.isInteger(card[field])).toBe(true);
      });



      if (card.evoStats.cycles !== null) {
        expect(Number.isInteger(card.evoStats.cycles)).toBe(true);
      }

      checkLevelBasedStats(card.towerDamage);
      checkLevelBasedStats(card.damage);
      checkLevelBasedStats(card.hitpoints);
      checkLevelBasedStats(card.evoStats.damage);
      checkLevelBasedStats(card.evoStats.hitpoints);
    });
  });

  describe('Type-Specific Logic', () => {
    const troops = allCards.filter((c) => c.type === 'troop');
    const buildings = allCards.filter((c) => c.type === 'building');
    const spellsWithUnits = allCards.filter((c) => c.type === 'spell' && c.units > 0);
    const spellsWithoutUnits = allCards.filter((c) => c.type === 'spell' && c.units === 0);

    it.each(troops)('Troop card "$name" should follow troop-specific rules', (card) => {
      expect(card.units).not.toBeNull();
      expect(card.units).toBeGreaterThanOrEqual(1);
      expect(card.speed).not.toBeNull();
      expect(card.hitspeed).not.toBeNull();
      expect(card.hitpoints.level11).not.toBeNull();
      expect(card.hitpoints.level15).not.toBeNull();
      expect(card.hitpoints.level16).not.toBeNull();
    });

    it.each(buildings)('Building card "$name" should follow building-specific rules', (card) => {
      if (!card.skills['periodic-spawn']) {
        expect(typeof card.duration).toBe('number');
        expect(card.duration).not.toBeNull();
      }
    });

    it.each(spellsWithUnits)('Spell card "$name" (with units) should have valid unit stats', (card) => {
      expect(card.damage.level11).not.toBeNull();
      expect(card.damage.level15).not.toBeNull();
      expect(card.damage.level16).not.toBeNull();
      expect(card.hitpoints.level11).not.toBeNull();
      expect(card.hitpoints.level15).not.toBeNull();
      expect(card.hitpoints.level16).not.toBeNull();
    });

    it.each(spellsWithoutUnits)('Spell card "$name" (no units) should have null hitpoints', (card) => {
      expect(card.damage.level11).not.toBeNull();
      expect(card.damage.level15).not.toBeNull();
      expect(card.damage.level16).not.toBeNull();
      expect(card.towerDamage.level11).not.toBeNull();
      expect(card.towerDamage.level15).not.toBeNull();
      expect(card.towerDamage.level16).not.toBeNull();
      expect(card.hitpoints.level11).toBeNull();
      expect(card.hitpoints.level15).toBeNull();
      expect(card.hitpoints.level16).toBeNull();
    });
  });

  describe('Evolution Logic', () => {
    const evolvedCards = allCards.filter((c) => c.evolution);

    it.each(evolvedCards)('Evolved card "$name" should have valid evolution stats', (card) => {
      const { evoStats, type, units } = card;

      expect(evoStats).toBeDefined();
      expect(evoStats.cycles).not.toBeNull();
      expect(Number.isInteger(evoStats.cycles)).toBe(true);
      expect(evoStats.damage).toBeDefined();
      expect(evoStats.damage.level11).not.toBeNull();
      expect(evoStats.damage.level15).not.toBeNull();
      expect(evoStats.damage.level16).not.toBeNull();

      if (type === 'spell' && units === 0) {
        expect(evoStats.hitpoints).toBeDefined();
        expect(evoStats.hitpoints.level11).toBeNull();
        expect(evoStats.hitpoints.level15).toBeNull();
        expect(evoStats.hitpoints.level16).toBeNull();
      } else {
        expect(evoStats.hitpoints).toBeDefined();
        expect(evoStats.hitpoints.level11).not.toBeNull();
        expect(evoStats.hitpoints.level15).not.toBeNull();
        expect(evoStats.hitpoints.level16).not.toBeNull();
      }
    });
  });

  describe('Hero Logic', () => {
    const heroCards = allCards.filter((c) => c.hero);

    it.each(heroCards)('Hero card "$name" should have valid hero stats', (card) => {
      const { heroStats } = card;

      expect(heroStats).toBeDefined();
    });
  });

  describe('Skill Validation', () => {
    const SKILL_KEYS: Record<string, string[]> = {
      heal: ['perAttack', 'frequency', 'overHeal', 'onSpawn'],
      stun: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
      slow: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
      pushback: ['distance', 'strength'],
      shield: ['hitpoints', 'damageReductionPercent'],
      dash: ['damage', 'minRange', 'maxRange'],
      charge: ['damage', 'range', 'speedMultiplier'],
      jump: ['height', 'speed'],
      invisibility: ['whenNotAttackingTime'],
      'spawn-on-death': ['character', 'damage', 'radius', 'deployTime'],
      'periodic-spawn': ['pauseTime', 'character', 'units'],
      'area-damage-on-death': ['areaEffect', 'damage', 'radius'],
      ability: ['name', 'elixirCost', 'cooldown'],
      pierce: ['radius', 'range'],
      boost: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
      burrow: ['duration'],
      multiply: ['units', 'interval', 'maxUnits'],
    };

    it.each(allCards)('Card "$name" should have consistent skill structures', (card) => {
      const skillsToValidate = [card.skills, card.evoStats.skills, card.heroStats.skills];

      skillsToValidate.forEach((skillsObj) => {
        Object.entries(skillsObj).forEach(([skillType, skillData]) => {
          const expectedKeys = SKILL_KEYS[skillType];
          expect(expectedKeys).toBeDefined();

          const actualKeys = Object.keys(skillData as object).sort();
          expect(actualKeys).toEqual([...expectedKeys].sort());

          expectedKeys.forEach((key) => {
            expect(skillData).toHaveProperty(key);

            const isLevelBasedSkill =
              (skillType === 'heal' && ['perAttack', 'overHeal', 'onSpawn'].includes(key)) ||
              (skillType === 'shield' && key === 'hitpoints') ||
              (skillType === 'dash' && key === 'damage') ||
              (skillType === 'charge' && key === 'damage') ||
              (skillType === 'spawn-on-death' && key === 'damage') ||
              (skillType === 'area-damage-on-death' && key === 'damage');

            if (isLevelBasedSkill) {
              checkLevelBasedStats((skillData as any)[key]);
            }
          });
        });
      });
    });
  });
});
