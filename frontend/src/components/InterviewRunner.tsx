import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import {
  ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Flag, Phone, Users,
  ShieldAlert, AlertTriangle, CheckCircle2, ListChecks, Trash2,
} from 'lucide-react';
import {
  ApiError, completeInterview, discardInterview, fetchInterview, saveInterviewProgress,
  MODE_LABELS, ProgressPatch, STATUS_LABELS,
} from '../interviewKits/api';
import {
  InterviewAnswer, InterviewResult, InterviewWithKit, KitQuestion, KitSection,
} from '../interviewKits/types';
import {
  FontImport, Page, TopBar, TopBarTitle, Inner, GhostButton, PrimaryButton, Badge, Card,
  CardHeader, CardTitle, CardBody, Mono, TextArea, Label, CenterMsg, clipCorners,
} from '../interviewKits/styles';
import InterviewResultPanel from './InterviewResultPanel';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';

// ─── layout ────────────────────────────────────────────────────────────────────

const RunnerPage = styled(Page)`
  padding-bottom: 7rem; /* room for the sticky footer */
`;

const TopMeta = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const SaveState = styled(Mono)<{ $error?: boolean }>`
  ${p => p.$error && css`color: #f87171;`}
`;

const ProgressTrack = styled.div`
  height: 3px;
  background: #1e2330;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: #4ade80;
  transition: width 0.25s ease;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const SectionName = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8a9ab0;
`;

const Prompt = styled.p`
  font-size: 1.25rem;
  line-height: 1.5;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 1.25rem;
  letter-spacing: -0.01em;

  @media (max-width: 600px) { font-size: 1.08rem; }
`;

const Guidance = styled.div`
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  border-left: 2px solid #a78bfa;
  background: rgba(167,139,250,0.06);
  color: #ddd6fe;
  font-size: 0.82rem;
  line-height: 1.55;
  padding: 0.65rem 0.85rem;
  margin-bottom: 1.25rem;

  svg { flex-shrink: 0; margin-top: 0.15rem; }
`;

const KeyToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #161a22;
  border: 1px solid #232830;
  color: #c8d0dc;
  font-family: 'Sora', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.8rem 1rem;
  cursor: pointer;
  min-height: 48px;
`;

const KeyPanel = styled.div`
  background: #161a22;
  border: 1px solid #232830;
  border-top: none;
  padding: 0.9rem 1rem 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const KeyLabel = styled.div<{ $tone?: 'flag' }>`
  font-size: 0.64rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${p => (p.$tone === 'flag' ? '#f87171' : '#6e7d8e')};
  margin-bottom: 0.2rem;
`;

const KeyText = styled.p`
  font-size: 0.86rem;
  line-height: 1.6;
  color: #c8d0dc;
  margin: 0;
  white-space: pre-wrap;
`;

const ScoreGrid = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${p => Math.min(p.$count, 4)}, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.25rem;

  @media (max-width: 380px) {
    grid-template-columns: repeat(${p => Math.min(p.$count, 2)}, minmax(0, 1fr));
  }
`;

const ScoreBtn = styled.button<{ $selected: boolean }>`
  min-height: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.5rem 0.4rem;
  background: ${p => (p.$selected ? '#4ade80' : '#161a22')};
  border: 1px solid ${p => (p.$selected ? '#4ade80' : '#2a3040')};
  color: ${p => (p.$selected ? '#111318' : '#ffffff')};
  font-family: 'Sora', sans-serif;
  cursor: pointer;
  ${clipCorners}

  b { font-family: 'JetBrains Mono', monospace; font-size: 1.15rem; }
  span { font-size: 0.66rem; line-height: 1.3; text-align: center; opacity: 0.85; }

  &:hover { border-color: #4ade80; }
`;

const FlagBtn = styled.button<{ $on: boolean }>`
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  background: ${p => (p.$on ? 'rgba(248,113,113,0.12)' : '#161a22')};
  border: 1px solid ${p => (p.$on ? '#f87171' : '#2a3040')};
  color: ${p => (p.$on ? '#f87171' : '#c8d0dc')};
  font-family: 'Sora', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  ${clipCorners}
`;

const Footer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  background: #111318;
  border-top: 1px solid #232830;
  padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
`;

const FooterInner = styled.div`
  max-width: 720px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.75rem;

  > :last-child { justify-self: end; }
`;

const NavBtn = styled(GhostButton)`
  min-height: 48px;
  padding: 0 1rem;
`;

const NextBtn = styled(PrimaryButton)`
  min-height: 48px;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  li { font-size: 0.86rem; line-height: 1.6; color: #c8d0dc; }
`;

const ReviewRow = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 2.25rem 1fr auto;
  gap: 0.6rem;
  align-items: start;
  text-align: left;
  background: transparent;
  border: none;
  border-top: 1px solid #1e2330;
  padding: 0.75rem 0;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  color: #c8d0dc;

  &:first-of-type { border-top: none; }
  &:hover p { color: #ffffff; }

  p { margin: 0; font-size: 0.82rem; line-height: 1.5; }
`;

const ReviewScore = styled.span<{ $missing?: boolean }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${p => (p.$missing ? '#fbbf24' : '#4ade80')};
  white-space: nowrap;
`;

const Notice = styled.div<{ $tone?: 'warn' }>`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  border: 1px solid ${p => (p.$tone === 'warn' ? 'rgba(251,191,36,0.35)' : '#2a3040')};
  background: ${p => (p.$tone === 'warn' ? 'rgba(251,191,36,0.06)' : '#161a22')};
  color: ${p => (p.$tone === 'warn' ? '#fcd34d' : '#c8d0dc')};
  font-size: 0.82rem;
  line-height: 1.6;
  padding: 0.8rem 1rem;
  margin-bottom: 1.25rem;

  svg { flex-shrink: 0; margin-top: 0.15rem; }
`;

const SmallBtn = styled(GhostButton)`
  font-size: 0.72rem;
`;

const ErrorText = styled.p`
  color: #f87171;
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0 0 1rem;
`;

// ─── helpers ───────────────────────────────────────────────────────────────────

interface FlatQuestion {
  question: KitQuestion;
  section: KitSection;
}

type Step = 'intro' | 'review' | number;
type SaveStatus = 'saved' | 'saving' | 'error' | 'invalid';

const EMPTY_ANSWER: InterviewAnswer = { score: null, notes: '', redFlag: false };
const SAVE_DELAY_MS = 600;
const RETRY_DELAY_MS = 4000;

function isAnswered(section: KitSection, a: InterviewAnswer | undefined, custom?: boolean): boolean {
  if (!a) return false;
  // Custom interviews: scores are optional, so notes or a flag count too.
  if (custom) return a.score !== null || a.redFlag || a.notes.trim().length > 0;
  return section.scoreOptions ? a.score !== null : true; // unscored questions never block
}

function formatTime(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

// ─── component ─────────────────────────────────────────────────────────────────

const InterviewRunner: React.FC = () => {
  const { pipelineId: pipelineParam, interviewId: interviewParam } = useParams<{ pipelineId: string; interviewId: string }>();
  const navigate = useNavigate();
  const interviewId = Number(interviewParam);
  const pipelineId = Number(pipelineParam);
  const backToProfile = useCallback(() => navigate(`/candidates/${pipelineParam}`), [navigate, pipelineParam]);

  const [interview, setInterview] = useState<InterviewWithKit | null>(null);
  const [answers, setAnswers] = useState<Record<string, InterviewAnswer>>({});
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [candidate, setCandidate] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('intro');
  const [showKey, setShowKey] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Autosave queue: answers changed locally but not yet saved, and the latest
  // position. Each changed question is sent as its own PATCH.
  const dirty = useRef(new Map<string, InterviewAnswer>());
  const pendingIndex = useRef<number | undefined>(undefined);
  const flushing = useRef<Promise<void> | null>(null);
  const timer = useRef<number | null>(null);

  const kit = interview?.kit ?? null;
  const locked = interview?.status === 'completed';

  const flat: FlatQuestion[] = useMemo(
    () => (kit?.sections ?? []).flatMap(section => section.questions.map(question => ({ question, section }))),
    [kit],
  );

  // ── load ──
  const applyLoaded = useCallback((iv: InterviewWithKit) => {
    setInterview(iv);
    setAnswers(iv.answers || {});
    setResult(iv.result);
    setSavedAt(iv.updatedAt);
    const total = iv.kit.sections.reduce((n, s) => n + s.questions.length, 0);
    if (iv.status === 'completed' || iv.currentIndex >= total) setStep('review');
    else setStep(iv.currentIndex >= 0 ? iv.currentIndex : 'intro');
  }, []);

  useEffect(() => {
    if (!Number.isInteger(interviewId) || interviewId <= 0) { setLoadState('missing'); return; }
    let cancelled = false;
    fetchInterview(interviewId)
      .then(iv => {
        if (cancelled) return;
        if (iv.pipelineId !== pipelineId) { setLoadState('missing'); return; }
        applyLoaded(iv);
        setLoadState('ready');
      })
      .catch(err => { if (!cancelled) setLoadState(err instanceof ApiError && err.status === 404 ? 'missing' : 'error'); });
    return () => { cancelled = true; };
  }, [interviewId, pipelineId, applyLoaded]);

  useEffect(() => {
    if (!Number.isFinite(pipelineId)) return;
    fetch(`${config.apiUrl}/api/pipeline/${pipelineId}/profile`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => {
        if (res.status !== 'success') return;
        const p = res.data;
        setCandidate(p.full_name || String(p.filename || '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
      })
      .catch(() => {});
  }, [pipelineId]);

  // ── autosave ──
  const flush = useCallback((): Promise<void> => {
    if (flushing.current) return flushing.current;
    if (!dirty.current.size && pendingIndex.current === undefined) return Promise.resolve();
    const run = (async () => {
      setSaveStatus('saving');
      try {
        while (dirty.current.size || pendingIndex.current !== undefined) {
          const next = dirty.current.entries().next();
          const patch: ProgressPatch = {};
          if (!next.done) { patch.key = next.value[0]; patch.answer = next.value[1]; }
          const sentIndex = pendingIndex.current;
          if (sentIndex !== undefined) patch.currentIndex = sentIndex;
          try {
            const updated = await saveInterviewProgress(interviewId, patch);
            setResult(updated.result);
            setSavedAt(updated.updatedAt);
          } catch (err) {
            if (err instanceof ApiError && err.status === 400) {
              // The server rejected this answer; don't retry it forever.
              if (patch.key && dirty.current.get(patch.key) === patch.answer) dirty.current.delete(patch.key);
              setSaveStatus('invalid');
              continue;
            }
            throw err;
          }
          // Only clear what was sent, if it hasn't changed again since.
          if (patch.key && dirty.current.get(patch.key) === patch.answer) dirty.current.delete(patch.key);
          if (pendingIndex.current === sentIndex) pendingIndex.current = undefined;
        }
        setSaveStatus(s => (s === 'invalid' ? s : 'saved'));
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          // Completed elsewhere (another tab or teammate): reload, read-only.
          dirty.current.clear();
          pendingIndex.current = undefined;
          fetchInterview(interviewId).then(applyLoaded).catch(() => {});
          setSaveStatus('saved');
          return;
        }
        setSaveStatus('error');
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => { void flush(); }, RETRY_DELAY_MS);
      }
    })().finally(() => { flushing.current = null; });
    flushing.current = run;
    return run;
  }, [interviewId, applyLoaded]);

  const scheduleSave = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { void flush(); }, SAVE_DELAY_MS);
  }, [flush]);

  // Tab closing or navigating away: send whatever is left, best effort.
  useEffect(() => {
    const sendRemaining = () => {
      if (!dirty.current.size && pendingIndex.current === undefined) return;
      const entries = Array.from(dirty.current.entries());
      if (!entries.length) {
        void saveInterviewProgress(interviewId, { currentIndex: pendingIndex.current }, { keepalive: true }).catch(() => {});
      }
      entries.forEach(([key, answer], i) => {
        const patch: ProgressPatch = { key, answer, ...(i === entries.length - 1 && pendingIndex.current !== undefined && { currentIndex: pendingIndex.current }) };
        void saveInterviewProgress(interviewId, patch, { keepalive: true }).catch(() => {});
      });
    };
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current.size) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('pagehide', sendRemaining);
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('pagehide', sendRemaining);
      window.removeEventListener('beforeunload', warn);
      if (timer.current) window.clearTimeout(timer.current);
      sendRemaining();
    };
  }, [interviewId]);

  const goTo = useCallback((next: Step) => {
    setStep(next);
    setActionError(null);
    if (!locked) {
      pendingIndex.current = typeof next === 'number' ? next : next === 'review' ? flat.length : -1;
      scheduleSave();
    }
    window.scrollTo({ top: 0 });
  }, [locked, flat.length, scheduleSave]);

  const updateAnswer = useCallback((key: string, patch: Partial<InterviewAnswer>) => {
    if (locked) return;
    setAnswers(prev => {
      const nextAnswer = { ...(prev[key] ?? EMPTY_ANSWER), ...patch };
      dirty.current.set(key, nextAnswer);
      return { ...prev, [key]: nextAnswer };
    });
    scheduleSave();
  }, [locked, scheduleSave]);

  // ── complete / discard ──
  const finish = async () => {
    if (!interview || !result) return;
    const msg = result.allScored || kit?.custom
      ? 'Complete this interview? It will be saved to the application and locked.'
      : 'Some questions aren\'t scored. Complete anyway? It will be saved to the application and locked.';
    if (!window.confirm(msg)) return;
    setBusy(true);
    setActionError(null);
    try {
      if (timer.current) window.clearTimeout(timer.current);
      await flush();
      if (dirty.current.size) throw new Error('unsaved');
      const done = await completeInterview(interview.id);
      applyLoaded(done);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setActionError(err instanceof Error && err.message === 'unsaved'
        ? 'Your latest answers haven\'t saved yet. Check your connection and try again.'
        : err instanceof ApiError ? err.message : 'Could not complete the interview. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const discard = async () => {
    if (!interview) return;
    if (!window.confirm('Discard this interview? Its scores and notes will be deleted.')) return;
    setBusy(true);
    try {
      dirty.current.clear();
      pendingIndex.current = undefined;
      if (timer.current) window.clearTimeout(timer.current);
      await discardInterview(interview.id);
      backToProfile();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Could not discard the interview.');
      setBusy(false);
    }
  };

  if (loadState !== 'ready' || !kit || !interview || !result) {
    return (
      <>
        <FontImport />
        <Page>
          <TopBar>
            <GhostButton onClick={backToProfile}>
              <ArrowLeft size={13} /> Profile
            </GhostButton>
            <TopBarTitle>Interview</TopBarTitle>
          </TopBar>
          <Inner $narrow>
            {loadState === 'loading' && <CenterMsg>Loading interview...</CenterMsg>}
            {loadState === 'missing' && <CenterMsg>This interview could not be found.</CenterMsg>}
            {loadState === 'error' && <CenterMsg>Could not load this interview. Try again in a moment.</CenterMsg>}
          </Inner>
        </Page>
      </>
    );
  }

  const answeredCount = flat.filter(f => isAnswered(f.section, answers[f.question.key], kit.custom)).length;
  const pct = flat.length ? Math.round((answeredCount / flat.length) * 100) : 0;
  const current = typeof step === 'number' ? flat[step] : null;
  const answer = current ? answers[current.question.key] ?? EMPTY_ANSWER : EMPTY_ANSWER;
  const isLast = typeof step === 'number' && step === flat.length - 1;

  const saveLabel = locked
    ? `Completed ${formatDate(interview.completedAt)} · locked`
    : saveStatus === 'saving' ? 'Saving...'
    : saveStatus === 'error' ? 'Not saved: retrying...'
    : saveStatus === 'invalid' ? 'One answer was rejected. Check it and try again.'
    : `Saved · ${formatTime(savedAt)}`;

  return (
    <>
      <FontImport />
      <RunnerPage>
        <TopBar>
          <GhostButton onClick={backToProfile} aria-label="Back to profile">
            <ArrowLeft size={13} />
          </GhostButton>
          <TopMeta>
            <TopBarTitle>{candidate ? `${candidate} · ${kit.title}` : kit.title}</TopBarTitle>
            <SaveState $error={saveStatus === 'error' || saveStatus === 'invalid'} role="status">{saveLabel}</SaveState>
          </TopMeta>
          <Badge>{interview.mode === 'phone' ? <Phone size={10} /> : <Users size={10} />} {MODE_LABELS[interview.mode]}</Badge>
        </TopBar>
        <ProgressTrack><ProgressFill $pct={pct} /></ProgressTrack>

        <Inner $narrow>
          {/* ── Intro ── */}
          {step === 'intro' && (
            <>
              <SectionLabel>
                {kit.custom
                  ? <Mono>{flat.length} questions · scores optional</Mono>
                  : <>
                      <Badge $tone={kit.status === 'reviewed' ? 'reviewed' : 'draft'}>{STATUS_LABELS[kit.status] ?? kit.status}</Badge>
                      <Mono>v{kit.version} · {flat.length} questions</Mono>
                    </>}
              </SectionLabel>
              <Prompt>{kit.title}</Prompt>

              {kit.custom && (
                <Notice>
                  <ListChecks size={15} color="#4ade80" />
                  <span>
                    One question at a time. Take notes as they answer; everything saves as you type. Scoring
                    each question 0–2 is optional and adds up to a simple total.
                  </span>
                </Notice>
              )}

              {!kit.custom && kit.status === 'draft_under_review' && (
                <Notice $tone="warn">
                  <AlertTriangle size={15} />
                  <span>This kit is a draft under review. Use it as a guide. A person makes the hiring decision.</span>
                </Notice>
              )}

              {kit.howToUse && kit.howToUse.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Before you start</CardTitle></CardHeader>
                  <CardBody><List>{kit.howToUse.map((t, i) => <li key={i}>{t}</li>)}</List></CardBody>
                </Card>
              )}

              {kit.guardrails && kit.guardrails.length > 0 && (
                <Card>
                  <CardHeader>
                    <ShieldAlert size={13} color="#f87171" />
                    <CardTitle>Guardrails</CardTitle>
                  </CardHeader>
                  <CardBody><List>{kit.guardrails.map((t, i) => <li key={i}>{t}</li>)}</List></CardBody>
                </Card>
              )}
            </>
          )}

          {/* ── Question ── */}
          {current && typeof step === 'number' && (
            <>
              <SectionLabel>
                <SectionName>{current.section.title}</SectionName>
                <Mono>Question {step + 1} of {flat.length}</Mono>
              </SectionLabel>

              <Prompt>{current.question.prompt}</Prompt>

              {current.question.guidance && (
                <Guidance><AlertTriangle size={14} /><span>{current.question.guidance}</span></Guidance>
              )}

              {(current.question.answerKey || current.question.redFlags || current.question.details?.length) && (
                <>
                  <KeyToggle onClick={() => setShowKey(s => !s)} aria-expanded={showKey}>
                    {showKey ? 'Hide answer key' : 'Show answer key'}
                    {showKey ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </KeyToggle>
                  {showKey ? (
                    <KeyPanel>
                      {current.question.answerKey && (
                        <div><KeyLabel>{current.section.scoreOptions ? 'Answer key' : 'Honest answer'}</KeyLabel><KeyText>{current.question.answerKey}</KeyText></div>
                      )}
                      {current.question.details?.map((d, i) => (
                        <div key={i}><KeyLabel>{d.label}</KeyLabel><KeyText>{d.text}</KeyText></div>
                      ))}
                      {current.question.redFlags && (
                        <div><KeyLabel $tone="flag">Red flags</KeyLabel><KeyText>{current.question.redFlags}</KeyText></div>
                      )}
                    </KeyPanel>
                  ) : <div style={{ marginBottom: '1.25rem' }} />}
                </>
              )}

              {current.section.scoreOptions ? (
                <>
                  <Label>Score</Label>
                  <ScoreGrid $count={current.section.scoreOptions.length}>
                    {current.section.scoreOptions.map(o => (
                      <ScoreBtn
                        key={o.value}
                        $selected={answer.score === o.value}
                        aria-pressed={answer.score === o.value}
                        disabled={locked}
                        onClick={() => updateAnswer(current.question.key, { score: answer.score === o.value ? null : o.value })}
                      >
                        <b>{o.label}</b>
                        {o.description && <span>{o.description}</span>}
                      </ScoreBtn>
                    ))}
                  </ScoreGrid>
                </>
              ) : (
                <>
                  <Label>Not scored</Label>
                  <FlagBtn
                    $on={answer.redFlag}
                    aria-pressed={answer.redFlag}
                    disabled={locked}
                    onClick={() => updateAnswer(current.question.key, { redFlag: !answer.redFlag })}
                  >
                    <Flag size={16} /> {answer.redFlag ? 'Red flag marked' : 'Mark red flag'}
                  </FlagBtn>
                </>
              )}

              <Label htmlFor="q-notes">Notes</Label>
              <TextArea
                id="q-notes"
                value={answer.notes}
                placeholder={locked ? '' : 'What did they say?'}
                maxLength={5000}
                readOnly={locked}
                onChange={e => updateAnswer(current.question.key, { notes: e.target.value })}
              />
            </>
          )}

          {/* ── Review ── */}
          {step === 'review' && (
            <>
              <SectionLabel>
                <ListChecks size={14} color="#4ade80" />
                <SectionName>{locked ? 'Completed interview' : 'Review'}</SectionName>
                <Mono>
                  {answeredCount} of {flat.length} answered{kit.custom ? '' : ` · v${kit.version}`}
                  {interview.interviewerEmail ? ` · ${interview.interviewerEmail}` : ''}
                </Mono>
              </SectionLabel>

              <InterviewResultPanel result={result} live={!locked} />

              {!locked && (
                <>
                  {actionError && <ErrorText>{actionError}</ErrorText>}
                  <Notice>
                    <CheckCircle2 size={15} color="#4ade80" />
                    <span>
                      Completing saves this interview to the candidate's application and locks it. Earlier
                      interviews stay as they are. The result is a recommendation only; it never changes the
                      candidate's status.
                    </span>
                  </Notice>
                </>
              )}

              {kit.sections.map(section => {
                const scored = !!section.scoreOptions;
                const max = scored ? Math.max(...section.scoreOptions!.map(o => o.value)) : 0;
                return (
                  <Card key={section.key}>
                    <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
                    <CardBody>
                      {section.questions.map(q => {
                        const idx = flat.findIndex(f => f.question.key === q.key);
                        const a = answers[q.key];
                        const label = scored
                          ? (a?.score ?? null) === null ? 'Not scored' : `${a!.score} / ${max}`
                          : a?.redFlag ? 'Red flag' : 'No flag';
                        return (
                          <ReviewRow key={q.key} onClick={() => goTo(idx)}>
                            <Mono>{q.number}</Mono>
                            <p>{q.prompt}{a?.notes ? <><br /><Mono>{a.notes.length > 140 ? `${a.notes.slice(0, 140)}…` : a.notes}</Mono></> : null}</p>
                            <ReviewScore $missing={!kit.custom && scored && (a?.score ?? null) === null}>
                              {kit.custom && scored && (a?.score ?? null) === null ? '—' : label}
                            </ReviewScore>
                          </ReviewRow>
                        );
                      })}
                    </CardBody>
                  </Card>
                );
              })}

              {!locked && (
                <SmallBtn onClick={discard} disabled={busy}>
                  <Trash2 size={12} /> Discard interview
                </SmallBtn>
              )}
            </>
          )}
        </Inner>

        <Footer>
          <FooterInner>
            <div>
              {step !== 'intro' && (
                <NavBtn onClick={() => goTo(step === 'review' ? flat.length - 1 : step === 0 ? 'intro' : (step as number) - 1)}>
                  <ChevronLeft size={15} /> Back
                </NavBtn>
              )}
            </div>
            <Mono>{answeredCount}/{flat.length}</Mono>
            <div>
              {step === 'intro' && (
                <NextBtn onClick={() => goTo(0)} disabled={flat.length === 0}>
                  {locked ? 'View answers' : answeredCount > 0 ? 'Resume' : 'Begin'} <ChevronRight size={15} />
                </NextBtn>
              )}
              {typeof step === 'number' && (
                <NextBtn onClick={() => goTo(isLast ? 'review' : step + 1)}>
                  {isLast ? (locked ? 'Result' : 'Review') : 'Next'} <ChevronRight size={15} />
                </NextBtn>
              )}
              {step === 'review' && (locked
                ? <NavBtn onClick={backToProfile}>Back to profile</NavBtn>
                : <NextBtn onClick={finish} disabled={busy}>{busy ? 'Saving...' : 'Complete'}</NextBtn>)}
            </div>
          </FooterInner>
        </Footer>
      </RunnerPage>
    </>
  );
};

export default InterviewRunner;
