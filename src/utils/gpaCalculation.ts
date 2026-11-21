export interface GradeDefinition {
  grade: string;
  points: number;
}

export interface MarksRule {
  grade: string;
  minPercent: number;
  points: number;
}

export type GradingScalePreset = '4.0' | '5.0' | 'custom';
export type InputMode = 'grade' | 'marks';

export interface CourseRowInput {
  id: string;
  courseName: string;
  creditHours: string;
  grade: string;
  marks: string;
}

export interface SemesterEntryInput {
  id: string;
  label: string;
  gpa: string;
  creditHours: string;
}

export const DEFAULT_SCALE_4: GradeDefinition[] = [
  { grade: 'A', points: 4.0 },
  { grade: 'A-', points: 3.67 },
  { grade: 'B+', points: 3.33 },
  { grade: 'B', points: 3.0 },
  { grade: 'B-', points: 2.67 },
  { grade: 'C+', points: 2.33 },
  { grade: 'C', points: 2.0 },
  { grade: 'C-', points: 1.67 },
  { grade: 'D+', points: 1.33 },
  { grade: 'D', points: 1.0 },
  { grade: 'F', points: 0 },
];

export const DEFAULT_SCALE_5: GradeDefinition[] = [
  { grade: 'A', points: 5.0 },
  { grade: 'A-', points: 4.5 },
  { grade: 'B+', points: 4.0 },
  { grade: 'B', points: 3.5 },
  { grade: 'B-', points: 3.0 },
  { grade: 'C+', points: 2.5 },
  { grade: 'C', points: 2.0 },
  { grade: 'C-', points: 1.5 },
  { grade: 'D+', points: 1.25 },
  { grade: 'D', points: 1.0 },
  { grade: 'F', points: 0 },
];

export const DEFAULT_MARKS_TABLE: MarksRule[] = [
  { grade: 'A', minPercent: 85, points: 4.0 },
  { grade: 'A-', minPercent: 80, points: 3.67 },
  { grade: 'B+', minPercent: 75, points: 3.33 },
  { grade: 'B', minPercent: 70, points: 3.0 },
  { grade: 'B-', minPercent: 65, points: 2.67 },
  { grade: 'C+', minPercent: 61, points: 2.33 },
  { grade: 'C', minPercent: 58, points: 2.0 },
  { grade: 'C-', minPercent: 55, points: 1.67 },
  { grade: 'D', minPercent: 50, points: 1.0 },
  { grade: 'F', minPercent: 0, points: 0 },
];

export function resolveMarksToRule(marks: number, table: MarksRule[]): MarksRule {
  const sorted = [...table].sort((a, b) => b.minPercent - a.minPercent);
  for (const row of sorted) {
    if (marks >= row.minPercent) {
      return row;
    }
  }
  return sorted[sorted.length - 1] || { grade: 'F', minPercent: 0, points: 0 };
}

export interface CourseEvaluation {
  id: string;
  isActive: boolean;
  isValid: boolean;
  error: string | null;
  credits: number;
  gradeLabel: string;
  gradePoint: number;
  qualityPoints: number;
}

export interface SemesterGpaSummary {
  rows: CourseEvaluation[];
  totalCredits: number;
  totalQualityPoints: number;
  gpa: number;
  maxScale: number;
  approximatePercentage: number;
  hasErrors: boolean;
}

export function calculateSemesterGpa(params: {
  courses: CourseRowInput[];
  inputMode: InputMode;
  scale: GradeDefinition[];
  marksTable: MarksRule[];
}): SemesterGpaSummary {
  const { courses, inputMode, scale, marksTable } = params;
  const maxScale = Math.max(0.01, ...scale.map((s) => s.points));
  const scaleMap = new Map(scale.map((s) => [s.grade, s.points]));

  let totalCredits = 0;
  let totalQualityPoints = 0;
  let hasErrors = false;

  const rows: CourseEvaluation[] = courses.map((row) => {
    const hasCreditText = row.creditHours.trim() !== '';
    const hasMarksText = row.marks.trim() !== '';
    const hasNameText = row.courseName.trim() !== '';

    const isBlankRow =
      !hasCreditText &&
      !hasNameText &&
      (inputMode === 'grade' || !hasMarksText);

    if (isBlankRow) {
      return {
        id: row.id,
        isActive: false,
        isValid: true,
        error: null,
        credits: 0,
        gradeLabel: inputMode === 'grade' ? row.grade : '-',
        gradePoint: 0,
        qualityPoints: 0,
      };
    }

    const credits = parseFloat(row.creditHours);
    if (!hasCreditText || !Number.isFinite(credits) || credits <= 0) {
      hasErrors = true;
      return {
        id: row.id,
        isActive: true,
        isValid: false,
        error: 'Credit hours must be greater than 0.',
        credits: 0,
        gradeLabel: '-',
        gradePoint: 0,
        qualityPoints: 0,
      };
    }

    if (inputMode === 'marks') {
      const marksNum = parseFloat(row.marks);
      if (!hasMarksText || !Number.isFinite(marksNum) || marksNum < 0 || marksNum > 100) {
        hasErrors = true;
        return {
          id: row.id,
          isActive: true,
          isValid: false,
          error: 'Marks must be between 0 and 100.',
          credits,
          gradeLabel: '-',
          gradePoint: 0,
          qualityPoints: 0,
        };
      }

      const matched = resolveMarksToRule(marksNum, marksTable);
      const qp = credits * matched.points;
      totalCredits += credits;
      totalQualityPoints += qp;

      return {
        id: row.id,
        isActive: true,
        isValid: true,
        error: null,
        credits,
        gradeLabel: matched.grade,
        gradePoint: matched.points,
        qualityPoints: qp,
      };
    }

    const gp = scaleMap.get(row.grade) ?? 0;
    const qp = credits * gp;
    totalCredits += credits;
    totalQualityPoints += qp;

    return {
      id: row.id,
      isActive: true,
      isValid: true,
      error: null,
      credits,
      gradeLabel: row.grade,
      gradePoint: gp,
      qualityPoints: qp,
    };
  });

  const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  const approximatePercentage = maxScale > 0 ? Math.min(100, (gpa / maxScale) * 100) : 0;

  return {
    rows,
    totalCredits,
    totalQualityPoints,
    gpa,
    maxScale,
    approximatePercentage,
    hasErrors,
  };
}

export interface CumulativeCgpaSummary {
  totalCredits: number;
  totalQualityPoints: number;
  cgpa: number;
  approximatePercentage: number;
  invalidIds: Record<string, string>;
}

export function calculateCumulativeCgpa(
  semesters: SemesterEntryInput[],
  maxScale: number
): CumulativeCgpaSummary {
  let totalCredits = 0;
  let totalQualityPoints = 0;
  const invalidIds: Record<string, string> = {};

  for (const sem of semesters) {
    const hasGpa = sem.gpa.trim() !== '';
    const hasCr = sem.creditHours.trim() !== '';
    if (!hasGpa && !hasCr) continue;

    const gpaNum = parseFloat(sem.gpa);
    const crNum = parseFloat(sem.creditHours);

    if (!Number.isFinite(crNum) || crNum <= 0) {
      invalidIds[sem.id] = 'Credit hours must be greater than 0.';
      continue;
    }
    if (!Number.isFinite(gpaNum) || gpaNum < 0 || gpaNum > maxScale) {
      invalidIds[sem.id] = `GPA must be between 0 and ${maxScale.toFixed(2)}.`;
      continue;
    }

    totalCredits += crNum;
    totalQualityPoints += gpaNum * crNum;
  }

  const cgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  const approximatePercentage = maxScale > 0 ? Math.min(100, (cgpa / maxScale) * 100) : 0;

  return {
    totalCredits,
    totalQualityPoints,
    cgpa,
    approximatePercentage,
    invalidIds,
  };
}

export interface TargetPlannerResult {
  requiredNextGpa: number;
  achievable: boolean;
  alreadyMet: boolean;
  recommendedGradeHint: string;
}

export function calculateTargetCgpaPlan(params: {
  currentCgpa: number;
  currentCredits: number;
  targetCgpa: number;
  nextSemesterCredits: number;
  scale: GradeDefinition[];
}): TargetPlannerResult {
  const { currentCgpa, currentCredits, targetCgpa, nextSemesterCredits, scale } = params;
  const maxScale = Math.max(0.01, ...scale.map((s) => s.points));

  if (nextSemesterCredits <= 0) {
    return {
      requiredNextGpa: 0,
      achievable: false,
      alreadyMet: false,
      recommendedGradeHint: 'Enter next semester credit hours (> 0).',
    };
  }

  const totalFutureCredits = currentCredits + nextSemesterCredits;
  const requiredTotalPoints = targetCgpa * totalFutureCredits;
  const currentPoints = currentCgpa * currentCredits;
  const neededPointsNext = requiredTotalPoints - currentPoints;
  const requiredNextGpa = neededPointsNext / nextSemesterCredits;

  if (requiredNextGpa <= 0) {
    return {
      requiredNextGpa: 0,
      achievable: true,
      alreadyMet: true,
      recommendedGradeHint: 'You already exceed this target CGPA.',
    };
  }

  if (requiredNextGpa > maxScale) {
    const maxPossibleCgpa = (currentPoints + maxScale * nextSemesterCredits) / totalFutureCredits;
    return {
      requiredNextGpa,
      achievable: false,
      alreadyMet: false,
      recommendedGradeHint: `Not achievable in one semester (max possible CGPA is ${maxPossibleCgpa.toFixed(2)}).`,
    };
  }

  // Find closest grade(s) >= requiredNextGpa
  const sortedAsc = [...scale].sort((a, b) => a.points - b.points);
  const above = sortedAsc.find((g) => g.points >= requiredNextGpa - 0.001) || sortedAsc[sortedAsc.length - 1];
  const below = [...sortedAsc].reverse().find((g) => g.points <= requiredNextGpa);

  const hint =
    below && above && below.grade !== above.grade
      ? `Aim for a mix of ${above.grade} (${above.points.toFixed(2)}) and ${below.grade} (${below.points.toFixed(2)}) grades.`
      : `Maintain at least ${above.grade} (${above.points.toFixed(2)}) across your next courses.`;

  return {
    requiredNextGpa,
    achievable: true,
    alreadyMet: false,
    recommendedGradeHint: hint,
  };
}
