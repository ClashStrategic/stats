const fs = require('fs');
const path = require('path');
const https = require('https');

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

//const API_URL = 'https://humble.galacticapricot.dev/gamedata-v5.json';
const API_URL = 'https://cache.statsroyale.com/gamedata-v5.json';
const CARDS_FILE = path.join(__dirname, '..', 'cards.json');

const MULTIPLIERS = {
    standard: { level11: 2.56, level15: 3.72, level16: 4.09 },
    tower: { level11: 2.18, level15: 3.16, level16: 3.46 }
};

const SPEED_MAP = {
    'TID_SPEED_0': 'slow', 'TID_SPEED_1': 'slow', 'TID_SPEED_2': 'slow',
    'TID_SPEED_3': 'medium', 'TID_SPEED_4': 'fast', 'TID_SPEED_5': 'very-fast'
};

const TARGETS_MAP = {
    'TID_TARGETS_GROUND': ['ground'],
    'TID_TARGETS_AIR_AND_GROUND': ['air', 'ground'],
    'TID_TARGETS_BUILDINGS': ['buildings'],
    'TID_TARGETS_NONE': []
};

const CARD_SKELETON = {
    name: null, id: null, elixirCost: null, targets: [], units: 0,
    duration: null, evolution: false, hero: false, typeAttack: null,
    projectile: false, suicide: false,
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
    statsHero: { prestigeCost: null },
    hitspeed: null, radius: null, generationSpeed: null, generationUnits: null,
    speed: null, range: null, territory: null, rarity: null, type: null
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fetchData = (url) => new Promise((resolve, reject) => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try { resolve(JSON.parse(data)); }
            catch (e) { reject(new Error('Failed to parse API response: ' + e.message)); }
        });
    }).on('error', reject);
});

const calcStats = (base, m) => base
    ? { level11: Math.floor(base * m.level11), level15: Math.floor(base * m.level15), level16: Math.floor(base * m.level16) }
    : { level11: null, level15: null, level16: null };

const mergeStats = (computed, existing) => ({
    level11: computed.level11 ?? existing?.level11 ?? null,
    level15: computed.level15 ?? existing?.level15 ?? null,
    level16: computed.level16 ?? existing?.level16 ?? null
});

const getTargets = (tid) => TARGETS_MAP[tid] || [];

const extractCharData = (item) => {
    if (item.summonCharacterData) return item.summonCharacterData;
    if (item.statCharacterData) return item.statCharacterData;
    const areaSpawn = item.areaEffectObjectData?.onStartingActionData?.spawnDataData;
    return areaSpawn || {};
};

const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj));

// ─────────────────────────────────────────────────────────────────────────────
// CARD PROCESSING
// ─────────────────────────────────────────────────────────────────────────────

function collectCharacters(apiItem) {
    const chars = [];
    if (apiItem.summonCharacterData) chars.push({ data: apiItem.summonCharacterData, count: apiItem.summonNumber || 1 });
    if (apiItem.summonCharacterSecondData) chars.push({ data: apiItem.summonCharacterSecondData, count: apiItem.summonCharacterSecondCount || 1 });
    if (apiItem.summonCharacterThirdData) chars.push({ data: apiItem.summonCharacterThirdData, count: apiItem.summonCharacterThirdCount || 1 });
    return chars;
}

function aggregateCharacterStats(characters) {
    let maxHP = 0, primaryChar = {}, totalDamage = 0, hasProjectile = false, hsOfDmg = 0;

    characters.forEach(({ data }) => {
        const hp = data.hitpoints || 0;
        const proj = data.projectileData || {};
        const dmg = data.damage || proj.damage || 0;
        const hs = data.hitSpeed || 0;

        if (hp > maxHP) { maxHP = hp; primaryChar = data; }
        if (dmg > totalDamage) { totalDamage = dmg; hsOfDmg = hs; };
        if (Object.keys(proj).length > 0) hasProjectile = true;
    });

    return { maxHP, primaryChar, totalDamage, hasProjectile, hsOfDmg };
}

function extractAllTargets(apiItem, charData) {
    const sources = [
        apiItem.tidTarget,
        apiItem.projectileData?.tidTarget,
        charData.tidTarget,
        charData.spawnCharacterData?.tidTarget
    ];

    ['summonCharacterData', 'summonCharacterSecondData', 'summonCharacterThirdData'].forEach(key => {
        const data = apiItem[key];
        if (data) {
            sources.push(data.tidTarget, data.spawnCharacterData?.tidTarget);
        }
    });

    return [...new Set(sources.flatMap(getTargets))];
}

function processCard(card, apiItem, multipliers) {
    const charData = extractCharData(apiItem);
    const areaData = apiItem.areaEffectObjectData || {};
    const projData = apiItem.projectileData || charData.projectileData || areaData.projectileData || {};
    const buffData = areaData.buffData || {};
    const spawnProjData = projData.spawnProjectileData || areaData.projectileData || {};
    const spawnCharData = projData.spawnCharacterData || areaData.spawnCharacterData || {};
    const deathAreaEffect = charData.deathAreaEffectData || {};

    card.elixirCost = apiItem.manaCost ?? card.elixirCost;
    card.rarity = (apiItem.rarity || card.rarity || '').toLowerCase();

    const allTargets = extractAllTargets(apiItem, charData);
    if (allTargets.length > 0) card.targets = allTargets;

    card.units = (apiItem.summonNumber || 0) + (apiItem.summonCharacterSecondCount || 0) + (apiItem.summonCharacterThirdCount || 0) || card.units;

    const characters = collectCharacters(apiItem);
    let baseHP, baseDamage;

    if (characters.length > 0) {
        let maxHP, primaryChar, totalDamage, hasProjectile, hsOfDmg;
        if (charData.deathSpawnCharacterData && charData.kamikaze)
            ({ maxHP, primaryChar, totalDamage, hasProjectile, hsOfDmg } = aggregateCharacterStats([{ data: charData.deathSpawnCharacterData, count: 1 }]));
        else
            ({ maxHP, primaryChar, totalDamage, hasProjectile, hsOfDmg } = aggregateCharacterStats(characters));

        card.hitspeed = hsOfDmg ? (hsOfDmg + (projData.pingpongVisualTime ?? 0)) / 1000 : card.hitspeed;
        card.range = primaryChar.range ? primaryChar.range / 1000 : card.range;
        card.speed = SPEED_MAP[primaryChar.tidSpeed] || card.speed;
        card.projectile = hasProjectile || card.projectile;
        baseHP = charData.spawnPathfindMorphData ? charData.spawnPathfindMorphData.hitpoints : maxHP || charData.hitpoints || spawnCharData.hitpoints;
        baseDamage = totalDamage || charData.damage || projData.damage || areaData.damage || buffData.damagePerSecond || spawnProjData.damage || spawnCharData.damage || deathAreaEffect.damage;
    }

    baseDamage = baseDamage * (apiItem.projectileWaves || 1);

    card.generationSpeed = charData.spawnPauseTime ? charData.spawnPauseTime / 1000 : card.generationSpeed;
    card.generationUnits = charData.spawnNumber > 1 ? charData.spawnNumber : card.generationUnits;

    const rawRadius = apiItem.radius ?? areaData.radius ?? charData.areaDamageRadius ?? projData.radius ?? projData.customFirstProjectileData?.radius;
    if (rawRadius != null && card.units === 0 && !['Lightning', 'Void', 'Vines'].includes(card.name)) {
        card.radius = rawRadius / 1000;
        card.typeAttack = 'splash';
    } else {
        card.typeAttack = card.typeAttack || 'unique';
    }

    card.projectile = Object.keys(projData).length > 0 || card.projectile;

    const rawDuration = apiItem.lifeTime ?? areaData.lifeDuration ?? charData.spawnPathfindMorphData?.lifeTime;
    if (rawDuration != null) card.duration = rawDuration / 1000;

    const baseFatal = charData.deathDamage || charData.deathSpawnCharacterData?.deathDamage;
    const baseCharge = charData.damageSpecial;

    const towerDamagePercent = apiItem.crownTowerDamagePercent ?? charData.crownTowerDamagePercent ?? projData.crownTowerDamagePercent ??
        areaData.crownTowerDamagePercent ?? buffData.crownTowerDamagePercent ?? spawnProjData.crownTowerDamagePercent ?? spawnCharData.crownTowerDamagePercent;
    const baseTowerDamage = towerDamagePercent !== undefined && baseDamage ? baseDamage * (100 + towerDamagePercent) / 100 : null;

    card.hitpoints = mergeStats(calcStats(baseHP, multipliers), card.hitpoints);
    card.damage = mergeStats(calcStats(baseDamage, multipliers), card.damage);
    card.fatalDamage = mergeStats(calcStats(baseFatal, multipliers), card.fatalDamage);
    card.chargeDamage = mergeStats(calcStats(baseCharge, multipliers), card.chargeDamage);
    card.towerDamage = mergeStats(calcStats(baseTowerDamage, multipliers), card.towerDamage);

    processEvolution(card, apiItem, multipliers, baseHP, baseDamage);
    extrapolateLevel16(card, multipliers);
}

function processEvolution(card, apiItem, multipliers, baseHP, baseDamage) {
    if (!apiItem.evolvedSpellsData) return;

    card.evolution = true;
    const evoData = apiItem.evolvedSpellsData;

    let evoCharData = evoData.summonCharacterData || {};
    if (Object.keys(evoCharData).length === 0) {
        evoCharData = evoData.areaEffectObjectData?.onStartingActionData?.spawnDataData || {};
    }

    const evoProjData = evoData.projectileData || evoCharData.projectileData || {};
    const evoAreaData = evoData.areaEffectObjectData || {};
    const evoBuffData = evoAreaData.buffData || {};
    const evoSpawnProjData = evoProjData.spawnProjectileData || evoAreaData.projectileData || {};
    const evoSpawnCharData = evoProjData.spawnCharacterData || evoAreaData.spawnCharacterData || {};

    const baseEvoHP = evoCharData.hitpoints || evoSpawnCharData.hitpoints || baseHP;
    const baseEvoDmg = evoCharData.damage || evoProjData.damage || evoAreaData.damage ||
        evoBuffData.damagePerSecond || evoSpawnProjData.damage || evoSpawnCharData.damage || baseDamage;

    card.statsEvo.hitpoints = mergeStats(calcStats(baseEvoHP, multipliers), card.statsEvo.hitpoints);
    card.statsEvo.damage = mergeStats(calcStats(baseEvoDmg, multipliers), card.statsEvo.damage);
    card.statsEvo.cycles = evoData.cycles ?? card.statsEvo.cycles;
}

function extrapolateLevel16(card, multipliers) {
    const extrapolate = (stats) => {
        if (stats && stats.level16 == null && stats.level11 != null) {
            stats.level16 = Math.round((stats.level11 / multipliers.level11) * multipliers.level16);
        }
    };

    ['hitpoints', 'damage', 'fatalDamage', 'chargeDamage', 'towerDamage'].forEach(f => extrapolate(card[f]));
    if (card.statsEvo) {
        ['hitpoints', 'damage'].forEach(f => extrapolate(card.statsEvo[f]));
    }
}

function ensureCardSkeleton(card) {
    Object.keys(CARD_SKELETON).forEach(key => {
        if (!(key in card)) {
            card[key] = cloneDeep(CARD_SKELETON[key]);
        } else if (CARD_SKELETON[key] && typeof CARD_SKELETON[key] === 'object' && !Array.isArray(CARD_SKELETON[key])) {
            Object.keys(CARD_SKELETON[key]).forEach(nested => {
                if (!(nested in card[key])) card[key][nested] = CARD_SKELETON[key][nested];
            });
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    try {
        console.log('Fetching game data...');
        const apiData = await fetchData(API_URL);

        if (!apiData?.items?.spells) throw new Error('Invalid API data structure');

        console.log('Reading cards.json...');
        const cardsJson = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));

        const existingCardsMap = new Map();
        cardsJson.cards.forEach(c => existingCardsMap.set(c.id, { card: c, list: cardsJson.cards }));
        cardsJson.towerCards.forEach(c => existingCardsMap.set(c.id, { card: c, list: cardsJson.towerCards }));

        let updatedCount = 0, addedCount = 0;

        apiData.items.spells.forEach(apiItem => {
            if (apiItem.name.startsWith('Super') || apiItem.notVisible) return;

            const isTower = apiItem.tidType === 'TID_TYPE_TOWER_TROOP' || apiItem.source === 'support_cards';
            const multipliers = isTower ? MULTIPLIERS.tower : MULTIPLIERS.standard;

            let entry = existingCardsMap.get(apiItem.id);
            let card;

            if (!entry) {
                card = cloneDeep(CARD_SKELETON);
                card.id = apiItem.id;
                card.name = apiItem.englishName || apiItem.name;
                card.type = isTower ? 'tower' : 'troop';
                (isTower ? cardsJson.towerCards : cardsJson.cards).push(card);
                addedCount++;
            } else {
                card = entry.card;
                updatedCount++;
            }

            processCard(card, apiItem, multipliers);
        });

        [...cardsJson.cards, ...cardsJson.towerCards].forEach(ensureCardSkeleton);

        console.log('Writing to cards.json...');
        fs.writeFileSync(CARDS_FILE, JSON.stringify(cardsJson, null, 4), 'utf8');

        console.log(`Update complete! Updated: ${updatedCount}, Added: ${addedCount}`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
