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
  phone: { type: Number, unique: true, required: true },
  password: String,
  username: String,
  token: String,
  balance: Number,
  bonus: Number,
  block: Boolean
}, { collection: 'newUsers' });

const User = mongoose.model('User', UserSchema);

async function createWorkingUser() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('✅ Database connected');

    // Delete existing user if any
    await User.deleteOne({ phone: 9999999999 });
    console.log('Cleaned old user data...');

    // Get the last user ID
    const lastUser = await User.find().sort({ id: -1 }).limit(1);
    const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;

    // Hash password
    const hashedPassword = await bcrypt.hash('Test@123', 12);

    // Create new user with all required fields
    const newUser = new User({
      id: newId,
      phone: 9999999999,
      password: hashedPassword,
      username: 'TestUser99',
      token: 'test-token-' + Date.now(),
      balance: 1000,
      bonus: 500,
      block: false
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

createWorkingUser();
