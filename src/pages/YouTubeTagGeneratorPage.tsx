import React, { useState, useMemo } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Tag,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle,
  X,
  Plus,
  Loader2,
  Hash,
  Type,
  Scissors,
} from 'lucide-react';

interface YouTubeTagGeneratorPageProps {
  onNavigate: (path: string) => void;
}

type TagLanguage = 'English' | 'Urdu' | 'Roman Urdu' | 'Hindi';
type VideoType = 'tutorial' | 'vlog' | 'gaming' | 'review' | 'news' | 'other';

const LANGUAGES: TagLanguage[] = ['English', 'Urdu', 'Roman Urdu', 'Hindi'];
const VIDEO_TYPES: Array<{ value: VideoType; label: string }> = [
  { value: 'tutorial', label: 'Tutorial / How-To' },
  { value: 'vlog', label: 'Vlog / Lifestyle' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'review', label: 'Tech / Product Review' },
  { value: 'news', label: 'News / Commentary' },
  { value: 'other', label: 'Other' },
];

const YOUTUBE_TAG_CHAR_LIMIT = 500;

export const YouTubeTagGeneratorPage: React.FC<YouTubeTagGeneratorPageProps> = ({
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

  const [titleInput, setTitleInput] = useState<string>('');
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [language, setLanguage] = useState<TagLanguage>('English');
  const [videoType, setVideoType] = useState<VideoType>('tutorial');

  const [tags, setTags] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const commaJoinedTags = useMemo(() => tags.join(', '), [tags]);
  const totalTagChars = commaJoinedTags.length;
  const isOverLimit = totalTagChars > YOUTUBE_TAG_CHAR_LIMIT;

  const generateTags = async () => {
    const cleanTitle = titleInput.trim();
    if (!cleanTitle || cleanTitle.length < 2) {
      setErrorMsg('Please enter your video title or main keyword before generating tags.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setEditingIndex(null);

    try {
      const response = await fetch('/api/youtube-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          description: descriptionInput.trim(),
          language,
          videoType,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        if (typeof data?.remaining === 'number') {
          setRemainingQuota(data.remaining);
        }
        throw new Error(data?.error || `Request failed (${response.status}). Please try again.`);
      }

      setTags(Array.isArray(data.tags) ? data.tags : []);
      setHashtags(Array.isArray(data.hashtags) ? data.hashtags : []);
      setTitles(Array.isArray(data.titles) ? data.titles : []);
      if (typeof data.remaining === 'number') {
        setRemainingQuota(data.remaining);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to generate tags right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateTags();
  };

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleRemoveTag = (idx: number) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
    }
  };

  const startEditTag = (idx: number) => {
    setEditingIndex(idx);
    setEditingDraft(tags[idx] || '');
  };

  const commitEditTag = () => {
    if (editingIndex === null) return;
    const cleaned = editingDraft.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) {
      handleRemoveTag(editingIndex);
    } else {
      setTags((prev) => prev.map((t, i) => (i === editingIndex ? cleaned : t)));
    }
    setEditingIndex(null);
    setEditingDraft('');
  };

  const handleAddCustomTag = () => {
    const cleaned = newTagInput.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) return;
    setTags((prev) => [...prev, cleaned]);
    setNewTagInput('');
  };

  const handleTrimTo500 = () => {
    const kept: string[] = [];
    let runningLen = 0;
    for (const tag of tags) {
      const nextLen = kept.length === 0 ? tag.length : runningLen + 2 + tag.length;
      if (nextLen <= YOUTUBE_TAG_CHAR_LIMIT) {
        kept.push(tag);
        runningLen = nextLen;
      }
    }
    setTags(kept);
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'YouTube Thumbnail Downloader',
      path: '/youtube-thumbnail-downloader',
      description: 'Download HD Maxres & SD thumbnails from any YouTube link.',
      icon: '📸',
    },
    {
      name: 'YouTube Tags Extractor',
      path: '/youtube-tags-extractor',
      description: 'Inspect existing tags used on any published YouTube video.',
      icon: '🔍',
    },
    {
      name: 'Captions & Subtitles Downloader',
      path: '/video-captions-downloader',
      description: 'Export YouTube captions into SRT, VTT, or plain text.',
      icon: '🌐',
    },
    {
      name: 'YouTube Video Downloader',
      path: '/youtube-video-downloader',
      description: 'Download YouTube videos in 1080p Full HD and 4K MP4.',
      icon: '🎬',
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
      toolPath="/youtube-tag-generator"
      title="YouTube Tag Generator"
      badgeText="25–30 SEO Tags · Hashtags · Titles"
      badgeIcon={<Tag className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />}
      description="Generate 25–30 relevant short and long-tail YouTube SEO tags under the 500-character limit, 10 hashtags, and 5 clickable title alternatives in English, Urdu, Roman Urdu, or Hindi."
      howItWorks={{
        heading: 'How to Optimize YouTube Tags, Hashtags & Titles',
        text: 'Enter your video topic, optional summary, target audience language, and format type. Click any generated tag chip to edit or remove it before copying the comma-separated list directly into YouTube Studio.',
        steps: [
          {
            number: 1,
            title: 'Describe Your Video',
            description:
              'Type your working title or keyword, optional description, language (English/Urdu/Roman Urdu/Hindi), and video style.',
          },
          {
            number: 2,
            title: 'Edit & Fit 500 Characters',
            description:
              'Click any tag to tweak wording, remove off-topic keywords, and watch the live 500-character YouTube Studio meter.',
          },
          {
            number: 3,
            title: 'Copy Tags, Hashtags & Titles',
            description:
              'One-click copy comma-separated tags, description hashtags, or A/B title ideas directly into YouTube Studio.',
          },
        ],
      }}
      supportedFormats={[
        { format: '25–30 SEO Tags', description: 'Balanced short-tail and long-tail search phrases ordered by relevance.' },
        { format: '4 Creator Languages', description: 'English, Urdu, Roman Urdu, and Hindi creator keyword support.' },
        { format: 'Live 500-Char Counter', description: 'Matches YouTube Studio’s strict 500-character tag box limit.' },
        { format: 'Hashtags & Title Ideas', description: '10 description hashtags plus 5 high-CTR title alternatives.' },
      ]}
      tips={[
        'Put your single strongest keyword phrase first, followed by specific 3–5 word search queries viewers actually type.',
        'Pair strong keyword titles with a clean, readable thumbnail—viewer click-through rate and watch time drive most YouTube discovery.',
      ]}
      faqs={[
        {
          question: 'Do tags still help in 2026?',
          answer:
            'Honest answer: tags have only a small effect in 2026. YouTube itself notes that tags mainly help when words in your video are commonly misspelled or have ambiguous phrasing. Your video title, thumbnail, first two lines of the description, spoken audio captions, and audience retention matter far more for ranking and suggested traffic.',
        },
        {
          question: 'Why is there a 500-character limit on YouTube tags?',
          answer:
            'YouTube Studio caps the combined length of all tags (including commas) at 500 characters. Our live counter warns you immediately if your edited list exceeds 500 characters so nothing gets rejected when pasting.',
        },
        {
          question: 'How many hashtags should I actually put in my description?',
          answer:
            'Although we give you 10 relevant hashtags to pick from, picking 3 to 5 of the most accurate ones for the end of your video description looks cleanest and avoids spam flags.',
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
        {/* Top Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`text-xs font-semibold ${mutedText}`}>
            {remainingQuota !== null
              ? `${remainingQuota} of 10 hourly generations remaining`
              : 'Supports English, Urdu, Roman Urdu & Hindi'}
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
        <form onSubmit={handleSubmit} className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
          <div>
            <label htmlFor="yt-tag-title" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
              Video Title or Main Keyword <span className="text-red-500">*</span>
            </label>
            <input
              id="yt-tag-title"
              type="text"
              required
              maxLength={200}
              value={titleInput}
              onChange={(e) => {
                setTitleInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g. How to Edit Reels in CapCut for Beginners"
              className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${inputSurface}`}
            />
          </div>

          <div>
            <label htmlFor="yt-tag-desc" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
              Short Description (Optional)
            </label>
            <textarea
              id="yt-tag-desc"
              rows={2}
              maxLength={1000}
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Briefly mention key topics, tools, or audience..."
              className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${inputSurface}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="yt-tag-lang" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                Language
              </label>
              <select
                id="yt-tag-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value as TagLanguage)}
                className={`w-full h-11 px-3 rounded-xl border text-sm font-semibold cursor-pointer ${inputSurface}`}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="yt-tag-type" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                Video Type
              </label>
              <select
                id="yt-tag-type"
                value={videoType}
                onChange={(e) => setVideoType(e.target.value as VideoType)}
                className={`w-full h-11 px-3 rounded-xl border text-sm font-semibold cursor-pointer ${inputSurface}`}
              >
                {VIDEO_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>
                    {vt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-xs sm:text-sm font-bold cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isLoading ? 'Generating Tags...' : tags.length > 0 ? 'Regenerate Tags' : 'Generate Tags & Titles'}</span>
            </button>

            {tags.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={generateTags}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${inputSurface}`}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        </form>

        {/* Error Message */}
        {errorMsg && (
          <div
            role="alert"
            className={`rounded-xl border px-4 py-3 flex items-start gap-2.5 text-xs ${
              isDarkTheme
                ? 'bg-red-950/60 border-red-800 text-red-200'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Output Results */}
        {tags.length > 0 && (
          <div className="space-y-6">
            {/* 1. SEO Tags Panel */}
            <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-red-600" aria-hidden="true" />
                    <span>SEO Video Tags ({tags.length})</span>
                  </h2>
                  <p className={`text-[11px] ${mutedText}`}>
                    Click any tag to edit its wording, or click × to remove it.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tabular-nums border ${
                      isOverLimit
                        ? 'bg-red-600 text-white border-red-600'
                        : isDarkTheme
                        ? 'bg-slate-900 border-slate-700 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {totalTagChars} / {YOUTUBE_TAG_CHAR_LIMIT} chars
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopy('tags', commaJoinedTags)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {copiedKey === 'tags' ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copied All Tags</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copy All Tags</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isOverLimit && (
                <div
                  role="alert"
                  className={`rounded-xl border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs ${
                    isDarkTheme
                      ? 'bg-amber-950/60 border-amber-700 text-amber-200'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>
                      Over YouTube&apos;s 500-character tag limit by{' '}
                      <strong>{totalTagChars - YOUTUBE_TAG_CHAR_LIMIT}</strong> characters. Remove or shorten tags before pasting.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTrimTo500}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] cursor-pointer"
                  >
                    <Scissors className="h-3 w-3" aria-hidden="true" />
                    <span>Trim to &le; 500 chars</span>
                  </button>
                </div>
              )}

              {/* Interactive Tag Chips */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => {
                  const isEditing = editingIndex === idx;
                  return isEditing ? (
                    <div key={`${idx}-${tag}`} className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        autoFocus
                        value={editingDraft}
                        onChange={(e) => setEditingDraft(e.target.value)}
                        onBlur={commitEditTag}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitEditTag();
                          } else if (e.key === 'Escape') {
                            setEditingIndex(null);
                          }
                        }}
                        aria-label="Edit tag text"
                        className={`h-8 px-2.5 rounded-lg border text-xs font-semibold ${inputSurface}`}
                      />
                    </div>
                  ) : (
                    <div
                      key={`${idx}-${tag}`}
                      className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg border text-xs font-semibold ${
                        isDarkTheme
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => startEditTag(idx)}
                        title="Click to edit tag"
                        className="hover:underline cursor-pointer text-left"
                      >
                        {tag}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        aria-label={`Remove tag ${tag}`}
                        className="p-0.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Quick Add Tag */}
              <div className="flex gap-2 pt-1 max-w-sm">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="Add custom tag..."
                  aria-label="Add custom tag"
                  className={`flex-1 h-9 px-3 rounded-xl border text-xs ${inputSurface}`}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className={`inline-flex items-center gap-1 px-3 h-9 rounded-xl border text-xs font-bold cursor-pointer ${inputSurface}`}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add</span>
                </button>
              </div>
            </section>

            {/* 2. Hashtags + 3. Title Alternatives */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Hashtags */}
              <section className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-extrabold flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-red-600" aria-hidden="true" />
                    <span>Hashtags ({hashtags.length})</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleCopy('hashtags', hashtags.join(' '))}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${inputSurface}`}
                  >
                    {copiedKey === 'hashtags' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copy Hashtags</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {hashtags.map((h) => (
                    <span
                      key={h}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${
                        isDarkTheme
                          ? 'bg-slate-900 border-slate-700 text-red-400'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </section>

              {/* Title Alternatives */}
              <section className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
                <h2 className="text-sm font-extrabold flex items-center gap-1.5">
                  <Type className="h-4 w-4 text-red-600" aria-hidden="true" />
                  <span>5 Title Alternatives</span>
                </h2>

                <ul className="space-y-2">
                  {titles.map((t, idx) => (
                    <li
                      key={`${idx}-${t}`}
                      className={`rounded-xl border px-3 py-2 flex items-center justify-between gap-2 text-xs sm:text-sm ${
                        isDarkTheme ? 'bg-slate-900/70 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="font-semibold">{t}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`title-${idx}`, t)}
                        aria-label={`Copy title ${idx + 1}`}
                        className={`shrink-0 p-1.5 rounded-lg border cursor-pointer ${inputSurface}`}
                      >
                        {copiedKey === `title-${idx}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
