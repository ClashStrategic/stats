/**
 * @fileoverview Script to update cards.json with data from galacticapricot API.
 * 
 * Usage: node scripts/update-cards.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://humble.galacticapricot.dev/gamedata-v5.json';
const CARDS_FILE = path.join(__dirname, '..', 'cards.json');

const MULTIPLIERS = {
    standard: { level11: 2.56, level15: 3.72, level16: 4.09 },
    tower: { level11: 2.18, level15: 3.16, level16: 3.46 }
};

const CARD_SKELETON = {
    name: null,
    id: null,
    elixirCost: null,
    targets: [],
    units: 1,
    duration: null,
    evolution: false,
    hero: false,
    typeAttack: null,
    projectile: false,
    suicide: false,
    fatalDamage: { level11: null, level15: null, level16: null },
    chargeDamage: { level11: null, level15: null, level16: null },
    towerDamage: { level11: null, level15: null, level16: null },
    damage: { level11: null, level15: null, level16: null },
    hitpoints: { level11: null, level15: null, level16: null },
    statsEvo: {
        cycles: null,
        damage: { level11: null, level15: null, level16: null },
        hitpoints: { level11: null, level15: null, level16: null }
    },
    statsHero: {
        prestigeCost: null
    },
    hitspeed: null,
    radius: null,
    generationSpeed: null,
    generationUnits: null,
    speed: null,
    range: null,
    territory: null,
    rarity: null,
    type: null
};

const SPEED_MAP = {
    'TID_SPEED_0': 'slow',
    'TID_SPEED_1': 'slow',
    'TID_SPEED_2': 'slow',
    'TID_SPEED_3': 'medium',
    'TID_SPEED_4': 'fast',
    'TID_SPEED_5': 'very-fast'
};

const TARGETS_MAP = {
    'TID_TARGETS_GROUND': ['ground'],
    'TID_TARGETS_AIR_AND_GROUND': ['air', 'ground'],
    'TID_TARGETS_BUILDINGS': ['buildings'],
    'TID_TARGETS_NONE': []
};

/**
 * Fetch JSON data from URL
 */
function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Failed to parse API response: ' + e.message));
                }
            });
        }).on('error', (err) => reject(err));
    });
}

/**
 * Calculate stat for level 11 and 15
 */
function calculateStats(base, multipliers) {
    if (base === null || base === undefined || base === 0) return { level11: null, level15: null, level16: null };
    return {
        level11: Math.round(base * multipliers.level11),
        level15: Math.round(base * multipliers.level15),
        level16: Math.round(base * multipliers.level16)
    };
}

/**
 * Main update logic
 */
async function main() {
    try {
        console.log('Fetching game data...');
        const apiData = await fetchData(API_URL);

        if (!apiData || !apiData.items || !apiData.items.spells) {
            throw new Error('Invalid API data structure');
        }

        console.log('Reading cards.json...');
        const cardsJson = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));

        const existingCardsMap = new Map();
        cardsJson.cards.forEach(c => existingCardsMap.set(c.id, { card: c, list: cardsJson.cards }));
        cardsJson.towerCards.forEach(c => existingCardsMap.set(c.id, { card: c, list: cardsJson.towerCards }));

        let updatedCount = 0;
        let addedCount = 0;

        apiData.items.spells.forEach(apiItem => {
            // Skip Super cards and event cards
            if (apiItem.name.startsWith('Super') || apiItem.notVisible) {
                return;
            }

            const isTower = apiItem.tidType === 'TID_TYPE_TOWER_TROOP' || apiItem.source === 'support_cards';
            const multipliers = isTower ? MULTIPLIERS.tower : MULTIPLIERS.standard;

            let entry = existingCardsMap.get(apiItem.id);
            let card;

            if (!entry) {
                // New card skeleton
                card = JSON.parse(JSON.stringify(CARD_SKELETON));
                card.id = apiItem.id;
                card.name = apiItem.englishName || apiItem.name;
                card.type = isTower ? 'tower' : 'troop'; // Default, adjusted below

                if (isTower) {
                    cardsJson.towerCards.push(card);
                } else {
                    cardsJson.cards.push(card);
                }
                addedCount++;
            } else {
                card = entry.card;
                updatedCount++;
            }

            // Update basic info if missing or new
            card.elixirCost = apiItem.manaCost ?? card.elixirCost;

            const extractTargets = (tid) => TARGETS_MAP[tid] || [];
            const allTargets = [
                ...extractTargets(apiItem.tidTarget),
                ...extractTargets(apiItem.projectileData?.tidTarget),
                ...extractTargets(apiItem.summonCharacterData?.tidTarget),
                ...extractTargets(apiItem.summonCharacterData?.spawnCharacterData?.tidTarget),
                ...extractTargets(apiItem.summonCharacterSecondData?.tidTarget),
                ...extractTargets(apiItem.summonCharacterSecondData?.spawnCharacterData?.tidTarget),
                ...extractTargets(apiItem.summonCharacterThirdData?.tidTarget),
                ...extractTargets(apiItem.summonCharacterThirdData?.spawnCharacterData?.tidTarget)
            ];
            card.targets = [...(new Set(allTargets).length > 0 ? new Set(allTargets) : card.targets)];
            card.rarity = (apiItem.rarity || card.rarity || '').toLowerCase();
            card.units = (apiItem.summonNumber || 0) + (apiItem.summonCharacterSecondCount || 0) + (apiItem.summonCharacterThirdCount || 0) || card.units;

            // Extract base stats
            // Handle multiple characters
            const characters = [];
            if (apiItem.summonCharacterData) characters.push({ data: apiItem.summonCharacterData, count: apiItem.summonNumber || 1 });
            if (apiItem.summonCharacterSecondData) characters.push({ data: apiItem.summonCharacterSecondData, count: apiItem.summonCharacterSecondCount || 1 });
            if (apiItem.summonCharacterThirdData) characters.push({ data: apiItem.summonCharacterThirdData, count: apiItem.summonCharacterThirdCount || 1 });

            // fallback charData for single-unit logic or backward compatibility
            let charData = apiItem.summonCharacterData || apiItem.statCharacterData || {};

            // Handle cases where character data is inside area effect
            if (Object.keys(charData).length === 0 && apiItem.areaEffectObjectData && apiItem.areaEffectObjectData.onStartingActionData && apiItem.areaEffectObjectData.onStartingActionData.spawnDataData) {
                charData = apiItem.areaEffectObjectData.onStartingActionData.spawnDataData;
            }

            const areaData = apiItem.areaEffectObjectData || {};
            const projData = apiItem.projectileData || charData.projectileData || areaData.projectileData || {};
            const buffData = areaData.buffData || {};
            const spawnProjData = projData.spawnProjectileData || areaData.projectileData || {};
            const spawnCharData = projData.spawnCharacterData || areaData.spawnCharacterData || {};

            // Aggregation logic for multi-units
            let maxHP = 0;
            let primaryChar = charData;
            let totalDamage = 0;

            if (characters.length > 0) {
                characters.forEach(c => {
                    const d = c.data;
                    const hp = d.hitpoints || 0;
                    const p = d.projectileData || {};
                    const unitDamage = d.damage || p.damage || 0;

                    if (hp > maxHP) {
                        maxHP = hp;
                        primaryChar = d;
                    }

                    if (unitDamage > totalDamage) {
                        totalDamage = unitDamage;
                    }

                    if (Object.keys(p).length > 0) {
                        card.projectile = true;
                    }
                });

                card.hitspeed = (primaryChar.hitSpeed ? primaryChar.hitSpeed / 1000 : card.hitspeed);
                card.range = (primaryChar.range ? primaryChar.range / 1000 : card.range);
                card.speed = SPEED_MAP[primaryChar.tidSpeed] || card.speed;
            } else {
                card.hitspeed = (charData.hitSpeed ? charData.hitSpeed / 1000 : card.hitspeed);
                card.range = (charData.range ? charData.range / 1000 : card.range);
                card.speed = SPEED_MAP[charData.tidSpeed] || card.speed;
            }

            card.generationSpeed = (charData.spawnPauseTime ? charData.spawnPauseTime / 1000 : card.generationSpeed);
            card.generationUnits = ((charData.spawnNumber && charData.spawnNumber > 1) ? charData.spawnNumber : card.generationUnits);

            // Radius and Type Attack
            const rawRadius = apiItem.radius ?? areaData.radius ?? charData.areaDamageRadius ?? projData.radius ??
                (projData.customFirstProjectileData ? projData.customFirstProjectileData.radius : null);
            if (rawRadius !== null && rawRadius !== undefined) {
                card.radius = rawRadius / 1000;
                card.typeAttack = 'splash';
            } else {
                card.typeAttack = card.typeAttack || 'unique';
            }

            // Projectile
            card.projectile = (Object.keys(projData).length > 0 || card.projectile);

            // Life duration / Duration
            const rawDuration = apiItem.lifeTime ?? areaData.lifeDuration ?? null;
            if (rawDuration !== null) {
                card.duration = rawDuration / 1000;
            }

            const baseHP = maxHP || charData.hitpoints || spawnCharData.hitpoints || null;
            const baseDamage = totalDamage || charData.damage || projData.damage || areaData.damage || buffData.damagePerSecond ||
                spawnProjData.damage || spawnCharData.damage || null;
            const baseFatal = charData.deathDamage || (charData.deathSpawnCharacterData ? charData.deathSpawnCharacterData.deathDamage : null) || null;
            const baseCharge = charData.damageSpecial || null;

            // Tower damage calculation for spells/troops
            let baseTowerDamage = null;
            const towerDamagePercent = apiItem.crownTowerDamagePercent ?? charData.crownTowerDamagePercent ?? projData.crownTowerDamagePercent ??
                areaData.crownTowerDamagePercent ?? buffData.crownTowerDamagePercent ?? spawnProjData.crownTowerDamagePercent ?? spawnCharData.crownTowerDamagePercent;
            if (towerDamagePercent !== undefined && baseDamage) {
                baseTowerDamage = baseDamage * (100 + towerDamagePercent) / 100;
            }

            // Update stats
            const hpStats = calculateStats(baseHP, multipliers);
            const dmgStats = calculateStats(baseDamage, multipliers);
            const fatalStats = calculateStats(baseFatal, multipliers);
            const chargeStats = calculateStats(baseCharge, multipliers);
            const towerDmgStats = calculateStats(baseTowerDamage, multipliers);

            card.hitpoints = {
                level11: hpStats.level11 ?? card.hitpoints.level11 ?? null,
                level15: hpStats.level15 ?? card.hitpoints.level15 ?? null,
                level16: hpStats.level16 ?? card.hitpoints.level16 ?? null
            };
            card.damage = {
                level11: dmgStats.level11 ?? card.damage.level11 ?? null,
                level15: dmgStats.level15 ?? card.damage.level15 ?? null,
                level16: dmgStats.level16 ?? card.damage.level16 ?? null
            };
            card.fatalDamage = {
                level11: fatalStats.level11 ?? card.fatalDamage.level11 ?? null,
                level15: fatalStats.level15 ?? card.fatalDamage.level15 ?? null,
                level16: fatalStats.level16 ?? card.fatalDamage.level16 ?? null
            };
            card.chargeDamage = {
                level11: chargeStats.level11 ?? card.chargeDamage.level11 ?? null,
                level15: chargeStats.level15 ?? card.chargeDamage.level15 ?? null,
                level16: chargeStats.level16 ?? card.chargeDamage.level16 ?? null
            };
            card.towerDamage = {
                level11: towerDmgStats.level11 ?? card.towerDamage.level11 ?? null,
                level15: towerDmgStats.level15 ?? card.towerDamage.level15 ?? null,
                level16: towerDmgStats.level16 ?? card.towerDamage.level16 ?? null
            };

            // Evolution check
            if (apiItem.evolvedSpellsData) {
                card.evolution = true;
                const evoData = apiItem.evolvedSpellsData;
                let evoCharData = evoData.summonCharacterData || {};

                if (Object.keys(evoCharData).length === 0 && evoData.areaEffectObjectData && evoData.areaEffectObjectData.onStartingActionData &&
                    evoData.areaEffectObjectData.onStartingActionData.spawnDataData) {
                    evoCharData = evoData.areaEffectObjectData.onStartingActionData.spawnDataData;
                }

                const evoProjData = evoData.projectileData || (evoCharData.projectileData) || {};
                const evoAreaData = evoData.areaEffectObjectData || {};
                const evoBuffData = evoAreaData.buffData || {};
                const evoSpawnProjData = evoProjData.spawnProjectileData || evoAreaData.projectileData || {};
                const evoSpawnCharData = evoProjData.spawnCharacterData || evoAreaData.spawnCharacterData || {};

                const baseEvoHP = evoCharData.hitpoints || evoSpawnCharData.hitpoints || baseHP;
                const baseEvoDmg = evoCharData.damage || evoProjData.damage || evoAreaData.damage || evoBuffData.damagePerSecond ||
                    evoSpawnProjData.damage || evoSpawnCharData.damage || baseDamage;

                const evoHPStats = calculateStats(baseEvoHP, multipliers);
                const evoDmgStats = calculateStats(baseEvoDmg, multipliers);

                card.statsEvo.hitpoints = {
                    level11: evoHPStats.level11 ?? (card.statsEvo.hitpoints ? card.statsEvo.hitpoints.level11 : null),
                    level15: evoHPStats.level15 ?? (card.statsEvo.hitpoints ? card.statsEvo.hitpoints.level15 : null),
                    level16: evoHPStats.level16 ?? (card.statsEvo.hitpoints ? card.statsEvo.hitpoints.level16 : null)
                };
                card.statsEvo.damage = {
                    level11: evoDmgStats.level11 ?? (card.statsEvo.damage ? card.statsEvo.damage.level11 : null),
                    level15: evoDmgStats.level15 ?? (card.statsEvo.damage ? card.statsEvo.damage.level15 : null),
                    level16: evoDmgStats.level16 ?? (card.statsEvo.damage ? card.statsEvo.damage.level16 : null)
                };

                // Evolution specific cycles
                if (apiItem.evolvedSpellsData.cycles) {
                    card.statsEvo.cycles = apiItem.evolvedSpellsData.cycles;
                }
            }

            // Hero check
            /* if (apiItem.heroData) {
                card.hero = true;
                const prestige = apiItem.heroData.prestigeCount;
                if (prestige !== undefined) {
                    card.statsHero.prestigeCost = prestige;
                }
            } else if (apiItem.rarity === 'Champion') {
                card.hero = true;
            } */

            // Fallback: Extrapolate missing Level 16 from Level 11
            const statFields = ['hitpoints', 'damage', 'fatalDamage', 'chargeDamage', 'towerDamage'];
            statFields.forEach(field => {
                if (card[field] && (card[field].level16 === null || card[field].level16 === undefined) && card[field].level11 !== null) {
                    card[field].level16 = Math.round((card[field].level11 / multipliers.level11) * multipliers.level16);
                }
            });
            if (card.statsEvo) {
                ['hitpoints', 'damage'].forEach(field => {
                    if (card.statsEvo[field] && (card.statsEvo[field].level16 === null || card.statsEvo[field].level16 === undefined) && card.statsEvo[field].level11 !== null) {
                        card.statsEvo[field].level16 = Math.round((card.statsEvo[field].level11 / multipliers.level11) * multipliers.level16);
                    }
                });
            }

        });

        // Final pass: Ensure all cards follow the skeleton (including level16 nested keys)
        const allResultCards = [...cardsJson.cards, ...cardsJson.towerCards];
        allResultCards.forEach(card => {
            Object.keys(CARD_SKELETON).forEach(key => {
                if (!(key in card)) {
                    card[key] = JSON.parse(JSON.stringify(CARD_SKELETON[key]));
                } else if (CARD_SKELETON[key] !== null && typeof CARD_SKELETON[key] === 'object' && !Array.isArray(CARD_SKELETON[key])) {
                    // Deep check for nested keys (like level16)
                    Object.keys(CARD_SKELETON[key]).forEach(nestedKey => {
                        if (!(nestedKey in card[key])) {
                            card[key][nestedKey] = CARD_SKELETON[key][nestedKey];
                        }
                    });
                }
            });
            // Ensure radius is numeric if it exists
            if (card.radius === null && 'radius' in card) {
                // keep it null
            }
        });

        // Write back to file
        console.log('Writing to cards.json...');
        fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsJson, null, 4), 'utf8');

        console.log('Update complete!');
        console.log(`Updated: ${updatedCount} cards`);
        console.log(`Added: ${addedCount} new cards`);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
