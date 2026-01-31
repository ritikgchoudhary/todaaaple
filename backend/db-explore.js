import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

async function explore() {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to Database');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n--- Collections and Counts ---');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`${col.name}: ${count}`);
        }

        console.log('\n--- Latest 5 Users ---');
        const users = await mongoose.connection.db.collection('newUsers').find().sort({ _id: -1 }).limit(5).toArray();
        users.forEach(u => {
            console.log(`- Phone: ${u.phone}, Balance: ${u.balance}, ID: ${u.id}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

explore();
