import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { CardsJson, Card } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CARDS_FILE = path.join(__dirname, '..', 'data', 'cards.json');

console.log('Reading cards.json...');
const data: CardsJson = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));

const propertiesToConvert = [
    'duration', 'hitspeed', 'range', 'radius',
    'deployTime', 'sightRange', 'collisionRadius', 'loadTime',
    'interval', 'speed', 'height', 'distance', 'strength', 'whenNotAttackingTime',
    'rampInterval', 'bounceDistance'
];

function convertIntegersToFloats(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
        return;
    }

    if (Array.isArray(obj)) {
        obj.forEach(item => convertIntegersToFloats(item));
        return;
    }

    for (const key in obj) {
        const value = obj[key];
        if (propertiesToConvert.includes(key) && typeof value === 'number') {
            if (Number.isInteger(value)) {
                console.log(`Converted ${key}: ${value} -> ${value}.0`);
            }
            // No hacemos nada más, el valor ya es el correcto (sea entero o float).
            // La regex posterior se encargará de la representación visual en el JSON.
        } else {
            convertIntegersToFloats(value);
        }
    }
}

console.log('Converting integers to floats...');
convertIntegersToFloats(data);

// Write the modified file with regex replacement to force .0 for floats
let modifiedContent = JSON.stringify(data, null, 4);

propertiesToConvert.forEach(prop => {
    // Search for patterns like "hitspeed": 1, and replace them with "hitspeed": 1.0,
    const regex = new RegExp(`"${prop}":\\s*(\\d+)([,\\n])`, 'g');
    modifiedContent = modifiedContent.replace(regex, `"${prop}": $1.0$2`);
});

fs.writeFileSync(CARDS_FILE, modifiedContent, 'utf8');
console.log('✅ Conversion completed successfully!');
console.log(`The integer values of the following properties have been converted to floats: ${propertiesToConvert.join(', ')}`);
