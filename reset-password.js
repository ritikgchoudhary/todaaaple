import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async () => {
  try {
    await mongoose.connect('mongodb+srv://gooe:VGAcsd123@cluster0.sedyanr.mongodb.net/vga3?authSource=admin&replicaSet=atlas-q3z7dw-shard-0&ssl=true', {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    
    console.log('Database connected');
    
    const db = mongoose.connection.db;
    
    // Hash new password
    const newPassword = await bcrypt.hash('Test@123', 12);
    console.log('New hashed password created');
    
    // Update user
    const result = await db.collection('users').updateOne(
      { phone: '9999999999' },
      { $set: { password: newPassword } }
    );
    
    console.log('✅ Password updated successfully!');
    console.log('Modified documents:', result.modifiedCount);
    console.log('');
    console.log('📱 Login Credentials:');
    console.log('─────────────────────');
    console.log('Phone: 9999999999');
    console.log('Password: Test@123');
    console.log('─────────────────────');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
