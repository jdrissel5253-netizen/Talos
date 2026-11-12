import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { X, Phone, Users, ListPlus, ChevronRight, PlayCircle } from 'lucide-react';
import {
  ApiError, createInterview, fetchInterviews, fetchKits, fetchSets, KIT_TYPE_LABELS, MODE_LABELS, STATUS_LABELS,
} from '../interviewKits/api';
import { Interview, InterviewKitSummary, InterviewMode, QuestionSetSummary } from '../interviewKits/types';
import { Badge, PrimaryButton, GhostButton, Label, Mono, clipCorners } from '../interviewKits/styles';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 7, 10, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;

  @media (max-width: 600px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  background: #161a22;
  border: 1px solid #2a3040;
  font-family: 'Sora', sans-serif;
  color: #c8d0dc;

  @media (max-width: 600px) {
    max-height: 92vh;
    border-left: none;
    border-right: none;
    border-bottom: none;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #232830;

  h2 { font-size: 0.95rem; font-weight: 600; color: #ffffff; margin: 0; }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #8a9ab0;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;

  &:hover { color: #ffffff; }
`;

const Body = styled.div`
  padding: 1.1rem 1.25rem;
  overflow-y: auto;
`;

const Foot = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.25rem;
  border-top: 1px solid #232830;
`;

const GroupLabel = styled(Label)`
  margin-top: 0.25rem;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const BuildOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  background: rgba(74,222,128,0.06);
  border: 1px solid rgba(74,222,128,0.45);
  padding: 0.9rem 1rem;
  margin-bottom: 1.25rem;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  color: #c8d0dc;
  ${clipCorners}

  &:hover { border-color: #4ade80; background: rgba(74,222,128,0.1); }

  div { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
  strong { font-size: 0.9rem; color: #ffffff; }
  span { font-size: 0.76rem; line-height: 1.5; color: #8a9ab0; }
`;

const LinkRow = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-align: left;
  background: #111318;
  border: 1px solid #2a3040;
  padding: 0.75rem 0.9rem;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  color: #c8d0dc;

  &:hover { border-color: #4ade80; }

  div { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
  strong { font-size: 0.86rem; font-weight: 600; color: #ffffff; }
`;

const KitOption = styled.button<{ $selected: boolean }>`
  text-align: left;
  background: #111318;
  border: 1px solid ${p => (p.$selected ? '#4ade80' : '#2a3040')};
  padding: 0.8rem 0.9rem;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  ${p => p.$selected && css`background: rgba(74,222,128,0.06);`}

  &:hover { border-color: #4ade80; }
`;

const KitName = styled.span`
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffffff;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
`;

const Hint = styled.p`
  font-size: 0.76rem;
  line-height: 1.5;
  color: #6e7d8e;
  margin: -0.15rem 0 0.6rem;
`;

const ModeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
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

const ErrorText = styled.p`
  color: #f87171;
  font-size: 0.8rem;
  margin: 0;
  flex: 1;
  align-self: center;
`;

const Empty = styled.div`
  text-align: center;
  padding: 1.5rem 0.5rem;

  p { font-size: 0.85rem; line-height: 1.6; color: #8a9ab0; margin: 0.6rem 0 0; }
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: number;
  jobTitle: string;
}

/**
 * Three ways to interview: resume one in progress, pick your own questions
 * (optionally from a saved set), or run a full scored kit.
 */
const StartInterviewModal: React.FC<Props> = ({ isOpen, onClose, pipelineId, jobTitle }) => {
  const navigate = useNavigate();
  const [kits, setKits] = useState<InterviewKitSummary[] | null>(null);
  const [sets, setSets] = useState<QuestionSetSummary[]>([]);
  const [inProgress, setInProgress] = useState<Interview[]>([]);
  const [error, setError] = useState(false);
  const [kitId, setKitId] = useState<string | null>(null);
  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError(false);
    setStartError(null);
    Promise.all([fetchKits(), fetchInterviews(pipelineId), fetchSets()])
      .then(([k, interviews, s]) => {
        if (cancelled) return;
        setKits(k);
        setSets(s);
        setInProgress(interviews.filter(iv => iv.status === 'in_progress'));
      })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [isOpen, pipelineId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Kits for this job's role first.
  const orderedKits = useMemo(() => {
    const all = kits ?? [];
    return [...all.filter(k => k.roles.includes(jobTitle)), ...all.filter(k => !k.roles.includes(jobTitle))];
  }, [kits, jobTitle]);

  if (!isOpen) return null;

  const go = (path: string) => { onClose(); navigate(path); };

  const start = async () => {
    if (!kitId || !mode) return;
    setStarting(true);
    setStartError(null);
    try {
      const iv = await createInterview(pipelineId, kitId, mode);
      go(`/candidates/${pipelineId}/interviews/${iv.id}`);
    } catch (err) {
      setStartError(err instanceof ApiError ? err.message : 'Could not start the interview.');
      setStarting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog role="dialog" aria-modal="true" aria-label="Start interview" onClick={e => e.stopPropagation()}>
        <Head>
          <h2>Start interview</h2>
          <CloseBtn onClick={onClose} aria-label="Close"><X size={18} /></CloseBtn>
        </Head>

        <Body>
          {error && <Empty><p>Could not load interview options. Try again in a moment.</p></Empty>}
          {!error && kits === null && <Empty><p>Loading...</p></Empty>}

          {!error && kits !== null && (
            <>
              {inProgress.length > 0 && (
                <>
                  <GroupLabel>Pick up where you left off</GroupLabel>
                  <List>
                    {inProgress.map(iv => (
                      <LinkRow key={iv.id} onClick={() => go(`/candidates/${pipelineId}/interviews/${iv.id}`)}>
                        <PlayCircle size={16} color="#4ade80" />
                        <div>
                          <strong>{iv.kit.title}</strong>
                          <Mono>In progress · {MODE_LABELS[iv.mode]}{iv.interviewerEmail ? ` · ${iv.interviewerEmail}` : ''}</Mono>
                        </div>
                        <ChevronRight size={15} color="#6e7d8e" />
                      </LinkRow>
                    ))}
                  </List>
                </>
              )}

              <BuildOption onClick={() => go(`/candidates/${pipelineId}/interviews/new`)}>
                <ListPlus size={20} color="#4ade80" />
                <div>
                  <strong>Pick your own questions</strong>
                  <span>Choose from any kit, add your own, then take notes as you go. Scores are optional.</span>
                </div>
                <ChevronRight size={16} color="#4ade80" />
              </BuildOption>

              {sets.length > 0 && (
                <>
                  <GroupLabel>Your saved question sets</GroupLabel>
                  <List>
                    {sets.map(set => (
                      <LinkRow key={set.id} onClick={() => go(`/candidates/${pipelineId}/interviews/new?set=${set.id}`)}>
                        <div>
                          <strong>{set.name}</strong>
                          <Mono>{set.itemCount} question{set.itemCount === 1 ? '' : 's'}</Mono>
                        </div>
                        <ChevronRight size={15} color="#6e7d8e" />
                      </LinkRow>
                    ))}
                  </List>
                </>
              )}

              {orderedKits.length > 0 && (
                <>
                  <GroupLabel>Full kit, scored</GroupLabel>
                  <Hint>Every question in the kit, with the kit's level placement. Takes longer.</Hint>
                  <List>
                    {orderedKits.map(k => (
                      <KitOption key={k.id} $selected={kitId === k.id} onClick={() => setKitId(k.id)} aria-pressed={kitId === k.id}>
                        <KitName>{k.title}</KitName>
                        <Row>
                          <Badge $tone={k.status === 'reviewed' ? 'reviewed' : 'draft'}>{STATUS_LABELS[k.status] ?? k.status}</Badge>
                          <Badge>{KIT_TYPE_LABELS[k.type] ?? k.type}</Badge>
                          <Mono>{k.questionCount} questions</Mono>
                          {k.roles.includes(jobTitle) && <Badge $tone="reviewed">For {jobTitle}</Badge>}
                        </Row>
                      </KitOption>
                    ))}
                  </List>
                  {kitId && (
                    <>
                      <GroupLabel>Interview type</GroupLabel>
                      <ModeRow>
                        <ModeBtn $selected={mode === 'phone'} onClick={() => setMode('phone')} aria-pressed={mode === 'phone'}>
                          <Phone size={15} /> Phone
                        </ModeBtn>
                        <ModeBtn $selected={mode === 'in_person'} onClick={() => setMode('in_person')} aria-pressed={mode === 'in_person'}>
                          <Users size={15} /> In person
                        </ModeBtn>
                      </ModeRow>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Body>

        <Foot>
          {startError && <ErrorText>{startError}</ErrorText>}
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          {kitId && (
            <PrimaryButton onClick={start} disabled={!mode || starting}>
              {starting ? 'Starting...' : 'Start full kit'}
            </PrimaryButton>
          )}
        </Foot>
      </Dialog>
    </Overlay>
  );
};

export default StartInterviewModal;
