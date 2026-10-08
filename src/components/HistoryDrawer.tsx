import React from 'react';
import { HistoryItem } from '../types';
import { 
  History, 
  Trash2, 
  Download, 
  Clock, 
  Copy,
  Film,
  Music,
  Sparkles
} from 'lucide-react';

interface HistoryDrawerProps {
  items: HistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onRedownload: (item: HistoryItem) => void;
  onShowToast: (msg: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  items,
  onClearHistory,
  onDeleteItem,
  onRedownload,
  onShowToast,
}) => {
  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    onShowToast('Video URL copied');
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-red-600" />
          <h2 className="text-base font-bold text-slate-900">Download History</h2>
          <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {items.length} saved
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer font-medium"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <History className="h-8 w-8 mx-auto stroke-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No downloads yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Videos and audio you convert will appear here for fast re-access.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {items.map((item) => {
            const isAudio = item.extension === 'mp3' || item.extension === 'm4a' || item.extension === 'opus';
            const isTikTok = item.source === 'tiktok';

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={item.thumbnail}
                      alt="thumb"
                      className="w-16 h-10 object-cover rounded-lg bg-slate-200"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded bg-white border border-slate-200 text-slate-700 shadow-xs">
                      {isTikTok ? (
                        <Sparkles className="h-2.5 w-2.5 text-cyan-600" />
                      ) : isAudio ? (
                        <Music className="h-2.5 w-2.5 text-amber-600" />
                      ) : (
                        <Film className="h-2.5 w-2.5 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.videoTitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="font-mono font-semibold text-slate-700 uppercase">
                        {item.format}
                      </span>
                      <span>·</span>
                      <span>{item.size}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.downloadedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-3">
                  <button
                    onClick={() => handleCopy(item.url)}
                    title="Copy Video URL"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onRedownload(item)}
                    title="Re-download file"
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>Redownload</span>
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    title="Remove from history"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
