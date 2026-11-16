// Data contract for ride-along scorecards (mirrors backend-node/services/rideAlong).

export type StepScore = 0 | 1 | 2 | 'na';
export type FlagType = 'FAIL' | 'CAP';

export interface TaskStep {
  key: string;
  text: string;
  twoLooksLike: string | null;
  safety: boolean;
}

export interface ScorecardTask {
  id?: number;          // company tasks only
  code: string;
  shared: boolean;
  version: number;
  name: string;
  level: string | null;
  time: string | null;
  equipment: string[];
  roleTags: string[];
  steps: TaskStep[];
  enabled?: boolean;
}

export interface ObservationItem { key: string; text: string; twoLooksLike?: string | null }
export interface ObservationCategory { key: string; name: string; weight: number; items: ObservationItem[] }
export interface RedFlagDef { key: string; text: string; type: FlagType }
export interface Band { key: string; label: string; min: number }

export interface ScorecardConfig {
  partWeights: { part1: number; part2: number };
  categories: ObservationCategory[];
  redFlags: RedFlagDef[];
  bands: Band[];
  capValue: number;
  safetyFlagType: FlagType;
}

export interface ScorecardSummary {
  slug: string;
  title: string;
  role: string;
  version: number;
  taskCount: number;
  categoryCount: number;
}

export interface Scorecard {
  templateId: number;
  versionId: number;
  slug: string;
  title: string;
  role: string;
  version: number;
  config: ScorecardConfig;
  tasks: ScorecardTask[];
  canEdit: boolean;
}

export interface ScoreEntry { score: StepScore | null; note: string }
export interface FlagEntry { note: string }

export interface ResultFlag {
  key: string;
  text: string;
  type: FlagType;
  note: string;
  auto: boolean;
  taskCode?: string;
  stepKey?: string;
}

export interface EvaluationResult {
  tasks: { code: string; name: string; score: number | null; stepsScored: number; stepsNa: number; stepsTotal: number; safetyZero: boolean }[];
  part1: number | null;
  categories: { key: string; name: string; weight: number; effectiveWeight: number; score: number | null; itemsScored: number; itemsTotal: number }[];
  part2: number | null;
  rawTotal: number | null;
  total: number | null;
  partial: boolean;
  partialPart: 'part1' | 'part2' | null;
  redFlags: ResultFlag[];
  failed: boolean;
  capped: boolean;
  band: { key: string; label: string } | null;
  unscored: { steps: number; items: number };
}

export interface EvaluationSummary {
  id: number;
  pipelineId: number;
  jobId: number;
  status: 'draft' | 'submitted';
  scorerEmail: string | null;
  scorerUserId: number | null;
  evaluatedOn: string;
  candidateConsent: boolean;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  scorecard: { slug: string; title: string; role: string; version: number; bands: Band[] };
  chosenTaskCodes: string[];
  result: EvaluationResult;
  candidateName?: string;
  jobTitle?: string;
}

export interface Evaluation extends EvaluationSummary {
  config: ScorecardConfig;
  tasks: ScorecardTask[];
  stepScores: Record<string, ScoreEntry>;
  itemScores: Record<string, ScoreEntry>;
  redFlags: Record<string, FlagEntry>;
  currentScreen: string | null;
}

export interface ScorableCandidate {
  pipelineId: number;
  name: string;
  jobId: number;
  jobTitle: string;
  status: string;
}

export interface CompareCandidate extends EvaluationSummary {
  evaluationCount: number;
  otherEvaluations: { id: number; submittedAt: string; total: number | null }[];
  notes: { about: string; note: string }[];
}

export type EvaluationPatch =
  | { chosenTaskCodes: string[] }
  | { step: { key: string; score: StepScore | null; note: string } }
  | { item: { key: string; score: StepScore | null; note: string } }
  | { redFlag: { key: string; ticked: boolean; note?: string } }
  | { evaluatedOn: string }
  | { currentScreen: string };

export interface CompanyTaskInput {
  name: string;
  level?: string | null;
  time?: string | null;
  equipment?: string[];
  roleTags?: string[];
  steps: { text: string; twoLooksLike?: string | null; safety: boolean }[];
}
