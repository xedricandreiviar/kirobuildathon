import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCard } from "../lib/api-client";
import type { CardResponse } from "../types";

export default function CardPage() {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<CardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getCard(id)
      .then(setCard)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center antialiased">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-body-md text-on-surface-variant">Loading emergency card...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center antialiased">
        <div className="text-center max-w-md px-4">
          <span className="material-symbols-outlined text-5xl text-secondary mb-4">error</span>
          <h1 className="text-headline-md text-primary mb-2">Card not found</h1>
          <p className="text-body-md text-on-surface-variant">This emergency card may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="bg-surface w-full top-0 sticky border-b border-outline-variant z-40 transition-colors duration-200 flex items-center justify-between px-[16px] h-14">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          <h1 className="text-headline-sm font-bold text-primary">Ready Ka Ba?</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[16px] md:px-[48px] py-[16px] md:py-[40px] grid grid-cols-1 md:grid-cols-12 gap-[24px]">
        {/* Profile Header */}
        <section className="col-span-1 md:col-span-12 flex flex-col md:flex-row items-start md:items-center gap-[16px] border-b border-outline-variant pb-[16px] mb-[16px]">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-outline-variant shrink-0 bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">person</span>
          </div>
          <div className="flex-grow">
            <h2 className="text-headline-xl text-primary">{card.fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-body-md text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">badge</span>
                ID: {card.id}
              </span>
            </div>
          </div>
        </section>

        {/* Left Column: Critical Alerts & Overview */}
        <div className="col-span-1 md:col-span-7 flex flex-col gap-[40px]">
          {/* Top Critical Alerts (Bento Layout) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
            {/* Blood Type Badge */}
            <div className="bg-secondary-container rounded-xl p-[16px] flex flex-col items-center justify-center text-center shadow-sm border border-outline-variant">
              <span className="material-symbols-outlined text-4xl text-on-secondary-container mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
              <h3 className="text-label-md text-on-secondary-container uppercase opacity-90">Blood Type</h3>
              <div className="text-headline-xl text-on-secondary-container mt-1">{card.bloodType}</div>
            </div>

            {/* Allergies Alert Block */}
            <div className="bg-error-container rounded-xl p-[16px] border-l-4 border-error shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <h3 className="text-headline-sm text-error">
                  {card.allergies.length > 0 ? "Severe Allergies" : "No Known Allergies"}
                </h3>
              </div>
              {card.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {card.allergies.map((allergy, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-error text-on-error text-label-md">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-body-md text-on-error-container opacity-70">None reported</p>
              )}
            </div>
          </section>

          {/* Medical Overview */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-[16px] shadow-sm">
            <div className="border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monitor_heart</span>
                Medical Conditions
              </h3>
            </div>
            {card.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {card.conditions.map((condition, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1.5 rounded bg-surface-container-high text-on-surface text-label-md border border-outline-variant">
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant mb-6">None reported</p>
            )}

            <div className="border-b border-outline-variant pb-3 mb-4">
              <h3 className="text-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pill</span>
                Current Medications
              </h3>
            </div>
            {card.medications.length > 0 ? (
              <ul className="space-y-3">
                {card.medications.map((med, i) => (
                  <li key={i} className="flex justify-between items-center bg-surface-container-low p-3 rounded border border-outline-variant">
                    <div className="flex flex-col">
                      <span className="text-label-md text-primary">{med}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-md text-on-surface-variant">None reported</p>
            )}
          </section>

          {/* Important Notes */}
          {card.notes && (
            <section className="bg-[#FFF8E1] rounded-xl border border-[#FFE082] p-[16px] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#F57F17]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <h3 className="text-headline-sm text-[#F57F17]">Important Medical Notes</h3>
              </div>
              <p className="text-body-lg text-[#5D4037] leading-relaxed">
                {card.notes}
              </p>
            </section>
          )}
        </div>

        {/* Right Column: Emergency Contacts */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-[40px]">
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-[16px] shadow-sm sticky top-[80px]">
            <div className="border-b border-outline-variant pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-headline-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">contact_emergency</span>
                Emergency Contacts
              </h3>
            </div>
            <div className="space-y-4">
              {card.emergencyContacts.map((contact, i) => (
                <div key={i} className="bg-surface-container-low border border-outline-variant rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-headline-sm text-primary">{contact.name}</h4>
                      {contact.relationship && (
                        <span className="text-label-md text-on-surface-variant uppercase tracking-wider">{contact.relationship}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary text-label-md py-3 rounded-lg hover:bg-on-error-container transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                    Call {contact.phone}
                  </a>
                </div>
              ))}
              {card.emergencyContacts.length === 0 && (
                <p className="text-body-md text-on-surface-variant text-center py-4">No emergency contacts listed</p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full py-8 mb-20 md:mb-0 mt-auto border-t border-outline-variant">
        <div className="flex flex-col items-center gap-[4px] px-[16px] text-center">
          <p className="text-label-sm text-on-surface-variant mb-2">
            Last updated: {new Date(card.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <a className="text-label-sm text-on-surface-variant hover:underline opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="text-label-sm text-on-surface-variant hover:underline opacity-80 hover:opacity-100" href="#">Terms of Service</a>
          </div>
          <p className="text-label-md font-semibold text-secondary">Medical Emergency Card • Powered by Ready Ka Ba?</p>
          <p className="text-label-sm text-on-surface-variant mt-2">© 2024 Ready Ka Ba?</p>
        </div>
      </footer>
    </div>
  );
}
