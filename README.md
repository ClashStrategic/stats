# Clash Strategic Stats API 📊

[![Version](https://img.shields.io/github/package-json/v/ClashStrategic/stats.svg)](https://github.com/ClashStrategic/stats)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/ClashStrategic/stats/actions/workflows/vitest.yml/badge.svg)](https://github.com/ClashStrategic/stats/actions/workflows/vitest.yml)

This project provides a robust, typed, and validated public API for Clash Royale data and statistics not available through the official API. Our goal is to offer deep, community-driven insights for developers and analysts. 🤝

## Features ✨

- **Complete Card Data**: Detailed stats for all Clash Royale cards, including Troops, Spells, and Buildings.
- **Advanced Mechanics**: Includes data for **Evolutions**, **Hero Abilities**, and complex skills like Dash, Shield, and Periodic Spawn.
- **Type Safety**: Full TypeScript support with exported interfaces and types.
- **Schema Validation**: Data integrity guaranteed by AJV schema validation and comprehensive test suites.
- **Git Integration**: Easily integrate as a dependency directly from GitHub.
- **Static API**: Access data directly via CDN for frontend applications.

## Installation 📦

### As a Dependency via GitHub

You can install this library directly from the GitHub repository using npm:

```bash
npm install git+https://github.com/ClashStrategic/stats.git
```

### Direct Download (Static API)

You can access the JSON data directly via a CDN like jsDelivr (recommended for production):

`https://cdn.jsdelivr.net/gh/ClashStrategic/stats/data/cards.json`

Alternatively, you can use the raw GitHub URL for development or specific versions:

`https://raw.githubusercontent.com/ClashStrategic/stats/main/data/cards.json`

## Usage 🚀

### TypeScript/JavaScript

Once installed as a dependency, you can import it as usual:

```typescript
import { cards, Card } from '@clash-strategic/stats';

// Access the full cards list
console.log(cards.cards.length);

// Find a specific card
const knight = cards.cards.find(c => c.name === 'Knight');

if (knight) {
  console.log(`Knight elixir cost: ${knight.elixirCost}`);
  console.log(`Evolution cycles: ${knight.evoStats.cycles}`);
}
```

### Data Structure 🃏

The data is structured to handle the complexity of modern Clash Royale mechanics:

- **`cards`**: Array of all playable cards.
- **`towerCards`**: Array of Tower Troop data (Tower Princess, Cannoneer, etc.).
- **Level-based Stats**: Damage, hitpoints, and other values are provided for key levels (e.g., `level11`, `level16`).

#### Card Properties Example:
- `evolution`: Boolean indicating if the card has an evolution.
- `evoStats`: Detailed stats for the evolved version.
- `skills`: Object containing specialized mechanics (stun, slow, shield, etc.).
- `heroStats`: Ability and stats specific to Champions.

## Development 🛠️

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Available Scripts

- `npm run build`: Cleans and compiles the project to `lib/`.
- `npm test`: Runs the full validation suite using Vitest.
- `npm run lint`: Checks for code style and quality issues.
- `npm run build:update-cards`: Executes the scripts to update data and normalize numeric formats.

### Validation
We take data integrity seriously. Every change to `data/cards.json` must pass:
1. **Schema Validation**: Matches the official `cardSchema` (AJV).
2. **Structural Integrity**: Unique IDs/Names, consistent numeric formats (floats for specific fields).
3. **Logic Checks**: Evolution stats for evolved cards, ability stats for Heroes, etc.

## Contribution ❤️

We welcome contributions! If you want to:
- Add missing data or update existing stats.
- Improve the JSON schema.
- Add new features to the library.

Please see our [Contributing Guide](CONTRIBUTING.md) and ensure your changes pass `npm test`.

## License 📄

This project is licensed under the **Apache-2.0 License**.

---
*This project is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it.*
