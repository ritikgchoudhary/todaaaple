import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("DB Connected"))
    .catch(err => console.log("DB Error", err));

const genericSchema = new mongoose.Schema({}, { strict: false });
const Brand = mongoose.model('Brand', genericSchema, 'brands');
const Game = mongoose.model('Game', genericSchema, 'games');

function parseValues(valuesStr) {
    const rows = [];
    let currentRow = [];
    let currentVal = '';
    let inQuote = false;
    let quoteChar = '';
    let inTuple = false;

    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];

        if (inTuple) {
            if (inQuote) {
                if (char === quoteChar && (i === 0 || valuesStr[i - 1] !== '\\')) {
                    inQuote = false;
                    currentVal += char;
                } else {
                    currentVal += char;
                }
            } else {
                if (char === "'" || char === '"') {
                    inQuote = true;
                    quoteChar = char;
                    currentVal += char;
                } else if (char === ',') {
                    currentRow.push(cleanValue(currentVal));
                    currentVal = '';
                } else if (char === ')') {
                    currentRow.push(cleanValue(currentVal));
                    rows.push(currentRow);
                    currentRow = [];
                    currentVal = '';
                    inTuple = false;
                } else {
                    currentVal += char;
                }
            }
        } else {
            if (char === '(') {
                inTuple = true;
                currentRow = [];
                currentVal = '';
            }
        }
    }
    return rows;
}

function cleanValue(val) {
    val = val.trim();
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.substring(1, val.length - 1);
        val = val.replace(/\\'/g, "'").replace(/\\"/g, '"');
    }
    if (val === 'NULL') return null;
    if (!isNaN(val) && val !== '') return Number(val);
    return val;
}

async function processFile(filePath, Model) {
    console.log(`Processing ${filePath}...`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Extract INSERT INTO `table` (`col1`, `col2`...) VALUES ...
        // Regex to capture everything
        const insertRegex = /INSERT\s+INTO\s+[`"]?(\w+)[`"]?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?);/gmi;

        let match;
        let total = 0;

        while ((match = insertRegex.exec(content)) !== null) {
            const tableName = match[1];
            const columnsStr = match[2];
            const valuesStr = match[3];

            const columns = columnsStr.split(',').map(c => c.trim().replace(/[`']/g, ''));
            const rows = parseValues(valuesStr);

            console.log(`Found ${rows.length} rows for ${tableName}`);

            for (const row of rows) {
                const doc = {};
                columns.forEach((col, index) => {
                    if (index < row.length) {
                        doc[col] = row[index];
                    }
                });
                await Model.create(doc);
                total++;
            }
        }
        console.log(`Imported ${total} records from ${filePath}`);
    } catch (e) {
        console.error("Error processing file:", e);
    }
}

async function run() {
    await processFile('c:\\todaaapple\\brands.sql', Brand);
    await processFile('c:\\todaaapple\\games.sql', Game);
    console.log("Done.");
    process.exit(0);
}

run();
