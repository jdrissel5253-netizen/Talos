import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, ChevronRight, ClipboardCheck, Play, Search, Settings2 } from 'lucide-react';
import {
  Badge, Card, CardBody, CardHeader, CardTitle, CenterMsg, EmptyState, FontImport, GhostButton, Inner, Label, Mono, Page,
  PrimaryButton, TopBar, TopBarTitle,
} from '../interviewKits/styles';
import { ApiError, fetchMyDrafts, fetchScorableCandidates, fetchScorecards, startEvaluation } from '../rideAlong/api';
import { EvaluationSummary, ScorableCandidate, ScorecardSummary } from '../rideAlong/types';

// Ride-along home: open drafts first (scorers reopen them all day), then
// starting a new one (pick a candidate, then a scorecard).

const Row = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: center;
  min-height: 56px;
  text-align: left;
  background: transparent;
  border: none;
  border-top: 1px solid #1e2330;
  padding: 0.75rem 0;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  color: #c8d0dc;
  &:first-of-type { border-top: none; padding-top: 0; }
  strong { display: block; color: #ffffff; font-size: 0.92rem; margin-bottom: 0.2rem; }
`;

const SearchBox = styled.div`
  position: relative;
  svg { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #6e7d8e; }
  input {
    width: 100%;
    box-sizing: border-box;
    background: #111318;
    border: 1px solid #2a3040;
    color: #c8d0dc;
    font-family: 'Sora', sans-serif;
    font-size: 16px;
    padding: 0.75rem 0.75rem 0.75rem 2.2rem;
    outline: none;
    &:focus { border-color: #4ade80; }
  }
`;

const Choice = styled.button<{ $on: boolean }>`
  width: 100%;
  text-align: left;
  padding: 0.75rem 0.85rem;
  min-height: 52px;
  margin-top: 0.5rem;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  color: #c8d0dc;
  background: ${p => (p.$on ? 'rgba(74,222,128,0.06)' : '#111318')};
  border: 1px solid ${p => (p.$on ? '#4ade80' : '#2a3040')};
  strong { display: block; color: #ffffff; font-size: 0.9rem; }
`;

const List = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const ErrorMsg = styled.div`
  color: #f87171;
  font-size: 0.82rem;
  margin-top: 0.75rem;
`;

const ago = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return new Date(iso).toLocaleDateString();
};

const RideAlongHome: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetPipeline = Number(params.get('pipelineId')) || null;

  const [drafts, setDrafts] = useState<EvaluationSummary[] | null>(null);
  const [scorecards, setScorecards] = useState<ScorecardSummary[] | null>(null);
  const [candidates, setCandidates] = useState<ScorableCandidate[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [pipelineId, setPipelineId] = useState<number | null>(presetPipeline);
  const [slug, setSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchMyDrafts(), fetchScorecards(), fetchScorableCandidates()])
      .then(([d, s, c]) => {
        setDrafts(d);
        setScorecards(s);
        setCandidates(c);
        if (s.length === 1) setSlug(s[0].slug);
      })
      .catch(() => setLoadError(true));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = candidates ?? [];
    return q ? list.filter(c => c.name.toLowerCase().includes(q) || c.jobTitle.toLowerCase().includes(q)) : list;
  }, [candidates, query]);

  const selected = candidates?.find(c => c.pipelineId === pipelineId) ?? null;

  const start = async () => {
    if (!pipelineId || !slug) return;
    setBusy(true);
    setError(null);
    try {
      const e = await startEvaluation(pipelineId, slug);
      navigate(`/ride-along/${e.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the ride-along.');
      setBusy(false);
    }
  };

  return (
    <Page>
      <FontImport />
      <TopBar>
        <GhostButton onClick={() => navigate('/dashboard')}><ArrowLeft size={13} /> Dashboard</GhostButton>
        <TopBarTitle>Ride-along scorecards</TopBarTitle>
      </TopBar>
      <Inner $narrow>
        {loadError && <CenterMsg>Could not load ride-alongs. Check your connection and try again.</CenterMsg>}
        {!loadError && (drafts === null || scorecards === null) && <CenterMsg>Loading...</CenterMsg>}

        {!loadError && scorecards !== null && scorecards.length === 0 && (
          <EmptyState>
            <ClipboardCheck size={28} color="#4ade80" />
            <h3>No scorecards yet</h3>
            <p>Ride-along scorecards will show up here once Talos publishes them.</p>
          </EmptyState>
        )}

        {drafts && drafts.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Your open ride-alongs</CardTitle></CardHeader>
            <CardBody>
              {drafts.map(d => (
                <Row key={d.id} onClick={() => navigate(`/ride-along/${d.id}`)}>
                  <div>
                    <strong>{d.candidateName}</strong>
                    <Mono>{d.scorecard.title} · {d.jobTitle} · saved {ago(d.updatedAt)}</Mono>
                  </div>
                  <ChevronRight size={18} color="#6e7d8e" />
                </Row>
              ))}
            </CardBody>
          </Card>
        )}

        {scorecards && scorecards.length > 0 && candidates && (
          <Card>
            <CardHeader><Play size={13} color="#8a9ab0" /><CardTitle>Start a ride-along</CardTitle></CardHeader>
            <CardBody>
              <Label>1. Candidate</Label>
              {selected ? (
                <Choice $on type="button" onClick={() => setPipelineId(null)}>
                  <strong>{selected.name}</strong>
                  <Mono>{selected.jobTitle} · tap to change</Mono>
                </Choice>
              ) : candidates.length === 0 ? (
                <Mono>No candidates on your jobs yet.</Mono>
              ) : (
                <>
                  <SearchBox>
                    <Search size={15} />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or job" aria-label="Search candidates" />
                  </SearchBox>
                  <List>
                    {filtered.slice(0, 100).map(c => (
                      <Choice key={c.pipelineId} $on={false} type="button" onClick={() => setPipelineId(c.pipelineId)}>
                        <strong>{c.name}</strong>
                        <Mono>{c.jobTitle} · {c.status}</Mono>
                      </Choice>
                    ))}
                    {filtered.length === 0 && <Mono>No matches.</Mono>}
                  </List>
                </>
              )}

              <Label style={{ marginTop: '1.25rem' }}>2. Scorecard</Label>
              {scorecards.map(s => (
                <Choice key={s.slug} $on={slug === s.slug} type="button" onClick={() => setSlug(s.slug)}>
                  <strong>{s.title}</strong>
                  <Mono>{s.role} · {s.taskCount} tasks · v{s.version}</Mono>
                </Choice>
              ))}

              {error && <ErrorMsg>{error}</ErrorMsg>}
              <PrimaryButton onClick={start} disabled={!pipelineId || !slug || busy} style={{ width: '100%', minHeight: 52, marginTop: '1.25rem' }}>
                <Play size={15} /> {busy ? 'Starting...' : 'Start ride-along'}
              </PrimaryButton>
            </CardBody>
          </Card>
        )}

        {scorecards && scorecards.length > 0 && (
          <Card>
            <CardHeader><Settings2 size={13} color="#8a9ab0" /><CardTitle>Scorecards</CardTitle></CardHeader>
            <CardBody>
              {scorecards.map(s => (
                <Row key={s.slug} onClick={() => navigate(`/scorecards/${s.slug}`)}>
                  <div>
                    <strong>{s.title}</strong>
                    <Mono>{s.taskCount} tasks · {s.categoryCount} observation categories · <Badge $tone="neutral">v{s.version}</Badge></Mono>
                  </div>
                  <ChevronRight size={18} color="#6e7d8e" />
                </Row>
              ))}
            </CardBody>
          </Card>
        )}
      </Inner>
    </Page>
  );
};

export default RideAlongHome;
