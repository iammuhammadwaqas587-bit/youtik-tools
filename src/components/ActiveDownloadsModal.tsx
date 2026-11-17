import React from 'react';
import { DownloadTask } from '../types';
import { 
  Download, 
  CheckCircle2, 
  X, 
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

        {/* Error Box */}
        {isError ? (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-1.5">
            <p className="text-xs font-bold text-red-900">
              Conversion Could Not Be Completed
            </p>
            <p className="text-[11px] text-red-700 leading-relaxed">
              {task.errorMessage || 'Could not process this media stream right now. Please try another format or resolution (such as 720p MP4 or 360p MP4) and try again.'}
            </p>
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
