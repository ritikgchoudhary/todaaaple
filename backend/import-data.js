import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

// Connect to MongoDB
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("DB Connected"))
    .catch(err => console.log("DB Error", err));

// Schema Definition (Flexible to accept SQL data)
const brandSchema = new mongoose.Schema({}, { strict: false });
const Brand = mongoose.model('Brand', brandSchema, 'brands'); // collection: brands

const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games'); // collection: games

async function processFile(filePath, Model) {
    console.log(`Processing ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let count = 0;

    for (let line of lines) {
        if (line.trim().startsWith('INSERT INTO')) {
            // Regex to capture: INSERT INTO `table` (`col1`, `col2`...) VALUES (val1, val2...), (val3, val4...);
            // This is complex. Simplified approach:
            // 1. Extract columns part between first ( and ) before VALUES
            // 2. Extract values part after VALUES

            const valueStart = line.indexOf('VALUES');
            if (valueStart === -1) continue;

            const colPart = line.substring(0, valueStart);
            const valPart = line.substring(valueStart + 6).trim();

            // Extract columns
            const colMatch = colPart.match(/\((.*?)\)/);
            if (!colMatch) continue;

            const columns = colMatch[1].split(',').map(c => c.trim().replace(/[`']/g, ''));

            // Extract values groups: (v1, v2), (v3, v4)
            // Need to handle commas inside quotes.
            // Using a simple regex to match (...) groups
            const valueGroups = valPart.match(/\((.*?)\)/g);

            if (valueGroups) {
                for (let group of valueGroups) {
                    // Remove outer parens
                    let cleanGroup = group.substring(1, group.length - 1);

                    // Split by comma, respecting quotes? 
                    // Simple split by comma might fail on strings with commas.
                    // But usually SQL dumps use single quotes for strings.
                    // Let's implement a basic CSV-like parser for SQL values
                    const values = [];
                    let current = '';
                    let inQuote = false;

                    for (let i = 0; i < cleanGroup.length; i++) {
                        const char = cleanGroup[i];
                        if (char === "'" && (i === 0 || cleanGroup[i - 1] !== '\\')) {
                            inQuote = !inQuote;
                        }
                        if (char === ',' && !inQuote) {
                            values.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    values.push(current.trim()); // push last value

                    // Map columns to values
                    const doc = {};
                    columns.forEach((col, index) => {
                        let val = values[index];
                        if (val) {
                            // Remove SQL quotes
                            if (val.startsWith("'") && val.endsWith("'")) {
                                val = val.substring(1, val.length - 1);
                                val = val.replace(/\\'/g, "'"); // unescape
                            }
                            if (val === 'NULL') val = null;
                            // Parse numbers
                            if (!isNaN(val) && val !== '' && val !== null) val = Number(val);
                        }
                        doc[col] = val;
                    });

                    try {
                        await Model.create(doc);
                        count++;
                    } catch (e) {
                        // console.error("Insert Error:", e.message);
                    }
                }
            }
        }
    }
    console.log(`Imported ${count} records into ${Model.modelName}.`);
}

async function run() {
    await processFile('c:\\todaaapple\\brands.sql', Brand);
    await processFile('c:\\todaaapple\\games.sql', Game);
    console.log("Done.");
    process.exit(0);
}

run();
