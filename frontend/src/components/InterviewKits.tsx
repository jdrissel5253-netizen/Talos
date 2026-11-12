import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, ClipboardList, ChevronRight, ListPlus } from 'lucide-react';
import { fetchKits, fetchSets, KIT_TYPE_LABELS, STATUS_LABELS } from '../interviewKits/api';
import { InterviewKitSummary, QuestionSetSummary } from '../interviewKits/types';
import {
  FontImport, Page, TopBar, TopBarTitle, Inner, GhostButton, PrimaryButton, Badge, Select, Label,
  CenterMsg, EmptyState, Mono, clipCorners,
} from '../interviewKits/styles';

const SectionTitle = styled.h2`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8a9ab0;
  margin: 0 0 0.75rem;
`;

const SetsHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;

  h2 { margin: 0; }
`;

const SetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
  margin-bottom: 2.25rem;
`;

const SetCard = styled.button`
  text-align: left;
  background: #161a22;
  border: 1px solid #232830;
  padding: 0.9rem 1rem;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  ${clipCorners}

  &:hover { border-color: #4ade80; }

  div { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }
  strong { font-size: 0.88rem; font-weight: 600; color: #ffffff; }
`;

const SetsEmpty = styled.div`
  border: 1px dashed #2a3040;
  padding: 1.1rem 1.25rem;
  font-size: 0.82rem;
  line-height: 1.6;
  color: #8a9ab0;
  margin-bottom: 2.25rem;
`;

const Intro = styled.p`
  font-size: 0.85rem;
  line-height: 1.6;
  color: #8a9ab0;
  margin: 0 0 1.5rem;
  max-width: 640px;
`;

const Filters = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 0.75rem;
  align-items: end;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const KitCard = styled.button`
  text-align: left;
  background: #161a22;
  border: 1px solid #232830;
  padding: 1.1rem 1.2rem;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: border-color 0.15s ease;
  ${clipCorners}

  &:hover { border-color: #4ade80; }
`;

const KitTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.35;
`;

const KitSummary = styled.p`
  font-size: 0.78rem;
  line-height: 1.55;
  color: #8a9ab0;
  margin: 0;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const CardFoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: #6e7d8e;
`;

const ResultCount = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #6e7d8e;
  margin-bottom: 0.75rem;
`;

const ALL = '';

const InterviewKits: React.FC = () => {
  const navigate = useNavigate();
  const [kits, setKits] = useState<InterviewKitSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [role, setRole] = useState(ALL);
  const [level, setLevel] = useState(ALL);
  const [type, setType] = useState(ALL);

  const [sets, setSets] = useState<QuestionSetSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchKits()
      .then(k => { if (!cancelled) setKits(k); })
      .catch(() => { if (!cancelled) setError(true); });
    fetchSets()
      .then(s => { if (!cancelled) setSets(s); })
      .catch(() => { if (!cancelled) setSets([]); });
    return () => { cancelled = true; };
  }, []);

  const options = useMemo(() => {
    const roles = new Set<string>();
    const levels = new Set<string>();
    const types = new Set<string>();
    (kits ?? []).forEach(k => {
      k.roles.forEach(r => roles.add(r));
      k.levels.forEach(l => levels.add(l));
      types.add(k.type);
    });
    return {
      roles: Array.from(roles).sort(),
      levels: Array.from(levels).sort(),
      types: Array.from(types).sort(),
    };
  }, [kits]);

  const filtered = useMemo(() => (kits ?? []).filter(k =>
    (role === ALL || k.roles.includes(role)) &&
    (level === ALL || k.levels.includes(level)) &&
    (type === ALL || k.type === type)
  ), [kits, role, level, type]);

  const hasFilters = role !== ALL || level !== ALL || type !== ALL;

  return (
    <>
      <FontImport />
      <Page>
        <TopBar>
          <GhostButton onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={13} /> Dashboard
          </GhostButton>
          <TopBarTitle>Interview Kits</TopBarTitle>
        </TopBar>

        <Inner>
          <Intro>
            Build your own interview by picking questions from any kit and adding your own, or run a
            full kit with its scored level placement. Every kit question comes with an answer key.
          </Intro>

          <SetsHead>
            <SectionTitle>Your question sets</SectionTitle>
            <PrimaryButton onClick={() => navigate('/interview-kits/sets/new')}>
              <ListPlus size={14} /> Build a question set
            </PrimaryButton>
          </SetsHead>
          {sets !== null && sets.length === 0 && (
            <SetsEmpty>
              Save the questions you ask most, like a 10-question phone screen, and start them from any
              candidate's profile. Sets are shared with your team.
            </SetsEmpty>
          )}
          {sets !== null && sets.length > 0 && (
            <SetGrid>
              {sets.map(s => (
                <SetCard key={s.id} onClick={() => navigate(`/interview-kits/sets/${s.id}`)}>
                  <div>
                    <strong>{s.name}</strong>
                    <Mono>{s.itemCount} question{s.itemCount === 1 ? '' : 's'}</Mono>
                  </div>
                  <ChevronRight size={14} color="#6e7d8e" />
                </SetCard>
              ))}
            </SetGrid>
          )}

          <SectionTitle>Question banks</SectionTitle>

          {error && <CenterMsg>Could not load interview kits. Try again in a moment.</CenterMsg>}
          {!error && kits === null && <CenterMsg>Loading interview kits...</CenterMsg>}

          {!error && kits !== null && kits.length === 0 && (
            <EmptyState>
              <ClipboardList size={28} color="#4ade80" />
              <h3>Interview kits are on the way</h3>
              <p>
                Question banks and character assessments for each HVAC role will appear here once
                they're loaded. You'll be able to browse them, set default kits for each job, and run
                structured interviews from a candidate's profile.
              </p>
            </EmptyState>
          )}

          {!error && kits !== null && kits.length > 0 && (
            <>
              <Filters>
                <FilterField>
                  <Label htmlFor="kit-role">Role</Label>
                  <Select id="kit-role" value={role} onChange={e => setRole(e.target.value)}>
                    <option value={ALL}>All roles</option>
                    {options.roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </FilterField>
                <FilterField>
                  <Label htmlFor="kit-level">Level</Label>
                  <Select id="kit-level" value={level} onChange={e => setLevel(e.target.value)}>
                    <option value={ALL}>All levels</option>
                    {options.levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </FilterField>
                <FilterField>
                  <Label htmlFor="kit-type">Type</Label>
                  <Select id="kit-type" value={type} onChange={e => setType(e.target.value)}>
                    <option value={ALL}>All types</option>
                    {options.types.map(t => <option key={t} value={t}>{KIT_TYPE_LABELS[t] ?? t}</option>)}
                  </Select>
                </FilterField>
                <GhostButton
                  disabled={!hasFilters}
                  onClick={() => { setRole(ALL); setLevel(ALL); setType(ALL); }}
                >
                  Clear
                </GhostButton>
              </Filters>

              <ResultCount>{filtered.length} of {kits.length} kits</ResultCount>

              {filtered.length === 0 ? (
                <CenterMsg>No kits match these filters.</CenterMsg>
              ) : (
                <Grid>
                  {filtered.map(k => (
                    <KitCard key={k.id} onClick={() => navigate(`/interview-kits/${encodeURIComponent(k.id)}`)}>
                      <BadgeRow>
                        <Badge $tone={k.status === 'reviewed' ? 'reviewed' : 'draft'}>{STATUS_LABELS[k.status] ?? k.status}</Badge>
                        <Badge>{KIT_TYPE_LABELS[k.type] ?? k.type}</Badge>
                      </BadgeRow>
                      <KitTitle>{k.title}</KitTitle>
                      {k.summary && <KitSummary>{k.summary}</KitSummary>}
                      <KitSummary>
                        {k.roles.join(', ')}{k.levels.length > 0 && ` · ${k.levels.join(', ')}`}
                      </KitSummary>
                      <CardFoot>
                        <span>{k.questionCount} questions · v{k.version}</span>
                        <ChevronRight size={14} />
                      </CardFoot>
                    </KitCard>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Inner>
      </Page>
    </>
  );
};

export default InterviewKits;
