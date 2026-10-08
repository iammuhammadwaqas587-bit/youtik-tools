import React from 'react';
import { ShieldCheck, Lock, Eye, Server, RefreshCw, Mail, ChevronRight } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6 sm:py-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-900 hover:underline cursor-pointer">
          Home
        </button>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Privacy Policy</span>
      </nav>

      <header className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Last Updated: October 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-600">
          How YouTikTools protects user privacy, handles media processing, and manages cookies and analytics.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">1. Overview & Commitment to User Privacy</h2>
        <p>
          YouTikTools ("YouTikTools", "we", "our", or "us") operates as an independent web-based multimedia utility platform. We are committed to transparency and privacy. We do not require account registration, logins, passwords, credit card information, or personal profiles to access our services.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">2. Uploaded Video Files & In-Memory Processing</h2>
        <p>
          When you utilize our browser tools (such as the Video Converter, Video Compressor, Video Trimmer, Frame Extractor, or Metadata Inspector):
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
          <li><strong>Client-Side First:</strong> Tools operate predominantly in your local browser memory via HTML5 File, Video, and Canvas APIs. Your files are not transmitted to or stored on remote servers whenever client processing is active.</li>
          <li><strong>Transient Streaming:</strong> In scenarios where server-assisted transcoding or format remuxing is requested, data is processed in ephemeral, volatile memory buffers solely for the duration of the conversion task.</li>
          <li><strong>Automatic Cleanup:</strong> Temporary stream buffers are deleted immediately upon completion or automatically purged by scheduled garbage collection routines. We do not maintain any permanent archives of user media.</li>
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">3. Cookies, Analytics & Third-Party Advertising</h2>
        <p>
          We and our third-party service providers (such as Google AdSense) may utilize standard cookies and web beacons:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
          <li><strong>Essential & Functional Cookies:</strong> To remember your client preferences (such as light theme, download history in local storage, and audio format selections).</li>
          <li><strong>Google AdSense & DoubleClick:</strong> Google uses cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this website or other websites. You may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Ads Settings</a> or <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">AboutAds.info</a>.</li>
          <li><strong>Server Logs:</strong> Standard web server logs record basic network technical information (such as browser user-agent, operating system, requested URL, and anonymized IP address) strictly for security monitoring, DDoS mitigation, and rate limiting.</li>
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">4. Data Retention & User Rights (GDPR & CCPA)</h2>
        <p>
          Because we do not collect names, email addresses, or account profiles for casual tool usage, we store minimal personal information. Under GDPR (European Union) and CCPA (California Consumer Privacy Act):
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
          <li>You have the right to request information regarding any data processed.</li>
          <li>You can clear your local browser storage and download history at any time using the "Clear History" button inside the History Drawer.</li>
          <li>You have the right to opt out of third-party ad tracking via your browser's cookie settings or "Do Not Track" signal.</li>
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">5. Contact Information</h2>
        <p>
          If you have questions, inquiries, or privacy concerns regarding this policy, please reach out to our team:
        </p>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
          Email: privacy@youtiktools.com · Subject: Privacy Policy Inquiry
        </div>
      </section>
    </div>
  );
};
