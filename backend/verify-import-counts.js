import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        const brandsCount = await mongoose.connection.collection('brands').countDocuments();
        const gamesCount = await mongoose.connection.collection('games').countDocuments();
        console.log(`Brands: ${brandsCount}`);
        console.log(`Games: ${gamesCount}`);
    } catch (e) {
        console.log("Error counting:", e.message);
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
