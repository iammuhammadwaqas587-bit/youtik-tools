import React, { useState, useMemo } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Map,
  Copy,
  Check,
  RotateCcw,
  Ruler,
  Banknote,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import {
  LAND_AREA_UNITS,
  type LandAreaUnitId,
  type MarlaStandardSqFt,
  convertLandAreaToAll,
  formatAreaNumber,
  formatPkrAmount,
  formatPkrInLakhCroreWords,
  getSqFtPerUnit,
} from '../utils/landAreaCalculation';

interface LandAreaConverterPageProps {
  onNavigate: (path: string) => void;
}

export const LandAreaConverterPage: React.FC<LandAreaConverterPageProps> = ({
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

  // Main converter state
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<LandAreaUnitId>('kanal');
  const [marlaSize, setMarlaSize] = useState<MarlaStandardSqFt>(272.25);

  // Plot size helper state
  const [plotLength, setPlotLength] = useState<string>('50');
  const [plotWidth, setPlotWidth] = useState<string>('90');
  const [plotDimUnit, setPlotDimUnit] = useState<'feet' | 'yards'>('feet');

  // Price calculator state
  const [priceRateUnit, setPriceRateUnit] = useState<'marla' | 'kanal'>('marla');
  const [pricePerUnit, setPricePerUnit] = useState<string>('1500000');
  const [priceAreaValue, setPriceAreaValue] = useState<string>('10');
  const [priceAreaUnit, setPriceAreaUnit] = useState<'marla' | 'kanal' | 'sqft'>('marla');

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const numericValue = useMemo(() => {
    const parsed = parseFloat(inputValue);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }, [inputValue]);

  const conversion = useMemo(
    () => convertLandAreaToAll(numericValue, fromUnit, marlaSize),
    [numericValue, fromUnit, marlaSize]
  );

  // Plot Size Helper calculation
  const plotHelperResult = useMemo(() => {
    const len = parseFloat(plotLength);
    const wid = parseFloat(plotWidth);
    const safeLen = Number.isFinite(len) && len >= 0 ? len : 0;
    const safeWid = Number.isFinite(wid) && wid >= 0 ? wid : 0;
    const rawArea = safeLen * safeWid;
    const sqFt = plotDimUnit === 'yards' ? rawArea * 9 : rawArea;
    const sqYd = sqFt / 9;
    const marlas = sqFt / marlaSize;
    const kanals = sqFt / (marlaSize * 20);
    return { sqFt, sqYd, marlas, kanals };
  }, [plotLength, plotWidth, plotDimUnit, marlaSize]);

  // Price Calculator math
  const priceResult = useMemo(() => {
    const rate = parseFloat(pricePerUnit);
    const area = parseFloat(priceAreaValue);
    const safeRate = Number.isFinite(rate) && rate >= 0 ? rate : 0;
    const safeArea = Number.isFinite(area) && area >= 0 ? area : 0;

    const sqFt =
      priceAreaUnit === 'sqft'
        ? safeArea
        : safeArea * getSqFtPerUnit(priceAreaUnit, marlaSize);
    const rateUnitSqFt = getSqFtPerUnit(priceRateUnit, marlaSize);
    const unitsForRate = sqFt / rateUnitSqFt;
    const totalCostPkr = unitsForRate * safeRate;
    const words = formatPkrInLakhCroreWords(totalCostPkr);

    return {
      sqFt,
      marlas: sqFt / marlaSize,
      kanals: sqFt / (marlaSize * 20),
      totalCostPkr,
      formattedPkr: formatPkrAmount(totalCostPkr),
      words,
    };
  }, [pricePerUnit, priceRateUnit, priceAreaValue, priceAreaUnit, marlaSize]);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      window.setTimeout(() => setCopiedId((prev) => (prev === key ? null : prev)), 1800);
    } catch {
      // Fallback ignored gracefully
    }
  };

  const handleReset = () => {
    setInputValue('1');
    setFromUnit('kanal');
    setMarlaSize(272.25);
    setPlotLength('50');
    setPlotWidth('90');
    setPlotDimUnit('feet');
    setPriceRateUnit('marla');
    setPricePerUnit('1500000');
    setPriceAreaValue('10');
    setPriceAreaUnit('marla');
  };

  const handleCopyAll = () => {
    const lines = conversion.rows.map(
      (row) => `${row.unit.name}: ${row.formatted} ${row.unit.shortLabel}`
    );
    const summary = `${numericValue} ${
      LAND_AREA_UNITS.find((u) => u.id === fromUnit)?.name || fromUnit
    } (Marla = ${marlaSize} sq ft):\n${lines.join('\n')}`;
    handleCopy('all', summary);
  };

  const quickRefRows = [
    { unit: '1 Sarsai', standard: '30.25 sq ft', society: '25 sq ft', relation: '1/9 Marla (3.36 / 2.78 sq yd)' },
    { unit: '1 Marla', standard: '272.25 sq ft', society: '225 sq ft', relation: '9 Sarsai · 30.25 / 25 sq yd' },
    { unit: '1 Kanal', standard: '5,445 sq ft', society: '4,500 sq ft', relation: '20 Marla · 605 / 500 sq yd' },
    { unit: '1 Bigha (Punjab)', standard: '21,780 sq ft', society: '21,780 sq ft', relation: '4 standard Kanals · 0.5 Acre' },
    { unit: '1 Jarib', standard: '21,780 sq ft', society: '21,780 sq ft', relation: '4 standard Kanals · 0.5 Acre' },
    { unit: '1 Acre / 1 Killa', standard: '43,560 sq ft', society: '43,560 sq ft', relation: '8 standard Kanals · 160 std Marla' },
    { unit: '1 Murabba', standard: '1,089,000 sq ft', society: '1,089,000 sq ft', relation: '25 Acres (25 Killa)' },
    { unit: '1 Hectare', standard: '107,639 sq ft', society: '107,639 sq ft', relation: '10,000 sq m · ~2.471 Acres' },
  ];

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Gold Rate Calculator',
      path: '/gold-calculator',
      description: 'Convert Tola, Masha, Ratti & Gram and calculate jewellery cost.',
      icon: '🪙',
    },
    {
      name: 'Age Calculator',
      path: '/age-calculator',
      description: 'Exact age in years, Hijri & Desi/Bikrami dates.',
      icon: '🎂',
    },
    {
      name: 'Prayer Times & Qibla',
      path: '/prayer-times',
      description: 'Karachi Hanafi Salah timings and Qibla compass degrees.',
      icon: '🕌',
    },
    {
      name: 'QR Code Generator',
      path: '/qr-code-generator',
      description: 'Create custom QR codes for property links and contacts.',
      icon: '📱',
    },
  ];

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

  return (
    <ToolLayout
      toolPath="/land-area-converter"
      title="Land Area Converter (Marla, Kanal, Acre, Sq Ft)"
      badgeText="Pakistan Revenue & Society Units"
      badgeIcon={<Map className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />}
      description="Convert land measurements instantly across Square Feet, Square Yards, Square Meters, Sarsai, Marla, Kanal, Acre, Killa, Murabba, Hectare, Bigha (Punjab), and Jarib—with 272.25 vs 225 sq ft Marla support, Plot Size Helper, and PKR Price Calculator."
      howItWorks={{
        heading: 'How Pakistan Land Measurement Units Connect',
        text: 'All twelve regional, revenue, imperial, and metric units convert through exact Square Feet equivalents in your browser—handling both Punjab Revenue standard Marla (272.25 sq ft) and Urban Housing Society Marla (225 sq ft).',
        steps: [
          {
            number: 1,
            title: 'Select Marla Size',
            description:
              'Keep 272.25 sq ft for Punjab Land Revenue (PLRA/Patwari) records, or toggle 225 sq ft for DHA and urban housing societies.',
          },
          {
            number: 2,
            title: 'Enter Area Value',
            description:
              'Type any decimal or whole number and choose the source unit to inspect all 12 converted measurements side by side.',
          },
          {
            number: 3,
            title: 'Verify Plot Size & Price',
            description:
              'Calculate Marla/Kanal directly from plot dimensions (length × width) and estimate total PKR cost in Lakh and Crore.',
          },
        ],
      }}
      supportedFormats={[
        { format: 'Punjab Standard Marla', description: '1 Marla = 272.25 sq ft (9 Sarsai); 1 Kanal = 20 Marla = 5,445 sq ft.' },
        { format: 'Society Marla (225 sq ft)', description: '1 Marla = 225 sq ft (25 sq yd); 1 Kanal = 20 Marla = 4,500 sq ft.' },
        { format: 'Agricultural Units', description: '1 Acre = 1 Killa = 43,560 sq ft; 1 Murabba = 25 Acres; 1 Bigha (Punjab) = 4 Kanals.' },
        { format: 'Metric & Imperial', description: '1 sq yd = 9 sq ft; 1 sq m = 10.7639 sq ft; 1 Hectare = 107,639 sq ft.' },
      ]}
      tips={[
        'Always verify whether a housing scheme prices residential plots using a 225 sq ft Marla (9 Marla = 2,025 sq ft) or a 272.25 sq ft Marla before signing bayana agreements.',
        'For agricultural tracts in Punjab, 1 Killa equals 1 Acre (8 Kanals = 160 standard Marlas), and 25 Killay make 1 Murabba.',
      ]}
      faqs={[
        {
          question: 'How many square feet are in 1 Marla?',
          answer:
            'Under the official Punjab Land Revenue standard (Patwari/Fard records), 1 Marla equals 272.25 square feet (30.25 square yards). However, several modern housing societies such as DHA use a 225 square feet (25 square yards) Marla. Use the Marla Size toggle above to switch between both standards.',
        },
        {
          question: 'How many Marlas make 1 Kanal and 1 Acre?',
          answer:
            'There are 20 Marlas in 1 Kanal (5,445 sq ft at 272.25 sq ft/marla, or 4,500 sq ft at 225 sq ft/marla). Under standard measurements, 8 Kanals (160 Marlas) make 1 Acre or 1 Killa (43,560 sq ft).',
        },
        {
          question: 'What is 1 Sarsai, Bigha, and Murabba in square feet?',
          answer:
            'In Punjab land records, 1 Sarsai equals 30.25 sq ft (1/9th of a standard Marla), 1 Punjab Bigha (and traditional Jarib) equals 4 Kanals or 21,780 sq ft (half an acre), and 1 Murabba equals 25 Acres (1,089,000 sq ft).',
        },
        {
          question: 'Why does Marla size vary between areas in Pakistan?',
          answer:
            'British-era and revenue records settled on 272.25 sq ft per Marla from a 5.5-foot Karam (30.25 sq yd). Urban private developers later adopted a rounded 225 sq ft (25 sq yd) Marla for grid planning such as 25×45 ft (5 Marla) and 35×65 ft (10 Marla) plots.',
        },
      ]}
      relatedTools={relatedTools}
      onNavigate={onNavigate}
      showResponsibleUse={false}
    >
      <div
        className={`rounded-2xl border p-4 sm:p-6 space-y-8 transition-colors ${workspaceShell}`}
        style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
      >
        {/* Top Bar: Marla Standard Toggle + Theme & Reset */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold ${labelText}`}>Marla Size Standard:</span>
              <div
                className={`inline-flex rounded-xl p-1 border ${
                  isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}
                role="group"
                aria-label="Marla size in square feet"
              >
                <button
                  type="button"
                  onClick={() => setMarlaSize(272.25)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    marlaSize === 272.25
                      ? 'bg-red-600 text-white shadow-2xs'
                      : `${labelText} hover:bg-slate-100/60`
                  }`}
                >
                  272.25 sq ft (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setMarlaSize(225)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    marlaSize === 225
                      ? 'bg-red-600 text-white shadow-2xs'
                      : `${labelText} hover:bg-slate-100/60`
                  }`}
                >
                  225 sq ft (DHA / Societies)
                </button>
              </div>
            </div>
            <p className={`flex items-start gap-1.5 text-[11px] ${mutedText}`}>
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
              <span>
                Marla size differs by area: Punjab Land Revenue & rural fard records use{' '}
                <strong>272.25 sq ft</strong>, while housing schemes like DHA often use{' '}
                <strong>225 sq ft</strong> (25 sq yd).
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => setIsDarkTheme((prev) => !prev)}
              aria-label={isDarkTheme ? 'Switch converter to light mode' : 'Switch converter to dark mode'}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
            >
              {isDarkTheme ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 1. Main Converter Inputs + All-Units Live Table */}
        <section aria-labelledby="land-conv-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="land-conv-heading" className="text-sm sm:text-base font-extrabold">
              1. Convert Any Area Into All Units Simultaneously
            </h2>
            <button
              type="button"
              onClick={handleCopyAll}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${cardSurface}`}
            >
              {copiedId === 'all' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied All</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy All Results</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label htmlFor="land-value-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                Enter Value
              </label>
              <input
                id="land-value-input"
                type="number"
                min={0}
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. 5"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono font-bold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${inputSurface}`}
              />
            </div>

            <div className="sm:col-span-7">
              <label htmlFor="land-from-unit" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                From Unit
              </label>
              <select
                id="land-from-unit"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as LandAreaUnitId)}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 cursor-pointer ${inputSurface}`}
              >
                {LAND_AREA_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.note})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* All 12 Units Result Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {conversion.rows.map((row) => {
              const isSelected = row.unit.id === fromUnit;
              return (
                <div
                  key={row.unit.id}
                  className={`rounded-xl border p-3.5 flex items-center justify-between gap-2 transition-colors ${
                    isSelected
                      ? isDarkTheme
                        ? 'bg-red-950/40 border-red-700'
                        : 'bg-red-50 border-red-300'
                      : cardSurface
                  }`}
                >
                  <div className="min-w-0">
                    <div className={`text-xs font-bold ${isSelected ? 'text-red-600' : labelText}`}>
                      {row.unit.name}
                    </div>
                    <div className="text-base sm:text-lg font-extrabold font-mono tabular-nums truncate mt-0.5">
                      {row.formatted}
                    </div>
                    <div className={`text-[10px] ${mutedText}`}>{row.unit.note}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(row.unit.id, `${row.formatted} ${row.unit.name}`)}
                    aria-label={`Copy ${row.unit.name} value`}
                    className={`p-2 rounded-lg border text-xs shrink-0 cursor-pointer transition-colors ${
                      isDarkTheme
                        ? 'border-slate-600 hover:bg-slate-700 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                    title={`Copy ${row.unit.name}`}
                  >
                    {copiedId === row.unit.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Plot Size Helper */}
        <section
          aria-labelledby="plot-helper-heading"
          className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <h2 id="plot-helper-heading" className="text-sm sm:text-base font-extrabold">
                2. Plot Size Helper (Length × Width to Marla & Kanal)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setInputValue(String(Number(plotHelperResult.marlas.toFixed(4))));
                setFromUnit('marla');
              }}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Use Plot Area in Main Converter →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="plot-length" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Plot Length
              </label>
              <input
                id="plot-length"
                type="number"
                min={0}
                step="any"
                value={plotLength}
                onChange={(e) => setPlotLength(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
              />
            </div>

            <div>
              <label htmlFor="plot-width" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Plot Width
              </label>
              <input
                id="plot-width"
                type="number"
                min={0}
                step="any"
                value={plotWidth}
                onChange={(e) => setPlotWidth(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
              />
            </div>

            <div>
              <label htmlFor="plot-dim-unit" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Dimension Unit
              </label>
              <select
                id="plot-dim-unit"
                value={plotDimUnit}
                onChange={(e) => setPlotDimUnit(e.target.value as 'feet' | 'yards')}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-semibold cursor-pointer ${inputSurface}`}
              >
                <option value="feet">Feet (ft)</option>
                <option value="yards">Yards / Gaz (yd)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[11px] font-semibold ${mutedText}`}>Marla ({marlaSize} sq ft)</div>
              <div className="text-lg font-extrabold font-mono tabular-nums text-red-600 mt-0.5">
                {formatAreaNumber(plotHelperResult.marlas)}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[11px] font-semibold ${mutedText}`}>Kanal</div>
              <div className="text-lg font-extrabold font-mono tabular-nums mt-0.5">
                {formatAreaNumber(plotHelperResult.kanals)}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[11px] font-semibold ${mutedText}`}>Square Feet</div>
              <div className="text-lg font-extrabold font-mono tabular-nums mt-0.5">
                {formatAreaNumber(plotHelperResult.sqFt)}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[11px] font-semibold ${mutedText}`}>Square Yards (Gaj)</div>
              <div className="text-lg font-extrabold font-mono tabular-nums mt-0.5">
                {formatAreaNumber(plotHelperResult.sqYd)}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Plot Price Calculator (PKR + Lakh / Crore words) */}
        <section
          aria-labelledby="price-calc-heading"
          className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <h2 id="price-calc-heading" className="text-sm sm:text-base font-extrabold">
                3. Land Price Calculator (PKR · Lakh & Crore)
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'price',
                  `${priceResult.formattedPkr} (${priceResult.words.fullWords}) for ${priceAreaValue} ${priceAreaUnit}`
                )
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${cardSurface}`}
            >
              {copiedId === 'price' ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Price</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label htmlFor="price-rate-unit" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Rate Type
              </label>
              <select
                id="price-rate-unit"
                value={priceRateUnit}
                onChange={(e) => setPriceRateUnit(e.target.value as 'marla' | 'kanal')}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-semibold cursor-pointer ${inputSurface}`}
              >
                <option value="marla">Price per Marla</option>
                <option value="kanal">Price per Kanal</option>
              </select>
            </div>

            <div>
              <label htmlFor="price-per-unit" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Price per {priceRateUnit === 'marla' ? 'Marla' : 'Kanal'} (PKR)
              </label>
              <input
                id="price-per-unit"
                type="number"
                min={0}
                step="any"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
              />
            </div>

            <div>
              <label htmlFor="price-plot-size" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Plot Size
              </label>
              <input
                id="price-plot-size"
                type="number"
                min={0}
                step="any"
                value={priceAreaValue}
                onChange={(e) => setPriceAreaValue(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
              />
            </div>

            <div>
              <label htmlFor="price-area-unit" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Plot Size Unit
              </label>
              <select
                id="price-area-unit"
                value={priceAreaUnit}
                onChange={(e) => setPriceAreaUnit(e.target.value as 'marla' | 'kanal' | 'sqft')}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-semibold cursor-pointer ${inputSurface}`}
              >
                <option value="marla">Marla ({marlaSize} sq ft)</option>
                <option value="kanal">Kanal ({marlaSize * 20} sq ft)</option>
                <option value="sqft">Square Feet</option>
              </select>
            </div>
          </div>

          <div
            className={`p-4 sm:p-5 rounded-xl border space-y-1.5 ${
              isDarkTheme
                ? 'bg-emerald-950/40 border-emerald-800'
                : 'bg-emerald-50/80 border-emerald-200'
            }`}
          >
            <div className={`text-xs font-bold uppercase tracking-wider ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-800'}`}>
              Estimated Total Plot Cost ({formatAreaNumber(priceResult.marlas)} Marla · {formatAreaNumber(priceResult.kanals)} Kanal)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-600">
              {priceResult.formattedPkr}
            </div>
            <div className={`text-xs sm:text-sm font-bold ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>
              In Words: {priceResult.words.fullWords}{' '}
              <span className={`font-semibold ${mutedText}`}>({priceResult.words.compactScale})</span>
            </div>
          </div>
        </section>

        {/* 4. Quick Reference Table */}
        <section aria-labelledby="quick-ref-heading" className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
          <h2 id="quick-ref-heading" className="text-sm sm:text-base font-extrabold">
            Quick Land Unit Reference Table (Pakistan)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${isDarkTheme ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                  <th className="py-2 pr-3 font-bold">Unit</th>
                  <th className="py-2 pr-3 font-bold">Standard (272.25)</th>
                  <th className="py-2 pr-3 font-bold">Societies / DHA (225)</th>
                  <th className="py-2 font-bold">Equivalent</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkTheme ? 'divide-slate-700/70' : 'divide-slate-100'}`}>
                {quickRefRows.map((row) => (
                  <tr key={row.unit}>
                    <td className="py-2 pr-3 font-bold">{row.unit}</td>
                    <td className="py-2 pr-3 font-mono tabular-nums">{row.standard}</td>
                    <td className="py-2 pr-3 font-mono tabular-nums">{row.society}</td>
                    <td className={`py-2 ${mutedText}`}>{row.relation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
};
