import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    question: "How do I download YouTube videos in 1080p Full HD or 4K with audio?",
    answer: "Copy the YouTube video link, paste it into the YouTikTools search bar above, and click Download. In the format menu, choose '1080p MP4' or '4K'. YouTikTools automatically multiplexes (merges) the separate video and audio streams into a single universally compatible MP4 file so you never get a silent video."
  },
  {
    question: "How can I download TikTok videos without any watermark?",
    answer: "On TikTok, tap 'Share' > 'Copy Link' on your desired clip. Open YouTikTools's TikTok Downloader (/tiktok-video-downloader) and paste the link. Click 'Without Watermark (HD MP4)'. YouTikTools retrieves the original source stream directly from the CDN without the logo watermark or username stamp."
  },
  {
    question: "Will the downloaded videos play smoothly on my laptop and smartphone?",
    answer: "Yes, 100%. All video streams are formatted in standard H.264 (AVC) video with AAC audio inside an MP4 container. This is the universal standard recognized natively by Windows Media Player, macOS QuickTime, iPhone/iPad Safari & Photos, and all Android devices without needing any external codec packs."
  },
  {
    question: "Can I convert YouTube videos to MP3 audio in 320 kbps studio quality?",
    answer: "Absolutely. Head to the 'Audio (MP3)' section (/youtube-to-mp3), paste any YouTube link, and select 'MP3 · 320 kbps'. YouTikTools will extract the audio track at maximum fidelity with balanced equalization, perfect for music, podcasts, and speeches."
  },
  {
    question: "Is YouTikTools completely free to use?",
    answer: "Yes, YouTikTools is 100% free with unlimited downloads. There is no software to install, no account registration required, and no hidden subscription fees."
  },
  {
    question: "Can I download videos on iPhone and iPad?",
    answer: "Yes. In Safari on iOS 13 and newer, simply paste the video URL and tap download. Safari will prompt you with 'Do you want to download this file?', and it will save directly into your Files app or Photos camera roll."
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="mt-16 pt-12 border-t border-slate-200 max-w-4xl mx-auto px-4">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-2">
          <HelpCircle className="h-3.5 w-3.5 text-red-600" />
          <span>Frequently Asked Questions</span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Everything You Need to Know About YouTikTools
        </h3>
        <p className="text-xs text-slate-500 mt-2">
          Common questions regarding YouTube 1080p extraction, TikTok watermark removal, and device playback.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_LIST.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-red-600 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-600' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed font-normal border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
