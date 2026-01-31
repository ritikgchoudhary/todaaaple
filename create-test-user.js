import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, './backend/config.env') });

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  password: String,
  username: String,
  token: String,
  // ... other fields
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function createTestUser() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Database connected');

    // Check if user exists
    const existing = await User.findOne({ phone: '9999999999' });
    if (existing) {
      console.log('✅ User already exists!');
      console.log('Phone: 9999999999');
      console.log('Password: Test@123');
      await mongoose.disconnect();
      return;
    }

    // Get the last user ID
    const lastUser = await User.find().sort({ id: -1 }).limit(1);
    const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

    // Hash password
    const hashedPassword = await bcrypt.hash('Test@123', 12);

    // Create new user
    const newUser = new User({
      id: newId,
      phone: '9999999999',
      password: hashedPassword,
      username: 'TestUser99',
      token: 'test-token-' + Date.now()
    });

    await newUser.save();
    console.log('✅ Test user created successfully!');
    console.log('\n📱 Login Credentials:');
    console.log('─────────────────────');
    console.log('Phone: 9999999999');
    console.log('Password: Test@123');
    console.log('─────────────────────\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();
