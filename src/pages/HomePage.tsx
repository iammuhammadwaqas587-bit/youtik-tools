import React from 'react';
import { UrlInputBar } from '../components/UrlInputBar';
import { VideoCard } from '../components/VideoCard';
import { TikTokHomeSection } from '../components/TikTokHomeSection';
import { SeoContentSection } from '../components/SeoContentSection';
import { FaqSection } from '../components/FaqSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { ResponsibleUseNotice } from '../components/ResponsibleUseNotice';
import { VideoInfo, FormattedDownloadOption } from '../types';
import { BLOG_POSTS } from '../data/blogPosts';
import { 
  Sparkles, 
  Film, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  User 
} from 'lucide-react';

interface HomePageProps {
  onFetchUrl: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  currentVideo: VideoInfo | null;
  onStartDownload: (option: FormattedDownloadOption) => void;
  onShowToast: (msg: string) => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onFetchUrl,
  isLoading,
  error,
  onClearError,
  currentVideo,
  onStartDownload,
  onShowToast,
  onNavigate,
}) => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-3.5 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-red-600" />
          <span>The #1 Free YouTube & TikTok Downloader</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Download YouTube & TikTok Videos <br className="hidden sm:inline" />
          <span className="text-red-600">Without Watermark in HD</span>
        </h1>

        <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
          Convert YouTube to 1080p Full HD MP4 and 320 kbps MP3, or save clean TikTok videos without logos. 100% formatted to play natively on mobile phones and laptops.
        </p>

        {/* Central Search Bar */}
        <div className="mt-8">
          <UrlInputBar
            onFetch={onFetchUrl}
            isLoading={isLoading}
            error={error}
            onClearError={onClearError}
          />
        </div>

        {/* Responsible Use Notice */}
        <div className="mt-6 max-w-2xl mx-auto text-left">
          <ResponsibleUseNotice variant="compact" />
        </div>
      </div>

      {/* Video Result Card if video loaded */}
      {currentVideo && (
        <div className="animate-in fade-in">
          <VideoCard
            video={currentVideo}
            onStartDownload={onStartDownload}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* Section 1: YouTube Downloader Suite Banner */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-md shadow-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
              <Film className="h-3 w-3" />
              <span>YouTube Downloader</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Download YouTube in 1080p, 4K & MP3
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Fast extraction of YouTube videos, Shorts, and audio tracks. Multiplexed with high-bitrate audio for guaranteed playback on Windows, Mac, iOS, and Android.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/youtube-video-downloader')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 transition-all hover:scale-102 cursor-pointer shrink-0"
          >
            <span>Open YouTube Downloader</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Section 2: Dedicated TikTok Downloader Section */}
      <TikTokHomeSection onGoToTikTok={(url) => onNavigate('/tiktok-video-downloader' + (url ? `?url=${encodeURIComponent(url)}` : ''))} />

      {/* Section 3: How to Download in 3 Steps */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            How to Download in 3 Simple Steps
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            No software installation or account registration needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 font-extrabold text-sm flex items-center justify-center mx-auto border border-red-200">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Copy Video URL</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find any YouTube video or TikTok clip and copy its link from the browser or app share menu.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 font-extrabold text-sm flex items-center justify-center mx-auto border border-cyan-200">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">Paste & Select Quality</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paste the link into YouTikTools. Choose between 1080p Full HD, 360p, TikTok without watermark, or MP3.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-sm flex items-center justify-center mx-auto border border-emerald-200">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">Download to Device</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click Download. The universally compatible MP4 or MP3 file saves straight to your laptop or phone.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Features breakdown */}
      <FeaturesSection />

      {/* Section 4.5: YouTikTools vs SnapYT & Generic Tools Comparison Table */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200 mb-2">
            <CheckCircle2 className="h-3 w-3 text-red-600" />
            <span>Competitive Benchmark</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            YouTikTools vs. SnapYT & Generic Sites
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Why creators and power users choose YouTikTools over single-platform tools like SnapYT.
          </p>
        </div>

        <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                <th className="py-3.5 px-4 sm:px-6">Feature / Capability</th>
                <th className="py-3.5 px-3 sm:px-4 text-center bg-red-50/50 text-red-700 font-extrabold border-x border-red-100">
                  YouTikTools
                </th>
                <th className="py-3.5 px-3 sm:px-4 text-center">SnapYT.app</th>
                <th className="py-3.5 px-3 sm:px-4 text-center text-slate-500">Generic Sites</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  YouTube 1080p & 4K (Synchronized Audio)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  Yes (H.264 Muxed)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-emerald-600">Yes</td>
                <td className="py-3 px-3 sm:px-4 text-center text-red-500 font-normal">Silent (No Audio)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  TikTok Videos (Zero Watermark)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  Yes (Direct CDN Stream)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No (YouTube only)</td>
                <td className="py-3 px-3 sm:px-4 text-center text-amber-600">Watermark / Paid</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  Studio MP3 Audio Bitrate
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  320 kbps (Master CBR)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-700">Standard MP3</td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">Low 128 kbps</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  Mobile & Laptop Universal Playback
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  100% Guaranteed (H.264/AAC)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-700">Good</td>
                <td className="py-3 px-3 sm:px-4 text-center text-amber-600">Often unplayable WebM</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  Subtitles & Closed Captions (SRT/VTT)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  Yes (8+ Languages)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No</td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  YouTube Tags & SEO Keyword Scraper
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  Yes (1-Click Copy)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No</td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  Full Video Script & Timestamps
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  Yes (Clean Text / SRT)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No</td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  Batch Multi-Link Downloader
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  Yes (Multi-URL Queue)
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No (1-by-1 only)</td>
                <td className="py-3 px-3 sm:px-4 text-center text-slate-400">No</td>
              </tr>
              <tr>
                <td className="py-3 px-4 sm:px-6 font-semibold text-slate-900">
                  Security, Ads & Popups
                </td>
                <td className="py-3 px-3 sm:px-4 text-center bg-red-50/30 font-bold text-emerald-700 border-x border-red-100">
                  Zero Ads · No Sign-Up
                </td>
                <td className="py-3 px-3 sm:px-4 text-center text-emerald-600">Clean</td>
                <td className="py-3 px-3 sm:px-4 text-center text-red-500 font-normal">Spam / Popups</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4.8: Device Guides (Laptop vs iPhone vs Android) */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 mb-2">
            <span>Universal Compatibility</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            How to Download on Any Mobile Phone or Laptop
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Engineered with standard H.264 & AAC encoding so your media opens instantly in your default player.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
              💻
            </div>
            <h4 className="text-sm font-bold text-slate-900">Windows & Mac Laptop</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open Chrome, Edge, or Safari on your laptop. Paste your YouTube or TikTok link, click Download, and the file saves directly to your computer's <strong>Downloads</strong> folder. Opens natively in Windows Media Player and QuickTime.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm border border-slate-200">
              📱
            </div>
            <h4 className="text-sm font-bold text-slate-900">iPhone & iPad (iOS Safari)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Copy the video link from YouTube or TikTok app. Open Safari, paste the link in YouTikTools, and tap Download. Safari will ask "Do you want to download?". Tap Download to save into the iOS <strong>Files app</strong> or save directly to <strong>Camera Roll Photos</strong>.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-200">
              🤖
            </div>
            <h4 className="text-sm font-bold text-slate-900">Android Smartphones & Tablets</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Using Chrome or any mobile browser on Samsung, Xiaomi, Pixel, or Motorola, paste your video link and hit Download. The file is saved directly into your device <strong>Gallery</strong> or <strong>Downloads</strong> folder with full audio-video sync.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4.9: All Specialized Tools Quick Hub */}
      <section className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-200">
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Explore All Free Media Tools
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated high-speed extractors for videos, audio, captions, and YouTube metadata.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          <button
            type="button"
            onClick={() => onNavigate('/youtube-video-downloader')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">🎬</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-red-600">YouTube 1080p/4K</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">High definition MP4</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/tiktok-video-downloader')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-cyan-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">✨</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-cyan-700">TikTok No Watermark</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Direct HD MP4</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/youtube-to-mp3')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">🎵</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-amber-600">YouTube to MP3</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">320 kbps Master CBR</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/video-captions-downloader')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">🌐</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-emerald-600">Captions & Subtitles</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">SRT, VTT, TXT</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/youtube-tags-extractor')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">🏷️</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-blue-600">Tags & SEO Keywords</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">1-click tags copy</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/video-script-transcript-downloader')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">📝</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-violet-600">Script & Transcript</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Spoken video text</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/batch-downloader')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">📦</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-slate-900">Batch Downloader</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Multi-link queue</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/tools')}
            className="p-4 rounded-xl bg-red-50/70 border border-red-200 hover:border-red-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">🛠️</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-red-600">All 18+ Tools</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Complete Directory</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/video-converter')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">🔄</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-red-600">Video Converter</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">MP4, WebM, MOV, MKV</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/video-compressor')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">🗜️</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-red-600">Video Compressor</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Reduce file size</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/video-trimmer')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">✂️</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-red-600">Video Trimmer</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Cut & trim clips</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/video-to-gif')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">🎞️</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-red-600">Video to GIF</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Animated GIF maker</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/blog')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <span className="text-lg">📚</span>
            <h4 className="text-xs font-bold text-slate-900 mt-2 group-hover:text-slate-900">Knowledge Hub</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Guides & Tutorials</p>
          </button>
        </div>
      </section>

      {/* Section 5: SEO Keyword Rich Content */}
      <SeoContentSection />

      {/* Section 6: FAQ Accordion */}
      <FaqSection />

      {/* Section 7: Trending Blog Posts Teaser (SEO Internal Links) */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 mb-1">
              <BookOpen className="h-3 w-3" />
              <span>Guides & Tutorials</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Latest from the YouTikTools Blog
            </h3>
            <p className="text-xs text-slate-500">
              Expert tips on video resolutions, codec compatibility, and watermark removal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/blog')}
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
          >
            <span>View all articles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <article
              key={post.slug}
              onClick={() => onNavigate(`/blog/${post.slug}`)}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="text-red-600 font-bold">{post.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 font-normal">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-xs font-semibold text-red-600 group-hover:translate-x-1 transition-transform">
                <span>Read guide</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
