import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

console.log("Connecting to DB...");

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
    })
    .then(async () => {
        console.log("Connection Successful. Fetching collections...");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`Total Collections (Tables): ${collections.length}`);
        console.log("------------------------------------------------");
        collections.forEach((col, index) => {
            console.log(`${index + 1}. ${col.name}`);
        });
        console.log("------------------------------------------------");
        process.exit(0);
    })
    .catch((err) => {
        console.log("Error:", err);
        process.exit(1);
    });
