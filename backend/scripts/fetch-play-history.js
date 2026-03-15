/**
 * Fetch and print play history for a user ID (for debugging).
 * Run from backend: node scripts/fetch-play-history.js <userId>
 * Example: node scripts/fetch-play-history.js 75645
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

await import('../db/conn.js');
import mongoose from 'mongoose';
const { getPlayHistoryList } = await import('../controller/bidData.js');

const userId = process.argv[2];
if (!userId) {
  console.log('Usage: node scripts/fetch-play-history.js <userId>');
  process.exit(1);
}

// Wait for DB connection (up to 5s)
for (let i = 0; i < 50; i++) {
  if (mongoose.connection.readyState === 1) break;
  await new Promise((r) => setTimeout(r, 100));
}
if (mongoose.connection.readyState !== 1) {
  console.error('DB not connected');
  process.exit(1);
}

try {
  const list = await getPlayHistoryList(userId);
  console.log('User ID:', userId);
  console.log('Play history count:', list.length);
  if (list.length > 0) {
    console.log('Sample (first 5):');
    list.slice(0, 5).forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.game || '?'} | ${e.credit ? '+' : '-'}${e.amount} | ${e.date} | ${(e.note || '').slice(0, 40)}`);
    });
  } else {
    console.log('No play history entries found (PlayHistory doc or walletHistory game entries).');
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
process.exit(0);
