import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Moon,
  Sun,
  MapPin,
  Search,
  Copy,
  Check,
  Printer,
  CalendarPlus,
  RefreshCw,
  Share2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { getTodayLocalIso } from '../utils/ageCalculation';
import {
  PAKISTAN_RAMADAN_CITIES,
  ALADHAN_METHODS,
  type RamadanDayRow,
  transformAladhanCalendarResponse,
  formatTimeDisplay,
  getDefaultUpcomingRamadanHijriYear,
  buildRamadanIcsContent,
} from '../utils/ramadanTimetable';

interface RamadanTimetablePageProps {
  onNavigate: (path: string) => void;
}

const PREFS_KEY = 'youtiktools_ramadan_prefs_v1';

interface SavedRamadanPrefs {
  mode: 'preset' | 'gps' | 'custom';
  cityId: string;
  customCity: string;
  customCountry: string;
  lat: number | null;
  lng: number | null;
  method: number;
  school: 0 | 1;
  adjustment: -1 | 0 | 1;
  use24Hour: boolean;
}

export const RamadanTimetablePage: React.FC<RamadanTimetablePageProps> = ({
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

  const defaultHijriYear = useMemo(() => getDefaultUpcomingRamadanHijriYear(), []);

  const [prefs, setPrefs] = useState<SavedRamadanPrefs>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage?.getItem(PREFS_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          mode: parsed.mode || 'preset',
          cityId: parsed.cityId || 'karachi-pk',
          customCity: parsed.customCity || '',
          customCountry: parsed.customCountry || 'Pakistan',
          lat: typeof parsed.lat === 'number' ? parsed.lat : null,
          lng: typeof parsed.lng === 'number' ? parsed.lng : null,
          method: Number(parsed.method) || 1,
          school: parsed.school === 0 ? 0 : 1,
          adjustment: [-1, 0, 1].includes(parsed.adjustment) ? parsed.adjustment : 0,
          use24Hour: Boolean(parsed.use24Hour),
        };
      }
    } catch {
      // Ignore storage errors
    }
    return {
      mode: 'preset',
      cityId: 'karachi-pk',
      customCity: '',
      customCountry: 'Pakistan',
      lat: null,
      lng: null,
      method: 1,
      school: 1,
      adjustment: 0,
      use24Hour: false,
    };
  });

  const [hijriYear, setHijriYear] = useState<number>(defaultHijriYear);
  const [citySearch, setCitySearch] = useState<string>('');
  const [rows, setRows] = useState<RamadanDayRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
      }
    } catch {
      // Ignore quota errors
    }
  }, [prefs]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return PAKISTAN_RAMADAN_CITIES;
    return PAKISTAN_RAMADAN_CITIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [citySearch]);

  const activeLocationLabel = useMemo(() => {
    if (prefs.mode === 'gps' && prefs.lat !== null && prefs.lng !== null) {
      return `My Location (${prefs.lat.toFixed(2)}, ${prefs.lng.toFixed(2)})`;
    }
    if (prefs.mode === 'custom' && prefs.customCity.trim()) {
      return prefs.customCountry.trim()
        ? `${prefs.customCity.trim()}, ${prefs.customCountry.trim()}`
        : prefs.customCity.trim();
    }
    const found = PAKISTAN_RAMADAN_CITIES.find((c) => c.id === prefs.cityId);
    return found ? found.label : 'Karachi, Pakistan';
  }, [prefs]);

  const fetchTimetable = useCallback(async () => {
    setErrorMsg(null);

    let url = '';
    let cacheKey = '';

    if (prefs.mode === 'gps' && prefs.lat !== null && prefs.lng !== null) {
      url = `https://api.aladhan.com/v1/hijriCalendar/${hijriYear}/9?latitude=${prefs.lat}&longitude=${prefs.lng}&method=${prefs.method}&school=${prefs.school}&adjustment=${prefs.adjustment}`;
      cacheKey = `ramadan_gps_${hijriYear}_${prefs.lat.toFixed(2)}_${prefs.lng.toFixed(2)}_${prefs.method}_${prefs.school}_${prefs.adjustment}`;
    } else if (prefs.mode === 'custom' && prefs.customCity.trim() && prefs.customCountry.trim()) {
      const c = encodeURIComponent(prefs.customCity.trim());
      const co = encodeURIComponent(prefs.customCountry.trim());
      url = `https://api.aladhan.com/v1/hijriCalendarByCity/${hijriYear}/9?city=${c}&country=${co}&method=${prefs.method}&school=${prefs.school}&adjustment=${prefs.adjustment}`;
      cacheKey = `ramadan_city_${hijriYear}_${c}_${co}_${prefs.method}_${prefs.school}_${prefs.adjustment}`;
    } else {
      const preset =
        PAKISTAN_RAMADAN_CITIES.find((c) => c.id === prefs.cityId) ||
        PAKISTAN_RAMADAN_CITIES[0];
      const c = encodeURIComponent(preset.city);
      const co = encodeURIComponent(preset.country);
      url = `https://api.aladhan.com/v1/hijriCalendarByCity/${hijriYear}/9?city=${c}&country=${co}&method=${prefs.method}&school=${prefs.school}&adjustment=${prefs.adjustment}`;
      cacheKey = `ramadan_preset_${hijriYear}_${preset.id}_${prefs.method}_${prefs.school}_${prefs.adjustment}`;
    }

    try {
      const cached = typeof window !== 'undefined' ? window.localStorage?.getItem(cacheKey) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 28) {
          setRows(parsed);
          return;
        }
      }
    } catch {
      // Ignore cache read error
    }

    setIsLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.code !== 200 || !Array.isArray(json.data)) {
        throw new Error('Could not find Ramadan prayer schedule for this location.');
      }
      const transformed = transformAladhanCalendarResponse(json.data);
      setRows(transformed);
      try {
        window.localStorage?.setItem(cacheKey, JSON.stringify(transformed));
      } catch {
        // Ignore cache write error
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'Unable to load Sehri & Iftar timetable right now. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [prefs, hijriYear]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setErrorMsg('Geolocation is not supported in this browser. Please select a city from the list.');
      return;
    }
    setGpsLoading(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setPrefs((prev) => ({
          ...prev,
          mode: 'gps',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
      },
      () => {
        setGpsLoading(false);
        setErrorMsg('Location access denied or unavailable. Please choose a city below.');
      },
      { timeout: 10000 }
    );
  };

  const todayIso = useMemo(() => getTodayLocalIso(), []);
  const featuredRow = useMemo(() => {
    return rows.find((r) => r.gregorianIso === todayIso) || rows[0] || null;
  }, [rows, todayIso]);

  const countdownInfo = useMemo(() => {
    if (!featuredRow) return null;
    const isToday = featuredRow.gregorianIso === todayIso;
    if (!isToday) {
      return {
        label: `Day ${featuredRow.ramadanDay} Schedule (${featuredRow.gregorianDisplay})`,
        remainingText: `Sehri ${formatTimeDisplay(featuredRow.fajr24, prefs.use24Hour)} · Iftar ${formatTimeDisplay(featuredRow.maghrib24, prefs.use24Hour)}`,
      };
    }

    const nowDate = new Date(nowMs);
    const currentSeconds =
      nowDate.getHours() * 3600 + nowDate.getMinutes() * 60 + nowDate.getSeconds();

    const [fh, fm] = featuredRow.fajr24.split(':').map(Number);
    const [mh, mm] = featuredRow.maghrib24.split(':').map(Number);
    const fajrSec = fh * 3600 + fm * 60;
    const maghribSec = mh * 3600 + mm * 60;

    let label = '';
    let diffSec = 0;

    if (currentSeconds < fajrSec) {
      label = 'Time Remaining Until Sehri Ends (Fajr)';
      diffSec = fajrSec - currentSeconds;
    } else if (currentSeconds < maghribSec) {
      label = 'Time Remaining Until Iftar (Maghrib)';
      diffSec = maghribSec - currentSeconds;
    } else {
      label = 'Next Day Sehri Countdown';
      diffSec = 24 * 3600 - currentSeconds + fajrSec;
    }

    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;
    return {
      label,
      remainingText: `${String(hrs).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`,
    };
  }, [featuredRow, todayIso, nowMs, prefs.use24Hour]);

  const shareMessage = useMemo(() => {
    if (!featuredRow) return '';
    return `Ramadan ${hijriYear} AH (${activeLocationLabel}) — Day ${featuredRow.ramadanDay} (${featuredRow.gregorianDisplay}): Sehri Ends ${formatTimeDisplay(featuredRow.fajr24, prefs.use24Hour)} | Iftar ${formatTimeDisplay(featuredRow.maghrib24, prefs.use24Hour)}. Full 30-day timetable on https://youtiktools.com/ramadan-timetable`;
  }, [featuredRow, hijriYear, activeLocationLabel, prefs.use24Hour]);

  const handleCopyToday = async () => {
    if (!shareMessage) return;
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedKey('today');
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadIcs = () => {
    if (!rows.length) return;
    const content = buildRamadanIcsContent(rows, activeLocationLabel);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ramadan-${hijriYear}-${activeLocationLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
      name: 'Prayer Times & Qibla',
      path: '/prayer-times',
      description: 'Daily Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha & Qibla compass.',
      icon: '🕌',
    },
    {
      name: 'Hijri Date Converter',
      path: '/hijri-date-converter',
      description: 'Two-way Hijri, Gregorian & Desi calendar converter with offset.',
      icon: '🗓️',
    },
    {
      name: 'Zakat Calculator',
      path: '/zakat-calculator',
      description: 'Calculate 2.5% annual Zakat and Zakat al-Fitr (Fitrana) in PKR.',
      icon: '💰',
    },
    {
      name: 'Islamic Baby Names',
      path: '/islamic-baby-names',
      description: '500+ authentic Muslim baby names with Urdu & Arabic script.',
      icon: '👶',
    },
  ];

  return (
    <ToolLayout
      toolPath="/ramadan-timetable"
      title="Ramadan Timetable – Sehri & Iftar Times (Pakistan & Global)"
      badgeText="Karachi Method · Hanafi · PDF & ICS"
      badgeIcon={<Moon className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />}
      description="Check accurate 30-day Sehri (Fajr) and Iftar (Maghrib) Ramadan timings for Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, and global cities. Includes live countdown, Hanafi settings, .ics calendar download, WhatsApp share, and 1-page printable A4 PDF view."
      howItWorks={{
        heading: 'How Ramadan Sehri & Iftar Timings Are Calculated',
        text: 'Select your city or share GPS location, choose Karachi or international calculation method and Hanafi juristic school, and download or print the complete 30-day Ramadan calendar.',
        steps: [
          {
            number: 1,
            title: 'Select City or Location',
            description:
              'Search major Pakistani & global cities, enter any custom city + country, or use GPS auto-detection.',
          },
          {
            number: 2,
            title: 'Verify Method & Offset',
            description:
              'Defaults to University of Islamic Sciences, Karachi & Hanafi school; adjust Hijri date ±1 day for local moon sighting.',
          },
          {
            number: 3,
            title: 'Print PDF or Export .ICS',
            description:
              'Add daily Sehri & Iftar reminders to your phone calendar or print a clean single-page A4 Ramadan sheet.',
          },
        ],
      }}
      supportedFormats={[
        { format: 'Karachi & Hanafi Default', description: 'Tailored to Pakistan’s standard astronomical dusk/dawn angles.' },
        { format: 'One-Page A4 Print / PDF', description: 'Clean print stylesheet removes ads & buttons for crisp fridge printouts.' },
        { format: 'Calendar .ICS Export', description: 'Imports all 30 Sehri & Iftar alarms into Google, Apple, or Outlook Calendar.' },
      ]}
      tips={[
        'In Pakistan, keep a cautious buffer of 1–2 minutes before Sehri ends (Fajr) and verify local masjid announcements on the 1st and 29th/30th nights of Ramadan.',
        'Click “Print / Save PDF” and choose Save as PDF in your browser dialog for an instant one-page family timetable.',
      ]}
      faqs={[
        {
          question: 'Which calculation method is used for Pakistan Ramadan timings?',
          answer:
            'By default we use Method 1 (University of Islamic Sciences, Karachi) with the Hanafi juristic school—the standard astronomical authority across Pakistan. You can switch methods or adjust Hijri dates anytime from Settings.',
        },
        {
          question: 'Why do the first and last dates say subject to moon sighting?',
          answer:
            'Islamic months always begin with physical sighting of the new crescent moon (Hilal). Pakistan’s Central Ruet-e-Hilal Committee announces the 1st of Ramadan and Eid ul-Fitr, which can shift tabular dates by ±1 day.',
        },
        {
          question: 'Can I add Ramadan Sehri and Iftar alerts to my phone calendar?',
          answer:
            'Yes. Click the “Add to Calendar (.ics)” button to download an RFC-5545 calendar file containing daily Sehri and Iftar events for the selected city.',
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
        {/* Top Controls & City Picker (Hidden in Print) */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 no-print ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>City, Year &amp; Fiqh Settings</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={gpsLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{gpsLoading ? 'Locating...' : 'Use My Location'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDarkTheme((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
              >
                {isDarkTheme ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search & Preset Selector */}
            <div className="space-y-2">
              <label htmlFor="ramadan-city-search" className={`block text-xs font-bold ${labelText}`}>
                Search Pakistani / Global Cities
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${mutedText}`} />
                <input
                  id="ramadan-city-search"
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Filter e.g. Lahore, Okara, Multan..."
                  className={`w-full h-9 pl-8 pr-3 rounded-xl border text-xs ${inputSurface}`}
                />
              </div>
              <select
                aria-label="Select Ramadan city"
                value={prefs.mode === 'preset' ? prefs.cityId : ''}
                onChange={(e) => {
                  if (!e.target.value) return;
                  setPrefs((prev) => ({ ...prev, mode: 'preset', cityId: e.target.value }));
                }}
                className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-bold ${inputSurface}`}
              >
                {prefs.mode !== 'preset' && (
                  <option value="">-- Choose a preset city --</option>
                )}
                {filteredCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom City + Country */}
            <div className="space-y-2">
              <span className={`block text-xs font-bold ${labelText}`}>
                Or Enter Any Other City &amp; Country
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={prefs.customCity}
                  onChange={(e) => setPrefs((p) => ({ ...p, customCity: e.target.value }))}
                  placeholder="City (e.g. Mirpur)"
                  aria-label="Custom city"
                  className={`h-9 px-3 rounded-xl border text-xs ${inputSurface}`}
                />
                <input
                  type="text"
                  value={prefs.customCountry}
                  onChange={(e) => setPrefs((p) => ({ ...p, customCountry: e.target.value }))}
                  placeholder="Country (e.g. Pakistan)"
                  aria-label="Custom country"
                  className={`h-9 px-3 rounded-xl border text-xs ${inputSurface}`}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!prefs.customCity.trim()) return;
                  setPrefs((p) => ({ ...p, mode: 'custom' }));
                }}
                className={`w-full h-10 rounded-xl border text-xs font-bold cursor-pointer ${
                  prefs.mode === 'custom'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : cardSurface
                }`}
              >
                Load Custom City Timetable
              </button>
            </div>
          </div>

          {/* Calculation Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-200/70">
            <div>
              <label htmlFor="ramadan-year" className={`block text-[11px] font-bold mb-1 ${mutedText}`}>
                Hijri Year
              </label>
              <select
                id="ramadan-year"
                value={hijriYear}
                onChange={(e) => setHijriYear(Number(e.target.value))}
                className={`w-full h-9 px-2.5 rounded-lg border text-xs font-bold ${inputSurface}`}
              >
                {[defaultHijriYear - 1, defaultHijriYear, defaultHijriYear + 1, defaultHijriYear + 2].map((y) => (
                  <option key={y} value={y}>
                    Ramadan {y} AH
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ramadan-method" className={`block text-[11px] font-bold mb-1 ${mutedText}`}>
                Method
              </label>
              <select
                id="ramadan-method"
                value={prefs.method}
                onChange={(e) => setPrefs((p) => ({ ...p, method: Number(e.target.value) }))}
                className={`w-full h-9 px-2 rounded-lg border text-xs font-semibold ${inputSurface}`}
              >
                {ALADHAN_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ramadan-school" className={`block text-[11px] font-bold mb-1 ${mutedText}`}>
                Asr School
              </label>
              <select
                id="ramadan-school"
                value={prefs.school}
                onChange={(e) => setPrefs((p) => ({ ...p, school: Number(e.target.value) as 0 | 1 }))}
                className={`w-full h-9 px-2 rounded-lg border text-xs font-semibold ${inputSurface}`}
              >
                <option value={1}>Hanafi (Default)</option>
                <option value={0}>Shafi / Standard</option>
              </select>
            </div>

            <div>
              <label htmlFor="ramadan-adj" className={`block text-[11px] font-bold mb-1 ${mutedText}`}>
                Hijri Adjustment
              </label>
              <select
                id="ramadan-adj"
                value={prefs.adjustment}
                onChange={(e) => setPrefs((p) => ({ ...p, adjustment: Number(e.target.value) as -1 | 0 | 1 }))}
                className={`w-full h-9 px-2 rounded-lg border text-xs font-semibold ${inputSurface}`}
              >
                <option value={-1}>-1 Day</option>
                <option value={0}>0 Days (Default)</option>
                <option value={1}>+1 Day</option>
              </select>
            </div>

            <div>
              <label htmlFor="ramadan-timefmt" className={`block text-[11px] font-bold mb-1 ${mutedText}`}>
                Time Format
              </label>
              <select
                id="ramadan-timefmt"
                value={prefs.use24Hour ? '24h' : '12h'}
                onChange={(e) => setPrefs((p) => ({ ...p, use24Hour: e.target.value === '24h' }))}
                className={`w-full h-9 px-2 rounded-lg border text-xs font-semibold ${inputSurface}`}
              >
                <option value="12h">12-Hour (AM/PM)</option>
                <option value="24h">24-Hour</option>
              </select>
            </div>
          </div>
        </section>

        {/* Print Header (Visible in both screen and print cleanly) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black">
              Ramadan {hijriYear} AH Timetable — {activeLocationLabel}
            </h2>
            <p className={`text-xs ${mutedText}`}>
              {ALADHAN_METHODS.find((m) => m.id === prefs.method)?.name} ·{' '}
              {prefs.school === 1 ? 'Hanafi' : 'Shafi'} · Timings subject to local moon sighting
            </p>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <button
              type="button"
              onClick={handleCopyToday}
              disabled={!featuredRow}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer disabled:opacity-50 ${cardSurface}`}
            >
              {copiedKey === 'today' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey === 'today' ? 'Copied!' : "Copy Today's Times"}</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={handleDownloadIcs}
              disabled={!rows.length}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer disabled:opacity-50 ${cardSurface}`}
            >
              <CalendarPlus className="h-3.5 w-3.5 text-emerald-600" />
              <span>Add to Calendar (.ics)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!rows.length}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Highlight Card: Today's Sehri & Iftar + Countdown */}
        {featuredRow && (
          <section className="rounded-2xl border border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 sm:p-5 print-avoid-break">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{countdownInfo?.label}</span>
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono mt-1 tabular-nums">
                  {countdownInfo?.remainingText}
                </p>
                <p className={`text-xs mt-0.5 ${mutedText}`}>
                  {featuredRow.hijriDateLabel} · {featuredRow.gregorianDisplay} ({featuredRow.weekday})
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border ${cardSurface}`}>
                <span className={`text-[11px] font-bold uppercase ${mutedText}`}>Sehri Ends (Fajr)</span>
                <p className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {formatTimeDisplay(featuredRow.fajr24, prefs.use24Hour)}
                </p>
              </div>
              <div className={`p-3.5 rounded-xl border ${cardSurface}`}>
                <span className={`text-[11px] font-bold uppercase ${mutedText}`}>Iftar Time (Maghrib)</span>
                <p className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300 mt-0.5">
                  {formatTimeDisplay(featuredRow.maghrib24, prefs.use24Hour)}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Loading / Error State */}
        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-800 text-xs font-semibold flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={fetchTimetable}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {isLoading && (
          <div className={`rounded-2xl border p-6 space-y-3 animate-pulse no-print ${cardSurface}`}>
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        )}

        {/* 30-Day Timetable */}
        {!isLoading && rows.length > 0 && (
          <section className={`rounded-2xl border overflow-hidden ${cardSurface}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs print-compact-table">
                <thead className={isDarkTheme ? 'bg-slate-900/80 text-slate-300' : 'bg-slate-50 text-slate-700'}>
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Day</th>
                    <th className="py-2.5 px-3 font-bold">Hijri Date</th>
                    <th className="py-2.5 px-3 font-bold">Gregorian Date</th>
                    <th className="py-2.5 px-3 font-bold">Weekday</th>
                    <th className="py-2.5 px-3 font-bold">Sehri Ends</th>
                    <th className="py-2.5 px-3 font-bold">Iftar</th>
                    <th className="py-2.5 px-3 font-bold text-right">Fasting Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {rows.map((row, idx) => {
                    const isToday = row.gregorianIso === todayIso;
                    const isBoundary = idx === 0 || idx >= rows.length - 2;
                    return (
                      <tr
                        key={row.ramadanDay}
                        className={
                          isToday
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/50 font-bold'
                            : row.isFriday
                              ? 'bg-amber-50/60 dark:bg-amber-950/20'
                              : ''
                        }
                      >
                        <td className="py-2 px-3 font-mono font-bold">
                          {row.ramadanDay}
                          {isBoundary && <span className="text-emerald-600 ml-0.5">*</span>}
                        </td>
                        <td className="py-2 px-3">{row.hijriDateLabel}</td>
                        <td className="py-2 px-3 font-mono">{row.gregorianDisplay}</td>
                        <td className="py-2 px-3">
                          <span className={row.isFriday ? 'font-bold text-emerald-700 dark:text-emerald-300' : ''}>
                            {row.weekday}
                          </span>
                          {isToday && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                              TODAY
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          {formatTimeDisplay(row.fajr24, prefs.use24Hour)}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-700 dark:text-amber-300">
                          {formatTimeDisplay(row.maghrib24, prefs.use24Hour)}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono ${mutedText}`}>
                          {row.fastingDuration}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={`px-4 py-2.5 text-[11px] border-t border-slate-200/70 ${mutedText}`}>
              * First and final days of Ramadan are subject to official Ruet-e-Hilal / local crescent moon sighting confirmation.
            </div>
          </section>
        )}

        {/* Sehri & Iftar Duas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 print-avoid-break">
          <div className={`rounded-2xl border p-4 space-y-2 ${cardSurface}`}>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Dua for Starting Fast (Sehri / Niyyah)
            </h3>
            <p className="font-arabic text-xl leading-loose text-right" dir="rtl">
              وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ
            </p>
            <p className="font-urdu text-sm leading-relaxed text-right text-slate-700 dark:text-slate-300" dir="rtl">
              اور میں نے ماہِ رمضان کے کل کے روزے کی نیت کی۔
            </p>
            <p className={`text-xs ${mutedText}`}>
              <strong>Translation:</strong> &ldquo;I intend to keep the fast for tomorrow in the month of Ramadan.&rdquo;
            </p>
          </div>

          <div className={`rounded-2xl border p-4 space-y-2 ${cardSurface}`}>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Dua for Breaking Fast (Iftar)
            </h3>
            <p className="font-arabic text-xl leading-loose text-right" dir="rtl">
              اَللّٰهُمَّ اِنِّي لَكَ صُمْتُ وَبِكَ اٰمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلٰى رِزْقِكَ اَفْطَرْتُ
            </p>
            <p className="font-urdu text-sm leading-relaxed text-right text-slate-700 dark:text-slate-300" dir="rtl">
              اے اللہ! میں نے تیرے لیے روزہ رکھا، تجھ پر ایمان لایا، تجھ پر بھروسہ کیا اور تیرے دیے ہوئے رزق سے افطار کیا۔
            </p>
            <p className={`text-xs ${mutedText}`}>
              <strong>Translation:</strong> &ldquo;O Allah, I fasted for You, believed in You, trusted in You, and with Your provision I break my fast.&rdquo;
            </p>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
};
