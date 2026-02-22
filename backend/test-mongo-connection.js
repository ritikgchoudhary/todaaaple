import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

async function testConnection() {
    const uri = process.env.DATABASE;
    console.log("Testing connection to:", uri.replace(/:([^@]+)@/, ":****@")); // Mask password

    const options = [
        { name: "Default Options", useUrlParser: true, useUnifiedTopology: true },
        { name: "No AuthSource", useUrlParser: true, useUnifiedTopology: true },
        { name: "Admin AuthSource", useUrlParser: true, useUnifiedTopology: true, authSource: 'admin' }
    ];

    for (const opt of options) {
        console.log(`\n--- Trying: ${opt.name} ---`);
        try {
            // Split URI to try without database name if needed
            const baseUri = uri.split('?')[0].split('/').slice(0, 3).join('/') + '/?retryWrites=true&w=majority';

            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
            });
            console.log("✅ SUCCESS: Connected to database!");
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log("Collections found:", collections.map(c => c.name));
            await mongoose.disconnect();
            return;
        } catch (err) {
            console.log(`❌ FAILED: ${err.message}`);
            if (err.codeName) console.log(`Code Name: ${err.codeName}`);
            if (err.code) console.log(`Code: ${err.code}`);
        }
    }

    console.log("\nTrying without database name...");
    try {
        const parts = uri.split('/');
        // mongodb+srv://user:pass@host/dbname?query
        const noDbUri = parts[0] + '//' + parts[2] + '/?authSource=admin';
        console.log("Testing URI:", noDbUri.replace(/:([^@]+)@/, ":****@"));
        await mongoose.connect(noDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ SUCCESS: Connected to Cluster (No specific DB)!");
        const dbs = await mongoose.connection.db.admin().listDatabases();
        console.log("Databases available:", dbs.databases.map(d => d.name));
        await mongoose.disconnect();
    } catch (err) {
        console.log(`❌ ALL ATTEMPTS FAILED: ${err.message}`);
    }
}

testConnection();
