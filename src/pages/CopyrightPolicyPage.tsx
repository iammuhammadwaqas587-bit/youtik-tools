import React from 'react';
import { ShieldCheck, Mail, AlertCircle, FileText, ChevronRight } from 'lucide-react';

interface CopyrightPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const CopyrightPolicyPage: React.FC<CopyrightPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6 sm:py-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-900 hover:underline cursor-pointer">
          Home
        </button>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Copyright & DMCA Policy</span>
      </nav>

      <header className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>DMCA & Rights Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Copyright & DMCA Takedown Policy
        </h1>
        <p className="text-slate-600">
          YouTikTools respects the intellectual property rights of content creators and copyright owners worldwide.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">1. Copyright Respect & Independent Tool Architecture</h2>
        <p>
          YouTikTools operates as a technological tool provider. We do not host, store, index, or maintain an archive of video files, audio tracks, or user creations on our servers. Media transcoding and downloads are processed ephemerally on request or executed directly in the user's browser.
        </p>
        <p>
          Users of our service are strictly required under our Terms of Service to only process media that they own or are legally authorized to utilize. While our system is designed for lawful archiving, accessibility transcribing, and creator workflows, we do not claim that the service automatically guarantees compliance on behalf of the user.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">2. Notice and Takedown Procedure (DMCA)</h2>
        <p>
          In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512) and international intellectual property conventions, copyright owners or their designated agents may submit a written infringement notification containing the following details:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs">
          <li>A physical or electronic signature of a person authorized to act on behalf of the copyright owner.</li>
          <li>Identification of the copyrighted work claimed to have been infringed, or a representative list if multiple works are involved.</li>
          <li>Identification of the specific material or URL on YouTikTools that is claimed to be infringing or facilitating infringement, with sufficient detail to locate it.</li>
          <li>Your contact information, including your full legal name, mailing address, telephone number, and email address.</li>
          <li>A statement that you have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement made under penalty of perjury that the information in the notification is accurate and that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">3. Designated Copyright Agent Contact</h2>
        <p>
          Please send all DMCA notices and intellectual property inquiries to our designated copyright team:
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Mail className="h-4 w-4 text-slate-700" />
            <span>Designated Agent: YouTikTools Copyright Agent</span>
          </div>
          <p className="font-mono text-slate-700">Email: copyright@youtiktools.com</p>
          <p className="text-[11px] text-slate-500">Subject line must include: "DMCA Copyright Notice - [Work Title]"</p>
          <p className="text-[11px] text-slate-500">We respond to verified, formal notices within 24 to 48 business hours.</p>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">4. Domain Blacklisting & Blocking</h2>
        <p>
          Upon receipt of a valid and verified copyright complaint from a rights holder or licensing body, YouTikTools can immediately block specific video URLs or entire creator channels from being processed through our conversion engines.
        </p>
      </section>
    </div>
  );
};
