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

        const user = await mongoose.connection.db.collection('newUsers').findOne({ id: 78461 });

        if (user) {
            console.log('\n--- User Details ---');
            console.log(`Phone: ${user.phone}`);
            console.log(`ID: ${user.id}`);
            console.log(`Token in DB: ${user.token}`);
            console.log('------------------\n');
        } else {
            console.log('User not found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

explore();
