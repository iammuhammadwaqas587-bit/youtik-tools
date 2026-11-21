export interface RamadanCityOption {
  id: string;
  label: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const PAKISTAN_RAMADAN_CITIES: RamadanCityOption[] = [
  { id: 'karachi-pk', label: 'Karachi, Pakistan', city: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011 },
  { id: 'lahore-pk', label: 'Lahore, Pakistan', city: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587 },
  { id: 'islamabad-pk', label: 'Islamabad, Pakistan', city: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479 },
  { id: 'rawalpindi-pk', label: 'Rawalpindi, Pakistan', city: 'Rawalpindi', country: 'Pakistan', latitude: 33.5651, longitude: 73.0169 },
  { id: 'faisalabad-pk', label: 'Faisalabad, Pakistan', city: 'Faisalabad', country: 'Pakistan', latitude: 31.4504, longitude: 73.135 },
  { id: 'multan-pk', label: 'Multan, Pakistan', city: 'Multan', country: 'Pakistan', latitude: 30.1575, longitude: 71.5249 },
  { id: 'peshawar-pk', label: 'Peshawar, Pakistan', city: 'Peshawar', country: 'Pakistan', latitude: 34.0151, longitude: 71.5249 },
  { id: 'quetta-pk', label: 'Quetta, Pakistan', city: 'Quetta', country: 'Pakistan', latitude: 30.1798, longitude: 66.975 },
  { id: 'okara-pk', label: 'Okara, Pakistan', city: 'Okara', country: 'Pakistan', latitude: 30.8081, longitude: 73.4594 },
  { id: 'sahiwal-pk', label: 'Sahiwal, Pakistan', city: 'Sahiwal', country: 'Pakistan', latitude: 30.6682, longitude: 73.1114 },
  { id: 'gujranwala-pk', label: 'Gujranwala, Pakistan', city: 'Gujranwala', country: 'Pakistan', latitude: 32.1877, longitude: 74.1945 },
  { id: 'sialkot-pk', label: 'Sialkot, Pakistan', city: 'Sialkot', country: 'Pakistan', latitude: 32.4945, longitude: 74.5229 },
  { id: 'hyderabad-pk', label: 'Hyderabad, Pakistan', city: 'Hyderabad', country: 'Pakistan', latitude: 25.396, longitude: 68.3578 },
  { id: 'bahawalpur-pk', label: 'Bahawalpur, Pakistan', city: 'Bahawalpur', country: 'Pakistan', latitude: 29.3544, longitude: 71.6911 },
  { id: 'sargodha-pk', label: 'Sargodha, Pakistan', city: 'Sargodha', country: 'Pakistan', latitude: 32.074, longitude: 72.6861 },
  { id: 'sukkur-pk', label: 'Sukkur, Pakistan', city: 'Sukkur', country: 'Pakistan', latitude: 27.7131, longitude: 68.8492 },
  { id: 'abbottabad-pk', label: 'Abbottabad, Pakistan', city: 'Abbottabad', country: 'Pakistan', latitude: 34.1688, longitude: 73.2215 },
  { id: 'gujrat-pk', label: 'Gujrat, Pakistan', city: 'Gujrat', country: 'Pakistan', latitude: 32.5731, longitude: 74.1005 },
  { id: 'sheikhupura-pk', label: 'Sheikhupura, Pakistan', city: 'Sheikhupura', country: 'Pakistan', latitude: 31.7167, longitude: 73.985 },
  { id: 'mardan-pk', label: 'Mardan, Pakistan', city: 'Mardan', country: 'Pakistan', latitude: 34.1986, longitude: 72.0404 },
  { id: 'makkah-sa', label: 'Makkah, Saudi Arabia', city: 'Makkah', country: 'Saudi Arabia', latitude: 21.3891, longitude: 39.8579 },
  { id: 'madinah-sa', label: 'Madinah, Saudi Arabia', city: 'Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692 },
  { id: 'dubai-ae', label: 'Dubai, UAE', city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { id: 'london-uk', label: 'London, UK', city: 'London', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276 },
  { id: 'toronto-ca', label: 'Toronto, Canada', city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
];

export const ALADHAN_METHODS = [
  { id: 1, name: 'University of Islamic Sciences, Karachi (Pakistan)' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League (MWL)' },
  { id: 4, name: 'Umm Al-Qura University, Makkah' },
  { id: 5, name: 'Egyptian General Authority of Survey' },
] as const;

export interface RamadanDayRow {
  ramadanDay: number;
  hijriDateLabel: string;
  gregorianIso: string; // YYYY-MM-DD
  gregorianDisplay: string;
  weekday: string;
  isFriday: boolean;
  fajr24: string; // HH:MM
  maghrib24: string; // HH:MM
  imsak24: string; // HH:MM
  fastingDuration: string; // e.g. "13h 18m"
  timezone: string;
}

export function cleanAladhanTime(raw: string): string {
  const m = String(raw || '').match(/(\d{1,2}):(\d{2})/);
  if (!m) return '00:00';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

export function formatTimeDisplay(hhmm: string, use24Hour: boolean): string {
  const [hStr, mStr] = cleanAladhanTime(hhmm).split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  if (use24Hour) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function computeFastingDuration(fajr24: string, maghrib24: string): string {
  const [fh, fm] = cleanAladhanTime(fajr24).split(':').map(Number);
  const [mh, mm] = cleanAladhanTime(maghrib24).split(':').map(Number);
  if ([fh, fm, mh, mm].some(Number.isNaN)) return '—';
  let diffMins = mh * 60 + mm - (fh * 60 + fm);
  if (diffMins < 0) diffMins += 24 * 60;
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hrs}h ${String(mins).padStart(2, '0')}m`;
}

export function parseAladhanGregorianDateToIso(ddMmYyyy: string): string {
  const m = String(ddMmYyyy || '').match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function transformAladhanCalendarResponse(data: any[]): RamadanDayRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((entry, idx) => {
    const hijri = entry?.date?.hijri || {};
    const greg = entry?.date?.gregorian || {};
    const timings = entry?.timings || {};
    const tz = entry?.meta?.timezone || 'Asia/Karachi';

    const ramadanDay = Number(hijri.day) || idx + 1;
    const gregIso = parseAladhanGregorianDateToIso(greg.date);
    const weekday = greg?.weekday?.en || '';
    const monthName = greg?.month?.en ? String(greg.month.en).slice(0, 3) : '';
    const gregorianDisplay =
      greg?.day && monthName && greg?.year
        ? `${Number(greg.day)} ${monthName} ${greg.year}`
        : gregIso;

    const fajr24 = cleanAladhanTime(timings.Fajr);
    const maghrib24 = cleanAladhanTime(timings.Maghrib);
    const imsak24 = cleanAladhanTime(timings.Imsak || timings.Fajr);

    return {
      ramadanDay,
      hijriDateLabel: `${ramadanDay} Ramadan ${hijri.year || ''} AH`.trim(),
      gregorianIso: gregIso,
      gregorianDisplay,
      weekday,
      isFriday: weekday.toLowerCase() === 'friday',
      fajr24,
      maghrib24,
      imsak24,
      fastingDuration: computeFastingDuration(fajr24, maghrib24),
      timezone: tz,
    };
  });
}

export function getDefaultUpcomingRamadanHijriYear(): number {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      month: 'numeric',
      year: 'numeric',
    });
    const parts = fmt.formatToParts(new Date());
    const m = Number(parts.find((p) => p.type === 'month')?.value || 1);
    const y = Number(String(parts.find((p) => p.type === 'year')?.value || '1447').replace(/[^\d]/g, '')) || 1447;
    // Month 9 is Ramadan; after Shawwal (10+), default to the upcoming Ramadan next Hijri year
    return m > 9 ? y + 1 : y;
  } catch {
    return 1448;
  }
}

/**
 * Generates an RFC-5545 .ics calendar file containing Sehri and Iftar reminders
 * for every day of the displayed Ramadan timetable.
 */
export function buildRamadanIcsContent(rows: RamadanDayRow[], cityLabel: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YouTikTools//Ramadan Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Ramadan Sehri & Iftar - ${cityLabel}`,
  ];

  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  for (const row of rows) {
    if (!row.gregorianIso) continue;
    const dateCompact = row.gregorianIso.replace(/-/g, '');
    const [fh, fm] = row.fajr24.split(':');
    const [mh, mm] = row.maghrib24.split(':');

    // Sehri Ends (Fajr) 15-min block
    const sehriStart = `${dateCompact}T${fh}${fm}00`;
    const sehriEndMin = Number(fh) * 60 + Number(fm) + 15;
    const sehriEndH = String(Math.floor(sehriEndMin / 60) % 24).padStart(2, '0');
    const sehriEndM = String(sehriEndMin % 60).padStart(2, '0');

    lines.push(
      'BEGIN:VEVENT',
      `UID:sehri-r${row.ramadanDay}-${dateCompact}@youtiktools.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${sehriStart}`,
      `DTEND:${dateCompact}T${sehriEndH}${sehriEndM}00`,
      `SUMMARY:Sehri Ends (Fajr) - Ramadan Day ${row.ramadanDay} (${cityLabel})`,
      `DESCRIPTION:Sehri ends at ${formatTimeDisplay(row.fajr24, false)} in ${cityLabel}. Fasting duration: ${row.fastingDuration}.`,
      'END:VEVENT'
    );

    // Iftar (Maghrib) 20-min block
    const iftarStart = `${dateCompact}T${mh}${mm}00`;
    const iftarEndMin = Number(mh) * 60 + Number(mm) + 20;
    const iftarEndH = String(Math.floor(iftarEndMin / 60) % 24).padStart(2, '0');
    const iftarEndM = String(iftarEndMin % 60).padStart(2, '0');

    lines.push(
      'BEGIN:VEVENT',
      `UID:iftar-r${row.ramadanDay}-${dateCompact}@youtiktools.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${iftarStart}`,
      `DTEND:${dateCompact}T${iftarEndH}${iftarEndM}00`,
      `SUMMARY:Iftar (Maghrib) - Ramadan Day ${row.ramadanDay} (${cityLabel})`,
      `DESCRIPTION:Iftar time at ${formatTimeDisplay(row.maghrib24, false)} in ${cityLabel}.`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
