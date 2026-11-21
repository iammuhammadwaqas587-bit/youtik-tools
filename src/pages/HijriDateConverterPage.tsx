import React, { useState, useMemo } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Calendar,
  ArrowLeftRight,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { getTodayLocalIso } from '../utils/ageCalculation';
import {
  HIJRI_MONTH_NAMES,
  type MoonSightingAdjustment,
  convertGregorianToAllCalendars,
  convertHijriToGregorian,
  getImportantIslamicDatesForYear,
} from '../utils/hijriCalendar';

interface HijriDateConverterPageProps {
  onNavigate: (path: string) => void;
}

export const HijriDateConverterPage: React.FC<HijriDateConverterPageProps> = ({
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

  const todayIso = useMemo(() => getTodayLocalIso(), []);
  const [adjustment, setAdjustment] = useState<MoonSightingAdjustment>(-1);
  const [mode, setMode] = useState<'g2h' | 'h2g'>('g2h');

  // Gregorian -> Hijri state
  const [gregorianInput, setGregorianInput] = useState<string>(todayIso);

  // Initial Hijri from today
  const initialToday = useMemo(
    () => convertGregorianToAllCalendars(todayIso, adjustment),
    [todayIso, adjustment]
  );

  // Hijri -> Gregorian state
  const [hijriDay, setHijriDay] = useState<number>(() => initialToday.hijri.day);
  const [hijriMonth, setHijriMonth] = useState<number>(() => initialToday.hijri.month);
  const [hijriYear, setHijriYear] = useState<number>(() => initialToday.hijri.year);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const g2hResult = useMemo(
    () => convertGregorianToAllCalendars(gregorianInput, adjustment),
    [gregorianInput, adjustment]
  );

  const h2gResult = useMemo(
    () => convertHijriToGregorian(hijriYear, hijriMonth, hijriDay, adjustment),
    [hijriYear, hijriMonth, hijriDay, adjustment]
  );

  const activeHijriYear = mode === 'g2h' ? g2hResult.hijri.year : hijriYear;
  const importantDates = useMemo(
    () => getImportantIslamicDatesForYear(activeHijriYear, adjustment),
    [activeHijriYear, adjustment]
  );

  const handleSwapDirection = () => {
    if (mode === 'g2h') {
      if (g2hResult.isValid) {
        setHijriDay(g2hResult.hijri.day);
        setHijriMonth(g2hResult.hijri.month);
        setHijriYear(g2hResult.hijri.year);
      }
      setMode('h2g');
    } else {
      if (h2gResult.isValid && h2gResult.gregorianIso) {
        setGregorianInput(h2gResult.gregorianIso);
      }
      setMode('g2h');
    }
  };

  const handleResetToday = () => {
    const freshToday = convertGregorianToAllCalendars(todayIso, adjustment);
    setGregorianInput(todayIso);
    setHijriDay(freshToday.hijri.day);
    setHijriMonth(freshToday.hijri.month);
    setHijriYear(freshToday.hijri.year);
  };

  const handleCopyResult = async () => {
    let text = '';
    if (mode === 'g2h' && g2hResult.isValid) {
      text = `Gregorian: ${g2hResult.gregorianFormatted} (${g2hResult.weekday})\nIslamic Hijri: ${g2hResult.hijri.formatted}\nDesi / Bikrami: ${g2hResult.desi.formatted} (${g2hResult.desi.monthUrdu})`;
    } else if (mode === 'h2g' && h2gResult.isValid) {
      text = `Islamic Hijri: ${h2gResult.hijri.formatted}\nGregorian: ${h2gResult.gregorianFormatted} (${h2gResult.weekday})\nDesi / Bikrami: ${h2gResult.desi?.formatted || ''}`;
    }
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey('result');
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard failures
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

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Ramadan Timetable',
      path: '/ramadan-timetable',
      description: '30-day Sehri & Iftar timetable for Pakistani & global cities.',
      icon: '🌙',
    },
    {
      name: 'Prayer Times & Qibla',
      path: '/prayer-times',
      description: 'Daily Fajr to Isha timings, live countdown & Qibla compass.',
      icon: '🕌',
    },
    {
      name: 'Age Calculator',
      path: '/age-calculator',
      description: 'Exact age in years, months, days plus Hijri & Bikrami birthdays.',
      icon: '🎂',
    },
    {
      name: 'Zakat Calculator',
      path: '/zakat-calculator',
      description: 'Calculate 2.5% Zakat with Gold & Silver Nisab thresholds.',
      icon: '💰',
    },
  ];

  const activeValid = mode === 'g2h' ? g2hResult.isValid : h2gResult.isValid;
  const activeError = mode === 'g2h' ? g2hResult.error : h2gResult.error;
  const activeWeekday = mode === 'g2h' ? g2hResult.weekday : h2gResult.weekday || '—';
  const activeGregLabel =
    mode === 'g2h' ? g2hResult.gregorianFormatted : h2gResult.gregorianFormatted || '—';
  const activeHijri = mode === 'g2h' ? g2hResult.hijri : h2gResult.hijri;
  const activeDesi = mode === 'g2h' ? g2hResult.desi : h2gResult.desi;

  return (
    <ToolLayout
      toolPath="/hijri-date-converter"
      title="Hijri to Gregorian Date Converter (Islamic & Desi Calendar)"
      badgeText="2-Way Converter · Hilal Offset"
      badgeIcon={<Calendar className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />}
      description="Convert dates two ways between the Islamic (Hijri), Gregorian, and Pakistani Desi (Bikrami) calendars. Includes instant Moon Sighting Adjustment (Pakistan -1 day, Saudi Arabia 0, or +1 day), today’s date in all three calendars, and key Islamic events."
      howItWorks={{
        heading: 'How Two-Way Hijri & Bikrami Date Conversion Works',
        text: 'Select either Gregorian → Hijri or Hijri → Gregorian conversion, pick your regional moon-sighting offset, and get exact matching Hijri, Gregorian, weekday, and Desi/Bikrami dates instantly.',
        steps: [
          {
            number: 1,
            title: 'Choose Conversion Mode',
            description:
              'Switch between Gregorian → Hijri and Hijri → Gregorian tabs or click Swap anytime.',
          },
          {
            number: 2,
            title: 'Set Moon Sighting Offset',
            description:
              'Pick Pakistan (-1 day), Saudi/Umm al-Qura (0), or +1 day to align Islamic dates with local moon sighting.',
          },
          {
            number: 3,
            title: 'View All Three Calendars',
            description:
              'See Gregorian, Islamic Hijri, Desi/Bikrami (with Urdu month script), and important Islamic dates for that year.',
          },
        ],
      }}
      supportedFormats={[
        {
          format: 'Gregorian & Hijri (1300–1600 AH)',
          description: 'Full Umm al-Qura tabular precision with exact 29/30-day validation.',
        },
        {
          format: 'Desi / Bikrami Calendar',
          description: 'Includes all 12 Punjabi/Pakistani solar months from Chet to Phagan in English & Urdu.',
        },
        {
          format: 'Moon Sighting Adjustment',
          description: 'Instant -1 (Pakistan Ruet-e-Hilal), 0 (Saudi/Umm al-Qura), or +1 day shift.',
        },
      ]}
      tips={[
        'Because Hijri months begin upon crescent sighting (29 or 30 days), local official announcements like Eid or 1st Ramadan in Pakistan can occasionally differ by ±1 day from pre-computed tables.',
        'Click any row in the Important Islamic Dates list to load that Islamic milestone directly into the converter.',
      ]}
      faqs={[
        {
          question: 'Why does Pakistan’s Hijri date often differ by 1 day from Saudi Arabia?',
          answer:
            'Saudi Arabia follows the Umm al-Qura calendar and eastern-hemisphere sightings that frequently start a lunar month one day earlier than Pakistan’s Central Ruet-e-Hilal Committee physical moon sighting. Our default Pakistan (-1 day) option mirrors this typical difference and lets you toggle 0 or +1 anytime.',
        },
        {
          question: 'How does the Desi (Bikrami) calendar align with Gregorian dates?',
          answer:
            'The Bikrami (Desi) calendar is a solar calendar used across Punjab and Pakistan where months such as Vaisakh (mid-April) and Chet (mid-March) follow fixed solar transitions, roughly 56–57 years ahead of the Gregorian year.',
        },
        {
          question: 'What happens if I enter day 30 for a 29-day Islamic month?',
          answer:
            'Our reverse converter checks the exact lunar month length in the Umm al-Qura tables and clearly alerts you if that Hijri month has 29 days instead of returning a wrong date.',
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
        {/* Top Today Banner across all 3 Calendars */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>Today in All Three Calendars</span>
            </div>
            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => setIsDarkTheme((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${cardSurface}`}
              >
                {isDarkTheme ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetToday}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${cardSurface}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Today</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80">
              <span className={`text-[11px] font-bold uppercase ${mutedText}`}>Islamic (Hijri)</span>
              <p className="text-base sm:text-lg font-black mt-0.5">{initialToday.hijri.formatted}</p>
              <p className={`text-[11px] ${mutedText}`}>
                {adjustment === -1 ? 'Pakistan (-1 day)' : adjustment === 0 ? 'Saudi / Umm al-Qura (0)' : '+1 Day Offset'}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80">
              <span className={`text-[11px] font-bold uppercase ${mutedText}`}>Gregorian</span>
              <p className="text-base sm:text-lg font-black mt-0.5">{initialToday.gregorianFormatted}</p>
              <p className={`text-[11px] ${mutedText}`}>{initialToday.weekday}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80">
              <span className={`text-[11px] font-bold uppercase ${mutedText}`}>Desi / Bikrami</span>
              <p className="text-base sm:text-lg font-black mt-0.5">{initialToday.desi.formatted}</p>
              <p className="text-sm font-urdu text-amber-800 dark:text-amber-300" dir="rtl">
                {initialToday.desi.monthUrdu}
              </p>
            </div>
          </div>
        </section>

        {/* Controls: Direction Tabs + Moon Sighting Adjustment */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setMode('g2h')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  mode === 'g2h'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Gregorian → Hijri
              </button>
              <button
                type="button"
                onClick={() => setMode('h2g')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  mode === 'h2g'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Hijri → Gregorian
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSwapDirection}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-emerald-600" />
                <span>Swap Direction</span>
              </button>

              <div className="flex items-center gap-2">
                <label htmlFor="moon-adjustment" className={`text-xs font-bold ${labelText}`}>
                  Moon Sighting:
                </label>
                <select
                  id="moon-adjustment"
                  value={adjustment}
                  onChange={(e) => setAdjustment(Number(e.target.value) as MoonSightingAdjustment)}
                  className={`h-9 px-2.5 rounded-xl border text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${inputSurface}`}
                >
                  <option value={-1}>Pakistan (-1 day, Default)</option>
                  <option value={0}>Saudi / Umm al-Qura (0)</option>
                  <option value={1}>+1 Day Adjustment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Input Form */}
          {mode === 'g2h' ? (
            <div className="max-w-sm">
              <label htmlFor="gregorian-date-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                Select Gregorian Date
              </label>
              <input
                id="gregorian-date-input"
                type="date"
                value={gregorianInput}
                onChange={(e) => setGregorianInput(e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              <div>
                <label htmlFor="hijri-day-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                  Hijri Day (1–30)
                </label>
                <input
                  id="hijri-day-input"
                  type="number"
                  min={1}
                  max={30}
                  value={hijriDay}
                  onChange={(e) => setHijriDay(Number(e.target.value) || 1)}
                  className={`w-full h-11 px-3 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
                />
              </div>
              <div>
                <label htmlFor="hijri-month-select" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                  Hijri Month
                </label>
                <select
                  id="hijri-month-select"
                  value={hijriMonth}
                  onChange={(e) => setHijriMonth(Number(e.target.value))}
                  className={`w-full h-11 px-3 rounded-xl border text-sm font-bold ${inputSurface}`}
                >
                  {HIJRI_MONTH_NAMES.map((mName, idx) => (
                    <option key={mName} value={idx + 1}>
                      {idx + 1}. {mName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="hijri-year-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                  Hijri Year (AH)
                </label>
                <input
                  id="hijri-year-input"
                  type="number"
                  min={1300}
                  max={1600}
                  value={hijriYear}
                  onChange={(e) => setHijriYear(Number(e.target.value) || 1447)}
                  className={`w-full h-11 px-3 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
                />
              </div>
            </div>
          )}

          {/* Error or Result Cards */}
          {!activeValid && activeError ? (
            <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={`text-xs font-bold ${mutedText}`}>
                  Weekday: <strong className={isDarkTheme ? 'text-white' : 'text-slate-900'}>{activeWeekday}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  {copiedKey === 'result' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'result' ? 'Copied!' : 'Copy Converted Date'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/30">
                  <span className={`text-[11px] font-bold uppercase ${mutedText}`}>Islamic Hijri Date</span>
                  <p className="text-lg font-black mt-1">{activeHijri.formatted}</p>
                  <p className={`text-xs mt-0.5 ${mutedText}`}>
                    Month {activeHijri.month} of 12 · {activeWeekday}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60">
                  <span className={`text-[11px] font-bold uppercase ${mutedText}`}>Gregorian Date</span>
                  <p className="text-lg font-black mt-1">{activeGregLabel}</p>
                  <p className={`text-xs mt-0.5 ${mutedText}`}>{activeWeekday}</p>
                </div>

                <div className="p-4 rounded-xl border border-amber-300/70 bg-amber-50/70 dark:bg-amber-950/30">
                  <span className={`text-[11px] font-bold uppercase ${mutedText}`}>Desi / Bikrami Calendar</span>
                  <p className="text-lg font-black mt-1">{activeDesi?.formatted || '—'}</p>
                  {activeDesi?.monthUrdu && (
                    <p className="text-base font-urdu text-amber-800 dark:text-amber-300 mt-0.5" dir="rtl">
                      {activeDesi.monthUrdu} {activeDesi.year} بکرمی
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Important Islamic Dates Table */}
        <section className={`rounded-2xl border overflow-hidden ${cardSurface}`}>
          <div className="p-4 sm:p-5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold">
                Important Islamic Dates for {activeHijriYear} AH
              </h2>
              <p className={`text-xs ${mutedText}`}>
                Calculated using your active moon sighting offset ({adjustment > 0 ? `+${adjustment}` : adjustment} day).
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={isDarkTheme ? 'bg-slate-900/70 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                <tr>
                  <th className="py-2.5 px-4 font-bold">Islamic Event</th>
                  <th className="py-2.5 px-4 font-bold">Hijri Date</th>
                  <th className="py-2.5 px-4 font-bold">Gregorian Date</th>
                  <th className="py-2.5 px-4 font-bold">Weekday</th>
                  <th className="py-2.5 px-4 font-bold text-right">Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {importantDates.map((ev) => (
                  <tr key={ev.title} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                    <td className="py-2.5 px-4">
                      <span className="font-bold block">{ev.title}</span>
                      <span className={`text-[11px] ${mutedText}`}>{ev.subtitle}</span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold">{ev.hijriLabel}</td>
                    <td className="py-2.5 px-4 font-mono font-bold">{ev.gregorianFormatted}</td>
                    <td className="py-2.5 px-4">{ev.weekday}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setHijriDay(ev.hijriDay);
                          setHijriMonth(ev.hijriMonth);
                          setHijriYear(activeHijriYear);
                          setMode('h2g');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        Convert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className={`text-[11px] leading-relaxed ${mutedText}`}>
          <strong>Moon Sighting Note:</strong> Tabular/Umm al-Qura conversions provide reliable planning dates, while actual Islamic dates (especially Ramadan, Eid ul-Fitr, and Eid ul-Adha) in Pakistan depend on physical crescent confirmation by the Central Ruet-e-Hilal Committee.
        </p>
      </div>
    </ToolLayout>
  );
};
