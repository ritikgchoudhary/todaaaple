import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        console.log("Connected. Fetching 3 brands...");
        const brands = await mongoose.connection.collection('brands').find().limit(3).toArray();
        for (const brand of brands) {
            console.log("BRAND:");
            console.dir(brand); // Using dir for potentially better formatting
        }

    } catch (e) {
        console.log("Error:", e.message);
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
