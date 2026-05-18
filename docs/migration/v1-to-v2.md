# Migration Guide: Stats v1 → v2
## Elevating Data Quality & Clean Architecture

Welcome to v2! This version introduces a major structural redesign of the Clash Royale card dataset. These changes are designed to eliminate technical debt, reduce payload sizes, enforce strict TypeScript typing, and group card mechanics logically under a unified polymorphic schema.

---

## Change Cheat Sheet

| # | Change | Category | v1 Property / Path | v2 Clean Path | Architectural Rationale |
|---|---|---|---|---|---|
| **1** | **CJS → ESM** | Configuration | `require("@clash-strategic/stats")` | `import { cards } from ...` | Industry-standard native module system, enabling efficient tree-shaking. |
| **2** | **Tower Segregation** | Structure | `cards.filter(c => c.type === 'tower')` | `towerCards` | Interface Segregation. Towers lack elixir, charges, and evolutions. Removes excessive nulls. |
| **3** | **Removed `level15`** | Clean Up | `damage.level15` | `level11` (base) & `level16` (max) | Level 16 is the new maximum level in v2. Level 15 is now an obsolete intermediate level. |
| **4** | **`typeAttack` → `hitType`** | Semantics | `card.typeAttack` ('unique' \| 'splash') | `card.hitType` | Describes the impact geometry (splash vs. single target), not the damage type. |
| **5** | **`territory` → `placement`** | Semantics | `card.territory` ('wide' \| 'restricted') | `card.placement` ('anywhere' \| 'own-side') | Better describes the player action of placing a card on the arena river layouts. |
| **6** | **`suicide` → `kamikaze`** | Semantics | `card.suicide` | `card.kamikaze` | Standard video game mechanics terminology and professional language sensitivity. |
| **7** | **Normalized Evo/Hero Keys** | Consistency | `evolutionStats` / `heroAbilities` | `evoStats` / `heroStats` | Symmetric and short prefixes that match TypeScript typing namespaces. |
| **8** | **`chargeDamage` → `skills`** | Polymorphism | `card.chargeDamage` | `card.skills.charge.damage` | SOLID design. Removes empty column pollution for the 95% of cards that cannot charge. |
| **9** | **Spawning → `skills`** | Polymorphism | `generationSpeed` / `generationUnits` | `card.skills['periodic-spawn']` | Cohesively groups spawner pause time, character spawned, and unit counts. |
| **10**| **Removed Legacy Fields** | Clean Up | `fatalDamage` | _(Removed)_ | Dead legacy weight without gameplay value or meta calculations utility. |
| **11**| **`prestigeCost` → `ability.elixirCost`** | Polymorphism | `card.prestigeCost` | `card.heroStats.skills.ability.elixirCost` | Integrated directly into the active ability skill definition where it conceptually belongs. |

---

## 1. Module System: CommonJS → ESM
**Commit:** `f33365e`

The package now distributes native **ECMAScript Modules (ESM)**. Support for CommonJS `require()` has been discontinued.

### Why It Matters
Modern JS/TS development relies on ESM. By switching to a pure ESM package, we avoid the *dual-package hazard*, reduce resolving bottlenecks, and allow modern bundlers (like Vite, Webpack 5, and Rollup) to perform static analysis and tree-shaking, pruning dead code from your production builds.

### Before
```js
// ❌ No longer works in v2
const { cards } = require("@clash-strategic/stats");
```

### After
```js
// ✅ Use standard ESM imports
import { cards } from "@clash-strategic/stats";

// ✅ Or use dynamic imports in legacy CommonJS environments
const { cards } = await import("@clash-strategic/stats");
```

> [!IMPORTANT]
> Make sure to add `"type": "module"` to your `package.json` or use the `.mjs` extension when running directly under Node.js.

---

## 2. Package Structure: Dedicated `towerCards` Array
**Commit:** `0a20582`

Crown towers and special structures (such as the King Tower, Princess Tower, and Cannoneer) are no longer mixed within the main `cards` array. They are now exposed in a pre-filtered, strictly typed separate array: `towerCards`.

### Why It Matters
**Interface Segregation**. A King Tower does not cost elixir, has no deploy time, has no evolutions, and has no placement restrictions. Mixing them in `cards` forced developers to write defensive filters (`cards.filter(...)`) and polluted the `Card` interface with optional fields that were always null for towers. 

In v2, `TowerCard` is a clean, strict subset (`Omit<Card, ...>`), protecting you from accessing invalid properties in compilation time.

### Before
```ts
// ❌ Error-prone defensive manual filtering
import { cards } from "@clash-strategic/stats";

const towers = cards.filter((c) => c.type === "tower");
const king = towers.find((t) => t.name === "King Tower");

// TypeScript allowed this, but it resolved to null in runtime
console.log(king.elixirCost); 
```

### After
```ts
// ✅ Import dedicated, cleanly segregated collections
import { cards, towerCards } from "@clash-strategic/stats";

const king = towerCards.find((t) => t.name === "King Tower");

// ❌ TypeScript compilation error! 'elixirCost' does not exist on 'TowerCard'.
console.log(king.elixirCost); 

// ✅ Compile-safe access to real properties
console.log(king.hitpoints.level11);
```

---

## 3. Removed: `level15` Stats
**Commit:** `a4d3fda`

The `Levels` interface has been simplified. It now contains only `level11` and `level16`. `level15` has been removed from all stat objects and schemas.

### Why It Matters
In v2, **Level 16 is now the maximum level** (e.g. Mirror boost), whereas Level 15 was the maximum level in v1. Since Level 16 is the new maximum, Level 15 has become an obsolete intermediate level and has been safely eliminated to keep the schema clean and concise. Level 11 remains the tournament competitive standard.

### Before
```ts
// ❌ Property deleted
const maxDmg = card.damage.level15;
```

### After
```ts
// ✅ Level 11 for standard balance, Level 16 for peak max values
const standardDmg = card.damage.level11;
const maxDmg = card.damage.level16;
```

---

## 4. Renamed: `typeAttack` → `hitType`
**Commit:** `8e56b7a`

The field classifying the card's hit distribution pattern was renamed to `hitType` for semantic precision.

### Why It Matters
"typeAttack" is grammatically ambiguous (it could represent melee vs. ranged, or magic vs. physical). What the property actually represents is the **geometry of the hit impact** ('unique' or 'splash'). The industry-standard terminology in strategy games is `hitType`.

### Before
```ts
// ❌
if (card.typeAttack === "splash") { ... }
```

### After
```ts
// ✅
if (card.hitType === "splash") { ... }
```

---

## 5. Renamed: `territory` → `placement`
**Commit:** `c985760`

The field name was renamed to `placement`, and its values migrated to better fit the physical arena rules.

- `'wide'` → `'anywhere'`
- `'restricted'` → `'own-side'`

### Why It Matters
"Territory" represents geographic ownership. In placement-based card games, the mechanism is the **placement** rules. Furthermore, `wide` and `restricted` were counter-intuitive; `anywhere` (can be deployed anywhere on the arena) and `own-side` (only on the player's side of the river) are descriptive and precise.

### Before
```ts
// ❌ Old property and value
if (card.territory === "restricted") { ... }
```

### After
```ts
// ✅ Clean semantic naming
if (card.placement === "own-side") { ... }
```

---

## 6. Renamed: `suicide` → `kamikaze`
**Commit:** `179a669`

The boolean property indicating whether a unit self-destructs on impact has been renamed from `suicide` to `kamikaze`.

### Why It Matters
"Suicide" carries heavy clinical and social connotations that are highly sensitive in public APIs. In game design, entities that explode or destroy themselves on impact to deal damage are standardly called **kamikaze** units.

### Before
```ts
// ❌
if (card.suicide) { ... }
```

### After
```ts
// ✅
if (card.kamikaze) { ... }
```

---

## 7. Renamed: Evolution and Hero Stat Keys
**Commit:** `0c498b8`

Nested sub-objects representing specialized card configurations have been shortened to match their TypeScript namespaces.

- `evolutionStats` → `evoStats`
- `heroAbilities` → `heroStats`

### Why It Matters
In v1, naming was inconsistent. One key was extremely descriptive and plural, while the other was a custom verb. We normalized these to `evoStats` and `heroStats` to preserve architectural symmetry and type readability.

### Before
```ts
// ❌ Inconsistent naming
const cycles = card.evolutionStats.cycles;
const heroAbility = card.heroAbilities.skills;
```

### After
```ts
// ✅ Compact and predictable
const cycles = card.evoStats.cycles;
const heroAbility = card.heroStats.skills;
```

---

## 8. Removed: `chargeDamage` — Migrated to `skills`
**Commit:** `742a53f`

`chargeDamage` is no longer a top-level field. Charging mechanics are now represented under the polymorphic `skills` map under the `'charge'` key.

### Why It Matters
**SOLID Single Responsibility Principle**. In v1, 95% of cards had to declare `chargeDamage: null` because they were not charging units. In v2, special mechanics are dynamic. If a card charges, it populates a `ChargeSkill` inside its `skills` map, grouping all charging values cohesively (damage, charge activation range, and speed multiplier). Otherwise, the field is omitted entirely.

### Before
```ts
// ❌ Redundant top-level property
const chargeDmg = card.chargeDamage; 
```

### After
```ts
// ✅ Accessed via polymorphically mapped skill schemas
const chargeSkill = card.skills.charge;

if (chargeSkill) {
  const chargeDmg = chargeSkill.damage.level11;
  const activatedMultiplier = chargeSkill.speedMultiplier;
}
```

---

## 9. Removed: `generationSpeed` and `generationUnits` — Migrated to `skills`
**Commit:** `17d6b5f`

Top-level spawning properties have been absorbed into the polymorphic `skills` map under the `'periodic-spawn'` key.

### Why It Matters
Just like charging, spawning is a special mechanic. In v2, this is represented by `PeriodicSpawnSkill`, grouping the pause duration between spawns (`pauseTime`), the unit character spawned (`character`), and the amount of units spawned per cycle (`units`).

### Before
```ts
// ❌ Redundant top-level properties
const pause = card.generationSpeed;
const unitsCount = card.generationUnits;
```

### After
```ts
// ✅ Safe structural mapping
const spawner = card.skills["periodic-spawn"];

if (spawner) {
  console.log(`Spawns ${spawner.units} ${spawner.character} every ${spawner.pauseTime}s`);
}
```

---

## 10. Removed: `fatalDamage`
**Commit:** `cbf3b2f`

`fatalDamage` has been completely deleted without a direct replacement. 

### Why It Matters
**YAGNI (You Aren't Gonna Need It)**. This legacy field had no active utility in simulation or battle interactions calculations, and was often a redundant duplicate of other death effects. Cleaning up unused fields reduces mental mapping overhead.

---

## 11. Removed: `prestigeCost` on Heroes — Migrated to `ability.elixirCost`
**Commit:** `558e88f`

The hero card property `prestigeCost` has been completely removed.

### Why It Matters
`prestigeCost` was historically used to represent the activation cost of the hero's special ability. In v2, this cost is now declared directly inside the active `ability` skill definition under `elixirCost` (accessible via `card.heroStats.skills.ability.elixirCost`). Since it now belongs to its correct skill schema, the redundant, top-level `prestigeCost` field has been deleted.

### Before
```ts
// ❌ Hero cost represented by obsolete top-level key
const abilityCost = heroCard.prestigeCost;
```

### After
```ts
// ✅ Cost declared inside its correct active ability skill schema
const activeAbility = heroCard.heroStats.skills.ability;

if (activeAbility) {
  const elixirCost = activeAbility.elixirCost; // e.g. 1
  console.log(`Activating special ability costs ${elixirCost} elixir.`);
}
```

---

## Migration Checklist

Follow these systematic steps to update your codebase to v2:

- [ ] **Configuration:** Shift your application to ESM. Declare `"type": "module"` in `package.json`.
- [ ] **TypeScript Types:** Update import definitions and remove references to `Levels.level15`.
- [ ] **Towers:** Re-write `cards.filter(c => c.type === 'tower')` filters to import and use the pre-filtered `towerCards` array directly.
- [ ] **Search & Replace Fields:**
  - [ ] Search `typeAttack` → Replace with `hitType`
  - [ ] Search `territory` → Replace with `placement`
  - [ ] Update placement values: `'wide'` → `'anywhere'`, and `'restricted'` → `'own-side'`.
  - [ ] Search `suicide` → Replace with `kamikaze`
  - [ ] Search `evolutionStats` → Replace with `evoStats`
  - [ ] Search `heroAbilities` → Replace with `heroStats`
- [ ] **Polymorphic Skills:**
  - [ ] Migrate `chargeDamage` access to `skills.charge.damage`.
  - [ ] Migrate spawner properties (`generationSpeed` / `generationUnits`) to `skills['periodic-spawn']`.
  - [ ] Migrate `prestigeCost` to the `elixirCost` property inside the hero active ability skill (`heroStats.skills.ability.elixirCost`).
- [ ] **Remove Deprecated Fields:** Delete all read and write usages of `fatalDamage` and `prestigeCost` top-level properties.
