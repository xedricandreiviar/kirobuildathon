import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSONFilePreset } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));

// On Vercel, filesystem is read-only except /tmp
const DB_PATH = process.env.VERCEL === '1'
  ? '/tmp/db.json'
  : join(__dirname, '..', 'db.json');

const defaultData = { cards: [] };

let db;

export async function getDb() {
  if (!db) {
    db = await JSONFilePreset(DB_PATH, defaultData);
  }
  return db;
}
