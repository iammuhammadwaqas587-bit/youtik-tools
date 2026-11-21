export interface Fraction {
  n: number;
  d: number;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0 ? 1 : x;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function makeFraction(n: number, d = 1): Fraction {
  if (d === 0) throw new Error('Division by zero in Wirasat fraction');
  if (n === 0) return { n: 0, d: 1 };
  const sign = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return { n: (sign * n) / g, d: Math.abs(d) / g };
}

export const ZERO_FRAC: Fraction = { n: 0, d: 1 };
export const ONE_FRAC: Fraction = { n: 1, d: 1 };

export function addFrac(a: Fraction, b: Fraction): Fraction {
  return makeFraction(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function subFrac(a: Fraction, b: Fraction): Fraction {
  return makeFraction(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function mulFrac(a: Fraction, b: Fraction): Fraction {
  return makeFraction(a.n * b.n, a.d * b.d);
}

export function divFrac(a: Fraction, b: Fraction): Fraction {
  return makeFraction(a.n * b.d, a.d * b.n);
}

export function cmpFrac(a: Fraction, b: Fraction): number {
  const diff = a.n * b.d - b.n * a.d;
  return diff === 0 ? 0 : diff > 0 ? 1 : -1;
}

export function formatFraction(f: Fraction): string {
  if (f.n === 0) return '0';
  if (f.d === 1) return `${f.n}/1`;
  return `${f.n}/${f.d}`;
}

export function fractionToPercent(f: Fraction): number {
  return f.d === 0 ? 0 : (f.n / f.d) * 100;
}

export type DeceasedGender = 'male' | 'female';

export interface WirasatHeirsInput {
  husband: number; // 0 or 1 (only when deceased is female)
  wives: number; // 0..4 (only when deceased is male)
  sons: number;
  daughters: number;
  father: number; // 0 or 1
  mother: number; // 0 or 1
  fullBrothers: number;
  fullSisters: number;
  paternalGrandfather: number; // 0 or 1
  paternalGrandmother: number; // 0 or 1
  maternalGrandmother: number; // 0 or 1
  grandsons: number; // son's sons
  granddaughters: number; // son's daughters
}

export interface WirasatEstateInput {
  deceasedGender: DeceasedGender;
  totalEstatePkr: number;
  funeralExpensesPkr: number;
  debtsPkr: number;
  wasiyyatPkr: number;
  heirs: WirasatHeirsInput;
}

export interface WirasatShareRow {
  key: string;
  heirLabel: string;
  count: number;
  totalShare: Fraction;
  perPersonShare: Fraction;
  percentage: number;
  amountPkr: number;
  perPersonAmountPkr: number;
  ruleExplanation: string;
  isBlocked: boolean;
}

export interface WirasatCalculationResult {
  totalEstatePkr: number;
  funeralExpensesPkr: number;
  debtsPkr: number;
  afterFuneralAndDebtsPkr: number;
  maxAllowedWasiyyatPkr: number;
  appliedWasiyyatPkr: number;
  wasiyyatExceededOneThird: boolean;
  netDistributableEstatePkr: number;
  commonDenominator: number;
  doctrineApplied: 'normal' | 'awl' | 'radd' | 'umariyyatayn';
  doctrineNote: string;
  unallocatedResiduePkr: number;
  rows: WirasatShareRow[];
}

export const INITIAL_HEIRS: WirasatHeirsInput = {
  husband: 0,
  wives: 1,
  sons: 2,
  daughters: 1,
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

function sanitizeInt(n: number, max = 999): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(max, Math.floor(n));
}

function sanitizeMoney(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Exact Sunni (Hanafi) Islamic Inheritance (Wirasat) calculator using exact rational arithmetic.
 */
export function calculateHanafiWirasat(input: WirasatEstateInput): WirasatCalculationResult {
  const totalEstatePkr = sanitizeMoney(input.totalEstatePkr);
  const funeralExpensesPkr = sanitizeMoney(input.funeralExpensesPkr);
  const debtsPkr = sanitizeMoney(input.debtsPkr);
  const requestedWasiyyat = sanitizeMoney(input.wasiyyatPkr);

  const afterFuneralAndDebtsPkr = Math.max(0, totalEstatePkr - funeralExpensesPkr - debtsPkr);
  const maxAllowedWasiyyatPkr = afterFuneralAndDebtsPkr / 3;
  const wasiyyatExceededOneThird =
    totalEstatePkr > 0 && requestedWasiyyat > maxAllowedWasiyyatPkr + 0.01;
  const appliedWasiyyatPkr =
    afterFuneralAndDebtsPkr > 0
      ? Math.min(requestedWasiyyat, maxAllowedWasiyyatPkr)
      : 0;
  const netDistributableEstatePkr = Math.max(0, afterFuneralAndDebtsPkr - appliedWasiyyatPkr);

  const h: WirasatHeirsInput = {
    husband: input.deceasedGender === 'female' ? sanitizeInt(input.heirs.husband, 1) : 0,
    wives: input.deceasedGender === 'male' ? sanitizeInt(input.heirs.wives, 4) : 0,
    sons: sanitizeInt(input.heirs.sons),
    daughters: sanitizeInt(input.heirs.daughters),
    father: sanitizeInt(input.heirs.father, 1),
    mother: sanitizeInt(input.heirs.mother, 1),
    fullBrothers: sanitizeInt(input.heirs.fullBrothers),
    fullSisters: sanitizeInt(input.heirs.fullSisters),
    paternalGrandfather: sanitizeInt(input.heirs.paternalGrandfather, 1),
    paternalGrandmother: sanitizeInt(input.heirs.paternalGrandmother, 1),
    maternalGrandmother: sanitizeInt(input.heirs.maternalGrandmother, 1),
    grandsons: sanitizeInt(input.heirs.grandsons),
    granddaughters: sanitizeInt(input.heirs.granddaughters),
  };

  interface WorkingEntry {
    key: string;
    heirLabel: string;
    count: number;
    fixedShare: Fraction;
    asabaShare: Fraction;
    isSpouse?: boolean;
    ruleExplanation: string;
    isBlocked: boolean;
  }

  const entries: WorkingEntry[] = [];
  const blockedNotes: WorkingEntry[] = [];

  const hasSons = h.sons > 0;
  const hasDaughters = h.daughters > 0;
  const effectiveGrandsons = hasSons ? 0 : h.grandsons;
  const effectiveGranddaughters =
    hasSons || (h.daughters >= 2 && h.grandsons === 0) ? 0 : h.granddaughters;

  const hasDescendants =
    h.sons > 0 || h.daughters > 0 || h.grandsons > 0 || h.granddaughters > 0;
  const hasMaleDescendants = h.sons > 0 || effectiveGrandsons > 0;
  const totalSiblings = h.fullBrothers + h.fullSisters;

  // Determine effective paternal ascendant (Father or Paternal Grandfather if Father absent)
  const effectiveFather = h.father > 0;
  const effectiveGrandfather = h.father === 0 && h.paternalGrandfather > 0;

  if (h.father > 0 && h.paternalGrandfather > 0) {
    blockedNotes.push({
      key: 'paternalGrandfather',
      heirLabel: 'Paternal Grandfather',
      count: h.paternalGrandfather,
      fixedShare: ZERO_FRAC,
      asabaShare: ZERO_FRAC,
      ruleExplanation: 'Excluded (hijab) because the father is alive.',
      isBlocked: true,
    });
  }

  // Grandmothers blocking rules
  const paternalGrandmotherBlockedByMother = h.mother > 0;
  const paternalGrandmotherBlockedByFather = h.father > 0;
  const paternalGrandmotherBlockedByGrandfather = h.father === 0 && h.paternalGrandfather > 0;
  const paternalGrandmotherInherits =
    h.paternalGrandmother > 0 &&
    !paternalGrandmotherBlockedByMother &&
    !paternalGrandmotherBlockedByFather &&
    !paternalGrandmotherBlockedByGrandfather;

  if (h.paternalGrandmother > 0 && !paternalGrandmotherInherits) {
    const reasons: string[] = [];
    if (paternalGrandmotherBlockedByMother) reasons.push('the mother is alive');
    if (paternalGrandmotherBlockedByFather) reasons.push('the father is alive');
    else if (paternalGrandmotherBlockedByGrandfather) reasons.push('the paternal grandfather is alive');
    blockedNotes.push({
      key: 'paternalGrandmother',
      heirLabel: 'Paternal Grandmother',
      count: h.paternalGrandmother,
      fixedShare: ZERO_FRAC,
      asabaShare: ZERO_FRAC,
      ruleExplanation: `Excluded (hijab) because ${reasons.join(' and ')}.`,
      isBlocked: true,
    });
  }

  const maternalGrandmotherInherits = h.maternalGrandmother > 0 && h.mother === 0;
  if (h.maternalGrandmother > 0 && !maternalGrandmotherInherits) {
    blockedNotes.push({
      key: 'maternalGrandmother',
      heirLabel: 'Maternal Grandmother',
      count: h.maternalGrandmother,
      fixedShare: ZERO_FRAC,
      asabaShare: ZERO_FRAC,
      ruleExplanation: 'Excluded (hijab) because the mother is alive.',
      isBlocked: true,
    });
  }

  // Grandchildren blocking explanations
  if (hasSons && h.grandsons > 0) {
    blockedNotes.push({
      key: 'grandsons',
      heirLabel: "Grandsons (Son's Sons)",
      count: h.grandsons,
      fixedShare: ZERO_FRAC,
      asabaShare: ZERO_FRAC,
      ruleExplanation: 'Excluded (hijab) because the deceased has a surviving son.',
      isBlocked: true,
    });
  }
  if (h.granddaughters > 0 && (hasSons || (h.daughters >= 2 && h.grandsons === 0))) {
    blockedNotes.push({
      key: 'granddaughters',
      heirLabel: "Granddaughters (Son's Daughters)",
      count: h.granddaughters,
      fixedShare: ZERO_FRAC,
      asabaShare: ZERO_FRAC,
      ruleExplanation: hasSons
        ? 'Excluded (hijab) because the deceased has a surviving son.'
        : 'Excluded because two or more daughters exhausted the 2/3 female cap and no grandson is present.',
      isBlocked: true,
    });
  }

  // Siblings blocking rules
  const siblingsBlockedBy = hasSons
    ? 'a surviving son is present'
    : effectiveGrandsons > 0
      ? 'a surviving grandson (son’s son) is present'
      : effectiveFather
        ? 'the father is alive'
        : effectiveGrandfather
          ? 'the paternal grandfather is alive (Hanafi rule)'
          : null;

  if (siblingsBlockedBy) {
    if (h.fullBrothers > 0) {
      blockedNotes.push({
        key: 'fullBrothers',
        heirLabel: h.fullBrothers === 1 ? 'Full Brother' : 'Full Brothers',
        count: h.fullBrothers,
        fixedShare: ZERO_FRAC,
        asabaShare: ZERO_FRAC,
        ruleExplanation: `Excluded (hijab) because ${siblingsBlockedBy}.`,
        isBlocked: true,
      });
    }
    if (h.fullSisters > 0) {
      blockedNotes.push({
        key: 'fullSisters',
        heirLabel: h.fullSisters === 1 ? 'Full Sister' : 'Full Sisters',
        count: h.fullSisters,
        fixedShare: ZERO_FRAC,
        asabaShare: ZERO_FRAC,
        ruleExplanation: `Excluded (hijab) because ${siblingsBlockedBy}.`,
        isBlocked: true,
      });
    }
  }

  // 1. SPOUSE SHARE
  let spouseShare = ZERO_FRAC;
  if (h.husband === 1) {
    spouseShare = hasDescendants ? makeFraction(1, 4) : makeFraction(1, 2);
    entries.push({
      key: 'husband',
      heirLabel: 'Husband',
      count: 1,
      fixedShare: spouseShare,
      asabaShare: ZERO_FRAC,
      isSpouse: true,
      ruleExplanation: hasDescendants
        ? '1/4 fixed share because the deceased has children or grandchildren.'
        : '1/2 fixed share because the deceased left no children or grandchildren.',
      isBlocked: false,
    });
  } else if (h.wives > 0) {
    spouseShare = hasDescendants ? makeFraction(1, 8) : makeFraction(1, 4);
    entries.push({
      key: 'wives',
      heirLabel: h.wives === 1 ? 'Wife' : 'Wives',
      count: h.wives,
      fixedShare: spouseShare,
      asabaShare: ZERO_FRAC,
      isSpouse: true,
      ruleExplanation: hasDescendants
        ? `1/8 fixed share${h.wives > 1 ? ' shared equally among wives' : ''} because children/grandchildren exist.`
        : `1/4 fixed share${h.wives > 1 ? ' shared equally among wives' : ''} because there are no children/grandchildren.`,
      isBlocked: false,
    });
  }

  // Check Special Umariyyatayn case: ONLY Spouse + Father (not grandfather) + Mother, no descendants, <2 siblings
  const isUmariyyatayn =
    (h.husband === 1 || h.wives > 0) &&
    h.father === 1 &&
    h.mother === 1 &&
    !hasDescendants &&
    totalSiblings < 2 &&
    !paternalGrandmotherInherits &&
    !maternalGrandmotherInherits;

  // 2. MOTHER
  if (h.mother === 1) {
    if (isUmariyyatayn) {
      const remainderAfterSpouse = subFrac(ONE_FRAC, spouseShare);
      const motherUmariShare = mulFrac(remainderAfterSpouse, makeFraction(1, 3));
      entries.push({
        key: 'mother',
        heirLabel: 'Mother',
        count: 1,
        fixedShare: motherUmariShare,
        asabaShare: ZERO_FRAC,
        ruleExplanation:
          'Umariyyatayn rule: 1/3 of the remainder after the spouse’s share (so father keeps double mother’s share).',
        isBlocked: false,
      });
    } else if (hasDescendants || totalSiblings >= 2) {
      entries.push({
        key: 'mother',
        heirLabel: 'Mother',
        count: 1,
        fixedShare: makeFraction(1, 6),
        asabaShare: ZERO_FRAC,
        ruleExplanation: hasDescendants
          ? '1/6 fixed share because children or grandchildren exist.'
          : '1/6 fixed share because two or more siblings exist.',
        isBlocked: false,
      });
    } else {
      entries.push({
        key: 'mother',
        heirLabel: 'Mother',
        count: 1,
        fixedShare: makeFraction(1, 3),
        asabaShare: ZERO_FRAC,
        ruleExplanation: '1/3 fixed share (no children/grandchildren and fewer than 2 siblings).',
        isBlocked: false,
      });
    }
  }

  // 3. GRANDMOTHERS (when inheriting)
  const inheritingGrandmotherCount =
    (paternalGrandmotherInherits ? 1 : 0) + (maternalGrandmotherInherits ? 1 : 0);
  if (inheritingGrandmotherCount > 0) {
    const eachGmShare = makeFraction(1, 6 * inheritingGrandmotherCount);
    const gmNote =
      inheritingGrandmotherCount === 2
        ? '1/6 fixed share split equally between maternal & paternal grandmothers (1/12 each).'
        : '1/6 fixed share because mother is absent.';
    if (paternalGrandmotherInherits) {
      entries.push({
        key: 'paternalGrandmother',
        heirLabel: 'Paternal Grandmother',
        count: 1,
        fixedShare: eachGmShare,
        asabaShare: ZERO_FRAC,
        ruleExplanation: gmNote,
        isBlocked: false,
      });
    }
    if (maternalGrandmotherInherits) {
      entries.push({
        key: 'maternalGrandmother',
        heirLabel: 'Maternal Grandmother',
        count: 1,
        fixedShare: eachGmShare,
        asabaShare: ZERO_FRAC,
        ruleExplanation: gmNote,
        isBlocked: false,
      });
    }
  }

  // 4. FATHER OR PATERNAL GRANDFATHER (fixed part)
  let fatherActsAsAsaba = false;
  if (effectiveFather || effectiveGrandfather) {
    const key = effectiveFather ? 'father' : 'paternalGrandfather';
    const label = effectiveFather ? 'Father' : 'Paternal Grandfather';
    const prefix = effectiveFather ? '' : 'Paternal grandfather inherits in place of absent father: ';

    if (hasMaleDescendants) {
      entries.push({
        key,
        heirLabel: label,
        count: 1,
        fixedShare: makeFraction(1, 6),
        asabaShare: ZERO_FRAC,
        ruleExplanation: `${prefix}1/6 fixed share because a male descendant (son/grandson) exists.`,
        isBlocked: false,
      });
    } else if (hasDescendants) {
      // Only female descendants -> 1/6 fixed + residue (Asaba)
      fatherActsAsAsaba = true;
      entries.push({
        key,
        heirLabel: label,
        count: 1,
        fixedShare: makeFraction(1, 6),
        asabaShare: ZERO_FRAC,
        ruleExplanation: `${prefix}1/6 fixed share plus remaining residue (asaba) alongside female descendants.`,
        isBlocked: false,
      });
    } else {
      // Pure Asaba (whole residue)
      fatherActsAsAsaba = true;
      entries.push({
        key,
        heirLabel: label,
        count: 1,
        fixedShare: ZERO_FRAC,
        asabaShare: ZERO_FRAC,
        ruleExplanation: `${prefix}Takes the entire remaining residue as primary agnatic heir (no children).`,
        isBlocked: false,
      });
    }
  }

  // 5. CHILDREN & GRANDCHILDREN (fixed parts & asaba assignment)
  let childrenAsabaWeight: { sonsKey: string; sonsLabel: string; sonsCount: number; daughtersKey?: string; daughtersLabel?: string; daughtersCount: number } | null = null;

  if (h.sons > 0) {
    childrenAsabaWeight = {
      sonsKey: 'sons',
      sonsLabel: h.sons === 1 ? 'Son' : 'Sons',
      sonsCount: h.sons,
      daughtersKey: h.daughters > 0 ? 'daughters' : undefined,
      daughtersLabel: h.daughters === 1 ? 'Daughter' : 'Daughters',
      daughtersCount: h.daughters,
    };
    entries.push({
      key: 'sons',
      heirLabel: childrenAsabaWeight.sonsLabel,
      count: h.sons,
      fixedShare: ZERO_FRAC,
      asabaShare: ZERO_FRAC,
      ruleExplanation:
        h.daughters > 0
          ? 'Residuary (asaba): shares remainder with daughters at a 2:1 ratio per son to daughter.'
          : 'Residuary (asaba): inherits the entire remainder after fixed shares.',
      isBlocked: false,
    });
    if (h.daughters > 0) {
      entries.push({
        key: 'daughters',
        heirLabel: childrenAsabaWeight.daughtersLabel!,
        count: h.daughters,
        fixedShare: ZERO_FRAC,
        asabaShare: ZERO_FRAC,
        ruleExplanation: 'Residuary with son(s) (asaba bil-ghayr): receives half of each son’s share.',
        isBlocked: false,
      });
    }
  } else {
    // No sons
    if (h.daughters === 1) {
      entries.push({
        key: 'daughters',
        heirLabel: 'Daughter',
        count: 1,
        fixedShare: makeFraction(1, 2),
        asabaShare: ZERO_FRAC,
        ruleExplanation: '1/2 fixed share as an only daughter with no sons.',
        isBlocked: false,
      });
      if (effectiveGrandsons > 0) {
        childrenAsabaWeight = {
          sonsKey: 'grandsons',
          sonsLabel: effectiveGrandsons === 1 ? "Grandson (Son's Son)" : "Grandsons (Son's Sons)",
          sonsCount: effectiveGrandsons,
          daughtersKey: effectiveGranddaughters > 0 ? 'granddaughters' : undefined,
          daughtersLabel:
            effectiveGranddaughters === 1 ? "Granddaughter (Son's Daughter)" : "Granddaughters (Son's Daughters)",
          daughtersCount: effectiveGranddaughters,
        };
        entries.push({
          key: 'grandsons',
          heirLabel: childrenAsabaWeight.sonsLabel,
          count: effectiveGrandsons,
          fixedShare: ZERO_FRAC,
          asabaShare: ZERO_FRAC,
          ruleExplanation: 'Residuary (asaba): son is absent, so son’s son takes remainder (2:1 with granddaughters).',
          isBlocked: false,
        });
        if (effectiveGranddaughters > 0) {
          entries.push({
            key: 'granddaughters',
            heirLabel: childrenAsabaWeight.daughtersLabel!,
            count: effectiveGranddaughters,
            fixedShare: ZERO_FRAC,
            asabaShare: ZERO_FRAC,
            ruleExplanation: 'Residuary alongside grandson (asaba bil-ghayr) at half of grandson’s share.',
            isBlocked: false,
          });
        }
      } else if (effectiveGranddaughters > 0) {
        entries.push({
          key: 'granddaughters',
          heirLabel:
            effectiveGranddaughters === 1 ? "Granddaughter (Son's Daughter)" : "Granddaughters (Son's Daughters)",
          count: effectiveGranddaughters,
          fixedShare: makeFraction(1, 6),
          asabaShare: ZERO_FRAC,
          ruleExplanation: '1/6 fixed share (completes 2/3 female children quota alongside 1 daughter).',
          isBlocked: false,
        });
      }
    } else if (h.daughters >= 2) {
      entries.push({
        key: 'daughters',
        heirLabel: 'Daughters',
        count: h.daughters,
        fixedShare: makeFraction(2, 3),
        asabaShare: ZERO_FRAC,
        ruleExplanation: '2/3 fixed share split equally among two or more daughters.',
        isBlocked: false,
      });
      if (effectiveGrandsons > 0) {
        childrenAsabaWeight = {
          sonsKey: 'grandsons',
          sonsLabel: effectiveGrandsons === 1 ? "Grandson (Son's Son)" : "Grandsons (Son's Sons)",
          sonsCount: effectiveGrandsons,
          daughtersKey: effectiveGranddaughters > 0 ? 'granddaughters' : undefined,
          daughtersLabel:
            effectiveGranddaughters === 1 ? "Granddaughter (Son's Daughter)" : "Granddaughters (Son's Daughters)",
          daughtersCount: effectiveGranddaughters,
        };
        entries.push({
          key: 'grandsons',
          heirLabel: childrenAsabaWeight.sonsLabel,
          count: effectiveGrandsons,
          fixedShare: ZERO_FRAC,
          asabaShare: ZERO_FRAC,
          ruleExplanation: 'Residuary (asaba): takes remainder after daughters’ 2/3 and fixed shares.',
          isBlocked: false,
        });
        if (effectiveGranddaughters > 0) {
          entries.push({
            key: 'granddaughters',
            heirLabel: childrenAsabaWeight.daughtersLabel!,
            count: effectiveGranddaughters,
            fixedShare: ZERO_FRAC,
            asabaShare: ZERO_FRAC,
            ruleExplanation: 'Agnatized as residuary by grandson (takes 1 unit per 2 units of grandson).',
            isBlocked: false,
          });
        }
      }
    } else if (effectiveGrandsons > 0) {
      childrenAsabaWeight = {
        sonsKey: 'grandsons',
        sonsLabel: effectiveGrandsons === 1 ? "Grandson (Son's Son)" : "Grandsons (Son's Sons)",
        sonsCount: effectiveGrandsons,
        daughtersKey: effectiveGranddaughters > 0 ? 'granddaughters' : undefined,
        daughtersLabel:
          effectiveGranddaughters === 1 ? "Granddaughter (Son's Daughter)" : "Granddaughters (Son's Daughters)",
        daughtersCount: effectiveGranddaughters,
      };
      entries.push({
        key: 'grandsons',
        heirLabel: childrenAsabaWeight.sonsLabel,
        count: effectiveGrandsons,
        fixedShare: ZERO_FRAC,
        asabaShare: ZERO_FRAC,
        ruleExplanation: 'Residuary (asaba): inherits like sons since no children exist.',
        isBlocked: false,
      });
      if (effectiveGranddaughters > 0) {
        entries.push({
          key: 'granddaughters',
          heirLabel: childrenAsabaWeight.daughtersLabel!,
          count: effectiveGranddaughters,
          fixedShare: ZERO_FRAC,
          asabaShare: ZERO_FRAC,
          ruleExplanation: 'Residuary alongside grandson (2:1 male-to-female ratio).',
          isBlocked: false,
        });
      }
    } else if (effectiveGranddaughters > 0) {
      const gdShare = effectiveGranddaughters === 1 ? makeFraction(1, 2) : makeFraction(2, 3);
      entries.push({
        key: 'granddaughters',
        heirLabel:
          effectiveGranddaughters === 1 ? "Granddaughter (Son's Daughter)" : "Granddaughters (Son's Daughters)",
        count: effectiveGranddaughters,
        fixedShare: gdShare,
        asabaShare: ZERO_FRAC,
        ruleExplanation:
          effectiveGranddaughters === 1
            ? '1/2 fixed share as only granddaughter in absence of children.'
            : '2/3 fixed share split equally among granddaughters in absence of children.',
        isBlocked: false,
      });
    }
  }

  // 6. FULL BROTHERS & SISTERS (if not blocked by son/grandson/father/grandfather)
  let siblingsAsabaActive = false;
  if (!siblingsBlockedBy && (h.fullBrothers > 0 || h.fullSisters > 0)) {
    const hasFemaleDescendant = h.daughters > 0 || effectiveGranddaughters > 0;
    if (h.fullBrothers > 0 || hasFemaleDescendant) {
      // Asaba (either brothers present, or sisters become Asaba ma'al-ghayr with daughters/granddaughters)
      siblingsAsabaActive = true;
      if (h.fullBrothers > 0) {
        entries.push({
          key: 'fullBrothers',
          heirLabel: h.fullBrothers === 1 ? 'Full Brother' : 'Full Brothers',
          count: h.fullBrothers,
          fixedShare: ZERO_FRAC,
          asabaShare: ZERO_FRAC,
          ruleExplanation:
            h.fullSisters > 0
              ? 'Residuary (asaba): shares remainder with full sisters at a 2:1 ratio.'
              : 'Residuary (asaba): takes remaining residue after fixed shares.',
          isBlocked: false,
        });
      }
      if (h.fullSisters > 0) {
        entries.push({
          key: 'fullSisters',
          heirLabel: h.fullSisters === 1 ? 'Full Sister' : 'Full Sisters',
          count: h.fullSisters,
          fixedShare: ZERO_FRAC,
          asabaShare: ZERO_FRAC,
          ruleExplanation:
            h.fullBrothers > 0
              ? 'Residuary with full brother(s) at half of brother’s share.'
              : 'Residuary with daughters/granddaughters (asaba ma‘al-ghayr): takes remaining residue.',
          isBlocked: false,
        });
      }
    } else {
      // Kalalah: only full sister(s), no brothers, no descendants, no father/grandfather
      const sisShare = h.fullSisters === 1 ? makeFraction(1, 2) : makeFraction(2, 3);
      entries.push({
        key: 'fullSisters',
        heirLabel: h.fullSisters === 1 ? 'Full Sister' : 'Full Sisters',
        count: h.fullSisters,
        fixedShare: sisShare,
        asabaShare: ZERO_FRAC,
        ruleExplanation:
          h.fullSisters === 1
            ? '1/2 fixed share (single full sister with no father, grandfather, children, or brothers).'
            : '2/3 fixed share split equally (two or more full sisters with no father, grandfather, children, or brothers).',
        isBlocked: false,
      });
    }
  }

  // Sum all fixed shares
  let totalFixed = ZERO_FRAC;
  for (const e of entries) {
    totalFixed = addFrac(totalFixed, e.fixedShare);
  }

  let doctrineApplied: WirasatCalculationResult['doctrineApplied'] = isUmariyyatayn ? 'umariyyatayn' : 'normal';
  let doctrineNote = isUmariyyatayn
    ? 'Umariyyatayn (two special cases decided by Caliph Umar RA) applied: the mother receives 1/3 of the remainder after the spouse’s share so the father receives double the mother’s share.'
    : '';

  const fixedCmpOne = cmpFrac(totalFixed, ONE_FRAC);
  const hasAsaba = Boolean(childrenAsabaWeight || fatherActsAsAsaba || siblingsAsabaActive);

  if (fixedCmpOne > 0) {
    // 'AWL CASE: fixed shares exceed 1 -> scale all fixed shares proportionally by 1 / totalFixed
    doctrineApplied = 'awl';
    doctrineNote = `'Awl applied: total fixed Quranic shares equaled ${formatFraction(totalFixed)} (more than 100%). Every fixed share was scaled down proportionally using common denominator ${totalFixed.n} so the estate totals exactly 100%.`;
    for (const e of entries) {
      if (e.fixedShare.n > 0) {
        e.fixedShare = divFrac(e.fixedShare, totalFixed);
      }
    }
  } else if (fixedCmpOne < 0) {
    const residue = subFrac(ONE_FRAC, totalFixed);
    if (hasAsaba) {
      // Distribute residue to highest-priority Asaba:
      // Priority 1: Sons / Grandsons (+ Daughters/Granddaughters)
      // Priority 2: Father / Paternal Grandfather (if no male descendants)
      // Priority 3: Full Brothers / Full Sisters (only if Father/Grandfather & male descendants absent)
      if (childrenAsabaWeight) {
        const totalUnits = childrenAsabaWeight.sonsCount * 2 + childrenAsabaWeight.daughtersCount;
        const unitShare = divFrac(residue, makeFraction(totalUnits, 1));
        const sonsEntry = entries.find((e) => e.key === childrenAsabaWeight!.sonsKey);
        if (sonsEntry) {
          sonsEntry.asabaShare = mulFrac(unitShare, makeFraction(childrenAsabaWeight.sonsCount * 2, 1));
        }
        if (childrenAsabaWeight.daughtersKey) {
          const dEntry = entries.find((e) => e.key === childrenAsabaWeight!.daughtersKey);
          if (dEntry) {
            dEntry.asabaShare = mulFrac(unitShare, makeFraction(childrenAsabaWeight.daughtersCount, 1));
          }
        }
      } else if (fatherActsAsAsaba) {
        const fKey = effectiveFather ? 'father' : 'paternalGrandfather';
        const fEntry = entries.find((e) => e.key === fKey);
        if (fEntry) {
          fEntry.asabaShare = residue;
        }
      } else if (siblingsAsabaActive) {
        const totalUnits = h.fullBrothers * 2 + h.fullSisters;
        const unitShare = divFrac(residue, makeFraction(totalUnits, 1));
        if (h.fullBrothers > 0) {
          const bEntry = entries.find((e) => e.key === 'fullBrothers');
          if (bEntry) bEntry.asabaShare = mulFrac(unitShare, makeFraction(h.fullBrothers * 2, 1));
        }
        if (h.fullSisters > 0) {
          const sEntry = entries.find((e) => e.key === 'fullSisters');
          if (sEntry) sEntry.asabaShare = mulFrac(unitShare, makeFraction(h.fullSisters, 1));
        }
      }
    } else {
      // RADD CASE: total fixed shares < 1 and NO Asaba exist.
      // Return surplus to non-spouse fixed sharers proportionally!
      const nonSpouseFixed = entries.filter((e) => !e.isSpouse && e.fixedShare.n > 0);
      if (nonSpouseFixed.length > 0) {
        doctrineApplied = 'radd';
        let nonSpouseSum = ZERO_FRAC;
        for (const e of nonSpouseFixed) nonSpouseSum = addFrac(nonSpouseSum, e.fixedShare);
        const targetForNonSpouse = subFrac(ONE_FRAC, spouseShare);

        for (const e of nonSpouseFixed) {
          const raddTotal = mulFrac(divFrac(e.fixedShare, nonSpouseSum), targetForNonSpouse);
          e.asabaShare = subFrac(raddTotal, e.fixedShare);
        }

        doctrineNote =
          spouseShare.n > 0
            ? `Radd applied: fixed shares totaled ${formatFraction(totalFixed)} with no residuaries. Under Hanafi law, the spouse keeps their fixed share (${formatFraction(spouseShare)}) and the surplus (${formatFraction(residue)}) is returned proportionally to the remaining blood heirs.`
            : `Radd applied: fixed shares totaled ${formatFraction(totalFixed)} with no residuaries. The surplus (${formatFraction(residue)}) has been returned proportionally to the heirs so the full 100% is distributed.`;
      }
    }
  }

  const allEntries = [...entries, ...blockedNotes];

  let commonDenominator = 1;
  let totalDistributed = ZERO_FRAC;

  const rows: WirasatShareRow[] = allEntries.map((e) => {
    const totalShare = addFrac(e.fixedShare, e.asabaShare);
    totalDistributed = addFrac(totalDistributed, totalShare);
    if (totalShare.n > 0) {
      commonDenominator = lcm(commonDenominator, totalShare.d);
    }
    const perPersonShare = e.count > 0 ? divFrac(totalShare, makeFraction(e.count, 1)) : ZERO_FRAC;
    const percentage = fractionToPercent(totalShare);
    const amountPkr = totalShare.d > 0 ? (netDistributableEstatePkr * totalShare.n) / totalShare.d : 0;
    const perPersonAmountPkr = e.count > 0 ? amountPkr / e.count : 0;

    return {
      key: e.key,
      heirLabel: e.heirLabel,
      count: e.count,
      totalShare,
      perPersonShare,
      percentage,
      amountPkr,
      perPersonAmountPkr,
      ruleExplanation: e.ruleExplanation,
      isBlocked: e.isBlocked,
    };
  });

  const remainingFrac = subFrac(ONE_FRAC, totalDistributed);
  const unallocatedResiduePkr =
    remainingFrac.n > 0 && remainingFrac.d > 0
      ? (netDistributableEstatePkr * remainingFrac.n) / remainingFrac.d
      : 0;

  if (unallocatedResiduePkr > 0.01 && !doctrineNote && entries.length > 0) {
    doctrineNote =
      'Only a spouse is listed without other Quranic/agnatic heirs; their fixed share is shown and the remaining estate falls to Dhawil-Arham / Bait-ul-Mal per Hanafi law.';
  }

  return {
    totalEstatePkr,
    funeralExpensesPkr,
    debtsPkr,
    afterFuneralAndDebtsPkr,
    maxAllowedWasiyyatPkr,
    appliedWasiyyatPkr,
    wasiyyatExceededOneThird,
    netDistributableEstatePkr,
    commonDenominator,
    doctrineApplied,
    doctrineNote,
    unallocatedResiduePkr,
    rows,
  };
}
