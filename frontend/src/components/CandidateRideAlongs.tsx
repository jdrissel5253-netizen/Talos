import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronRight, ClipboardCheck, Play } from 'lucide-react';
import { Badge, Card, CardBody, CardHeader, CardTitle, GhostButton, Mono } from '../interviewKits/styles';
import { bandColor, fetchEvaluationsForPipeline, fetchScorecards } from '../rideAlong/api';
import { EvaluationSummary } from '../rideAlong/types';

// Ride-along scorecards on one application, newest first.

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

const Score = styled.span<{ $color: string }>`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: ${p => p.$color};
`;

const Empty = styled.p`
  font-size: 0.82rem;
  color: #6e7d8e;
  margin: 0;
`;

const CandidateRideAlongs: React.FC<{ pipelineId: number }> = ({ pipelineId }) => {
  const navigate = useNavigate();
  const [list, setList] = useState<EvaluationSummary[] | null>(null);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchEvaluationsForPipeline(pipelineId), fetchScorecards()])
      .then(([evals, cards]) => { if (!cancelled) { setList(evals); setAvailable(cards.length > 0); } })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [pipelineId]);

  // Nothing to show and nothing to start (no scorecards published, or backend not deployed).
  if (error || (list !== null && list.length === 0 && !available)) return null;

  return (
    <Card>
      <CardHeader>
        <ClipboardCheck size={13} color="#8a9ab0" />
        <CardTitle>Ride-alongs</CardTitle>
        {available && (
          <GhostButton style={{ marginLeft: 'auto' }} onClick={() => navigate(`/ride-along?pipelineId=${pipelineId}`)}>
            <Play size={12} /> Start ride-along
          </GhostButton>
        )}
      </CardHeader>
      <CardBody>
        {list === null && <Empty>Loading...</Empty>}
        {list?.length === 0 && <Empty>No ride-alongs yet.</Empty>}
        {list?.map(e => {
          const done = e.status === 'submitted';
          const r = e.result;
          return (
            <Row key={e.id} onClick={() => navigate(`/ride-along/${e.id}`)}>
              <div>
                <Title>
                  <strong>{e.scorecard.title}</strong>
                  <Badge $tone={done ? 'neutral' : 'reviewed'}>{done ? 'Submitted' : 'Draft'}</Badge>
                  {r.redFlags.length > 0 && <Badge $tone="critical">{r.redFlags.length} red flag{r.redFlags.length === 1 ? '' : 's'}</Badge>}
                </Title>
                <div style={{ fontSize: '0.84rem', marginBottom: '0.2rem' }}>
                  <Score $color={bandColor(r.band?.key, e.scorecard.bands)}>{r.total ?? '–'}</Score>
                  {' · '}{r.band?.label ?? 'Not scored yet'}{r.partial ? ' (partial)' : ''}
                </div>
                <Mono>{e.evaluatedOn}{e.scorerEmail ? ` · ${e.scorerEmail}` : ''} · v{e.scorecard.version}</Mono>
              </div>
              <ChevronRight size={16} color="#6e7d8e" />
            </Row>
          );
        })}
      </CardBody>
    </Card>
  );
};

export default CandidateRideAlongs;
