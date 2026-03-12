import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/config.env' });

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {});
    const db = mongoose.connection.db;
    
    const sampleUser = await db.collection('users').findOne({});
    console.log('Sample User Keys:', Object.keys(sampleUser));
    console.log('Sample User values:', sampleUser);
    
    // Find who might be the master admin by finding the first user or checking 'masteradmin' collection
    const admins = await db.collection('users').find({ phone: '9999999999' }).toArray();
    console.log('9999999999 user:', admins.map(u => ({ phone: u.phone, user_type: u.user_type, role: u.role })));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
