const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Card {
  id: string;
  fullName: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContacts: EmergencyContact[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export class CardNotFoundError extends Error {
  constructor(id: string) {
    super(`Card not found: ${id}`);
    this.name = 'CardNotFoundError';
  }
}

export class CardFetchError extends Error {
  public status: number;
  constructor(status: number) {
    super(`Failed to fetch card: HTTP ${status}`);
    this.name = 'CardFetchError';
    this.status = status;
  }
}

export async function fetchCard(id: string): Promise<Card> {
  if (!id || id.trim() === '') {
    throw new CardNotFoundError(id);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE}/api/cards/${id}`, {
      signal: controller.signal,
    });

    if (response.status === 404) {
      throw new CardNotFoundError(id);
    }

    if (!response.ok) {
      throw new CardFetchError(response.status);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
