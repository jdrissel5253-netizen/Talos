import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Briefcase, Users, Star, CheckCircle, AlertCircle, UserCheck, ChevronRight, TrendingUp, MapPin, Clock, Upload, Eye, LayoutGrid, Files } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { config as appConfig } from '../config';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

// ─── helpers ──────────────────────────────────────────────────────────────────

function decodeEmail(): string {
  try {
    const token = localStorage.getItem('talos_auth_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.email || '';
  } catch { return ''; }
}

function friendlyName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const barExpand = keyframes`
  from { width: 0; }
  to   { width: var(--w); }
`;

// ─── layout ───────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  font-family: 'Sora', sans-serif;
  padding: 0 0 5rem;
`;

const TopBar = styled.div`
  border-bottom: 1px solid #232830;
  padding: 1.75rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  background: #111318;
  position: sticky;
  top: 0;
  z-index: 50;

  @media (max-width: 768px) {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const TopBarLeft = styled.div``;

const GreetingText = styled.h1`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const EmailText = styled.p`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: #6e7d8e;
  margin-top: 0.2rem;
  letter-spacing: 0.04em;
`;

const QuickNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;

const NavPill = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #2a3040;
  color: #8a9ab0;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));

  &:hover {
    border-color: #4ade80;
    color: #4ade80;
    background: rgba(74,222,128,0.04);
  }
`;

const NavPillPrimary = styled(NavPill)`
  background: #4ade80;
  border-color: #4ade80;
  color: #000;
  font-weight: 600;

  &:hover {
    background: #6ee89a;
    border-color: #6ee89a;
    color: #000;
  }
`;

const Inner = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 2.5rem 2.5rem 0;
  animation: ${fadeUp} 0.6s ease both;

  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0;
  }
`;

// ─── stats ────────────────────────────────────────────────────────────────────

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  border: 1px solid #232830;
  margin-bottom: 2rem;

  @media (max-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: repeat(2, 1fr); }
`;

const StatTile = styled.div<{ accent?: string }>`
  background: #1a1f2a;
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-right: 1px solid #232830;
  border-bottom: 1px solid #232830;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover { background: #1e2330; }
  &:last-child { border-right: none; }

  @media (max-width: 1024px) {
    &:nth-child(3n) { border-right: none; }
  }
  @media (max-width: 600px) {
    &:nth-child(2n) { border-right: none; }
  }
`;

const StatLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #8a9ab0;
`;

const StatValue = styled.span<{ accent?: string }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  font-weight: 600;
  color: ${p => p.accent || '#ffffff'};
  line-height: 1;
  letter-spacing: -0.02em;
`;

const StatSub = styled.span`
  font-size: 0.7rem;
  color: #6e7d8e;
  font-weight: 400;
`;

// ─── two-col layout ───────────────────────────────────────────────────────────

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// ─── section card ─────────────────────────────────────────────────────────────

const Card = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
`;

const CardHeader = styled.div`
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid #1e2330;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h2`
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8a9ab0;
`;

const CardAction = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: #4ade80;
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: opacity 0.15s ease;

  &:hover { opacity: 0.75; }
`;

// ─── pipeline funnel ──────────────────────────────────────────────────────────

const FunnelBody = styled.div`
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const FunnelRow = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr 40px;
  align-items: center;
  gap: 0.75rem;
`;

const FunnelLabel = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8a9ab0;
`;

const FunnelTrack = styled.div`
  background: #232830;
  height: 4px;
  position: relative;
  overflow: visible;
`;

const FunnelFill = styled.div<{ pct: number; color: string }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: ${p => p.color};
  --w: ${p => p.pct}%;
  animation: ${barExpand} 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
  width: var(--w);
`;

const FunnelCount = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: #e0e0e0;
  text-align: right;
`;

// ─── tier distribution ────────────────────────────────────────────────────────

const TierBody = styled.div`
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const TierDistRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #1e2330;

  &:last-child { border-bottom: none; }
`;

const TierDistLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TierDot = styled.div<{ color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${p => p.color};
  flex-shrink: 0;
`;

const TierDistName = styled.span`
  font-size: 0.82rem;
  font-weight: 500;
  color: #e0e0e0;
`;

const TierDistRange = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: #6e7d8e;
  margin-left: 0.35rem;
`;

const TierDistCount = styled.span<{ color: string }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: ${p => p.color};
`;

// ─── attention rows ───────────────────────────────────────────────────────────

const AttentionBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const AttentionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #1e2330;
  cursor: pointer;
  transition: background 0.15s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: #1e2330; }
`;

const AttentionDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
`;

const AttentionTitle = styled.span`
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #e0e0e0;
  letter-spacing: -0.01em;
`;

const AttentionBadge = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.15);
  padding: 0.2rem 0.5rem;
  letter-spacing: 0.06em;
`;

const AttentionCity = styled.span`
  font-size: 0.75rem;
  color: #8a9ab0;
`;

// ─── jobs grid ────────────────────────────────────────────────────────────────

const JobsBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #232830;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const JobTile = styled.div`
  background: #1a1f2a;
  padding: 1.4rem 1.5rem;
  cursor: pointer;
  transition: background 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:hover { background: #1e2330; }
`;

const JobTileTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const NewPill = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.15);
  padding: 0.15rem 0.5rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
`;

const JobTileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const JobMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: #8a9ab0;
`;

const JobTileFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.6rem;
  border-top: 1px solid #232830;
  margin-top: 0.25rem;
`;

const JobCandidateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-top: 0.75rem;
  border-top: 1px solid #232830;
  margin-top: 0.25rem;
`;

const JobCandidateRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.12s ease;
  margin: 0 -0.25rem;
  padding: 0.1rem 0.25rem;

  &:hover { background: rgba(74,222,128,0.05); }
`;

const JobCandidateName = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  color: #c8d0dc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JobCandidateScore = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 500;
  color: #6e7d8e;
`;

const CandidateCount = styled.span<{ hasData: boolean }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  color: ${p => p.hasData ? '#4ade80' : '#2a2a2a'};
  letter-spacing: 0.04em;
`;

// ─── candidates ───────────────────────────────────────────────────────────────

const CandidatesBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const CandidateItem = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr auto 52px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid #1e2330;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover { background: #1e2330; }
  &:last-child { border-bottom: none; }
`;

const TierChip = styled.span<{ tier: 'green' | 'yellow' | 'red' }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.4rem;
  color: ${p => p.tier === 'green' ? '#4ade80' : p.tier === 'yellow' ? '#fbbf24' : '#f87171'};
  background: ${p => p.tier === 'green' ? 'rgba(74,222,128,0.06)' : p.tier === 'yellow' ? 'rgba(251,191,36,0.06)' : 'rgba(248,113,113,0.06)'};
  border: 1px solid ${p => p.tier === 'green' ? 'rgba(74,222,128,0.15)' : p.tier === 'yellow' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)'};
  text-align: center;
`;

const CandidateNameText = styled.span`
  font-size: 0.82rem;
  font-weight: 500;
  color: #e0e0e0;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CandidateJobText = styled.span`
  font-size: 0.72rem;
  color: #8a9ab0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CandidateScore = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  font-weight: 500;
  color: #a0b0c0;
  text-align: right;
  letter-spacing: -0.01em;
`;

// ─── empty / loading ──────────────────────────────────────────────────────────

// ─── get started checklist ────────────────────────────────────────────────────

const GetStartedCard = styled.div`
  border: 1px solid #2a3a2a;
  background: linear-gradient(135deg, #111a14 0%, #111318 100%);
  margin-bottom: 2rem;
  padding: 2rem 2.5rem;

  @media (max-width: 600px) { padding: 1.5rem; }
`;

const GetStartedHeading = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 0.35rem;
`;

const GetStartedSub = styled.p`
  font-size: 0.78rem;
  color: #6e7d8e;
  margin-bottom: 1.75rem;
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const StepRow = styled.div<{ state: 'done' | 'active' | 'locked' }>`
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #1e2330;
  opacity: ${p => p.state === 'locked' ? 0.4 : 1};

  &:last-child { border-bottom: none; }
`;

const StepIcon = styled.div<{ state: 'done' | 'active' | 'locked' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
  background: ${p => p.state === 'done' ? 'rgba(74,222,128,0.12)' : p.state === 'active' ? 'rgba(74,222,128,0.08)' : '#1a1f2a'};
  border: 1px solid ${p => p.state === 'done' ? '#4ade80' : p.state === 'active' ? 'rgba(74,222,128,0.4)' : '#232830'};
  color: ${p => p.state === 'done' ? '#4ade80' : p.state === 'active' ? '#4ade80' : '#6e7d8e'};
`;

const StepText = styled.div``;

const StepTitle = styled.div<{ state: 'done' | 'active' | 'locked' }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${p => p.state === 'done' ? '#6e7d8e' : '#e0e0e0'};
  text-decoration: ${p => p.state === 'done' ? 'line-through' : 'none'};
  letter-spacing: -0.01em;
`;

const StepDesc = styled.div`
  font-size: 0.72rem;
  color: #6e7d8e;
  margin-top: 0.15rem;
`;

const StepBtn = styled.button`
  background: #4ade80;
  border: none;
  color: #000;
  font-family: 'Sora', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.45rem 1rem;
  cursor: pointer;
  white-space: nowrap;
  clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  transition: background 0.15s ease;

  &:hover { background: #6ee89a; }
`;

const EmptyCell = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: #6e7d8e;
  font-size: 0.82rem;
  font-weight: 400;
`;

const EmptyActionBtn = styled.button`
  margin-top: 1rem;
  background: transparent;
  border: 1px solid #4ade80;
  color: #4ade80;
  padding: 0.55rem 1.25rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  transition: background 0.15s ease, color 0.15s ease;
  display: block;
  margin-left: auto;
  margin-right: auto;

  &:hover { background: #4ade80; color: #000; }
`;

const LoadingRow = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #6e7d8e;
  letter-spacing: 0.1em;
`;

const SectionWrap = styled.div`
  margin-bottom: 2rem;
`;

// ─── types ────────────────────────────────────────────────────────────────────

interface Job {
  id: number; title: string; city: string;
  job_type: string; status: string;
  candidate_count: number; new_candidate_count: number;
}
interface Stats {
  total: number;
  tierDistribution: { green: number; yellow: number; red: number };
  statusBreakdown: { new: number; approved: number; contacted: number; backup: number; rejected: number };
}
interface Candidate {
  pipeline_id: number; filename: string;
  tier: 'green' | 'yellow' | 'red';
  tier_score: number; job_title: string;
  job_id: number;
}

const FUNNEL_STAGES = [
  { key: 'new',       label: 'New',       color: '#60a5fa' },
  { key: 'approved',  label: 'Approved',  color: '#4ade80' },
  { key: 'contacted', label: 'Contacted', color: '#a78bfa' },
  { key: 'backup',    label: 'Backup',    color: '#f59e0b' },
  { key: 'rejected',  label: 'Rejected',  color: '#f87171' },
] as const;

const TIER_ROWS = [
  { key: 'green',  label: 'Green',  range: '80–100', color: '#4ade80' },
  { key: 'yellow', label: 'Yellow', range: '50–79',  color: '#fbbf24' },
  { key: 'red',    label: 'Red',    range: '0–49',   color: '#f87171' },
] as const;

// ─── component ────────────────────────────────────────────────────────────────

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const email = decodeEmail();

  const [jobs, setJobs]               = useState<Job[]>([]);
  const [stats, setStats]             = useState<Stats | null>(null);
  const [topCandidates, setTopCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    // Clear stale state immediately so a previous user's data never shows
    setJobs([]);
    setStats(null);
    setTopCandidates([]);
    setLoading(true);

    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    const base = appConfig.apiUrl;
    Promise.all([
      fetch(`${base}/api/jobs`,                                                   { headers }).then(r => r.json()),
      fetch(`${base}/api/pipeline/talent-pool/stats`,                             { headers }).then(r => r.json()),
      fetch(`${base}/api/pipeline/talent-pool?limit=100&sortBy=score&sortOrder=desc`, { headers }).then(r => r.json()),
    ]).then(([jobsRes, statsRes, candidatesRes]) => {
      if (jobsRes.status === 'success')        setJobs(jobsRes.data.jobs ?? []);
      if (statsRes.status === 'success')       setStats(statsRes.data);
      if (candidatesRes.status === 'success')  setTopCandidates(candidatesRes.data.candidates ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter(j => j.status !== 'deleted');
  const needsAttention = activeJobs
    .filter(j => j.new_candidate_count > 0)
    .sort((a, b) => b.new_candidate_count - a.new_candidate_count);
  const statusTotal = stats
    ? Object.values(stats.statusBreakdown).reduce((sum, v) => sum + v, 0)
    : 0;
  const candidatesByJob = topCandidates.reduce<Record<number, Candidate[]>>((acc, c) => {
    if (!acc[c.job_id]) acc[c.job_id] = [];
    if (acc[c.job_id].length < 3) acc[c.job_id].push(c);
    return acc;
  }, {});

  return (
    <>
      <FontImport />
      <Page>

        {/* ── Top bar ── */}
        <TopBar>
          <TopBarLeft>
            <GreetingText>{greeting()}</GreetingText>
            <EmailText>{email}</EmailText>
          </TopBarLeft>
          <QuickNav>
            <NavPill onClick={() => navigate('/jobs-management')}>
              <LayoutGrid size={13} /> Jobs
            </NavPill>
            <NavPill onClick={() => navigate('/talent-pool-manager')}>
              <Users size={13} /> Talent Pool
            </NavPill>
            <NavPill onClick={() => navigate('/resume-analysis')}>
              <Upload size={13} /> Upload Resume
            </NavPill>
            <NavPill onClick={() => navigate('/batch-resume-analysis')}>
              <Files size={13} /> Batch Upload
            </NavPill>
            <NavPillPrimary onClick={() => navigate('/jobs-management')}>
              <Eye size={13} /> View Pipeline
            </NavPillPrimary>
          </QuickNav>
        </TopBar>

        <Inner>
          {loading ? (
            <LoadingRow>Loading dashboard data...</LoadingRow>
          ) : (
            <>
              {/* ── Stats ── */}
              <StatsRow>
                <StatTile onClick={() => navigate('/jobs-management')}>
                  <StatLabel>Active Jobs</StatLabel>
                  <StatValue accent="#4ade80">{activeJobs.length}</StatValue>
                  <StatSub>open positions</StatSub>
                </StatTile>
                <StatTile onClick={() => navigate('/talent-pool-manager')}>
                  <StatLabel>Total Candidates</StatLabel>
                  <StatValue>{stats?.total ?? 0}</StatValue>
                  <StatSub>in pipeline</StatSub>
                </StatTile>
                <StatTile onClick={() => navigate('/talent-pool-manager?tier=green')}>
                  <StatLabel>Green Tier</StatLabel>
                  <StatValue accent="#4ade80">{stats?.tierDistribution.green ?? 0}</StatValue>
                  <StatSub>top-ranked</StatSub>
                </StatTile>
                <StatTile onClick={() => navigate('/talent-pool-manager?status=new')}>
                  <StatLabel>Pending Review</StatLabel>
                  <StatValue accent="#f59e0b">{stats?.statusBreakdown.new ?? 0}</StatValue>
                  <StatSub>awaiting action</StatSub>
                </StatTile>
                <StatTile onClick={() => navigate('/talent-pool-manager?status=contacted')}>
                  <StatLabel>Contacted</StatLabel>
                  <StatValue accent="#34d399">{stats?.statusBreakdown.contacted ?? 0}</StatValue>
                  <StatSub>in outreach</StatSub>
                </StatTile>
              </StatsRow>

              {/* ── Pipeline + Tier side-by-side ── */}
              {stats && statusTotal > 0 && (
                <TwoCol>
                  <Card>
                    <CardHeader>
                      <CardTitle>Pipeline Status</CardTitle>
                      <CardAction onClick={() => navigate('/talent-pool-manager')}>
                        Manage <ChevronRight size={12} />
                      </CardAction>
                    </CardHeader>
                    <FunnelBody>
                      {FUNNEL_STAGES.map(stage => {
                        const count = stats.statusBreakdown[stage.key];
                        const pct   = statusTotal > 0 ? Math.round((count / statusTotal) * 100) : 0;
                        return (
                          <FunnelRow key={stage.key}>
                            <FunnelLabel>{stage.label}</FunnelLabel>
                            <FunnelTrack>
                              <FunnelFill pct={pct} color={stage.color} />
                            </FunnelTrack>
                            <FunnelCount>{count}</FunnelCount>
                          </FunnelRow>
                        );
                      })}
                    </FunnelBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tier Breakdown</CardTitle>
                    </CardHeader>
                    <TierBody>
                      {TIER_ROWS.map(t => (
                        <TierDistRow key={t.key}>
                          <TierDistLeft>
                            <TierDot color={t.color} />
                            <TierDistName>
                              {t.label}
                              <TierDistRange>{t.range}</TierDistRange>
                            </TierDistName>
                          </TierDistLeft>
                          <TierDistCount color={t.color}>
                            {stats.tierDistribution[t.key]}
                          </TierDistCount>
                        </TierDistRow>
                      ))}
                    </TierBody>
                  </Card>
                </TwoCol>
              )}

              {/* ── Needs Attention ── */}
              {needsAttention.length > 0 && (
                <SectionWrap>
                  <Card>
                    <CardHeader>
                      <CardTitle>Needs Attention</CardTitle>
                      <CardAction onClick={() => navigate('/talent-pool-manager')}>
                        Review All <ChevronRight size={12} />
                      </CardAction>
                    </CardHeader>
                    <AttentionBody>
                      {needsAttention.map(job => (
                        <AttentionRow key={job.id} onClick={() => navigate(`/jobs-management/${job.id}`)}>
                          <AttentionDot />
                          <AttentionTitle>{job.title}</AttentionTitle>
                          {job.city && <AttentionCity>{job.city}</AttentionCity>}
                          <AttentionBadge>+{job.new_candidate_count} new</AttentionBadge>
                          <ChevronRight size={13} color="#404858" />
                        </AttentionRow>
                      ))}
                    </AttentionBody>
                  </Card>
                </SectionWrap>
              )}

              {/* ── Get Started (new users only) ── */}
              {!loading && activeJobs.length === 0 && (
                <GetStartedCard>
                  <GetStartedHeading>Welcome to Talos — let's get you set up</GetStartedHeading>
                  <GetStartedSub>Three steps to start receiving and ranking HVAC applicants.</GetStartedSub>
                  <StepList>
                    <StepRow state="done">
                      <StepIcon state="done">✓</StepIcon>
                      <StepText>
                        <StepTitle state="done">Create your account</StepTitle>
                        <StepDesc>You're in. Your company profile is ready.</StepDesc>
                      </StepText>
                    </StepRow>
                    <StepRow state="active">
                      <StepIcon state="active">2</StepIcon>
                      <StepText>
                        <StepTitle state="active">Create your first job posting</StepTitle>
                        <StepDesc>Set up a position — Talos generates a public application link automatically.</StepDesc>
                      </StepText>
                      <StepBtn onClick={() => navigate('/jobs-management?new=true')}>Create Job →</StepBtn>
                    </StepRow>
                    <StepRow state="locked">
                      <StepIcon state="locked">3</StepIcon>
                      <StepText>
                        <StepTitle state="locked">Share your link &amp; review applicants</StepTitle>
                        <StepDesc>Create a job first — your shareable application link will appear at the top of the job detail panel.</StepDesc>
                      </StepText>
                    </StepRow>
                  </StepList>
                </GetStartedCard>
              )}

              {/* ── Jobs ── */}
              <SectionWrap>
                <Card>
                  <CardHeader>
                    <CardTitle>Job Postings</CardTitle>
                    <CardAction onClick={() => navigate('/jobs-management')}>
                      Manage <ChevronRight size={12} />
                    </CardAction>
                  </CardHeader>
                  {activeJobs.length === 0 ? (
                    <EmptyCell>
                      No job postings yet.
                      <EmptyActionBtn onClick={() => navigate('/jobs-management')}>
                        Create First Job
                      </EmptyActionBtn>
                    </EmptyCell>
                  ) : (
                    <JobsBody>
                      {activeJobs.map(job => {
                        const jobCandidates = candidatesByJob[job.id] ?? [];
                        return (
                          <JobTile key={job.id} onClick={() => navigate(`/jobs-management/${job.id}`)}>
                            <JobTileTitle>
                              {job.title}
                              {job.new_candidate_count > 0 && (
                                <NewPill>+{job.new_candidate_count}</NewPill>
                              )}
                            </JobTileTitle>
                            <JobTileMeta>
                              {job.city && (
                                <JobMetaItem>
                                  <MapPin size={11} color="#6e7d8e" />{job.city}
                                </JobMetaItem>
                              )}
                              {job.job_type && (
                                <JobMetaItem>
                                  <Clock size={11} color="#6e7d8e" />{job.job_type}
                                </JobMetaItem>
                              )}
                            </JobTileMeta>
                            <JobTileFooter>
                              <CandidateCount hasData={job.candidate_count > 0}>
                                {job.candidate_count > 0
                                  ? `${job.candidate_count} candidate${job.candidate_count !== 1 ? 's' : ''}`
                                  : 'No candidates yet'}
                              </CandidateCount>
                              <ChevronRight size={13} color="#404858" />
                            </JobTileFooter>
                            {jobCandidates.length > 0 && (
                              <JobCandidateList>
                                {jobCandidates.map(c => (
                                  <JobCandidateRow key={c.pipeline_id} onClick={e => { e.stopPropagation(); navigate(`/candidates/${c.pipeline_id}`, { state: { from: '/dashboard' } }); }}>
                                    <TierChip tier={c.tier}>{c.tier.toUpperCase()}</TierChip>
                                    <JobCandidateName>{friendlyName(c.filename)}</JobCandidateName>
                                    <JobCandidateScore>{c.tier_score}/100</JobCandidateScore>
                                  </JobCandidateRow>
                                ))}
                              </JobCandidateList>
                            )}
                          </JobTile>
                        );
                      })}
                    </JobsBody>
                  )}
                </Card>
              </SectionWrap>

              {/* ── Top Candidates ── */}
              <SectionWrap>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Candidates</CardTitle>
                    <CardAction onClick={() => navigate('/talent-pool-manager')}>
                      View All <ChevronRight size={12} />
                    </CardAction>
                  </CardHeader>
                  {topCandidates.length === 0 ? (
                    <EmptyCell>
                      No candidates yet.
                      <EmptyActionBtn onClick={() => navigate('/resume-analysis')}>
                        Upload Resumes
                      </EmptyActionBtn>
                    </EmptyCell>
                  ) : (
                    <CandidatesBody>
                      {topCandidates.map(c => (
                        <CandidateItem key={c.pipeline_id} onClick={() => navigate(`/candidates/${c.pipeline_id}`, { state: { from: '/dashboard' } })}>
                          <TierChip tier={c.tier}>{c.tier.toUpperCase()}</TierChip>
                          <CandidateNameText>{friendlyName(c.filename)}</CandidateNameText>
                          <CandidateJobText>{c.job_title}</CandidateJobText>
                          <CandidateScore>{c.tier_score}/100</CandidateScore>
                        </CandidateItem>
                      ))}
                    </CandidatesBody>
                  )}
                </Card>
              </SectionWrap>
            </>
          )}
        </Inner>
      </Page>
    </>
  );
};

export default ClientDashboard;
