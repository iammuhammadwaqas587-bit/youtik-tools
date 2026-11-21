export interface ParsedIsoDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export interface DesiDateInfo {
  day: number;
  monthName: string;
  monthUrdu: string;
  year: number;
  formatted: string;
}

export interface HijriDateInfo {
  formatted: string;
  numeric: string;
}

export interface NextBirthdayInfo {
  isToday: boolean;
  daysRemaining: number;
  label: string;
  nextDateFormatted: string;
  isLeapDayBirth: boolean;
}

export interface AgeCalculationResult {
  isValid: boolean;
  error?: string;
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalMonthsRemainderDays: number;
  totalWeeks: number;
  totalWeeksRemainderDays: number;
  totalDays: number;
  totalHours: number;
  bornWeekday: string;
  dobFormatted: string;
  targetFormatted: string;
  nextBirthday: NextBirthdayInfo;
  hijriDob: HijriDateInfo;
  desiDob: DesiDateInfo;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month1To12: number): number {
  switch (month1To12) {
    case 2:
      return isLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

export function parseIsoDate(iso: string): ParsedIsoDate | null {
  if (!iso || typeof iso !== 'string') return null;
  const match = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1 ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }
  const maxDay = daysInMonth(year, month);
  if (day < 1 || day > maxDay) return null;
  return { year, month, day };
}

export function formatIsoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getTodayLocalIso(): string {
  const now = new Date();
  return formatIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function toUtcMs(d: ParsedIsoDate): number {
  return Date.UTC(d.year, d.month - 1, d.day);
}

function compareParsedDates(a: ParsedIsoDate, b: ParsedIsoDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

function formatReadableGregorian(d: ParsedIsoDate): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(toUtcMs(d)));
}

export function formatHijriDate(d: ParsedIsoDate): HijriDateInfo {
  const utcDate = new Date(toUtcMs(d));
  const locales = [
    'en-u-ca-islamic-umalqura-nu-latn',
    'en-u-ca-islamic-nu-latn',
  ];

  for (const locale of locales) {
    try {
      const longFmt = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
      const parts = longFmt.formatToParts(utcDate);
      const dayPart = parts.find((p) => p.type === 'day')?.value || '';
      const monthPart = parts.find((p) => p.type === 'month')?.value || '';
      const yearPart = parts.find((p) => p.type === 'year')?.value || '';

      const formatted =
        dayPart && monthPart && yearPart
          ? `${dayPart} ${monthPart} ${yearPart} AH`
          : longFmt.format(utcDate);

      const numeric = new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(utcDate);

      return { formatted, numeric };
    } catch {
      // Try fallback locale
    }
  }

  return {
    formatted: 'Hijri conversion unavailable in this browser',
    numeric: '—',
  };
}

interface DesiMonthStart {
  startMonth: number; // 1..12 Gregorian
  startDay: number;
  name: string;
  urdu: string;
  samvatOffset: number; // +57 after Chet 1 (Mar 14), +56 Jan-Mar 13
}

// Traditional Punjabi / Pakistani Desi (Bikrami / Nanakshahi Solar) calendar cycle:
// Mar 14 = 1 Chet (New Year, Samvat +57), Jan 13 = 1 Magh, Feb 12 = 1 Phaggan (30 days common, 31 leap).
const DESI_MONTH_ANCHORS: DesiMonthStart[] = [
  { startMonth: 1, startDay: 13, name: 'Magh', urdu: 'ماگھ', samvatOffset: 56 },
  { startMonth: 2, startDay: 12, name: 'Phaggan', urdu: 'پھاگن', samvatOffset: 56 },
  { startMonth: 3, startDay: 14, name: 'Chet', urdu: 'چیت', samvatOffset: 57 },
  { startMonth: 4, startDay: 14, name: 'Vaisakh', urdu: 'ویساکھ', samvatOffset: 57 },
  { startMonth: 5, startDay: 15, name: 'Jeth', urdu: 'جیٹھ', samvatOffset: 57 },
  { startMonth: 6, startDay: 15, name: 'Harh', urdu: 'ہاڑھ', samvatOffset: 57 },
  { startMonth: 7, startDay: 16, name: 'Sawan', urdu: 'ساون', samvatOffset: 57 },
  { startMonth: 8, startDay: 16, name: 'Bhadon', urdu: 'بھادوں', samvatOffset: 57 },
  { startMonth: 9, startDay: 15, name: 'Assu', urdu: 'اسو', samvatOffset: 57 },
  { startMonth: 10, startDay: 15, name: 'Katak', urdu: 'کتک', samvatOffset: 57 },
  { startMonth: 11, startDay: 14, name: 'Maghar', urdu: 'مگھر', samvatOffset: 57 },
  { startMonth: 12, startDay: 14, name: 'Poh', urdu: 'پوہ', samvatOffset: 57 },
];

export function convertToDesiBikrami(d: ParsedIsoDate): DesiDateInfo {
  const targetMs = toUtcMs(d);

  // Build ordered anchors spanning Dec of previous year through Dec of current year
  const candidates: Array<DesiMonthStart & { yearForAnchor: number; utcMs: number }> = [
    {
      ...DESI_MONTH_ANCHORS[11], // Poh starting Dec 14 of previous Gregorian year
      yearForAnchor: d.year - 1,
      samvatOffset: 57, // Dec 14 of previous year is +57 relative to previous year = d.year + 56
      utcMs: Date.UTC(d.year - 1, 11, 14),
    },
    ...DESI_MONTH_ANCHORS.map((anchor) => ({
      ...anchor,
      yearForAnchor: d.year,
      utcMs: Date.UTC(d.year, anchor.startMonth - 1, anchor.startDay),
    })),
  ];

  let matched = candidates[0];
  for (const cand of candidates) {
    if (cand.utcMs <= targetMs) {
      matched = cand;
    } else {
      break;
    }
  }

  const desiDay = Math.floor((targetMs - matched.utcMs) / 86400000) + 1;
  const bikramiYear = matched.yearForAnchor + matched.samvatOffset;

  return {
    day: desiDay,
    monthName: matched.name,
    monthUrdu: matched.urdu,
    year: bikramiYear,
    formatted: `${desiDay} ${matched.name} ${bikramiYear} BK`,
  };
}

function getBirthdayInYear(year: number, dobMonth: number, dobDay: number): ParsedIsoDate {
  // For Feb 29 births, celebrate on Feb 29 in leap years and Mar 1 in common years
  if (dobMonth === 2 && dobDay === 29 && !isLeapYear(year)) {
    return { year, month: 3, day: 1 };
  }
  return { year, month: dobMonth, day: dobDay };
}

export function calculateExactAge(dobIso: string, targetIso: string): AgeCalculationResult {
  const emptyResult: AgeCalculationResult = {
    isValid: false,
    years: 0,
    months: 0,
    days: 0,
    totalMonths: 0,
    totalMonthsRemainderDays: 0,
    totalWeeks: 0,
    totalWeeksRemainderDays: 0,
    totalDays: 0,
    totalHours: 0,
    bornWeekday: '—',
    dobFormatted: '—',
    targetFormatted: '—',
    nextBirthday: {
      isToday: false,
      daysRemaining: 0,
      label: '—',
      nextDateFormatted: '—',
      isLeapDayBirth: false,
    },
    hijriDob: { formatted: '—', numeric: '—' },
    desiDob: { day: 0, monthName: '—', monthUrdu: '', year: 0, formatted: '—' },
  };

  if (!dobIso) {
    return { ...emptyResult, error: 'Please select a Date of Birth to calculate age.' };
  }
  if (!targetIso) {
    return { ...emptyResult, error: 'Please select an "Age at the date of" value.' };
  }

  const dob = parseIsoDate(dobIso);
  if (!dob) {
    return { ...emptyResult, error: 'Please enter a valid Date of Birth.' };
  }

  const target = parseIsoDate(targetIso);
  if (!target) {
    return { ...emptyResult, error: 'Please enter a valid target date.' };
  }

  const today = parseIsoDate(getTodayLocalIso());
  if (today && compareParsedDates(dob, today) > 0) {
    return {
      ...emptyResult,
      error: 'Date of birth cannot be in the future. Please choose today or an earlier date.',
    };
  }

  if (compareParsedDates(target, dob) < 0) {
    return {
      ...emptyResult,
      error: '"Age at the date of" cannot be earlier than the Date of Birth. Please choose a later target date.',
    };
  }

  // Exact calendar years, months, days (borrowing from previous month when needed,
  // safely clamping month-end days like Jan 31 -> Feb 28/29 so days are never negative)
  let monthsTotal = (target.year - dob.year) * 12 + (target.month - dob.month);

  const getAnchoredDate = (addMonths: number): ParsedIsoDate => {
    const zeroBasedMonth = dob.month - 1 + addMonths;
    const y = dob.year + Math.floor(zeroBasedMonth / 12);
    const m = (zeroBasedMonth % 12) + 1;
    const d = Math.min(dob.day, daysInMonth(y, m));
    return { year: y, month: m, day: d };
  };

  let anchor = getAnchoredDate(monthsTotal);
  if (compareParsedDates(anchor, target) > 0 && monthsTotal > 0) {
    monthsTotal -= 1;
    anchor = getAnchoredDate(monthsTotal);
  }

  const years = Math.floor(monthsTotal / 12);
  const months = monthsTotal % 12;
  const days = Math.round((toUtcMs(target) - toUtcMs(anchor)) / 86400000);

  const totalDays = Math.round((toUtcMs(target) - toUtcMs(dob)) / 86400000);
  const totalHours = totalDays * 24;
  const totalWeeks = Math.floor(totalDays / 7);
  const totalWeeksRemainderDays = totalDays % 7;
  const totalMonths = years * 12 + months;

  const bornWeekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(new Date(toUtcMs(dob)));

  // Next birthday countdown relative to target date
  const isLeapDayBirth = dob.month === 2 && dob.day === 29;
  const isExactBirthday = dob.month === target.month && dob.day === target.day;

  let nextBirthday: NextBirthdayInfo;
  if (isExactBirthday) {
    nextBirthday = {
      isToday: true,
      daysRemaining: 0,
      label: 'Today! 🎉',
      nextDateFormatted: formatReadableGregorian(target),
      isLeapDayBirth,
    };
  } else {
    let candidate = getBirthdayInYear(target.year, dob.month, dob.day);
    if (compareParsedDates(candidate, target) <= 0) {
      candidate = getBirthdayInYear(target.year + 1, dob.month, dob.day);
    }
    const daysRemaining = Math.round((toUtcMs(candidate) - toUtcMs(target)) / 86400000);
    nextBirthday = {
      isToday: false,
      daysRemaining,
      label: `${daysRemaining.toLocaleString()} ${daysRemaining === 1 ? 'day' : 'days'}`,
      nextDateFormatted: formatReadableGregorian(candidate),
      isLeapDayBirth,
    };
  }

  return {
    isValid: true,
    years,
    months,
    days,
    totalMonths,
    totalMonthsRemainderDays: days,
    totalWeeks,
    totalWeeksRemainderDays,
    totalDays,
    totalHours,
    bornWeekday,
    dobFormatted: formatReadableGregorian(dob),
    targetFormatted: formatReadableGregorian(target),
    nextBirthday,
    hijriDob: formatHijriDate(dob),
    desiDob: convertToDesiBikrami(dob),
  };
}
