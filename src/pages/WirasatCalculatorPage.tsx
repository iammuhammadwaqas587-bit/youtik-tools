import React, { useState, useMemo } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  Scale,
  Plus,
  Minus,
  Copy,
  Check,
  Printer,
  RotateCcw,
  Sun,
  Moon,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';
import { formatPkrAmount } from '../utils/landAreaCalculation';
import {
  INITIAL_HEIRS,
  type DeceasedGender,
  type WirasatHeirsInput,
  calculateHanafiWirasat,
  formatFraction,
} from '../utils/wirasatCalculation';

interface WirasatCalculatorPageProps {
  onNavigate: (path: string) => void;
}

const EMPTY_HEIRS: WirasatHeirsInput = {
  husband: 0,
  wives: 0,
  sons: 0,
  daughters: 0,
  father: 0,
  mother: 0,
  fullBrothers: 0,
  fullSisters: 0,
  paternalGrandfather: 0,
  paternalGrandmother: 0,
  maternalGrandmother: 0,
  grandsons: 0,
  granddaughters: 0,
};

const CHART_COLORS = [
  '#059669',
  '#0284c7',
  '#d97706',
  '#7c3aed',
  '#e11d48',
  '#0d9488',
  '#4f46e5',
  '#ea580c',
];

export const WirasatCalculatorPage: React.FC<WirasatCalculatorPageProps> = ({
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

  const [deceasedGender, setDeceasedGender] = useState<DeceasedGender>('male');
  const [totalEstateStr, setTotalEstateStr] = useState<string>('10000000');
  const [funeralStr, setFuneralStr] = useState<string>('0');
  const [debtsStr, setDebtsStr] = useState<string>('0');
  const [wasiyyatStr, setWasiyyatStr] = useState<string>('0');
  const [heirs, setHeirs] = useState<WirasatHeirsInput>(INITIAL_HEIRS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result = useMemo(
    () =>
      calculateHanafiWirasat({
        deceasedGender,
        totalEstatePkr: parseFloat(totalEstateStr) || 0,
        funeralExpensesPkr: parseFloat(funeralStr) || 0,
        debtsPkr: parseFloat(debtsStr) || 0,
        wasiyyatPkr: parseFloat(wasiyyatStr) || 0,
        heirs,
      }),
    [deceasedGender, totalEstateStr, funeralStr, debtsStr, wasiyyatStr, heirs]
  );

  const inheritingRows = useMemo(
    () => result.rows.filter((r) => !r.isBlocked && r.totalShare.n > 0),
    [result.rows]
  );

  const handleSetHeirCount = (key: keyof WirasatHeirsInput, value: number, max = 99) => {
    const safe = Math.max(0, Math.min(max, Math.floor(value || 0)));
    setHeirs((prev) => ({ ...prev, [key]: safe }));
  };

  const handleSelectExample = (example: 'classic' | 'umari' | 'awl') => {
    setFuneralStr('0');
    setDebtsStr('0');
    setWasiyyatStr('0');
    if (example === 'classic') {
      setDeceasedGender('male');
      setTotalEstateStr('12000000');
      setHeirs({ ...EMPTY_HEIRS, wives: 1, sons: 2, daughters: 1 });
    } else if (example === 'umari') {
      setDeceasedGender('female');
      setTotalEstateStr('6000000');
      setHeirs({ ...EMPTY_HEIRS, husband: 1, mother: 1, father: 1 });
    } else {
      setDeceasedGender('female');
      setTotalEstateStr('8000000');
      setHeirs({ ...EMPTY_HEIRS, husband: 1, fullSisters: 2, mother: 1 });
    }
  };

  const handleReset = () => {
    setDeceasedGender('male');
    setTotalEstateStr('10000000');
    setFuneralStr('0');
    setDebtsStr('0');
    setWasiyyatStr('0');
    setHeirs({ ...EMPTY_HEIRS });
  };

  const handleCopySummary = async () => {
    const lines = [
      `Wirasat (Sunni Hanafi Islamic Inheritance) Distribution`,
      `Deceased Gender: ${deceasedGender === 'male' ? 'Male' : 'Female'}`,
      `Gross Estate: ${formatPkrAmount(result.totalEstatePkr)}`,
      `Net Distributable Estate: ${formatPkrAmount(result.netDistributableEstatePkr)}`,
      `Common Denominator (Asl al-Mas'ala): ${result.commonDenominator}`,
      ...(result.doctrineNote ? [`Note: ${result.doctrineNote}`] : []),
      '',
      ...result.rows.map((r) =>
        r.isBlocked
          ? `${r.heirLabel} (${r.count}): BLOCKED — ${r.ruleExplanation}`
          : `${r.heirLabel} (${r.count}): Share ${formatFraction(r.totalShare)} (${r.percentage.toFixed(2)}%) = ${formatPkrAmount(r.amountPkr)} | Each: ${formatFraction(r.perPersonShare)} (${formatPkrAmount(r.perPersonAmountPkr)})`
      ),
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
      name: 'Zakat Calculator',
      path: '/zakat-calculator',
      description: 'Calculate 2.5% annual Zakat and Silver/Gold Nisab in PKR.',
      icon: '💰',
    },
    {
      name: 'Land Area Converter',
      path: '/land-area-converter',
      description: 'Split inherited Marla, Kanal & Acre property shares cleanly.',
      icon: '🗺️',
    },
    {
      name: 'Gold Rate Calculator',
      path: '/gold-calculator',
      description: 'Value inherited gold jewellery by Tola, Gram & Karat.',
      icon: '🪙',
    },
    {
      name: 'Hijri Date Converter',
      path: '/hijri-date-converter',
      description: 'Convert Hijri, Gregorian & Desi calendar dates accurately.',
      icon: '🗓️',
    },
  ];

  // SVG Donut chart segments
  const donutSegments = useMemo(() => {
    const r = 42;
    const circumference = 2 * Math.PI * r;
    let cumulative = 0;
    return inheritingRows.map((row, idx) => {
      const pct = Math.max(0, row.percentage) / 100;
      const dashLength = pct * circumference;
      const offset = -cumulative * circumference;
      cumulative += pct;
      return {
        key: row.key,
        label: row.heirLabel,
        percentage: row.percentage,
        color: CHART_COLORS[idx % CHART_COLORS.length],
        dashArray: `${dashLength} ${circumference - dashLength}`,
        dashOffset: offset,
      };
    });
  }, [inheritingRows]);

  const renderHeirCounter = (
    key: keyof WirasatHeirsInput,
    title: string,
    max = 99,
    disabled = false
  ) => (
    <div
      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
        disabled ? 'opacity-40' : ''
      } ${isDarkTheme ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
    >
      <span className="text-xs font-bold leading-tight">{title}</span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          disabled={disabled || heirs[key] <= 0}
          onClick={() => handleSetHeirCount(key, heirs[key] - 1, max)}
          aria-label={`Decrease ${title}`}
          className={`h-7 w-7 rounded-lg border flex items-center justify-center cursor-pointer disabled:opacity-40 ${cardSurface}`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <input
          type="number"
          min={0}
          max={max}
          disabled={disabled}
          value={heirs[key]}
          onChange={(e) => handleSetHeirCount(key, Number(e.target.value), max)}
          aria-label={`${title} count`}
          className={`w-11 h-7 text-center rounded-lg border text-xs font-mono font-extrabold ${inputSurface}`}
        />
        <button
          type="button"
          disabled={disabled || heirs[key] >= max}
          onClick={() => handleSetHeirCount(key, heirs[key] + 1, max)}
          aria-label={`Increase ${title}`}
          className={`h-7 w-7 rounded-lg border flex items-center justify-center cursor-pointer disabled:opacity-40 ${cardSurface}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  return (
    <ToolLayout
      toolPath="/wirasat-calculator"
      title="Wirasat Calculator – Islamic Inheritance Shares (Sunni Hanafi)"
      badgeText="Hanafi Fiqh · 'Awl · Radd · Hijab"
      badgeIcon={<Scale className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />}
      description="Calculate exact Sunni (Hanafi) Islamic inheritance (Wirasat / Miras) fractions and PKR estate distributions. Deducts funeral expenses, debts, and capped 1/3 wasiyyat, enforces hijab blocking rules, and handles Umariyyatayn, ‘Awl, and Radd with crystal-clear explanations."
      howItWorks={{
        heading: 'How Hanafi Islamic Inheritance (Wirasat) Shares Are Calculated',
        text: 'Select the deceased’s gender, enter optional estate value and pre-inheritance deductions, and set surviving family heir counts. Exact rational fractions and rupee shares compute automatically.',
        steps: [
          {
            number: 1,
            title: 'Deduct Funeral, Debts & 1/3 Will',
            description:
              'Islamic law settles burial expenses and all outstanding debts first, followed by valid bequests (wasiyyat) capped at 1/3.',
          },
          {
            number: 2,
            title: 'Assign Fixed Shares & Blocking (Hijab)',
            description:
              'Quranic fixed heirs (Ashab al-Furud) receive their prescribed fractions while closer relatives automatically exclude distant ones.',
          },
          {
            number: 3,
            title: 'Apply ‘Asaba, ‘Awl, or Radd',
            description:
              'Agnatic residuaries absorb remaining estate (2:1 male-to-female), or shares scale proportionally via ‘Awl or Radd.',
          },
        ],
      }}
      supportedFormats={[
        { format: 'Exact Rational Fractions', description: 'Zero floating-point rounding loss; displays Asl al-Mas’ala denominator.' },
        { format: '‘Awl, Radd & Umariyyatayn', description: 'Handles oversubscribed shares, surplus return, and Caliph Umar’s special cases.' },
        { format: 'Hijab Blocking Explanations', description: 'Lists excluded relatives and cites the exact surviving heir blocking them.' },
      ]}
      tips={[
        'Click any of the three Quick Examples (“Wife + 2 Sons + 1 Daughter”, “Umariyyatayn”, or “‘Awl Case”) to see how Hanafi rules operate in classic scenarios.',
        'For agricultural land splits, copy each heir’s exact fraction and multiply it in our Land Area Converter.',
      ]}
      faqs={[
        {
          question: 'What are the deductions allowed before distributing Wirasat in Islam?',
          answer:
            'In exact order: (1) reasonable funeral and burial expenses, (2) all verified debts owed by the deceased (both to people and unpaid religious obligations), and (3) valid bequests (Wasiyyat) to non-heirs up to a maximum of one-third (1/3) of the remaining estate unless all adult heirs consent.',
        },
        {
          question: 'What are ‘Awl and Radd in Islamic inheritance?',
          answer:
            '‘Awl occurs when fixed Quranic shares add up to more than 100% (e.g., Husband 1/2 + Two Full Sisters 2/3 + Mother 1/6 = 8/6); all fixed shares are scaled down proportionally so the total equals 100%. Radd occurs when fixed shares total less than 100% and no residuary (‘Asaba) exists—under Hanafi fiqh, the surplus returns proportionally to the blood heirs excluding the spouse.',
        },
        {
          question: 'How does Pakistani law (MFLO 1961) treat orphaned grandchildren vs classical Hanafi fiqh?',
          answer:
            'Under classical Sunni Hanafi law (applied in this calculator), a surviving son blocks orphaned grandchildren of a predeceased child from inheriting. However, Section 4 of Pakistan’s Muslim Family Laws Ordinance (MFLO) 1961 awards orphaned grandchildren their deceased parent’s share under civil courts. Families with predeceased children whose siblings survive should always consult both an Islamic scholar (Mufti) and a Pakistani family lawyer.',
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
        {/* Examples + Theme + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/70 no-print">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-xs font-bold flex items-center gap-1 mr-1 ${mutedText}`}>
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Examples:</span>
            </span>
            <button
              type="button"
              onClick={() => handleSelectExample('classic')}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer hover:border-emerald-400 ${cardSurface}`}
            >
              Wife + 2 Sons + 1 Daughter
            </button>
            <button
              type="button"
              onClick={() => handleSelectExample('umari')}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer hover:border-emerald-400 ${cardSurface}`}
            >
              Husband + Mother + Father (Umariyyatayn)
            </button>
            <button
              type="button"
              onClick={() => handleSelectExample('awl')}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer hover:border-emerald-400 ${cardSurface}`}
            >
              Husband + 2 Full Sisters + Mother (&apos;Awl)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDarkTheme((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${cardSurface}`}
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

        {/* Step 1: Deceased Gender & Estate Deductions */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
          <h2 className="text-sm sm:text-base font-extrabold">
            1. Deceased Details, Estate Value &amp; Deductions (PKR)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <span className={`block text-xs font-bold mb-1.5 ${labelText}`}>Gender of Deceased</span>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setDeceasedGender('male')}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer ${
                    deceasedGender === 'male' ? 'bg-emerald-600 text-white' : mutedText
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setDeceasedGender('female')}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer ${
                    deceasedGender === 'female' ? 'bg-emerald-600 text-white' : mutedText
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="wirasat-estate" className={`block text-xs font-bold mb-1 ${labelText}`}>
                Total Estate Value (PKR)
              </label>
              <input
                id="wirasat-estate"
                type="number"
                min={0}
                step="any"
                value={totalEstateStr}
                onChange={(e) => setTotalEstateStr(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="wirasat-funeral" className={`block text-xs font-bold mb-1 ${labelText}`}>
                1. Funeral (Rs.)
              </label>
              <input
                id="wirasat-funeral"
                type="number"
                min={0}
                step="any"
                value={funeralStr}
                onChange={(e) => setFuneralStr(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="wirasat-debts" className={`block text-xs font-bold mb-1 ${labelText}`}>
                2. Debts (Rs.)
              </label>
              <input
                id="wirasat-debts"
                type="number"
                min={0}
                step="any"
                value={debtsStr}
                onChange={(e) => setDebtsStr(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="wirasat-wasiyyat" className={`block text-xs font-bold mb-1 ${labelText}`}>
                3. Wasiyyat (≤1/3)
              </label>
              <input
                id="wirasat-wasiyyat"
                type="number"
                min={0}
                step="any"
                value={wasiyyatStr}
                onChange={(e) => setWasiyyatStr(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold ${inputSurface}`}
              />
            </div>
          </div>

          {result.wasiyyatExceededOneThird && (
            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Bequest (Wasiyyat) cannot exceed 1/3 of the estate remaining after funeral expenses and debts ({formatPkrAmount(result.maxAllowedWasiyyatPkr)}). The excess requires unanimous consent of adult heirs, so this calculator caps Wasiyyat at 1/3.
              </span>
            </div>
          )}
        </section>

        {/* Step 2: Surviving Heirs */}
        <section className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
          <h2 className="text-sm sm:text-base font-extrabold">2. Surviving Family Heirs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {deceasedGender === 'female'
              ? renderHeirCounter('husband', 'Husband (Max 1)', 1)
              : renderHeirCounter('wives', 'Wives (0–4)', 4)}
            {renderHeirCounter('sons', 'Sons')}
            {renderHeirCounter('daughters', 'Daughters')}
            {renderHeirCounter('father', 'Father (Max 1)', 1)}
            {renderHeirCounter('mother', 'Mother (Max 1)', 1)}
            {renderHeirCounter('fullBrothers', 'Full Brothers')}
            {renderHeirCounter('fullSisters', 'Full Sisters')}
            {renderHeirCounter('paternalGrandfather', 'Paternal Grandfather', 1)}
            {renderHeirCounter('paternalGrandmother', 'Paternal Grandmother', 1)}
            {renderHeirCounter('maternalGrandmother', 'Maternal Grandmother', 1)}
            {renderHeirCounter('grandsons', "Grandsons (Son's Sons)")}
            {renderHeirCounter('granddaughters', "Granddaughters (Son's Daughters)")}
          </div>
        </section>

        {/* Step 3: Results & Visual Distribution */}
        <section className="space-y-4 print-avoid-break">
          <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold">
                  3. Calculated Islamic Inheritance Shares
                </h2>
                <p className={`text-xs ${mutedText}`}>
                  Net Distributable Estate: <strong>{formatPkrAmount(result.netDistributableEstatePkr)}</strong> · Common Denominator (Asl al-Mas&apos;ala): <strong>{result.commonDenominator}</strong>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 no-print">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  {copiedKey === 'summary' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'summary' ? 'Copied!' : 'Copy Summary'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {result.doctrineNote && (
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 text-xs font-semibold flex items-start gap-2">
                <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{result.doctrineNote}</span>
              </div>
            )}

            {/* SVG Donut Chart + Deduction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 flex items-center gap-4">
                <svg viewBox="0 0 110 110" className="w-28 h-28 shrink-0 -rotate-90" aria-label="Wirasat percentage distribution chart">
                  <circle cx="55" cy="55" r="42" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.key}
                      cx="55"
                      cy="55"
                      r="42"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                    />
                  ))}
                </svg>
                <div className="space-y-1 text-xs">
                  {donutSegments.map((seg) => (
                    <div key={seg.key} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-bold">{seg.label}:</span>
                      <span className="font-mono">{seg.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70">
                  <span className={`block text-[11px] ${mutedText}`}>Gross Estate</span>
                  <span className="font-mono font-extrabold">{formatPkrAmount(result.totalEstatePkr)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70">
                  <span className={`block text-[11px] ${mutedText}`}>Funeral + Debts</span>
                  <span className="font-mono font-extrabold text-red-600 dark:text-red-400">
                    -{formatPkrAmount(result.funeralExpensesPkr + result.debtsPkr)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70">
                  <span className={`block text-[11px] ${mutedText}`}>Applied Wasiyyat</span>
                  <span className="font-mono font-extrabold">{formatPkrAmount(result.appliedWasiyyatPkr)}</span>
                </div>
              </div>
            </div>

            {/* Shares Table */}
            <div className="overflow-x-auto border border-slate-200/70 rounded-xl">
              <table className="w-full text-left text-xs print-compact-table">
                <thead className={isDarkTheme ? 'bg-slate-900/70 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Heir</th>
                    <th className="py-2.5 px-3 font-bold text-center">Count</th>
                    <th className="py-2.5 px-3 font-bold">Total Share</th>
                    <th className="py-2.5 px-3 font-bold">Each Heir</th>
                    <th className="py-2.5 px-3 font-bold text-right">% Share</th>
                    <th className="py-2.5 px-3 font-bold text-right">Total (PKR)</th>
                    <th className="py-2.5 px-3 font-bold text-right">Per Person (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {result.rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`py-6 px-4 text-center ${mutedText}`}>
                        Add at least one surviving heir above to calculate shares.
                      </td>
                    </tr>
                  ) : (
                    result.rows.map((row) => (
                      <tr key={row.key} className={row.isBlocked ? 'opacity-65 bg-slate-100/60 dark:bg-slate-900/40' : ''}>
                        <td className="py-2.5 px-3">
                          <span className="font-bold block">{row.heirLabel}</span>
                          <span className={`text-[11px] leading-snug block ${mutedText}`}>
                            {row.ruleExplanation}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">{row.count}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {row.isBlocked ? 'Blocked' : formatFraction(row.totalShare)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {row.isBlocked ? '0' : formatFraction(row.perPersonShare)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {row.percentage.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-extrabold">
                          {formatPkrAmount(row.amountPkr)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {formatPkrAmount(row.perPersonAmountPkr)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pakistani MFLO 1961 & Scholar Disclaimer */}
        <section className={`rounded-xl border p-4 text-xs space-y-1.5 ${cardSurface}`}>
          <p className="font-bold">Important Fiqh &amp; Pakistani Law (MFLO 1961) Note:</p>
          <p className={mutedText}>
            This calculator implements <strong>classical Sunni (Hanafi) Islamic inheritance law</strong>, where a surviving son blocks orphaned grandchildren of a predeceased son/daughter. In Pakistan, civil succession courts apply <strong>Section 4 of the Muslim Family Laws Ordinance (MFLO) 1961</strong>, which grants orphaned grandchildren their deceased parent’s share. Because family structures vary, always consult a qualified Mufti / Islamic scholar or succession lawyer before executing formal property transfers.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
};
