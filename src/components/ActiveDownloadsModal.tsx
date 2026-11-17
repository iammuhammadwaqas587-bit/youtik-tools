import React from 'react';
import { DownloadTask } from '../types';
import { 
  Download, 
  CheckCircle2, 
  X, 
  ExternalLink,
  ArrowDown
} from 'lucide-react';
import { triggerDirectMediaDownload } from '../utils/mediaDownloader';

interface ActiveDownloadsModalProps {
  task: DownloadTask | null;
  onClose: () => void;
  onCancel: () => void;
}

export const ActiveDownloadsModal: React.FC<ActiveDownloadsModalProps> = ({
  task,
  onClose,
  onCancel,
}) => {
  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const isError = task.status === 'error';
  const cleanFilename = `${task.videoTitle.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 70)}.${task.extension}`;

  const handleManualDownload = () => {
    const targetUrl = task.directProxyUrl || task.downloadUrl;
    if (targetUrl) {
      triggerDirectMediaDownload(targetUrl, cleanFilename);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl ${
              isCompleted 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : isError
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : isError ? (
                <X className="h-5 w-5" />
              ) : (
                <ArrowDown className="h-5 w-5 animate-bounce" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isCompleted 
                  ? `${task.extension.toUpperCase()} Ready for Download` 
                  : isError
                  ? 'Download Could Not Be Completed'
                  : 'Transcoding Media Stream'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {task.formatName}
              </p>
            </div>
          </div>

          <button
            onClick={isCompleted || isError ? onClose : onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Media Thumbnail & Title */}
        <div className="my-5 flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <img
            src={task.thumbnail}
            alt="thumb"
            className="w-16 h-11 object-cover rounded-lg bg-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {task.videoTitle}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <span className="uppercase font-mono font-bold text-emerald-700">
                .{task.extension}
              </span>
              <span>·</span>
              <span>{task.size}</span>
            </div>
          </div>
        </div>

        {/* Error / Fallback Mirrors Box */}
        {isError ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
              <p className="text-xs font-bold text-amber-900">
                Direct Server Limited — High-Speed Mirrors Ready
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {task.errorMessage || 'YouTube bot protection blocked the direct datacenter stream. Click any mirror below to download immediately using your browser:'}
              </p>
            </div>

            {task.mirrors && task.mirrors.length > 0 && (
              <div className="space-y-2">
                {task.mirrors.map((mirror, idx) => (
                  <a
                    key={idx}
                    href={mirror.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      idx === 0
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      <span>{mirror.label}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase opacity-90">
                      {mirror.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-white/20">{mirror.badge}</span>
                      )}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Progress Bar & Status */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">
                {task.status === 'starting' && 'Connecting to media server...'}
                {task.status === 'downloading' && 'Fetching video streams...'}
                {task.status === 'converting' && `Transcoding .${task.extension}...`}
                {task.status === 'completed' && 'File Generated Successfully!'}
              </span>
              <span className="font-mono text-slate-900 font-bold">
                {task.progress}%
              </span>
            </div>

            {/* Track */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-xs' 
                    : 'bg-gradient-to-r from-red-600 to-red-400 shadow-xs'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>

            {!isCompleted && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                <span>Bitrate: {task.resolution || 'Direct'}</span>
                <span>Speed: {task.speed}</span>
              </div>
            )}
          </div>
        )}

        {/* Direct Action when complete */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <p className="text-xs text-emerald-900 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Download prompt sent to your browser!</span>
            </p>
            <p className="text-[11px] text-slate-600">
              Compatible with Mobile & Laptop. If download didn't start automatically, click below:
            </p>

            <div className="mt-1">
              <button
                type="button"
                onClick={handleManualDownload}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Save .{task.extension.toUpperCase()} File (Direct Download)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          {isCompleted || isError ? (
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
