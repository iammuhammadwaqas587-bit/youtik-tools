export type LandAreaUnitId =
  | 'sqft'
  | 'sqyd'
  | 'sqm'
  | 'sarsai'
  | 'marla'
  | 'kanal'
  | 'acre'
  | 'killa'
  | 'murabba'
  | 'hectare'
  | 'bigha'
  | 'jarib';

export type MarlaStandardSqFt = 272.25 | 225;

export interface LandAreaUnitDef {
  id: LandAreaUnitId;
  name: string;
  shortLabel: string;
  note: string;
}

export const LAND_AREA_UNITS: LandAreaUnitDef[] = [
  { id: 'sqft', name: 'Square Feet', shortLabel: 'sq ft', note: '1 sq ft base unit' },
  { id: 'sqyd', name: 'Square Yards', shortLabel: 'sq yd (Gaj)', note: '1 sq yd = 9 sq ft' },
  { id: 'sqm', name: 'Square Meters', shortLabel: 'sq m', note: '1 sq m = 10.7639 sq ft' },
  { id: 'sarsai', name: 'Sarsai', shortLabel: 'Sarsai', note: '1/9 of 1 Marla' },
  { id: 'marla', name: 'Marla', shortLabel: 'Marla', note: '272.25 or 225 sq ft' },
  { id: 'kanal', name: 'Kanal', shortLabel: 'Kanal', note: '20 Marla' },
  { id: 'acre', name: 'Acre', shortLabel: 'Acre', note: '43,560 sq ft' },
  { id: 'killa', name: 'Killa', shortLabel: 'Killa', note: '1 Killa = 1 Acre' },
  { id: 'murabba', name: 'Murabba', shortLabel: 'Murabba', note: '25 Acres (1,089,000 sq ft)' },
  { id: 'hectare', name: 'Hectare', shortLabel: 'Hectare', note: '107,639 sq ft (10,000 sq m)' },
  { id: 'bigha', name: 'Bigha (Punjab)', shortLabel: 'Bigha', note: '4 standard Kanals (21,780 sq ft)' },
  { id: 'jarib', name: 'Jarib', shortLabel: 'Jarib', note: '4 standard Kanals (21,780 sq ft)' },
];

export function getSqFtPerUnit(unit: LandAreaUnitId, marlaSqFt: MarlaStandardSqFt): number {
  switch (unit) {
    case 'sqft':
      return 1;
    case 'sqyd':
      return 9;
    case 'sqm':
      return 10.7639;
    case 'sarsai':
      return marlaSqFt / 9; // 30.25 at 272.25, 25 at 225
    case 'marla':
      return marlaSqFt;
    case 'kanal':
      return marlaSqFt * 20; // 5,445 at 272.25, 4,500 at 225
    case 'acre':
      return 43560;
    case 'killa':
      return 43560;
    case 'murabba':
      return 43560 * 25; // 1,089,000
    case 'hectare':
      return 107639;
    case 'bigha':
      return 21780; // 0.5 Acre / 4 standard Punjab Kanals
    case 'jarib':
      return 21780; // 0.5 Acre / 4 standard Punjab Kanals
  }
}

export interface ConvertedLandAreaRow {
  unit: LandAreaUnitDef;
  value: number;
  formatted: string;
}

export function formatAreaNumber(val: number): string {
  if (!Number.isFinite(val)) return '0';
  if (Math.abs(val) < 1e-9) return '0';
  const rounded = Number(val.toFixed(4));
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function convertLandAreaToAll(
  value: number,
  fromUnit: LandAreaUnitId,
  marlaSqFt: MarlaStandardSqFt
): { totalSqFt: number; rows: ConvertedLandAreaRow[] } {
  const safeVal = Number.isFinite(value) && value >= 0 ? value : 0;
  const totalSqFt = safeVal * getSqFtPerUnit(fromUnit, marlaSqFt);

  const rows: ConvertedLandAreaRow[] = LAND_AREA_UNITS.map((unit) => {
    const converted = totalSqFt / getSqFtPerUnit(unit.id, marlaSqFt);
    return {
      unit,
      value: converted,
      formatted: formatAreaNumber(converted),
    };
  });

  return { totalSqFt, rows };
}

export function formatPkrAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return 'Rs. 0';
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString('en-US')}`;
}

const BELOW_TWENTY = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS_WORDS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitsToWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return BELOW_TWENTY[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o > 0 ? `${TENS_WORDS[t]} ${BELOW_TWENTY[o]}` : TENS_WORDS[t];
}

function threeDigitsToWords(n: number): string {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${BELOW_TWENTY[h]} Hundred`);
  if (rem > 0) parts.push(twoDigitsToWords(rem));
  return parts.join(' ');
}

/**
 * Converts a non-negative rupee amount into Pakistani Lakh / Crore words
 * plus a compact Crore/Lakh summary label.
 */
export function formatPkrInLakhCroreWords(amount: number): {
  fullWords: string;
  compactScale: string;
} {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { fullWords: 'Zero Rupees', compactScale: '0 Rupees' };
  }

  const n = Math.round(amount);
  const arab = Math.floor(n / 1000000000); // 100 Crore
  const crore = Math.floor((n % 1000000000) / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundreds = n % 1000;

  const wordParts: string[] = [];
  if (arab > 0) wordParts.push(`${threeDigitsToWords(arab)} Arab`);
  if (crore > 0) wordParts.push(`${twoDigitsToWords(crore)} Crore`);
  if (lakh > 0) wordParts.push(`${twoDigitsToWords(lakh)} Lakh`);
  if (thousand > 0) wordParts.push(`${twoDigitsToWords(thousand)} Thousand`);
  if (hundreds > 0) wordParts.push(threeDigitsToWords(hundreds));

  const fullWords = `${wordParts.join(' ')} Rupees`;

  let compactScale = `${n.toLocaleString('en-US')} Rupees`;
  if (n >= 10000000) {
    const croreNum = n / 10000000;
    compactScale = `${Number(croreNum.toFixed(2)).toLocaleString('en-US')} Crore PKR`;
  } else if (n >= 100000) {
    const lakhNum = n / 100000;
    compactScale = `${Number(lakhNum.toFixed(2)).toLocaleString('en-US')} Lakh PKR`;
  }

  return { fullWords, compactScale };
}
