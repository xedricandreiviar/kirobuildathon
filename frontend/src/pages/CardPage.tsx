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
      <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex items-center justify-center antialiased">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-[#000000] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-[#45464d] text-[16px] leading-[24px]">Loading emergency card...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex items-center justify-center antialiased">
        <div className="text-center max-w-md px-4">
          <span className="material-symbols-outlined text-5xl text-[#b6171e] mb-4">error</span>
          <h1 className="text-[24px] leading-[32px] font-bold text-[#000000] mb-2">Card not found</h1>
          <p className="text-[#45464d] text-[16px] leading-[24px]">This emergency card may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="bg-[#f7f9fb] w-full top-0 sticky border-b border-[#c6c6cd] z-40 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#b6171e]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          <h1 className="text-[20px] leading-[28px] font-semibold text-[#000000]">Ready Ka Ba?</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-12 py-4 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Header */}
        <section className="col-span-1 md:col-span-12 flex flex-col md:flex-row items-start md:items-center gap-4 border-b border-[#c6c6cd] pb-4 mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#c6c6cd] shrink-0 bg-[#eceef0] flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-[#45464d]">person</span>
          </div>
          <div className="flex-grow">
            <h2 className="text-[32px] leading-[40px] md:text-[40px] md:leading-[48px] font-bold tracking-[-0.02em] text-[#000000]">{card.fullName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[16px] leading-[24px] text-[#45464d] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">badge</span>
                ID: {card.id}
              </span>
            </div>
          </div>
        </section>

        {/* Left Column: Critical Alerts & Overview */}
        <div className="col-span-1 md:col-span-7 flex flex-col gap-10">
          {/* Top Critical Alerts (Bento Layout) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blood Type Badge */}
            <div className="bg-[#da3433] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-[#c6c6cd]">
              <span className="material-symbols-outlined text-4xl text-[#fffbff] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
              <h3 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#fffbff] uppercase opacity-90">Blood Type</h3>
              <div className="text-[40px] leading-[48px] font-bold tracking-[-0.02em] text-[#fffbff] mt-1">{card.bloodType}</div>
            </div>

            {/* Allergies Alert Block */}
            <div className="bg-[#ffdad6] rounded-xl p-4 border-l-4 border-[#ba1a1a] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#ba1a1a]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <h3 className="text-[20px] leading-[28px] font-semibold text-[#ba1a1a]">
                  {card.allergies.length > 0 ? "Severe Allergies" : "No Known Allergies"}
                </h3>
              </div>
              {card.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {card.allergies.map((allergy, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#ba1a1a] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em]">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[16px] leading-[24px] text-[#93000a] opacity-70">None reported</p>
              )}
            </div>
          </section>

          {/* Medical Overview */}
          <section className="bg-white rounded-xl border border-[#c6c6cd] p-4 shadow-sm">
            <div className="border-b border-[#c6c6cd] pb-3 mb-4">
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#000000] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#000000]">monitor_heart</span>
                Medical Conditions
              </h3>
            </div>
            {card.conditions.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {card.conditions.map((condition, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1.5 rounded bg-[#e6e8ea] text-[#191c1e] text-[14px] leading-[20px] font-semibold tracking-[0.05em] border border-[#c6c6cd]">
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#45464d] text-[16px] leading-[24px] mb-6">None reported</p>
            )}

            <div className="border-b border-[#c6c6cd] pb-3 mb-4">
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#000000] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#000000]">pill</span>
                Current Medications
              </h3>
            </div>
            {card.medications.length > 0 ? (
              <ul className="space-y-3">
                {card.medications.map((med, i) => (
                  <li key={i} className="flex justify-between items-center bg-[#f2f4f6] p-3 rounded border border-[#c6c6cd]">
                    <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#000000]">{med}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#45464d] text-[16px] leading-[24px]">None reported</p>
            )}
          </section>

          {/* Important Notes */}
          {card.notes && (
            <section className="bg-[#FFF8E1] rounded-xl border border-[#FFE082] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#F57F17]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <h3 className="text-[20px] leading-[28px] font-semibold text-[#F57F17]">Important Medical Notes</h3>
              </div>
              <p className="text-[18px] leading-[28px] text-[#5D4037]">
                {card.notes}
              </p>
            </section>
          )}
        </div>

        {/* Right Column: Emergency Contacts */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-10">
          <section className="bg-white rounded-xl border border-[#c6c6cd] p-4 shadow-sm md:sticky md:top-[80px]">
            <div className="border-b border-[#c6c6cd] pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-[20px] leading-[28px] font-semibold text-[#000000] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#000000]">contact_emergency</span>
                Emergency Contacts
              </h3>
            </div>
            <div className="space-y-4">
              {card.emergencyContacts.map((contact, i) => (
                <div key={i} className="bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg p-4 flex flex-col gap-3">
                  <div>
                    <h4 className="text-[20px] leading-[28px] font-semibold text-[#000000]">{contact.name}</h4>
                    {contact.relationship && (
                      <span className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#45464d] uppercase">{contact.relationship}</span>
                    )}
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-[#b6171e] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] py-3 rounded-lg hover:bg-[#93000a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b6171e] focus:ring-offset-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                    Call {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f7f9fb] w-full py-8 mt-auto border-t border-[#c6c6cd]">
        <div className="flex flex-col items-center gap-1 px-4 text-center max-w-screen-xl mx-auto">
          <p className="text-[12px] leading-[16px] font-medium text-[#45464d] mb-2">
            Last updated: {new Date(card.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
          <p className="text-[14px] leading-[20px] font-semibold text-[#b6171e]">Medical Emergency Card • Powered by Ready Ka Ba?</p>
        </div>
      </footer>
    </div>
  );
}
