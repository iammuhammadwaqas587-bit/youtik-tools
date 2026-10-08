import React from 'react';
import { UrlInputBar } from '../components/UrlInputBar';
import { VideoCard } from '../components/VideoCard';
import { VideoInfo, FormattedDownloadOption } from '../types';
import { ResponsibleUseNotice } from '../components/ResponsibleUseNotice';
import { 
  Film, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Laptop, 
  Smartphone, 
  HelpCircle,
  ShieldCheck,
  Download
} from 'lucide-react';

interface YouTubePageProps {
  onFetchUrl: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  currentVideo: VideoInfo | null;
  onStartDownload: (option: FormattedDownloadOption) => void;
  onShowToast: (msg: string) => void;
  onNavigate: (path: string) => void;
}

export const YouTubePage: React.FC<YouTubePageProps> = ({
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
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-3 shadow-xs">
          <Film className="h-3.5 w-3.5 text-red-600" />
          <span>YouTube Video Downloader (1080p & 4K)</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Best YouTube Video Downloader — <br />
          <span className="text-red-600">Save 1080p & 4K MP4 Videos Fast</span>
        </h1>

        <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
          Save YouTube videos in full resolution with crystal-clear audio. Download 1080p Full HD, 4K UHD, or 320 kbps MP3 files formatted to play on every laptop, PC, iPhone, and Android device.
        </p>

        {/* Input Bar */}
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

      {/* Video Result Card */}
      {currentVideo ? (
        <div className="animate-in fade-in">
          <VideoCard
            video={currentVideo}
            onStartDownload={onStartDownload}
            onShowToast={onShowToast}
          />
        </div>
      ) : (
        !isLoading && (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-white shadow-xs max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-200">
              <Film className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Paste Any YouTube Link Above</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supports standard YouTube videos, YouTube Shorts, music videos, and live replays.
            </p>
          </div>
        )
      )}

      {/* SnapYT-Style High Ranking SEO Content */}
      <section className="max-w-4xl mx-auto space-y-10 px-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
        {/* At a glance comparison table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
            YouTik YouTube Downloader at a Glance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-900 font-bold">
                  <th className="py-2.5 px-3">Feature</th>
                  <th className="py-2.5 px-3">YouTik Downloader</th>
                  <th className="py-2.5 px-3">Other Downloaders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">Max Resolution</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">4K UHD & 1080p 60fps</td>
                  <td className="py-2.5 px-3 text-slate-500">720p or 360p (forces paid upgrade)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">Audio Sync Guarantee</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">Muxed H.264 + AAC (Always with sound)</td>
                  <td className="py-2.5 px-3 text-slate-500">Often silent / missing audio</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">Ads & Popups</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">Zero invasive ads / zero popups</td>
                  <td className="py-2.5 px-3 text-slate-500">Aggressive popunders & redirects</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">Cross-Device Playback</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">100% Mobile & Laptop Native</td>
                  <td className="py-2.5 px-3 text-slate-500">WebM errors in Windows/iPhone</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* How to copy a link */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            How to Copy a YouTube Link (Desktop & Mobile App)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h3 className="font-bold text-slate-900 text-xs">On Laptop / Desktop Browser:</h3>
              <p className="text-xs text-slate-600">
                Click the address bar in your web browser (Chrome, Edge, Safari, Firefox), highlight the URL (e.g., <code className="bg-white px-1 py-0.5 rounded border border-slate-200">https://www.youtube.com/watch?v=...</code>), and press <kbd className="px-1 py-0.5 rounded bg-white border border-slate-300 text-[10px]">Ctrl+C</kbd> or <kbd className="px-1 py-0.5 rounded bg-white border border-slate-300 text-[10px]">Cmd+C</kbd>.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h3 className="font-bold text-slate-900 text-xs">On iPhone / Android YouTube App:</h3>
              <p className="text-xs text-slate-600">
                While watching any video or Short, tap the <strong>"Share"</strong> arrow below the player, then select <strong>"Copy Link"</strong>. Paste it straight into YouTik!
              </p>
            </div>
          </div>
        </div>

        {/* Additional tools cross link */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-100 border border-slate-200">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Looking for other formats?</h4>
            <p className="text-xs text-slate-500">Extract audio, subtitles, or tags from this video:</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button
              onClick={() => onNavigate('/youtube-to-mp3')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-slate-300 transition-colors cursor-pointer"
            >
              Convert to MP3 (320kbps)
            </button>
            <button
              onClick={() => onNavigate('/video-captions-downloader')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-slate-300 transition-colors cursor-pointer"
            >
              Get Subtitles (.SRT)
            </button>
            <button
              onClick={() => onNavigate('/youtube-tags-extractor')}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:border-slate-300 transition-colors cursor-pointer"
            >
              Extract Video Tags
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
