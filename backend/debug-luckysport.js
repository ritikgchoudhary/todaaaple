import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        console.log("Searching for LuckySport...");
        const brand = await mongoose.connection.collection('brands').findOne({ brand_title: { $regex: 'Lucky', $options: 'i' } });

        if (!brand) {
            console.log("LuckySport brand not found!");
        } else {
            console.log("Found Brand:", brand.brand_title, "ID:", brand.brand_id);
            const count = await mongoose.connection.collection('games').countDocuments({ brand_id: brand.brand_id });
            console.log(`Found ${count} games for ${brand.brand_title} (ID: ${brand.brand_id})`);

            const sampleGames = await mongoose.connection.collection('games').find({ brand_id: brand.brand_id }).limit(5).toArray();
            console.log("Sample Games:", JSON.stringify(sampleGames, null, 2));
        }

    } catch (e) {
        console.log("Error:", e.message);
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
