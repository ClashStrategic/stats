const levelBasedStats = {
    type: 'object',
    properties: {
        level11: { type: 'number', nullable: true },
        level16: { type: 'number', nullable: true },
    },
    required: ['level11', 'level16'],
    additionalProperties: false,
};
const skillsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        heal: {
            type: 'object',
            properties: {
                perAttack: levelBasedStats,
                frequency: { type: 'number', nullable: true },
                overHeal: levelBasedStats,
                onSpawn: levelBasedStats,
            },
            required: ['perAttack', 'frequency', 'overHeal', 'onSpawn'],
            additionalProperties: false,
        },
        stun: {
            type: 'object',
            properties: {
                hitSpeedMultiplier: { type: 'number', nullable: true },
                speedMultiplier: { type: 'number', nullable: true },
                spawnSpeedMultiplier: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
            },
            required: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
            additionalProperties: false,
        },
        slow: {
            type: 'object',
            properties: {
                hitSpeedMultiplier: { type: 'number', nullable: true },
                speedMultiplier: { type: 'number', nullable: true },
                spawnSpeedMultiplier: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
            },
            required: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
            additionalProperties: false,
        },
        pushback: {
            type: 'object',
            properties: {
                distance: { type: 'number', nullable: true },
                strength: { type: 'number', nullable: true },
            },
            required: ['distance', 'strength'],
            additionalProperties: false,
        },
        shield: {
            type: 'object',
            properties: {
                hitpoints: { ...levelBasedStats, nullable: true },
                damageReductionPercent: { type: 'number', nullable: true },
            },
            required: ['hitpoints', 'damageReductionPercent'],
            additionalProperties: false,
        },
        dash: {
            type: 'object',
            properties: {
                damage: levelBasedStats,
                minRange: { type: 'number', nullable: true },
                maxRange: { type: 'number', nullable: true },
            },
            required: ['damage', 'minRange', 'maxRange'],
            additionalProperties: false,
        },
        charge: {
            type: 'object',
            properties: {
                damage: levelBasedStats,
                range: { type: 'number', nullable: true },
                speedMultiplier: { type: 'number', nullable: true },
            },
            required: ['damage', 'range', 'speedMultiplier'],
            additionalProperties: false,
        },
        jump: {
            type: 'object',
            properties: {
                height: { type: 'number', nullable: true },
                speed: { type: 'number', nullable: true },
            },
            required: ['height', 'speed'],
            additionalProperties: false,
        },
        invisibility: {
            type: 'object',
            properties: {
                whenNotAttackingTime: { type: 'number', nullable: true },
            },
            required: ['whenNotAttackingTime'],
            additionalProperties: false,
        },
        'spawn-on-death': {
            type: 'object',
            properties: {
                character: { type: ['string', 'boolean'], nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                radius: { type: 'number', nullable: true },
                deployTime: { type: 'number', nullable: true },
            },
            required: ['character', 'damage', 'radius', 'deployTime'],
            additionalProperties: false,
        },
        'periodic-spawn': {
            type: 'object',
            properties: {
                pauseTime: { type: 'number', nullable: true },
                character: { type: 'string', nullable: true },
                units: { type: 'number', nullable: true },
            },
            required: ['pauseTime', 'character', 'units'],
            additionalProperties: false,
        },
        'area-damage-on-death': {
            type: 'object',
            properties: {
                areaEffect: { type: ['string', 'boolean'], nullable: true },
                damage: { ...levelBasedStats, nullable: true },
                radius: { type: 'number', nullable: true },
            },
            required: ['areaEffect', 'damage', 'radius'],
            additionalProperties: false,
        },
        ability: {
            type: 'object',
            properties: {
                name: { type: 'string', nullable: true },
                elixirCost: { type: 'number', nullable: true },
                cooldown: { type: 'number', nullable: true },
                skills: { $ref: '#/$defs/abilitySkills' },
            },
            required: ['name', 'elixirCost', 'cooldown', 'skills'],
            additionalProperties: false,
        },
        pierce: {
            type: 'object',
            properties: {
                radius: { type: 'number', nullable: true },
                range: { type: 'number', nullable: true },
            },
            required: ['radius', 'range'],
            additionalProperties: false,
        },
        boost: {
            type: 'object',
            properties: {
                hitSpeedMultiplier: { type: 'number', nullable: true },
                speedMultiplier: { type: 'number', nullable: true },
                spawnSpeedMultiplier: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
            },
            required: ['hitSpeedMultiplier', 'speedMultiplier', 'spawnSpeedMultiplier', 'duration'],
            additionalProperties: false,
        },
        burrow: {
            type: 'object',
            properties: {
                duration: { type: 'number', nullable: true },
            },
            required: ['duration'],
            additionalProperties: false,
        },
        multiply: {
            type: 'object',
            properties: {
                units: { type: 'number', nullable: true },
                interval: { type: 'number', nullable: true },
                maxUnits: { type: 'number', nullable: true },
            },
            required: ['units', 'interval', 'maxUnits'],
            additionalProperties: false,
        },
        reflect: {
            type: 'object',
            properties: {
                damageReductionPercent: { type: 'number', nullable: true },
                duration: { type: 'number', nullable: true },
                radius: { type: 'number', nullable: true },
            },
            required: ['damageReductionPercent', 'duration', 'radius'],
            additionalProperties: false,
        },
        'ramping-damage': {
            type: 'object',
            properties: {
                rampInterval: { type: 'number', nullable: true },
                damageTiers: {
                    type: 'array',
                    items: levelBasedStats,
                },
            },
            required: ['rampInterval', 'damageTiers'],
            additionalProperties: false,
        },
    },
};
const { ability: _, ...abilitySkillsProperties } = skillsSchema.properties;
const abilitySkillsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: abilitySkillsProperties,
};
const cardObjectSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', nullable: true },
        id: { type: 'number', nullable: true },
        elixirCost: { type: 'number', nullable: true },
        targets: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['ground', 'air', 'buildings'],
            },
        },
        units: { type: 'number' },
        duration: { type: 'number', nullable: true },
        evolution: { type: 'boolean' },
        hero: { type: 'boolean' },
        hitType: { type: 'string', nullable: true },
        projectile: { type: 'boolean' },
        projectileNumber: { type: 'number', nullable: true },
        kamikaze: { type: 'boolean' },
        flying: { type: 'boolean' },
        skills: { $ref: '#/$defs/skills' },
        towerDamage: levelBasedStats,
        damage: levelBasedStats,
        hitpoints: levelBasedStats,
        evoStats: {
            type: 'object',
            properties: {
                cycles: { type: 'number', nullable: true },
                skills: { $ref: '#/$defs/skills' },
                towerDamage: levelBasedStats,
                damage: levelBasedStats,
                hitpoints: levelBasedStats,
            },
            required: ['cycles', 'skills', 'towerDamage', 'damage', 'hitpoints'],
            additionalProperties: false,
        },
        heroStats: {
            type: 'object',
            properties: {
                skills: { $ref: '#/$defs/skills' },
            },
            required: ['skills'],
            additionalProperties: false,
        },
        hitspeed: { type: 'number', nullable: true },
        loadTime: { type: 'number', nullable: true },
        radius: { type: 'number', nullable: true },
        collisionRadius: { type: 'number', nullable: true },
        speed: {
            type: 'string',
            nullable: true,
            enum: ['slow', 'medium', 'fast', 'very-fast', null],
        },
        range: { type: 'number', nullable: true },
        sightRange: { type: 'number', nullable: true },
        placement: {
            type: 'string',
            nullable: true,
            enum: ['anywhere', 'own-side', null],
        },
        rarity: {
            type: 'string',
            nullable: true,
            enum: ['common', 'rare', 'epic', 'legendary', 'champion', '', null],
        },
        type: {
            type: 'string',
            nullable: true,
            enum: ['troop', 'building', 'spell', 'tower', null],
        },
        unlockArena: { type: 'string', nullable: true },
        tribe: { type: 'string', nullable: true },
        deployTime: { type: 'number', nullable: true },
    },
    required: [
        'name', 'id', 'elixirCost', 'targets', 'units', 'duration',
        'evolution', 'hero', 'hitType', 'projectile', 'kamikaze', 'flying', 'skills',
        'towerDamage', 'damage', 'hitpoints', 'evoStats', 'heroStats',
        'hitspeed', 'loadTime', 'radius', 'collisionRadius', 'speed',
        'range', 'sightRange', 'placement', 'rarity', 'type', 'unlockArena', 'tribe', 'deployTime'
    ],
};
const towerCardObjectSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: { type: 'string', nullable: true },
        id: { type: 'number', nullable: true },
        targets: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['ground', 'air', 'buildings'],
            },
        },
        units: { type: 'number' },
        hitType: { type: 'string', nullable: true },
        projectile: { type: 'boolean' },
        projectileNumber: { type: 'number', nullable: true },
        skills: { $ref: '#/$defs/skills' },
        damage: levelBasedStats,
        hitpoints: levelBasedStats,
        hitspeed: { type: 'number', nullable: true },
        collisionRadius: { type: 'number', nullable: true },
        speed: {
            type: 'string',
            nullable: true,
            enum: ['slow', 'medium', 'fast', 'very-fast', null],
        },
        range: { type: 'number', nullable: true },
        sightRange: { type: 'number', nullable: true },
        rarity: {
            type: 'string',
            nullable: true,
            enum: ['common', 'rare', 'epic', 'legendary', 'champion', '', null],
        },
        type: {
            type: 'string',
            nullable: true,
            enum: ['troop', 'building', 'spell', 'tower', null],
        },
        unlockArena: { type: 'string', nullable: true },
        tribe: { type: 'string', nullable: true },
    },
    required: [
        'name', 'id', 'targets', 'units', 'hitType', 'projectile', 'skills',
        'damage', 'hitpoints', 'hitspeed', 'collisionRadius', 'speed',
        'range', 'sightRange', 'rarity', 'type', 'unlockArena', 'tribe'
    ],
};
export const cardSchema = {
    type: 'object',
    $defs: {
        skills: skillsSchema,
        abilitySkills: abilitySkillsSchema,
    },
    properties: {
        cards: {
            type: 'array',
            items: cardObjectSchema,
        },
        towerCards: {
            type: 'array',
            items: towerCardObjectSchema,
        },
    },
    required: ['cards', 'towerCards'],
    additionalProperties: false,
};
