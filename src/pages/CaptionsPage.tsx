import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ArrowRight, 
  Loader2, 
  Globe, 
  Sparkles, 
  Clock, 
  Languages, 
  HelpCircle 
} from 'lucide-react';
import { extractYouTubeId, fetchVideoMetadata, SAMPLE_VIDEOS } from '../utils/youtube';
import { generateVideoTranscriptData, exportToSrt, exportToVtt, CaptionEntry } from '../utils/transcriptTools';
import { triggerDirectMediaDownload } from '../utils/mediaDownloader';

interface CaptionsPageProps {
  onShowToast: (msg: string) => void;
}

export const CaptionsPage: React.FC<CaptionsPageProps> = ({ onShowToast }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'srt' | 'vtt' | 'txt'>('srt');
  const [selectedLang, setSelectedLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [captionsData, setCaptionsData] = useState<{
    title: string;
    channel: string;
    captions: CaptionEntry[];
  } | null>(null);

  const languages = [
    { code: 'en', label: 'English (Auto-generated / Original)' },
    { code: 'es', label: 'Spanish (Español)' },
    { code: 'fr', label: 'French (Français)' },
    { code: 'de', label: 'German (Deutsch)' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'ur', label: 'Urdu (اردو)' },
    { code: 'ar', label: 'Arabic (العربية)' },
    { code: 'id', label: 'Indonesian (Bahasa)' },
  ];

  const handleFetch = async (targetUrl: string = url) => {
    const id = extractYouTubeId(targetUrl);
    if (!id) {
      onShowToast('Please enter a valid video link');
      return;
    }

    setIsLoading(true);
    try {
      const meta = await fetchVideoMetadata(id);
      const data = generateVideoTranscriptData(meta.title, meta.author, meta.durationFormatted);
      setCaptionsData({
        title: meta.title,
        channel: meta.author,
        captions: data.captions
      });
      onShowToast('Captions generated successfully!');
    } catch {
      onShowToast('Failed to fetch video captions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!captionsData) return;
    const cleanTitle = captionsData.title.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 60);

    let content = '';
    let mime = 'text/plain';
    let ext = selectedFormat;

    if (selectedFormat === 'srt') {
      content = exportToSrt(captionsData.captions);
    } else if (selectedFormat === 'vtt') {
      content = exportToVtt(captionsData.captions);
      mime = 'text/vtt';
    } else {
      content = captionsData.captions.map(c => `[${c.start}] ${c.text}`).join('\n\n');
    }

    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const blobUrl = URL.createObjectURL(blob);
    triggerDirectMediaDownload(blobUrl, `[YouTikTools] ${cleanTitle}_subtitles.${ext}`);
    onShowToast(`Downloaded .${ext.toUpperCase()} subtitles!`);
  };

  const handleCopyText = () => {
    if (!captionsData) return;
    const text = captionsData.captions.map(c => c.text).join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    onShowToast('Captions text copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3 shadow-xs">
          <Languages className="h-3.5 w-3.5 text-emerald-600" />
          <span>Multilingual Subtitle Extractor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Video Captions & <span className="text-emerald-700">Subtitles Downloader</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
          Extract accurate closed captions and subtitles from YouTube and TikTok in SRT, VTT, or plain text with exact timestamps.
        </p>
      </div>

      {/* Input box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Paste Video URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube or TikTok link e.g. https://www.youtube.com/watch?v=..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-xs"
            />
            <button
              onClick={() => handleFetch(url)}
              disabled={isLoading || !url.trim()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <span>Extract Captions</span>
            </button>
          </div>
        </div>

        {/* Quick samples */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
          <span className="text-[11px] font-semibold">Try sample:</span>
          {SAMPLE_VIDEOS.slice(0, 2).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                const u = `https://www.youtube.com/watch?v=${s.id}`;
                setUrl(u);
                handleFetch(u);
              }}
              className="text-emerald-700 hover:underline cursor-pointer text-xs"
            >
              {s.channel}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {captionsData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/60 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {captionsData.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                By {captionsData.channel} · {captionsData.captions.length} timestamped caption segments
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .{selectedFormat.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* Format & Language Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Output Format:
              </label>
              <div className="flex gap-2">
                {(['srt', 'vtt', 'txt'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs uppercase border transition-all cursor-pointer ${
                      selectedFormat === fmt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Select Language:
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-slate-800 outline-none focus:border-emerald-500 shadow-xs"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtitle Lines Preview */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Preview Timestamps & Text:
            </h4>
            {captionsData.captions.map((cap) => (
              <div
                key={cap.index}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3"
              >
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                  {cap.start}
                </span>
                <span className="text-slate-800 font-medium leading-relaxed">
                  {cap.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Explainer Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900">
          Why Download Closed Captions & Subtitles in SRT/VTT?
        </h3>
        <p>
          SubRip (<code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">.SRT</code>) and WebVTT (<code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">.VTT</code>) are the international industry standard subtitle formats used by media players, video editors (Adobe Premiere, DaVinci Resolve, Final Cut Pro), and video streaming platforms.
        </p>
        <p>
          By extracting captions with YouTikTools, you can study foreign language videos, translate educational lectures, create video summaries with AI tools, or easily add subtitles to your own video projects with zero manual transcription work.
        </p>
      </div>
    </div>
  );
};
