import React, { useState, useMemo } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Calendar,
  RotateCcw,
  AlertCircle,
  Clock,
  Sparkles,
  Moon,
  Sun,
  CalendarDays,
  Cake,
} from 'lucide-react';
import {
  calculateExactAge,
  getTodayLocalIso,
} from '../utils/ageCalculation';

interface AgeCalculatorPageProps {
  onNavigate: (path: string) => void;
}

const DEFAULT_DOB = '2000-01-01';

export const AgeCalculatorPage: React.FC<AgeCalculatorPageProps> = ({
  onNavigate,
}) => {
  const todayIso = useMemo(() => getTodayLocalIso(), []);
  const [dateOfBirth, setDateOfBirth] = useState<string>(DEFAULT_DOB);
  const [ageAtDate, setAgeAtDate] = useState<string>(todayIso);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return true;
      }
    } catch {
      // Ignore matchMedia issues
    }
    return false;
  });

  const result = useMemo(
    () => calculateExactAge(dateOfBirth, ageAtDate),
    [dateOfBirth, ageAtDate]
  );

  const handleReset = () => {
    const freshToday = getTodayLocalIso();
    setDateOfBirth(DEFAULT_DOB);
    setAgeAtDate(freshToday);
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Prayer Times & Qibla',
      path: '/prayer-times',
      description: 'Check Salah times, countdown & Hijri date for your city.',
      icon: '🕌',
    },
    {
      name: 'FPS Calculator',
      path: '/fps-calculator',
      description: 'Convert clip duration into exact frame counts and timing.',
      icon: '⏱️',
    },
    {
      name: 'Video Size Calculator',
      path: '/video-size-calculator',
      description: 'Estimate MP4 storage weight from duration and bitrate.',
      icon: '🧮',
    },
    {
      name: 'Image Format Converter',
      path: '/image-converter',
      description: 'Convert documents and photos privately in your browser.',
      icon: '🖼️',
    },
  ];

  const cardBg = isDarkTheme
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-slate-50/70 text-slate-900 border-slate-200';
  const subCardBg = isDarkTheme
    ? 'bg-slate-800/90 border-slate-700 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';
  const labelText = isDarkTheme ? 'text-slate-300' : 'text-slate-700';
  const mutedText = isDarkTheme ? 'text-slate-400' : 'text-slate-500';
  const inputSurface = isDarkTheme
    ? 'bg-slate-800 border-slate-600 text-slate-100 focus:bg-slate-800'
    : 'bg-white border-slate-300 text-slate-900 focus:bg-white';

  return (
    <ToolLayout
      toolPath="/age-calculator"
      title="Exact Age Calculator (Years, Months, Days, Hijri & Bikrami)"
      badgeText="Instant Calendar Converter"
      badgeIcon={<Calendar className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />}
      description="Calculate your exact age in years, months, days, weeks, and hours, see your next birthday countdown, and convert your birth date to the Islamic (Hijri) and Desi (Bikrami) calendars instantly."
      howItWorks={{
        heading: 'How Exact Calendar Age Calculation Works',
        text: 'Rather than dividing total days by an approximate 365.25, our browser calculator compares exact Gregorian calendar months and years—automatically accounting for 28-, 29-, 30-, and 31-day months and leap years.',
        steps: [
          {
            number: 1,
            title: 'Select Date of Birth',
            description:
              'Pick or type your birth date. Future birth dates are prevented automatically so every calculation stays accurate.',
          },
          {
            number: 2,
            title: 'Choose Target Date',
            description:
              'Leave "Age at the date of" on today, or pick any past or future milestone date to check your age on that day.',
          },
          {
            number: 3,
            title: 'View Breakdown & Calendars',
            description:
              'Instantly read years, months, days, total hours, next birthday countdown, Hijri Umm al-Qura date, and Desi/Bikrami date.',
          },
        ],
      }}
      supportedFormats={[
        {
          format: 'Exact Calendar Borrowing',
          description:
            'When target day < birth day, borrows exact days from the preceding month (28, 29, 30, or 31).',
        },
        {
          format: 'Leap Years',
          description:
            'Handles February 29 leap years (divisible by 4, excluding non-400 centuries) accurately.',
        },
        {
          format: 'Islamic (Hijri) Calendar',
          description:
            'Uses built-in Intl.DateTimeFormat with the Umm al-Qura calendar (en-u-ca-islamic-umalqura-nu-latn).',
        },
        {
          format: 'Desi / Bikrami Calendar',
          description:
            'Converts birth dates to Punjabi/Pakistani Desi months (Chet through Phaggan) and Bikrami Samvat (BK) years.',
        },
      ]}
      tips={[
        'Change "Age at the date of" to any upcoming graduation, retirement, or visa cutoff date to verify exact eligibility age in years and months.',
        'All calculations run 100% locally inside your web browser—your birth date is never uploaded or logged to any server.',
        'Toggle the Light / Dark theme switch on the calculator card to match your preferred reading comfort.',
      ]}
      faqs={[
        {
          question: 'How is age calculated?',
          answer:
            'We calculate chronological age by subtracting your Date of Birth from the target date calendar-by-calendar: first comparing days (borrowing the exact number of days from the previous calendar month when needed), then months (borrowing 12 months from years when needed), and finally full years. Total months, weeks, days, and hours are computed from exact calendar day counts.',
        },
        {
          question: 'Does it handle leap years?',
          answer:
            'Yes. February is counted as 29 days during leap years (such as 2000, 2020, 2024, and 2028) and 28 days in common years when borrowing days or computing total days lived and next birthday countdowns.',
        },
        {
          question: 'How is the Islamic (Hijri) birth date determined?',
          answer:
            'Hijri conversion uses your browser’s native Intl.DateTimeFormat API with the "en-u-ca-islamic-umalqura-nu-latn" Umm al-Qura calendar standard directly in UTC so timezone offsets never shift the day.',
        },
        {
          question: 'What is the Desi / Bikrami calendar date shown?',
          answer:
            'The Desi (Bikrami) calendar is the traditional solar calendar used across Punjab and Pakistan featuring 12 seasonal months (Chet, Vaisakh, Jeth, Harh, Sawan, Bhadon, Assu, Katak, Maghar, Poh, Magh, Phaggan) in the Bikrami Samvat (BK) era.',
        },
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div
        className={`rounded-2xl border p-4 sm:p-6 transition-colors space-y-6 ${cardBg}`}
        style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
      >
        {/* Top Controls Row: Reset + Light/Dark Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-xs font-medium ${mutedText}`}>
            Updates automatically as you change either date
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDarkTheme((prev) => !prev)}
              aria-label={isDarkTheme ? 'Switch calculator to light mode' : 'Switch calculator to dark mode'}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                isDarkTheme
                  ? 'bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isDarkTheme ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                isDarkTheme
                  ? 'bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Date Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="age-calc-dob"
              className={`block text-xs font-bold mb-1.5 ${labelText}`}
            >
              Date of Birth
            </label>
            <input
              id="age-calc-dob"
              type="date"
              max={todayIso}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              aria-invalid={!result.isValid}
              className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus:border-red-600 transition-colors ${inputSurface}`}
            />
          </div>

          <div>
            <label
              htmlFor="age-calc-target"
              className={`block text-xs font-bold mb-1.5 ${labelText}`}
            >
              Age at the date of
            </label>
            <input
              id="age-calc-target"
              type="date"
              value={ageAtDate}
              onChange={(e) => setAgeAtDate(e.target.value)}
              aria-invalid={!result.isValid}
              className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus:border-red-600 transition-colors ${inputSurface}`}
            />
          </div>
        </div>

        {/* Friendly Validation Error */}
        {!result.isValid && result.error && (
          <div
            role="alert"
            className={`flex items-start gap-2.5 p-4 rounded-xl border text-xs sm:text-sm font-medium ${
              isDarkTheme
                ? 'bg-red-950/60 border-red-800 text-red-200'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{result.error}</span>
          </div>
        )}

        {/* Primary Exact Age Result */}
        {result.isValid && (
          <>
            <div
              className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${
                isDarkTheme
                  ? 'bg-slate-800/95 border-slate-700'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${mutedText}`}>
                  Your Exact Age
                </span>
                <span className={`text-xs ${mutedText}`}>
                  From {result.dobFormatted} to {result.targetFormatted}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div
                  className={`rounded-xl p-3 sm:p-4 border ${
                    isDarkTheme
                      ? 'bg-red-950/40 border-red-900/60'
                      : 'bg-red-50/80 border-red-200/80'
                  }`}
                >
                  <div className="text-3xl sm:text-5xl font-extrabold tabular-nums text-red-600 leading-none">
                    {result.years}
                  </div>
                  <div className={`mt-1.5 text-xs sm:text-sm font-bold ${labelText}`}>
                    {result.years === 1 ? 'Year' : 'Years'}
                  </div>
                </div>

                <div
                  className={`rounded-xl p-3 sm:p-4 border ${
                    isDarkTheme
                      ? 'bg-slate-900/80 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`text-3xl sm:text-5xl font-extrabold tabular-nums leading-none ${
                      isDarkTheme ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {result.months}
                  </div>
                  <div className={`mt-1.5 text-xs sm:text-sm font-bold ${labelText}`}>
                    {result.months === 1 ? 'Month' : 'Months'}
                  </div>
                </div>

                <div
                  className={`rounded-xl p-3 sm:p-4 border ${
                    isDarkTheme
                      ? 'bg-slate-900/80 border-slate-700'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`text-3xl sm:text-5xl font-extrabold tabular-nums leading-none ${
                      isDarkTheme ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {result.days}
                  </div>
                  <div className={`mt-1.5 text-xs sm:text-sm font-bold ${labelText}`}>
                    {result.days === 1 ? 'Day' : 'Days'}
                  </div>
                </div>
              </div>
            </div>

            {/* Extra Facts Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className={`rounded-xl border p-4 space-y-1 ${subCardBg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wider ${mutedText}`}>
                  Total Months
                </div>
                <div className="text-lg sm:text-xl font-extrabold tabular-nums">
                  {result.totalMonths.toLocaleString()}
                </div>
                <div className={`text-[11px] ${mutedText}`}>
                  +{result.totalMonthsRemainderDays}{' '}
                  {result.totalMonthsRemainderDays === 1 ? 'day' : 'days'}
                </div>
              </div>

              <div className={`rounded-xl border p-4 space-y-1 ${subCardBg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wider ${mutedText}`}>
                  Total Weeks
                </div>
                <div className="text-lg sm:text-xl font-extrabold tabular-nums">
                  {result.totalWeeks.toLocaleString()}
                </div>
                <div className={`text-[11px] ${mutedText}`}>
                  +{result.totalWeeksRemainderDays}{' '}
                  {result.totalWeeksRemainderDays === 1 ? 'day' : 'days'}
                </div>
              </div>

              <div className={`rounded-xl border p-4 space-y-1 ${subCardBg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wider ${mutedText}`}>
                  Total Days
                </div>
                <div className="text-lg sm:text-xl font-extrabold tabular-nums">
                  {result.totalDays.toLocaleString()}
                </div>
                <div className={`text-[11px] ${mutedText}`}>Exact calendar days</div>
              </div>

              <div className={`rounded-xl border p-4 space-y-1 ${subCardBg}`}>
                <div className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${mutedText}`}>
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <span>Total Hours</span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold tabular-nums">
                  {result.totalHours.toLocaleString()}
                </div>
                <div className={`text-[11px] ${mutedText}`}>Hours elapsed</div>
              </div>

              <div className={`rounded-xl border p-4 space-y-1 ${subCardBg}`}>
                <div className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${mutedText}`}>
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  <span>Born On</span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold">
                  {result.bornWeekday}
                </div>
                <div className={`text-[11px] ${mutedText}`}>Day of the week</div>
              </div>

              <div
                className={`rounded-xl border p-4 space-y-1 ${
                  result.nextBirthday.isToday
                    ? isDarkTheme
                      ? 'bg-emerald-950/50 border-emerald-700 text-emerald-100'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : subCardBg
                }`}
              >
                <div
                  className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${
                    result.nextBirthday.isToday
                      ? isDarkTheme
                        ? 'text-emerald-300'
                        : 'text-emerald-700'
                      : mutedText
                  }`}
                >
                  <Cake className="h-3 w-3" aria-hidden="true" />
                  <span>Next Birthday</span>
                </div>
                <div className="text-lg sm:text-xl font-extrabold tabular-nums">
                  {result.nextBirthday.label}
                </div>
                <div
                  className={`text-[11px] ${
                    result.nextBirthday.isToday
                      ? isDarkTheme
                        ? 'text-emerald-300'
                        : 'text-emerald-700'
                      : mutedText
                  }`}
                >
                  {result.nextBirthday.isToday
                    ? 'Happy Birthday!'
                    : `On ${result.nextBirthday.nextDateFormatted}`}
                </div>
              </div>
            </div>

            {/* Islamic (Hijri) & Desi (Bikrami) Calendar Birth Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`rounded-xl border p-4 sm:p-5 space-y-1.5 ${subCardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${mutedText}`}>
                    Islamic (Hijri) Date of Birth
                  </span>
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                </div>
                <div className="text-base sm:text-lg font-extrabold text-emerald-600">
                  {result.hijriDob.formatted}
                </div>
                <p className={`text-[11px] font-mono ${mutedText}`}>
                  Umm al-Qura · {result.hijriDob.numeric}
                </p>
              </div>

              <div className={`rounded-xl border p-4 sm:p-5 space-y-1.5 ${subCardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${mutedText}`}>
                    Desi / Bikrami Date of Birth
                  </span>
                  <Calendar className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                </div>
                <div className="text-base sm:text-lg font-extrabold text-amber-600">
                  {result.desiDob.formatted}
                </div>
                <p className={`text-[11px] ${mutedText}`}>
                  Bikrami Samvat · {result.desiDob.day} {result.desiDob.monthUrdu} ({result.desiDob.monthName})
                </p>
              </div>
            </div>

            {result.nextBirthday.isLeapDayBirth && (
              <p className={`text-xs ${mutedText}`}>
                Note: For February 29 leap-day births, common-year birthday countdowns reflect March 1 anniversaries.
              </p>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
};
