import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, Lock, ChevronRight } from 'lucide-react';

interface TermsOfServicePageProps {
  onNavigate: (path: string) => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6 sm:py-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-900 hover:underline cursor-pointer">
          Home
        </button>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Terms of Service</span>
      </nav>

      <header className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
          <FileText className="h-3.5 w-3.5 text-slate-700" />
          <span>Last Updated: October 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-slate-600">
          Please review these terms carefully before accessing or using the YouTik Downloader website and media processing utilities.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
        <p>
          By visiting, browsing, or utilizing YouTik Downloader ("YouTik", "the Service"), you signify your agreement to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any portion of these terms, you are prohibited from using the website.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">2. Acceptable Use & User Responsibility</h2>
        <p>
          YouTik is provided as a utility for personal archiving, educational fair use, content creators optimizing authorized media, and research workflows.
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-900 block">User Legal Affirmation:</span>
          <p>
            You represent and warrant that you only upload, download, convert, or inspect content that you own, have created, or hold express authorization or license to process. You agree to comply with all applicable local, national, and international copyright and intellectual property statutes.
          </p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">3. Prohibited Activities & DRM Restrictions</h2>
        <p>
          YouTik enforces strict compliance boundaries. You agree NOT to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
          <li>Attempt to circumvent Digital Rights Management (DRM), Widevine, FairPlay, or access controls.</li>
          <li>Access, process, or download private, unlisted-restricted, paywalled, or subscriber-only content without authorization.</li>
          <li>Utilize automated scripts, spiders, scrapers, or botnets to flood our servers or disrupt system stability.</li>
          <li>Upload viruses, malware, or corrupted binary payloads to our client or server processing pipelines.</li>
          <li>Re-distribute or commercially monetize copyrighted media belonging to third parties.</li>
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">4. Independent Third-Party Status</h2>
        <p>
          YouTik Downloader is an independent utility. It is not affiliated with, endorsed by, sponsored by, or associated in any manner with Google LLC, YouTube, ByteDance Ltd., TikTok, or any of their parent organizations or subsidiaries. All third-party platform trademarks, names, and emblems belong strictly to their respective owners.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">5. Service Limitations & Disclaimer of Warranties</h2>
        <p>
          The service is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for maximum uptime and universal codec playback, YouTik makes no guarantees that processing will be uninterrupted, error-free, or compatible with every legacy device. We disclaim all warranties of any kind, whether express or implied.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">6. Contact & Legal Inquiries</h2>
        <p>
          For legal notices or questions regarding these terms, please contact:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
          Email: legal@youtik.tools · Subject: Terms of Service Inquiry
        </div>
      </section>
    </div>
  );
};
