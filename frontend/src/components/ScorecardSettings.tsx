import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, ChevronDown, ChevronRight, Lock, Pencil, Plus, ShieldAlert, Trash2, X } from 'lucide-react';
import {
  Badge, Card, CardBody, CardHeader, CardTitle, CenterMsg, FontImport, GhostButton, Inner, Label, Mono, Page,
  PrimaryButton, TextArea, TopBar, TopBarTitle,
} from '../interviewKits/styles';
import {
  ApiError, createCompanyTask, deleteCompanyTask, fetchCompanyTasks, fetchScorecard, saveScorecardSettings, updateCompanyTask,
} from '../rideAlong/api';
import { CompanyTaskInput, Scorecard, ScorecardTask } from '../rideAlong/types';

// One scorecard as this company sees it. The account owner can turn shared
// tasks on or off and add the company's own tasks; shared library tasks are
// never editable here. Changes apply to ride-alongs started afterwards.

const TaskRow = styled.div`
  border-top: 1px solid #1e2330;
  padding: 0.7rem 0;
  &:first-child { border-top: none; padding-top: 0; }
`;

const TaskHead = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 0.6rem;
  align-items: center;
`;

const Expand = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  color: #6e7d8e;
  cursor: pointer;
  display: inline-flex;
`;

const Name = styled.div<{ $off?: boolean }>`
  font-size: 0.88rem;
  color: ${p => (p.$off ? '#6e7d8e' : '#ffffff')};
  text-decoration: ${p => (p.$off ? 'line-through' : 'none')};
  min-width: 0;
`;

const Toggle = styled.button<{ $on: boolean }>`
  width: 52px;
  height: 30px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  background: ${p => (p.$on ? '#4ade80' : '#2a3040')};
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${p => (p.$on ? '25px' : '3px')};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #111318;
    transition: left 0.15s ease;
  }
  &:disabled { opacity: 0.4; cursor: default; }
`;

const Steps = styled.ol`
  margin: 0.6rem 0 0 2.1rem;
  padding: 0 0 0 1rem;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #c8d0dc;
  li { margin-bottom: 0.35rem; }
  small { display: block; color: #8a9ab0; }
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: #111318;
  border: 1px solid #2a3040;
  color: #c8d0dc;
  font-family: 'Sora', sans-serif;
  font-size: 16px;
  padding: 0.6rem 0.75rem;
  outline: none;
  &:focus { border-color: #4ade80; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const StepEditor = styled.div`
  border: 1px solid #232830;
  padding: 0.75rem;
  margin-bottom: 0.6rem;
  ${TextArea} { min-height: 60px; font-size: 16px; margin-top: 0.4rem; }
`;

const Check = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #c8d0dc;
  margin-top: 0.5rem;
  cursor: pointer;
  input { width: 18px; height: 18px; accent-color: #f87171; }
`;

const Note = styled.p`
  font-size: 0.8rem;
  color: #8a9ab0;
  line-height: 1.6;
  margin: 0 0 1rem;
`;

const ErrorMsg = styled.div`
  color: #f87171;
  font-size: 0.82rem;
  margin: 0.5rem 0;
`;

interface Draft {
  id: number | null;
  name: string;
  level: string;
  time: string;
  equipment: string;
  steps: { text: string; twoLooksLike: string; safety: boolean }[];
}

const emptyDraft = (): Draft => ({ id: null, name: '', level: '', time: '', equipment: '', steps: [{ text: '', twoLooksLike: '', safety: false }] });

const toDraft = (t: ScorecardTask): Draft => ({
  id: t.id ?? null,
  name: t.name,
  level: t.level ?? '',
  time: t.time ?? '',
  equipment: t.equipment.join(', '),
  steps: t.steps.map(s => ({ text: s.text, twoLooksLike: s.twoLooksLike ?? '', safety: s.safety })),
});

const toInput = (d: Draft): CompanyTaskInput => ({
  name: d.name,
  level: d.level || null,
  time: d.time || null,
  equipment: d.equipment.split(',').map(s => s.trim()).filter(Boolean),
  steps: d.steps.filter(s => s.text.trim()).map(s => ({ text: s.text, twoLooksLike: s.twoLooksLike || null, safety: s.safety })),
});

const TaskLine: React.FC<{
  task: ScorecardTask; on: boolean; canEdit: boolean; onToggle?: () => void; actions?: React.ReactNode;
}> = ({ task, on, canEdit, onToggle, actions }) => {
  const [open, setOpen] = useState(false);
  return (
    <TaskRow>
      <TaskHead>
        <Expand onClick={() => setOpen(o => !o)} aria-label={open ? 'Hide steps' : 'Show steps'}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Expand>
        <Name $off={!on}>
          {task.code} · {task.name}{' '}
          {!task.shared && <Badge $tone="reviewed">Your task</Badge>}
          <br /><Mono>{[task.level, task.time, `${task.steps.length} steps`].filter(Boolean).join(' · ')}</Mono>
        </Name>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {actions}
          {onToggle && <Toggle $on={on} disabled={!canEdit} onClick={onToggle} aria-pressed={on} aria-label={on ? 'Turn off' : 'Turn on'} />}
        </div>
      </TaskHead>
      {open && (
        <Steps>
          {task.equipment.length > 0 && <Mono style={{ display: 'block', marginBottom: '0.4rem' }}>Needs: {task.equipment.join(', ')}</Mono>}
          {task.steps.map(s => (
            <li key={s.key}>
              {s.text} {s.safety && <Badge $tone="critical"><ShieldAlert size={10} /> Safety</Badge>}
              {s.twoLooksLike && <small>2 = {s.twoLooksLike}</small>}
            </li>
          ))}
        </Steps>
      )}
    </TaskRow>
  );
};

const ScorecardSettings: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<Scorecard | null>(null);
  const [ownTasks, setOwnTasks] = useState<ScorecardTask[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = useCallback(async () => {
    try {
      const c = await fetchScorecard(slug);
      setCard(c);
      setOwnTasks(c.canEdit ? await fetchCompanyTasks() : c.tasks.filter(t => !t.shared));
      setLoadState('ready');
    } catch (err) {
      setLoadState(err instanceof ApiError && err.status === 404 ? 'missing' : 'error');
    }
  }, [slug]);
  useEffect(() => { void load(); }, [load]);

  if (loadState !== 'ready' || !card) {
    return (
      <Page>
        <FontImport />
        <TopBar>
          <GhostButton onClick={() => navigate('/ride-along')}><ArrowLeft size={13} /> Ride-alongs</GhostButton>
          <TopBarTitle>Scorecard</TopBarTitle>
        </TopBar>
        <CenterMsg>{loadState === 'loading' ? 'Loading...' : loadState === 'missing' ? 'Scorecard not found.' : 'Could not load this scorecard.'}</CenterMsg>
      </Page>
    );
  }

  const shared = card.tasks.filter(t => t.shared);
  const disabled = shared.filter(t => !t.enabled).map(t => t.code);
  const attached = card.tasks.filter(t => !t.shared && t.id).map(t => t.id as number);

  const save = async (next: { disabledTaskCodes: string[]; customTaskIds: number[] }) => {
    setSaving(true);
    setError(null);
    try {
      setCard(await saveScorecardSettings(card.slug, next));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const toggleShared = (code: string) => {
    const next = disabled.includes(code) ? disabled.filter(c => c !== code) : [...disabled, code];
    void save({ disabledTaskCodes: next, customTaskIds: attached });
  };

  const toggleOwn = (id: number) => {
    const next = attached.includes(id) ? attached.filter(i => i !== id) : [...attached, id];
    void save({ disabledTaskCodes: disabled, customTaskIds: next });
  };

  const saveDraft = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const input = toInput(draft);
      if (draft.id) {
        await updateCompanyTask(draft.id, input);
      } else {
        const created = await createCompanyTask(input);
        await saveScorecardSettings(card.slug, { disabledTaskCodes: disabled, customTaskIds: [...attached, created.id as number] });
      }
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the task.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (task: ScorecardTask) => {
    if (!task.id || !window.confirm(`Delete "${task.name}"? It's removed from every scorecard. Ride-alongs already started keep their copy.`)) return;
    setSaving(true);
    try {
      await deleteCompanyTask(task.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the task.');
    } finally {
      setSaving(false);
    }
  };

  const setStep = (i: number, patch: Partial<Draft['steps'][number]>) =>
    setDraft(d => d && ({ ...d, steps: d.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  return (
    <Page>
      <FontImport />
      <TopBar>
        <GhostButton onClick={() => navigate('/ride-along')}><ArrowLeft size={13} /> Ride-alongs</GhostButton>
        <TopBarTitle>{card.title}</TopBarTitle>
      </TopBar>
      <Inner $narrow>
        <Note>
          {card.role} · version {card.version}.{' '}
          {card.canEdit
            ? 'Turn tasks off that your company doesn\'t do, or add your own. Changes apply to ride-alongs started from now on.'
            : <><Lock size={11} /> Only the account owner can change tasks.</>}
        </Note>
        {error && <ErrorMsg>{error}</ErrorMsg>}

        <Card>
          <CardHeader><CardTitle>Talos tasks</CardTitle><Mono style={{ marginLeft: 'auto' }}>{shared.length - disabled.length} of {shared.length} on</Mono></CardHeader>
          <CardBody>
            {shared.map(t => (
              <TaskLine key={t.code} task={t} on={!!t.enabled} canEdit={card.canEdit && !saving} onToggle={() => toggleShared(t.code)} />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your tasks</CardTitle>
            {card.canEdit && !draft && (
              <GhostButton style={{ marginLeft: 'auto' }} onClick={() => setDraft(emptyDraft())}><Plus size={13} /> Add task</GhostButton>
            )}
          </CardHeader>
          <CardBody>
            {ownTasks.length === 0 && !draft && <Mono>None yet.</Mono>}
            {ownTasks.map(t => (
              <TaskLine
                key={t.id}
                task={t}
                on={attached.includes(t.id as number)}
                canEdit={card.canEdit && !saving}
                onToggle={card.canEdit ? () => toggleOwn(t.id as number) : undefined}
                actions={card.canEdit && (
                  <>
                    <Expand onClick={() => setDraft(toDraft(t))} aria-label="Edit"><Pencil size={14} /></Expand>
                    <Expand onClick={() => remove(t)} aria-label="Delete"><Trash2 size={14} /></Expand>
                  </>
                )}
              />
            ))}

            {draft && (
              <div style={{ marginTop: ownTasks.length ? '1rem' : 0 }}>
                <Label>{draft.id ? 'Edit task' : 'New task'}</Label>
                <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Task name" maxLength={200} />
                <Grid style={{ marginTop: '0.75rem' }}>
                  <Input value={draft.level} onChange={e => setDraft({ ...draft, level: e.target.value })} placeholder="Level (optional)" maxLength={100} />
                  <Input value={draft.time} onChange={e => setDraft({ ...draft, time: e.target.value })} placeholder="Time, e.g. 30 min (optional)" maxLength={100} />
                </Grid>
                <Input value={draft.equipment} onChange={e => setDraft({ ...draft, equipment: e.target.value })} placeholder="Equipment, comma separated (optional)" />
                <Label style={{ marginTop: '1rem' }}>Steps</Label>
                {draft.steps.map((s, i) => (
                  <StepEditor key={i}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Mono>{i + 1}</Mono>
                      <Input value={s.text} onChange={e => setStep(i, { text: e.target.value })} placeholder="What they do" maxLength={1000} />
                      {draft.steps.length > 1 && (
                        <Expand onClick={() => setDraft({ ...draft, steps: draft.steps.filter((_, j) => j !== i) })} aria-label="Remove step"><X size={16} /></Expand>
                      )}
                    </div>
                    <TextArea value={s.twoLooksLike} onChange={e => setStep(i, { twoLooksLike: e.target.value })} placeholder="What a 2 looks like (optional)" maxLength={2000} />
                    <Check><input type="checkbox" checked={s.safety} onChange={e => setStep(i, { safety: e.target.checked })} /> Safety step (a 0 fails the task)</Check>
                  </StepEditor>
                ))}
                <GhostButton onClick={() => setDraft({ ...draft, steps: [...draft.steps, { text: '', twoLooksLike: '', safety: false }] })}>
                  <Plus size={13} /> Add step
                </GhostButton>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <PrimaryButton onClick={saveDraft} disabled={saving || !draft.name.trim() || !draft.steps.some(s => s.text.trim())}>
                    {saving ? 'Saving...' : draft.id ? 'Save task' : 'Add to this scorecard'}
                  </PrimaryButton>
                  <GhostButton onClick={() => setDraft(null)} disabled={saving}>Cancel</GhostButton>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ride-along observations</CardTitle></CardHeader>
          <CardBody>
            {card.config.categories.map(c => (
              <TaskRow key={c.key}>
                <Name>{c.name} <Mono>· weight {Math.round(c.weight * 100)}% · {c.items.length} items</Mono></Name>
              </TaskRow>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Red flags</CardTitle></CardHeader>
          <CardBody>
            {card.config.redFlags.length === 0 && <Mono>None.</Mono>}
            {card.config.redFlags.map(f => (
              <TaskRow key={f.key}>
                <Name>
                  <Badge $tone={f.type === 'FAIL' ? 'critical' : 'draft'}>{f.type === 'FAIL' ? 'Fail' : `Cap ${card.config.capValue}`}</Badge> {f.text}
                </Name>
              </TaskRow>
            ))}
            <Mono style={{ display: 'block', marginTop: '0.75rem' }}>
              A 0 on any safety step is an automatic {card.config.safetyFlagType === 'FAIL' ? 'fail' : `cap at ${card.config.capValue}`}.
            </Mono>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Result bands</CardTitle></CardHeader>
          <CardBody>
            {card.config.bands.map((b, i, all) => (
              <TaskRow key={b.key}>
                <Name>{b.label} <Mono>· {b.min}{i === 0 ? '–100' : `–${all[i - 1].min - 1}`}</Mono></Name>
              </TaskRow>
            ))}
          </CardBody>
        </Card>
      </Inner>
    </Page>
  );
};

export default ScorecardSettings;
