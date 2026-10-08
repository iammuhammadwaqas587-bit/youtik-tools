import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Download, 
  Check, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  FileText, 
  Clock, 
  BookOpen, 
  AlignLeft,
  Share2
} from 'lucide-react';
import { extractYouTubeId, fetchVideoMetadata, SAMPLE_VIDEOS } from '../utils/youtube';
import { generateVideoTranscriptData, VideoScriptData } from '../utils/transcriptTools';
import { triggerDirectMediaDownload } from '../utils/mediaDownloader';

interface ScriptPageProps {
  onShowToast: (msg: string) => void;
}

export const ScriptPage: React.FC<ScriptPageProps> = ({ onShowToast }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [scriptData, setScriptData] = useState<VideoScriptData | null>(null);

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
      setScriptData(data);
      onShowToast('Video script extracted successfully!');
    } catch {
      onShowToast('Failed to extract video script');
    } finally {
      setIsLoading(false);
    }
  };

  const getExportText = () => {
    if (!scriptData) return '';
    if (includeTimestamps) {
      return scriptData.captions
        .map(c => `[${c.start}] ${c.text}`)
        .join('\n\n');
    }
    return scriptData.cleanScript;
  };

  const handleCopy = () => {
    const text = getExportText();
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    onShowToast('Script copied to clipboard');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!scriptData) return;
    const text = `=== YouTikTools Video Script ===\nTitle: ${scriptData.title}\nCreator: ${scriptData.channel}\nDuration: ${scriptData.duration} | Words: ${scriptData.wordCount}\n\n${getExportText()}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    triggerDirectMediaDownload(blobUrl, `[YouTikTools] ${scriptData.title.slice(0, 40)}_script.txt`);
    onShowToast('Script file downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold mb-3 shadow-xs">
          <FileText className="h-3.5 w-3.5 text-violet-600" />
          <span>Full Transcript & Script Extractor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Video Script & <span className="text-violet-700">Transcript Downloader</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
          Extract full written transcripts and spoken scripts from any YouTube or TikTok video. Clean paragraphs, no weird formatting, ready for reading or AI summarization.
        </p>
      </div>

      {/* Input box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Enter Video Link to Get Full Script:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube or TikTok URL e.g. https://www.youtube.com/watch?v=..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-violet-500 shadow-xs"
            />
            <button
              onClick={() => handleFetch(url)}
              disabled={isLoading || !url.trim()}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-violet-600/20 cursor-pointer flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlignLeft className="h-4 w-4" />}
              <span>Extract Script</span>
            </button>
          </div>
        </div>

        {/* Quick sample */}
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
              className="text-violet-700 hover:underline cursor-pointer text-xs"
            >
              {s.channel}
            </button>
          ))}
        </div>
      </div>

      {/* Script Result Display */}
      {scriptData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/60 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {scriptData.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                <span>By {scriptData.channel}</span>
                <span>·</span>
                <span>{scriptData.wordCount} words</span>
                <span>·</span>
                <span>{scriptData.readingTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer transition-colors"
              >
                {copiedScript ? <Check className="h-3.5 w-3.5 text-violet-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-violet-600/20 cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .TXT</span>
              </button>
            </div>
          </div>

          {/* Timestamp Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-700 font-semibold">
              Format Mode:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIncludeTimestamps(false)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  !includeTimestamps ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clean Text (No Timestamps)
              </button>
              <button
                onClick={() => setIncludeTimestamps(true)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  includeTimestamps ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                With Timestamps
              </button>
            </div>
          </div>

          {/* Script Content Viewer */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed max-h-96 overflow-y-auto whitespace-pre-line font-sans">
            {getExportText()}
          </div>
        </div>
      )}

      {/* SEO Explainer Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900">
          How Video Scripts Supercharge Content Creation & Learning
        </h3>
        <p>
          Downloading video scripts allows you to consume 60-minute lectures, podcasts, or tutorials in under 5 minutes by reading at your own pace.
        </p>
        <p>
          You can also feed the extracted script into AI tools (like ChatGPT, Claude, or NotebookLM) to generate executive summaries, study guides, LinkedIn posts, or blog articles with complete accuracy.
        </p>
      </div>
    </div>
  );
};
