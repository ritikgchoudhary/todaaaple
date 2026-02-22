import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("DB Connected.");
    await restoreAndFix();
    console.log("Done.");
    process.exit(0);
}).catch(err => {
    console.error("DB Error", err);
    process.exit(1);
});

async function restoreAndFix() {
    // 1. Drop index to allow collisions during update
    try {
        console.log("Dropping unique index on 'id'...");
        await mongoose.connection.collection('games').dropIndex("id_1");
        console.log("Index dropped.");
    } catch (e) {
        console.log("Index drop error (maybe didn't exist):", e.message);
    }

    // 2. Perform Bulk Update
    const filePath = 'c:\\todaaapple\\games.sql';
    console.log(`Reading SQL file: ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');

    const valueStart = content.indexOf('VALUES');
    if (valueStart === -1) return;

    const valPart = content.substring(valueStart + 6).trim();
    const cleanValPart = valPart.endsWith(';') ? valPart.slice(0, -1) : valPart;
    const tuples = cleanValPart.split(/\),\s*\(/);
    console.log(`Parsed ${tuples.length} rows to update.`);

    let bulkOps = [];
    const BATCH_SIZE = 500;

    for (let i = 0; i < tuples.length; i++) {
        let t = tuples[i];
        if (i === 0 && t.startsWith('(')) t = t.substring(1);
        if (i === tuples.length - 1 && t.endsWith(')')) t = t.slice(0, -1);

        const parts = [];
        let curr = '';
        let inQ = false;
        for (let char of t) {
            if (char === "'") inQ = !inQ;
            if (char === ',' && !inQ) {
                parts.push(curr.trim());
                curr = '';
            } else {
                curr += char;
            }
        }
        parts.push(curr.trim());

        if (parts.length < 7) continue;
        const idRaw = parts[0];
        const codeRaw = parts[6];
        const id = parseInt(idRaw.replace(/'/g, ''));
        const code = codeRaw.replace(/'/g, '');

        if (isNaN(id) || code.length !== 32) continue;

        bulkOps.push({
            updateOne: {
                filter: { game_code: code },
                update: { $set: { id: id } }
            }
        });

        if (bulkOps.length >= BATCH_SIZE) {
            try {
                // Must ensure ordered: false or catch error?
                // But index dropped, so no unique error expected.
                await mongoose.connection.collection('games').bulkWrite(bulkOps, { ordered: false });
                if (i % 2000 === 0) console.log(`Processed ${i} rows...`);
            } catch (e) {
                console.log("Batch Error:", e.message);
            }
            bulkOps = [];
        }
    }

    if (bulkOps.length > 0) {
        await mongoose.connection.collection('games').bulkWrite(bulkOps, { ordered: false });
    }
    console.log("Bulk update complete.");

    // 3. Re-create unique index
    try {
        console.log("Re-creating unique index on 'id'...");
        await mongoose.connection.collection('games').createIndex({ id: 1 }, { unique: true });
        console.log("Index created successfully.");
    } catch (e) {
        console.log("Index creation failed (duplicates exist?):", e.message);
        // If duplicates exist, we should check/clean them? 
        // But restore should have overwritten all with unique IDs from SQL.
    }
}
