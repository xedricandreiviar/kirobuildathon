import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSONFilePreset } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'db.json');

const defaultData = { cards: [] };

let db;

export async function getDb() {
  if (!db) {
    db = await JSONFilePreset(DB_PATH, defaultData);
  }
  return db;
}
