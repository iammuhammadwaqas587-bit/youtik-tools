import React from 'react';
import { CheckCircle2, ShieldCheck, Zap, Globe, Smartphone, Laptop, Film, Music } from 'lucide-react';

export const SeoContentSection: React.FC = () => {
  return (
    <section className="mt-16 pt-12 border-t border-slate-200 max-w-5xl mx-auto px-4 text-slate-700">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          The Ultimate Free Online Video Downloader for <span className="text-red-600">YouTube</span> & <span className="text-cyan-700">TikTok</span>
        </h2>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed font-normal">
          Save high-definition videos in 1080p, 2K, 4K and pure 320kbps MP3 audio with zero watermarks, zero popups, and universal playback across all mobile phones and laptops.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm leading-relaxed">
        {/* Left Column: YouTube Focus */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-bold text-base">
            <Film className="h-5 w-5" />
            <h3>High-Definition YouTube Video & Audio Extraction</h3>
          </div>

          <p>
            YouTikTools is engineered to overcome the common pitfalls of online video downloaders. When downloading content from YouTube, our server-side engine automatically parses dynamic stream manifests (DASH), combining separate video and audio tracks into a pristine <strong>H.264 + AAC MP4</strong> file.
          </p>

          <p>
            Whether you want a portable <strong>360p MP4</strong> clip, a crystal-clear <strong>1080p Full HD</strong> video at 60fps, or an ultra-sharp <strong>4K UHD</strong> stream, YouTikTools gives you direct access without requiring bulky desktop software or browser extensions.
          </p>

          <ul className="space-y-2 pt-2 border-t border-slate-100 font-medium text-slate-800 text-xs">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
              <span>Full HD 1080p, 1440p, and 4K 60FPS video support</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
              <span>Studio-quality 320 kbps and 256 kbps MP3 & M4A audio ripping</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" />
              <span>Native playback on Windows Media Player, QuickTime, iOS, and Android</span>
            </li>
          </ul>
        </div>

        {/* Right Column: TikTok Focus */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-cyan-700 font-bold text-base">
            <Zap className="h-5 w-5" />
            <h3>TikTok Video Downloader Without Watermark</h3>
          </div>

          <p>
            TikTok automatically embeds a moving watermark with the creator's username when using their native save button. YouTikTools solves this by connecting directly to the origin content distribution networks (CDNs), allowing you to save the raw, original video <strong>completely free of any watermark or logo</strong>.
          </p>

          <p>
            This makes YouTikTools the perfect companion for content creators who need clean footage for video editing, social media reposting (such as Instagram Reels and YouTube Shorts), or high-fidelity offline archiving.
          </p>

          <ul className="space-y-2 pt-2 border-t border-slate-100 font-medium text-slate-800 text-xs">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0" />
              <span>100% clean video with zero watermark or username stamp</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0" />
              <span>Extract background music and sound tracks as standalone MP3s</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-600 shrink-0" />
              <span>Compatible with standard links and short mobile links (vt.tiktok.com)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Cross Device Compatibility Banner */}
      <div className="mt-8 bg-slate-100/80 border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-700" />
              <span>Universal Mobile & Laptop Playback Guarantee</span>
            </h4>
            <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
              Every video downloaded through YouTikTools is verified to ensure valid ISO MP4 container headers (<code className="font-mono text-slate-800 font-semibold">isom/avc1</code>). You will never experience black screen errors, missing audio tracks, or codec incompatibility warnings on Windows, Mac, iPhone, or Android.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <Laptop className="h-4 w-4 text-slate-800" />
              <span>Laptops & PCs</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <Smartphone className="h-4 w-4 text-slate-800" />
              <span>iOS & Android</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
