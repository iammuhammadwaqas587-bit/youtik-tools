export type GoldWeightUnitId =
  | 'tola'
  | 'masha'
  | 'ratti'
  | 'gram'
  | 'milligram'
  | 'ounce'
  | 'kilogram';

export type GoldKarat = '24K' | '22K' | '21K' | '18K';

export interface GoldWeightUnitDef {
  id: GoldWeightUnitId;
  name: string;
  shortLabel: string;
  gramsPerUnit: number;
  note: string;
}

// Exact Pakistani / South Asian traditional goldsmith & troy constants
export const GOLD_WEIGHT_UNITS: GoldWeightUnitDef[] = [
  { id: 'tola', name: 'Tola', shortLabel: 'Tola', gramsPerUnit: 11.664, note: '1 Tola = 11.664 g (12 Masha)' },
  { id: 'masha', name: 'Masha', shortLabel: 'Masha', gramsPerUnit: 0.972, note: '1/12 Tola = 8 Ratti' },
  { id: 'ratti', name: 'Ratti', shortLabel: 'Ratti', gramsPerUnit: 0.1215, note: '1/96 Tola = 0.1215 g' },
  { id: 'gram', name: 'Gram', shortLabel: 'g', gramsPerUnit: 1, note: 'Metric base gram' },
  { id: 'milligram', name: 'Milligram', shortLabel: 'mg', gramsPerUnit: 0.001, note: '1/1,000 gram' },
  { id: 'ounce', name: 'Ounce (Troy)', shortLabel: 'ozt', gramsPerUnit: 31.1035, note: '1 troy oz = 31.1035 g' },
  { id: 'kilogram', name: 'Kilogram', shortLabel: 'kg', gramsPerUnit: 1000, note: '1,000 grams' },
];

export const GOLD_PURITY_MAP: Record<GoldKarat, { label: string; purity: number; percentageLabel: string }> = {
  '24K': { label: '24K (Pure Gold)', purity: 1, percentageLabel: '100%' },
  '22K': { label: '22K (Standard Jewellery)', purity: 0.9167, percentageLabel: '91.67%' },
  '21K': { label: '21K (Traditional)', purity: 0.875, percentageLabel: '87.5%' },
  '18K': { label: '18K (Stone Setting / Rings)', purity: 0.75, percentageLabel: '75%' },
};

export const GRAMS_PER_TOLA = 11.664;

export function getGramsPerUnit(unit: GoldWeightUnitId): number {
  const found = GOLD_WEIGHT_UNITS.find((u) => u.id === unit);
  return found ? found.gramsPerUnit : 1;
}

export function formatWeightNumber(val: number): string {
  if (!Number.isFinite(val) || Math.abs(val) < 1e-12) return '0';
  const rounded = Number(val.toFixed(4));
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function formatRsMoney(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return 'Rs. 0';
  return `Rs. ${Math.round(amount).toLocaleString('en-US')}`;
}

export interface ConvertedGoldWeightRow {
  unit: GoldWeightUnitDef;
  value: number;
  formatted: string;
}

export function convertGoldWeightToAll(
  weight: number,
  fromUnit: GoldWeightUnitId
): { totalGrams: number; rows: ConvertedGoldWeightRow[] } {
  const safeWeight = Number.isFinite(weight) && weight >= 0 ? weight : 0;
  const totalGrams = safeWeight * getGramsPerUnit(fromUnit);

  const rows: ConvertedGoldWeightRow[] = GOLD_WEIGHT_UNITS.map((unit) => {
    const val = totalGrams / unit.gramsPerUnit;
    return {
      unit,
      value: val,
      formatted: formatWeightNumber(val),
    };
  });

  return { totalGrams, rows };
}

export interface KaratRatesSummary {
  karat: GoldKarat;
  purity: number;
  perTola: number;
  per10Gram: number;
  perGram: number;
}

export function calculateKaratRates(rate24KPerTola: number, karat: GoldKarat): KaratRatesSummary {
  const safeRate = Number.isFinite(rate24KPerTola) && rate24KPerTola >= 0 ? rate24KPerTola : 0;
  const purity = GOLD_PURITY_MAP[karat].purity;
  const perTola = safeRate * purity;
  const perGram = perTola / GRAMS_PER_TOLA;
  const per10Gram = perGram * 10;
  return { karat, purity, perTola, per10Gram, perGram };
}

export type WastageMode = 'percent' | 'mashaPerTola';
export type MakingChargeMode = 'perTola' | 'perGram' | 'total';

export interface JewelleryCalculationInput {
  weight: number;
  unit: GoldWeightUnitId;
  karat: GoldKarat;
  rate24KPerTola: number;
  wastageMode: WastageMode;
  wastageValue: number; // % if 'percent', masha per tola if 'mashaPerTola'
  makingMode: MakingChargeMode;
  makingValue: number;
  stoneCost: number;
  gstPercent: number;
}

export interface JewelleryBreakdown {
  totalGrams: number;
  totalTolas: number;
  goldValue: number;
  wastageAmount: number;
  wastageEffectivePercent: number;
  makingChargesAmount: number;
  stoneCostAmount: number;
  subtotalBeforeTax: number;
  gstAmount: number;
  finalTotal: number;
  karatRates: KaratRatesSummary;
}

export function calculateJewelleryCost(input: JewelleryCalculationInput): JewelleryBreakdown {
  const safeWeight = Number.isFinite(input.weight) && input.weight >= 0 ? input.weight : 0;
  const totalGrams = safeWeight * getGramsPerUnit(input.unit);
  const totalTolas = totalGrams / GRAMS_PER_TOLA;

  const karatRates = calculateKaratRates(input.rate24KPerTola, input.karat);
  const goldValue = totalGrams * karatRates.perGram;

  const safeWastage = Number.isFinite(input.wastageValue) && input.wastageValue >= 0 ? input.wastageValue : 0;
  const wastageEffectivePercent =
    input.wastageMode === 'mashaPerTola' ? (safeWastage / 12) * 100 : safeWastage;
  const wastageAmount = goldValue * (wastageEffectivePercent / 100);

  const safeMaking = Number.isFinite(input.makingValue) && input.makingValue >= 0 ? input.makingValue : 0;
  let makingChargesAmount = 0;
  if (input.makingMode === 'perTola') {
    makingChargesAmount = totalTolas * safeMaking;
  } else if (input.makingMode === 'perGram') {
    makingChargesAmount = totalGrams * safeMaking;
  } else {
    makingChargesAmount = safeMaking;
  }

  const stoneCostAmount =
    Number.isFinite(input.stoneCost) && input.stoneCost >= 0 ? input.stoneCost : 0;

  const subtotalBeforeTax = goldValue + wastageAmount + makingChargesAmount + stoneCostAmount;
  const safeGst = Number.isFinite(input.gstPercent) && input.gstPercent >= 0 ? input.gstPercent : 0;
  const gstAmount = subtotalBeforeTax * (safeGst / 100);
  const finalTotal = subtotalBeforeTax + gstAmount;

  return {
    totalGrams,
    totalTolas,
    goldValue,
    wastageAmount,
    wastageEffectivePercent,
    makingChargesAmount,
    stoneCostAmount,
    subtotalBeforeTax,
    gstAmount,
    finalTotal,
    karatRates,
  };
}
