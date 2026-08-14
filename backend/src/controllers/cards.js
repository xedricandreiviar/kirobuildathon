import { nanoid } from 'nanoid';
import { validateCard, sanitizeCard, sanitizePartialCard } from '../model.js';
import { createCard, getCardById, updateCard } from '../storage/cards.js';

export async function handleCreateCard(req, res) {
  const errors = validateCard(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const now = new Date().toISOString();
  const card = {
    id: nanoid(10),
    ...sanitizeCard(req.body),
    createdAt: now,
    updatedAt: now,
  };

  await createCard(card);
  res.status(201).json(card);
}

export async function handleGetCard(req, res) {
  const card = await getCardById(req.params.id);

  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }

  res.json(card);
}

export async function handleUpdateCard(req, res) {
  const existing = await getCardById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Card not found' });
  }

  const errors = validateCard(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const fields = {
    ...sanitizePartialCard(req.body),
    updatedAt: new Date().toISOString(),
  };

  const updated = await updateCard(req.params.id, fields);
  res.json(updated);
}

export function handleHealthCheck(req, res) {
  res.json({ status: 'ok' });
}
