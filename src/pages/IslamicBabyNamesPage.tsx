import React, { useState, useMemo, useEffect } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Baby,
  Search,
  Heart,
  Copy,
  Check,
  Sparkles,
  Sun,
  Moon,
  Printer,
  Download,
  Trash2,
  Wand2,
  RotateCcw,
} from 'lucide-react';
import {
  ISLAMIC_BABY_NAMES_DATA,
  type IslamicBabyNameEntry,
  type BabyGender,
  type NameTag,
} from '../data/islamicBabyNames';
import {
  ALL_NAME_TAGS,
  type NameLengthFilter,
  type NameSortMode,
  filterAndSortBabyNames,
  getSuggestedSecondNames,
} from '../utils/islamicNames';

interface IslamicBabyNamesPageProps {
  onNavigate: (path: string) => void;
}

const FAVORITES_KEY = 'youtiktools_islamic_name_favorites_v1';
const ITEMS_PER_PAGE = 24;

interface AiSuggestedName {
  name: string;
  urdu: string;
  arabic: string;
  gender: 'boy' | 'girl' | 'unisex';
  meaningEn: string;
  meaningUr: string;
  origin: string;
  reason: string;
}

export const IslamicBabyNamesPage: React.FC<IslamicBabyNamesPageProps> = ({
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

  // Search & Filter State
  const [search, setSearch] = useState<string>('');
  const [gender, setGender] = useState<'all' | BabyGender>('all');
  const [letter, setLetter] = useState<string>('ALL');
  const [selectedTags, setSelectedTags] = useState<NameTag[]>([]);
  const [lengthFilter, setLengthFilter] = useState<NameLengthFilter>('all');
  const [sortBy, setSortBy] = useState<NameSortMode>('popular');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  // Favorites stored as serialized entries so even AI suggestions can be saved!
  const [favorites, setFavorites] = useState<IslamicBabyNameEntry[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage?.getItem(FAVORITES_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [favorites]);

  // Name Combiner State
  const [combinerSelectedName, setCombinerSelectedName] = useState<string>(
    ISLAMIC_BABY_NAMES_DATA[0].name
  );
  const [fatherSurname, setFatherSurname] = useState<string>('Khan');

  // AI Suggestions State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiGender, setAiGender] = useState<'any' | BabyGender>('any');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestedName[]>([]);

  const [copiedNameKey, setCopiedNameKey] = useState<string | null>(null);

  const favoriteSet = useMemo(() => new Set(favorites.map((f) => f.name.toLowerCase())), [favorites]);

  const filteredNames = useMemo(() => {
    const source = showFavoritesOnly ? favorites : ISLAMIC_BABY_NAMES_DATA;
    return filterAndSortBabyNames(
      {
        search,
        gender,
        letter,
        tags: selectedTags,
        lengthFilter,
        sortBy,
      },
      source
    );
  }, [search, gender, letter, selectedTags, lengthFilter, sortBy, showFavoritesOnly, favorites]);

  const totalPages = Math.max(1, Math.ceil(filteredNames.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedNames = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredNames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNames, safePage]);

  useEffect(() => {
    setPage(1);
  }, [search, gender, letter, selectedTags, lengthFilter, sortBy, showFavoritesOnly]);

  const combinerFirstEntry = useMemo(() => {
    return (
      ISLAMIC_BABY_NAMES_DATA.find(
        (n) => n.name.toLowerCase() === combinerSelectedName.trim().toLowerCase()
      ) || ISLAMIC_BABY_NAMES_DATA[0]
    );
  }, [combinerSelectedName]);

  const combinedSuggestions = useMemo(
    () => getSuggestedSecondNames(combinerFirstEntry, fatherSurname),
    [combinerFirstEntry, fatherSurname]
  );

  const toggleTag = (tag: NameTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFavorite = (entry: IslamicBabyNameEntry) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.name.toLowerCase() === entry.name.toLowerCase());
      if (exists) {
        return prev.filter((f) => f.name.toLowerCase() !== entry.name.toLowerCase());
      }
      return [entry, ...prev];
    });
  };

  const handleCopyName = async (entry: Pick<IslamicBabyNameEntry, 'name' | 'urdu' | 'meaningEn'>) => {
    const text = `${entry.name} (${entry.urdu}) — ${entry.meaningEn}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNameKey(entry.name);
      window.setTimeout(() => setCopiedNameKey((p) => (p === entry.name ? null : p)), 1500);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadFavorites = () => {
    if (!favorites.length) return;
    const text = favorites
      .map(
        (f, i) =>
          `${i + 1}. ${f.name} (${f.urdu} / ${f.arabic}) [${f.gender.toUpperCase()}] — ${f.meaningEn} | ${f.meaningUr} (Origin: ${f.origin})`
      )
      .join('\n');
    const blob = new Blob([`My Saved Islamic Baby Names (${favorites.length})\n\n${text}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorite-islamic-baby-names.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setSearch('');
    setGender('all');
    setLetter('ALL');
    setSelectedTags([]);
    setLengthFilter('all');
    setSortBy('popular');
    setShowFavoritesOnly(false);
  };

  const handleAskAiNames = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = aiPrompt.trim();
    if (trimmed.length < 3) {
      setAiError('Please enter at least 3 characters describing the style or meaning you want.');
      return;
    }

    setAiError(null);
    setAiLoading(true);
    try {
      const res = await fetch('/api/islamic-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed, gender: aiGender }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || `Request failed (${res.status})`);
      }
      setAiSuggestions(Array.isArray(json.suggestions) ? json.suggestions : []);
    } catch (err: any) {
      setAiError(err?.message || 'Unable to generate custom suggestions right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const workspaceShell = isDarkTheme
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-slate-50/70 text-slate-900 border-slate-200';
  const cardSurface = isDarkTheme
    ? 'bg-slate-800/90 border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const inputSurface = isDarkTheme
    ? 'bg-slate-900 border-slate-600 text-slate-100'
    : 'bg-white border-slate-300 text-slate-900';
  const labelText = isDarkTheme ? 'text-slate-300' : 'text-slate-700';
  const mutedText = isDarkTheme ? 'text-slate-400' : 'text-slate-500';

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Wirasat Calculator',
      path: '/wirasat-calculator',
      description: 'Calculate Sunni (Hanafi) family inheritance shares & amounts.',
      icon: '⚖️',
    },
    {
      name: 'Hijri Date Converter',
      path: '/hijri-date-converter',
      description: 'Convert baby’s birth date to Islamic Hijri & Desi Bikrami.',
      icon: '🗓️',
    },
    {
      name: 'Age Calculator',
      path: '/age-calculator',
      description: 'Find exact age in years, months, days and Hijri birthday.',
      icon: '🎂',
    },
    {
      name: 'Ramadan Timetable',
      path: '/ramadan-timetable',
      description: 'Check Sehri & Iftar schedules across Pakistani cities.',
      icon: '🌙',
    },
  ];

  return (
    <ToolLayout
      toolPath="/islamic-baby-names"
      title={`Islamic Baby Names Finder (${ISLAMIC_BABY_NAMES_DATA.length}+ Names with Urdu & Arabic)`}
      badgeText="500+ Names · Urdu & Arabic · Combiner"
      badgeIcon={<Baby className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />}
      description="Explore 500+ authentic Islamic baby names for boys, girls, and unisex choices with Urdu Nastaliq script, Arabic tashkeel, English & Urdu meanings, origin, smart filters, saved favorites shortlist, Name Combiner, and custom AI name ideas."
      howItWorks={{
        heading: 'How to Find & Shortlist the Perfect Muslim Baby Name',
        text: 'Filter our curated 500-name library instantly in your browser, save favorites without creating an account, test middle-name pairings with your family surname, or ask our AI assistant for custom name suggestions.',
        steps: [
          {
            number: 1,
            title: 'Filter by Meaning, Gender & Tags',
            description:
              'Search in English, Urdu, or meaning, pick Boy/Girl/Unisex, starting letter A–Z, and tags like Quranic, Sahabi, or Short.',
          },
          {
            number: 2,
            title: 'Save Favorites & Combine Names',
            description:
              'Tap the heart icon to save a shortlist locally, export it as a text file, or pair names with the father’s surname.',
          },
          {
            number: 3,
            title: 'Ask Custom AI Name Finder',
            description:
              'Describe qualities you love—such as patience, light, or nature—for tailored name suggestions verified against Islamic guidelines.',
          },
        ],
      }}
      supportedFormats={[
        { format: 'Urdu & Arabic Scripts', description: 'Rendered with Noto Nastaliq Urdu and Amiri right-to-left typography.' },
        { format: 'Local Favorites & Export', description: 'Saved in your browser with 1-click download (.txt) or printable shortlist.' },
        { format: 'Family Name Combiner', description: 'Pairs selected first names with harmonious companion names and surname.' },
      ]}
      tips={[
        'Classical Islamic tradition encourages names with noble, clear meanings—such as prophets’ names, Abdullah/Abdul Rahman, and worthy companions—while avoiding ambiguous or harsh meanings.',
        'If using custom AI suggestions, always double-check spelling, Arabic root, and scholarly acceptability with a knowledgeable Imam or elder.',
      ]}
      faqs={[
        {
          question: 'Are the names in this Islamic Baby Names Finder authentic and permissible?',
          answer:
            'Every entry in our 500+ built-in database has been curated with authentic Arabic, Quranic, Persian, and Turkish meanings, explicitly avoiding any impermissible names involving servitude to anyone other than Allah.',
        },
        {
          question: 'Can I save my favorite baby names and print or download them?',
          answer:
            'Yes. Click the heart button on any name card to save it in your browser’s local storage. You can filter to Favorites Only, download your list as a .txt file, or print a clean sheet.',
        },
        {
          question: 'How does the Name Combiner work?',
          answer:
            'Click “Combine” on any name card (or type/select a first name) and enter the father’s name or family surname. The tool generates harmonious two-part and three-part name combinations in both English and Urdu.',
        },
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div
        className={`rounded-2xl border p-4 sm:p-6 space-y-7 transition-colors ${workspaceShell}`}
        style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
      >
        {/* Top Controls + Favorites Toolbar */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 no-print ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFavoritesOnly((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  showFavoritesOnly
                    ? 'bg-rose-600 text-white border-rose-600'
                    : cardSurface
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${showFavoritesOnly ? 'fill-current' : 'text-rose-500'}`} />
                <span>Favorites ({favorites.length})</span>
              </button>
              {favorites.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadFavorites}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export .TXT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFavoritesOnly(true);
                      window.setTimeout(() => window.print(), 100);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Favorites</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFavorites([])}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDarkTheme((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
              >
                {isDarkTheme ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* Search + Gender + Length + Sort */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or meaning (English / اردو / عربی)..."
                aria-label="Search Islamic baby names"
                className={`w-full h-10 pl-9 pr-3 rounded-xl border text-xs sm:text-sm ${inputSurface}`}
              />
            </div>

            <div className="md:col-span-3 flex gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
              {(['all', 'boy', 'girl', 'unisex'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold capitalize cursor-pointer ${
                    gender === g
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="md:col-span-2">
              <select
                value={lengthFilter}
                onChange={(e) => setLengthFilter(e.target.value as NameLengthFilter)}
                aria-label="Filter by name length"
                className={`w-full h-10 px-2.5 rounded-xl border text-xs font-semibold ${inputSurface}`}
              >
                <option value="all">Any Length</option>
                <option value="short">Short (≤4 letters)</option>
                <option value="medium">Medium (5–6)</option>
                <option value="long">Long (7+)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as NameSortMode)}
                aria-label="Sort names"
                className={`w-full h-10 px-2.5 rounded-xl border text-xs font-semibold ${inputSurface}`}
              >
                <option value="popular">Sort: Popular</option>
                <option value="az">Sort: A – Z</option>
              </select>
            </div>
          </div>

          {/* Multi-select Tag Chips */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_NAME_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : `${cardSurface} hover:border-emerald-400`
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Starting Letter A-Z */}
          <div className="flex flex-wrap gap-1 pt-1">
            <button
              type="button"
              onClick={() => setLetter('ALL')}
              className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                letter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All
            </button>
            {alphabet.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLetter(l)}
                className={`w-7 py-1 rounded-md text-[11px] font-mono font-bold cursor-pointer ${
                  letter === l
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs">
          <p className={`font-bold ${mutedText}`}>
            Showing {paginatedNames.length} of {filteredNames.length} matching names
            {showFavoritesOnly ? ' (Favorites)' : ''}
          </p>
          <span className={`font-mono ${mutedText}`}>
            Page {safePage} / {totalPages}
          </span>
        </div>

        {/* Name Cards Grid */}
        {paginatedNames.length === 0 ? (
          <div className={`rounded-2xl border p-8 text-center space-y-2 ${cardSurface}`}>
            <p className="text-sm font-bold">No names match your current filters.</p>
            <p className={`text-xs ${mutedText}`}>
              Try clearing a tag or starting letter, or ask the AI Name Finder below for custom ideas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paginatedNames.map((entry) => {
              const isFav = favoriteSet.has(entry.name.toLowerCase());
              return (
                <article
                  key={`${entry.name}-${entry.gender}`}
                  className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 print-avoid-break ${cardSurface}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-black tracking-tight">{entry.name}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              entry.gender === 'boy'
                                ? 'bg-blue-100 text-blue-800'
                                : entry.gender === 'girl'
                                  ? 'bg-pink-100 text-pink-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {entry.gender}
                          </span>
                          <span className={`px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-semibold ${mutedText}`}>
                            {entry.origin}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-arabic text-lg font-bold leading-tight" dir="rtl">
                          {entry.arabic}
                        </p>
                        <p className="font-urdu text-sm text-emerald-700 dark:text-emerald-300" dir="rtl">
                          {entry.urdu}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-200/60">
                      <p className="text-xs font-medium leading-relaxed">{entry.meaningEn}</p>
                      <p className="font-urdu text-sm leading-relaxed text-right text-slate-600 dark:text-slate-300" dir="rtl">
                        {entry.meaningUr}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          className={`px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-semibold ${mutedText}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/60 no-print">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(entry)}
                      aria-label={isFav ? `Remove ${entry.name} from favorites` : `Save ${entry.name} to favorites`}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                        isFav
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : `${cardSurface}`
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${isFav ? 'fill-current' : ''}`} />
                      <span>{isFav ? 'Saved' : 'Save'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCombinerSelectedName(entry.name)}
                        className="px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        Combine
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyName(entry)}
                        aria-label={`Copy ${entry.name}`}
                        className={`p-1.5 rounded-lg border cursor-pointer ${cardSurface}`}
                      >
                        {copiedNameKey === entry.name ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 no-print">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer disabled:opacity-40 ${cardSurface}`}
            >
              Previous
            </button>
            <span className="text-xs font-bold px-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer disabled:opacity-40 ${cardSurface}`}
            >
              Next
            </button>
          </div>
        )}

        {/* Name Combiner Section */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 no-print ${cardSurface}`}>
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm sm:text-base font-extrabold">
              Islamic Name Combiner (With Father / Family Surname)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="combiner-first-name" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Selected Baby First Name
              </label>
              <select
                id="combiner-first-name"
                value={combinerFirstEntry.name}
                onChange={(e) => setCombinerSelectedName(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-bold ${inputSurface}`}
              >
                {ISLAMIC_BABY_NAMES_DATA.map((n) => (
                  <option key={`${n.name}-${n.gender}`} value={n.name}>
                    {n.name} ({n.urdu}) — {n.gender}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="combiner-surname" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Father’s Name or Family Surname
              </label>
              <input
                id="combiner-surname"
                type="text"
                value={fatherSurname}
                onChange={(e) => setFatherSurname(e.target.value)}
                placeholder="e.g. Ahmad, Khan, Siddiqui, Malik"
                className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-semibold ${inputSurface}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {combinedSuggestions.map((item) => (
              <div
                key={item.fullEn}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-extrabold">{item.fullEn}</p>
                  <p className="font-urdu text-sm text-emerald-700 dark:text-emerald-300" dir="rtl">
                    {item.fullUr}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${mutedText}`}>{item.meaningSummary}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyName({
                      name: item.fullEn,
                      urdu: item.fullUr,
                      meaningEn: item.meaningSummary,
                    })
                  }
                  className={`p-2 rounded-lg border shrink-0 cursor-pointer ${cardSurface}`}
                  aria-label={`Copy ${item.fullEn}`}
                >
                  {copiedNameKey === item.fullEn ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Server-Side Gemini AI Name Suggester */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 no-print ${cardSurface}`}>
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>AI Name Finder — &ldquo;Suggest Names for Me&rdquo;</span>
            </h2>
            <p className={`text-xs ${mutedText}`}>
              Describe the meaning, heritage, starting letter, or vibe you want and our server-side AI suggests 8 authentic options.
            </p>
          </div>

          <form onSubmit={handleAskAiNames} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Modern short Quranic girl name meaning light or peace"
              aria-label="Describe the baby name you want"
              className={`sm:col-span-7 h-10 px-3.5 rounded-xl border text-xs sm:text-sm ${inputSurface}`}
            />
            <select
              value={aiGender}
              onChange={(e) => setAiGender(e.target.value as 'any' | BabyGender)}
              aria-label="Preferred gender for AI suggestions"
              className={`sm:col-span-2 h-10 px-2.5 rounded-xl border text-xs font-bold ${inputSurface}`}
            >
              <option value="any">Any Gender</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
              <option value="unisex">Unisex</option>
            </select>
            <button
              type="submit"
              disabled={aiLoading}
              className="sm:col-span-3 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              {aiLoading ? 'Generating...' : 'Suggest Names for Me'}
            </button>
          </form>

          {aiError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              {aiError}
            </p>
          )}

          {aiSuggestions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {aiSuggestions.map((s) => (
                <div
                  key={s.name}
                  className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black">{s.name}</h3>
                      <span className={`text-[10px] font-bold uppercase ${mutedText}`}>
                        {s.gender} · {s.origin}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-arabic text-base font-bold" dir="rtl">{s.arabic}</p>
                      <p className="font-urdu text-sm text-emerald-700 dark:text-emerald-300" dir="rtl">{s.urdu}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold">{s.meaningEn}</p>
                  <p className="font-urdu text-xs text-right" dir="rtl">{s.meaningUr}</p>
                  <p className={`text-[11px] ${mutedText}`}>{s.reason}</p>
                </div>
              ))}
            </div>
          )}

          <p className={`text-[11px] ${mutedText}`}>
            <strong>Scholar Verification Note:</strong> AI-generated suggestions aim to avoid impermissible names, but families should always verify meanings and Arabic spelling with a trusted scholar before finalizing a name.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
};
