// Fetches spells data and updates cards.json, preserving non-null values

const fs = require('fs');
const path = require('path');
const https = require('https');
const convert = require('./convert-to-floats');

const CARDS_PATH = path.join(__dirname, '..', 'cards.json');
const API_URL = 'https://humbleapi.galacticapricot.workers.dev/gamedata-v4.json';

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function mergeCardData(existing, incoming) {
    // Makes sure that we don't overwite data good data with null values
    for (const key in incoming) {
        if (incoming[key] === null || incoming[key] === undefined) continue;
        if (incoming[key] === 0 && existing[key]) continue;
        if (typeof incoming[key] === 'object' && !Array.isArray(incoming[key]) && existing[key]) {
            existing[key] = mergeCardData(existing[key], incoming[key]);
        } else {
            existing[key] = incoming[key];
        }
    }
    return existing;
}

function spellToCard(spell) {
    // API calls everything a spell. I don't know why, Doesn't make a difference :)
    const summon = spell.summonCharacterData || {};
    const evo = spell.evolvedSpellsData?.summonCharacterData || {};
    const projectile = summon.projectileData || spell.projectileData || {};
    const units = spell.summonNumber || spell.summonCharacterSecondCount ? (spell.summonNumber || 1) + (spell.summonCharacterSecondCount || 0) : 1;
    const targets = [];
    if (summon.tidTarget === 'TID_TARGETS_BUILDINGS' || projectile.tidTarget === 'TID_TARGETS_BUILDINGS') targets.push('buildings');
    else if (summon.attacksGround) targets.push('ground');
    if (summon.tidTarget === 'TID_TARGETS_AIR_AND_GROUND' || projectile.tidTarget === 'TID_TARGETS_AIR_AND_GROUND') {
        if (!targets.includes('ground')) targets.push('ground');
        if (!targets.includes('air')) targets.push('air');
    }
    return {
        name: spell.englishName || spell.name,
        id: spell.id,
        elixirCost: spell.manaCost || 0,
        targets,
        units,
        duration: null,
        evolution: !!spell.evolvedSpellsData,
        typeAttack: projectile.damage ? 'splash' : 'unique',
        projectile: !!(projectile.name),
        suicide: summon.kamikaze || false,
        fatalDamage: { level11: null, level15: null },
        chargeDamage: { level11: null, level15: null },
        towerDamage: { level11: null, level15: null },
        damage: { level11: 0, level15: 0 },
        hitpoints: { level11: 0, level15: 0 },
        statsEvo: evo ? {
            cycles: null,
            damage: { level11: null, level15: null },
            hitpoints: { level11: null, level15: null }
        } : { cycles: null, damage: { level11: 0, level15: 0 }, hitpoints: { level11: null, level15: null } },
        hitspeed: summon.hitSpeed ? summon.hitSpeed / 1000 : null,
        radius: spell.radius ? spell.radius / 1000 : null,
        generationSpeed: null,
        generationUnits: null,
        speed: summon.speed ? (summon.speed >= 120 ? 'very-fast' : summon.speed >= 90 ? 'fast' : summon.speed >= 60 ? 'medium' : 'slow') : null,
        range: summon.range ? summon.range / 1000 : null,
        territory: 'restricted',
        rarity: spell.rarity ? spell.rarity.toLowerCase() : null,
        type: spell.tidType && spell.tidType.includes('CHARACTER') ? 'troop' : spell.tidType && spell.tidType.includes('SPELL') ? 'spell' : null
    };
}

async function humble() {
    let apiData;
    try {
        apiData = await fetchJson(API_URL);
    } catch (err) {
        console.error('Failed to fetch API:', err);
        return;
    }

    let spells = apiData.items?.spells || [];
    spells = spells.filter(spell => !spell.notVisible);

    let cardsData;
    try {
        cardsData = JSON.parse(fs.readFileSync(CARDS_PATH, 'utf8'));
    } catch (err) {
        console.error('Failed to read cards.json:', err);
        return;
    }

    cardsData.cards = cardsData.cards || [];
    cardsData.towerCards = cardsData.towerCards || [];

    // Create maps for fast lookup
    const cardMap = Object.fromEntries(cardsData.cards.map(card => [card.id, card]));
    const towerCardMap = Object.fromEntries(cardsData.towerCards.map(card => [card.id, card]));

    for (const spell of spells) {
        const newCard = spellToCard(spell);
        if (!newCard.id) continue;

        if (spell.tidType === 'TID_TYPE_TOWER_TROOP') {
            if (towerCardMap[newCard.id]) {
                towerCardMap[newCard.id] = mergeCardData(towerCardMap[newCard.id], newCard);
            } else {
                towerCardMap[newCard.id] = newCard;
            }
        } else {
            if (cardMap[newCard.id]) {
                cardMap[newCard.id] = mergeCardData(cardMap[newCard.id], newCard);
            } else {
                cardMap[newCard.id] = newCard;
            }
        }
    }


    cardsData.cards = convert.convertIntegersToFloats(Object.values(cardMap));
    cardsData.towerCards = convert.convertIntegersToFloats(Object.values(towerCardMap));
    // i still have no idea why we need to do this again but ok
    let modifiedContent = JSON.stringify(cardsData, null, 4);
            // Replace integers with floats in the specific properties
        const targetProperties = ['duration', 'generationSpeed', 'hitspeed', 'range', 'radius'];
        targetProperties.forEach(prop => {
            // Search for patterns like "hitspeed": 1, and replace them with "hitspeed": 1.0,
            const regex = new RegExp(`"${prop}":\\s*(\\d+)([,\\n])`, 'g');
            modifiedContent = modifiedContent.replace(regex, `"${prop}": $1.0$2`);
        });
    fs.writeFileSync(CARDS_PATH, modifiedContent);
    console.log('cards.json updated!');
}
humble();
//just in case we run this somewehere alse
module.exports = { humble };