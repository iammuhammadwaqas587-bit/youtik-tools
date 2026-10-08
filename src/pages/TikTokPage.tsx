import React from 'react';
import { TikTokDownloader } from '../components/TikTokDownloader';
import { ResponsibleUseNotice } from '../components/ResponsibleUseNotice';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Film, 
  Music, 
  Smartphone, 
  Laptop,
  HelpCircle
} from 'lucide-react';

interface TikTokPageProps {
  onShowToast: (msg: string) => void;
  onRecordHistory: (item: {
    title: string;
    thumbnail: string;
    format: string;
    url: string;
    downloadUrl: string;
    extension: string;
  }) => void;
  onNavigate: (path: string) => void;
  initialUrl?: string;
}

export const TikTokPage: React.FC<TikTokPageProps> = ({
  onShowToast,
  onRecordHistory,
  onNavigate,
  initialUrl = '',
}) => {
  return (
    <div className="space-y-12">
      {/* Downloader Main Component */}
      <TikTokDownloader
        initialUrl={initialUrl}
        onShowToast={onShowToast}
        onRecordHistory={onRecordHistory}
      />

      <div className="max-w-3xl mx-auto px-4">
        <ResponsibleUseNotice variant="compact" />
      </div>

      {/* High-Impact SEO Strategy Section for TikTok No Watermark */}
      <section className="max-w-4xl mx-auto space-y-10 px-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
        {/* Feature comparison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
            Why Download TikTok Videos with YouTik?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">True Zero Watermark</h3>
              <p className="text-xs text-slate-600">
                YouTik bypasses the watermark encoding pipeline, pulling the original camera-uploaded stream directly from TikTok content delivery networks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center">
                <Music className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Direct MP3 Audio</h3>
              <p className="text-xs text-slate-600">
                Need that viral trending background sound? Download the isolated soundtrack as an uncompressed MP3 audio file with one click.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center">
                <Film className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">HD 1080p Quality</h3>
              <p className="text-xs text-slate-600">
                Unlike converters that downsample video to 480p, YouTik delivers the highest available resolution uploaded by the creator.
              </p>
            </div>
          </div>
        </div>

        {/* How to save to camera roll on iPhone and Android */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            How to Save TikTok Videos to Camera Roll (iPhone & Android)
          </h2>
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              <strong>iPhone / iPad (iOS Safari):</strong> Open Safari, paste the TikTok link into YouTik, and tap <em>"Without Watermark (HD MP4)"</em>. Safari will display a download prompt. Tap <em>"Download"</em>. Once finished, tap the Safari download arrow in the address bar, open the video, tap <em>"Share"</em>, and choose <strong>"Save Video"</strong> to place it directly in your Photos camera roll.
            </p>
            <p>
              <strong>Android (Google Chrome):</strong> Paste the link and tap download. The MP4 file saves instantly to your <em>Downloads</em> folder and is immediately visible in Google Photos and Samsung Gallery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
