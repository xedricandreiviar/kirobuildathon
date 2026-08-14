import { getDb } from '../db.js';

export async function createCard(card) {
  const db = await getDb();
  db.data.cards.push(card);
  await db.write();
  return card;
}

export async function getCardById(id) {
  const db = await getDb();
  return db.data.cards.find((c) => c.id === id) || null;
}

export async function updateCard(id, fields) {
  const db = await getDb();
  const index = db.data.cards.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.data.cards[index] = { ...db.data.cards[index], ...fields };
  await db.write();
  return db.data.cards[index];
}
