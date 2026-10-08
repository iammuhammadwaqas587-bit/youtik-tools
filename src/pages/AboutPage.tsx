import React from 'react';
import { CombinedLogo } from '../components/CombinedLogo';
import { ShieldCheck, Heart, Zap, Globe, Cpu, ChevronRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6 sm:py-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-900 hover:underline cursor-pointer">
          Home
        </button>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">About YouTikTools</span>
      </nav>

      <header className="space-y-3 border-b border-slate-200 pb-6 text-center max-w-2xl mx-auto">
        <div className="mx-auto flex items-center justify-center mb-2">
          <CombinedLogo size={48} />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          About YouTikTools
        </h1>
        <p className="text-slate-600">
          An independent, web-based multimedia utility platform built for high-speed video analysis, format conversion, compression, and creator productivity.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Our Mission</h2>
        <p>
          The web was designed to be open, accessible, and user-friendly. However, downloading, converting, or inspecting video files is too often surrounded by malicious pop-under ads, deceptive fake download buttons, slow bandwidth limits, and malware-laden desktop installers.
        </p>
        <p>
          YouTikTools was created to offer a clean, honest, and high-performance alternative:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-600" />
              <span>Fast & Clean</span>
            </span>
            <p className="text-xs text-slate-500">Zero popups, zero intrusive redirects, and zero deceptive download buttons.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>Modern Codecs</span>
            </span>
            <p className="text-xs text-slate-500">Automated H.264 & AAC remuxing guarantees videos play natively on laptops and mobile.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Privacy-First</span>
            </span>
            <p className="text-xs text-slate-500">Inspection and frame extraction operate locally in your browser memory without server uploads.</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Independent Third-Party Statement</h2>
        <p>
          YouTikTools is an independent utility created and maintained by multimedia streaming enthusiasts. We are not affiliated with, authorized by, sponsored by, or endorsed by Google LLC, YouTube, ByteDance Ltd., TikTok, or any other social video service.
        </p>
        <p>
          We advocate for responsible use and respect for creators' copyrights. Our suite is designed to empower users for personal archival, authorized editing, educational fair use, and content localization.
        </p>
      </section>
    </div>
  );
};
