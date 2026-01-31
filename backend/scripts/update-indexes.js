import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createIndexes, verifyIndexes } from '../utils/createIndexes.js';

// Load environment variables
dotenv.config({ path: '../config.env' });

const DB = process.env.DATABASE;

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    
    console.log('Connection successful!');
    
    // Create all indexes
    console.log('Creating indexes...');
    const indexResult = await createIndexes();
    
    if (indexResult) {
      console.log('All indexes created successfully!');
    } else {
      console.log('Some indexes may not have been created properly.');
    }
    
    // Verify indexes were created
    console.log('\nVerifying indexes...');
    await verifyIndexes();
    
    console.log('\nIndex update complete.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

// Run the script
main(); 