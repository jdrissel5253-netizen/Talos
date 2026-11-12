import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { fetchInterviews, MODE_LABELS } from '../interviewKits/api';
import { Interview } from '../interviewKits/types';
import { Badge, Card, CardHeader, CardTitle, CardBody, Mono } from '../interviewKits/styles';

const Row = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: center;
  text-align: left;
  background: transparent;
  border: none;
  border-top: 1px solid #1e2330;
  padding: 0.8rem 0;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  color: #c8d0dc;

  &:first-of-type { border-top: none; padding-top: 0; }
  &:hover strong { color: #4ade80; }
`;

const Title = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;

  strong { font-size: 0.86rem; font-weight: 600; color: #ffffff; }
`;

const OutcomeText = styled.div<{ $muted?: boolean }>`
  font-size: 0.82rem;
  line-height: 1.5;
  color: ${p => (p.$muted ? '#8a9ab0' : '#dbe2ec')};
  margin-bottom: 0.2rem;
`;

const Empty = styled.p`
  font-size: 0.82rem;
  color: #6e7d8e;
  margin: 0;
`;

const fmt = (iso: string | null) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return ''; }
};

/** Structured interviews on one application, newest first. Each one is its own record. */
const CandidateInterviews: React.FC<{ pipelineId: number }> = ({ pipelineId }) => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchInterviews(pipelineId)
      .then(list => { if (!cancelled) setInterviews(list); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [pipelineId]);

  if (!error && interviews !== null && interviews.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <ClipboardList size={13} color="#8a9ab0" />
        <CardTitle>Structured Interviews</CardTitle>
      </CardHeader>
      <CardBody>
        {error && <Empty>Could not load interviews.</Empty>}
        {!error && interviews === null && <Empty>Loading...</Empty>}
        {interviews?.map(iv => {
          const done = iv.status === 'completed';
          const r = iv.result;
          const scored = r.sections.filter(s => s.counted).map(s => `${s.title.split(':')[0]} ${s.score}/${s.max}`).join(' · ');
          return (
            <Row key={iv.id} onClick={() => navigate(`/candidates/${pipelineId}/interviews/${iv.id}`)}>
              <div>
                <Title>
                  <strong>{iv.kit.title}</strong>
                  <Badge $tone={done ? 'neutral' : 'reviewed'}>{done ? 'Completed' : 'In progress'}</Badge>
                  {r.redFlags.count > 0 && <Badge $tone="critical">{r.redFlags.count} red flag{r.redFlags.count === 1 ? '' : 's'}</Badge>}
                </Title>
                <OutcomeText $muted={!r.outcome}>
                  {r.outcome ? `Recommended: ${r.outcome.label}` : done ? 'No recommendation (not fully scored)' : 'Not finished yet'}
                </OutcomeText>
                <Mono>
                  {scored && `${scored} · `}
                  {fmt(iv.completedAt || iv.startedAt)} · {MODE_LABELS[iv.mode]}
                  {iv.interviewerEmail ? ` · ${iv.interviewerEmail}` : ''} · v{iv.kit.version}
                </Mono>
              </div>
              <ChevronRight size={16} color="#6e7d8e" />
            </Row>
          );
        })}
      </CardBody>
    </Card>
  );
};

export default CandidateInterviews;
