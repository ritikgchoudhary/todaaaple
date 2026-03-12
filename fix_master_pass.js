import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/config.env' });

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {});
    console.log('Database connected');

    const db = mongoose.connection.db;

    // Check users collection for master admin
    // Typically user_type: 1 or something like username: 'masteradmin' or phone: 'masteradmin'
    const users = await db.collection('users').find({ $or: [{ user_type: 1 }, { user_type: '1' }, { role: 1 }, { phone: 'masteradmin' }] }).toArray();
    console.log('Found admins:', users.map(u => ({ phone: u.phone, user_type: u.user_type })));

    if (users.length === 0) {
      console.log('No master admin found to update.');
      process.exit(1);
    }
    
    const adminPhone = users[0].phone;
    
    // Hash new password
    const newPassword = await bcrypt.hash('Aman@123', 12);
    console.log('New hashed password created');

    // Update user
    const result = await db.collection('users').updateOne(
      { phone: adminPhone },
      { $set: { password: newPassword } }
    );

    console.log(`✅ Password updated successfully for user ${adminPhone}!`);
    console.log('Modified documents:', result.modifiedCount);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
