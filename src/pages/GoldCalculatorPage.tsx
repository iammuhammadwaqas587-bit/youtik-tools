import React, { useState, useMemo, useEffect } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Coins,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  AlertTriangle,
  Scale,
  Calculator,
} from 'lucide-react';
import {
  GOLD_WEIGHT_UNITS,
  GOLD_PURITY_MAP,
  type GoldWeightUnitId,
  type GoldKarat,
  type WastageMode,
  type MakingChargeMode,
  convertGoldWeightToAll,
  calculateJewelleryCost,
  formatRsMoney,
} from '../utils/goldCalculation';

interface GoldCalculatorPageProps {
  onNavigate: (path: string) => void;
}

const RATE_STORAGE_KEY = 'youtiktools_gold_24k_tola_rate_v1';
const DEFAULT_24K_TOLA_RATE = '278000';

export const GoldCalculatorPage: React.FC<GoldCalculatorPageProps> = ({
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

  // Saved 24K Rate per Tola (PKR)
  const [rate24KStr, setRate24KStr] = useState<string>(() => {
    try {
      const saved =
        typeof window !== 'undefined' && window.localStorage
          ? window.localStorage.getItem(RATE_STORAGE_KEY)
          : null;
      if (saved && /^\d+(\.\d+)?$/.test(saved)) return saved;
    } catch {
      // Ignore storage access errors
    }
    return DEFAULT_24K_TOLA_RATE;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && rate24KStr.trim()) {
        window.localStorage.setItem(RATE_STORAGE_KEY, rate24KStr.trim());
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [rate24KStr]);

  // Weight Converter & Gold Price state
  const [weightStr, setWeightStr] = useState<string>('1');
  const [weightUnit, setWeightUnit] = useState<GoldWeightUnitId>('tola');
  const [selectedKarat, setSelectedKarat] = useState<GoldKarat>('22K');

  // Jewellery extra cost state
  const [wastageMode, setWastageMode] = useState<WastageMode>('percent');
  const [wastageStr, setWastageStr] = useState<string>('5');
  const [makingMode, setMakingMode] = useState<MakingChargeMode>('perTola');
  const [makingStr, setMakingStr] = useState<string>('4000');
  const [stoneCostStr, setStoneCostStr] = useState<string>('0');
  const [gstPercentStr, setGstPercentStr] = useState<string>('0');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const numericWeight = useMemo(() => {
    const n = parseFloat(weightStr);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [weightStr]);

  const numericRate24K = useMemo(() => {
    const n = parseFloat(rate24KStr);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [rate24KStr]);

  const weightConversion = useMemo(
    () => convertGoldWeightToAll(numericWeight, weightUnit),
    [numericWeight, weightUnit]
  );

  const jewellery = useMemo(
    () =>
      calculateJewelleryCost({
        weight: numericWeight,
        unit: weightUnit,
        karat: selectedKarat,
        rate24KPerTola: numericRate24K,
        wastageMode,
        wastageValue: parseFloat(wastageStr) || 0,
        makingMode,
        makingValue: parseFloat(makingStr) || 0,
        stoneCost: parseFloat(stoneCostStr) || 0,
        gstPercent: parseFloat(gstPercentStr) || 0,
      }),
    [
      numericWeight,
      weightUnit,
      selectedKarat,
      numericRate24K,
      wastageMode,
      wastageStr,
      makingMode,
      makingStr,
      stoneCostStr,
      gstPercentStr,
    ]
  );

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleCopyBreakdown = () => {
    const text = [
      `Gold Jewellery Estimate (${numericWeight} ${weightUnit}, ${selectedKarat})`,
      `24K Tola Rate: ${formatRsMoney(numericRate24K)}`,
      `${selectedKarat} Rate/Tola: ${formatRsMoney(jewellery.karatRates.perTola)}`,
      `${selectedKarat} Rate/Gram: ${formatRsMoney(jewellery.karatRates.perGram)}`,
      `Pure Gold Value: ${formatRsMoney(jewellery.goldValue)}`,
      `Wastage (${jewellery.wastageEffectivePercent.toFixed(2)}%): ${formatRsMoney(jewellery.wastageAmount)}`,
      `Making Charges: ${formatRsMoney(jewellery.makingChargesAmount)}`,
      `Stones: ${formatRsMoney(jewellery.stoneCostAmount)}`,
      `GST / Tax (${parseFloat(gstPercentStr) || 0}%): ${formatRsMoney(jewellery.gstAmount)}`,
      `Final Total: ${formatRsMoney(jewellery.finalTotal)}`,
    ].join('\n');
    handleCopy('breakdown', text);
  };

  const handleReset = () => {
    setWeightStr('1');
    setWeightUnit('tola');
    setSelectedKarat('22K');
    setWastageMode('percent');
    setWastageStr('5');
    setMakingMode('perTola');
    setMakingStr('4000');
    setStoneCostStr('0');
    setGstPercentStr('0');
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Land Area Converter',
      path: '/land-area-converter',
      description: 'Convert Marla, Kanal, Acre & Sq Ft and calculate plot PKR cost.',
      icon: '🗺️',
    },
    {
      name: 'Age Calculator',
      path: '/age-calculator',
      description: 'Calculate exact age, birthday countdown, Hijri & Bikrami dates.',
      icon: '🎂',
    },
    {
      name: 'Prayer Times & Qibla',
      path: '/prayer-times',
      description: 'Daily Salah schedule, countdown & Qibla compass degrees.',
      icon: '🕌',
    },
    {
      name: 'QR Code Generator',
      path: '/qr-code-generator',
      description: 'Create QR codes for invoices, WhatsApp & contact vCards.',
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
      toolPath="/gold-calculator"
      title="Gold Rate Calculator (Tola, Gram, Karat & Jewellery Price)"
      badgeText="Tola · Masha · Ratti · PKR"
      badgeIcon={<Coins className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />}
      description="Convert gold weight across Tola, Masha, Ratti, Gram, Milligram, Troy Ounce, and Kilogram, check per-gram/per-10g/per-tola prices for 24K, 22K, 21K, and 18K gold, and calculate complete jewellery billing with wastage, making charges, stones, and GST."
      howItWorks={{
        heading: 'How Pakistani Gold Weights & Jewellery Pricing Work',
        text: 'Enter today’s local 24K gold rate per Tola once—our calculator remembers it in your browser, converts weights through standard 11.664 g Tola math, scales karat purity accurately, and breaks down every rupee of wastage, making, stones, and tax.',
        steps: [
          {
            number: 1,
            title: 'Enter Today’s 24K Rate',
            description:
              'Type the current 24K gold price in Rs. per Tola. Your last entered rate is saved locally for quick return visits.',
          },
          {
            number: 2,
            title: 'Pick Weight & Karat',
            description:
              'Convert weights across Tola, Masha, Ratti, Gram, Troy Ounce, and KG while inspecting 24K, 22K, 21K, or 18K purity rates.',
          },
          {
            number: 3,
            title: 'Add Making & Wastage',
            description:
              'Include wastage (% or Masha/Tola), making charges, stone cost, and optional GST to verify final jeweller quotes.',
          },
        ],
      }}
      supportedFormats={[
        { format: '1 Tola = 11.664 g', description: 'Equals 12 Masha, 96 Ratti, or 0.375 troy ounces.' },
        { format: '1 Masha = 0.972 g', description: '1/12th of a Tola, commonly used to measure goldsmith wastage (kaat).' },
        { format: '1 Ratti = 0.1215 g', description: '1/8th of a Masha (96 Ratti = 1 Tola).' },
        { format: 'Karat Purities', description: '24K = 100%, 22K = 91.67%, 21K = 87.5%, 18K = 75%.' },
      ]}
      tips={[
        'Remember that 1 Masha wastage per Tola equals 1/12 = 8.33% wastage; asking your jeweller for both Masha and % makes comparing quotes effortless.',
        'Always verify whether stone weight is deducted from gross jewellery weight before paying the gold rate on heavy bridal sets.',
      ]}
      faqs={[
        {
          question: 'How many grams in one tola?',
          answer:
            'In Pakistan and South Asia’s bullion standard, 1 Tola equals exactly 11.664 grams (which equals 12 Masha, 96 Ratti, or roughly 0.375 troy ounces).',
        },
        {
          question: 'What is the difference between 22K and 24K gold?',
          answer:
            '24K gold is pure gold (99.9%+ / 100% purity baseline) used for bars and biscuits, which is too soft for daily jewellery. 22K gold contains 91.67% pure gold (22 out of 24 parts) alloyed with copper or silver for strength in rings, bangles, and bridal sets.',
        },
        {
          question: 'How is the 10-gram and per-gram gold rate calculated?',
          answer:
            'We scale the 24K Tola rate by your chosen karat purity (for example × 0.9167 for 22K), divide by 11.664 to get the per-gram rate, and multiply by 10 to show the standard per-10-gram rate.',
        },
        {
          question: 'How does wastage in Masha per Tola work?',
          answer:
            'Since 1 Tola contains 12 Masha, each Masha of wastage per Tola adds 1/12 (8.33%) of the gold value. For instance, 0.5 Masha per Tola equals 4.17% wastage.',
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
        {/* Top Row: Today's 24K Rate + Light/Dark & Reset */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200/70">
          <div className="flex-1 max-w-sm">
            <label
              htmlFor="gold-24k-rate"
              className={`block text-xs font-bold mb-1.5 ${labelText}`}
            >
              Today&apos;s 24K Gold Rate (PKR per Tola)
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${mutedText}`}>
                Rs.
              </span>
              <input
                id="gold-24k-rate"
                type="number"
                min={0}
                step="any"
                value={rate24KStr}
                onChange={(e) => setRate24KStr(e.target.value)}
                className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-base font-mono font-extrabold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${inputSurface}`}
              />
            </div>
            <p className={`text-[11px] mt-1 ${mutedText}`}>
              Saved automatically in your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsDarkTheme((prev) => !prev)}
              aria-label={isDarkTheme ? 'Switch calculator to light mode' : 'Switch calculator to dark mode'}
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

        {/* 1. Gold Weight Converter (All 7 Units at Once) */}
        <section aria-labelledby="gold-weight-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <h2 id="gold-weight-heading" className="text-sm sm:text-base font-extrabold">
                1. Gold Weight Converter &amp; Karat Rate
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'weights',
                  weightConversion.rows
                    .map((r) => `${r.unit.name}: ${r.formatted} ${r.unit.shortLabel}`)
                    .join('\n')
                )
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${cardSurface}`}
            >
              {copiedKey === 'weights' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Weights</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="gold-weight-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                Weight
              </label>
              <input
                id="gold-weight-input"
                type="number"
                min={0}
                step="any"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-mono font-bold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${inputSurface}`}
              />
            </div>

            <div>
              <label htmlFor="gold-weight-unit" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                Weight Unit
              </label>
              <select
                id="gold-weight-unit"
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as GoldWeightUnitId)}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-semibold cursor-pointer ${inputSurface}`}
              >
                {GOLD_WEIGHT_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.note})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gold-karat-select" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                Gold Purity (Karat)
              </label>
              <select
                id="gold-karat-select"
                value={selectedKarat}
                onChange={(e) => setSelectedKarat(e.target.value as GoldKarat)}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm font-semibold cursor-pointer ${inputSurface}`}
              >
                {(['24K', '22K', '21K', '18K'] as GoldKarat[]).map((k) => (
                  <option key={k} value={k}>
                    {GOLD_PURITY_MAP[k].label} — {GOLD_PURITY_MAP[k].percentageLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* All 7 Weight Conversions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {weightConversion.rows.map((row) => {
              const isSelected = row.unit.id === weightUnit;
              return (
                <div
                  key={row.unit.id}
                  className={`rounded-xl border p-3 text-center space-y-0.5 ${
                    isSelected
                      ? isDarkTheme
                        ? 'bg-amber-950/50 border-amber-700'
                        : 'bg-amber-50 border-amber-300'
                      : cardSurface
                  }`}
                >
                  <div className={`text-[11px] font-bold ${isSelected ? 'text-amber-600' : labelText}`}>
                    {row.unit.name}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono tabular-nums truncate">
                    {row.formatted}
                  </div>
                  <div className={`text-[10px] ${mutedText}`}>{row.unit.shortLabel}</div>
                </div>
              );
            })}
          </div>

          {/* Per-Tola, Per-10g, Per-Gram & Bullion Value Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className={`rounded-xl border p-3.5 space-y-0.5 ${cardSurface}`}>
              <div className={`text-[11px] font-semibold ${mutedText}`}>
                {selectedKarat} Per Tola (11.664 g)
              </div>
              <div className="text-base sm:text-lg font-extrabold font-mono tabular-nums">
                {formatRsMoney(jewellery.karatRates.perTola)}
              </div>
            </div>
            <div className={`rounded-xl border p-3.5 space-y-0.5 ${cardSurface}`}>
              <div className={`text-[11px] font-semibold ${mutedText}`}>
                {selectedKarat} Per 10 Grams
              </div>
              <div className="text-base sm:text-lg font-extrabold font-mono tabular-nums">
                {formatRsMoney(jewellery.karatRates.per10Gram)}
              </div>
            </div>
            <div className={`rounded-xl border p-3.5 space-y-0.5 ${cardSurface}`}>
              <div className={`text-[11px] font-semibold ${mutedText}`}>
                {selectedKarat} Per Gram
              </div>
              <div className="text-base sm:text-lg font-extrabold font-mono tabular-nums">
                {formatRsMoney(jewellery.karatRates.perGram)}
              </div>
            </div>
            <div
              className={`rounded-xl border p-3.5 space-y-0.5 ${
                isDarkTheme
                  ? 'bg-amber-950/40 border-amber-700'
                  : 'bg-amber-50/90 border-amber-200'
              }`}
            >
              <div className={`text-[11px] font-bold ${isDarkTheme ? 'text-amber-300' : 'text-amber-900'}`}>
                Gold Value ({selectedKarat} · {GOLD_PURITY_MAP[selectedKarat].percentageLabel})
              </div>
              <div className="text-lg sm:text-xl font-extrabold font-mono tabular-nums text-amber-600">
                {formatRsMoney(jewellery.goldValue)}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Jewellery Cost Calculator & Breakdown */}
        <section
          aria-labelledby="jewellery-calc-heading"
          className={`rounded-2xl border p-4 sm:p-5 space-y-5 ${cardSurface}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <h2 id="jewellery-calc-heading" className="text-sm sm:text-base font-extrabold">
                2. Jewellery Cost Calculator (Wastage, Making, Stones &amp; GST)
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCopyBreakdown}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${cardSurface}`}
            >
              {copiedKey === 'breakdown' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied Breakdown</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Breakdown</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Wastage */}
            <div className="space-y-1.5">
              <label htmlFor="gold-wastage-input" className={`block text-xs font-bold ${labelText}`}>
                Wastage ({wastageMode === 'percent' ? '%' : 'Masha / Tola'})
              </label>
              <div className="flex gap-1.5">
                <input
                  id="gold-wastage-input"
                  type="number"
                  min={0}
                  step="any"
                  value={wastageStr}
                  onChange={(e) => setWastageStr(e.target.value)}
                  className={`flex-1 min-w-0 h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
                />
                <select
                  aria-label="Wastage mode"
                  value={wastageMode}
                  onChange={(e) => setWastageMode(e.target.value as WastageMode)}
                  className={`h-10 px-2 rounded-xl border text-xs font-semibold cursor-pointer ${inputSurface}`}
                >
                  <option value="percent">%</option>
                  <option value="mashaPerTola">Masha/Tola</option>
                </select>
              </div>
              <p className={`text-[10px] ${mutedText}`}>
                Effective wastage: {jewellery.wastageEffectivePercent.toFixed(2)}%
              </p>
            </div>

            {/* Making Charges */}
            <div className="space-y-1.5">
              <label htmlFor="gold-making-input" className={`block text-xs font-bold ${labelText}`}>
                Making Charges (Rs.)
              </label>
              <div className="flex gap-1.5">
                <input
                  id="gold-making-input"
                  type="number"
                  min={0}
                  step="any"
                  value={makingStr}
                  onChange={(e) => setMakingStr(e.target.value)}
                  className={`flex-1 min-w-0 h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
                />
                <select
                  aria-label="Making charge type"
                  value={makingMode}
                  onChange={(e) => setMakingMode(e.target.value as MakingChargeMode)}
                  className={`h-10 px-2 rounded-xl border text-xs font-semibold cursor-pointer ${inputSurface}`}
                >
                  <option value="perTola">/ Tola</option>
                  <option value="perGram">/ Gram</option>
                  <option value="total">Total</option>
                </select>
              </div>
            </div>

            {/* Stone Cost */}
            <div className="space-y-1.5">
              <label htmlFor="gold-stone-input" className={`block text-xs font-bold ${labelText}`}>
                Stone / Beads Cost (Optional Rs.)
              </label>
              <input
                id="gold-stone-input"
                type="number"
                min={0}
                step="any"
                value={stoneCostStr}
                onChange={(e) => setStoneCostStr(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
              />
            </div>

            {/* GST / Tax % */}
            <div className="space-y-1.5">
              <label htmlFor="gold-gst-input" className={`block text-xs font-bold ${labelText}`}>
                GST / Tax % (Optional)
              </label>
              <input
                id="gold-gst-input"
                type="number"
                min={0}
                step="any"
                value={gstPercentStr}
                onChange={(e) => setGstPercentStr(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
              />
            </div>
          </div>

          {/* Line-Item Bill Breakdown */}
          <div
            className={`rounded-xl border divide-y text-xs sm:text-sm ${
              isDarkTheme ? 'bg-slate-900/90 border-slate-700 divide-slate-800' : 'bg-slate-50 border-slate-200 divide-slate-200/80'
            }`}
          >
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className={labelText}>
                Gold Value ({numericWeight} {weightUnit} · {selectedKarat})
              </span>
              <span className="font-mono font-bold tabular-nums">{formatRsMoney(jewellery.goldValue)}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className={labelText}>
                Wastage ({jewellery.wastageEffectivePercent.toFixed(2)}%)
              </span>
              <span className="font-mono font-bold tabular-nums">{formatRsMoney(jewellery.wastageAmount)}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className={labelText}>
                Making Charges ({makingMode === 'perTola' ? 'Per Tola' : makingMode === 'perGram' ? 'Per Gram' : 'Fixed Total'})
              </span>
              <span className="font-mono font-bold tabular-nums">{formatRsMoney(jewellery.makingChargesAmount)}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className={labelText}>Stones / Optional Add-ons</span>
              <span className="font-mono font-bold tabular-nums">{formatRsMoney(jewellery.stoneCostAmount)}</span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className={labelText}>GST / Tax ({parseFloat(gstPercentStr) || 0}%)</span>
              <span className="font-mono font-bold tabular-nums">{formatRsMoney(jewellery.gstAmount)}</span>
            </div>
            <div
              className={`px-4 py-3.5 flex items-center justify-between rounded-b-xl ${
                isDarkTheme ? 'bg-amber-950/50' : 'bg-amber-50'
              }`}
            >
              <span className="font-extrabold text-sm sm:text-base">Final Jewellery Total</span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-amber-600">
                {formatRsMoney(jewellery.finalTotal)}
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className={`flex items-center gap-2 text-xs font-medium ${mutedText}`}>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Prices are calculated from the rate you enter. Check your local jeweller&apos;s rate.</span>
          </p>
        </section>
      </div>
    </ToolLayout>
  );
};
