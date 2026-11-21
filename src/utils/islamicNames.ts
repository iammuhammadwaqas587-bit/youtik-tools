import {
  ISLAMIC_BABY_NAMES_DATA,
  type IslamicBabyNameEntry,
  type BabyGender,
  type NameTag,
} from '../data/islamicBabyNames';

export type NameLengthFilter = 'all' | 'short' | 'medium' | 'long';
export type NameSortMode = 'popular' | 'az';

export const ALL_NAME_TAGS: NameTag[] = [
  'Quranic',
  "Prophet's Name",
  'Companion (Sahabi)',
  'Sahabiyat',
  'Short',
  'Modern',
  'Traditional',
  'Nature',
  'Light',
  'Wisdom',
  'Noble',
];

export function getNameLengthBucket(name: string): Exclude<NameLengthFilter, 'all'> {
  const cleanLen = name.replace(/[^a-zA-Z]/g, '').length;
  if (cleanLen <= 4) return 'short';
  if (cleanLen <= 6) return 'medium';
  return 'long';
}

export interface BabyNameFilterOptions {
  search: string;
  gender: 'all' | BabyGender;
  letter: string; // 'ALL' or 'A'..'Z'
  tags: NameTag[];
  lengthFilter: NameLengthFilter;
  sortBy: NameSortMode;
}

export function filterAndSortBabyNames(
  opts: BabyNameFilterOptions,
  dataset: IslamicBabyNameEntry[] = ISLAMIC_BABY_NAMES_DATA
): IslamicBabyNameEntry[] {
  const q = opts.search.trim().toLowerCase();

  const filtered = dataset.filter((item) => {
    if (opts.gender !== 'all') {
      if (item.gender !== opts.gender && item.gender !== 'unisex') {
        return false;
      }
      if (opts.gender === 'unisex' && item.gender !== 'unisex') {
        return false;
      }
    }

    if (opts.letter !== 'ALL' && item.letter.toUpperCase() !== opts.letter.toUpperCase()) {
      return false;
    }

    if (opts.lengthFilter !== 'all') {
      if (getNameLengthBucket(item.name) !== opts.lengthFilter) {
        return false;
      }
    }

    if (opts.tags.length > 0) {
      const hasEveryTag = opts.tags.every((t) => item.tags.includes(t));
      if (!hasEveryTag) return false;
    }

    if (q) {
      const matchesEn = item.name.toLowerCase().includes(q);
      const matchesMeaningEn = item.meaningEn.toLowerCase().includes(q);
      const matchesUrdu = item.urdu.includes(opts.search.trim());
      const matchesArabic = item.arabic.includes(opts.search.trim());
      const matchesMeaningUr = item.meaningUr.includes(opts.search.trim());
      const matchesOrigin = item.origin.toLowerCase().includes(q);
      if (
        !matchesEn &&
        !matchesMeaningEn &&
        !matchesUrdu &&
        !matchesArabic &&
        !matchesMeaningUr &&
        !matchesOrigin
      ) {
        return false;
      }
    }

    return true;
  });

  const sorted = [...filtered];
  if (opts.sortBy === 'az') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sorted.sort((a, b) => {
      const ra = a.popularRank ?? 9999;
      const rb = b.popularRank ?? 9999;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
  }

  return sorted;
}

export function getSuggestedSecondNames(
  firstName: IslamicBabyNameEntry,
  surname: string,
  dataset: IslamicBabyNameEntry[] = ISLAMIC_BABY_NAMES_DATA
): Array<{
  fullEn: string;
  fullUr: string;
  meaningSummary: string;
}> {
  const cleanSurname = surname.trim();
  const baseFirstEn = firstName.name;
  const baseFirstUr = firstName.urdu;

  const suggestions: Array<{ fullEn: string; fullUr: string; meaningSummary: string }> = [];

  if (cleanSurname) {
    suggestions.push({
      fullEn: `${baseFirstEn} ${cleanSurname}`,
      fullUr: `${baseFirstUr} ${cleanSurname}`,
      meaningSummary: `${firstName.meaningEn} — direct combination with family name`,
    });
  }

  // Pair with 5 harmonious middle/companion names matching gender
  const candidates = dataset
    .filter(
      (c) =>
        c.name !== firstName.name &&
        (c.gender === firstName.gender || c.gender === 'unisex') &&
        c.name.length <= 7
    )
    .slice(0, 5);

  for (const cand of candidates) {
    const fullEn = cleanSurname ? `${baseFirstEn} ${cand.name} ${cleanSurname}` : `${baseFirstEn} ${cand.name}`;
    const fullUr = cleanSurname ? `${baseFirstUr} ${cand.urdu} ${cleanSurname}` : `${baseFirstUr} ${cand.urdu}`;
    suggestions.push({
      fullEn,
      fullUr,
      meaningSummary: `${firstName.name} (${firstName.meaningEn}) + ${cand.name} (${cand.meaningEn})`,
    });
  }

  return suggestions;
}
