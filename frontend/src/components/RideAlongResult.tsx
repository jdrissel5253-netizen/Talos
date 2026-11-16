import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';
import { Badge, Card, CardBody, CardHeader, CardTitle, Mono } from '../interviewKits/styles';
import { bandColor, pct } from '../rideAlong/api';
import { Band, EvaluationResult } from '../rideAlong/types';

// Total, band, Part 1 (tasks), Part 2 (categories) and red flags for one
// ride-along. Used on the scorer's summary screen. No pay guidance, ever.

const Hero = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.1rem 1.25rem;
`;

const Total = styled.div<{ $color: string }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1;
  color: ${p => p.$color};
  small { font-size: 0.9rem; color: #6e7d8e; font-weight: 500; }
`;

const BandLabel = styled.div<{ $color: string }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${p => p.$color};
  margin-bottom: 0.3rem;
`;

const Line = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: baseline;
  padding: 0.5rem 0;
  border-top: 1px solid #1e2330;
  font-size: 0.86rem;
  color: #dbe2ec;
  &:first-child { border-top: none; padding-top: 0; }
  b { font-family: 'JetBrains Mono', monospace; color: #ffffff; }
`;

const PartTotal = styled.span`
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
`;

const FlagLine = styled.div`
  padding: 0.55rem 0;
  border-top: 1px solid #1e2330;
  font-size: 0.86rem;
  line-height: 1.5;
  color: #dbe2ec;
  &:first-child { border-top: none; padding-top: 0; }
  p { margin: 0.25rem 0 0; color: #8a9ab0; font-size: 0.8rem; }
`;

interface Props {
  result: EvaluationResult;
  bands: Band[];
  capValue: number;
}

const RideAlongResult: React.FC<Props> = ({ result, bands, capValue }) => {
  const color = bandColor(result.band?.key, bands);
  return (
    <>
      <Card>
        <Hero>
          <Total $color={color}>{result.total ?? '–'}<small>/100</small></Total>
          <div>
            <BandLabel $color={color}>{result.band?.label ?? 'Not scored yet'}</BandLabel>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {result.partial && <Badge $tone="draft">Partial: {result.partialPart === 'part1' ? 'tasks only' : 'ride-along only'}</Badge>}
              {result.capped && <Badge $tone="draft">Capped at {capValue} (was {result.rawTotal})</Badge>}
              {result.failed && <Badge $tone="critical">Red flag fail</Badge>}
            </div>
          </div>
        </Hero>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Part 1 · Tasks</CardTitle>
          <PartTotal>{pct(result.part1)}</PartTotal>
        </CardHeader>
        <CardBody>
          {result.tasks.length === 0 && <Mono>No tasks picked.</Mono>}
          {result.tasks.map(t => (
            <Line key={t.code}>
              <span>
                {t.code} · {t.name}
                {t.safetyZero && <> <Badge $tone="critical">Safety 0</Badge></>}
                <br /><Mono>{t.stepsScored} of {t.stepsTotal} steps scored{t.stepsNa ? ` · ${t.stepsNa} N/A` : ''}</Mono>
              </span>
              <b>{pct(t.score)}</b>
            </Line>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Part 2 · Ride-along</CardTitle>
          <PartTotal>{pct(result.part2)}</PartTotal>
        </CardHeader>
        <CardBody>
          {result.categories.map(c => (
            <Line key={c.key}>
              <span>
                {c.name}
                <br /><Mono>
                  weight {Math.round(c.weight * 100)}%
                  {c.score !== null && Math.abs(c.effectiveWeight - c.weight) > 0.0005 && ` → ${Math.round(c.effectiveWeight * 100)}%`}
                  {c.score === null && ' · all N/A, weight spread over the rest'}
                </Mono>
              </span>
              <b>{pct(c.score)}</b>
            </Line>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <AlertTriangle size={13} color={result.redFlags.length ? '#f87171' : '#8a9ab0'} />
          <CardTitle>Red flags</CardTitle>
          <PartTotal>{result.redFlags.length}</PartTotal>
        </CardHeader>
        <CardBody>
          {result.redFlags.length === 0 && <Mono>None.</Mono>}
          {result.redFlags.map(f => (
            <FlagLine key={f.key}>
              <Badge $tone={f.type === 'FAIL' ? 'critical' : 'draft'}>{f.type}{f.auto ? ' · automatic' : ''}</Badge> {f.text}
              {f.note && <p>{f.note}</p>}
            </FlagLine>
          ))}
        </CardBody>
      </Card>
    </>
  );
};

export default RideAlongResult;
