import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { getCard } from "../lib/api-client";
import type { CardResponse } from "../types";

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<CardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const publicUrl = `${window.location.origin}/card/${id}`;

  useEffect(() => {
    if (!id) return;
    getCard(id)
      .then(setCard)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownload() {
    if (!cardRef.current || !card) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `ready-ka-ba-${card.fullName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-[#000000] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-[#45464d] text-[16px] leading-[24px]">Loading your card...</p>
        </div>
      </main>
    );
  }

  if (error || !card) {
    return (
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center max-w-md px-4">
          <span className="material-symbols-outlined text-4xl text-[#b6171e] mb-4">error</span>
          <h2 className="text-[20px] leading-[28px] font-semibold text-[#000000] mb-2">Card not found</h2>
          <p className="text-[#45464d] text-[16px] leading-[24px]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-screen-md mx-auto px-4 md:px-12 py-8 flex flex-col gap-10">
      {/* Success Banner */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 flex items-center gap-4">
        <div className="bg-[#eceef0] rounded-full p-2 flex-shrink-0">
          <span className="material-symbols-outlined text-[#000000]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div>
          <h2 className="text-[20px] leading-[28px] font-semibold text-[#000000]">Your emergency card is live!</h2>
          <p className="text-[16px] leading-[24px] text-[#45464d] mt-1">Ready for quick access when you need it most.</p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* QR Code Section */}
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4">
          <h3 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#45464d] uppercase">Scan to Access</h3>
          <div className="w-48 h-48 bg-[#eceef0] rounded-lg p-3 border border-[#c6c6cd] flex items-center justify-center">
            <QRCodeSVG
              value={publicUrl}
              size={168}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-[16px] leading-[24px] text-[#45464d] max-w-xs mt-2">
            Print, screenshot, or set as your phone lock screen wallpaper.
          </p>
        </div>

        {/* Card Preview Section */}
        <div className="bg-white border border-[#c6c6cd] rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#45464d] uppercase mb-2">Card Preview</h3>

          {/* ID Card */}
          <div ref={cardRef} className="border border-[#c6c6cd] rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="h-1 bg-[#000000] w-full" />
            <div className="p-4 flex gap-4 items-start">
              <div className="w-16 h-16 rounded-full bg-[#eceef0] border border-[#c6c6cd] flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-[#45464d]">person</span>
              </div>
              <div className="flex-grow">
                <h4 className="text-[20px] leading-[28px] font-semibold text-[#000000]">{card.fullName}</h4>
                <p className="text-[12px] leading-[16px] font-medium text-[#45464d] mt-1">ID: #{card.id}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="bg-[#eceef0] text-[#000000] text-[12px] leading-[16px] font-medium px-2 py-1 rounded flex items-center gap-1 border border-[#c6c6cd]">
                    <span className="material-symbols-outlined text-[14px]">water_drop</span>
                    {card.bloodType}
                  </div>
                  {card.allergies.length > 0 && (
                    <div className="bg-[#ffdad6] text-[#93000a] text-[12px] leading-[16px] font-medium px-2 py-1 rounded flex items-center gap-1 border border-[#ba1a1a]/20">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                      {card.allergies[0]}{card.allergies.length > 1 ? ` +${card.allergies.length - 1}` : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-[#f2f4f6] px-4 py-2 border-t border-[#c6c6cd] flex justify-between items-center">
              <span className="text-[12px] leading-[16px] font-medium text-[#45464d]">Ready Ka Ba? Medical ID</span>
              <span className="material-symbols-outlined text-[#000000] text-[16px]">medical_services</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-[#c6c6cd] border-dashed">
            <button
              onClick={handleDownload}
              className="bg-[#000000] text-white text-[14px] leading-[20px] font-semibold tracking-[0.05em] py-3 px-4 rounded-lg w-full flex items-center justify-center gap-2 hover:bg-[#565e74] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined">download</span>
              Download Card as Image
            </button>
            <button
              onClick={handleCopyLink}
              className="bg-white text-[#000000] border border-[#c6c6cd] text-[14px] leading-[20px] font-semibold tracking-[0.05em] py-3 px-4 rounded-lg w-full flex items-center justify-center gap-2 hover:bg-[#f2f4f6] transition-colors"
            >
              <span className="material-symbols-outlined">{copied ? "check" : "content_copy"}</span>
              {copied ? "Copied!" : "Copy Public Link"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
