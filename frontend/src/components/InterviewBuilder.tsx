import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Phone, Users, Trash2 } from 'lucide-react';
import {
  ApiError, createCustomInterview, deleteSet, fetchSet, saveSet,
} from '../interviewKits/api';
import { InterviewMode, PickedItem, toRef } from '../interviewKits/types';
import {
  FontImport, Page, TopBar, TopBarTitle, Inner, GhostButton, PrimaryButton, Label, Mono, CenterMsg, clipCorners,
} from '../interviewKits/styles';
import QuestionPicker from './QuestionPicker';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';

const BuilderPage = styled(Page)`
  padding-bottom: 7rem;
`;

const Inputs = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1.5rem;

  @media (max-width: 700px) { grid-template-columns: minmax(0, 1fr); }
`;

const TextInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: #111318;
  border: 1px solid #2a3040;
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  padding: 0.7rem 0.85rem;
  min-height: 48px;
  outline: none;

  &:focus { border-color: #4ade80; }
`;

const ModeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  min-width: 260px;

  @media (max-width: 700px) { min-width: 0; }
`;

const ModeBtn = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  background: ${p => (p.$selected ? 'rgba(74,222,128,0.1)' : '#111318')};
  border: 1px solid ${p => (p.$selected ? '#4ade80' : '#2a3040')};
  color: ${p => (p.$selected ? '#4ade80' : '#c8d0dc')};
  font-family: 'Sora', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  ${clipCorners}
`;

const Hint = styled.p`
  font-size: 0.82rem;
  line-height: 1.6;
  color: #8a9ab0;
  margin: 0 0 1.25rem;
  max-width: 680px;
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
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Check = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  color: #c8d0dc;
  cursor: pointer;

  input { width: 16px; height: 16px; accent-color: #4ade80; }
`;

const Spacer = styled.div`
  flex: 1;
`;

const ErrorText = styled.span`
  color: #f87171;
  font-size: 0.8rem;
  width: 100%;
  order: -1;
`;

const BigBtn = styled(PrimaryButton)`
  min-height: 48px;
`;

/**
 * Two uses:
 *   /interview-kits/sets/new, /interview-kits/sets/:setId    build or edit a saved question set
 *   /candidates/:pipelineId/interviews/new[?set=ID]           pick questions and start an interview
 */
const InterviewBuilder: React.FC = () => {
  const { pipelineId: pipelineParam, setId: setParam } = useParams<{ pipelineId?: string; setId?: string }>();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const startMode = pipelineParam !== undefined;
  const pipelineId = Number(pipelineParam);
  const sourceSetId = startMode ? Number(search.get('set')) || null : setParam ? Number(setParam) : null;
  const editingSetId = startMode ? null : sourceSetId;

  const [items, setItems] = useState<PickedItem[]>([]);
  const [name, setName] = useState(startMode ? 'Interview' : '');
  const [sourceSetName, setSourceSetName] = useState<string | null>(null);
  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [candidate, setCandidate] = useState<string | null>(null);
  const [saveAsSet, setSaveAsSet] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>(sourceSetId ? 'loading' : 'ready');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = () => navigate(startMode ? `/candidates/${pipelineParam}` : '/interview-kits');

  useEffect(() => {
    if (!sourceSetId) return;
    let cancelled = false;
    fetchSet(sourceSetId)
      .then(s => {
        if (cancelled) return;
        setItems(s.items);
        setName(s.name);
        setSourceSetName(s.name);
        setLoadState('ready');
      })
      .catch(err => { if (!cancelled) setLoadState(err instanceof ApiError && err.status === 404 ? 'missing' : 'error'); });
    return () => { cancelled = true; };
  }, [sourceSetId]);

  useEffect(() => {
    if (!startMode || !Number.isFinite(pipelineId)) return;
    fetch(`${config.apiUrl}/api/pipeline/${pipelineId}/profile`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => {
        if (res.status !== 'success') return;
        const p = res.data;
        setCandidate(p.full_name || String(p.filename || '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
      })
      .catch(() => {});
  }, [startMode, pipelineId]);

  const hasMissing = items.some(i => i.missing);
  const refs = items.map(toRef);

  const saveOnly = async () => {
    if (!name.trim()) { setError('Give this question set a name.'); return; }
    setBusy(true);
    setError(null);
    try {
      await saveSet(editingSetId, name.trim(), refs);
      navigate('/interview-kits');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the question set.');
      setBusy(false);
    }
  };

  const removeSet = async () => {
    if (!editingSetId || !window.confirm('Delete this question set? Past interviews are not affected.')) return;
    setBusy(true);
    try {
      await deleteSet(editingSetId);
      navigate('/interview-kits');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the question set.');
      setBusy(false);
    }
  };

  const start = async () => {
    if (!mode) { setError('Choose phone or in person.'); return; }
    setBusy(true);
    setError(null);
    try {
      if (saveAsSet) {
        // From a saved set: update it. Otherwise: save a new one.
        await saveSet(sourceSetId, (name.trim() || 'Interview').slice(0, 150), refs);
      }
      const iv = await createCustomInterview(pipelineId, mode, name.trim() || 'Interview', refs);
      navigate(`/candidates/${pipelineId}/interviews/${iv.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the interview.');
      setBusy(false);
    }
  };

  const title = startMode
    ? `New interview${candidate ? ` · ${candidate}` : ''}`
    : editingSetId ? 'Edit question set' : 'New question set';

  return (
    <>
      <FontImport />
      <BuilderPage>
        <TopBar>
          <GhostButton onClick={back}><ArrowLeft size={13} /> {startMode ? 'Profile' : 'Interview Kits'}</GhostButton>
          <TopBarTitle>{title}</TopBarTitle>
        </TopBar>

        <Inner>
          {loadState === 'loading' && <CenterMsg>Loading question set...</CenterMsg>}
          {loadState === 'missing' && <CenterMsg>This question set could not be found.</CenterMsg>}
          {loadState === 'error' && <CenterMsg>Could not load this question set. Try again in a moment.</CenterMsg>}

          {loadState === 'ready' && (
            <>
              <Hint>
                {startMode
                  ? 'Pick the questions you want to ask, from any kit or your own bank, and put them in order. You can score each one 0–2 if you like; scores are optional and add up to a simple total.'
                  : 'Pick questions from any kit or your own bank and put them in order. Saved sets are shared with your team and can be started from any candidate\'s profile.'}
              </Hint>

              <Inputs>
                <div>
                  <Label htmlFor="builder-name">{startMode ? 'Interview name' : 'Set name'}</Label>
                  <TextInput id="builder-name" value={name} maxLength={150}
                    placeholder={startMode ? 'e.g. Phone screen' : 'e.g. PM Tech – phone screen'}
                    onChange={e => setName(e.target.value)} />
                </div>
                {startMode && (
                  <div>
                    <Label>Interview type</Label>
                    <ModeRow>
                      <ModeBtn $selected={mode === 'phone'} aria-pressed={mode === 'phone'} onClick={() => setMode('phone')}><Phone size={15} /> Phone</ModeBtn>
                      <ModeBtn $selected={mode === 'in_person'} aria-pressed={mode === 'in_person'} onClick={() => setMode('in_person')}><Users size={15} /> In person</ModeBtn>
                    </ModeRow>
                  </div>
                )}
              </Inputs>

              <QuestionPicker value={items} onChange={setItems} initialKit={search.get('kit') || undefined} />
            </>
          )}
        </Inner>

        {loadState === 'ready' && (
          <Footer>
            <FooterInner>
              {error && <ErrorText role="alert">{error}</ErrorText>}
              <Mono>{items.length} question{items.length === 1 ? '' : 's'}</Mono>
              {startMode && (
                <Check>
                  <input type="checkbox" checked={saveAsSet} onChange={e => setSaveAsSet(e.target.checked)} />
                  {sourceSetName ? `Save changes to "${sourceSetName}"` : 'Save as a question set'}
                </Check>
              )}
              {!startMode && editingSetId && (
                <GhostButton onClick={removeSet} disabled={busy}><Trash2 size={12} /> Delete set</GhostButton>
              )}
              <Spacer />
              {startMode ? (
                <BigBtn onClick={start} disabled={busy || items.length === 0 || hasMissing}>
                  {busy ? 'Starting...' : 'Start interview'}
                </BigBtn>
              ) : (
                <BigBtn onClick={saveOnly} disabled={busy || items.length === 0 || hasMissing}>
                  {busy ? 'Saving...' : 'Save question set'}
                </BigBtn>
              )}
            </FooterInner>
          </Footer>
        )}
      </BuilderPage>
    </>
  );
};

export default InterviewBuilder;
