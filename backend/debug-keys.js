import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        console.log("Connected. Fetching 1 brand...");
        const brands = await mongoose.connection.collection('brands').find().limit(1).toArray();
        if (brands.length > 0) {
            console.log("BRAND KEYS:", Object.keys(brands[0]));
            console.log("BRAND DATA:", JSON.stringify(brands[0], null, 2));
        } else {
            console.log("No brands found");
        }

    } catch (e) {
        console.log("Error:", e.message);
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
