import React, { useState } from 'react';
import { 
  Layers, 
  Download, 
  Trash2, 
  Plus, 
  Loader2, 
  Film, 
  Music
} from 'lucide-react';
import { extractYouTubeId, fetchVideoMetadata } from '../utils/youtube';
import { VideoInfo } from '../types';

interface BatchDownloaderProps {
  onStartBatchDownload: (items: VideoInfo[], mode: 'video' | 'audio') => void;
  onShowToast: (msg: string) => void;
}

export const BatchDownloader: React.FC<BatchDownloaderProps> = ({
  onStartBatchDownload,
  onShowToast,
}) => {
  const [urlsText, setUrlsText] = useState('');
  const [queue, setQueue] = useState<VideoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [batchMode, setBatchMode] = useState<'video' | 'audio'>('video');

  const handleParseUrls = async () => {
    const lines = urlsText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      onShowToast('Please enter at least one YouTube link');
      return;
    }

    setIsLoading(true);
    const validIds: string[] = [];

    for (const line of lines) {
      const id = extractYouTubeId(line);
      if (id && !validIds.includes(id)) {
        validIds.push(id);
      }
    }

    if (validIds.length === 0) {
      onShowToast('No valid YouTube links recognized');
      setIsLoading(false);
      return;
    }

    try {
      const results: VideoInfo[] = [];
      for (const id of validIds) {
        const info = await fetchVideoMetadata(id);
        results.push(info);
      }
      setQueue(results);
      setUrlsText('');
      onShowToast(`Loaded ${results.length} videos into batch queue`);
    } catch {
      onShowToast('Error loading batch videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    setQueue(queue.filter(q => q.id !== id));
  };

  const handleClearAll = () => {
    setQueue([]);
  };

  const handleDownloadAll = () => {
    if (queue.length === 0) return;
    onStartBatchDownload(queue, batchMode);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-red-600" />
            <span>Batch Multi-URL Downloader</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Queue up multiple YouTube videos or Shorts and process them together.
          </p>
        </div>

        {queue.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer font-medium"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Queue</span>
          </button>
        )}
      </div>

      {/* Input box */}
      {queue.length === 0 && (
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Paste multiple YouTube links (one per line):
          </label>
          <textarea
            rows={5}
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            placeholder={`https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://youtu.be/jfKfPfyJRdk\nhttps://www.youtube.com/watch?v=aqz-KE-bpKQ`}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 font-mono outline-none focus:border-red-500 focus:bg-white transition-all shadow-xs"
          />

          <div className="flex justify-end">
            <button
              onClick={handleParseUrls}
              disabled={isLoading || !urlsText.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing Links...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Load Batch Queue</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Queue items list */}
      {queue.length > 0 && (
        <div className="mt-5 space-y-4">
          {/* Batch Mode toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Batch Target Format:</span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-xs">
                <button
                  onClick={() => setBatchMode('video')}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    batchMode === 'video'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Film className="h-3 w-3" />
                  <span>1080p MP4</span>
                </button>
                <button
                  onClick={() => setBatchMode('audio')}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    batchMode === 'audio'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Music className="h-3 w-3" />
                  <span>320kbps MP3</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download All ({queue.length} files)</span>
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {queue.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono font-bold text-slate-400 w-5">
                    {idx + 1}.
                  </span>
                  <img
                    src={item.thumbnail}
                    alt="thumb"
                    className="w-14 h-9 object-cover rounded bg-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.author} · {item.durationFormatted}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors ml-2 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
