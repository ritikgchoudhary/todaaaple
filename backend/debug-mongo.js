import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;
mongoose.set('debug', true);
console.log("Checking connection...");
console.log("URI:", DB.replace(/:([^@]+)@/, ":****@"));

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
        console.log("Connection Successful");
        process.exit(0);
    })
    .catch((err) => {
        console.log("FULL ERROR:", err);
        process.exit(1);
    });
