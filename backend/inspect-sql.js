import fs from 'fs';

function inspectSqlFile(filePath) {
    console.log(`--- Inspecting ${filePath} ---`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let firstInsert = '';

        // simple heuristic to find CREATE TABLE block
        const createTableRegex = /CREATE TABLE\s+[`"]?(\w+)[`"]?\s*\(([\s\S]*?)\)\s*ENGINE/i;
        const match = content.match(createTableRegex);

        if (match) {
            console.log("Table Name:", match[1]);
            console.log("Schema Snippet:", match[2].substr(0, 500).replace(/\s+/g, ' '));
        } else {
            console.log("No CREATE TABLE found or regex mismatch.");
        }

        // find first insert
        for (const line of lines) {
            if (line.trim().startsWith('INSERT INTO')) {
                firstInsert = line;
                break;
            }
        }

        if (firstInsert) {
            console.log("First INSERT:", firstInsert.substring(0, 300));
        } else {
            console.log("No INSERT INTO found.");
        }

    } catch (err) {
        console.error("Error reading file:", err.message);
    }
}

inspectSqlFile('c:\\todaaapple\\brands.sql');
inspectSqlFile('c:\\todaaapple\\games.sql');
