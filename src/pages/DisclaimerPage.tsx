import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface DisclaimerPageProps {
  onNavigate: (path: string) => void;
}

export const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6 sm:py-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-900 hover:underline cursor-pointer">
          Home
        </button>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Disclaimer</span>
      </nav>

      <header className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          <span>Legal Disclaimer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Platform & Trademark Disclaimer
        </h1>
        <p className="text-slate-600">
          Important disclosures regarding our independent status, platform trademarks, and user responsibilities.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">1. Independent Third-Party Status</h2>
        <p>
          YouTikTools is an independent utility website. This service is <strong>NOT</strong> affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
          <li><strong>YouTube LLC</strong>, Google LLC, or Alphabet Inc.</li>
          <li><strong>TikTok</strong>, ByteDance Ltd., or any of their affiliated companies.</li>
        </ul>
        <p>
          The names "YouTube", "TikTok", "Shorts", as well as related names, marks, emblems, and images are registered trademarks of their respective owners. Their mention on this website is solely for nominative, descriptive identification of compatible source formats.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">2. No Hosting or Content Storage</h2>
        <p>
          YouTikTools does not host, store, stream, or index any copyrighted audiovisual media on our servers. The tools provided perform real-time format remuxing or facilitate direct connections between the client and public media distribution networks. All temporary processing buffers are purged immediately upon delivery.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">3. User Responsibility & Fair Use</h2>
        <p>
          YouTikTools is intended exclusively for authorized media manipulation, personal archival, accessibility transcript extraction, and fair-use educational purposes. Users bear total responsibility for verifying that their downloads and transcodes comply with local intellectual property laws and the terms of the respective platform.
        </p>
      </section>
    </div>
  );
};
