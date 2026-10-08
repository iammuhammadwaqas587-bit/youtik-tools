import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Film, Music } from 'lucide-react';
import { SAMPLE_TIKTOK_VIDEOS } from '../utils/tiktok';

interface TikTokHomeSectionProps {
  onGoToTikTok: (url?: string) => void;
}

export const TikTokHomeSection: React.FC<TikTokHomeSectionProps> = ({ onGoToTikTok }) => {
  const [tiktokInput, setTiktokInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGoToTikTok(tiktokInput.trim());
  };

  return (
    <section className="mt-14 max-w-4xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-cyan-50/30 to-cyan-100/40 border border-cyan-200 p-6 sm:p-8 shadow-md shadow-cyan-100/50">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-800 text-[11px] font-bold mb-2.5">
              <Sparkles className="h-3 w-3 text-cyan-600" />
              <span>Zero Watermark Engine</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              TikTok Video Downloader <span className="text-cyan-700 font-extrabold">(No Watermark)</span>
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Remove TikTok logo and username overlay from any video. Get clean, full-resolution HD MP4 files and original sound MP3s directly to mobile and laptop.
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600" />
                <span>Zero Watermark</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-slate-800">
                <Film className="h-3.5 w-3.5 text-cyan-600" />
                <span>1080p Full HD</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-slate-800">
                <Music className="h-3.5 w-3.5 text-cyan-600" />
                <span>MP3 Audio Track</span>
              </span>
            </div>
          </div>

          {/* Quick Input & Launch button */}
          <div className="w-full md:w-80 shrink-0">
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                value={tiktokInput}
                onChange={(e) => setTiktokInput(e.target.value)}
                placeholder="Paste TikTok video link..."
                className="w-full bg-white border border-slate-300 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none shadow-xs"
              />

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Download Without Watermark</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => onGoToTikTok(SAMPLE_TIKTOK_VIDEOS[0].url)}
                className="text-[11px] font-semibold text-cyan-700 hover:underline cursor-pointer"
              >
                Or try with sample TikTok clip
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
