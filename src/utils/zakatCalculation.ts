import type { GoldKarat, GoldWeightUnitId } from './goldCalculation';
import { GOLD_PURITY_MAP, GRAMS_PER_TOLA } from './goldCalculation';
import { formatPkrAmount, formatPkrInLakhCroreWords } from './landAreaCalculation';

export const NISAB_GOLD_GRAMS = 87.48; // 7.5 Tola * 11.664 g
export const NISAB_GOLD_TOLA = 7.5;
export const NISAB_SILVER_GRAMS = 612.36; // 52.5 Tola * 11.664 g
export const NISAB_SILVER_TOLA = 52.5;
export const ZAKAT_RATE = 0.025; // 2.5%

export type NisabStandard = 'silver' | 'gold';

export interface GoldAssetItem {
  id: string;
  label: string;
  weight: string;
  unit: Extract<GoldWeightUnitId, 'tola' | 'gram'>;
  karat: GoldKarat;
}

export interface ZakatAssetsInput {
  cashInHand: number;
  bankSavings: number;
  goldItems: GoldAssetItem[];
  silverWeight: number;
  silverUnit: 'tola' | 'gram';
  businessInventory: number;
  moneyOwedToMe: number;
  sharesAndInvestments: number;
  rentalAndOtherSavings: number;
}

export interface ZakatInput {
  gold24KRatePerTola: number;
  silverRatePerTola: number;
  nisabStandard: NisabStandard;
  assets: ZakatAssetsInput;
  shortTermDebts: number;
}

export interface ZakatBreakdownRow {
  label: string;
  detail: string;
  amountPkr: number;
  isDeduction?: boolean;
}

export interface ZakatCalculationResult {
  goldNisabPkr: number;
  silverNisabPkr: number;
  activeNisabPkr: number;
  nisabStandard: NisabStandard;
  goldTotalPkr: number;
  goldTotalPureGrams: number;
  silverTotalPkr: number;
  silverTotalGrams: number;
  totalAssetsPkr: number;
  totalLiabilitiesPkr: number;
  netZakatableWealthPkr: number;
  isZakatDue: boolean;
  zakatPayablePkr: number;
  zakatFormatted: string;
  zakatInWords: string;
  zakatCompactWords: string;
  breakdownRows: ZakatBreakdownRow[];
}

export function sanitizePositive(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function calculateZakat(input: ZakatInput): ZakatCalculationResult {
  const goldRateTola = sanitizePositive(input.gold24KRatePerTola);
  const silverRateTola = sanitizePositive(input.silverRatePerTola);

  const goldNisabPkr = NISAB_GOLD_TOLA * goldRateTola;
  const silverNisabPkr = NISAB_SILVER_TOLA * silverRateTola;
  const activeNisabPkr = input.nisabStandard === 'gold' ? goldNisabPkr : silverNisabPkr;

  const goldRatePerGram24K = goldRateTola / GRAMS_PER_TOLA;
  const silverRatePerGram = silverRateTola / GRAMS_PER_TOLA;

  let goldTotalPkr = 0;
  let goldTotalPureGrams = 0;

  const goldDetailParts: string[] = [];
  for (const item of input.assets.goldItems) {
    const rawWeight = parseFloat(item.weight);
    const w = sanitizePositive(rawWeight);
    if (w <= 0) continue;
    const rawGrams = item.unit === 'tola' ? w * GRAMS_PER_TOLA : w;
    const purity = GOLD_PURITY_MAP[item.karat].purity;
    const pureGrams = rawGrams * purity;
    const valPkr = pureGrams * goldRatePerGram24K;
    goldTotalPureGrams += pureGrams;
    goldTotalPkr += valPkr;
    goldDetailParts.push(`${w} ${item.unit} (${item.karat})`);
  }

  const silverRawWeight = sanitizePositive(input.assets.silverWeight);
  const silverTotalGrams =
    input.assets.silverUnit === 'tola' ? silverRawWeight * GRAMS_PER_TOLA : silverRawWeight;
  const silverTotalPkr = silverTotalGrams * silverRatePerGram;

  const cashInHand = sanitizePositive(input.assets.cashInHand);
  const bankSavings = sanitizePositive(input.assets.bankSavings);
  const businessInventory = sanitizePositive(input.assets.businessInventory);
  const moneyOwedToMe = sanitizePositive(input.assets.moneyOwedToMe);
  const sharesAndInvestments = sanitizePositive(input.assets.sharesAndInvestments);
  const rentalAndOtherSavings = sanitizePositive(input.assets.rentalAndOtherSavings);

  const totalAssetsPkr =
    cashInHand +
    bankSavings +
    goldTotalPkr +
    silverTotalPkr +
    businessInventory +
    moneyOwedToMe +
    sharesAndInvestments +
    rentalAndOtherSavings;

  const totalLiabilitiesPkr = sanitizePositive(input.shortTermDebts);
  const netZakatableWealthPkr = Math.max(0, totalAssetsPkr - totalLiabilitiesPkr);

  const isZakatDue = activeNisabPkr > 0 && netZakatableWealthPkr >= activeNisabPkr;
  const zakatPayablePkr = isZakatDue ? netZakatableWealthPkr * ZAKAT_RATE : 0;

  const words = formatPkrInLakhCroreWords(zakatPayablePkr);

  const breakdownRows: ZakatBreakdownRow[] = [
    { label: 'Cash in Hand & at Home', detail: 'Liquid currency notes', amountPkr: cashInHand },
    { label: 'Bank Accounts & Savings', detail: 'Checking, savings & prize bonds', amountPkr: bankSavings },
    {
      label: 'Gold Assets (Purity-Adjusted)',
      detail: goldDetailParts.length ? goldDetailParts.join(', ') : `${goldTotalPureGrams.toFixed(2)} g pure gold`,
      amountPkr: goldTotalPkr,
    },
    {
      label: 'Silver Assets',
      detail: silverRawWeight > 0 ? `${silverRawWeight} ${input.assets.silverUnit} (${silverTotalGrams.toFixed(2)} g)` : '0 g',
      amountPkr: silverTotalPkr,
    },
    { label: 'Business Inventory / Trade Goods', detail: 'Current market value', amountPkr: businessInventory },
    { label: 'Receivables (Money Owed to You)', detail: 'Expected recoverable loans', amountPkr: moneyOwedToMe },
    { label: 'Shares, Mutual Funds & Investments', detail: 'Market value held for trade', amountPkr: sharesAndInvestments },
    { label: 'Rental Income & Other Savings', detail: 'Saved zakatable surplus', amountPkr: rentalAndOtherSavings },
    {
      label: 'Less: Short-Term Debts & Bills Due',
      detail: 'Deducted within current lunar year',
      amountPkr: totalLiabilitiesPkr,
      isDeduction: true,
    },
  ];

  return {
    goldNisabPkr,
    silverNisabPkr,
    activeNisabPkr,
    nisabStandard: input.nisabStandard,
    goldTotalPkr,
    goldTotalPureGrams,
    silverTotalPkr,
    silverTotalGrams,
    totalAssetsPkr,
    totalLiabilitiesPkr,
    netZakatableWealthPkr,
    isZakatDue,
    zakatPayablePkr,
    zakatFormatted: formatPkrAmount(zakatPayablePkr),
    zakatInWords: words.fullWords,
    zakatCompactWords: words.compactScale,
    breakdownRows,
  };
}

export function calculateZakatAlFitr(familyMembers: number, fitranaRatePkr: number): {
  members: number;
  rate: number;
  totalPkr: number;
  formattedTotal: string;
} {
  const members = Math.max(0, Math.floor(sanitizePositive(familyMembers)));
  const rate = sanitizePositive(fitranaRatePkr);
  const totalPkr = members * rate;
  return {
    members,
    rate,
    totalPkr,
    formattedTotal: formatPkrAmount(totalPkr),
  };
}
