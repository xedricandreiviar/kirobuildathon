/**
 * Card data shape (from BRD §7):
 *
 * {
 *   id: string (nanoid)
 *   fullName: string (required)
 *   bloodType: string (required)
 *   allergies: string[] (optional)
 *   conditions: string[] (optional)
 *   medications: string[] (optional)
 *   emergencyContacts: [{ name: string, relationship: string, phone: string }] (at least 1 required, name+phone required)
 *   notes: string (optional)
 *   createdAt: string (ISO timestamp)
 *   updatedAt: string (ISO timestamp)
 * }
 */

export function validateCard(body, { partial = false } = {}) {
  const errors = [];

  if (!partial) {
    if (!body.fullName || typeof body.fullName !== 'string' || !body.fullName.trim()) {
      errors.push('fullName is required');
    }

    if (!body.bloodType || typeof body.bloodType !== 'string' || !body.bloodType.trim()) {
      errors.push('bloodType is required');
    }

    if (!Array.isArray(body.emergencyContacts) || body.emergencyContacts.length === 0) {
      errors.push('At least 1 emergency contact is required');
    } else {
      validateContacts(body.emergencyContacts, errors);
    }
  } else {
    // Partial update — only validate fields that are present
    if ('fullName' in body && (!body.fullName || typeof body.fullName !== 'string' || !body.fullName.trim())) {
      errors.push('fullName must be a non-empty string');
    }

    if ('bloodType' in body && (!body.bloodType || typeof body.bloodType !== 'string' || !body.bloodType.trim())) {
      errors.push('bloodType must be a non-empty string');
    }

    if ('emergencyContacts' in body) {
      if (!Array.isArray(body.emergencyContacts) || body.emergencyContacts.length === 0) {
        errors.push('At least 1 emergency contact is required');
      } else {
        validateContacts(body.emergencyContacts, errors);
      }
    }

    if ('allergies' in body && !Array.isArray(body.allergies)) {
      errors.push('allergies must be an array of strings');
    }

    if ('conditions' in body && !Array.isArray(body.conditions)) {
      errors.push('conditions must be an array of strings');
    }

    if ('medications' in body && !Array.isArray(body.medications)) {
      errors.push('medications must be an array of strings');
    }
  }

  return errors;
}

function validateContacts(contacts, errors) {
  contacts.forEach((contact, i) => {
    if (!contact.name || !contact.name.trim()) {
      errors.push(`emergencyContacts[${i}].name is required`);
    }
    if (!contact.phone || !contact.phone.trim()) {
      errors.push(`emergencyContacts[${i}].phone is required`);
    }
  });
}

export function sanitizeCard(body) {
  return {
    fullName: body.fullName.trim(),
    bloodType: body.bloodType.trim(),
    allergies: Array.isArray(body.allergies)
      ? body.allergies.map((a) => a.trim()).filter(Boolean)
      : [],
    conditions: Array.isArray(body.conditions)
      ? body.conditions.map((c) => c.trim()).filter(Boolean)
      : [],
    medications: Array.isArray(body.medications)
      ? body.medications.map((m) => m.trim()).filter(Boolean)
      : [],
    emergencyContacts: body.emergencyContacts.map((c) => ({
      name: c.name.trim(),
      relationship: c.relationship?.trim() || '',
      phone: c.phone.trim(),
    })),
    notes: body.notes?.trim() || '',
  };
}

export function sanitizePartialCard(body) {
  const sanitized = {};

  if ('fullName' in body) sanitized.fullName = body.fullName.trim();
  if ('bloodType' in body) sanitized.bloodType = body.bloodType.trim();
  if ('allergies' in body) sanitized.allergies = body.allergies.map((a) => a.trim()).filter(Boolean);
  if ('conditions' in body) sanitized.conditions = body.conditions.map((c) => c.trim()).filter(Boolean);
  if ('medications' in body) sanitized.medications = body.medications.map((m) => m.trim()).filter(Boolean);
  if ('emergencyContacts' in body) {
    sanitized.emergencyContacts = body.emergencyContacts.map((c) => ({
      name: c.name.trim(),
      relationship: c.relationship?.trim() || '',
      phone: c.phone.trim(),
    }));
  }
  if ('notes' in body) sanitized.notes = body.notes?.trim() || '';

  return sanitized;
}
