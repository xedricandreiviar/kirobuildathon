const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function createCard(data) {
  const res = await fetch(`${API_URL}/api/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.errors?.join(', ') || err.error || 'Failed to create card');
  }
  return res.json();
}

export async function getCard(id) {
  const res = await fetch(`${API_URL}/api/cards/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Card not found');
    throw new Error('Failed to fetch card');
  }
  return res.json();
}
