// Data contract for structured interview kits.
//
// Kit content (questions, answer keys, red flags) is served by the API to
// authenticated company users only. It must never be bundled into the
// frontend, because the JS bundle is publicly downloadable.

export type KitType = 'technical' | 'character' | 'aptitude';

/** Review state of a kit version. Technical banks start as draft_under_review. */
export type ContentStatus = 'draft_under_review' | 'reviewed';

export type InterviewMode = 'phone' | 'in_person';

/** One selectable score for a question, e.g. { value: 2, label: 'Solid' }. */
export interface ScoreOption {
  value: number;
  label: string;
  description?: string;
}

/** Extra labelled text shown with a question, e.g. "What it catches". */
export interface QuestionDetail {
  label: string;
  text: string;
}

export interface KitQuestion {
  /** Stable key within a kit version, e.g. "L2.Q3". Saved answers reference it. */
  key: string;
  /** Display number, e.g. "3". */
  number: string;
  prompt: string;
  answerKey?: string;
  redFlags?: string;
  /** Interviewer guidance specific to this question. */
  guidance?: string;
  details?: QuestionDetail[];
  /** Custom interviews: where this question was picked from. */
  source?: ItemRef;
}

export interface KitSection {
  key: string;
  title: string;
  description?: string;
  /**
   * Score scale for this section's questions. Omitted for unscored sections
   * (e.g. BS-detector questions), where the interviewer can only flag a red flag.
   */
  scoreOptions?: ScoreOption[];
  questions: KitQuestion[];
  /** Usage notes the source document gives after the section's questions. */
  notes?: string[];
  /** Source-check notes (how answer keys were verified). */
  sourceNotes?: string[];
}

/** Other sections of the source document (e.g. "Where to validate"). */
export interface KitExtraSection {
  title: string;
  lines: string[];
}

export interface InterviewKit {
  id: string;
  /** true for a custom interview's own question snapshot (not a real kit). */
  custom?: boolean;
  title: string;
  type: KitType | 'custom';
  /** Job titles this kit applies to (matches jobs.position_type values). */
  roles: string[];
  /** Levels covered, as named by the source document. */
  levels: string[];
  status: ContentStatus;
  /** Content version. A saved interview records the version it used. */
  version: number;
  versionDate?: string;
  summary?: string;
  howToUse?: string[];
  /** Rules the interviewer must follow (e.g. topics never to ask about). */
  guardrails?: string[];
  sections: KitSection[];
  extraSections?: KitExtraSection[];
}

/** List view: everything except question content. */
export type InterviewKitSummary = Omit<InterviewKit, 'sections' | 'howToUse' | 'guardrails' | 'extraSections'> & {
  questionCount: number;
};

export interface InterviewAnswer {
  score: number | null;
  notes: string;
  /** Interviewer marked a red flag (used for unscored questions). */
  redFlag: boolean;
}

export type InterviewStatus = 'in_progress' | 'completed';

export interface ResultSection {
  key: string;
  title: string;
  score: number;
  answered: number;
  total: number;
  max: number;
  passMark: number;
  /** null until every question in the section is scored. */
  passed: boolean | null;
  /** false when the kit's rules say this section doesn't count (e.g. above a failed level). */
  counted: boolean;
}

/** Scoring result. Always a recommendation: a person makes the decision. */
export interface InterviewResult {
  rulesVersion: number;
  engine: 'leveled' | 'gated' | 'custom';
  recommendationOnly: true;
  outcome: { label: string; key?: string; levelsPassed?: number } | null;
  incompleteReason: string | null;
  allScored: boolean;
  sections: ResultSection[];
  redFlags: { count: number; guidance: string | null };
  skillProfile: { area: string; score: number; max: number; answered: number; total: number }[] | null;
  notes: string[];
  /** Custom interviews only: total of the questions that were scored. */
  total?: { score: number; max: number; answered: number; scorable: number };
}

export type KitRef = Pick<InterviewKit, 'id' | 'title' | 'version' | 'status' | 'type' | 'custom'>;

export interface Interview {
  id: number;
  kind: 'kit' | 'custom';
  pipelineId: number;
  status: InterviewStatus;
  mode: InterviewMode;
  interviewerEmail: string | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  currentIndex: number;
  answers: Record<string, InterviewAnswer>;
  /** Full kit content (the version this interview used) on single-interview reads; a reference in lists. */
  kit: InterviewKit | KitRef;
  result: InterviewResult;
}

export interface InterviewWithKit extends Interview {
  kit: InterviewKit;
}

// ─── custom interviews ─────────────────────────────────────────────────────────

/** A reference to one question: from a kit, or from the company's own bank. */
export type ItemRef =
  | { source: 'kit'; kitId: string; key: string }
  | { source: 'company'; id: number };

/** A picked question as shown in the builder (no answer keys). */
export type PickedItem = ItemRef & {
  prompt: string | null;
  sourceLabel: string | null;
  /** The question no longer exists (deleted, or the kit was re-uploaded). */
  missing?: boolean;
};

export interface CompanyQuestion {
  id: number;
  prompt: string;
  goodAnswer: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionSetSummary {
  id: number;
  name: string;
  itemCount: number;
  updatedAt: string;
}

export interface QuestionSet {
  id: number;
  name: string;
  updatedAt: string;
  items: PickedItem[];
}

export const refKey = (r: ItemRef) => (r.source === 'kit' ? `k:${r.kitId}:${r.key}` : `c:${r.id}`);
export const toRef = (r: ItemRef): ItemRef => (r.source === 'kit' ? { source: 'kit', kitId: r.kitId, key: r.key } : { source: 'company', id: r.id });
