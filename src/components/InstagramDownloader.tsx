import React, { useState, useRef } from 'react';
import { SocialPostData, SocialPostFile } from '../types';
import { fetchInstagramPost, SAMPLE_INSTAGRAM_POSTS } from '../utils/instagram';
import { 
  Download, 
  Film, 
  Image as ImageIcon, 
  Clipboard, 
  X, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Instagram,
  Layers,
  ExternalLink,
  Maximize2
} from 'lucide-react';

interface InstagramDownloaderProps {
  onShowToast: (msg: string) => void;
  onRecordHistory: (item: {
    title: string;
    thumbnail: string;
    format: string;
    url: string;
    downloadUrl: string;
    extension: string;
  }) => void;
  initialUrl?: string;
}

export const InstagramDownloader: React.FC<InstagramDownloaderProps> = ({
  onShowToast,
  onRecordHistory,
  initialUrl = '',
}) => {
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postData, setPostData] = useState<SocialPostData | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [completedFileIds, setCompletedFileIds] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFetch = async (targetUrl: string = urlInput) => {
    if (!targetUrl.trim()) return;
    setError(null);
    setIsLoading(true);
    setPostData(null);
    setCompletedFileIds(new Set());

    try {
      const data = await fetchInstagramPost(targetUrl.trim());
      setPostData(data);
      onShowToast(`Detected ${data.totalFiles} item${data.totalFiles > 1 ? 's' : ''} from ${data.author}!`);
    } catch (err: any) {
      setError(err.message || 'Failed to detect Instagram post. Ensure the account and post are public.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        setError(null);
        handleFetch(text);
      }
    } catch {
      onShowToast('Could not access clipboard');
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setError(null);
    setPostData(null);
    inputRef.current?.focus();
  };

  const handleDownloadFile = async (file: SocialPostFile) => {
    if (!postData) return;
    setDownloadingFileId(file.id);
    onShowToast(`Downloading ${file.type === 'video' ? 'video' : 'photo'} in original quality...`);

    try {
      // Use proxy endpoint for seamless direct download with attachment header
      const proxyUrl = `/api/download-proxy?download_url=${encodeURIComponent(file.downloadUrl)}&filename=${encodeURIComponent(file.filename)}`;
      
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCompletedFileIds(prev => new Set(prev).add(file.id));
      onShowToast(`Saved: ${file.filename}`);

      onRecordHistory({
        title: postData.title || `Instagram ${file.type}`,
        thumbnail: file.thumbnail || postData.thumbnail,
        format: file.resolution || (file.type === 'video' ? 'Original 1080p' : 'Original Photo'),
        url: urlInput,
        downloadUrl: proxyUrl,
        extension: file.type === 'video' ? 'mp4' : 'jpg'
      });
    } catch (err: any) {
      onShowToast(`Download failed: ${err.message}`);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!postData || postData.files.length === 0) return;
    setIsDownloadingAll(true);
    onShowToast(`Starting download of all ${postData.files.length} items...`);

    for (let i = 0; i < postData.files.length; i++) {
      const file = postData.files[i];
      await handleDownloadFile(file);
      // Small delay between downloads to prevent browser blocking
      await new Promise(r => setTimeout(r, 600));
    }

    setIsDownloadingAll(false);
    onShowToast(`All ${postData.files.length} files saved!`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Search and Input Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-sm">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-pink-700 text-xs font-semibold shadow-2xs">
            <Instagram className="h-4 w-4 text-pink-600 animate-pulse" />
            <span>Full Post, Carousel & Reel Detection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Instagram Post & Reel Downloader
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Paste any Instagram post or reel link. Automatically detects <span className="font-semibold text-slate-800">all photos and videos</span> with direct original-size downloads.
          </p>
        </div>

        {/* Input Bar */}
        <div className="space-y-3">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="Paste Instagram post, reel, or carousel link here..."
              className="w-full pl-4 pr-32 sm:pr-40 py-3.5 sm:py-4 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-pink-500 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all shadow-inner"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {urlInput ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                  title="Clear link"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-300/80 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  <span>Paste</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleFetch()}
                disabled={isLoading || !urlInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Detecting...</span>
                  </>
                ) : (
                  <>
                    <span>Download</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Sample Links */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Quick Test:</span>
            {SAMPLE_INSTAGRAM_POSTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrlInput(sample.url);
                  handleFetch(sample.url);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-700 border border-slate-200/80 transition-colors font-medium truncate max-w-[200px] sm:max-w-none"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Unable to fetch Instagram post</p>
              <p className="text-red-600 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm animate-pulse">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-100 to-rose-100 text-pink-600 flex items-center justify-center mx-auto shadow-inner">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Analyzing Instagram Post...</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Extracting post metadata, scanning for multiple carousel photos and videos, and fetching original resolution links.
            </p>
          </div>
        </div>
      )}

      {/* Detected Post & Media Gallery Section */}
      {postData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Post Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                    {postData.thumbnail ? (
                      <img src={postData.thumbnail} alt={postData.author} className="w-full h-full object-cover" />
                    ) : (
                      <Instagram className="h-6 w-6 text-pink-600" />
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base sm:text-lg">{postData.author}</span>
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[11px] font-bold">
                      Verified Post
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Instagram Media Post</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                {postData.isMultiple && (
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    disabled={isDownloadingAll}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
                  >
                    {isDownloadingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Downloading All...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="h-4 w-4" />
                        <span>Download All ({postData.totalFiles} Files)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Post Caption */}
            {postData.title && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                <span className="font-semibold text-slate-900 mr-2">{postData.author}:</span>
                {postData.title}
              </div>
            )}

            {/* Files Summary Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Detected Media Files ({postData.totalFiles})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Direct Original Size Downloads (No Re-encoding)
              </span>
            </div>

            {/* Detected Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {postData.files.map((file) => {
                const isDownloading = downloadingFileId === file.id;
                const isCompleted = completedFileIds.has(file.id);

                return (
                  <div
                    key={file.id}
                    className="flex flex-col bg-slate-50/80 border border-slate-200/90 rounded-2xl overflow-hidden hover:border-pink-300 transition-all shadow-2xs group"
                  >
                    {/* Media Preview Container */}
                    <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      {file.type === 'video' ? (
                        <video
                          src={file.downloadUrl}
                          poster={file.thumbnail}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <>
                          <img
                            src={file.downloadUrl || file.thumbnail}
                            alt={`Photo #${file.index}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => setActivePreviewImage(file.downloadUrl || file.thumbnail)}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100"
                            title="Expand preview"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {/* File Type Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-bold">
                        {file.type === 'video' ? (
                          <>
                            <Film className="h-3.5 w-3.5 text-pink-400" />
                            <span>Reel / Video</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Photo #{file.index}</span>
                          </>
                        )}
                      </div>

                      {/* Resolution badge */}
                      {file.resolution && (
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-slate-900/75 backdrop-blur-md text-slate-200 text-[10px] font-mono">
                          {file.resolution}
                        </div>
                      )}
                    </div>

                    {/* Footer with Info and Direct Download Button */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                          {file.filename}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                          {file.type === 'video' ? 'MP4' : 'JPG'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadFile(file)}
                        disabled={isDownloading}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-900 hover:bg-pink-600 text-white hover:shadow-pink-500/20'
                        } disabled:opacity-50`}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Preparing Original File...</span>
                          </>
                        ) : isCompleted ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Downloaded! Click to Save Again</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            <span>
                              Download Original {file.type === 'video' ? 'Video' : 'Photo'} (Full Size)
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo Preview */}
      {activePreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActivePreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setActivePreviewImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={activePreviewImage}
              alt="High-Res Preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
