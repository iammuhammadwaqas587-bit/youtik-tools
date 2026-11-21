import React, { useState, useEffect, useMemo } from 'react';
import { ToolLayout, RelatedToolItem } from '../components/ToolLayout';
import {
  GraduationCap,
  Plus,
  Trash2,
  RotateCcw,
  Sun,
  Moon,
  Target,
  Calculator,
  AlertCircle,
  ArrowDownToLine,
  Eraser,
} from 'lucide-react';
import {
  DEFAULT_SCALE_4,
  DEFAULT_SCALE_5,
  DEFAULT_MARKS_TABLE,
  type GradeDefinition,
  type MarksRule,
  type GradingScalePreset,
  type InputMode,
  type CourseRowInput,
  type SemesterEntryInput,
  calculateSemesterGpa,
  calculateCumulativeCgpa,
  calculateTargetCgpaPlan,
} from '../utils/gpaCalculation';

interface GpaCalculatorPageProps {
  onNavigate: (path: string) => void;
}

const STORAGE_KEY = 'youtiktools_gpa_calculator_v1';

function createEmptyCourseRows(count = 5): CourseRowInput[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `course_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    courseName: '',
    creditHours: '',
    grade: 'A',
    marks: '',
  }));
}

function createInitialSemesters(): SemesterEntryInput[] {
  return [
    { id: 'sem_1', label: 'Semester 1', gpa: '', creditHours: '' },
    { id: 'sem_2', label: 'Semester 2', gpa: '', creditHours: '' },
  ];
}

interface PersistedGpaState {
  scalePreset: GradingScalePreset;
  inputMode: InputMode;
  customScale: GradeDefinition[];
  marksTable: MarksRule[];
  courses: CourseRowInput[];
  semesters: SemesterEntryInput[];
  targetCgpaStr: string;
  nextSemCreditsStr: string;
}

export const GpaCalculatorPage: React.FC<GpaCalculatorPageProps> = ({
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

  const loadedInitial = useMemo<PersistedGpaState | null>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.courses)) {
        return parsed as PersistedGpaState;
      }
    } catch {
      // Ignore invalid stored payload
    }
    return null;
  }, []);

  const [scalePreset, setScalePreset] = useState<GradingScalePreset>(
    loadedInitial?.scalePreset || '4.0'
  );
  const [inputMode, setInputMode] = useState<InputMode>(
    loadedInitial?.inputMode || 'grade'
  );
  const [customScale, setCustomScale] = useState<GradeDefinition[]>(
    loadedInitial?.customScale?.length ? loadedInitial.customScale : DEFAULT_SCALE_4
  );
  const [marksTable, setMarksTable] = useState<MarksRule[]>(
    loadedInitial?.marksTable?.length ? loadedInitial.marksTable : DEFAULT_MARKS_TABLE
  );
  const [courses, setCourses] = useState<CourseRowInput[]>(
    loadedInitial?.courses?.length ? loadedInitial.courses : createEmptyCourseRows(5)
  );
  const [semesters, setSemesters] = useState<SemesterEntryInput[]>(
    loadedInitial?.semesters?.length ? loadedInitial.semesters : createInitialSemesters()
  );
  const [targetCgpaStr, setTargetCgpaStr] = useState<string>(
    loadedInitial?.targetCgpaStr ?? '3.50'
  );
  const [nextSemCreditsStr, setNextSemCreditsStr] = useState<string>(
    loadedInitial?.nextSemCreditsStr ?? '15'
  );
  const [statusNote, setStatusNote] = useState<string | null>(null);

  // Persist to localStorage automatically
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const payload: PersistedGpaState = {
        scalePreset,
        inputMode,
        customScale,
        marksTable,
        courses,
        semesters,
        targetCgpaStr,
        nextSemCreditsStr,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    scalePreset,
    inputMode,
    customScale,
    marksTable,
    courses,
    semesters,
    targetCgpaStr,
    nextSemCreditsStr,
  ]);

  const activeScale: GradeDefinition[] = useMemo(() => {
    if (scalePreset === '5.0') return DEFAULT_SCALE_5;
    if (scalePreset === 'custom') return customScale;
    return DEFAULT_SCALE_4;
  }, [scalePreset, customScale]);

  const semesterSummary = useMemo(
    () =>
      calculateSemesterGpa({
        courses,
        inputMode,
        scale: activeScale,
        marksTable,
      }),
    [courses, inputMode, activeScale, marksTable]
  );

  const cgpaSummary = useMemo(
    () => calculateCumulativeCgpa(semesters, semesterSummary.maxScale),
    [semesters, semesterSummary.maxScale]
  );

  // Use CGPA if semesters have data, otherwise fall back to current semester GPA for Target Planner
  const plannerBaselineGpa =
    cgpaSummary.totalCredits > 0 ? cgpaSummary.cgpa : semesterSummary.gpa;
  const plannerBaselineCredits =
    cgpaSummary.totalCredits > 0 ? cgpaSummary.totalCredits : semesterSummary.totalCredits;

  const targetPlan = useMemo(
    () =>
      calculateTargetCgpaPlan({
        currentCgpa: plannerBaselineGpa,
        currentCredits: plannerBaselineCredits,
        targetCgpa: parseFloat(targetCgpaStr) || 0,
        nextSemesterCredits: parseFloat(nextSemCreditsStr) || 0,
        scale: activeScale,
      }),
    [plannerBaselineGpa, plannerBaselineCredits, targetCgpaStr, nextSemCreditsStr, activeScale]
  );

  const handleUpdateCourse = (id: string, patch: Partial<CourseRowInput>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleAddCourseRow = () => {
    setCourses((prev) => [
      ...prev,
      ...createEmptyCourseRows(1),
    ]);
  };

  const handleRemoveCourseRow = (id: string) => {
    setCourses((prev) => (prev.length > 1 ? prev.filter((c) => c.id !== id) : prev));
  };

  const handleResetSemester = () => {
    setCourses(createEmptyCourseRows(5));
    setStatusNote('Reset semester table to 5 empty rows.');
    window.setTimeout(() => setStatusNote(null), 2200);
  };

  const handleClearSavedData = () => {
    try {
      window.localStorage?.removeItem(STORAGE_KEY);
    } catch {}
    setScalePreset('4.0');
    setInputMode('grade');
    setCustomScale(DEFAULT_SCALE_4);
    setMarksTable(DEFAULT_MARKS_TABLE);
    setCourses(createEmptyCourseRows(5));
    setSemesters(createInitialSemesters());
    setTargetCgpaStr('3.50');
    setNextSemCreditsStr('15');
    setStatusNote('Cleared all saved GPA & CGPA data from browser storage.');
    window.setTimeout(() => setStatusNote(null), 2600);
  };

  const handleImportSemesterIntoCgpa = () => {
    if (semesterSummary.totalCredits <= 0) {
      setStatusNote('Enter at least one course with credit hours > 0 before importing.');
      return;
    }
    setSemesters((prev) => {
      const emptyIdx = prev.findIndex((s) => !s.gpa.trim() && !s.creditHours.trim());
      if (emptyIdx !== -1) {
        return prev.map((s, idx) =>
          idx === emptyIdx
            ? {
                ...s,
                gpa: semesterSummary.gpa.toFixed(2),
                creditHours: String(semesterSummary.totalCredits),
              }
            : s
        );
      }
      return [
        ...prev,
        {
          id: `sem_${Date.now()}`,
          label: `Semester ${prev.length + 1}`,
          gpa: semesterSummary.gpa.toFixed(2),
          creditHours: String(semesterSummary.totalCredits),
        },
      ];
    });
    setStatusNote('Added current semester GPA & credit hours to CGPA calculator.');
    window.setTimeout(() => setStatusNote(null), 2200);
  };

  const relatedTools: RelatedToolItem[] = [
    {
      name: 'Age Calculator',
      path: '/age-calculator',
      description: 'Calculate exact age, birthday countdown, Hijri & Bikrami dates.',
      icon: '🎂',
    },
    {
      name: 'Land Area Converter',
      path: '/land-area-converter',
      description: 'Convert Marla, Kanal, Acre & calculate PKR property cost.',
      icon: '🗺️',
    },
    {
      name: 'Gold Rate Calculator',
      path: '/gold-calculator',
      description: 'Convert Tola, Masha, Gram & calculate jewellery bills.',
      icon: '🪙',
    },
    {
      name: 'QR Code Generator',
      path: '/qr-code-generator',
      description: 'Create custom QR codes & scan QR codes offline.',
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
    ? 'bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';
  const labelText = isDarkTheme ? 'text-slate-300' : 'text-slate-700';
  const mutedText = isDarkTheme ? 'text-slate-400' : 'text-slate-500';

  return (
    <ToolLayout
      toolPath="/gpa-calculator"
      title="GPA & CGPA Calculator"
      badgeText="4.0 · 5.0 · Marks · Target Planner"
      badgeIcon={<GraduationCap className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />}
      description="Calculate your semester GPA, cumulative CGPA weighted by credit hours, and approximate percentage using 4.0, 5.0, editable custom scales, or percentage marks-to-grade conversion. Automatically saves your entries locally in your browser."
      howItWorks={{
        heading: 'How Semester GPA & Cumulative CGPA Are Calculated',
        text: 'GPA divides total quality points (Credit Hours × Grade Point) by total credit hours. CGPA weights each semester by its credit hours across your entire degree, and our planner tells you the exact GPA needed next semester to reach your target.',
        steps: [
          {
            number: 1,
            title: 'Select Grading Scale & Mode',
            description:
              'Pick 4.0, 5.0, or Custom Scale, and enter either Letter Grades or Percentage Marks (0–100).',
          },
          {
            number: 2,
            title: 'Add Semester Courses',
            description:
              'Fill credit hours and grades/marks across the rows—live GPA, credit hours, and quality points update instantly.',
          },
          {
            number: 3,
            title: 'Compute CGPA & Target Plan',
            description:
              'Import your semester or type past semesters to get weighted CGPA, approximate percentage, and next-semester targets.',
          },
        ],
      }}
      supportedFormats={[
        { format: '4.0 Scale (Default)', description: 'A 4.0, A- 3.67, B+ 3.33, B 3.0, B- 2.67, C+ 2.33, C 2.0, C- 1.67, D+ 1.33, D 1.0, F 0.' },
        { format: '5.0 & Custom Scales', description: 'Switch to 5.0 scale or edit every grade point to match your university policy.' },
        { format: 'Marks-to-Grade Mode', description: 'Editable percentage thresholds (85+ = A, 80–84 = A-, etc.).' },
        { format: 'Browser Auto-Save', description: 'Saved in localStorage automatically with 1-click Clear Saved Data.' },
      ]}
      tips={[
        'High-credit courses (such as 4-credit labs or FYP) move your GPA twice as much as 2-credit electives—focus on them when raising your CGPA.',
        'Universities in Pakistan (e.g. NUST, FAST, LUMS, COMSATS, UET, PU) vary on exact A-/D+ thresholds; customize the marks table to match your student handbook.',
      ]}
      faqs={[
        {
          question: 'How is GPA calculated?',
          answer:
            'Multiply each course’s credit hours by the grade point earned to get quality points, add all quality points together, and divide by total credit hours attempted.',
        },
        {
          question: 'What is the difference between GPA and CGPA?',
          answer:
            'GPA (Grade Point Average) measures your performance in a single semester, while CGPA (Cumulative Grade Point Average) is the credit-weighted average across all completed semesters.',
        },
        {
          question: 'How are marks converted to grade points?',
          answer:
            'Each percentage score is matched against an editable threshold table (by default 85+ = A 4.0, 80–84 = A- 3.67, down to below 50 = F 0). Since grading policies differ by university, you can edit every percentage cutoff and point value directly.',
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
        {/* Top Controls: Scale + Input Mode + Theme + Clear Saved Data */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
          <div className="flex flex-wrap items-center gap-2.5">
            <div>
              <label htmlFor="gpa-scale-select" className={`block text-[11px] font-bold mb-1 ${labelText}`}>
                Grading Scale
              </label>
              <select
                id="gpa-scale-select"
                value={scalePreset}
                onChange={(e) => setScalePreset(e.target.value as GradingScalePreset)}
                className={`h-10 px-3 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer ${inputSurface}`}
              >
                <option value="4.0">4.0 Scale (Default)</option>
                <option value="5.0">5.0 Scale</option>
                <option value="custom">Custom Scale</option>
              </select>
            </div>

            <div>
              <span className={`block text-[11px] font-bold mb-1 ${labelText}`}>Entry Mode</span>
              <div className={`inline-flex rounded-xl p-0.5 border ${cardSurface}`}>
                <button
                  type="button"
                  onClick={() => setInputMode('grade')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    inputMode === 'grade' ? 'bg-red-600 text-white' : labelText
                  }`}
                >
                  Letter Grade
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('marks')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    inputMode === 'marks' ? 'bg-red-600 text-white' : labelText
                  }`}
                >
                  Marks (0–100)
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              onClick={handleClearSavedData}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${cardSurface}`}
            >
              <Eraser className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
              <span>Clear Saved Data</span>
            </button>
          </div>
        </div>

        {statusNote && (
          <div
            role="status"
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${
              isDarkTheme
                ? 'bg-emerald-950/50 border-emerald-700 text-emerald-200'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {statusNote}
          </div>
        )}

        {/* Prominent Live GPA Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            className={`rounded-2xl border p-4 space-y-0.5 ${
              isDarkTheme ? 'bg-red-950/40 border-red-800' : 'bg-red-50/90 border-red-200'
            }`}
          >
            <div className={`text-[11px] font-bold ${isDarkTheme ? 'text-red-300' : 'text-red-800'}`}>
              Semester GPA ({semesterSummary.maxScale.toFixed(1)} Scale)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-red-600">
              {semesterSummary.gpa.toFixed(2)}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 space-y-0.5 ${cardSurface}`}>
            <div className={`text-[11px] font-semibold ${mutedText}`}>Total Credit Hours</div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
              {semesterSummary.totalCredits.toFixed(1).replace(/\.0$/, '')}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 space-y-0.5 ${cardSurface}`}>
            <div className={`text-[11px] font-semibold ${mutedText}`}>Quality Points</div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
              {semesterSummary.totalQualityPoints.toFixed(2)}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 space-y-0.5 ${cardSurface}`}>
            <div className={`text-[11px] font-semibold ${mutedText}`}>Approx. Percentage</div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums">
              {semesterSummary.approximatePercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 1. Semester GPA Course Table */}
        <section aria-labelledby="sem-gpa-heading" className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-red-600" aria-hidden="true" />
              <h2 id="sem-gpa-heading" className="text-sm sm:text-base font-extrabold">
                1. Semester Courses ({courses.length})
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleImportSemesterIntoCgpa}
                disabled={semesterSummary.totalCredits <= 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white disabled:opacity-40 text-xs font-bold cursor-pointer"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add to CGPA</span>
              </button>

              <button
                type="button"
                onClick={handleResetSemester}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${inputSurface}`}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Responsive Course Rows */}
          <div className="space-y-2.5">
            {courses.map((row, idx) => {
              const evalRow = semesterSummary.rows[idx];
              return (
                <div
                  key={row.id}
                  className={`rounded-xl border p-3 space-y-2 ${
                    evalRow && !evalRow.isValid
                      ? isDarkTheme
                        ? 'border-red-700 bg-red-950/30'
                        : 'border-red-300 bg-red-50/40'
                      : isDarkTheme
                      ? 'border-slate-700 bg-slate-900/50'
                      : 'border-slate-200 bg-slate-50/70'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    <div className="sm:col-span-5">
                      <label htmlFor={`course-name-${row.id}`} className={`block text-[10px] font-bold mb-1 ${mutedText}`}>
                        Course {idx + 1} (Optional)
                      </label>
                      <input
                        id={`course-name-${row.id}`}
                        type="text"
                        value={row.courseName}
                        onChange={(e) => handleUpdateCourse(row.id, { courseName: e.target.value })}
                        placeholder={`e.g. Calculus / CS-${101 + idx}`}
                        className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm ${inputSurface}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:col-span-5 gap-2.5">
                      <div>
                        <label htmlFor={`course-cr-${row.id}`} className={`block text-[10px] font-bold mb-1 ${mutedText}`}>
                          Credit Hours
                        </label>
                        <input
                          id={`course-cr-${row.id}`}
                          type="number"
                          min={0.5}
                          step="any"
                          value={row.creditHours}
                          onChange={(e) => handleUpdateCourse(row.id, { creditHours: e.target.value })}
                          placeholder="3"
                          className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-mono font-bold tabular-nums ${inputSurface}`}
                        />
                      </div>

                      {inputMode === 'grade' ? (
                        <div>
                          <label htmlFor={`course-grade-${row.id}`} className={`block text-[10px] font-bold mb-1 ${mutedText}`}>
                            Grade
                          </label>
                          <select
                            id={`course-grade-${row.id}`}
                            value={row.grade}
                            onChange={(e) => handleUpdateCourse(row.id, { grade: e.target.value })}
                            className={`w-full h-10 px-2.5 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer ${inputSurface}`}
                          >
                            {activeScale.map((g) => (
                              <option key={g.grade} value={g.grade}>
                                {g.grade} ({g.points.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor={`course-marks-${row.id}`} className={`block text-[10px] font-bold mb-1 ${mutedText}`}>
                            Marks (0–100)
                          </label>
                          <input
                            id={`course-marks-${row.id}`}
                            type="number"
                            min={0}
                            max={100}
                            step="any"
                            value={row.marks}
                            onChange={(e) => handleUpdateCourse(row.id, { marks: e.target.value })}
                            placeholder="85"
                            className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-mono font-bold tabular-nums ${inputSurface}`}
                          />
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-4">
                      <span className={`text-xs font-mono font-bold tabular-nums ${mutedText}`}>
                        {evalRow?.isActive && evalRow.isValid
                          ? `${evalRow.gradeLabel} · ${evalRow.qualityPoints.toFixed(1)} pts`
                          : '—'}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove course ${idx + 1}`}
                        disabled={courses.length <= 1}
                        onClick={() => handleRemoveCourseRow(row.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {evalRow && evalRow.error && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{evalRow.error}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddCourseRow}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${inputSurface}`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add Course Row</span>
          </button>
        </section>

        {/* Editable Custom Scale OR Marks-to-Grade Table */}
        {scalePreset === 'custom' && (
          <section className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold">Custom Grading Scale Points</h2>
              <button
                type="button"
                onClick={() => setCustomScale(DEFAULT_SCALE_4)}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Reset to 4.0 Defaults
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {customScale.map((item, idx) => (
                <div key={item.grade} className="space-y-1">
                  <label htmlFor={`custom-gp-${item.grade}`} className={`block text-[11px] font-bold ${labelText}`}>
                    Grade {item.grade}
                  </label>
                  <input
                    id={`custom-gp-${item.grade}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.points}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomScale((prev) =>
                        prev.map((row, rIdx) =>
                          rIdx === idx ? { ...row, points: Number.isFinite(val) && val >= 0 ? val : 0 } : row
                        )
                      );
                    }}
                    className={`w-full h-9 px-2.5 rounded-lg border text-xs font-mono font-bold ${inputSurface}`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {inputMode === 'marks' && (
          <section className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardSurface}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold">Marks-to-Grade Point Table (Editable)</h2>
              <button
                type="button"
                onClick={() => setMarksTable(DEFAULT_MARKS_TABLE)}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Reset Default Table
              </button>
            </div>
            <p className={`text-xs ${mutedText}`}>
              Note: Universities in Pakistan differ in their percentage cutoffs (e.g. HEC, NUST, FAST, LUMS, COMSATS, UET, PU). Please check your own university policy and adjust values below if needed.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {marksTable.map((rule, idx) => (
                <div
                  key={rule.grade}
                  className={`rounded-xl border p-2.5 space-y-1.5 ${
                    isDarkTheme ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-extrabold text-red-600">Grade {rule.grade}</div>
                  <div>
                    <label className={`block text-[10px] ${mutedText}`}>Min %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={rule.minPercent}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setMarksTable((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, minPercent: Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0 } : r
                          )
                        );
                      }}
                      className={`w-full h-8 px-2 rounded-lg border text-xs font-mono ${inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] ${mutedText}`}>Points</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={rule.points}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setMarksTable((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, points: Number.isFinite(v) && v >= 0 ? v : 0 } : r
                          )
                        );
                      }}
                      className={`w-full h-8 px-2 rounded-lg border text-xs font-mono ${inputSurface}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. Cumulative CGPA Calculator & 3. Target CGPA Planner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Cumulative CGPA */}
          <section aria-labelledby="cgpa-heading" className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
            <div className="flex items-center justify-between gap-2">
              <h2 id="cgpa-heading" className="text-sm sm:text-base font-extrabold">
                2. Cumulative CGPA Calculator
              </h2>
              <button
                type="button"
                onClick={() =>
                  setSemesters((prev) => [
                    ...prev,
                    {
                      id: `sem_${Date.now()}`,
                      label: `Semester ${prev.length + 1}`,
                      gpa: '',
                      creditHours: '',
                    },
                  ])
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${inputSurface}`}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Semester</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {semesters.map((sem, idx) => (
                <div key={sem.id} className="space-y-1">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      aria-label={`Semester ${idx + 1} label`}
                      value={sem.label}
                      onChange={(e) =>
                        setSemesters((prev) =>
                          prev.map((s) => (s.id === sem.id ? { ...s, label: e.target.value } : s))
                        )
                      }
                      className={`col-span-5 h-10 px-2.5 rounded-xl border text-xs font-semibold ${inputSurface}`}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={semesterSummary.maxScale}
                      placeholder="GPA"
                      aria-label={`${sem.label} GPA`}
                      value={sem.gpa}
                      onChange={(e) =>
                        setSemesters((prev) =>
                          prev.map((s) => (s.id === sem.id ? { ...s, gpa: e.target.value } : s))
                        )
                      }
                      className={`col-span-3 h-10 px-2.5 rounded-xl border text-xs font-mono font-bold tabular-nums ${inputSurface}`}
                    />
                    <input
                      type="number"
                      step="any"
                      min={0.5}
                      placeholder="Cr. Hrs"
                      aria-label={`${sem.label} Credit Hours`}
                      value={sem.creditHours}
                      onChange={(e) =>
                        setSemesters((prev) =>
                          prev.map((s) => (s.id === sem.id ? { ...s, creditHours: e.target.value } : s))
                        )
                      }
                      className={`col-span-3 h-10 px-2.5 rounded-xl border text-xs font-mono font-bold tabular-nums ${inputSurface}`}
                    />
                    <button
                      type="button"
                      disabled={semesters.length <= 1}
                      aria-label={`Remove ${sem.label}`}
                      onClick={() =>
                        setSemesters((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== sem.id) : prev))
                      }
                      className="col-span-1 flex items-center justify-center p-2 text-red-500 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  {cgpaSummary.invalidIds[sem.id] && (
                    <p className="text-[11px] text-red-500 font-semibold">
                      {cgpaSummary.invalidIds[sem.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div
              className={`rounded-xl border p-4 flex items-center justify-between ${
                isDarkTheme ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className={`text-[11px] font-bold ${mutedText}`}>
                  Weighted CGPA ({cgpaSummary.totalCredits.toFixed(1).replace(/\.0$/, '')} credits)
                </div>
                <div className="text-2xl font-extrabold font-mono tabular-nums text-red-600">
                  {cgpaSummary.cgpa.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[11px] font-bold ${mutedText}`}>Approx. %</div>
                <div className="text-lg font-extrabold font-mono tabular-nums">
                  {cgpaSummary.approximatePercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </section>

          {/* Target CGPA Planner */}
          <section aria-labelledby="target-cgpa-heading" className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardSurface}`}>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-red-600" aria-hidden="true" />
              <h2 id="target-cgpa-heading" className="text-sm sm:text-base font-extrabold">
                3. Target CGPA Planner
              </h2>
            </div>

            <p className={`text-xs ${mutedText}`}>
              Using baseline: <strong>{plannerBaselineGpa.toFixed(2)}</strong> CGPA across{' '}
              <strong>{plannerBaselineCredits.toFixed(1).replace(/\.0$/, '')}</strong> credit hours.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="target-cgpa-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                  Required CGPA
                </label>
                <input
                  id="target-cgpa-input"
                  type="number"
                  step="0.01"
                  min={0}
                  max={semesterSummary.maxScale}
                  value={targetCgpaStr}
                  onChange={(e) => setTargetCgpaStr(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
                />
              </div>

              <div>
                <label htmlFor="next-credits-input" className={`block text-xs font-bold mb-1.5 ${labelText}`}>
                  Next Semester Credits
                </label>
                <input
                  id="next-credits-input"
                  type="number"
                  step="1"
                  min={1}
                  value={nextSemCreditsStr}
                  onChange={(e) => setNextSemCreditsStr(e.target.value)}
                  className={`w-full h-10 px-3 rounded-xl border text-sm font-mono font-bold tabular-nums ${inputSurface}`}
                />
              </div>
            </div>

            <div
              className={`rounded-xl border p-4 space-y-1.5 ${
                targetPlan.achievable
                  ? isDarkTheme
                    ? 'bg-emerald-950/30 border-emerald-800'
                    : 'bg-emerald-50/70 border-emerald-200'
                  : isDarkTheme
                  ? 'bg-amber-950/40 border-amber-700'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className={`text-xs font-bold ${labelText}`}>Required Next-Semester GPA</div>
              <div className="text-2xl font-extrabold font-mono tabular-nums">
                {targetPlan.requiredNextGpa.toFixed(2)} / {semesterSummary.maxScale.toFixed(1)}
              </div>
              <p className={`text-xs ${mutedText}`}>{targetPlan.recommendedGradeHint}</p>
            </div>
          </section>
        </div>
      </div>
    </ToolLayout>
  );
};
