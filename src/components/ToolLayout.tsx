import React, { ReactNode } from 'react';
import { AdSlot } from './AdSlot';
import { ResponsibleUseNotice } from './ResponsibleUseNotice';
import { 
  ChevronRight, 
  HelpCircle, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  FileCheck2
} from 'lucide-react';

export interface RelatedToolItem {
  name: string;
  path: string;
  description: string;
  icon: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

interface ToolLayoutProps {
  title: string;
  badgeText?: string;
  badgeIcon?: ReactNode;
  description: string;
  children: ReactNode;
  howItWorks: {
    heading: string;
    text: string;
    steps: {
      number: number;
      title: string;
      description: string;
    }[];
  };
  supportedFormats?: {
    format: string;
    description: string;
  }[];
  tips?: string[];
  faqs: FaqItem[];
  relatedTools: RelatedToolItem[];
  onNavigate: (path: string) => void;
  showResponsibleUse?: boolean;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  title,
  badgeText,
  badgeIcon,
  description,
  children,
  howItWorks,
  supportedFormats,
  tips,
  faqs,
  relatedTools,
  onNavigate,
  showResponsibleUse = true,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  return (
    <div className="space-y-10 max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <button 
          onClick={() => onNavigate('/')} 
          className="hover:text-slate-900 hover:underline cursor-pointer transition-colors"
        >
          Home
        </button>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <button 
          onClick={() => onNavigate('/tools')} 
          className="hover:text-slate-900 hover:underline cursor-pointer transition-colors"
        >
          Tools
        </button>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate">{title}</span>
      </nav>

      {/* Header & Introduction */}
      <header className="text-center max-w-2xl mx-auto space-y-3">
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-2xs">
            {badgeIcon}
            <span>{badgeText}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {description}
        </p>
      </header>

      {/* Primary Tool Interface */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
        {children}
      </div>

      {/* Responsible Use Notice */}
      {showResponsibleUse && (
        <ResponsibleUseNotice variant="compact" />
      )}

      {/* Mid-Content Ad Slot */}
      <AdSlot position="middle" />

      {/* How it Works & Step-by-Step Instructions */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {howItWorks.heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {howItWorks.text}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {howItWorks.steps.map((step) => (
            <div key={step.number} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                {step.number}
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Formats & Capabilities */}
      {supportedFormats && supportedFormats.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
            <h2>Supported Video Formats & Containers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {supportedFormats.map((fmt, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">{fmt.format}: </span>
                  <span className="text-slate-600">{fmt.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Useful Tips Section */}
      {tips && tips.length > 0 && (
        <section className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <h2>Helpful Tips for Best Results</h2>
          </div>
          <ul className="space-y-2 text-xs text-amber-900/90">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ Accordion */}
      {faqs && faqs.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
            <HelpCircle className="h-5 w-5 text-red-600" />
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:text-red-600 transition-colors cursor-pointer gap-4"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-400 font-mono text-base">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="mt-2 text-xs text-slate-600 leading-relaxed animate-in fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Related Tools Internal Linking Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Related Video Utilities
            </h2>
            <p className="text-xs text-slate-500">
              Explore companion tools to inspect, convert, and optimize your videos.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/tools')}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All tools</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {relatedTools.map((tool) => (
            <button
              key={tool.path}
              onClick={() => onNavigate(tool.path)}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-xl">{tool.icon}</span>
                <h3 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-red-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {tool.description}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-700 group-hover:text-red-600">
                <span>Use Tool</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Content Ad Slot */}
      <AdSlot position="bottom" />
    </div>
  );
};
