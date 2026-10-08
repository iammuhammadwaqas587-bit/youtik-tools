import React from 'react';
import { AudioOnlyView } from '../components/AudioOnlyView';
import { ResponsibleUseNotice } from '../components/ResponsibleUseNotice';
import { VideoInfo } from '../types';
import { Music, Zap, CheckCircle2, Volume2, ShieldCheck, HelpCircle } from 'lucide-react';

interface AudioPageProps {
  onStartDownloadAudio: (video: VideoInfo, bitrate: string, format: string) => void;
  onShowToast: (msg: string) => void;
  onNavigate: (path: string) => void;
}

export const AudioPage: React.FC<AudioPageProps> = ({
  onStartDownloadAudio,
  onShowToast,
  onNavigate,
}) => {
  return (
    <div className="space-y-12">
      {/* Audio Ripper Main Tool */}
      <AudioOnlyView
        onStartDownloadAudio={onStartDownloadAudio}
        onShowToast={onShowToast}
      />

      <div className="max-w-4xl mx-auto px-4">
        <ResponsibleUseNotice variant="compact" />
      </div>

      {/* SEO Strategy Section for YouTube to MP3 */}
      <section className="max-w-4xl mx-auto space-y-8 px-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Why YouTikTools is the Best YouTube to MP3 Converter
          </h2>
          <p>
            Most free online MP3 converters encode audio at low bitrates (96 or 128 kbps), cutting off high-frequency overtones and resulting in muffled, muddy music.
          </p>
          <p>
            YouTikTools extracts the original uncompressed audio track and transcodes it at genuine <strong>320 kbps constant bitrate (CBR)</strong>. This guarantees that your offline music files, podcasts, DJ sets, and speeches sound crisp, punchy, and studio-accurate on headphones, car audio systems, and studio monitors.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 text-xs">320 kbps MP3</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Studio master fidelity. Preserves crystal-clear cymbals and deep basslines.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 text-xs">256 kbps M4A / AAC</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Apple standard audio format. Perfect for iPhone music libraries and iTunes.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 text-xs">128 kbps Compact</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Lightweight audio file size. Ideal for speech, lectures, and quick audio memos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
