import React, { useState } from 'react';
import { FacebookDownloader } from '../components/FacebookDownloader';
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
  Share2,
  Tv,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';

interface FacebookPageProps {
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

export const FacebookPage: React.FC<FacebookPageProps> = ({
  onShowToast,
  onRecordHistory,
  onNavigate,
  initialUrl = '',
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I download Facebook videos and Reels in 1080p Full HD?',
      a: 'Copy the link of the public Facebook video or Reel, paste it into YouTikTools above, choose "1080p Full HD", and click Download. YouTikTools extracts the raw high-bitrate video stream from Facebook and packages it into a universal H.264 MP4 file.'
    },
    {
      q: 'Can I download Facebook Reels?',
      a: 'Yes, 100%. YouTikTools natively supports all Facebook Reel formats (web and mobile links like fb.watch or facebook.com/reel/...).'
    },
    {
      q: 'Can I extract MP3 audio or background music from Facebook clips?',
      a: 'Yes! Select the "320 kbps MP3" audio option to extract the isolated soundtrack, speech, or music with high fidelity.'
    },
    {
      q: 'How do I save Facebook videos to iPhone Camera Roll?',
      a: 'In iOS Safari, tap Download. Once the download completes, tap the blue Safari download icon in the address bar, open the downloaded MP4, tap the Share icon, and select "Save Video" to place it directly into your Photos app.'
    },
    {
      q: 'Can I download private Facebook videos or videos in closed groups?',
      a: 'No. YouTikTools strictly adheres to privacy standards. Only public videos, creator reels, and public Facebook Watch episodes can be indexed and downloaded.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Downloader Main Component */}
      <FacebookDownloader
        initialUrl={initialUrl}
        onShowToast={onShowToast}
        onRecordHistory={onRecordHistory}
      />

      <div className="max-w-3xl mx-auto px-4">
        <ResponsibleUseNotice variant="compact" />
      </div>

      {/* SEO Content & In-Depth Technical Information */}
      <section className="max-w-4xl mx-auto space-y-10 px-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
        {/* Why Choose YouTikTools for Facebook */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Share2 className="h-4 w-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Why Use YouTikTools for Facebook Video Downloads?
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            The cleanest, fastest web tool to archive Facebook Watch streams, viral creator Reels, and educational clips without annoying ads or third-party desktop software.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                <Film className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Full HD 1080p & 720p</h3>
              <p className="text-xs text-slate-600">
                Pull pristine high-definition videos with original audio tracks synchronized in standard H.264/AAC for seamless playback on any device.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">FB Reels & Watch Support</h3>
              <p className="text-xs text-slate-600">
                Universal link handling: supports <code>facebook.com/watch</code>, <code>facebook.com/reel</code>, and mobile <code>fb.watch</code> short links.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                <Music className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Studio 320k MP3 Audio</h3>
              <p className="text-xs text-slate-600">
                Need speech audio, a podcast segment, or background music? Transcode Facebook audio directly to uncompressed 320 kbps MP3.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            How to Download Facebook Videos Online in 3 Easy Steps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Copy the Video Link</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open Facebook on mobile app or web, tap the <strong>Share</strong> button under the video or reel, and choose <strong>Copy Link</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Paste into YouTikTools</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste the URL into the input box above and tap <strong>Download</strong>. Our tool instantly resolves video resolutions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Save HD MP4 File</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pick <strong>1080p Full HD</strong>, <strong>720p HD</strong>, or <strong>MP3</strong>. The file downloads directly to your device storage.
              </p>
            </div>
          </div>
        </div>

        {/* Device Compatibility Guide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Device Compatibility: iPhone, Android, Mac & Windows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span>iPhone & iPad (iOS Safari)</span>
              </div>
              <p>
                Apple devices support native MP4 playback. In Safari, tap Download, open the Downloads manager, tap the share icon, and select <strong>"Save Video"</strong> to export it into the Apple Photos app.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Laptop className="h-4 w-4 text-emerald-600" />
                <span>Android & Laptops</span>
              </div>
              <p>
                On Android (Chrome, Samsung Internet) or PC/Mac, downloaded MP4s save directly to your default Downloads folder and appear in your gallery or media player.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Facebook Downloader Frequently Asked Questions
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
                    className="w-full flex items-center justify-between text-left font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer gap-4"
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
