import { ApiError, request } from '../interviewKits/api';
import {
  Band, CompanyTaskInput, CompareCandidate, Evaluation, EvaluationPatch, EvaluationSummary,
  ScorableCandidate, Scorecard, ScorecardSummary, ScorecardTask,
} from './types';

// Scorecard content comes only from the authenticated API; it is never
// bundled into the frontend (the JS bundle is public).

export { ApiError };

export async function fetchScorecards(): Promise<ScorecardSummary[]> {
  try {
    return (await request<{ scorecards: ScorecardSummary[] }>('/api/scorecards')).scorecards;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function fetchScorecard(slug: string): Promise<Scorecard> {
  return (await request<{ scorecard: Scorecard }>(`/api/scorecards/${encodeURIComponent(slug)}`)).scorecard;
}

export async function saveScorecardSettings(slug: string, body: { disabledTaskCodes: string[]; customTaskIds: number[] }): Promise<Scorecard> {
  return (await request<{ scorecard: Scorecard }>(`/api/scorecards/${encodeURIComponent(slug)}/settings`, {
    method: 'PUT', body: JSON.stringify(body),
  })).scorecard;
}

// ─── company tasks ───────────────────────────────────────────────────────────

export async function fetchCompanyTasks(): Promise<ScorecardTask[]> {
  return (await request<{ tasks: ScorecardTask[] }>('/api/scorecard-tasks')).tasks;
}

export async function createCompanyTask(body: CompanyTaskInput): Promise<ScorecardTask> {
  return (await request<{ task: ScorecardTask }>('/api/scorecard-tasks', { method: 'POST', body: JSON.stringify(body) })).task;
}

export async function updateCompanyTask(id: number, body: CompanyTaskInput): Promise<ScorecardTask> {
  return (await request<{ task: ScorecardTask }>(`/api/scorecard-tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) })).task;
}

export async function deleteCompanyTask(id: number): Promise<void> {
  await request(`/api/scorecard-tasks/${id}`, { method: 'DELETE' });
}

// ─── evaluations ─────────────────────────────────────────────────────────────

export async function fetchScorableCandidates(): Promise<ScorableCandidate[]> {
  return (await request<{ candidates: ScorableCandidate[] }>('/api/evaluations/candidates')).candidates;
}

export async function fetchMyDrafts(): Promise<EvaluationSummary[]> {
  try {
    return (await request<{ evaluations: EvaluationSummary[] }>('/api/evaluations?mine=drafts')).evaluations;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function fetchEvaluationsForPipeline(pipelineId: number): Promise<EvaluationSummary[]> {
  return (await request<{ evaluations: EvaluationSummary[] }>(`/api/evaluations?pipelineId=${pipelineId}`)).evaluations;
}

export async function startEvaluation(pipelineId: number, scorecard: string): Promise<Evaluation> {
  return (await request<{ evaluation: Evaluation }>('/api/evaluations', {
    method: 'POST', body: JSON.stringify({ pipelineId, scorecard }),
  })).evaluation;
}

export async function fetchEvaluation(id: number): Promise<Evaluation> {
  return (await request<{ evaluation: Evaluation }>(`/api/evaluations/${id}`)).evaluation;
}

export async function patchEvaluation(id: number, patch: EvaluationPatch, opts: { keepalive?: boolean } = {}): Promise<Evaluation> {
  return (await request<{ evaluation: Evaluation }>(`/api/evaluations/${id}`, {
    method: 'PATCH', body: JSON.stringify(patch), keepalive: opts.keepalive,
  })).evaluation;
}

export async function submitEvaluation(id: number): Promise<Evaluation> {
  return (await request<{ evaluation: Evaluation }>(`/api/evaluations/${id}/submit`, { method: 'POST' })).evaluation;
}

export async function discardEvaluation(id: number): Promise<void> {
  await request(`/api/evaluations/${id}`, { method: 'DELETE' });
}

export async function fetchComparison(jobId: number): Promise<{ job: { id: number; title: string }; candidates: CompareCandidate[] }> {
  return request(`/api/evaluations/compare?jobId=${jobId}`);
}

// ─── admin ───────────────────────────────────────────────────────────────────

export interface AdminScorecardStatus {
  sharedTaskCount: number;
  scorecards: { slug: string; title: string; role: string; latestVersion: number | null; versionCount: number; taskCount: number; lastUploadedAt: string | null }[];
}

export async function fetchAdminScorecards(): Promise<AdminScorecardStatus> {
  return request('/api/admin/scorecards');
}

export async function uploadScorecardBundle(file: File): Promise<{
  tasks: { created: number; updated: number; unchanged: number };
  scorecards: { slug: string; version: number; created: boolean }[];
}> {
  const form = new FormData();
  form.append('file', file);
  return request('/api/admin/scorecards/upload', { method: 'POST', body: form });
}

// ─── display helpers ─────────────────────────────────────────────────────────

/** 0..1 fraction as a whole percentage, or an en dash when not scored. */
export const pct = (x: number | null | undefined): string => (x === null || x === undefined ? '–' : String(Math.round(x * 100)));

const BAND_COLORS = ['#4ade80', '#a3e635', '#fbbf24', '#fb923c', '#f87171'];

/**
 * Colour for a result band, from its position in the template's own bands
 * (highest band green, lowest red). Fail is always red.
 */
export function bandColor(key: string | undefined | null, bands: Band[]): string {
  if (!key) return '#6e7d8e';
  if (key === 'fail') return '#f87171';
  const sorted = [...bands].sort((a, b) => b.min - a.min);
  const i = sorted.findIndex(b => b.key === key);
  if (i < 0) return '#8a9ab0';
  if (sorted.length === 1) return BAND_COLORS[0];
  return BAND_COLORS[Math.round((i / (sorted.length - 1)) * (BAND_COLORS.length - 1))];
}
