import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  Play,
  ClipboardPaste,
  Maximize2,
  Minimize2,
  X,
  AlertCircle,
  Clock,
  Trash2,
  ShieldCheck,
  Tv,
  Moon,
  Sun,
} from 'lucide-react';
import {
  parseYouTubeUrl,
  buildNoCookieEmbedUrl,
  formatTimestampLabel,
} from '../utils/youtubePlayerUrl';
import { YOUTUBE_PLAYER_SEO } from '../data/youtubePlayerFaq';

const YouTubePlayerSeoContent = React.lazy(
  () => import('../components/YouTubePlayerSeoContent')
);

const RECENT_WATCHED_STORAGE_KEY = 'youtiktools_yt_player_recent_v1';
const MAX_RECENT_ITEMS = 5;

interface RecentWatchedItem {
  videoId: string;
  originalUrl: string;
  startSeconds: number | null;
  watchedAt: number;
}

interface ActivePlayerVideo {
  videoId: string;
  startSeconds: number | null;
  embedUrl: string;
  sourceUrl: string;
}

interface YouTubePlayerPageProps {
  onNavigate?: (path: string) => void;
}

const SUPPORTED_FORMAT_EXAMPLES = [
  'youtube.com/watch?v=VIDEO_ID',
  'youtu.be/VIDEO_ID',
  'youtube.com/shorts/VIDEO_ID',
  'youtube.com/live/VIDEO_ID',
  'youtube.com/embed/VIDEO_ID',
  'm.youtube.com/watch?v=VIDEO_ID&t=1m30s',
];

function loadRecentWatched(): RecentWatchedItem[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(RECENT_WATCHED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentWatchedItem =>
          Boolean(item) &&
          typeof item.videoId === 'string' &&
          typeof item.originalUrl === 'string' &&
          typeof item.watchedAt === 'number'
      )
      .slice(0, MAX_RECENT_ITEMS);
  } catch {
    return [];
  }
}

function saveRecentWatched(items: RecentWatchedItem[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(
      RECENT_WATCHED_STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_RECENT_ITEMS))
    );
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

export const YouTubePlayerPage: React.FC<YouTubePlayerPageProps> = ({ onNavigate }) => {
  const [urlInput, setUrlInput] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<ActivePlayerVideo | null>(null);
  const [recentWatched, setRecentWatched] = useState<RecentWatchedItem[]>(() =>
    loadRecentWatched()
  );

  // Fullscreen & graceful theater fallback state
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isFallbackTheater, setIsFallbackTheater] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState<string | null>(null);

  // Player surface follows site light theme by default, or user system dark preference if chosen
  const [theaterBackdrop, setTheaterBackdrop] = useState<'light' | 'dark'>(() => {
    try {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch {
      // Ignore matchMedia issues
    }
    return 'light';
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);

  const isAnyFullscreen = isNativeFullscreen || isFallbackTheater;

  // Listen to native fullscreenchange events (including ESC key exits)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        msFullscreenElement?: Element | null;
      };
      const fsElement =
        doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement || null;
      setIsNativeFullscreen(Boolean(fsElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // ESC key support for theater-mode fallback
  useEffect(() => {
    if (!isFallbackTheater) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFallbackTheater(false);
        setFullscreenNotice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFallbackTheater]);

  const recordRecentItem = (item: RecentWatchedItem) => {
    setRecentWatched((prev) => {
      const filtered = prev.filter(
        (existing) =>
          !(
            existing.videoId === item.videoId &&
            existing.startSeconds === item.startSeconds
          )
      );
      const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS);
      saveRecentWatched(updated);
      return updated;
    });
  };

  const playUrl = (rawLink: string) => {
    setInlineError(null);
    setClipboardNotice(null);
    setFullscreenNotice(null);

    const parsed = parseYouTubeUrl(rawLink);
    if (!parsed) {
      setInlineError(
        'That link does not look like a recognized YouTube video URL. Please check the address and try one of the supported formats below.'
      );
      return;
    }

    const embedUrl = buildNoCookieEmbedUrl(parsed.videoId, parsed.startSeconds);
    setActiveVideo({
      videoId: parsed.videoId,
      startSeconds: parsed.startSeconds,
      embedUrl,
      sourceUrl: rawLink.trim(),
    });

    recordRecentItem({
      videoId: parsed.videoId,
      originalUrl: rawLink.trim(),
      startSeconds: parsed.startSeconds,
      watchedAt: Date.now(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setInlineError('Paste a YouTube link above first, then click Watch now.');
      inputRef.current?.focus();
      return;
    }
    playUrl(urlInput);
  };

  const handlePasteFromClipboard = async () => {
    setInlineError(null);
    setClipboardNotice(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard ||
      typeof navigator.clipboard.readText !== 'function'
    ) {
      setClipboardNotice(
        'Clipboard access is unavailable in this browser. Focus the input box and press Ctrl+V (or Cmd+V).'
      );
      inputRef.current?.focus();
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        setClipboardNotice('Your clipboard appears empty. Copy a YouTube link first and try again.');
        inputRef.current?.focus();
        return;
      }
      setUrlInput(text.trim());
      inputRef.current?.focus();
    } catch {
      setClipboardNotice(
        'Clipboard permission was blocked. Please paste directly into the box using Ctrl+V or Cmd+V.'
      );
      inputRef.current?.focus();
    }
  };

  const handleToggleFullscreen = async () => {
    setFullscreenNotice(null);

    if (isFallbackTheater) {
      setIsFallbackTheater(false);
      return;
    }

    if (isNativeFullscreen) {
      try {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void> | void;
          msExitFullscreen?: () => Promise<void> | void;
        };
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      } catch {
        setIsNativeFullscreen(false);
      }
      return;
    }

    const wrapper = playerWrapperRef.current as
      | (HTMLDivElement & {
          webkitRequestFullscreen?: () => Promise<void> | void;
          msRequestFullscreen?: () => Promise<void> | void;
        })
      | null;

    if (!wrapper) return;

    const requestMethod =
      wrapper.requestFullscreen || wrapper.webkitRequestFullscreen || wrapper.msRequestFullscreen;

    if (typeof requestMethod === 'function') {
      try {
        await requestMethod.call(wrapper);
        return;
      } catch {
        // Fall through cleanly to theater fallback
      }
    }

    // Graceful fallback when Fullscreen API is unavailable or blocked
    setIsFallbackTheater(true);
    setFullscreenNotice(
      'Expanded to full-window view (native full screen was unavailable in this browser context). Press Escape to exit.'
    );
  };

  const handleClearHistory = () => {
    setRecentWatched([]);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(RECENT_WATCHED_STORAGE_KEY);
      }
    } catch {
      // Ignore storage removal errors
    }
  };

  const handleScrollToInput = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isDarkSurface = theaterBackdrop === 'dark';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Above-the-fold Tool Workspace */}
      <section aria-labelledby="youtube-player-heading" className="space-y-6">
        {/* Header & H1 */}
        <header className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 shadow-2xs">
            <Tv className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
            <span>Privacy-Enhanced Embed</span>
          </div>
          <h1
            id="youtube-player-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            {YOUTUBE_PLAYER_SEO.h1}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {YOUTUBE_PLAYER_SEO.subheading}
          </p>
        </header>

        {/* Link Input Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <label htmlFor="youtube-player-url-input" className="sr-only">
              YouTube video link
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  id="youtube-player-url-input"
                  ref={inputRef}
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (inlineError) setInlineError(null);
                    if (clipboardNotice) setClipboardNotice(null);
                  }}
                  placeholder="Paste any YouTube link (watch, youtu.be, Shorts, live, or timestamped)..."
                  aria-invalid={Boolean(inlineError)}
                  aria-describedby={inlineError ? 'youtube-player-error' : undefined}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus:border-red-600 transition-colors motion-reduce:transition-none"
                />
                {urlInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput('');
                      setInlineError(null);
                      setClipboardNotice(null);
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear link input"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="h-12 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors motion-reduce:transition-none cursor-pointer"
                >
                  <ClipboardPaste className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  <span>Paste</span>
                </button>

                <button
                  type="submit"
                  className="h-12 flex-1 sm:flex-initial px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 transition-colors motion-reduce:transition-none cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                  <span>Watch now</span>
                </button>
              </div>
            </div>
          </form>

          {/* Clipboard Info Banner */}
          {clipboardNotice && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700"
            >
              <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{clipboardNotice}</span>
            </div>
          )}

          {/* Inline Validation Error with Supported Formats */}
          {inlineError && (
            <div
              id="youtube-player-error"
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-900 space-y-2"
            >
              <div className="flex items-start gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{inlineError}</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-xs font-semibold text-red-800">Supported link formats:</p>
                <ul className="flex flex-wrap gap-1.5">
                  {SUPPORTED_FORMAT_EXAMPLES.map((example) => (
                    <li
                      key={example}
                      className="font-mono text-[11px] bg-white/90 text-red-800 border border-red-200 rounded-md px-2 py-0.5"
                    >
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Player Frame Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>
                {activeVideo ? (
                  <>
                    Playing ID{' '}
                    <code className="font-mono text-slate-900 font-semibold">
                      {activeVideo.videoId}
                    </code>
                    {activeVideo.startSeconds ? (
                      <span className="ml-1.5 text-slate-500">
                        (starts at {formatTimestampLabel(activeVideo.startSeconds)})
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span>Ready for any public YouTube link</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Surface Dark / Light Toggle following site & system theme */}
              <button
                type="button"
                onClick={() =>
                  setTheaterBackdrop((prev) => (prev === 'light' ? 'dark' : 'light'))
                }
                aria-label={
                  isDarkSurface ? 'Switch player surround to light mode' : 'Switch player surround to dark mode'
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors motion-reduce:transition-none cursor-pointer"
              >
                {isDarkSurface ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                    <span>Light frame</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
                    <span>Dark frame</span>
                  </>
                )}
              </button>

              {/* Full screen button (Fullscreen API + ESC + graceful fallback) */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                disabled={!activeVideo}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 transition-colors motion-reduce:transition-none ${
                  activeVideo
                    ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
              >
                {isAnyFullscreen ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Exit full screen (ESC)</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Full screen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Responsive 16:9 Player Container */}
          <div
            ref={playerWrapperRef}
            className={
              isFallbackTheater
                ? 'fixed inset-0 z-50 bg-black flex flex-col justify-center p-2 sm:p-6'
                : `rounded-2xl overflow-hidden border transition-colors motion-reduce:transition-none ${
                    isDarkSurface
                      ? 'bg-slate-950 border-slate-800 p-2 sm:p-3'
                      : 'bg-slate-100 border-slate-200 p-2 sm:p-3'
                  }`
            }
          >
            {isFallbackTheater && (
              <div className="flex items-center justify-between px-2 pb-2 text-white text-xs">
                <span className="font-semibold">Full-Window Theater Mode (Press ESC to exit)</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsFallbackTheater(false);
                    setFullscreenNotice(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                >
                  <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Exit</span>
                </button>
              </div>
            )}

            <div
              className={`relative aspect-video w-full overflow-hidden rounded-xl ${
                isFallbackTheater ? 'max-h-[88vh] mx-auto' : ''
              } ${isDarkSurface || isAnyFullscreen ? 'bg-black' : 'bg-slate-900'}`}
            >
              {activeVideo ? (
                <iframe
                  key={activeVideo.embedUrl}
                  src={activeVideo.embedUrl}
                  title={`YouTube embed player for video ${activeVideo.videoId}`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 ${
                    isDarkSurface
                      ? 'bg-slate-950 text-slate-300'
                      : 'bg-slate-900 text-slate-200'
                  }`}
                >
                  <div className="h-14 w-14 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center">
                    <Play className="h-7 w-7 text-red-500 ml-0.5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <p className="text-sm sm:text-base font-bold text-white">
                      Your clean 16:9 YouTube player appears here
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Paste any YouTube URL above and click Watch now to begin playback with native controls.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fullscreen fallback note if triggered */}
          {fullscreenNotice && (
            <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              {fullscreenNotice}
            </p>
          )}

          {/* Required Privacy & Ads Note under the player */}
          <p className="text-xs text-slate-500 text-center">
            Plays through YouTube&apos;s privacy-enhanced embed. Ads can still appear on some monetized videos.
          </p>

          {/* Recently Watched List (Last 5 links, localStorage in try/catch) */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Clock className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>Recently watched</span>
                <span className="font-normal text-slate-500">(stored locally in your browser)</span>
              </div>

              {recentWatched.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 transition-colors motion-reduce:transition-none cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {recentWatched.length === 0 ? (
              <p className="text-xs text-slate-500">
                No recent links yet. Your last 5 watched YouTube links will appear here for quick replay.
              </p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {recentWatched.map((item) => (
                  <li key={`${item.videoId}-${item.watchedAt}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setUrlInput(item.originalUrl);
                        playUrl(item.originalUrl);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 transition-colors motion-reduce:transition-none cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="block font-mono text-xs font-semibold text-slate-900 truncate">
                          {item.originalUrl.replace(/^https?:\/\/(www\.)?/, '')}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          ID: {item.videoId}
                          {item.startSeconds ? ` · ${formatTimestampLabel(item.startSeconds)}` : ''}
                        </span>
                      </div>
                      <Play className="h-3.5 w-3.5 text-red-600 shrink-0" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Lazy-Loaded Below-the-Fold SEO Content */}
      <Suspense
        fallback={
          <div className="py-8 text-center text-xs text-slate-500">
            Loading guide and frequently asked questions...
          </div>
        }
      >
        <YouTubePlayerSeoContent
          onScrollToInput={handleScrollToInput}
          onNavigate={onNavigate}
        />
      </Suspense>
    </div>
  );
};
