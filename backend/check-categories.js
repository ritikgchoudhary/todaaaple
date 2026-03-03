import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        console.log("Connected. Fetching distinct categories...");
        const categories = await mongoose.connection.collection('games').distinct('category');
        console.log("Distinct Categories in DB:", categories);

        // Also check brands categories just in case
        const brandCats = await mongoose.connection.collection('brands').distinct('brand_cat');
        console.log("Distinct Brand Categories:", brandCats);

    } catch (e) {
        console.log("Error:", e.message);
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
