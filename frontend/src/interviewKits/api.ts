import { config } from '../config';
import { getAuthHeaders, handleUnauthorized } from '../utils/auth';
import { Interview, InterviewAnswer, InterviewKit, InterviewKitSummary, InterviewMode, InterviewWithKit } from './types';

// Kit content (questions and answer keys) comes only from the authenticated
// API. It is never bundled into the frontend: the JS bundle is public.

export class ApiError extends Error {
  status: number;
  details?: string[];
  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Before the backend is deployed, CloudFront answers unknown paths with
// index.html (200, text/html). Treat a non-JSON response as "not available".
function isJson(res: Response): boolean {
  return (res.headers.get('content-type') || '').includes('application/json');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...getAuthHeaders() };
  if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${config.apiUrl}${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) } });
  if (handleUnauthorized(res)) throw new ApiError(401, 'Signed out');
  if (!isJson(res)) throw new ApiError(res.ok ? 404 : res.status, 'Not available');
  const body = await res.json();
  if (!res.ok) throw new ApiError(res.status, body?.message || `Request failed (${res.status})`, body?.errors);
  return body.data as T;
}

// ─── kits ────────────────────────────────────────────────────────────────────

export async function fetchKits(): Promise<InterviewKitSummary[]> {
  try {
    return (await request<{ kits: InterviewKitSummary[] }>('/api/interview-kits')).kits;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function fetchKit(id: string): Promise<InterviewKit | null> {
  try {
    return (await request<{ kit: InterviewKit }>(`/api/interview-kits/${encodeURIComponent(id)}`)).kit;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// ─── interviews ──────────────────────────────────────────────────────────────

export async function fetchInterviews(pipelineId: number): Promise<Interview[]> {
  try {
    return (await request<{ interviews: Interview[] }>(`/api/interviews?pipelineId=${pipelineId}`)).interviews;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function createInterview(pipelineId: number, kitId: string, mode: InterviewMode): Promise<InterviewWithKit> {
  return (await request<{ interview: InterviewWithKit }>('/api/interviews', {
    method: 'POST',
    body: JSON.stringify({ pipelineId, kitId, mode }),
  })).interview;
}

export async function fetchInterview(id: number): Promise<InterviewWithKit> {
  return (await request<{ interview: InterviewWithKit }>(`/api/interviews/${id}`)).interview;
}

export interface ProgressPatch {
  key?: string;
  answer?: InterviewAnswer;
  currentIndex?: number;
}

export async function saveInterviewProgress(id: number, patch: ProgressPatch, opts: { keepalive?: boolean } = {}): Promise<Interview> {
  return (await request<{ interview: Interview }>(`/api/interviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    keepalive: opts.keepalive,
  })).interview;
}

export async function completeInterview(id: number): Promise<InterviewWithKit> {
  return (await request<{ interview: InterviewWithKit }>(`/api/interviews/${id}/complete`, { method: 'POST' })).interview;
}

export async function discardInterview(id: number): Promise<void> {
  await request(`/api/interviews/${id}`, { method: 'DELETE' });
}

// ─── admin ───────────────────────────────────────────────────────────────────

export interface AdminKitStatus {
  slug: string;
  title: string;
  type: string;
  latestVersion: number | null;
  versionCount: number;
  lastUploadedAt: string | null;
}

export async function fetchAdminKits(): Promise<AdminKitStatus[]> {
  return (await request<{ kits: AdminKitStatus[] }>('/api/admin/interview-kits')).kits;
}

export async function uploadKitDocx(slug: string, file: File): Promise<{ created: boolean; version: number; message: string; questionCount: number }> {
  const form = new FormData();
  form.append('file', file);
  return request(`/api/admin/interview-kits/${encodeURIComponent(slug)}/upload`, { method: 'POST', body: form });
}

// ─── labels ──────────────────────────────────────────────────────────────────

export const KIT_TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  character: 'Character',
  aptitude: 'Aptitude',
};

export const STATUS_LABELS: Record<string, string> = {
  draft_under_review: 'Draft - Under review',
  reviewed: 'Reviewed',
};

export const MODE_LABELS: Record<InterviewMode, string> = { phone: 'Phone', in_person: 'In person' };
