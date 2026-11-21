import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Compass,
  MapPin,
  Clock,
  RefreshCw,
  AlertCircle,
  Search,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Navigation,
  Calendar,
} from 'lucide-react';

interface PrayerTimesPageProps {
  onNavigate: (path: string) => void;
}

interface PresetCity {
  id: string;
  label: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

const PRESET_CITIES: PresetCity[] = [
  { id: 'okara-pk', label: 'Okara, Pakistan', city: 'Okara', country: 'Pakistan', latitude: 30.8081, longitude: 73.4594 },
  { id: 'lahore-pk', label: 'Lahore, Pakistan', city: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587 },
  { id: 'karachi-pk', label: 'Karachi, Pakistan', city: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011 },
  { id: 'islamabad-pk', label: 'Islamabad, Pakistan', city: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479 },
  { id: 'rawalpindi-pk', label: 'Rawalpindi, Pakistan', city: 'Rawalpindi', country: 'Pakistan', latitude: 33.5651, longitude: 73.0169 },
  { id: 'faisalabad-pk', label: 'Faisalabad, Pakistan', city: 'Faisalabad', country: 'Pakistan', latitude: 31.4504, longitude: 73.135 },
  { id: 'multan-pk', label: 'Multan, Pakistan', city: 'Multan', country: 'Pakistan', latitude: 30.1575, longitude: 71.5249 },
  { id: 'sahiwal-pk', label: 'Sahiwal, Pakistan', city: 'Sahiwal', country: 'Pakistan', latitude: 30.6682, longitude: 73.1114 },
  { id: 'gujranwala-pk', label: 'Gujranwala, Pakistan', city: 'Gujranwala', country: 'Pakistan', latitude: 32.1877, longitude: 74.1945 },
  { id: 'sialkot-pk', label: 'Sialkot, Pakistan', city: 'Sialkot', country: 'Pakistan', latitude: 32.4945, longitude: 74.5229 },
  { id: 'peshawar-pk', label: 'Peshawar, Pakistan', city: 'Peshawar', country: 'Pakistan', latitude: 34.0151, longitude: 71.5249 },
  { id: 'quetta-pk', label: 'Quetta, Pakistan', city: 'Quetta', country: 'Pakistan', latitude: 30.1798, longitude: 66.975 },
  { id: 'makkah-sa', label: 'Makkah, Saudi Arabia', city: 'Makkah', country: 'Saudi Arabia', latitude: 21.3891, longitude: 39.8579 },
  { id: 'madinah-sa', label: 'Madinah, Saudi Arabia', city: 'Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692 },
  { id: 'riyadh-sa', label: 'Riyadh, Saudi Arabia', city: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753 },
  { id: 'dubai-ae', label: 'Dubai, UAE', city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { id: 'istanbul-tr', label: 'Istanbul, Turkey', city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  { id: 'london-uk', label: 'London, United Kingdom', city: 'London', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276 },
  { id: 'new-york-us', label: 'New York, USA', city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { id: 'toronto-ca', label: 'Toronto, Canada', city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { id: 'kuala-lumpur-my', label: 'Kuala Lumpur, Malaysia', city: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869 },
];

type PrayerKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

interface PrayerData {
  timings: Record<PrayerKey, string>;
  hijriFormatted: string;
  hijriWeekday: string;
  gregorianFormatted: string;
  timezone: string;
  locationLabel: string;
  latitude: number | null;
  longitude: number | null;
  qiblaDegrees: number | null;
  methodName: string;
  schoolName: string;
}

const OBLIGATORY_PRAYERS: Array<'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'> = [
  'Fajr',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

function stripTimezoneSuffix(rawTime: string): string {
  // Aladhan returns "05:13" or "05:13 (PKT)"
  const match = String(rawTime || '').match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : '00:00';
}

function formatTo12Hour(hhmm: string): string {
  const [hStr, mStr] = stripTimezoneSuffix(hhmm).split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function parseTimeToSeconds(hhmm: string): number {
  const [hStr, mStr] = stripTimezoneSuffix(hhmm).split(':');
  return Number(hStr) * 3600 + Number(mStr) * 60;
}

function getSecondsSinceMidnightInZone(timeZone: string, now: Date): {
  seconds: number;
  clock12: string;
} {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const h = Number(parts.find((p) => p.type === 'hour')?.value || '0') % 24;
    const m = Number(parts.find((p) => p.type === 'minute')?.value || '0');
    const s = Number(parts.find((p) => p.type === 'second')?.value || '0');
    const clock12 = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now);
    return { seconds: h * 3600 + m * 60 + s, clock12 };
  } catch {
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    return {
      seconds: h * 3600 + m * 60 + s,
      clock12: now.toLocaleTimeString(),
    };
  }
}

function formatCountdown(totalSec: number): string {
  const clamped = Math.max(0, Math.floor(totalSec));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getCompassCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return dirs[idx];
}

// Great-circle initial bearing to Kaaba (21.422487° N, 39.826206° E) as accurate fallback
function computeQiblaBearing(latDeg: number, lngDeg: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const kaabaLat = toRad(21.422487);
  const kaabaLng = toRad(39.826206);
  const phi1 = toRad(latDeg);
  const lambda1 = toRad(lngDeg);
  const y = Math.sin(kaabaLng - lambda1);
  const x = Math.cos(phi1) * Math.tan(kaabaLat) - Math.sin(phi1) * Math.cos(kaabaLng - lambda1);
  return ((toDeg(Math.atan2(y, x)) % 360) + 360) % 360;
}

function isPlaceholderCoords(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return true;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return true;
  // Aladhan's timingsByCity sometimes returns ~8.8888888, 7.7777777 placeholder
  return Math.abs(lat - 8.8888888) < 0.01 && Math.abs(lng - 7.7777777) < 0.01;
}

export const PrayerTimesPage: React.FC<PrayerTimesPageProps> = ({ onNavigate }) => {
  const defaultCity = PRESET_CITIES[0]; // Okara, Pakistan
  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultCity.id);
  const [customCity, setCustomCity] = useState<string>('');
  const [customCountry, setCustomCountry] = useState<string>('');
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  // 1-second live clock for countdown
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const fetchQiblaDegrees = async (lat: number, lng: number): Promise<number> => {
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      const qRes = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`, {
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      if (qRes.ok) {
        const qJson = await qRes.json();
        const dir = qJson?.data?.direction;
        if (typeof dir === 'number' && !Number.isNaN(dir)) {
          return dir;
        }
      }
    } catch {
      // Fallback to great-circle calculation below
    }
    return computeQiblaBearing(lat, lng);
  };

  const loadByCoordinates = useCallback(
    async (latitude: number, longitude: number, label: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);

        const [timingsRes, qiblaDeg] = await Promise.all([
          fetch(
            `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(
              latitude
            )}&longitude=${encodeURIComponent(longitude)}&method=1&school=1`,
            { signal: controller.signal }
          ),
          fetchQiblaDegrees(latitude, longitude),
        ]);
        window.clearTimeout(timeout);

        if (!timingsRes.ok) {
          throw new Error(`Aladhan API returned status ${timingsRes.status}.`);
        }

        const json = await timingsRes.json();
        const data = json?.data;
        if (!data || !data.timings) {
          throw new Error('Prayer timings payload was incomplete.');
        }

        const hijri = data.date?.hijri;
        const greg = data.date?.gregorian;

        setPrayerData({
          timings: {
            Fajr: stripTimezoneSuffix(data.timings.Fajr),
            Sunrise: stripTimezoneSuffix(data.timings.Sunrise),
            Dhuhr: stripTimezoneSuffix(data.timings.Dhuhr),
            Asr: stripTimezoneSuffix(data.timings.Asr),
            Maghrib: stripTimezoneSuffix(data.timings.Maghrib),
            Isha: stripTimezoneSuffix(data.timings.Isha),
          },
          hijriFormatted: hijri
            ? `${hijri.day} ${hijri.month?.en || ''} ${hijri.year} ${hijri.designation?.abbreviated || 'AH'}`
            : 'Unavailable',
          hijriWeekday: hijri?.weekday?.en || '',
          gregorianFormatted: greg?.date
            ? `${greg.weekday?.en || ''}, ${greg.day} ${greg.month?.en || ''} ${greg.year}`
            : '',
          timezone: data.meta?.timezone || 'Asia/Karachi',
          locationLabel: label,
          latitude,
          longitude,
          qiblaDegrees: qiblaDeg,
          methodName: data.meta?.method?.name || 'University of Islamic Sciences, Karachi',
          schoolName: data.meta?.school === 'HANAFI' ? 'Hanafi' : data.meta?.school || 'Hanafi',
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.name === 'AbortError'
            ? 'Request to Aladhan API timed out. Please check your connection and try again.'
            : err instanceof Error
            ? err.message
            : 'Unable to load prayer times right now.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadByCustomCity = useCallback(
    async (city: string, country: string) => {
      const cleanCity = city.trim();
      const cleanCountry = country.trim();
      if (!cleanCity || !cleanCountry) {
        setError('Please enter both a city name and a country name.');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
            cleanCity
          )}&country=${encodeURIComponent(cleanCountry)}&method=1&school=1`,
          { signal: controller.signal }
        );
        window.clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`Could not find prayer times for "${cleanCity}, ${cleanCountry}".`);
        }

        const json = await res.json();
        const data = json?.data;
        if (!data || !data.timings) {
          throw new Error(`No prayer schedule found for "${cleanCity}, ${cleanCountry}".`);
        }

        let lat: number | null = data.meta?.latitude ?? null;
        let lng: number | null = data.meta?.longitude ?? null;

        // If Aladhan returned its placeholder coords, resolve accurate coords via Nominatim for Qibla
        if (isPlaceholderCoords(lat, lng)) {
          lat = null;
          lng = null;
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                `${cleanCity}, ${cleanCountry}`
              )}&format=json&limit=1`
            );
            if (geoRes.ok) {
              const geoJson = await geoRes.json();
              if (Array.isArray(geoJson) && geoJson[0]?.lat && geoJson[0]?.lon) {
                lat = parseFloat(geoJson[0].lat);
                lng = parseFloat(geoJson[0].lon);
              }
            }
          } catch {
            // Optional geocoder lookup; handled cleanly below if null
          }
        }

        const qiblaDeg =
          lat !== null && lng !== null ? await fetchQiblaDegrees(lat, lng) : null;

        const hijri = data.date?.hijri;
        const greg = data.date?.gregorian;

        setPrayerData({
          timings: {
            Fajr: stripTimezoneSuffix(data.timings.Fajr),
            Sunrise: stripTimezoneSuffix(data.timings.Sunrise),
            Dhuhr: stripTimezoneSuffix(data.timings.Dhuhr),
            Asr: stripTimezoneSuffix(data.timings.Asr),
            Maghrib: stripTimezoneSuffix(data.timings.Maghrib),
            Isha: stripTimezoneSuffix(data.timings.Isha),
          },
          hijriFormatted: hijri
            ? `${hijri.day} ${hijri.month?.en || ''} ${hijri.year} ${hijri.designation?.abbreviated || 'AH'}`
            : 'Unavailable',
          hijriWeekday: hijri?.weekday?.en || '',
          gregorianFormatted: greg?.date
            ? `${greg.weekday?.en || ''}, ${greg.day} ${greg.month?.en || ''} ${greg.year}`
            : '',
          timezone: data.meta?.timezone || 'UTC',
          locationLabel: `${cleanCity}, ${cleanCountry}`,
          latitude: lat,
          longitude: lng,
          qiblaDegrees: qiblaDeg,
          methodName: data.meta?.method?.name || 'University of Islamic Sciences, Karachi',
          schoolName: data.meta?.school === 'HANAFI' ? 'Hanafi' : data.meta?.school || 'Hanafi',
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.name === 'AbortError'
            ? 'Request timed out while fetching prayer times. Please try again.'
            : err instanceof Error
            ? err.message
            : 'Unable to fetch city prayer times.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial load for Okara, Pakistan
  useEffect(() => {
    loadByCoordinates(defaultCity.latitude, defaultCity.longitude, defaultCity.label);
  }, [defaultCity, loadByCoordinates]);

  const handlePresetChange = (id: string) => {
    setSelectedPresetId(id);
    if (id === 'custom') return;
    const match = PRESET_CITIES.find((c) => c.id === id);
    if (match) {
      loadByCoordinates(match.latitude, match.longitude, match.label);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadByCustomCity(customCity, customCountry);
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser. Please select a city manually.');
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setSelectedPresetId('gps');
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        loadByCoordinates(lat, lng, `My Current Location (${lat}°, ${lng}°)`);
      },
      (geoErr) => {
        setIsLocating(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError('Location permission was denied. Allow location access or choose a city from the list.');
        } else {
          setError('Could not determine your GPS location. Please choose a city manually.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleResetToDefault = () => {
    setSelectedPresetId(defaultCity.id);
    setCustomCity('');
    setCustomCountry('');
    loadByCoordinates(defaultCity.latitude, defaultCity.longitude, defaultCity.label);
  };

  // Compute Next Prayer + live countdown in the selected city's timezone
  const nextPrayerInfo = useMemo(() => {
    if (!prayerData) return null;
    const { seconds: nowSec, clock12 } = getSecondsSinceMidnightInZone(prayerData.timezone, now);

    let nextPrayer: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' = 'Fajr';
    let remainingSeconds = 0;

    let foundToday = false;
    for (const key of OBLIGATORY_PRAYERS) {
      const prayerSec = parseTimeToSeconds(prayerData.timings[key]);
      if (prayerSec > nowSec) {
        nextPrayer = key;
        remainingSeconds = prayerSec - nowSec;
        foundToday = true;
        break;
      }
    }

    if (!foundToday) {
      const fajrSec = parseTimeToSeconds(prayerData.timings.Fajr);
      nextPrayer = 'Fajr';
      remainingSeconds = 86400 - nowSec + fajrSec;
    }

    return {
      nextPrayer,
      countdown: formatCountdown(remainingSeconds),
      targetTime12: formatTo12Hour(prayerData.timings[nextPrayer]),
      localClock12: clock12,
    };
  }, [prayerData, now]);

  const prayerCards: Array<{
    key: PrayerKey;
    label: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = [
    { key: 'Fajr', label: 'Fajr', subtitle: 'Dawn prayer', icon: <Moon className="h-4 w-4 text-indigo-600" aria-hidden="true" /> },
    { key: 'Sunrise', label: 'Sunrise', subtitle: 'Fajr window ends', icon: <Sunrise className="h-4 w-4 text-amber-500" aria-hidden="true" /> },
    { key: 'Dhuhr', label: 'Dhuhr', subtitle: 'Midday prayer', icon: <Sun className="h-4 w-4 text-amber-600" aria-hidden="true" /> },
    { key: 'Asr', label: 'Asr', subtitle: 'Hanafi late afternoon', icon: <Sun className="h-4 w-4 text-orange-600" aria-hidden="true" /> },
    { key: 'Maghrib', label: 'Maghrib', subtitle: 'Sunset prayer', icon: <Sunset className="h-4 w-4 text-rose-600" aria-hidden="true" /> },
    { key: 'Isha', label: 'Isha', subtitle: 'Night prayer', icon: <Moon className="h-4 w-4 text-slate-700" aria-hidden="true" /> },
  ];

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Age Calculator',
      path: '/age-calculator',
      description: 'Check exact age in years, Hijri date & Desi/Bikrami calendar.',
      icon: '🎂',
    },
    {
      name: 'YouTube Player',
      path: '/youtube-player',
      description: 'Watch Islamic lectures and Quran recitations distraction-free.',
      icon: '📺',
    },
    {
      name: 'YouTube to MP3',
      path: '/youtube-to-mp3',
      description: 'Save audio lectures and nasheeds in 320 kbps MP3.',
      icon: '🎵',
    },
    {
      name: 'All Tools Directory',
      path: '/tools',
      description: 'Browse all free browser utilities and calculators.',
      icon: '🛠️',
    },
  ];

  return (
    <ToolLayout
      toolPath="/prayer-times"
      title="Prayer Times & Qibla Direction"
      badgeText="Karachi Method · Hanafi Asr"
      badgeIcon={<Compass className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />}
      description="View daily Salah times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha), live countdown to the next prayer, Islamic Hijri date, and accurate Qibla direction in degrees for Okara, Pakistan or any city worldwide."
      howItWorks={{
        heading: 'How Prayer Times & Qibla Calculation Works',
        text: 'Timings are fetched directly from the Aladhan API configured to the University of Islamic Sciences, Karachi (Method 1) and the Hanafi Asr juristic school, paired with Qibla great-circle bearing toward Makkah.',
        steps: [
          {
            number: 1,
            title: 'Select City or Use GPS',
            description:
              'Start with Okara, Pakistan by default, choose another city from the list, search any city globally, or tap Use My Location.',
          },
          {
            number: 2,
            title: 'Track Next Salah Live',
            description:
              'See all six daily timings with your next obligatory prayer highlighted automatically and counting down second-by-second.',
          },
          {
            number: 3,
            title: 'Check Qibla Bearing & Hijri Date',
            description:
              'Read the exact Qibla compass angle in degrees from True North alongside today’s Hijri Islamic calendar date.',
          },
        ],
      }}
      supportedFormats={[
        {
          format: 'Calculation Method',
          description: 'University of Islamic Sciences, Karachi (Method 1: Fajr 18°, Isha 18°).',
        },
        {
          format: 'Asr Juristic School',
          description: 'Hanafi (School 1: shadow factor 2x object height + noon shadow).',
        },
        {
          format: 'Qibla Direction',
          description: 'Exact great-circle azimuth in degrees clockwise from True North toward Kaaba.',
        },
        {
          format: 'Hijri Date',
          description: 'Displays today’s Islamic Hijri month, day, and year synced with prayer timings.',
        },
      ]}
      tips={[
        'When using "Use my location", your GPS coordinates are only sent to Aladhan to calculate local timings and Qibla angle—nothing is stored by YouTikTools.',
        'Need to compare another Pakistani city or travel destination? Switch cities anytime or enter a custom City and Country.',
      ]}
      faqs={[
        {
          question: 'Which calculation method and Asr juristic school are used?',
          answer:
            'This tool uses the University of Islamic Sciences, Karachi calculation method (Fajr 18 degrees, Isha 18 degrees) and the Hanafi juristic school for Asr time—the standard across Pakistan and South Asia.',
        },
        {
          question: 'How is the Qibla direction measured?',
          answer:
            'Qibla is shown in degrees clockwise from True North (where 0° is North, 90° is East, 180° is South, and 270° is West). For example, in Okara, Pakistan, Qibla points approximately 260.8° (West-Southwest).',
        },
        {
          question: 'Why is Sunrise included in the schedule?',
          answer:
            'Sunrise marks the end of the Fajr prayer window and the start of the brief sunrise interval before Ishraq/Dhuhr, helping you plan morning prayers accurately.',
        },
        {
          question: 'What if the API cannot find my city or location permission is denied?',
          answer:
            'You can select from over 20 preset cities instantly, enter another nearby city and country name, or click Reset to Okara to restore a verified location anytime.',
        },
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div className="space-y-6">
        {/* Location Controls */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-6">
              <label
                htmlFor="prayer-city-select"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Select City
              </label>
              <select
                id="prayer-city-select"
                value={selectedPresetId}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus:border-red-600 cursor-pointer"
              >
                {PRESET_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
                <option value="custom">Other City (Enter Custom City & Country)...</option>
                {selectedPresetId === 'gps' && (
                  <option value="gps">Current GPS Location</option>
                )}
              </select>
            </div>

            <div className="md:col-span-6 flex flex-wrap sm:flex-nowrap gap-2">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating || isLoading}
                className="flex-1 h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <Navigation className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isLoading}
                className="h-11 px-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                title="Reset to Okara, Pakistan"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>Okara</span>
              </button>
            </div>
          </div>

          {selectedPresetId === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-200">
              <div className="sm:col-span-5">
                <label htmlFor="custom-city-input" className="block text-[11px] font-bold text-slate-600 mb-1">
                  City
                </label>
                <input
                  id="custom-city-input"
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="e.g. Bahawalpur"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                />
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="custom-country-input" className="block text-[11px] font-bold text-slate-600 mb-1">
                  Country
                </label>
                <input
                  id="custom-country-input"
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  placeholder="e.g. Pakistan"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                />
              </div>
              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Load Times</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Graceful Error State */}
        {error && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 font-bold text-xs hover:bg-red-100 shrink-0 cursor-pointer"
            >
              Reset to Okara, Pakistan
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !prayerData && (
          <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
            <RefreshCw className="h-6 w-6 text-emerald-600 animate-spin mx-auto" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-700">Loading prayer times and Hijri date...</p>
          </div>
        )}

        {/* Active Prayer Times Dashboard */}
        {prayerData && nextPrayerInfo && (
          <>
            {/* Top Summary Banner: Next Prayer Countdown + Hijri Date */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-slate-900 text-white space-y-4 flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                    <span>{prayerData.locationLabel}</span>
                  </span>
                  <span className="font-mono text-slate-300">
                    Local time: {nextPrayerInfo.localClock12} ({prayerData.timezone})
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Next Prayer · {nextPrayerInfo.targetTime12}
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-0.5">
                      {nextPrayerInfo.nextPrayer}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Time Remaining
                    </div>
                    <div className="text-3xl sm:text-4xl font-mono font-extrabold tabular-nums text-emerald-400 mt-0.5">
                      {nextPrayerInfo.countdown}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Hijri: {prayerData.hijriFormatted}</span>
                  </span>
                  {prayerData.gregorianFormatted && (
                    <span className="text-slate-400">{prayerData.gregorianFormatted}</span>
                  )}
                </div>
              </div>

              {/* Qibla Direction Card */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col items-center justify-between text-center space-y-3">
                <div className="w-full flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Qibla Direction</span>
                  <Compass className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                </div>

                {prayerData.qiblaDegrees !== null ? (
                  <>
                    {/* Compass Graphic */}
                    <div className="relative w-24 h-24 rounded-full bg-white border-2 border-emerald-300 shadow-2xs flex items-center justify-center">
                      <span className="absolute top-1 text-[9px] font-bold text-slate-500">N</span>
                      <span className="absolute right-1.5 text-[9px] font-bold text-slate-400">E</span>
                      <span className="absolute bottom-1 text-[9px] font-bold text-slate-400">S</span>
                      <span className="absolute left-1.5 text-[9px] font-bold text-slate-400">W</span>
                      <svg
                        viewBox="0 0 64 64"
                        className="w-16 h-16 transition-transform duration-500"
                        style={{ transform: `rotate(${prayerData.qiblaDegrees}deg)` }}
                        aria-hidden="true"
                      >
                        <polygon points="32,6 38,32 32,27 26,32" fill="#059669" />
                        <polygon points="32,58 36,32 32,37 28,32" fill="#cbd5e1" />
                        <circle cx="32" cy="32" r="3" fill="#0f172a" />
                      </svg>
                    </div>

                    <div>
                      <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-950">
                        {prayerData.qiblaDegrees.toFixed(1)}° {getCompassCardinal(prayerData.qiblaDegrees)}
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Clockwise from True North
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-emerald-800 py-6">
                    Qibla bearing unavailable for this custom city name. Try GPS or a nearby preset city.
                  </p>
                )}
              </div>
            </div>

            {/* 6 Prayer Timing Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {prayerCards.map((item) => {
                const rawTime = prayerData.timings[item.key];
                const isNext = nextPrayerInfo.nextPrayer === item.key;
                return (
                  <div
                    key={item.key}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-2 ${
                      isNext
                        ? 'bg-red-50 border-red-300 ring-2 ring-red-500/20 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-extrabold ${
                          isNext ? 'text-red-700' : 'text-slate-900'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.icon}
                    </div>

                    <div>
                      <div
                        className={`text-lg sm:text-xl font-extrabold font-mono tabular-nums ${
                          isNext ? 'text-red-700' : 'text-slate-900'
                        }`}
                      >
                        {formatTo12Hour(rawTime)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {rawTime} (24h)
                      </div>
                    </div>

                    <div className="text-[11px] font-medium text-slate-600">
                      {isNext ? (
                        <span className="inline-flex items-center gap-1 text-red-700 font-bold">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <span>Next Prayer</span>
                        </span>
                      ) : (
                        item.subtitle
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculation Metadata Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
              <span>
                Method: <strong className="text-slate-700">{prayerData.methodName}</strong> · School:{' '}
                <strong className="text-slate-700">{prayerData.schoolName}</strong>
              </span>
              {prayerData.latitude !== null && prayerData.longitude !== null && (
                <span className="font-mono text-[11px]">
                  {prayerData.latitude.toFixed(4)}°, {prayerData.longitude.toFixed(4)}°
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
};
