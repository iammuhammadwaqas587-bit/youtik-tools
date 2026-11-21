import {
  type ParsedIsoDate,
  type DesiDateInfo,
  convertToDesiBikrami,
  parseIsoDate,
  formatIsoDate,
  getTodayLocalIso,
  daysInMonth,
} from './ageCalculation';

export type MoonSightingAdjustment = -1 | 0 | 1;

export const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhul Qadah',
  'Dhul Hijjah',
] as const;

export interface HijriPartsResult {
  day: number;
  month: number; // 1..12
  monthName: string;
  year: number;
  formatted: string;
}

export interface GregorianConversionOutput {
  isValid: boolean;
  error?: string;
  gregorian: ParsedIsoDate;
  gregorianIso: string;
  gregorianFormatted: string;
  weekday: string;
  hijri: HijriPartsResult;
  desi: DesiDateInfo;
}

export interface ReverseHijriOutput {
  isValid: boolean;
  error?: string;
  hijri: HijriPartsResult;
  gregorian?: ParsedIsoDate;
  gregorianIso?: string;
  gregorianFormatted?: string;
  weekday?: string;
  desi?: DesiDateInfo;
}

export interface ImportantIslamicEvent {
  title: string;
  subtitle: string;
  hijriDay: number;
  hijriMonth: number;
  hijriLabel: string;
  gregorianFormatted: string;
  gregorianIso: string;
  weekday: string;
}

const WEEKDAY_FMT = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' });
const GREG_READABLE_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

let cachedHijriPartsFormatter: Intl.DateTimeFormat | null = null;
function getHijriNumericFormatter(): Intl.DateTimeFormat {
  if (cachedHijriPartsFormatter) return cachedHijriPartsFormatter;
  const locales = ['en-u-ca-islamic-umalqura-nu-latn', 'en-u-ca-islamic-nu-latn'];
  for (const loc of locales) {
    try {
      const fmt = new Intl.DateTimeFormat(loc, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
      cachedHijriPartsFormatter = fmt;
      return fmt;
    } catch {
      // Fallback
    }
  }
  cachedHijriPartsFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return cachedHijriPartsFormatter;
}

/**
 * Formats the Umm al-Qura Hijri date directly for a given UTC Date timestamp.
 */
function readRawUmmAlQuraParts(utcMs: number): { year: number; month: number; day: number } {
  const fmt = getHijriNumericFormatter();
  const parts = fmt.formatToParts(new Date(utcMs));
  const day = Number(parts.find((p) => p.type === 'day')?.value || 1);
  const month = Number(parts.find((p) => p.type === 'month')?.value || 1);
  const yearRaw = parts.find((p) => p.type === 'year')?.value || '1447';
  const year = Number(String(yearRaw).replace(/[^\d]/g, '')) || 1447;
  return { year, month, day };
}

/**
 * Shifts the Gregorian instant by `adjustment` (-1, 0, +1) so that on a given local Gregorian date,
 * a -1 day regional moon-sighting offset (e.g., Pakistan) reports one lunar day earlier than Saudi/Umm al-Qura.
 */
export function gregorianToHijriParts(
  g: ParsedIsoDate,
  adjustment: MoonSightingAdjustment = -1
): HijriPartsResult {
  const shiftedMs = Date.UTC(g.year, g.month - 1, g.day + adjustment);
  const raw = readRawUmmAlQuraParts(shiftedMs);
  const safeMonth = Math.min(12, Math.max(1, raw.month));
  const monthName = HIJRI_MONTH_NAMES[safeMonth - 1];
  return {
    day: raw.day,
    month: safeMonth,
    monthName,
    year: raw.year,
    formatted: `${raw.day} ${monthName} ${raw.year} AH`,
  };
}

export function convertGregorianToAllCalendars(
  isoDate: string,
  adjustment: MoonSightingAdjustment = -1
): GregorianConversionOutput {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    const fallback = parseIsoDate(getTodayLocalIso()) || { year: 2026, month: 1, day: 1 };
    return {
      isValid: false,
      error: 'Please choose a valid Gregorian date.',
      gregorian: fallback,
      gregorianIso: formatIsoDate(fallback.year, fallback.month, fallback.day),
      gregorianFormatted: '—',
      weekday: '—',
      hijri: { day: 1, month: 1, monthName: 'Muharram', year: 1447, formatted: '—' },
      desi: { day: 1, monthName: '—', monthUrdu: '', year: 0, formatted: '—' },
    };
  }

  const utcMs = Date.UTC(parsed.year, parsed.month - 1, parsed.day);
  const hijri = gregorianToHijriParts(parsed, adjustment);
  const desi = convertToDesiBikrami(parsed);

  return {
    isValid: true,
    gregorian: parsed,
    gregorianIso: formatIsoDate(parsed.year, parsed.month, parsed.day),
    gregorianFormatted: GREG_READABLE_FMT.format(new Date(utcMs)),
    weekday: WEEKDAY_FMT.format(new Date(utcMs)),
    hijri,
    desi,
  };
}

/**
 * Reverse converts Hijri (year, month 1..12, day 1..30) to Gregorian by searching
 * the estimated Gregorian span derived from: year ≈ hijriYear * 0.970224 + 621.5774.
 */
export function convertHijriToGregorian(
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number,
  adjustment: MoonSightingAdjustment = -1
): ReverseHijriOutput {
  const safeMonth = Math.min(12, Math.max(1, Math.floor(hijriMonth)));
  const monthName = HIJRI_MONTH_NAMES[safeMonth - 1];
  const baseHijri: HijriPartsResult = {
    day: hijriDay,
    month: safeMonth,
    monthName,
    year: hijriYear,
    formatted: `${hijriDay} ${monthName} ${hijriYear} AH`,
  };

  if (!Number.isInteger(hijriYear) || hijriYear < 1300 || hijriYear > 1600) {
    return {
      isValid: false,
      error: 'Please enter a Hijri year between 1300 and 1600 AH (supported range includes 1400–1500 AH).',
      hijri: baseHijri,
    };
  }

  if (!Number.isInteger(hijriDay) || hijriDay < 1 || hijriDay > 30) {
    return {
      isValid: false,
      error: 'Hijri day must be between 1 and 30.',
      hijri: baseHijri,
    };
  }

  const estGregYear = hijriYear * 0.970224 + 621.5774;
  // Estimate fractional year -> UTC start (~600 day half-window covers full lunar year reliably)
  const centerYear = Math.floor(estGregYear);
  const centerDayOffset = Math.round((estGregYear - centerYear) * 365.2425);
  const centerMs = Date.UTC(centerYear, 0, 1 + centerDayOffset);

  const startMs = centerMs - 260 * 86400000;
  const endMs = centerMs + 500 * 86400000;

  let matchedRawUtcMs: number | null = null;
  let maxDaySeenInMonth = 29;

  for (let ms = startMs; ms <= endMs; ms += 86400000) {
    const parts = readRawUmmAlQuraParts(ms);
    if (parts.year === hijriYear && parts.month === safeMonth) {
      if (parts.day > maxDaySeenInMonth) maxDaySeenInMonth = parts.day;
      if (parts.day === hijriDay) {
        matchedRawUtcMs = ms;
        break;
      }
    }
  }

  if (matchedRawUtcMs === null) {
    return {
      isValid: false,
      error: `${monthName} ${hijriYear} AH has only ${maxDaySeenInMonth} days in the Umm al-Qura calendar. Please select day ${maxDaySeenInMonth} or lower.`,
      hijri: baseHijri,
    };
  }

  // Inverse of gregorianToHijriParts: if raw = G + adjustment, then G = raw - adjustment
  const localGregMs = matchedRawUtcMs - adjustment * 86400000;
  const dObj = new Date(localGregMs);
  const gregorian: ParsedIsoDate = {
    year: dObj.getUTCFullYear(),
    month: dObj.getUTCMonth() + 1,
    day: dObj.getUTCDate(),
  };

  // Validate day sanity just in case
  const clampedDay = Math.min(gregorian.day, daysInMonth(gregorian.year, gregorian.month));
  const normalizedGreg = { ...gregorian, day: clampedDay };

  return {
    isValid: true,
    hijri: baseHijri,
    gregorian: normalizedGreg,
    gregorianIso: formatIsoDate(normalizedGreg.year, normalizedGreg.month, normalizedGreg.day),
    gregorianFormatted: GREG_READABLE_FMT.format(dObj),
    weekday: WEEKDAY_FMT.format(dObj),
    desi: convertToDesiBikrami(normalizedGreg),
  };
}

export function getImportantIslamicDatesForYear(
  hijriYear: number,
  adjustment: MoonSightingAdjustment = -1
): ImportantIslamicEvent[] {
  const milestones: Array<{ title: string; subtitle: string; day: number; month: number }> = [
    { title: 'Islamic New Year', subtitle: '1st of Muharram', day: 1, month: 1 },
    { title: 'Day of Ashura', subtitle: '10th of Muharram', day: 10, month: 1 },
    { title: 'Eid Milad un-Nabi', subtitle: '12th of Rabi al-Awwal', day: 12, month: 3 },
    { title: 'Shab-e-Meraj', subtitle: '27th of Rajab', day: 27, month: 7 },
    { title: 'Shab-e-Barat', subtitle: '15th of Shaban', day: 15, month: 8 },
    { title: '1st Ramadan', subtitle: 'Start of Fasting Month', day: 1, month: 9 },
    { title: 'Laylat al-Qadr (Approx.)', subtitle: '27th Night of Ramadan', day: 27, month: 9 },
    { title: 'Eid ul-Fitr', subtitle: '1st of Shawwal', day: 1, month: 10 },
    { title: 'Day of Arafah', subtitle: '9th of Dhul Hijjah', day: 9, month: 12 },
    { title: 'Eid ul-Adha', subtitle: '10th of Dhul Hijjah', day: 10, month: 12 },
  ];

  return milestones.map((m) => {
    const conv = convertHijriToGregorian(hijriYear, m.month, m.day, adjustment);
    return {
      title: m.title,
      subtitle: m.subtitle,
      hijriDay: m.day,
      hijriMonth: m.month,
      hijriLabel: `${m.day} ${HIJRI_MONTH_NAMES[m.month - 1]} ${hijriYear} AH`,
      gregorianFormatted: conv.isValid && conv.gregorianFormatted ? conv.gregorianFormatted : '—',
      gregorianIso: conv.isValid && conv.gregorianIso ? conv.gregorianIso : '',
      weekday: conv.isValid && conv.weekday ? conv.weekday : '—',
    };
  });
}
