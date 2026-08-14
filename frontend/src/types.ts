export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface FormState {
  fullName: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContacts: EmergencyContact[];
  notes: string;
}

export interface CardPayload {
  fullName: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContacts: { name: string; relationship: string; phone: string }[];
  notes: string;
}

export interface CardResponse {
  id: string;
  fullName: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContacts: { name: string; relationship: string; phone: string }[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationErrors {
  fullName?: string;
  bloodType?: string;
  emergencyContacts?: string;
}
