# Migration Guide: Stats v1 → v2

This guide documents the **v2 public API**.

It focuses on what a consumer must change:

1. Stop using CommonJS `require()`.
2. Keep using the package export named `cards`, but treat it as a `CardsJson` object.
3. Rename and relocate the schema fields that changed in v2.
4. Remove reads of fields that no longer exist.

> [!IMPORTANT]
> In v2, the package does **not** export `towerCards` as a top-level named export.
> It exports `cards`, and that value is a `CardsJson` object with this shape:
>
> ```ts
> {
>   cards: Card[];
>   towerCards: TowerCard[];
> }
> ```

---

## Quick path

```ts
import { cards as stats } from '@clash-strategic/stats';

const battleCards = stats.cards;
const towerCards = stats.towerCards;
```

Then migrate these schema changes:

- `typeAttack` → `hitType`
- `territory` → `placement`
- `suicide` → `kamikaze`
- `evolutionStats` → `evoStats`
- `heroAbilities` → `heroStats`
- `chargeDamage` → `skills.charge.damage`
- `generationSpeed` / `generationUnits` → `skills['periodic-spawn']`
- `prestigeCost` → `heroStats.skills.ability.elixirCost`
- remove `fatalDamage`
- remove `level15`

---

## Change cheat sheet

| Change | v1 | v2 |
|---|---|---|
| Module format | `require('@clash-strategic/stats')` | `import { cards as stats } from '@clash-strategic/stats'` |
| Main export shape | array-like usage assumptions | `CardsJson` object with `stats.cards` and `stats.towerCards` |
| Towers | `cards.filter(c => c.type === 'tower')` | `stats.towerCards` |
| Battle cards | mixed with towers | `stats.cards` |
| Levels | `level11`, `level15` | `level11`, `level16` |
| Attack geometry | `typeAttack` | `hitType` |
| Placement rule | `territory` | `placement` |
| Self-destruct flag | `suicide` | `kamikaze` |
| Evolution block | `evolutionStats` | `evoStats` |
| Hero block | `heroAbilities` | `heroStats` |
| Charge damage | `chargeDamage` | `skills.charge.damage` |
| Spawn cadence | `generationSpeed`, `generationUnits` | `skills['periodic-spawn']` |
| Hero ability cost | `prestigeCost` | `heroStats.skills.ability.elixirCost` |
| Legacy death damage | `fatalDamage` | removed |

---

## 1. Module system: CommonJS → ESM

The package is ESM-only in v2.

### Before

```js
const { cards } = require('@clash-strategic/stats');
```

### After

```ts
import { cards as stats } from '@clash-strategic/stats';
```

### CommonJS fallback

```js
const { cards: stats } = await import('@clash-strategic/stats');
```

### Important note

You only need `"type": "module"` when your own Node.js runtime code depends on it.

If your app already uses a bundler or framework with ESM support, importing the package may work **without** changing your root `package.json`.

---

## 2. Package structure: use `CardsJson`

In v2, the named export `cards` is **not** a plain `Card[]`.
It is a `CardsJson` object:

```ts
interface CardsJson {
  cards: Card[];
  towerCards: TowerCard[];
}
```

### Before

```ts
import { cards } from '@clash-strategic/stats';

const towers = cards.filter((card) => card.type === 'tower');
const battleCards = cards.filter((card) => card.type !== 'tower');
```

### After

```ts
import { cards as stats } from '@clash-strategic/stats';

const battleCards = stats.cards;
const towerCards = stats.towerCards;
```

### Recommendation

Alias the import to `stats` so your code stays readable:

```ts
import { cards as stats } from '@clash-strategic/stats';
```

That avoids awkward usages like `cards.cards`.

---

## 3. Removed: `level15`

`Levels` now exposes only:

```ts
interface Levels {
  level11: number | null;
  level16: number | null;
}
```

### Before

```ts
const maxDamage = card.damage.level15;
```

### After

```ts
const tournamentDamage = card.damage.level11;
const maxDamage = card.damage.level16;
```

---

## 4. Renamed: `typeAttack` → `hitType`

### Before

```ts
if (card.typeAttack === 'splash') {
  // ...
}
```

### After

```ts
if (card.hitType === 'splash') {
  // ...
}
```

---

## 5. Renamed: `territory` → `placement`

Value mapping:

- `'wide'` → `'anywhere'`
- `'restricted'` → `'own-side'`

### Before

```ts
if (card.territory === 'restricted') {
  // ...
}
```

### After

```ts
if (card.placement === 'own-side') {
  // ...
}
```

---

## 6. Renamed: `suicide` → `kamikaze`

### Before

```ts
if (card.suicide) {
  // ...
}
```

### After

```ts
if (card.kamikaze) {
  // ...
}
```

---

## 7. Renamed: evolution and hero blocks

### Before

```ts
const cycles = card.evolutionStats.cycles;
const heroSkills = card.heroAbilities.skills;
```

### After

```ts
const cycles = card.evoStats.cycles;
const heroSkills = card.heroStats.skills;
```

---

## 8. Moved: `chargeDamage` → `skills.charge.damage`

### Before

```ts
const chargeDamage = card.chargeDamage;
```

### After

```ts
const chargeSkill = card.skills.charge;

if (chargeSkill) {
  const chargeDamage = chargeSkill.damage.level11;
  const speedMultiplier = chargeSkill.speedMultiplier;
}
```

---

## 9. Moved: spawn fields → `skills['periodic-spawn']`

### Before

```ts
const pause = card.generationSpeed;
const units = card.generationUnits;
```

### After

```ts
const spawnSkill = card.skills['periodic-spawn'];

if (spawnSkill) {
  const pause = spawnSkill.pauseTime;
  const unitName = spawnSkill.character;
  const units = spawnSkill.units;
}
```

---

## 10. Removed: `fatalDamage`

`fatalDamage` no longer exists in v2.

### Before

```ts
const deathDamage = card.fatalDamage;
```

### After

Remove the read entirely.

If you need a death-related mechanic, inspect `skills` instead, for example:

- `skills['spawn-on-death']`
- `skills['area-damage-on-death']`

Those are **not** direct replacements for every old `fatalDamage` usage, so migrate case by case.

---

## 11. Removed: `prestigeCost` → `heroStats.skills.ability.elixirCost`

### Before

```ts
const abilityCost = card.prestigeCost;
```

### After

```ts
const ability = card.heroStats.skills.ability;

if (ability) {
  const abilityCost = ability.elixirCost;
}
```

---

## Migration checklist

- [ ] Replace CommonJS `require()` with ESM `import`.
- [ ] Import the package as a `CardsJson` object:
  - [ ] `import { cards as stats } from '@clash-strategic/stats'`
  - [ ] use `stats.cards`
  - [ ] use `stats.towerCards`
- [ ] Remove every usage of `level15`.
- [ ] Search `typeAttack` → replace with `hitType`.
- [ ] Search `territory` → replace with `placement`.
- [ ] Replace placement values:
  - [ ] `'wide'` → `'anywhere'`
  - [ ] `'restricted'` → `'own-side'`
- [ ] Search `suicide` → replace with `kamikaze`.
- [ ] Search `evolutionStats` → replace with `evoStats`.
- [ ] Search `heroAbilities` → replace with `heroStats`.
- [ ] Migrate `chargeDamage` to `skills.charge.damage`.
- [ ] Migrate `generationSpeed` / `generationUnits` to `skills['periodic-spawn']`.
- [ ] Migrate `prestigeCost` to `heroStats.skills.ability.elixirCost`.
- [ ] Remove `fatalDamage` usages instead of trying to map it blindly.

---

## Summary

The most important correction is this:

```ts
import { cards as stats } from '@clash-strategic/stats';
```

Then use:

```ts
stats.cards
stats.towerCards
```

That reflects the v2 API that the package publishes.
