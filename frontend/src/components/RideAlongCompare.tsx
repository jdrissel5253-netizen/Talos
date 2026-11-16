import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { Badge, CenterMsg, EmptyState, FontImport, GhostButton, Inner, Mono, Page, TopBar, TopBarTitle } from '../interviewKits/styles';
import { ApiError, bandColor, fetchComparison, pct } from '../rideAlong/api';
import { CompareCandidate } from '../rideAlong/types';

// Owner view: every candidate on a job with a submitted ride-along, side by
// side. Shows each candidate's latest submitted evaluation. No pay guidance.

const Scroll = styled.div`
  overflow-x: auto;
  border: 1px solid #232830;
  background: #161a22;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  border-collapse: collapse;
  min-width: 100%;
  font-size: 0.84rem;

  th, td {
    border-bottom: 1px solid #1e2330;
    padding: 0.7rem 0.85rem;
    text-align: left;
    vertical-align: top;
    min-width: 170px;
    max-width: 260px;
  }
  th:first-child, td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
    background: #13161d;
    min-width: 120px;
    max-width: 150px;
    color: #8a9ab0;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  thead th { background: #111318; }
`;

const CandidateHead = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  strong { display: block; color: #ffffff; font-size: 0.92rem; margin-bottom: 0.2rem; }
  &:hover strong { color: #4ade80; }
`;

const Big = styled.div<{ $color: string }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.6rem;
  font-weight: 700;
  color: ${p => p.$color};
`;

const Num = styled.span`
  font-family: 'JetBrains Mono', monospace;
  color: #ffffff;
  font-weight: 600;
`;

const Notes = styled.ul`
  margin: 0;
  padding-left: 1rem;
  color: #c8d0dc;
  font-size: 0.8rem;
  line-height: 1.5;
  li { margin-bottom: 0.4rem; }
  small { display: block; color: #6e7d8e; font-size: 0.7rem; }
`;

const Note = styled.p`
  font-size: 0.8rem;
  color: #8a9ab0;
  line-height: 1.6;
  margin: 0 0 1rem;
`;

const RideAlongCompare: React.FC = () => {
  const { jobId: jobParam } = useParams<{ jobId: string }>();
  const jobId = Number(jobParam);
  const navigate = useNavigate();
  const [data, setData] = useState<{ job: { id: number; title: string }; candidates: CompareCandidate[] } | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    if (!Number.isInteger(jobId) || jobId <= 0) { setLoadState('missing'); return; }
    fetchComparison(jobId)
      .then(d => { setData(d); setLoadState('ready'); })
      .catch(err => setLoadState(err instanceof ApiError && err.status === 404 ? 'missing' : 'error'));
  }, [jobId]);

  // Categories across every candidate (they may have been scored on different scorecards).
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    data?.candidates.forEach(c => c.result.categories.forEach(cat => { if (!seen.has(cat.key)) seen.set(cat.key, cat.name); }));
    return Array.from(seen, ([key, name]) => ({ key, name }));
  }, [data]);

  const back = () => navigate(`/jobs-management/${jobParam}`);

  return (
    <Page>
      <FontImport />
      <TopBar>
        <GhostButton onClick={back}><ArrowLeft size={13} /> Job</GhostButton>
        <TopBarTitle>Ride-alongs{data ? ` · ${data.job.title}` : ''}</TopBarTitle>
      </TopBar>
      <Inner>
        {loadState === 'loading' && <CenterMsg>Loading...</CenterMsg>}
        {loadState === 'missing' && <CenterMsg>This job doesn't exist or isn't on your account.</CenterMsg>}
        {loadState === 'error' && <CenterMsg>Could not load ride-alongs. Try again in a moment.</CenterMsg>}
        {data && data.candidates.length === 0 && (
          <EmptyState>
            <ClipboardCheck size={28} color="#4ade80" />
            <h3>No submitted ride-alongs yet</h3>
            <p>Once a lead tech submits a ride-along for a candidate on this job, it shows up here.</p>
          </EmptyState>
        )}
        {data && data.candidates.length > 0 && (
          <>
            <Note>Highest total first. Each column is the candidate's latest submitted ride-along. Tap a name to open it.</Note>
            <Scroll>
              <Table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    {data.candidates.map(c => (
                      <th key={c.id}>
                        <CandidateHead onClick={() => navigate(`/ride-along/${c.id}`)}>
                          <strong>{c.candidateName}</strong>
                          <Mono>{c.scorecard.title} v{c.scorecard.version}</Mono>
                        </CandidateHead>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total</td>
                    {data.candidates.map(c => (
                      <td key={c.id}>
                        <Big $color={bandColor(c.result.band?.key, c.scorecard.bands)}>{c.result.total ?? '–'}</Big>
                        {c.result.partial && <Badge $tone="draft">Partial</Badge>}
                        {c.result.capped && <Badge $tone="draft">Capped</Badge>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Result</td>
                    {data.candidates.map(c => (
                      <td key={c.id} style={{ color: bandColor(c.result.band?.key, c.scorecard.bands), fontWeight: 700 }}>
                        {c.result.band?.label ?? '–'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Part 1 · Tasks</td>
                    {data.candidates.map(c => (
                      <td key={c.id}>
                        <Num>{pct(c.result.part1)}</Num>
                        <Mono style={{ display: 'block' }}>{c.result.tasks.map(t => t.code).join(', ') || 'no tasks'}</Mono>
                      </td>
                    ))}
                  </tr>
                  {categories.map(cat => (
                    <tr key={cat.key}>
                      <td>{cat.name}</td>
                      {data.candidates.map(c => {
                        const r = c.result.categories.find(x => x.key === cat.key);
                        return <td key={c.id}><Num>{r ? pct(r.score) : '–'}</Num></td>;
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td>Red flags</td>
                    {data.candidates.map(c => (
                      <td key={c.id}>
                        {c.result.redFlags.length === 0 ? <Mono>None</Mono> : (
                          <Notes>
                            {c.result.redFlags.map(f => (
                              <li key={f.key}>
                                <Badge $tone={f.type === 'FAIL' ? 'critical' : 'draft'}>{f.type}</Badge> {f.text}
                                {f.note && <small>{f.note}</small>}
                              </li>
                            ))}
                          </Notes>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Scorer notes</td>
                    {data.candidates.map(c => (
                      <td key={c.id}>
                        {c.notes.length === 0 ? <Mono>None</Mono> : (
                          <Notes>{c.notes.map((n, i) => <li key={i}>{n.note}<small>{n.about}</small></li>)}</Notes>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Scored by</td>
                    {data.candidates.map(c => (
                      <td key={c.id}>
                        <Mono style={{ display: 'block' }}>{c.scorerEmail || 'Former teammate'}</Mono>
                        <Mono style={{ display: 'block' }}>{c.evaluatedOn}</Mono>
                        {c.evaluationCount > 1 && (
                          <Mono style={{ display: 'block', marginTop: '0.3rem' }}>
                            {c.evaluationCount} ride-alongs ·{' '}
                            {c.otherEvaluations.map((o, i) => (
                              <React.Fragment key={o.id}>
                                {i > 0 && ', '}
                                <a href={`/ride-along/${o.id}`} onClick={e => { e.preventDefault(); navigate(`/ride-along/${o.id}`); }} style={{ color: '#8a9ab0' }}>
                                  earlier: {o.total ?? '–'}
                                </a>
                              </React.Fragment>
                            ))}
                          </Mono>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>
            </Scroll>
          </>
        )}
      </Inner>
    </Page>
  );
};

export default RideAlongCompare;
