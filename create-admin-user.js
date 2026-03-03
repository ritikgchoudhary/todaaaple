import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async () => {
  try {
    const DB = 'mongodb+srv://vga:VGAcsd%40123@cluster0.ajpp8tr.mongodb.net/vga3?appName=Cluster0&authSource=admin';
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log('Database connected');

    const db = mongoose.connection.db;

    // Use correct collection name: newUsers
    const collection = db.collection('newUsers');

    // Check if special admin user exists
    const existingAdmin = await collection.findOne({ phone: 9988776655 });

    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      const newPassword = await bcrypt.hash('Test@123', 12);

      await collection.updateOne(
        { phone: 9988776655 },
        { $set: { password: newPassword } }
      );

      console.log('✅ Admin password updated!');
    } else {
      console.log('Creating new admin user...');
      const newPassword = await bcrypt.hash('Test@123', 12);

      // Get highest ID
      const lastUser = await collection.findOne({}, { sort: { id: -1 } });
      const newId = (lastUser?.id || 0) + 1;

      await collection.insertOne({
        id: newId,
        phone: 9988776655,
        password: newPassword,
        username: 'AdminUser',
        token: 'admin-token-' + Date.now(),
        date: new Date(),
        balance: 0,
        bonus: 0,
        level0: [],
        level1: [],
        level2: [],
        level3: [],
        level4: [],
        level5: [],
        level6: [],
        level7: [],
        level8: []
      });

      console.log('✅ Admin user created in newUsers collection!');
    }

    console.log('');
    console.log('📱 Login Credentials:');
    console.log('─────────────────────');
    console.log('Phone: 9988776655');
    console.log('Password: Test@123');
    console.log('─────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
