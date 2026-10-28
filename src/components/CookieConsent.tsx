import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Check, X } from 'lucide-react';

interface CookieConsentProps {
  onNavigate: (path: string) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('youtik_cookie_consent');
      if (!consent) {
        // Small delay so page content renders smoothly before banner shows
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('youtik_cookie_consent', 'accepted');
    } catch {}
    setIsOpen(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('youtik_cookie_consent', 'essential_only');
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      role="region" 
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-900/10 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Cookie className="h-4 w-4" />
            </div>
            <span>Cookie &amp; Advertising Preferences</span>
          </div>
          <button
            onClick={handleDecline}
            aria-label="Close cookie banner"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          We use cookies and similar technologies to ensure core functionality, remember your format preferences, and display relevant, non-intrusive ads via Google AdSense in compliance with GDPR &amp; CCPA.
        </p>

        <div className="flex items-center justify-between pt-1">
          <a
            href="/privacy-policy"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/privacy-policy');
            }}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Read Privacy Policy
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Essential Only
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
