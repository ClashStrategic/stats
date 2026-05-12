/**
 * @fileoverview This script converts integer values to floats for specific properties in the cards.json file.
 * The script reads the cards.json file, processes its content to find and convert the specified properties,
 * and then writes the changes back to the file. This is useful for ensuring that certain numerical
 * values are always treated as floating-point numbers.
 *
 * To run this script, use the following command:
 * node scripts/convert-to-floats.js
 */

const fs = require('fs');
const path = require('path');

// Function to convert integers to floats in the specified properties
function convertIntegersToFloats(obj) {
    // Properties that should be converted from integer to float
    const targetProperties = ['duration', 'generationSpeed', 'hitspeed', 'range', 'radius', 'whenNotAttackingTime', 'deployTime', 'loadTime', 'sightRange', 'collisionRadius'];

    if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
            // If it is an array, process each element
            return obj.map(item => convertIntegersToFloats(item));
        } else {
            // If it is an object, process each property
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                if (targetProperties.includes(key) && typeof value === 'number' && Number.isInteger(value) && value !== null) {
                    // Convert integer to float
                    result[key] = value * 1.0;
                    console.log(`Converted ${key}: ${value} -> ${result[key]}`);
                } else {
                    // Recursively process nested objects
                    result[key] = convertIntegersToFloats(value);
                }
            }
            return result;
        }
    }

    return obj;
}

// Main function
function main() {
    try {
        // Read the cards.json file
        const filePath = path.join(__dirname + '/../', 'cards.json');

        if (!fs.existsSync(filePath)) {
            console.error('Error: The cards.json file does not exist in the current directory');
            process.exit(1);
        }

        console.log('Reading cards.json...');
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Parse the JSON
        const data = JSON.parse(fileContent);

        console.log('Converting integers to floats...');

        // Convert integers to floats
        const convertedData = convertIntegersToFloats(data);

        // Write the modified file
        let modifiedContent = JSON.stringify(convertedData, null, 4);

        // Replace integers with floats in the specific properties
        const targetProperties = ['duration', 'generationSpeed', 'hitspeed', 'range', 'radius', 'whenNotAttackingTime', 'deployTime', 'loadTime', 'sightRange', 'collisionRadius'];
        targetProperties.forEach(prop => {
            // Search for patterns like "hitspeed": 1, and replace them with "hitspeed": 1.0,
            const regex = new RegExp(`"${prop}":\\s*(\\d+)([,\\n])`, 'g');
            modifiedContent = modifiedContent.replace(regex, `"${prop}": $1.0$2`);
        });

        fs.writeFileSync(filePath, modifiedContent);

        console.log('✅ Conversion completed successfully!');
        console.log('The integer values of the duration, generationSpeed, hitspeed, range, and radius properties have been converted to floats.');

    } catch (error) {
        console.error('❌ Error during conversion:', error.message);
        process.exit(1);
    }
}

// Execute the script
if (require.main === module) {
    main();
}

module.exports = { convertIntegersToFloats };
