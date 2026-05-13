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

const propertiesToConvert = ['duration', 'generationSpeed', 'hitspeed', 'range', 'radius', 'deployTime', 'sightRange', 'collisionRadius', 'loadTime'];

function convertIntegersToFloats(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
        return;
    }

    for (const key in obj) {
        if (propertiesToConvert.includes(key) && typeof obj[key] === 'number') {
            const originalValue = obj[key];
            obj[key] = parseFloat(originalValue.toFixed(1));
            if (Number.isInteger(originalValue)) {
                console.log(`Converted ${key}: ${originalValue} -> ${obj[key]}`);
            }
        } else {
            convertIntegersToFloats(obj[key]);
        }
    }
}

console.log('Converting integers to floats...');
convertIntegersToFloats(data);

fs.writeFileSync(CARDS_FILE, JSON.stringify(data, null, 4));
console.log('✅ Conversion completed successfully!');
console.log('The integer values of the duration, generationSpeed, hitspeed, range, and radius properties have been converted to floats.');
