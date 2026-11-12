import React from 'react';
import styled from 'styled-components';
import { Flag, Info, Scale } from 'lucide-react';
import { InterviewResult } from '../interviewKits/types';
import { Card, CardHeader, CardTitle, CardBody, Mono, Badge } from '../interviewKits/styles';

const Outcome = styled.div<{ $pending?: boolean }>`
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.45;
  color: ${p => (p.$pending ? '#8a9ab0' : '#ffffff')};
  margin-bottom: 0.35rem;
`;

const Sub = styled.p`
  font-size: 0.8rem;
  line-height: 1.6;
  color: #8a9ab0;
  margin: 0 0 1rem;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid #1e2330;
`;

const Row = styled.div<{ $dim?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid #1e2330;
  font-size: 0.82rem;
  color: ${p => (p.$dim ? '#5c6878' : '#c8d0dc')};

  b { font-family: 'JetBrains Mono', monospace; color: ${p => (p.$dim ? '#5c6878' : '#ffffff')}; white-space: nowrap; }
`;

const Callout = styled.div<{ $tone: 'flag' | 'info' | 'warn' }>`
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  margin-top: 0.9rem;
  padding: 0.7rem 0.85rem;
  font-size: 0.8rem;
  line-height: 1.55;
  border-left: 2px solid ${p => ({ flag: '#f87171', info: '#60a5fa', warn: '#fbbf24' }[p.$tone])};
  background: ${p => ({ flag: 'rgba(248,113,113,0.07)', info: 'rgba(96,165,250,0.07)', warn: 'rgba(251,191,36,0.07)' }[p.$tone])};
  color: #dbe2ec;

  svg { flex-shrink: 0; margin-top: 0.15rem; }
`;

const ProfileTitle = styled.div`
  font-size: 0.64rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6e7d8e;
  margin: 1.1rem 0 0.2rem;
`;

interface Props {
  result: InterviewResult;
  /** true while the interview is still in progress (result reflects scores so far). */
  live?: boolean;
}

const InterviewResultPanel: React.FC<Props> = ({ result, live }) => {
  return (
    <Card>
      <CardHeader>
        <Scale size={13} color="#4ade80" />
        <CardTitle>{live ? 'Recommendation so far' : 'Recommended result'}</CardTitle>
        <Badge style={{ marginLeft: 'auto' }}>Recommendation only</Badge>
      </CardHeader>
      <CardBody>
        {result.outcome
          ? <Outcome>{result.outcome.label}</Outcome>
          : <Outcome $pending>No recommendation yet</Outcome>}
        <Sub>
          {result.outcome
            ? 'Based on the scoring rules in this kit. A person makes the final hiring decision.'
            : result.incompleteReason || 'Score the remaining questions to see a recommendation.'}
        </Sub>

        <Rows>
          {result.sections.map(s => (
            <Row key={s.key} $dim={!s.counted}>
              <span>
                {s.title}
                {s.answered < s.total && s.answered > 0 && <Mono> · {s.answered}/{s.total} scored</Mono>}
                {!s.counted && <Mono> · not counted</Mono>}
              </span>
              <b>
                {s.score} / {s.max}
                {s.passed === true && ' ✓'}
              </b>
            </Row>
          ))}
          {result.redFlags.count > 0 || result.redFlags.guidance ? (
            <Row>
              <span>BS-detector red flags</span>
              <b>{result.redFlags.count}</b>
            </Row>
          ) : null}
        </Rows>


        {result.redFlags.guidance && (
          <Callout $tone="warn">
            <Flag size={14} />
            <span>
              <b>Kit guidance for {result.redFlags.count} red flag{result.redFlags.count === 1 ? '' : 's'}:</b>{' '}
              {result.redFlags.guidance} This is not applied to the result automatically.
            </span>
          </Callout>
        )}

        {result.notes.map((n, i) => (
          <Callout key={i} $tone="info"><Info size={14} /><span>{n}</span></Callout>
        ))}

        {result.skillProfile && result.skillProfile.some(g => g.answered > 0) && (
          <>
            <ProfileTitle>Skill profile</ProfileTitle>
            <Rows>
              {result.skillProfile.map(g => (
                <Row key={g.area} $dim={g.answered === 0}>
                  <span>{g.area}{g.answered < g.total && <Mono> · {g.answered}/{g.total} asked</Mono>}</span>
                  <b>{g.answered ? `${g.score} / ${g.max}` : '—'}</b>
                </Row>
              ))}
            </Rows>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default InterviewResultPanel;
