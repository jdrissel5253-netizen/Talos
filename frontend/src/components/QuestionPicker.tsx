import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, X, Plus, Pencil, Trash2, AlertTriangle, Building2 } from 'lucide-react';
import {
  ApiError, createCompanyQuestion, deleteCompanyQuestion, fetchCompanyQuestions, fetchKit, fetchKits,
  updateCompanyQuestion, KIT_TYPE_LABELS,
} from '../interviewKits/api';
import {
  CompanyQuestion, InterviewKit, InterviewKitSummary, KitSection, PickedItem, refKey,
} from '../interviewKits/types';
import { Badge, Card, CardBody, GhostButton, Label, Mono, PrimaryButton, TextArea } from '../interviewKits/styles';

// ─── layout ────────────────────────────────────────────────────────────────────

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 1.25rem;
  align-items: start;

  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); }
`;

const Sticky = styled.div`
  position: sticky;
  top: 5rem;

  @media (max-width: 960px) { position: static; }
`;

const GroupHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  cursor: pointer;
  user-select: none;

  &:hover strong { color: #4ade80; }
`;

const GroupTitle = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong { font-size: 0.88rem; font-weight: 600; color: #ffffff; line-height: 1.35; }
`;

const SmallBtn = styled(GhostButton)`
  font-size: 0.7rem;
  padding: 0.4rem 0.7rem;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: space-between;
  padding: 0.75rem 1rem 0.4rem;
  border-top: 1px solid #1e2330;

  span { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #8a9ab0; }
`;

const QRow = styled.label<{ $on: boolean }>`
  display: grid;
  grid-template-columns: 1.25rem 1.6rem 1fr;
  gap: 0.5rem;
  align-items: start;
  padding: 0.55rem 1rem;
  cursor: pointer;
  font-size: 0.84rem;
  line-height: 1.5;
  color: ${p => (p.$on ? '#ffffff' : '#c8d0dc')};
  ${p => p.$on && css`background: rgba(74,222,128,0.05);`}

  &:hover { background: rgba(74,222,128,0.08); }

  input { margin: 0.2rem 0 0; width: 16px; height: 16px; accent-color: #4ade80; cursor: pointer; }
`;

const QNum = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #6e7d8e;
  padding-top: 0.15rem;
`;

const CompanyActions = styled.span`
  display: inline-flex;
  gap: 0.25rem;
  margin-left: 0.4rem;
  vertical-align: middle;
`;

const IconBtn = styled.button`
  background: transparent;
  border: none;
  color: #6e7d8e;
  cursor: pointer;
  padding: 0.2rem;
  display: inline-flex;
  min-width: 28px;
  min-height: 28px;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) { color: #4ade80; }
  &:disabled { opacity: 0.3; cursor: default; }
`;

const Muted = styled.p`
  font-size: 0.8rem;
  color: #6e7d8e;
  margin: 0;
  padding: 0.5rem 1rem 0.9rem;
`;

const Form = styled.div`
  border-top: 1px solid #1e2330;
  padding: 0.9rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  textarea { min-height: 64px; font-size: 0.85rem; }
`;

const FormRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;
`;

const ErrorText = styled.span`
  color: #f87171;
  font-size: 0.78rem;
  flex: 1;
`;

const SelHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid #1e2330;

  strong { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #8a9ab0; }
`;

const SelList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: calc(100vh - 16rem);
  overflow-y: auto;

  @media (max-width: 960px) { max-height: none; }
`;

const SelItem = styled.li<{ $missing?: boolean }>`
  display: grid;
  grid-template-columns: 1.6rem 1fr auto;
  gap: 0.4rem;
  align-items: start;
  padding: 0.6rem 0.75rem 0.6rem 1.1rem;
  border-bottom: 1px solid #1e2330;

  p {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.45;
    color: ${p => (p.$missing ? '#f87171' : '#dbe2ec')};
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const SelControls = styled.div`
  display: flex;
  align-items: center;
`;

const Empty = styled.div`
  padding: 1.5rem 1.1rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #6e7d8e;
`;

// ─── helpers ───────────────────────────────────────────────────────────────────

const kitItem = (kit: InterviewKit, section: KitSection, key: string, prompt: string): PickedItem => ({
  source: 'kit', kitId: kit.id, key, prompt, sourceLabel: `${kit.title} · ${section.title}`,
});

const companyItem = (q: CompanyQuestion): PickedItem => ({
  source: 'company', id: q.id, prompt: q.prompt, sourceLabel: 'Your company questions',
});

type KitState = InterviewKit | 'loading' | 'error';

interface Props {
  value: PickedItem[];
  onChange: (items: PickedItem[]) => void;
  /** Kit to expand on load. */
  initialKit?: string;
}

// ─── component ─────────────────────────────────────────────────────────────────

const QuestionPicker: React.FC<Props> = ({ value, onChange, initialKit }) => {
  const [kits, setKits] = useState<InterviewKitSummary[] | null>(null);
  const [kitContent, setKitContent] = useState<Record<string, KitState>>({});
  const [company, setCompany] = useState<CompanyQuestion[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [open, setOpen] = useState<Set<string>>(() => new Set(['company', ...(initialKit ? [initialKit] : [])]));

  // add / edit form for company questions
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftAnswer, setDraftAnswer] = useState('');
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selected = useMemo(() => new Set(value.map(refKey)), [value]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchKits(), fetchCompanyQuestions()])
      .then(([k, c]) => { if (!cancelled) { setKits(k); setCompany(c); } })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, []);

  const requested = useRef(new Set<string>());
  const loadKit = useCallback((slug: string) => {
    if (requested.current.has(slug)) return;
    requested.current.add(slug);
    setKitContent(p => ({ ...p, [slug]: 'loading' }));
    fetchKit(slug)
      .then(k => setKitContent(p => ({ ...p, [slug]: k ?? 'error' })))
      .catch(() => {
        requested.current.delete(slug); // allow a retry by collapsing and reopening
        setKitContent(p => ({ ...p, [slug]: 'error' }));
      });
  }, []);

  useEffect(() => { if (initialKit) loadKit(initialKit); }, [initialKit, loadKit]);

  const toggleOpen = (id: string) => {
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else { next.add(id); if (id !== 'company') loadKit(id); }
      return next;
    });
  };

  // ── selection ──
  const toggle = (item: PickedItem) => {
    const k = refKey(item);
    onChange(selected.has(k) ? value.filter(v => refKey(v) !== k) : [...value, item]);
  };

  /** Adds every item not yet picked (in order), or removes them all if all are picked. */
  const toggleMany = (items: PickedItem[]) => {
    const allOn = items.every(i => selected.has(refKey(i)));
    if (allOn) {
      const drop = new Set(items.map(refKey));
      onChange(value.filter(v => !drop.has(refKey(v))));
    } else {
      onChange([...value, ...items.filter(i => !selected.has(refKey(i)))]);
    }
  };

  const sectionItems = (kit: InterviewKit, s: KitSection) => s.questions.map(q => kitItem(kit, s, q.key, q.prompt));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  // ── company questions ──
  const startEdit = (q: CompanyQuestion | 'new') => {
    setEditing(q === 'new' ? 'new' : q.id);
    setDraftPrompt(q === 'new' ? '' : q.prompt);
    setDraftAnswer(q === 'new' ? '' : q.goodAnswer ?? '');
    setFormError(null);
  };

  const saveQuestion = async () => {
    if (!draftPrompt.trim()) { setFormError('Write the question first.'); return; }
    setFormBusy(true);
    setFormError(null);
    try {
      if (editing === 'new') {
        const q = await createCompanyQuestion(draftPrompt.trim(), draftAnswer.trim());
        setCompany(prev => [...(prev ?? []), q]);
        onChange([...value, companyItem(q)]); // a new question is picked right away
      } else if (typeof editing === 'number') {
        const q = await updateCompanyQuestion(editing, draftPrompt.trim(), draftAnswer.trim());
        setCompany(prev => (prev ?? []).map(x => (x.id === q.id ? q : x)));
        onChange(value.map(v => (v.source === 'company' && v.id === q.id ? companyItem(q) : v)));
      }
      setEditing(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not save the question.');
    } finally {
      setFormBusy(false);
    }
  };

  const removeQuestion = async (q: CompanyQuestion) => {
    if (!window.confirm('Delete this question from your company bank? Past interviews keep their copy.')) return;
    try {
      await deleteCompanyQuestion(q.id);
      setCompany(prev => (prev ?? []).filter(x => x.id !== q.id));
      onChange(value.filter(v => !(v.source === 'company' && v.id === q.id)));
      if (editing === q.id) setEditing(null);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Could not delete the question.');
    }
  };

  const questionForm = (
    <Form>
      <div>
        <Label htmlFor="cq-prompt">{editing === 'new' ? 'New question' : 'Edit question'}</Label>
        <TextArea id="cq-prompt" value={draftPrompt} maxLength={1000} autoFocus
          placeholder="e.g. Walk me through how you'd handle a no-cool call on a 100° day."
          onChange={e => setDraftPrompt(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="cq-answer">What a good answer sounds like (optional)</Label>
        <TextArea id="cq-answer" value={draftAnswer} maxLength={3000}
          placeholder="Shown to the interviewer during the interview."
          onChange={e => setDraftAnswer(e.target.value)} />
      </div>
      <FormRow>
        {formError && <ErrorText>{formError}</ErrorText>}
        <GhostButton onClick={() => setEditing(null)} disabled={formBusy}>Cancel</GhostButton>
        <PrimaryButton onClick={saveQuestion} disabled={formBusy}>
          {formBusy ? 'Saving...' : editing === 'new' ? 'Save to bank & add' : 'Save'}
        </PrimaryButton>
      </FormRow>
    </Form>
  );

  // ── render ──
  const companyItems = (company ?? []).map(companyItem);
  const companyOpen = open.has('company');

  return (
    <Layout>
      <div>
        {loadError && <Card><CardBody><Mono>Could not load questions. Refresh to try again.</Mono></CardBody></Card>}

        {/* Company bank */}
        <Card>
          <GroupHead onClick={() => toggleOpen('company')} role="button" aria-expanded={companyOpen}>
            {companyOpen ? <ChevronDown size={16} color="#8a9ab0" /> : <ChevronRight size={16} color="#8a9ab0" />}
            <GroupTitle>
              <strong><Building2 size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />Your company questions</strong>
              <Mono>{company === null ? 'Loading...' : `${company.length} saved · shared with your team`}</Mono>
            </GroupTitle>
            {companyItems.length > 0 && (
              <SmallBtn onClick={e => { e.stopPropagation(); toggleMany(companyItems); }}>
                {companyItems.every(i => selected.has(refKey(i))) ? 'Clear all' : 'Select all'}
              </SmallBtn>
            )}
          </GroupHead>
          {companyOpen && (
            <>
              {company && company.length === 0 && editing !== 'new' && (
                <Muted>No questions yet. Questions you write are saved here for your whole team to reuse.</Muted>
              )}
              {(company ?? []).map((q, i) => (
                editing === q.id ? <React.Fragment key={q.id}>{questionForm}</React.Fragment> : (
                  <QRow key={q.id} $on={selected.has(`c:${q.id}`)}>
                    <input type="checkbox" checked={selected.has(`c:${q.id}`)} onChange={() => toggle(companyItem(q))} />
                    <QNum>{i + 1}</QNum>
                    <span>
                      {q.prompt}
                      <CompanyActions>
                        <IconBtn aria-label="Edit question" onClick={e => { e.preventDefault(); startEdit(q); }}><Pencil size={12} /></IconBtn>
                        <IconBtn aria-label="Delete question" onClick={e => { e.preventDefault(); removeQuestion(q); }}><Trash2 size={12} /></IconBtn>
                      </CompanyActions>
                    </span>
                  </QRow>
                )
              ))}
              {editing === 'new' ? questionForm : (
                <Form style={{ alignItems: 'flex-start' }}>
                  <SmallBtn onClick={() => startEdit('new')} disabled={company === null}><Plus size={12} /> Write your own question</SmallBtn>
                </Form>
              )}
            </>
          )}
        </Card>

        {/* Kits */}
        {kits === null && !loadError && <Mono>Loading kits...</Mono>}
        {kits?.map(k => {
          const isOpen = open.has(k.id);
          const content = kitContent[k.id];
          const kit = typeof content === 'object' ? content : null;
          const allItems = kit ? kit.sections.flatMap(s => sectionItems(kit, s)) : [];
          const pickedHere = value.filter(v => v.source === 'kit' && v.kitId === k.id).length;
          return (
            <Card key={k.id}>
              <GroupHead onClick={() => toggleOpen(k.id)} role="button" aria-expanded={isOpen}>
                {isOpen ? <ChevronDown size={16} color="#8a9ab0" /> : <ChevronRight size={16} color="#8a9ab0" />}
                <GroupTitle>
                  <strong>{k.title}</strong>
                  <Mono>
                    {KIT_TYPE_LABELS[k.type] ?? k.type} · {k.questionCount} questions
                    {pickedHere > 0 && <span style={{ color: '#4ade80' }}> · {pickedHere} picked</span>}
                  </Mono>
                </GroupTitle>
                {kit && (
                  <SmallBtn onClick={e => { e.stopPropagation(); toggleMany(allItems); }}>
                    {allItems.every(i => selected.has(refKey(i))) ? 'Clear all' : 'Select all'}
                  </SmallBtn>
                )}
              </GroupHead>
              {isOpen && content === 'loading' && <Muted>Loading questions...</Muted>}
              {isOpen && content === 'error' && <Muted>Could not load this kit.</Muted>}
              {isOpen && kit && kit.sections.map(s => {
                const items = sectionItems(kit, s);
                const allOn = items.every(i => selected.has(refKey(i)));
                return (
                  <div key={s.key}>
                    <SectionHead>
                      <span>{s.title}{!s.scoreOptions && ' · not scored'}</span>
                      <SmallBtn onClick={() => toggleMany(items)}>{allOn ? 'Clear' : `Select all ${items.length}`}</SmallBtn>
                    </SectionHead>
                    {s.questions.map(q => {
                      const on = selected.has(`k:${kit.id}:${q.key}`);
                      return (
                        <QRow key={q.key} $on={on}>
                          <input type="checkbox" checked={on} onChange={() => toggle(kitItem(kit, s, q.key, q.prompt))} />
                          <QNum>{q.number}</QNum>
                          <span>{q.prompt}</span>
                        </QRow>
                      );
                    })}
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>

      {/* Picked */}
      <Sticky>
        <Card>
          <SelHead>
            <strong>Your interview · {value.length}</strong>
            {value.length > 0 && <SmallBtn onClick={() => { if (window.confirm('Remove all picked questions?')) onChange([]); }}>Clear</SmallBtn>}
          </SelHead>
          {value.length === 0 ? (
            <Empty>Tick questions on the left, or write your own. They'll be asked in the order shown here.</Empty>
          ) : (
            <SelList>
              {value.map((item, i) => (
                <SelItem key={refKey(item)} $missing={item.missing}>
                  <QNum>{i + 1}</QNum>
                  <div>
                    <p>{item.missing ? <><AlertTriangle size={12} style={{ verticalAlign: '-2px' }} /> No longer available</> : item.prompt}</p>
                    {item.sourceLabel && <Mono style={{ fontSize: '0.62rem' }}>{item.sourceLabel}</Mono>}
                  </div>
                  <SelControls>
                    <IconBtn aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={13} /></IconBtn>
                    <IconBtn aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown size={13} /></IconBtn>
                    <IconBtn aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}><X size={13} /></IconBtn>
                  </SelControls>
                </SelItem>
              ))}
            </SelList>
          )}
          {value.some(v => v.missing) && (
            <Empty style={{ color: '#f87171', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
              Some questions no longer exist. Remove them to continue.{' '}
              <Badge as="button" $tone="critical" style={{ cursor: 'pointer' }} onClick={() => onChange(value.filter(v => !v.missing))}>Remove missing</Badge>
            </Empty>
          )}
        </Card>
      </Sticky>
    </Layout>
  );
};

export default QuestionPicker;
