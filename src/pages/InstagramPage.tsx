import React, { useState } from 'react';
import { InstagramDownloader } from '../components/InstagramDownloader';
import { ResponsibleUseNotice } from '../components/ResponsibleUseNotice';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Film, 
  Music, 
  Smartphone, 
  Laptop,
  HelpCircle,
  Instagram,
  Zap,
  ArrowRight
} from 'lucide-react';

interface InstagramPageProps {
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

export const InstagramPage: React.FC<InstagramPageProps> = ({
  onShowToast,
  onRecordHistory,
  onNavigate,
  initialUrl = '',
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I download Instagram Reels in full 1080p quality?',
      a: 'Copy the link from Instagram (tap the 3 dots or Share icon -> Copy Link), paste it into YouTikTools above, and click Download. YouTikTools extracts the highest available bitrate stream directly from Instagram CDN.'
    },
    {
      q: 'Can I extract and download the background music or audio from an Instagram Reel?',
      a: 'Yes. Select the "Original Audio (MP3)" option to save the reel soundtrack as a clean, high-bitrate 320 kbps MP3 audio file.'
    },
    {
      q: 'How do I save Instagram Reels directly to my iPhone Camera Roll?',
      a: 'In Safari on iOS, tap Download. When the MP4 download completes, tap the blue Safari download icon in the navigation bar, open the video, tap Share, and select "Save Video" to place it right in your Photos Camera Roll.'
    },
    {
      q: 'Do I need an Instagram account or login to download videos?',
      a: 'No. YouTikTools requires zero registration, no Instagram credentials, and no login. Your privacy is 100% protected.'
    },
    {
      q: 'Can I download private Instagram posts or stories?',
      a: 'No. To respect user privacy and creator rights, YouTikTools only processes publicly shared Reels, videos, and IGTV clips.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Downloader Main Component */}
      <InstagramDownloader
        initialUrl={initialUrl}
        onShowToast={onShowToast}
        onRecordHistory={onRecordHistory}
      />

      <div className="max-w-3xl mx-auto px-4">
        <ResponsibleUseNotice variant="compact" />
      </div>

      {/* SEO Content & In-Depth Technical Information */}
      <section className="max-w-4xl mx-auto space-y-10 px-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
        {/* Why Choose YouTikTools for Instagram */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-pink-100 text-pink-700">
              <Instagram className="h-4 w-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Why Use YouTikTools for Instagram Video & Reel Downloads?
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            The simplest and fastest online Instagram Reel saver. Get pristine MP4 videos without watermarks or login popups.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-800 font-bold flex items-center justify-center">
                <Film className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Original 1080p Resolution</h3>
              <p className="text-xs text-slate-600">
                Direct extraction from Instagram edge servers without re-compression, preserving the creator's full vertical 9:16 clarity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-800 font-bold flex items-center justify-center">
                <Music className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Audio Soundtrack Ripper</h3>
              <p className="text-xs text-slate-600">
                Extract trending audio, original speeches, and background melodies straight to 320 kbps MP3 files for editing and archiving.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-800 font-bold flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">100% Anonymous & Secure</h3>
              <p className="text-xs text-slate-600">
                No Instagram passwords or account linking needed. Video requests are handled directly over encrypted HTTPS connections.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            How to Download Instagram Reels & Videos in 3 Easy Steps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Copy the Reel Link</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In the Instagram mobile app or web browser, open the Reel or video, tap the paper airplane <strong>Share</strong> button, and tap <strong>Copy Link</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Paste into YouTikTools</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste the URL into the input field above and click <strong>Download</strong>. Our tool instantly extracts the source MP4.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Save to Your Device</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose <strong>1080p HD</strong> or <strong>MP3 Audio</strong>. The video saves instantly to your phone gallery or laptop.
              </p>
            </div>
          </div>
        </div>

        {/* Device Compatibility Guide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            How to Save to iPhone Camera Roll and Android Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Smartphone className="h-4 w-4 text-pink-600" />
                <span>iPhone & iPad (iOS Safari)</span>
              </div>
              <p>
                Open Safari, paste the Instagram reel link and click download. Once downloaded, tap the Safari downloads icon, tap the video file, tap the Share icon in the bottom-left, and tap <strong>"Save Video"</strong> to store it in your Camera Roll.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Laptop className="h-4 w-4 text-emerald-600" />
                <span>Android & Computer</span>
              </div>
              <p>
                In Chrome on Android or desktop browsers, downloads automatically save to your default Downloads folder and immediately appear in Google Photos or your media library.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-pink-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Instagram Downloader Frequently Asked Questions
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-slate-800 hover:text-pink-600 transition-colors cursor-pointer gap-4"
                  >
                    <span>{faq.q}</span>
                    <span className="font-mono text-slate-400">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed animate-in fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
