import React, { useState } from 'react';
import { Music, ArrowRight, Download, Loader2, Check } from 'lucide-react';
import { extractYouTubeId, fetchVideoMetadata } from '../utils/youtube';
import { VideoInfo } from '../types';

interface AudioOnlyViewProps {
  onStartDownloadAudio: (video: VideoInfo, bitrate: string, format: string) => void;
  onShowToast: (msg: string) => void;
}

export const AudioOnlyView: React.FC<AudioOnlyViewProps> = ({
  onStartDownloadAudio,
  onShowToast,
}) => {
  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState({
    label: 'MP3 · 320 kbps',
    bitrate: '320 kbps',
    ext: 'mp3'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadedVideo, setLoadedVideo] = useState<VideoInfo | null>(null);

  const audioOptions = [
    { id: 'mp3-320', label: 'MP3 · 320 kbps', bitrate: '320 kbps', ext: 'mp3' },
    { id: 'mp3-192', label: 'MP3 · 192 kbps', bitrate: '192 kbps', ext: 'mp3' },
    { id: 'mp3-128', label: 'MP3 · 128 kbps', bitrate: '128 kbps', ext: 'mp3' },
    { id: 'opus-166', label: 'Opus Audio · 166 kbps', bitrate: '166 kbps', ext: 'opus' },
    { id: 'm4a-130', label: 'M4A Audio · 130 kbps', bitrate: '130 kbps', ext: 'm4a' },
    { id: 'opus-88', label: 'Opus Audio · 88 kbps', bitrate: '88 kbps', ext: 'opus' },
    { id: 'opus-68', label: 'Opus Audio · 68 kbps', bitrate: '68 kbps', ext: 'opus' },
  ];

  const handleFetch = async (targetUrl: string = url) => {
    const id = extractYouTubeId(targetUrl);
    if (!id) {
      onShowToast('Please enter a valid YouTube link');
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchVideoMetadata(id);
      setLoadedVideo(data);
      onShowToast('Audio track loaded and ready');
    } catch {
      onShowToast('Failed to load video metadata');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDownload = () => {
    if (!loadedVideo) return;
    onStartDownloadAudio(loadedVideo, selectedFormat.label, selectedFormat.ext);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
          <Music className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Audio & MP3 Downloader</h2>
          <p className="text-xs text-slate-500">Extract pure audio in MP3, M4A, or Opus formats directly.</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            YouTube Video Link:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL e.g. https://www.youtube.com/watch?v=..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 shadow-xs"
            />
            <button
              onClick={() => handleFetch(url)}
              disabled={isLoading || !url.trim()}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-amber-600/20"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <span>Load</span>
            </button>
          </div>
        </div>

        {/* Format Selection */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Select Audio Format:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {audioOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedFormat(opt)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedFormat.label === opt.label
                    ? 'bg-amber-50/70 border-amber-400 text-slate-900 ring-1 ring-amber-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                </div>
                {selectedFormat.label === opt.label && <Check className="h-3.5 w-3.5 text-amber-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Video Preview & Download */}
        {loadedVideo && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={loadedVideo.thumbnail}
                alt="thumb"
                className="w-16 h-11 object-cover rounded-lg bg-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {loadedVideo.title}
                </p>
                <p className="text-[11px] text-slate-500">
                  {loadedVideo.author} · {loadedVideo.durationFormatted}
                </p>
              </div>
            </div>

            <button
              onClick={handleStartDownload}
              className="ml-3 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download {selectedFormat.ext.toUpperCase()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
