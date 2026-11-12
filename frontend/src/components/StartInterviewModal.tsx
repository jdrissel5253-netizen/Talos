import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { X, Phone, Users, ClipboardList } from 'lucide-react';
import {
  ApiError, createInterview, fetchInterviews, fetchKits, KIT_TYPE_LABELS, STATUS_LABELS,
} from '../interviewKits/api';
import { Interview, InterviewKitSummary, InterviewMode } from '../interviewKits/types';
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

const KitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
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

const StartInterviewModal: React.FC<Props> = ({ isOpen, onClose, pipelineId, jobTitle }) => {
  const navigate = useNavigate();
  const [kits, setKits] = useState<InterviewKitSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [kitId, setKitId] = useState<string | null>(null);
  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [inProgress, setInProgress] = useState<Map<string, Interview>>(new Map());
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError(false);
    setStartError(null);
    Promise.all([fetchKits(), fetchInterviews(pipelineId)])
      .then(([k, interviews]) => {
        if (cancelled) return;
        setKits(k);
        // Most recent in-progress interview per kit (the list is newest first).
        const open = new Map<string, Interview>();
        interviews.forEach(iv => { if (iv.status === 'in_progress' && !open.has(iv.kit.id)) open.set(iv.kit.id, iv); });
        setInProgress(open);
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

  const { suggested, others } = useMemo(() => {
    const all = kits ?? [];
    return {
      suggested: all.filter(k => k.roles.includes(jobTitle)),
      others: all.filter(k => !k.roles.includes(jobTitle)),
    };
  }, [kits, jobTitle]);

  if (!isOpen) return null;

  const resumable = kitId ? inProgress.get(kitId) : undefined;

  const start = async () => {
    if (!kitId) return;
    if (resumable) { navigate(`/candidates/${pipelineId}/interviews/${resumable.id}`); return; }
    if (!mode) return;
    setStarting(true);
    setStartError(null);
    try {
      const iv = await createInterview(pipelineId, kitId, mode);
      navigate(`/candidates/${pipelineId}/interviews/${iv.id}`);
    } catch (err) {
      setStartError(err instanceof ApiError ? err.message : 'Could not start the interview.');
      setStarting(false);
    }
  };

  const renderKit = (k: InterviewKitSummary) => (
    <KitOption key={k.id} $selected={kitId === k.id} onClick={() => setKitId(k.id)} aria-pressed={kitId === k.id}>
      <KitName>{k.title}</KitName>
      <Row>
        <Badge $tone={k.status === 'reviewed' ? 'reviewed' : 'draft'}>{STATUS_LABELS[k.status] ?? k.status}</Badge>
        <Badge>{KIT_TYPE_LABELS[k.type] ?? k.type}</Badge>
        <Mono>{k.questionCount} questions</Mono>
        {inProgress.has(k.id) && <Badge $tone="reviewed">In progress</Badge>}
      </Row>
    </KitOption>
  );

  return (
    <Overlay onClick={onClose}>
      <Dialog role="dialog" aria-modal="true" aria-label="Start interview" onClick={e => e.stopPropagation()}>
        <Head>
          <h2>Start interview</h2>
          <CloseBtn onClick={onClose} aria-label="Close"><X size={18} /></CloseBtn>
        </Head>

        <Body>
          {error && <Empty><p>Could not load interview kits. Try again in a moment.</p></Empty>}
          {!error && kits === null && <Empty><p>Loading kits...</p></Empty>}
          {!error && kits !== null && kits.length === 0 && (
            <Empty>
              <ClipboardList size={26} color="#4ade80" />
              <p>No interview kits are available yet. They'll appear here once they're loaded.</p>
            </Empty>
          )}

          {!error && kits !== null && kits.length > 0 && (
            <>
              {suggested.length > 0 && (
                <>
                  <GroupLabel>Suggested for {jobTitle}</GroupLabel>
                  <KitList>{suggested.map(renderKit)}</KitList>
                </>
              )}
              {others.length > 0 && (
                <>
                  <GroupLabel>{suggested.length > 0 ? 'Other kits' : 'Choose a kit'}</GroupLabel>
                  <KitList>{others.map(renderKit)}</KitList>
                </>
              )}

              {resumable ? (
                <Empty style={{ padding: '0.5rem 0', textAlign: 'left' }}>
                  <p>An interview with this kit is in progress. You'll pick up where it left off.</p>
                </Empty>
              ) : (
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
        </Body>

        <Foot>
          {startError && <ErrorText>{startError}</ErrorText>}
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={start} disabled={!kitId || (!resumable && !mode) || starting}>
            {starting ? 'Starting...' : resumable ? 'Resume interview' : 'Start interview'}
          </PrimaryButton>
        </Foot>
      </Dialog>
    </Overlay>
  );
};

export default StartInterviewModal;
