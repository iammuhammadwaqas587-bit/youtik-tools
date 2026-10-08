import React, { useState, useRef } from 'react';
import { 
  TikTokVideoData 
} from '../types';
import { 
  fetchTikTokVideo, 
  SAMPLE_TIKTOK_VIDEOS 
} from '../utils/tiktok';
import { triggerDirectMediaDownload } from '../utils/mediaDownloader';
import { 
  Download, 
  Sparkles, 
  Music, 
  Film, 
  Clipboard, 
  X, 
  ArrowRight, 
  Loader2, 
  Heart, 
  Eye, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle,
  ImageIcon
} from 'lucide-react';

interface TikTokDownloaderProps {
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

export const TikTokDownloader: React.FC<TikTokDownloaderProps> = ({
  onShowToast,
  onRecordHistory,
  initialUrl = '',
}) => {
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<TikTokVideoData | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFetch = async (targetUrl: string = urlInput) => {
    if (!targetUrl.trim()) return;
    setError(null);
    setIsLoading(true);

    try {
      const data = await fetchTikTokVideo(targetUrl.trim());
      setVideoData(data);
      onShowToast(`Loaded TikTok by @${data.author.unique_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to download TikTok video. Please verify the URL.');
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
    inputRef.current?.focus();
  };

  const handleDownloadMedia = async (
    mediaUrl: string, 
    type: 'no_wm_hd' | 'no_wm' | 'wm' | 'audio' | 'cover',
    label: string,
    extension: string
  ) => {
    if (!videoData) return;
    setDownloadingFormat(type);
    onShowToast(`Downloading ${label}...`);

    try {
      const cleanTitle = (videoData.title || `tiktok_${videoData.author.unique_id}`)
        .replace(/[/\\?%*:|"<>]/g, '')
        .trim()
        .slice(0, 60);
      const filename = `[YouTikTools] ${videoData.author.unique_id}_${cleanTitle}_${type}.${extension}`;

      await triggerDirectMediaDownload(mediaUrl, filename);

      onRecordHistory({
        title: videoData.title || `TikTok by @${videoData.author.unique_id}`,
        thumbnail: videoData.cover,
        format: label,
        url: urlInput || `https://www.tiktok.com/@${videoData.author.unique_id}/video/${videoData.id}`,
        downloadUrl: mediaUrl,
        extension
      });

      onShowToast(`Saved: ${filename}`);
    } catch (err: any) {
      onShowToast('Download failed: ' + err.message);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const formatCount = (num?: number) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-800 text-xs font-bold mb-3">
          <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
          <span>Zero Watermark Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          TikTok Video <span className="text-cyan-700">Downloader</span>
        </h1>
        <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-normal">
          Download high-definition TikTok videos without watermark in MP4 or save original MP3 audio directly to your mobile or laptop.
        </p>
      </div>

      {/* Input Bar */}
      <div className="max-w-2xl mx-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleFetch();
          }}
          className="relative"
        >
          <div className={`relative flex items-center bg-white border-2 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 transition-all ${
            error 
              ? 'border-red-500 ring-2 ring-red-100' 
              : 'border-slate-200 hover:border-slate-300 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-50'
          }`}>
            <input
              ref={inputRef}
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste TikTok video URL (e.g., https://www.tiktok.com/@user/video/... or vt.tiktok.com/...)"
              className="w-full py-4 pl-4 pr-2 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none font-sans"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="flex items-center gap-1.5 pr-2">
              {urlInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {!urlInput && (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  <span>Paste</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-cyan-600/20 cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <span>Get Video</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick sample link */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 justify-center">
          <span className="text-slate-500 text-[11px] font-semibold">Try sample:</span>
          {SAMPLE_TIKTOK_VIDEOS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrlInput(s.url);
                handleFetch(s.url);
              }}
              className="text-xs font-medium text-cyan-700 hover:underline cursor-pointer"
            >
              {s.author} ({s.title.slice(0, 20)}...)
            </button>
          ))}
        </div>
      </div>

      {/* Video Result Card */}
      {videoData && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Video Player Preview */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative aspect-[9/16] w-full max-w-[260px] rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-lg">
                <video
                  controls
                  playsInline
                  poster={videoData.cover}
                  src={videoData.play}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Video Details & Actions */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={videoData.author.avatar}
                    alt={videoData.author.unique_id}
                    className="w-12 h-12 rounded-full border border-slate-200 object-cover bg-slate-100"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{videoData.author.nickname}</span>
                      <span className="text-xs font-normal text-slate-500">@{videoData.author.unique_id}</span>
                    </h3>
                    <p className="text-xs text-cyan-700 font-semibold flex items-center gap-1 mt-0.5">
                      <Music className="h-3 w-3" />
                      <span className="truncate max-w-[280px]">
                        {videoData.music_info?.title || 'Original Sound'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Caption / Description */}
                <p className="mt-3.5 text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
                  {videoData.title || 'No description'}
                </p>

                {/* Stats */}
                <div className="mt-3.5 flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                    <span>{formatCount(videoData.digg_count)}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatCount(videoData.play_count)} views</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatCount(videoData.comment_count)} comments</span>
                  </span>
                </div>
              </div>

              {/* Download Buttons Section */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Available Formats (Mobile & Laptop Compatible):</span>
                </p>

                {/* 1. Primary: Without Watermark (HD MP4) */}
                <button
                  type="button"
                  disabled={downloadingFormat !== null}
                  onClick={() =>
                    handleDownloadMedia(
                      videoData.hdplay || videoData.play,
                      'no_wm_hd',
                      'Without Watermark (HD MP4)',
                      'mp4'
                    )
                  }
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/25 transition-all hover:scale-101 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    <span>Without Watermark (HD MP4)</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-800 text-cyan-100 text-[10px] uppercase font-mono">
                      Best Quality
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-normal">
                    {downloadingFormat === 'no_wm_hd' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </>
                    )}
                  </div>
                </button>

                {/* 2. Without Watermark (Standard MP4) */}
                <button
                  type="button"
                  disabled={downloadingFormat !== null}
                  onClick={() =>
                    handleDownloadMedia(
                      videoData.play,
                      'no_wm',
                      'Without Watermark (MP4)',
                      'mp4'
                    )
                  }
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-cyan-700" />
                    <span>Without Watermark (Standard MP4)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-normal text-slate-500">
                    {downloadingFormat === 'no_wm' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Save MP4</span>
                      </>
                    )}
                  </div>
                </button>

                {/* 3. Audio MP3 */}
                {videoData.music && (
                  <button
                    type="button"
                    disabled={downloadingFormat !== null}
                    onClick={() =>
                      handleDownloadMedia(
                        videoData.music!,
                        'audio',
                        'TikTok Audio (MP3)',
                        'mp3'
                      )
                    }
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-amber-600" />
                      <span>Download Audio Only (MP3 Sound)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-normal text-slate-500">
                      {downloadingFormat === 'audio' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>Save MP3</span>
                        </>
                      )}
                    </div>
                  </button>
                )}

                {/* 4. With Watermark Original */}
                {videoData.wmplay && (
                  <button
                    type="button"
                    disabled={downloadingFormat !== null}
                    onClick={() =>
                      handleDownloadMedia(
                        videoData.wmplay!,
                        'wm',
                        'With Watermark (Original)',
                        'mp4'
                      )
                    }
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/60 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors cursor-pointer"
                  >
                    <span>With Watermark (Original TikTok)</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </span>
                  </button>
                )}

                {/* 5. Cover photo */}
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadMedia(
                      videoData.origin_cover || videoData.cover,
                      'cover',
                      'Cover Photo',
                      'jpg'
                    )
                  }
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs transition-colors cursor-pointer font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Download Cover Photo (HD)</span>
                  </span>
                  <span>JPG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
