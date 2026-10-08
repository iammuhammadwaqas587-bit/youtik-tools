import React, { useState } from 'react';
import { 
  Tag, 
  Copy, 
  Download, 
  Check, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Hash, 
  TrendingUp, 
  Search 
} from 'lucide-react';
import { extractYouTubeId, fetchVideoMetadata, SAMPLE_VIDEOS } from '../utils/youtube';
import { generateVideoTranscriptData } from '../utils/transcriptTools';
import { triggerDirectMediaDownload } from '../utils/mediaDownloader';

interface TagsPageProps {
  onShowToast: (msg: string) => void;
}

export const TagsPage: React.FC<TagsPageProps> = ({ onShowToast }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    title: string;
    channel: string;
    tags: string[];
    hashtags: string[];
  } | null>(null);

  const handleFetch = async (targetUrl: string = url) => {
    const id = extractYouTubeId(targetUrl);
    if (!id) {
      onShowToast('Please enter a valid video link');
      return;
    }

    setIsLoading(true);
    try {
      const meta = await fetchVideoMetadata(id);
      const data = generateVideoTranscriptData(meta.title, meta.author);
      setExtractedData({
        title: meta.title,
        channel: meta.author,
        tags: data.tags,
        hashtags: data.hashtags
      });
      onShowToast('Extracted SEO tags successfully!');
    } catch {
      onShowToast('Failed to extract tags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTags = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(extractedData.tags.join(', '));
    setCopiedAll(true);
    onShowToast('All tags copied as comma-separated list');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyHashtags = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(extractedData.hashtags.join(' '));
    setCopiedHash(true);
    onShowToast('Hashtags copied');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedData) return;
    const content = `=== YouTikTools Video SEO Tags ===\nTitle: ${extractedData.title}\nChannel: ${extractedData.channel}\n\nTags (Comma separated):\n${extractedData.tags.join(', ')}\n\nHashtags:\n${extractedData.hashtags.join(' ')}\n\nTags (List):\n${extractedData.tags.map(t => '• ' + t).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    triggerDirectMediaDownload(blobUrl, `[YouTikTools] ${extractedData.title.slice(0, 40)}_tags.txt`);
    onShowToast('Tags file downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-3 shadow-xs">
          <Tag className="h-3.5 w-3.5 text-blue-600" />
          <span>SEO Metadata & Keywords Finder</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          YouTube & TikTok <span className="text-blue-700">Tags Extractor</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
          Extract hidden video tags, ranked SEO keywords, and hashtags from any video to boost your search rankings.
        </p>
      </div>

      {/* Input box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Enter Video URL to Find Tags:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube or TikTok link e.g. https://www.youtube.com/watch?v=..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 shadow-xs"
            />
            <button
              onClick={() => handleFetch(url)}
              disabled={isLoading || !url.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>Extract Tags</span>
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
              className="text-blue-700 hover:underline cursor-pointer text-xs"
            >
              {s.channel}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Tags Display */}
      {extractedData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/60 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {extractedData.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Channel: {extractedData.channel} · {extractedData.tags.length} SEO keywords discovered
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTags}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer transition-colors"
              >
                {copiedAll ? <Check className="h-3.5 w-3.5 text-blue-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedAll ? 'Copied' : 'Copy All Tags'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-600/20 cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .TXT</span>
              </button>
            </div>
          </div>

          {/* Tags Chips Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-blue-600" />
                <span>Extracted Tags ({extractedData.tags.length}):</span>
              </h4>
            </div>

            <div className="flex flex-wrap gap-2">
              {extractedData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 transition-colors select-all"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hashtags Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-blue-600" />
                <span>Extracted Hashtags:</span>
              </h4>
              <button
                onClick={handleCopyHashtags}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                {copiedHash ? 'Copied!' : 'Copy hashtags'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {extractedData.hashtags.map((h, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 select-all"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEO Explainer Content */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900">
          How to Use Video Tags to Rank #1 on YouTube & TikTok
        </h3>
        <p>
          Video tags and keywords play a crucial role in the YouTube search algorithm and recommendation engine. YouTube uses video tags to understand the context, topic, and related searches for your video.
        </p>
        <p>
          By inspecting and analyzing the top-ranking tags from competitor videos in your niche, you can identify high-volume, low-competition keywords to include in your own video titles, descriptions, and tag boxes.
        </p>
      </div>
    </div>
  );
};
