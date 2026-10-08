import React from 'react';
import { X, ShieldCheck, Zap, HelpCircle, Terminal } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">How YouTikTools Works</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-slate-600">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Zap className="h-4 w-4 text-red-600" />
              1. Paste Any YouTube or TikTok Link
            </h4>
            <p className="pl-5 leading-relaxed">
              Copy standard watch URLs, short links (<code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">youtu.be</code>, <code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">tiktok.com</code>), or Shorts. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] text-slate-800">Ctrl+K</kbd> to quick-focus.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              2. Select Quality & Format
            </h4>
            <p className="pl-5 leading-relaxed">
              Choose from recommended 360p MP4, Full HD 1080p, or TikTok without watermark. All video streams are formatted in H.264 + AAC MP4 to run smoothly on both mobile phones and laptops.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Terminal className="h-4 w-4 text-cyan-600" />
              3. Save Straight to Device
            </h4>
            <p className="pl-5 leading-relaxed">
              Downloads complete directly to your Downloads folder or phone Camera Roll. Zero adware, zero toolbars, 100% free forever.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
