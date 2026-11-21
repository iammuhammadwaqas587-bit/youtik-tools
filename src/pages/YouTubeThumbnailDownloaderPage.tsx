import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import { extractYouTubeId } from '../utils/youtube';
import {
  Image as ImageIcon,
  Download,
  ClipboardPaste,
  Trash2,
  Sun,
  Moon,
  AlertCircle,
  ExternalLink,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface YouTubeThumbnailDownloaderPageProps {
  onNavigate: (path: string) => void;
}

interface ThumbnailPreset {
  key: 'maxres' | 'sd' | 'hq' | 'mq' | 'default';
  label: string;
  badge: string;
  filenameSuffix: string;
  expectedNote: string;
}

const THUMBNAIL_PRESETS: ThumbnailPreset[] = [
  {
    key: 'maxres',
    label: 'Max Resolution (HD)',
    badge: '1280×720',
    filenameSuffix: 'maxresdefault',
    expectedNote: 'Full HD 16:9',
  },
  {
    key: 'sd',
    label: 'Standard Definition (SD)',
    badge: '640×480',
    filenameSuffix: 'sddefault',
    expectedNote: '4:3 Standard',
  },
  {
    key: 'hq',
    label: 'High Quality (HQ)',
    badge: '480×360',
    filenameSuffix: 'hqdefault',
    expectedNote: '4:3 High',
  },
  {
    key: 'mq',
    label: 'Medium Quality (MQ)',
    badge: '320×180',
    filenameSuffix: 'mqdefault',
    expectedNote: '16:9 Medium',
  },
  {
    key: 'default',
    label: 'Default Thumbnail',
    badge: '120×90',
    filenameSuffix: 'default',
    expectedNote: 'Small Preview',
  },
];

interface LoadedThumbnail {
  preset: ThumbnailPreset;
  url: string;
  width: number;
  height: number;
}

export const YouTubeThumbnailDownloaderPage: React.FC<YouTubeThumbnailDownloaderPageProps> = ({
  onNavigate,
}) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)
      );
    } catch {
      return false;
    }
  });

  const [urlInput, setUrlInput] = useState<string>('');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [availableThumbs, setAvailableThumbs] = useState<LoadedThumbnail[]>([]);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);
  const [downloadNote, setDownloadNote] = useState<string | null>(null);

  const probeSessionRef = useRef<number>(0);

  const probeThumbnailsForId = useCallback((videoId: string) => {
    const session = ++probeSessionRef.current;
    setIsChecking(true);
    setErrorMsg(null);
    setAvailableThumbs([]);
    setActiveVideoId(videoId);

    const results: Array<LoadedThumbnail | null> = new Array(THUMBNAIL_PRESETS.length).fill(null);
    let completed = 0;

    THUMBNAIL_PRESETS.forEach((preset, index) => {
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/${preset.filenameSuffix}.jpg`;
      const img = new Image();

      const finish = (validThumb: LoadedThumbnail | null) => {
        if (probeSessionRef.current !== session) return;
        results[index] = validThumb;
        completed += 1;
        if (completed === THUMBNAIL_PRESETS.length) {
          const filtered = results.filter((item): item is LoadedThumbnail => item !== null);
          setAvailableThumbs(filtered);
          setIsChecking(false);
          if (filtered.length === 0) {
            setErrorMsg(
              'No high-resolution thumbnails (> 120 px) were returned for this video ID. Verify the YouTube link and try again.'
            );
          }
        }
      };

      img.onload = () => {
        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        // YouTube serves a 120x90 placeholder image for sizes that do not exist
        if (w > 120) {
          finish({
            preset,
            url: thumbUrl,
            width: w,
            height: h,
          });
        } else {
          finish(null);
        }
      };

      img.onerror = () => finish(null);
      img.src = thumbUrl;
    });
  }, []);

  const handleFetchFromString = useCallback(
    (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed) {
        setErrorMsg('Please paste a YouTube video, Shorts, embed, or youtu.be link.');
        setActiveVideoId(null);
        setAvailableThumbs([]);
        return;
      }

      const id = extractYouTubeId(trimmed);
      if (!id) {
        setErrorMsg(
          'Invalid YouTube URL. Supported formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID, and m.youtube.com links.'
        );
        setActiveVideoId(null);
        setAvailableThumbs([]);
        return;
      }

      probeThumbnailsForId(id);
    },
    [probeThumbnailsForId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchFromString(urlInput);
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted) {
      const id = extractYouTubeId(pasted.trim());
      if (id) {
        setUrlInput(pasted.trim());
        e.preventDefault();
        probeThumbnailsForId(id);
      }
    }
  };

  const handlePasteButton = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.clipboard?.readText) {
        setErrorMsg('Clipboard reading is unavailable in this browser. Press Ctrl+V inside the link box.');
        return;
      }
      const clipText = await navigator.clipboard.readText();
      if (!clipText || !clipText.trim()) {
        setErrorMsg('Your clipboard is empty. Copy a YouTube link first.');
        return;
      }
      const cleaned = clipText.trim();
      setUrlInput(cleaned);
      handleFetchFromString(cleaned);
    } catch {
      setErrorMsg('Clipboard access was denied. Paste the link directly into the input box (Ctrl+V).');
    }
  };

  const handleClear = () => {
    probeSessionRef.current += 1;
    setUrlInput('');
    setActiveVideoId(null);
    setAvailableThumbs([]);
    setErrorMsg(null);
    setIsChecking(false);
    setDownloadNote(null);
  };

  const handleDownloadThumbnail = async (thumb: LoadedThumbnail) => {
    if (!activeVideoId) return;
    setDownloadingKey(thumb.preset.key);
    setDownloadNote(null);

    const filename = `youtube-thumbnail-${activeVideoId}-${thumb.preset.filenameSuffix}.jpg`;

    try {
      const response = await fetch(thumb.url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);

      setDownloadedKey(thumb.preset.key);
      window.setTimeout(
        () => setDownloadedKey((prev) => (prev === thumb.preset.key ? null : prev)),
        2000
      );
    } catch {
      // Fallback: open image in a new tab cleanly without window.open if CORS blocks blob fetch
      const fallbackLink = document.createElement('a');
      fallbackLink.href = thumb.url;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      fallbackLink.remove();
      setDownloadNote(
        'Browser CORS blocked direct file save for this host—opened the full image in a new tab where you can right-click and Save Image.'
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  useEffect(() => {
    return () => {
      probeSessionRef.current += 1;
    };
  }, []);

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'YouTube Tag Generator',
      path: '/youtube-tag-generator',
      description: 'Generate SEO tags, hashtags & 5 alternative titles for YouTube.',
      icon: '🏷️',
    },
    {
      name: 'YouTube Video Downloader',
      path: '/youtube-video-downloader',
      description: 'Download full YouTube videos in 1080p Full HD and 4K MP4.',
      icon: '🎬',
    },
    {
      name: 'Image Format Converter',
      path: '/image-converter',
      description: 'Convert downloaded JPG thumbnails to WebP, PNG, or AVIF.',
      icon: '🖼️',
    },
    {
      name: 'YouTube Player',
      path: '/youtube-player',
      description: 'Watch any YouTube link or Short distraction-free.',
      icon: '📺',
    },
  ];

  const workspaceShell = isDarkTheme
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-slate-50/70 text-slate-900 border-slate-200';
  const cardSurface = isDarkTheme
    ? 'bg-slate-800/90 border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const inputSurface = isDarkTheme
    ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';
  const labelText = isDarkTheme ? 'text-slate-300' : 'text-slate-700';
  const mutedText = isDarkTheme ? 'text-slate-400' : 'text-slate-500';

  return (
    <ToolLayout
      toolPath="/youtube-thumbnail-downloader"
      title="YouTube Thumbnail Downloader"
      badgeText="Maxres 1280×720 · SD · HQ · MQ"
      badgeIcon={<ImageIcon className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />}
      description="Grab crisp YouTube video thumbnails in Max Resolution (1280×720), Standard (640×480), High Quality (480×360), and Medium Quality directly in your browser. Automatically checks every resolution and hides missing sizes."
      howItWorks={{
        heading: 'How to Download Any YouTube Video Thumbnail in HD',
        text: 'Paste any standard watch, youtu.be, Shorts, embed, or mobile m.youtube.com link. We extract the 11-character video ID in your browser, check each thumbnail size for real resolution (> 120 px wide), and download JPGs directly via fetch and blob.',
        steps: [
          {
            number: 1,
            title: 'Paste YouTube Link',
            description:
              'Paste or click Paste—valid links auto-fetch thumbnails immediately without extra clicks.',
          },
          {
            number: 2,
            title: 'Auto-Filter Available Sizes',
            description:
              'Every thumbnail URL is verified in your browser; missing 120×90 placeholder images are hidden automatically.',
          },
          {
            number: 3,
            title: 'Save JPG to Device',
            description:
              'Click Download to save the JPG directly to your device (with new-tab fallback if CORS restricts it).',
          },
        ],
      }}
      supportedFormats={[
        { format: 'youtube.com/watch?v=ID', description: 'Standard desktop watch links with or without extra query parameters.' },
        { format: 'youtu.be/ID', description: 'Short share links copied from the YouTube share menu.' },
        { format: 'youtube.com/shorts/ID', description: 'Vertical YouTube Shorts links.' },
        { format: 'youtube.com/embed/ID & m.youtube.com', description: 'Embedded player URLs and mobile links.' },
      ]}
      tips={[
        'Older SD uploads may not have a 1280×720 maxresdefault image—in that case, Standard (640×480) or HQ (480×360) is automatically shown at top.',
        'Need WebP or PNG instead of JPG? Convert your downloaded thumbnail locally with our Image Format Converter.',
      ]}
      faqs={[
        {
          question: 'Why does Max Resolution sometimes not appear for a video?',
          answer:
            'YouTube only generates a 1280×720 maxresdefault.jpg when the creator uploaded a custom HD thumbnail or a high-definition video. Our tool checks the loaded image width and hides missing 120 px placeholder sizes automatically.',
        },
        {
          question: 'Are YouTube thumbnails free to reuse anywhere?',
          answer:
            'Thumbnails belong to their creators. Use them for inspiration, design reference, or your own videos, and ask permission before republishing someone else’s artwork.',
        },
        {
          question: 'Does this tool need an API key or send links to a backend?',
          answer:
            'No. Link parsing, resolution detection, and JPG downloads run entirely in your web browser without backend servers or API keys.',
        },
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div
        className={`rounded-2xl border p-4 sm:p-6 space-y-6 transition-colors ${workspaceShell}`}
        style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
      >
        {/* Header Bar with Light/Dark Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`text-xs font-semibold ${mutedText}`}>
            Supports watch, youtu.be, Shorts, embed &amp; m.youtube.com links
          </div>
          <button
            type="button"
            onClick={() => setIsDarkTheme((prev) => !prev)}
            aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
          >
            {isDarkTheme ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
            <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="yt-thumb-url" className={`block text-xs font-bold ${labelText}`}>
            YouTube Video URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="yt-thumb-url"
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              onPaste={handlePasteEvent}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
              className={`flex-1 min-w-0 h-11 px-3.5 rounded-xl border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${inputSurface}`}
            />

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePasteButton}
                className={`h-11 inline-flex items-center gap-1.5 px-3.5 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
              >
                <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Paste</span>
              </button>

              {urlInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`h-11 inline-flex items-center gap-1.5 px-3.5 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="submit"
                className="h-11 inline-flex items-center gap-1.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold cursor-pointer shadow-xs"
              >
                <span>Get Thumbnails</span>
              </button>
            </div>
          </div>

          {/* Quick sample buttons */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className={mutedText}>Try a sample:</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
                setUrlInput(sample);
                handleFetchFromString(sample);
              }}
              className="text-red-600 font-semibold hover:underline cursor-pointer"
            >
              Big Buck Bunny 4K
            </button>
            <span className={mutedText}>·</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'https://youtu.be/M7lc1UVf-VE';
                setUrlInput(sample);
                handleFetchFromString(sample);
              }}
              className="text-red-600 font-semibold hover:underline cursor-pointer"
            >
              YouTube Developers Demo
            </button>
          </div>
        </form>

        {/* Validation Error */}
        {errorMsg && (
          <div
            role="alert"
            className={`rounded-xl border px-4 py-3 flex items-start gap-2.5 text-xs ${
              isDarkTheme
                ? 'bg-red-950/60 border-red-800 text-red-200'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Loading Probe State */}
        {isChecking && (
          <div className="py-10 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" aria-hidden="true" />
            <p className={`text-xs font-medium ${mutedText}`}>
              Checking available thumbnail resolutions...
            </p>
          </div>
        )}

        {/* Download fallback note */}
        {downloadNote && (
          <div
            className={`rounded-xl border px-4 py-2.5 text-xs ${
              isDarkTheme
                ? 'bg-amber-950/50 border-amber-700 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {downloadNote}
          </div>
        )}

        {/* Available Thumbnails Grid */}
        {!isChecking && availableThumbs.length > 0 && activeVideoId && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-extrabold">
                Available Thumbnails for{' '}
                <span className="font-mono text-red-600">{activeVideoId}</span> (
                {availableThumbs.length})
              </h2>
              <span className={`text-[11px] ${mutedText}`}>
                Missing sizes (&le; 120 px) hidden automatically
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableThumbs.map((thumb, idx) => (
                <article
                  key={thumb.preset.key}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between ${cardSurface} ${
                    idx === 0 && availableThumbs.length % 2 === 1 ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="bg-slate-950 relative overflow-hidden">
                    <img
                      src={thumb.url}
                      alt={`${thumb.preset.label} (${thumb.width}x${thumb.height})`}
                      className="w-full h-auto max-h-80 object-contain mx-auto block"
                    />
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/85 text-white text-[11px] font-mono font-bold tabular-nums border border-slate-700">
                      {thumb.width} × {thumb.height} px
                    </span>
                  </div>

                  <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold">{thumb.preset.label}</h3>
                      <p className={`text-[11px] ${mutedText}`}>
                        {thumb.preset.filenameSuffix}.jpg · Detected {thumb.width} × {thumb.height} px
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={thumb.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Preview ${thumb.preset.label} in new tab`}
                        className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs font-semibold ${inputSurface}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Open</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDownloadThumbnail(thumb)}
                        disabled={downloadingKey === thumb.preset.key}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-xs font-bold cursor-pointer"
                      >
                        {downloadingKey === thumb.preset.key ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : downloadedKey === thumb.preset.key ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>
                          {downloadedKey === thumb.preset.key ? 'Saved JPG' : 'Download JPG'}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Creator Rights Note */}
        <p className={`flex items-center gap-2 text-xs font-medium pt-2 border-t ${isDarkTheme ? 'border-slate-700' : 'border-slate-200'} ${mutedText}`}>
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>Thumbnails belong to their creators. Use them with permission.</span>
        </p>
      </div>
    </ToolLayout>
  );
};
