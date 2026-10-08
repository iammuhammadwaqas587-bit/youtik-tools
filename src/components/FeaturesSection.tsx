import React from 'react';
import { Zap, Music, Lock } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  return (
    <section className="mt-16 pt-12 border-t border-slate-200/80 max-w-5xl mx-auto px-4">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Engineered for Clean & High-Speed Media
        </h3>
        <p className="text-xs text-slate-500 mt-2">
          Zero advertising spam, zero popups, zero shady redirects. YouTikTools focuses exclusively on fast media extraction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/40 hover:shadow-md transition-all">
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-3">
            <Zap className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Mobile & Laptop MP4</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Standard H.264 + AAC encoded MP4 video format guaranteed to play natively in Windows Media Player, iOS Photos, and Android.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/40 hover:shadow-md transition-all">
          <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center mb-3">
            <Zap className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">TikTok Without Watermark</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Download full-resolution HD TikTok videos without watermark or extract original sound tracks with one click.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/40 hover:shadow-md transition-all">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
            <Music className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">320 kbps MP3 Audio</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Rip pristine audio tracks from music videos, podcasts, and audio clips with clean ID3 tags and balanced equalization.
          </p>
        </div>
      </div>
    </section>
  );
};
