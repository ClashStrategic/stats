/**
 * @fileoverview Script to update cards.json with data from galacticapricot API.
 * 
 * Usage: node scripts/update-cards.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://humbleapi.galacticapricot.workers.dev/gamedata-v4.json';
const CARDS_FILE = path.join(__dirname, '..', 'cards.json');

const MULTIPLIERS = {
    standard: { level11: 2.56, level15: 3.72 },
    tower: { level11: 2.18, level15: 3.16 }
};

const CARD_SKELETON = {
    name: null,
    id: null,
    elixirCost: null,
    targets: [],
    units: 1,
    duration: null,
    evolution: false,
    typeAttack: null,
    projectile: false,
    suicide: false,
    fatalDamage: { level11: null, level15: null },
    chargeDamage: { level11: null, level15: null },
    towerDamage: { level11: null, level15: null },
    damage: { level11: null, level15: null },
    hitpoints: { level11: null, level15: null },
    statsEvo: {
        cycles: null,
        damage: { level11: null, level15: null },
        hitpoints: { level11: null, level15: null }
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
                    reject(new Error('Failed to parse API response'));
                }
            });
        }).on('error', (err) => reject(err));
    });
}

/**
 * Calculate stat for level 11 and 15
 */
function calculateStats(base, multipliers) {
    if (base === null || base === undefined || base === 0) return { level11: null, level15: null };
    return {
        level11: Math.round(base * multipliers.level11),
        level15: Math.round(base * multipliers.level15)
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
            card.rarity = (apiItem.rarity || card.rarity || '').toLowerCase();

            // Extract base stats
            const charData = apiItem.summonCharacterData || apiItem.statCharacterData || {};
            const projData = apiItem.projectileData || (charData.projectileData) || {};

            const baseHP = charData.hitpoints || null;
            const baseDamage = charData.damage || projData.damage || null;
            const baseFatal = charData.deathDamage || (charData.deathSpawnCharacterData ? charData.deathSpawnCharacterData.deathDamage : null) || null;
            const baseCharge = charData.damageSpecial || null;

            // Tower damage calculation for spells/troops
            let baseTowerDamage = null;
            const towerDamagePercent = apiItem.crownTowerDamagePercent ?? charData.crownTowerDamagePercent ?? projData.crownTowerDamagePercent;
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
                level11: hpStats.level11 ?? card.hitpoints.level11,
                level15: hpStats.level15 ?? card.hitpoints.level15
            };
            card.damage = {
                level11: dmgStats.level11 ?? card.damage.level11,
                level15: dmgStats.level15 ?? card.damage.level15
            };
            card.fatalDamage = {
                level11: fatalStats.level11 ?? card.fatalDamage.level11,
                level15: fatalStats.level15 ?? card.fatalDamage.level15
            };
            card.chargeDamage = {
                level11: chargeStats.level11 ?? card.chargeDamage.level11,
                level15: chargeStats.level15 ?? card.chargeDamage.level15
            };
            card.towerDamage = {
                level11: towerDmgStats.level11 ?? card.towerDamage.level11,
                level15: towerDmgStats.level15 ?? card.towerDamage.level15
            };

            // Evolution check
            if (apiItem.evolvedSpellsData) {
                card.evolution = true;
                const evoData = apiItem.evolvedSpellsData;
                const evoCharData = evoData.summonCharacterData || {};

                // Cycles (cycles info is often not in this API v4 format or hidden, keeping existing if present)

                const baseEvoHP = evoCharData.hitpoints || baseHP;
                const baseEvoDmg = evoCharData.damage || (evoCharData.projectileData ? evoCharData.projectileData.damage : null) || baseDamage;

                const evoHPStats = calculateStats(baseEvoHP, multipliers);
                const evoDmgStats = calculateStats(baseEvoDmg, multipliers);

                card.statsEvo.hitpoints = {
                    level11: evoHPStats.level11 ?? (card.statsEvo.hitpoints ? card.statsEvo.hitpoints.level11 : null),
                    level15: evoHPStats.level15 ?? (card.statsEvo.hitpoints ? card.statsEvo.hitpoints.level15 : null)
                };
                card.statsEvo.damage = {
                    level11: evoDmgStats.level11 ?? (card.statsEvo.damage ? card.statsEvo.damage.level11 : null),
                    level15: evoDmgStats.level15 ?? (card.statsEvo.damage ? card.statsEvo.damage.level15 : null)
                };
            }

            // Ensure all properties are present and null if not applicable
            Object.keys(CARD_SKELETON).forEach(key => {
                if (!(key in card)) {
                    card[key] = JSON.parse(JSON.stringify(CARD_SKELETON[key]));
                }
            });
        });

        // Write back to file
        console.log('Writing to cards.json...');
        fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsJson, null, 4), 'utf8');

        console.log(`Update complete!`);
        console.log(`Updated: ${updatedCount} cards`);
        console.log(`Added: ${addedCount} new cards`);

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
