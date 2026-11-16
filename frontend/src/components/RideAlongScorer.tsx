import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, CloudOff, Info, Loader2, MessageSquare, ShieldAlert, Trash2 } from 'lucide-react';
import {
  Badge, Card, CardBody, CardHeader, CardTitle, CenterMsg, FontImport, GhostButton, Inner, Mono, Page,
  PrimaryButton, TextArea, TopBar, TopBarTitle,
} from '../interviewKits/styles';
import { ApiError, discardEvaluation, fetchEvaluation, submitEvaluation } from '../rideAlong/api';
import { Evaluation, EvaluationResult, FlagEntry, ScoreEntry, StepScore } from '../rideAlong/types';
import { useEvaluationAutosave } from '../rideAlong/useEvaluationAutosave';
import RideAlongResult from './RideAlongResult';

// Mobile-first scorer for a ride-along. Used one-handed in a shop or truck,
// opened and closed all day: every tap autosaves, and reopening lands on the
// screen the scorer left.

const SCORE_BUTTONS: { value: StepScore; label: string }[] = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
];
const EMPTY: ScoreEntry = { score: null, note: '' };

// ─── styles ──────────────────────────────────────────────────────────────────

const Bar = styled(TopBar)`
  gap: 0.6rem;
  @media (max-width: 768px) { padding: 0.6rem 0.75rem; }
`;

const TitleBlock = styled.div`
  flex: 1;
  min-width: 0;
  ${Mono} { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid #2a3040;
  color: #8a9ab0;
  cursor: pointer;
  &:hover { color: #4ade80; border-color: #4ade80; }
`;

const SaveState = styled.span<{ $tone: 'ok' | 'busy' | 'bad' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.66rem;
  flex-shrink: 0;
  color: ${p => (p.$tone === 'bad' ? '#f87171' : p.$tone === 'busy' ? '#fbbf24' : '#4ade80')};
  svg.spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const Pills = styled.div`
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #1e2330;
  background: #111318;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Pill = styled.button<{ $active: boolean; $done: boolean }>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  padding: 0.45rem 0.7rem;
  min-height: 36px;
  cursor: pointer;
  border: 1px solid ${p => (p.$active ? '#4ade80' : '#2a3040')};
  color: ${p => (p.$active ? '#111318' : p.$done ? '#4ade80' : '#8a9ab0')};
  background: ${p => (p.$active ? '#4ade80' : 'transparent')};
`;

const Body = styled(Inner)`
  padding-bottom: 7rem;
  @media (max-width: 768px) { padding: 1rem 0.75rem 7rem; }
`;

const Heading = styled.h2`
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.3rem;
`;

const Sub = styled.p`
  color: #8a9ab0;
  font-size: 0.84rem;
  line-height: 1.55;
  margin: 0 0 1rem;
`;

const BottomBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem calc(0.6rem + env(safe-area-inset-bottom));
  background: #111318;
  border-top: 1px solid #232830;
`;

const NavBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  min-height: 52px;
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid ${p => (p.$primary ? '#4ade80' : '#2a3040')};
  background: ${p => (p.$primary ? '#4ade80' : 'transparent')};
  color: ${p => (p.$primary ? '#111318' : '#c8d0dc')};
  &:disabled { opacity: 0.3; cursor: default; }
`;

const TaskPick = styled.button<{ $on: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 0.75rem;
  align-items: start;
  text-align: left;
  padding: 0.9rem;
  margin-bottom: 0.6rem;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  background: ${p => (p.$on ? 'rgba(74,222,128,0.06)' : '#161a22')};
  border: 1px solid ${p => (p.$on ? '#4ade80' : '#232830')};
  color: #c8d0dc;
  &:disabled { cursor: default; }
  strong { display: block; color: #ffffff; font-size: 0.92rem; margin-bottom: 0.25rem; }
`;

const Tick = styled.span<{ $on: boolean }>`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${p => (p.$on ? '#4ade80' : '#3a4250')};
  background: ${p => (p.$on ? '#4ade80' : 'transparent')};
  color: #111318;
`;

const Row = styled.div`
  background: #161a22;
  border: 1px solid #232830;
  padding: 0.85rem;
  margin-bottom: 0.6rem;
`;

const RowText = styled.button`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  color: #dbe2ec;
  font-size: 0.92rem;
  line-height: 1.45;
  b { font-family: 'JetBrains Mono', monospace; color: #6e7d8e; font-size: 0.78rem; padding-top: 0.15rem; }
  span { flex: 1; }
  svg { flex-shrink: 0; margin-top: 0.2rem; }
`;

const TwoLooksLike = styled.div`
  margin-top: 0.6rem;
  padding: 0.65rem 0.75rem;
  border-left: 3px solid #4ade80;
  background: rgba(74,222,128,0.06);
  font-size: 0.84rem;
  line-height: 1.55;
  color: #c8d0dc;
  strong { display: block; color: #4ade80; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
`;

const Buttons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 0.8fr 52px;
  gap: 0.4rem;
  margin-top: 0.7rem;
`;

const scoreColor = (v: StepScore) => (v === 0 ? '#f87171' : v === 1 ? '#fbbf24' : v === 2 ? '#4ade80' : '#8a9ab0');

const ScoreBtn = styled.button<{ $value: StepScore; $on: boolean }>`
  min-height: 56px;
  font-family: 'JetBrains Mono', monospace;
  font-size: ${p => (p.$value === 'na' ? '0.8rem' : '1.3rem')};
  font-weight: 700;
  cursor: pointer;
  border: 2px solid ${p => (p.$on ? scoreColor(p.$value) : '#2a3040')};
  background: ${p => (p.$on ? scoreColor(p.$value) : '#111318')};
  color: ${p => (p.$on ? '#111318' : '#c8d0dc')};
  touch-action: manipulation;
  &:disabled { cursor: default; opacity: ${p => (p.$on ? 1 : 0.35)}; }
`;

const NoteBtn = styled.button<{ $on: boolean }>`
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid ${p => (p.$on ? '#60a5fa' : '#2a3040')};
  background: #111318;
  color: ${p => (p.$on ? '#60a5fa' : '#8a9ab0')};
  &:disabled { cursor: default; opacity: 0.35; }
`;

const NoteArea = styled(TextArea)<{ $required?: boolean }>`
  min-height: 70px;
  margin-top: 0.6rem;
  font-size: 16px; /* stops iOS zooming in on focus */
  ${p => p.$required && css`border-color: #f87171;`}
`;

const FlagRow = styled(Row)<{ $on: boolean }>`
  border-color: ${p => (p.$on ? '#f87171' : '#232830')};
`;

const FlagToggle = styled.button`
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 0.75rem;
  width: 100%;
  min-height: 44px;
  align-items: center;
  text-align: left;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  color: #dbe2ec;
  font-size: 0.92rem;
  line-height: 1.45;
  &:disabled { cursor: default; }
`;

const ErrorText = styled.div`
  color: #f87171;
  font-size: 0.82rem;
  line-height: 1.5;
  margin: 0.75rem 0;
  ul { margin: 0.3rem 0 0; padding-left: 1.1rem; }
`;

const DateInput = styled.input`
  background: #111318;
  border: 1px solid #2a3040;
  color: #c8d0dc;
  font-family: 'Sora', sans-serif;
  font-size: 16px;
  padding: 0.55rem 0.75rem;
  color-scheme: dark;
`;

// ─── a scoring row (step or observation item) ────────────────────────────────

interface ScoreRowProps {
  number: string;
  text: string;
  twoLooksLike?: string | null;
  safety?: boolean;
  entry: ScoreEntry;
  locked: boolean;
  onChange: (next: ScoreEntry) => void;
}

const ScoreRow: React.FC<ScoreRowProps> = ({ number, text, twoLooksLike, safety, entry, locked, onChange }) => {
  const [showTwo, setShowTwo] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const pick = (v: StepScore) => onChange({ ...entry, score: entry.score === v ? null : v });
  const showNote = noteOpen || !!entry.note;
  return (
    <Row>
      <RowText type="button" onClick={() => setShowTwo(s => !s)} aria-expanded={showTwo}>
        <b>{number}</b>
        <span>
          {text}
          {safety && <> <Badge $tone="critical" style={{ marginLeft: 4 }}><ShieldAlert size={10} /> Safety</Badge></>}
        </span>
        {twoLooksLike && <Info size={15} color={showTwo ? '#4ade80' : '#6e7d8e'} />}
      </RowText>
      {showTwo && (
        <TwoLooksLike>
          <strong>What a 2 looks like</strong>
          {twoLooksLike || 'No description for this one.'}
        </TwoLooksLike>
      )}
      {safety && entry.score === 0 && (
        <ErrorText style={{ margin: '0.6rem 0 0' }}>A 0 on a safety step sets this task to 0 and adds a red flag.</ErrorText>
      )}
      <Buttons>
        {SCORE_BUTTONS.map(b => (
          <ScoreBtn key={b.label} type="button" $value={b.value} $on={entry.score === b.value} disabled={locked}
            onClick={() => pick(b.value)} aria-pressed={entry.score === b.value} aria-label={`Score ${b.label}`}>
            {b.label}
          </ScoreBtn>
        ))}
        <ScoreBtn type="button" $value="na" $on={entry.score === 'na'} disabled={locked}
          onClick={() => pick('na')} aria-pressed={entry.score === 'na'}>N/A</ScoreBtn>
        <NoteBtn type="button" $on={showNote} disabled={locked && !entry.note} onClick={() => setNoteOpen(o => !o)} aria-label="Note">
          <MessageSquare size={18} />
        </NoteBtn>
      </Buttons>
      {showNote && (
        <NoteArea
          value={entry.note}
          readOnly={locked}
          placeholder="Optional note"
          maxLength={2000}
          onChange={e => onChange({ ...entry, note: e.target.value })}
        />
      )}
    </Row>
  );
};

// ─── page ────────────────────────────────────────────────────────────────────

const RideAlongScorer: React.FC = () => {
  const { evaluationId: idParam } = useParams<{ evaluationId: string }>();
  const evaluationId = Number(idParam);
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [chosen, setChosen] = useState<string[]>([]);
  const [stepScores, setStepScores] = useState<Record<string, ScoreEntry>>({});
  const [itemScores, setItemScores] = useState<Record<string, ScoreEntry>>({});
  const [flags, setFlags] = useState<Record<string, FlagEntry>>({});
  const [evaluatedOn, setEvaluatedOn] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [screen, setScreen] = useState('tasks');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; details?: string[] } | null>(null);

  const locked = evaluation?.status === 'submitted';
  // Back to wherever the scorer came from (a profile, the comparison), else home.
  const goBack = useCallback(() => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1); else navigate('/ride-along');
  }, [navigate]);

  const apply = useCallback((e: Evaluation) => {
    setEvaluation(e);
    setChosen(e.chosenTaskCodes);
    setStepScores(e.stepScores);
    setItemScores(e.itemScores);
    setFlags(e.redFlags);
    setEvaluatedOn(e.evaluatedOn);
    setResult(e.result);
    const valid = e.status === 'submitted' ? 'summary'
      : e.currentScreen && (['tasks', 'observations', 'flags', 'summary'].includes(e.currentScreen)
          || (e.currentScreen.startsWith('task:') && e.chosenTaskCodes.includes(e.currentScreen.slice(5))))
        ? e.currentScreen : 'tasks';
    setScreen(valid);
  }, []);

  const reload = useCallback(() => {
    fetchEvaluation(evaluationId)
      .then(e => { apply(e); setLoadState('ready'); })
      .catch(err => setLoadState(err instanceof ApiError && err.status === 404 ? 'missing' : 'error'));
  }, [evaluationId, apply]);

  useEffect(() => {
    if (!Number.isInteger(evaluationId) || evaluationId <= 0) { setLoadState('missing'); return; }
    reload();
  }, [evaluationId, reload]);

  const autosave = useEvaluationAutosave(evaluationId, {
    // Only the computed result comes back from the server; local taps stay authoritative.
    onSaved: e => setResult(e.result),
    onLocked: reload,
  });

  const screens = useMemo(() => ['tasks', ...chosen.map(c => `task:${c}`), 'observations', 'flags', 'summary'], [chosen]);
  const index = Math.max(0, screens.indexOf(screen));

  const goTo = useCallback(async (next: string) => {
    setError(null);
    setScreen(next);
    window.scrollTo({ top: 0 });
    if (!locked) autosave.save('screen', { currentScreen: next });
    if (next === 'summary' && !locked) await autosave.flushNow();
  }, [locked, autosave]);

  // ── edits ──
  const toggleTask = (code: string) => {
    if (locked || !evaluation) return;
    const next = chosen.includes(code) ? chosen.filter(c => c !== code) : [...chosen, code];
    const ordered = evaluation.tasks.map(t => t.code).filter(c => next.includes(c));
    setChosen(ordered);
    autosave.save('tasks', { chosenTaskCodes: ordered });
  };

  const setStep = (key: string, entry: ScoreEntry) => {
    if (locked) return;
    setStepScores(prev => ({ ...prev, [key]: entry }));
    autosave.save(`step:${key}`, { step: { key, score: entry.score, note: entry.note } });
  };

  const setItem = (key: string, entry: ScoreEntry) => {
    if (locked) return;
    setItemScores(prev => ({ ...prev, [key]: entry }));
    autosave.save(`item:${key}`, { item: { key, score: entry.score, note: entry.note } });
  };

  const setFlag = (key: string, ticked: boolean, note = '') => {
    if (locked) return;
    setFlags(prev => {
      const next = { ...prev };
      if (ticked) next[key] = { note }; else delete next[key];
      return next;
    });
    autosave.save(`flag:${key}`, { redFlag: { key, ticked, note } });
  };

  const changeDate = (value: string) => {
    if (locked || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    setEvaluatedOn(value);
    autosave.save('date', { evaluatedOn: value });
  };

  const submit = async () => {
    if (!evaluation || !result) return;
    const unscored = result.unscored.steps + result.unscored.items;
    const msg = unscored
      ? `${unscored} step${unscored === 1 ? '' : 's'} or item${unscored === 1 ? '' : 's'} aren't scored. Submit anyway? It will be locked.`
      : 'Submit this ride-along? It will be locked and the owner will see it.';
    if (!window.confirm(msg)) return;
    setBusy(true);
    setError(null);
    try {
      if (!(await autosave.flushNow())) throw new Error('unsaved');
      apply(await submitEvaluation(evaluation.id));
      window.scrollTo({ top: 0 });
    } catch (err) {
      if (err instanceof Error && err.message === 'unsaved') {
        setError({ text: 'Your latest taps haven\'t saved yet. Check your signal and try again.' });
      } else if (err instanceof ApiError) {
        setError({ text: err.message, details: err.details });
        if (err.message.includes('red flag')) setScreen('flags');
      } else {
        setError({ text: 'Could not submit. Try again in a moment.' });
      }
    } finally {
      setBusy(false);
    }
  };

  const discard = async () => {
    if (!evaluation || !window.confirm('Discard this draft? Its scores and notes will be deleted.')) return;
    setBusy(true);
    try {
      autosave.clear();
      await discardEvaluation(evaluation.id);
      navigate('/ride-along');
    } catch (err) {
      setError({ text: err instanceof ApiError ? err.message : 'Could not discard the draft.' });
      setBusy(false);
    }
  };

  // ── render ──
  if (loadState !== 'ready' || !evaluation || !result) {
    return (
      <Page>
        <FontImport />
        <Bar>
          <IconBtn onClick={goBack} aria-label="Back"><ArrowLeft size={18} /></IconBtn>
          <TopBarTitle>Ride-along</TopBarTitle>
        </Bar>
        <CenterMsg>
          {loadState === 'loading' && 'Loading...'}
          {loadState === 'missing' && 'This ride-along doesn\'t exist or isn\'t on your account.'}
          {loadState === 'error' && 'Could not load this ride-along. Check your connection and try again.'}
        </CenterMsg>
      </Page>
    );
  }

  const taskByCode = new Map(evaluation.tasks.map(t => [t.code, t]));
  const taskResult = (code: string) => result.tasks.find(t => t.code === code);
  const stepsDone = (code: string) => {
    const t = taskByCode.get(code);
    return !!t && t.steps.every(s => stepScores[`${code}.${s.key}`]?.score != null);
  };
  const itemsDone = evaluation.config.categories.every(c => c.items.every(it => itemScores[`${c.key}.${it.key}`]?.score != null));
  const pillLabel = (s: string) => (s === 'tasks' ? 'Tasks' : s === 'observations' ? 'Ride-along' : s === 'flags' ? 'Red flags' : s === 'summary' ? 'Summary' : s.slice(5));
  const pillDone = (s: string) => (s === 'tasks' ? chosen.length > 0 : s.startsWith('task:') ? stepsDone(s.slice(5)) : s === 'observations' ? itemsDone : false);

  const statusView = autosave.status === 'saving'
    ? <SaveState $tone="busy"><Loader2 size={12} className="spin" /> Saving</SaveState>
    : autosave.status === 'error'
      ? <SaveState $tone="bad"><CloudOff size={12} /> Offline, retrying</SaveState>
      : autosave.status === 'invalid'
        ? <SaveState $tone="bad">Not saved</SaveState>
        : <SaveState $tone="ok"><Check size={12} /> {locked ? 'Submitted' : 'Saved'}</SaveState>;

  let content: React.ReactNode;
  if (screen === 'tasks') {
    content = (
      <>
        <Heading>Pick tasks</Heading>
        <Sub>{locked ? 'Tasks scored on this ride-along.' : 'Tap the tasks you\'ll watch the candidate do today. You can change this later.'}</Sub>
        {evaluation.tasks.filter(t => !locked || chosen.includes(t.code)).map(t => {
          const on = chosen.includes(t.code);
          const safetyCount = t.steps.filter(s => s.safety).length;
          return (
            <TaskPick key={t.code} type="button" $on={on} disabled={locked} onClick={() => toggleTask(t.code)} aria-pressed={on}>
              <Tick $on={on}>{on && <Check size={18} strokeWidth={3} />}</Tick>
              <div>
                <strong>{t.code} · {t.name}</strong>
                <Mono>
                  {[t.level, t.time, `${t.steps.length} steps`, safetyCount ? `${safetyCount} safety` : null, t.shared ? null : 'your task']
                    .filter(Boolean).join(' · ')}
                </Mono>
                {t.equipment.length > 0 && <Sub style={{ margin: '0.35rem 0 0', fontSize: '0.78rem' }}>Needs: {t.equipment.join(', ')}</Sub>}
              </div>
            </TaskPick>
          );
        })}
      </>
    );
  } else if (screen.startsWith('task:')) {
    const t = taskByCode.get(screen.slice(5));
    const tr = t && taskResult(t.code);
    content = t ? (
      <>
        <Heading>{t.code} · {t.name}</Heading>
        <Sub>
          {[t.level, t.time].filter(Boolean).join(' · ')}
          {t.equipment.length > 0 && <><br />Needs: {t.equipment.join(', ')}</>}
          <br />Tap a step to see what a 2 looks like. Tap a score again to clear it.
        </Sub>
        {t.steps.map(s => {
          const key = `${t.code}.${s.key}`;
          return (
            <ScoreRow key={key} number={s.key} text={s.text} twoLooksLike={s.twoLooksLike} safety={s.safety}
              entry={stepScores[key] ?? EMPTY} locked={locked} onChange={e => setStep(key, e)} />
          );
        })}
        {tr && (
          <Mono style={{ display: 'block', marginTop: '0.75rem' }}>
            Task score: {tr.score === null ? 'not scored yet' : `${Math.round(tr.score * 100)}%`}
            {tr.safetyZero && ' (safety step scored 0)'}
          </Mono>
        )}
      </>
    ) : <Sub>This task isn't picked any more.</Sub>;
  } else if (screen === 'observations') {
    content = (
      <>
        <Heading>Ride-along observations</Heading>
        <Sub>How they worked through the day. Tap an item to see what a 2 looks like.</Sub>
        {evaluation.config.categories.map(c => (
          <Card key={c.key}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
              <Mono style={{ marginLeft: 'auto' }}>weight {Math.round(c.weight * 100)}%</Mono>
            </CardHeader>
            <CardBody style={{ padding: '0.6rem' }}>
              {c.items.map((it, i) => {
                const key = `${c.key}.${it.key}`;
                return (
                  <ScoreRow key={key} number={String(i + 1)} text={it.text} twoLooksLike={it.twoLooksLike}
                    entry={itemScores[key] ?? EMPTY} locked={locked} onChange={e => setItem(key, e)} />
                );
              })}
            </CardBody>
          </Card>
        ))}
      </>
    );
  } else if (screen === 'flags') {
    const autoFlags = result.redFlags.filter(f => f.auto);
    content = (
      <>
        <Heading>Red flags</Heading>
        <Sub>Tick anything you saw. Every ticked flag needs a note. FAIL flags fail the ride-along; CAP flags limit the total to {evaluation.config.capValue}.</Sub>
        {autoFlags.map(f => (
          <FlagRow key={f.key} $on>
            <Badge $tone="critical">{f.type} · automatic</Badge>
            <div style={{ marginTop: '0.4rem', fontSize: '0.88rem', color: '#dbe2ec' }}>{f.text}</div>
          </FlagRow>
        ))}
        {evaluation.config.redFlags.length === 0 && autoFlags.length === 0 && <Sub>This scorecard has no red flags.</Sub>}
        {evaluation.config.redFlags.map(f => {
          const entry = flags[f.key];
          const on = !!entry;
          return (
            <FlagRow key={f.key} $on={on}>
              <FlagToggle type="button" disabled={locked} onClick={() => setFlag(f.key, !on, entry?.note || '')} aria-pressed={on}>
                <Tick $on={on} style={on ? { background: '#f87171', borderColor: '#f87171' } : undefined}>{on && <Check size={18} strokeWidth={3} />}</Tick>
                <span>
                  {f.text} <Badge $tone={f.type === 'FAIL' ? 'critical' : 'draft'}>{f.type === 'FAIL' ? 'Fail' : `Cap ${evaluation.config.capValue}`}</Badge>
                </span>
              </FlagToggle>
              {on && (
                <NoteArea
                  $required={!entry.note.trim()}
                  value={entry.note}
                  readOnly={locked}
                  placeholder="What happened? (required)"
                  maxLength={2000}
                  onChange={e => setFlag(f.key, true, e.target.value)}
                />
              )}
            </FlagRow>
          );
        })}
      </>
    );
  } else {
    content = (
      <>
        <Heading>{locked ? 'Submitted ride-along' : 'Summary'}</Heading>
        <Sub>
          {evaluation.candidateName} · {evaluation.scorecard.title} v{evaluation.scorecard.version}
          {locked && evaluation.submittedAt && <><br />Submitted {new Date(evaluation.submittedAt).toLocaleString()}{evaluation.scorerEmail ? ` by ${evaluation.scorerEmail}` : ''}</>}
        </Sub>
        <RideAlongResult result={result} bands={evaluation.scorecard.bands} capValue={evaluation.config.capValue} />
        {!locked && (result.unscored.steps > 0 || result.unscored.items > 0) && (
          <Sub>
            Not scored yet: {result.unscored.steps} step{result.unscored.steps === 1 ? '' : 's'} and {result.unscored.items} observation item{result.unscored.items === 1 ? '' : 's'}.
            Unscored and N/A rows are left out of the math.
          </Sub>
        )}
        <Card>
          <CardBody style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Mono>Ride-along date</Mono>
            <DateInput type="date" value={evaluatedOn} disabled={locked} onChange={e => changeDate(e.target.value)} />
          </CardBody>
        </Card>
        {error && (
          <ErrorText>
            {error.text}
            {error.details && error.details.length > 0 && <ul>{error.details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
          </ErrorText>
        )}
        {!locked && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <PrimaryButton onClick={submit} disabled={busy} style={{ minHeight: 52, flex: '1 1 200px' }}>
              <Check size={16} /> {busy ? 'Submitting...' : 'Submit ride-along'}
            </PrimaryButton>
            <GhostButton onClick={discard} disabled={busy} style={{ minHeight: 44 }}>
              <Trash2 size={13} /> Discard draft
            </GhostButton>
          </div>
        )}
      </>
    );
  }

  const prev = index > 0 ? screens[index - 1] : null;
  const next = index < screens.length - 1 ? screens[index + 1] : null;

  return (
    <Page>
      <FontImport />
      <Bar>
        <IconBtn onClick={goBack} aria-label="Back to ride-alongs"><ArrowLeft size={18} /></IconBtn>
        <TitleBlock>
          <TopBarTitle>{evaluation.candidateName || 'Candidate'}</TopBarTitle>
          <Mono>{evaluation.scorecard.title}{evaluation.jobTitle ? ` · ${evaluation.jobTitle}` : ''}</Mono>
        </TitleBlock>
        {statusView}
      </Bar>
      <Pills>
        {screens.map(s => (
          <Pill key={s} type="button" $active={s === screen} $done={pillDone(s)} onClick={() => goTo(s)}>
            {pillDone(s) && s !== screen && <Check size={11} />} {pillLabel(s)}
          </Pill>
        ))}
      </Pills>
      <Body $narrow>{content}</Body>
      <BottomBar>
        <NavBtn type="button" disabled={!prev} onClick={() => prev && goTo(prev)}><ChevronLeft size={18} /> Back</NavBtn>
        <Mono>{index + 1}/{screens.length}</Mono>
        <NavBtn type="button" $primary disabled={!next} onClick={() => next && goTo(next)}>
          {next ? <>{next === 'summary' ? 'Summary' : 'Next'} <ChevronRight size={18} /></> : 'Done'}
        </NavBtn>
      </BottomBar>
    </Page>
  );
};

export default RideAlongScorer;
