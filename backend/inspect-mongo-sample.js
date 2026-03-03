import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        const brand = await mongoose.connection.collection('brands').findOne({});
        const game = await mongoose.connection.collection('games').findOne({});

        console.log("--- BRAND SAMPLE ---");
        console.log(JSON.stringify(brand, null, 2));

        console.log("\n--- GAME SAMPLE ---");
        console.log(JSON.stringify(game, null, 2));
    } catch (e) {
        console.log("Error:", e.message);
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
