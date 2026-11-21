import React, { useState, useMemo, useEffect } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Coins,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Printer,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Scale,
} from 'lucide-react';
import type { GoldKarat } from '../utils/goldCalculation';
import { GOLD_PURITY_MAP } from '../utils/goldCalculation';
import { formatPkrAmount } from '../utils/landAreaCalculation';
import {
  NISAB_GOLD_GRAMS,
  NISAB_GOLD_TOLA,
  NISAB_SILVER_GRAMS,
  NISAB_SILVER_TOLA,
  type NisabStandard,
  type GoldAssetItem,
  calculateZakat,
  calculateZakatAlFitr,
} from '../utils/zakatCalculation';

interface ZakatCalculatorPageProps {
  onNavigate: (path: string) => void;
}

const GOLD_RATE_KEY = 'youtiktools_gold_24k_tola_rate_v1';
const SILVER_RATE_KEY = 'youtiktools_silver_tola_rate_v1';
const DEFAULT_GOLD_RATE = '278000';
const DEFAULT_SILVER_RATE = '3350';

const createDefaultGoldItem = (): GoldAssetItem => ({
  id: 'gold_' + Math.random().toString(36).slice(2, 8),
  label: 'Gold Jewellery',
  weight: '0',
  unit: 'tola',
  karat: '22K',
});

export const ZakatCalculatorPage: React.FC<ZakatCalculatorPageProps> = ({ onNavigate }) => {
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

  const [goldRateStr, setGoldRateStr] = useState<string>(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage?.getItem(GOLD_RATE_KEY) : null;
      if (saved && /^\d+(\.\d+)?$/.test(saved)) return saved;
    } catch {
      // Ignore storage failures
    }
    return DEFAULT_GOLD_RATE;
  });

  const [silverRateStr, setSilverRateStr] = useState<string>(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage?.getItem(SILVER_RATE_KEY) : null;
      if (saved && /^\d+(\.\d+)?$/.test(saved)) return saved;
    } catch {
      // Ignore storage failures
    }
    return DEFAULT_SILVER_RATE;
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (goldRateStr.trim()) window.localStorage.setItem(GOLD_RATE_KEY, goldRateStr.trim());
        if (silverRateStr.trim()) window.localStorage.setItem(SILVER_RATE_KEY, silverRateStr.trim());
      }
    } catch {
      // Ignore quota errors
    }
  }, [goldRateStr, silverRateStr]);

  const [nisabStandard, setNisabStandard] = useState<NisabStandard>('silver');

  // Assets & Debts
  const [cashInHandStr, setCashInHandStr] = useState<string>('0');
  const [bankSavingsStr, setBankSavingsStr] = useState<string>('0');
  const [goldItems, setGoldItems] = useState<GoldAssetItem[]>([createDefaultGoldItem()]);
  const [silverWeightStr, setSilverWeightStr] = useState<string>('0');
  const [silverUnit, setSilverUnit] = useState<'tola' | 'gram'>('tola');
  const [businessInventoryStr, setBusinessInventoryStr] = useState<string>('0');
  const [moneyOwedStr, setMoneyOwedStr] = useState<string>('0');
  const [sharesStr, setSharesStr] = useState<string>('0');
  const [rentalSavingsStr, setRentalSavingsStr] = useState<string>('0');
  const [shortTermDebtsStr, setShortTermDebtsStr] = useState<string>('0');

  // Optional Fitrana mini-calculator
  const [fitranaMembersStr, setFitranaMembersStr] = useState<string>('4');
  const [fitranaRateStr, setFitranaRateStr] = useState<string>('240');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result = useMemo(
    () =>
      calculateZakat({
        gold24KRatePerTola: parseFloat(goldRateStr) || 0,
        silverRatePerTola: parseFloat(silverRateStr) || 0,
        nisabStandard,
        assets: {
          cashInHand: parseFloat(cashInHandStr) || 0,
          bankSavings: parseFloat(bankSavingsStr) || 0,
          goldItems,
          silverWeight: parseFloat(silverWeightStr) || 0,
          silverUnit,
          businessInventory: parseFloat(businessInventoryStr) || 0,
          moneyOwedToMe: parseFloat(moneyOwedStr) || 0,
          sharesAndInvestments: parseFloat(sharesStr) || 0,
          rentalAndOtherSavings: parseFloat(rentalSavingsStr) || 0,
        },
        shortTermDebts: parseFloat(shortTermDebtsStr) || 0,
      }),
    [
      goldRateStr,
      silverRateStr,
      nisabStandard,
      cashInHandStr,
      bankSavingsStr,
      goldItems,
      silverWeightStr,
      silverUnit,
      businessInventoryStr,
      moneyOwedStr,
      sharesStr,
      rentalSavingsStr,
      shortTermDebtsStr,
    ]
  );

  const fitranaResult = useMemo(
    () =>
      calculateZakatAlFitr(parseFloat(fitranaMembersStr) || 0, parseFloat(fitranaRateStr) || 0),
    [fitranaMembersStr, fitranaRateStr]
  );

  const handleAddGoldItem = () => {
    setGoldItems((prev) => [
      ...prev,
      {
        id: 'gold_' + Math.random().toString(36).slice(2, 8),
        label: `Gold Item ${prev.length + 1}`,
        weight: '0',
        unit: 'tola',
        karat: '22K',
      },
    ]);
  };

  const handleUpdateGoldItem = (
    id: string,
    patch: Partial<Pick<GoldAssetItem, 'label' | 'weight' | 'unit' | 'karat'>>
  ) => {
    setGoldItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleRemoveGoldItem = (id: string) => {
    setGoldItems((prev) => (prev.length <= 1 ? prev : prev.filter((i) => i.id !== id)));
  };

  const handleReset = () => {
    setCashInHandStr('0');
    setBankSavingsStr('0');
    setGoldItems([createDefaultGoldItem()]);
    setSilverWeightStr('0');
    setSilverUnit('tola');
    setBusinessInventoryStr('0');
    setMoneyOwedStr('0');
    setSharesStr('0');
    setRentalSavingsStr('0');
    setShortTermDebtsStr('0');
  };

  const handleCopySummary = async () => {
    const lines = [
      'Zakat Calculation Summary (YouTikTools)',
      `Nisab Standard: ${nisabStandard === 'silver' ? 'Silver (52.5 Tola / 612.36 g)' : 'Gold (7.5 Tola / 87.48 g)'}`,
      `Active Nisab Threshold: ${formatPkrAmount(result.activeNisabPkr)}`,
      ...result.breakdownRows
        .filter((r) => r.amountPkr > 0)
        .map(
          (r) =>
            `${r.label}: ${r.isDeduction ? '-' : ''}${formatPkrAmount(r.amountPkr)} (${r.detail})`
        ),
      `Total Assets: ${formatPkrAmount(result.totalAssetsPkr)}`,
      `Short-Term Liabilities: -${formatPkrAmount(result.totalLiabilitiesPkr)}`,
      `Net Zakatable Wealth: ${formatPkrAmount(result.netZakatableWealthPkr)}`,
      result.isZakatDue
        ? `Zakat Payable (2.5%): ${result.zakatFormatted} (${result.zakatCompactWords})`
        : 'Status: Below Nisab threshold — Zakat is not obligatory.',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedKey('summary');
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
      name: 'Gold Rate Calculator',
      path: '/gold-calculator',
      description: 'Convert Tola, Masha, Ratti, Gram and check 24K/22K/21K/18K prices.',
      icon: '🪙',
    },
    {
      name: 'Wirasat Calculator',
      path: '/wirasat-calculator',
      description: 'Calculate Sunni (Hanafi) Islamic inheritance shares & PKR amounts.',
      icon: '⚖️',
    },
    {
      name: 'Ramadan Timetable',
      path: '/ramadan-timetable',
      description: 'City-wise Sehri & Iftar timetable for Pakistan & worldwide.',
      icon: '🌙',
    },
    {
      name: 'Hijri Date Converter',
      path: '/hijri-date-converter',
      description: 'Convert Hijri, Gregorian & Desi calendar dates with Hilal adjustment.',
      icon: '🗓️',
    },
  ];

  const renderPkrField = (
    id: string,
    label: string,
    hint: string,
    value: string,
    onChange: (val: string) => void
  ) => (
    <div>
      <label htmlFor={id} className={`block text-xs font-bold mb-1 ${labelText}`}>
        {label}
      </label>
      <div className="relative">
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${mutedText}`}>
          Rs.
        </span>
        <input
          id={id}
          type="number"
          min={0}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-10 pl-9 pr-3 rounded-xl border text-sm font-mono font-bold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${inputSurface}`}
        />
      </div>
      <p className={`text-[11px] mt-0.5 ${mutedText}`}>{hint}</p>
    </div>
  );

  return (
    <ToolLayout
      toolPath="/zakat-calculator"
      title="Zakat Calculator (Pakistan & Nisab Guide)"
      badgeText="2.5% Zakat · Silver & Gold Nisab"
      badgeIcon={<Coins className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />}
      description="Calculate annual 2.5% Zakat in Pakistani Rupees (PKR) using today’s Silver (52.5 tola / 612.36 g) or Gold (7.5 tola / 87.48 g) Nisab. Includes multiple purity-adjusted gold items (24K–18K), savings, inventory, receivables, liabilities, and Zakat al-Fitr (Fitrana)."
      howItWorks={{
        heading: 'How Annual Zakat & Nisab Calculation Works',
        text: 'Zakat is obligatory at 2.5% once your net zakatable wealth meets or exceeds the Nisab threshold for one complete lunar year (Hawl). Enter current local bullion rates once and we save them in your browser for future checks.',
        steps: [
          {
            number: 1,
            title: 'Set Gold & Silver Rates',
            description:
              'Enter today’s 24K gold and silver rates per Tola in Rs., and pick Silver (recommended default) or Gold Nisab.',
          },
          {
            number: 2,
            title: 'Add Cash, Gold & Assets',
            description:
              'Enter cash, bank savings, multiple gold jewellery items with karat purity, silver, trade stock, and shares.',
          },
          {
            number: 3,
            title: 'Subtract Short-Term Debts',
            description:
              'Deduct bills and debts due now. If net wealth meets Nisab, exact 2.5% Zakat and Lakh/Crore words appear instantly.',
          },
        ],
      }}
      supportedFormats={[
        {
          format: 'Silver Nisab (52.5 Tola)',
          description: `${NISAB_SILVER_GRAMS} grams of silver — preferred default in Pakistan so more needy families receive aid.`,
        },
        {
          format: 'Gold Nisab (7.5 Tola)',
          description: `${NISAB_GOLD_GRAMS} grams of pure 24K gold (1 Tola = 11.664 g).`,
        },
        {
          format: 'Gold Karat Purity',
          description: '24K (100%), 22K (91.67%), 21K (87.5%), and 18K (75%) automatically adjust jewellery value.',
        },
        {
          format: 'Zakat al-Fitr (Fitrana)',
          description: 'Includes a family Fitrana calculator based on local per-person Eid-ul-Fitr grain value.',
        },
      ]}
      tips={[
        'Personal-use items such as your primary residential home, daily-use car, clothing, and household furniture are exempt from Zakat.',
        'If your wealth mixes cash and gold/silver (e.g., some gold + some bank cash), Hanafi scholars apply the Silver Nisab threshold.',
      ]}
      faqs={[
        {
          question: 'Should I choose Silver Nisab or Gold Nisab for Zakat in Pakistan?',
          answer:
            'In Pakistan and South Asia, Hanafi scholars strongly recommend Silver Nisab (52.5 tola / 612.36 g) whenever you hold cash, savings, or mixed assets alongside gold, because the lower silver threshold increases charitable support for deserving recipients. Gold Nisab (7.5 tola / 87.48 g) applies primarily when someone owns only gold with zero cash, silver, or trade goods.',
        },
        {
          question: 'Is Zakat payable on 22K or 21K gold jewellery worn by women?',
          answer:
            'Under the Hanafi school commonly followed in Pakistan, Zakat is obligatory on gold and silver jewellery above Nisab whether worn regularly or kept stored. We scale 22K (91.67%), 21K (87.5%), and 18K (75%) weights to pure 24K equivalent value automatically.',
        },
        {
          question: 'Can I deduct long-term house mortgages or full multi-year loans from Zakat?',
          answer:
            'Scholars generally permit deducting only immediate bills and short-term debts due within the current lunar year (Hawl), rather than subtracting 10–20 year installment mortgages in full against current liquid assets. Consult a qualified local Mufti for complex business debts.',
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
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold">1. Nisab &amp; Today&apos;s Bullion Rates (PKR)</h2>
            <p className={`text-xs ${mutedText}`}>
              Rates are saved locally in your browser—no external live API needed.
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={() => setIsDarkTheme((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
            >
              {isDarkTheme ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Nisab Configuration Grid */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderPkrField(
              'zakat-gold-rate',
              'Today’s 24K Gold Rate (PKR / Tola)',
              `Gold Nisab = 7.5 Tola (${NISAB_GOLD_GRAMS} g)`,
              goldRateStr,
              setGoldRateStr
            )}
            {renderPkrField(
              'zakat-silver-rate',
              'Today’s Silver Rate (PKR / Tola)',
              `Silver Nisab = 52.5 Tola (${NISAB_SILVER_GRAMS} g)`,
              silverRateStr,
              setSilverRateStr
            )}
            <div>
              <label htmlFor="nisab-standard" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Calculate Nisab Using
              </label>
              <select
                id="nisab-standard"
                value={nisabStandard}
                onChange={(e) => setNisabStandard(e.target.value as NisabStandard)}
                className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${inputSurface}`}
              >
                <option value="silver">Silver (Recommended Default — 52.5 Tola)</option>
                <option value="gold">Gold (7.5 Tola)</option>
              </select>
              <p className={`text-[11px] mt-0.5 ${mutedText}`}>
                Silver Nisab lowers the threshold so more eligible recipients benefit.
              </p>
            </div>
          </div>

          {/* Both Nisab Values Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div
              className={`p-3.5 rounded-xl border ${
                nisabStandard === 'silver'
                  ? 'border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/30'
                  : 'border-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Silver Nisab ({NISAB_SILVER_TOLA} Tola / {NISAB_SILVER_GRAMS} g)</span>
                {nisabStandard === 'silver' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">ACTIVE</span>
                )}
              </div>
              <p className="text-lg font-extrabold font-mono mt-1 tabular-nums">
                {formatPkrAmount(result.silverNisabPkr)}
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                nisabStandard === 'gold'
                  ? 'border-amber-500/60 bg-amber-50/70 dark:bg-amber-950/30'
                  : 'border-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Gold Nisab ({NISAB_GOLD_TOLA} Tola / {NISAB_GOLD_GRAMS} g)</span>
                {nisabStandard === 'gold' && (
                  <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold">ACTIVE</span>
                )}
              </div>
              <p className="text-lg font-extrabold font-mono mt-1 tabular-nums">
                {formatPkrAmount(result.goldNisabPkr)}
              </p>
            </div>
          </div>
          <p className={`text-xs leading-relaxed ${mutedText}`}>
            <strong>Why Silver vs Gold differs:</strong> Silver Nisab ({formatPkrAmount(result.silverNisabPkr)}) is much lower than Gold Nisab ({formatPkrAmount(result.goldNisabPkr)}), so scholars in Pakistan recommend Silver Nisab when you hold cash or mixed wealth to maximize assistance to the poor.
          </p>
        </section>

        {/* 2. Assets & Gold Jewellery */}
        <section className="space-y-4">
          <h2 className="text-sm sm:text-base font-extrabold">2. Zakatable Assets &amp; Gold / Silver</h2>

          <div className={`rounded-2xl border p-4 sm:p-5 space-y-5 ${cardSurface}`}>
            {/* Gold Multiple Items */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-amber-500" />
                    <span>Gold Owned (Add Separate Items by Karat)</span>
                  </h3>
                  <p className={`text-[11px] ${mutedText}`}>
                    1 Tola = 11.664 g · Purity-adjusted automatically (24K 100%, 22K 91.67%, 21K 87.5%, 18K 75%)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddGoldItem}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer no-print"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Gold Item</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {goldItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl border ${
                      isDarkTheme ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="sm:col-span-4">
                      <label className={`block text-[11px] font-semibold mb-1 ${mutedText}`}>
                        Item #{idx + 1} Label
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateGoldItem(item.id, { label: e.target.value })}
                        placeholder="e.g. Bangles, Ring, Coin"
                        className={`w-full h-9 px-2.5 rounded-lg border text-xs font-semibold ${inputSurface}`}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className={`block text-[11px] font-semibold mb-1 ${mutedText}`}>
                        Weight
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={item.weight}
                        onChange={(e) => handleUpdateGoldItem(item.id, { weight: e.target.value })}
                        className={`w-full h-9 px-2.5 rounded-lg border text-xs font-mono font-bold ${inputSurface}`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`block text-[11px] font-semibold mb-1 ${mutedText}`}>
                        Unit
                      </label>
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          handleUpdateGoldItem(item.id, { unit: e.target.value as 'tola' | 'gram' })
                        }
                        className={`w-full h-9 px-2 rounded-lg border text-xs font-semibold ${inputSurface}`}
                      >
                        <option value="tola">Tola</option>
                        <option value="gram">Gram</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`block text-[11px] font-semibold mb-1 ${mutedText}`}>
                        Karat
                      </label>
                      <select
                        value={item.karat}
                        onChange={(e) =>
                          handleUpdateGoldItem(item.id, { karat: e.target.value as GoldKarat })
                        }
                        className={`w-full h-9 px-2 rounded-lg border text-xs font-semibold ${inputSurface}`}
                      >
                        {(['24K', '22K', '21K', '18K'] as GoldKarat[]).map((k) => (
                          <option key={k} value={k}>
                            {k} ({Math.round(GOLD_PURITY_MAP[k].purity * 100)}%)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1 flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveGoldItem(item.id)}
                        disabled={goldItems.length <= 1}
                        aria-label={`Remove gold item ${idx + 1}`}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer no-print"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Silver Owned */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/70">
              <div className="sm:col-span-2">
                <label htmlFor="silver-weight" className={`block text-xs font-bold mb-1 ${labelText}`}>
                  Silver Owned (Coins, Utensils &amp; Jewellery)
                </label>
                <div className="flex gap-2">
                  <input
                    id="silver-weight"
                    type="number"
                    min={0}
                    step="any"
                    value={silverWeightStr}
                    onChange={(e) => setSilverWeightStr(e.target.value)}
                    className={`flex-1 h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
                  />
                  <select
                    value={silverUnit}
                    onChange={(e) => setSilverUnit(e.target.value as 'tola' | 'gram')}
                    aria-label="Silver weight unit"
                    className={`w-28 h-10 px-2.5 rounded-xl border text-xs font-bold ${inputSurface}`}
                  >
                    <option value="tola">Tola</option>
                    <option value="gram">Gram</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col justify-center p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/70">
                <span className={`text-[11px] font-semibold ${mutedText}`}>Silver Value (PKR)</span>
                <span className="text-sm font-extrabold font-mono">{formatPkrAmount(result.silverTotalPkr)}</span>
              </div>
            </div>

            {/* Cash & Other Assets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/70">
              {renderPkrField(
                'zakat-cash',
                'Cash in Hand & at Home',
                'Notes, foreign currency converted to PKR',
                cashInHandStr,
                setCashInHandStr
              )}
              {renderPkrField(
                'zakat-bank',
                'Bank Accounts & Savings',
                'Current, savings accounts, digital wallets & prize bonds',
                bankSavingsStr,
                setBankSavingsStr
              )}
              {renderPkrField(
                'zakat-inventory',
                'Business Inventory / Trade Goods',
                'Current market value of stock held for resale',
                businessInventoryStr,
                setBusinessInventoryStr
              )}
              {renderPkrField(
                'zakat-receivables',
                'Money Owed to You (Recoverable)',
                'Loans or payments you expect to collect',
                moneyOwedStr,
                setMoneyOwedStr
              )}
              {renderPkrField(
                'zakat-shares',
                'Shares, Mutual Funds & Investments',
                'Current market value of zakatable investments',
                sharesStr,
                setSharesStr
              )}
              {renderPkrField(
                'zakat-rental',
                'Rental Income & Other Savings',
                'Saved rental surplus & committees (BC) paid in',
                rentalSavingsStr,
                setRentalSavingsStr
              )}
            </div>

            {/* Liabilities */}
            <div className="pt-3 border-t border-slate-200/70">
              <h3 className="text-xs sm:text-sm font-bold mb-2 text-red-600 dark:text-red-400">
                3. Deductible Short-Term Liabilities
              </h3>
              <div className="max-w-md">
                {renderPkrField(
                  'zakat-debts',
                  'Short-Term Debts & Bills Due Now (PKR)',
                  'Immediate personal debts, taxes, salaries, or utility bills due this lunar year',
                  shortTermDebtsStr,
                  setShortTermDebtsStr
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Live Zakat Summary & Breakdown */}
        <section aria-live="polite" className="space-y-4 print-avoid-break">
          <div
            className={`rounded-2xl border p-5 sm:p-6 ${
              result.isZakatDue
                ? 'border-emerald-500/70 bg-emerald-50/80 dark:bg-emerald-950/40'
                : 'border-slate-300 bg-slate-100/80 dark:bg-slate-800/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
                  {result.isZakatDue ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-300">
                        Above Nisab Threshold — Zakat Due (2.5%)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-slate-500" />
                      <span className={mutedText}>
                        Below Active Nisab ({formatPkrAmount(result.activeNisabPkr)}) — Rs. 0 Due
                      </span>
                    </>
                  )}
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums">
                  {result.zakatFormatted}
                </div>
                {result.isZakatDue && (
                  <p className={`text-xs font-semibold ${labelText}`}>
                    In words: <strong>{result.zakatCompactWords}</strong> ({result.zakatInWords})
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 no-print">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  {copiedKey === 'summary' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'summary' ? 'Copied!' : 'Copy Summary'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Key Totals Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-300/60">
              <div>
                <span className={`text-[11px] font-semibold block ${mutedText}`}>Total Assets</span>
                <span className="text-sm font-extrabold font-mono">{formatPkrAmount(result.totalAssetsPkr)}</span>
              </div>
              <div>
                <span className={`text-[11px] font-semibold block ${mutedText}`}>Short-Term Debts</span>
                <span className="text-sm font-extrabold font-mono text-red-600 dark:text-red-400">
                  -{formatPkrAmount(result.totalLiabilitiesPkr)}
                </span>
              </div>
              <div>
                <span className={`text-[11px] font-semibold block ${mutedText}`}>Net Zakatable Wealth</span>
                <span className="text-sm font-extrabold font-mono">{formatPkrAmount(result.netZakatableWealthPkr)}</span>
              </div>
              <div>
                <span className={`text-[11px] font-semibold block ${mutedText}`}>Active Nisab</span>
                <span className="text-sm font-extrabold font-mono">{formatPkrAmount(result.activeNisabPkr)}</span>
              </div>
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <div className={`rounded-2xl border overflow-hidden ${cardSurface}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs print-compact-table">
                <thead className={isDarkTheme ? 'bg-slate-900/70 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Asset / Deduction Category</th>
                    <th className="py-2.5 px-4 font-bold">Detail</th>
                    <th className="py-2.5 px-4 font-bold text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {result.breakdownRows.map((row) => (
                    <tr key={row.label}>
                      <td className="py-2.5 px-4 font-semibold">{row.label}</td>
                      <td className={`py-2.5 px-4 ${mutedText}`}>{row.detail}</td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums ${
                          row.isDeduction && row.amountPkr > 0 ? 'text-red-600 dark:text-red-400' : ''
                        }`}
                      >
                        {row.isDeduction && row.amountPkr > 0 ? '-' : ''}
                        {formatPkrAmount(row.amountPkr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Optional Zakat al-Fitr (Fitrana) Mini-Calculator */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-3 print-avoid-break ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-extrabold">Optional: Zakat al-Fitr (Fitrana) Calculator</h2>
            </div>
            <div className="flex flex-wrap gap-1.5 no-print">
              {[
                { label: 'Wheat (~Rs. 240)', rate: '240' },
                { label: 'Barley (~Rs. 450)', rate: '450' },
                { label: 'Dates (~Rs. 1,600)', rate: '1600' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFitranaRateStr(preset.rate)}
                  className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label htmlFor="fitrana-members" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Household Members
              </label>
              <input
                id="fitrana-members"
                type="number"
                min={0}
                value={fitranaMembersStr}
                onChange={(e) => setFitranaMembersStr(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
              />
            </div>
            <div>
              <label htmlFor="fitrana-rate" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Per-Person Rate (Rs.)
              </label>
              <input
                id="fitrana-rate"
                type="number"
                min={0}
                value={fitranaRateStr}
                onChange={(e) => setFitranaRateStr(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
              />
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80">
              <span className={`block text-[11px] font-semibold ${mutedText}`}>
                Total Fitrana ({fitranaResult.members} × Rs. {fitranaResult.rate})
              </span>
              <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300">
                {fitranaResult.formattedTotal}
              </span>
            </div>
          </div>
        </section>

        {/* 6. Islamic Notes & Scholar Disclaimer */}
        <section className={`rounded-xl border p-4 text-xs space-y-1.5 ${cardSurface}`}>
          <p className="font-bold">Important Zakat Rules &amp; Disclaimer:</p>
          <ul className={`list-disc pl-4 space-y-1 ${mutedText}`}>
            <li>
              <strong>Lunar Year (Hawl):</strong> Zakat becomes obligatory after your wealth has remained at or above Nisab for one full Islamic lunar year (354 days).
            </li>
            <li>
              <strong>Personal Exemptions:</strong> Primary residence, personal clothing, household furniture, and a single family car are exempt from Zakat.
            </li>
            <li>
              <strong>Scholar Guidance:</strong> This calculator follows standard Sunni (Hanafi) principles widely applied in Pakistan. For complex business partnerships, agricultural produce (Ushr), or long-term debts, please consult a qualified Islamic scholar (Mufti).
            </li>
          </ul>
        </section>
      </div>
    </ToolLayout>
  );
};
