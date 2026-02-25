import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Briefcase, Users, Star, CheckCircle, MapPin, Clock, ChevronRight, TrendingUp, AlertCircle, UserCheck } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { config as appConfig } from '../config';

// ─── helpers ────────────────────────────────────────────────────────────────

function decodeEmail(): string {
  try {
    const token = localStorage.getItem('talos_auth_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.email || '';
  } catch {
    return '';
  }
}

// ─── styled components ───────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: #000;
  padding: 2.5rem 2rem 4rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const Welcome = styled.div`
  margin-bottom: 2.5rem;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.25rem;
`;

const WelcomeSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 10px;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`;

const StatValue = styled.span`
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
`;

const StatIcon = styled.div<{ color: string }>`
  color: ${p => p.color};
  margin-bottom: 0.15rem;
`;

// ─── Pipeline Funnel ─────────────────────────────────────────────────────────

const FunnelCard = styled.div`
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
`;

const FunnelTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1.25rem;
`;

const FunnelRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const FunnelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FunnelLabel = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  width: 80px;
  flex-shrink: 0;
`;

const FunnelBarWrap = styled.div`
  flex: 1;
  background: #1a1a1a;
  border-radius: 4px;
  height: 22px;
  overflow: hidden;
`;

const FunnelBar = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${p => p.width}%;
  background: ${p => p.color};
  border-radius: 4px;
  min-width: ${p => (p.width > 0 ? '4px' : '0')};
  transition: width 0.5s ease;
`;

const FunnelCount = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #e0e0e0;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
`;

// ─── Needs Attention ─────────────────────────────────────────────────────────

const Section = styled.div`
  margin-bottom: 2.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e0e0;
`;

const ViewAllButton = styled.button`
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #4ade80;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: #4ade80;
  }
`;

const AttentionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const AttentionRow = styled.div`
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 8px;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #f59e0b;
  }
`;

const AttentionJobTitle = styled.span`
  flex: 1;
  font-size: 0.9rem;
  color: #e0e0e0;
  font-weight: 600;
`;

const NewBadge = styled.span`
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
`;

const AttentionMeta = styled.span`
  font-size: 0.78rem;
  color: #6b7280;
`;

// ─── Jobs Grid ───────────────────────────────────────────────────────────────

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const JobCard = styled.div`
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    border-color: #4ade80;
    background: #0d1a10;
  }
`;

const JobCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
`;

const JobTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
`;

const JobMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
`;

const JobMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #6b7280;
  font-size: 0.82rem;
`;

const JobFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #1f1f1f;
`;

const CandidateCount = styled.span`
  font-size: 0.8rem;
  color: #4ade80;
  font-weight: 600;
`;

const TierBadge = styled.span<{ tier: 'green' | 'yellow' | 'red' }>`
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${p => p.tier === 'green' ? 'rgba(74,222,128,0.15)' : p.tier === 'yellow' ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)'};
  color: ${p => p.tier === 'green' ? '#4ade80' : p.tier === 'yellow' ? '#fbbf24' : '#f87171'};
`;

const CandidatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const CandidateRow = styled.div`
  background: #111;
  border: 1px solid #1f1f1f;
  border-radius: 8px;
  padding: 0.9rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CandidateName = styled.span`
  flex: 1;
  font-size: 0.9rem;
  color: #e0e0e0;
  font-weight: 600;
`;

const CandidateJob = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
  margin-right: auto;
`;

const Score = styled.span`
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
`;

const EmptyState = styled.div`
  background: #111;
  border: 1px dashed #2a2a2a;
  border-radius: 10px;
  padding: 2.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
`;

const ActionButton = styled.button`
  background: #4ade80;
  border: none;
  color: #000;
  padding: 0.65rem 1.5rem;
  border-radius: 7px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;

  &:hover { background: #5ce08e; }
`;

const LoadingText = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  padding: 1rem 0;
`;

// ─── types ───────────────────────────────────────────────────────────────────

interface Job {
  id: number;
  title: string;
  city: string;
  job_type: string;
  status: string;
  candidate_count: number;
  new_candidate_count: number;
}

interface Stats {
  total: number;
  tierDistribution: { green: number; yellow: number; red: number };
  statusBreakdown: { new: number; approved: number; contacted: number; backup: number; rejected: number };
}

interface Candidate {
  pipeline_id: number;
  filename: string;
  tier: 'green' | 'yellow' | 'red';
  tier_score: number;
  job_title: string;
}

function friendlyName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// ─── pipeline funnel config ───────────────────────────────────────────────────

const FUNNEL_STAGES = [
  { key: 'new',      label: 'New',      color: '#60a5fa' },
  { key: 'approved', label: 'Approved', color: '#4ade80' },
  { key: 'contacted',label: 'Contacted',color: '#a78bfa' },
  { key: 'backup',   label: 'Backup',   color: '#f59e0b' },
  { key: 'rejected', label: 'Rejected', color: '#f87171' },
] as const;

// ─── component ───────────────────────────────────────────────────────────────

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const email = decodeEmail();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [topCandidates, setTopCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    const base = appConfig.apiUrl;

    Promise.all([
      fetch(`${base}/api/jobs`, { headers }).then(r => r.json()),
      fetch(`${base}/api/pipeline/talent-pool/stats`, { headers }).then(r => r.json()),
      fetch(`${base}/api/pipeline/talent-pool?limit=8&sortBy=score&sortOrder=desc`, { headers }).then(r => r.json()),
    ]).then(([jobsRes, statsRes, candidatesRes]) => {
      if (jobsRes.status === 'success') setJobs(jobsRes.data.jobs ?? []);
      if (statsRes.status === 'success') setStats(statsRes.data);
      if (candidatesRes.status === 'success') setTopCandidates(candidatesRes.data.candidates ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter(j => j.status !== 'deleted');
  const needsAttention = activeJobs.filter(j => j.new_candidate_count > 0)
    .sort((a, b) => b.new_candidate_count - a.new_candidate_count);

  const statusTotal = stats
    ? Object.values(stats.statusBreakdown).reduce((sum, v) => sum + v, 0)
    : 0;

  return (
    <Page>
      <Welcome>
        <WelcomeTitle>Welcome back</WelcomeTitle>
        <WelcomeSubtitle>{email}</WelcomeSubtitle>
      </Welcome>

      {loading ? (
        <LoadingText>Loading your dashboard...</LoadingText>
      ) : (
        <>
          {/* Stats */}
          <StatsRow>
            <StatCard>
              <StatIcon color="#4ade80"><Briefcase size={18} /></StatIcon>
              <StatLabel>Active Jobs</StatLabel>
              <StatValue>{activeJobs.length}</StatValue>
            </StatCard>
            <StatCard>
              <StatIcon color="#60a5fa"><Users size={18} /></StatIcon>
              <StatLabel>Total Candidates</StatLabel>
              <StatValue>{stats?.total ?? 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatIcon color="#4ade80"><Star size={18} /></StatIcon>
              <StatLabel>Top Tier</StatLabel>
              <StatValue>{stats?.tierDistribution.green ?? 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatIcon color="#f59e0b"><AlertCircle size={18} /></StatIcon>
              <StatLabel>Pending Review</StatLabel>
              <StatValue>{stats?.statusBreakdown.new ?? 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatIcon color="#a78bfa"><UserCheck size={18} /></StatIcon>
              <StatLabel>Approved</StatLabel>
              <StatValue>{stats?.statusBreakdown.approved ?? 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatIcon color="#34d399"><CheckCircle size={18} /></StatIcon>
              <StatLabel>Contacted</StatLabel>
              <StatValue>{stats?.statusBreakdown.contacted ?? 0}</StatValue>
            </StatCard>
          </StatsRow>

          {/* Pipeline Funnel */}
          {stats && statusTotal > 0 && (
            <FunnelCard>
              <FunnelTitle>Candidate Pipeline</FunnelTitle>
              <FunnelRows>
                {FUNNEL_STAGES.map(stage => {
                  const count = stats.statusBreakdown[stage.key];
                  const pct = statusTotal > 0 ? Math.round((count / statusTotal) * 100) : 0;
                  return (
                    <FunnelRow key={stage.key}>
                      <FunnelLabel>{stage.label}</FunnelLabel>
                      <FunnelBarWrap>
                        <FunnelBar width={pct} color={stage.color} />
                      </FunnelBarWrap>
                      <FunnelCount>{count}</FunnelCount>
                    </FunnelRow>
                  );
                })}
              </FunnelRows>
            </FunnelCard>
          )}

          {/* Needs Attention */}
          {needsAttention.length > 0 && (
            <Section>
              <SectionHeader>
                <SectionTitle>Needs Attention</SectionTitle>
                <ViewAllButton onClick={() => navigate('/talent-pool-manager')}>
                  Review All <ChevronRight size={14} />
                </ViewAllButton>
              </SectionHeader>
              <AttentionList>
                {needsAttention.map(job => (
                  <AttentionRow key={job.id} onClick={() => navigate('/jobs-management')}>
                    <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <AttentionJobTitle>{job.title}</AttentionJobTitle>
                    {job.city && <AttentionMeta>{job.city}</AttentionMeta>}
                    <NewBadge>{job.new_candidate_count} new</NewBadge>
                    <ChevronRight size={14} color="#4b5563" />
                  </AttentionRow>
                ))}
              </AttentionList>
            </Section>
          )}

          {/* Jobs */}
          <Section>
            <SectionHeader>
              <SectionTitle>Your Job Postings</SectionTitle>
              <ViewAllButton onClick={() => navigate('/jobs-management')}>
                Manage Jobs <ChevronRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            {activeJobs.length === 0 ? (
              <EmptyState>
                No job postings yet.
                <br />
                <ActionButton onClick={() => navigate('/jobs-management')}>Create Your First Job</ActionButton>
              </EmptyState>
            ) : (
              <JobsGrid>
                {activeJobs.map(job => (
                  <JobCard key={job.id} onClick={() => navigate('/jobs-management')}>
                    <JobCardHeader>
                      <JobTitle>{job.title}</JobTitle>
                      {job.new_candidate_count > 0 && (
                        <NewBadge>{job.new_candidate_count} new</NewBadge>
                      )}
                    </JobCardHeader>
                    <JobMeta>
                      {job.city && (
                        <JobMetaRow>
                          <MapPin size={12} />
                          {job.city}
                        </JobMetaRow>
                      )}
                      {job.job_type && (
                        <JobMetaRow>
                          <Clock size={12} />
                          {job.job_type}
                        </JobMetaRow>
                      )}
                    </JobMeta>
                    <JobFooter>
                      <CandidateCount>
                        <TrendingUp size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {job.candidate_count > 0
                          ? `${job.candidate_count} candidate${job.candidate_count !== 1 ? 's' : ''}`
                          : 'No candidates yet'}
                      </CandidateCount>
                      <ChevronRight size={14} color="#4b5563" />
                    </JobFooter>
                  </JobCard>
                ))}
              </JobsGrid>
            )}
          </Section>

          {/* Top Candidates */}
          <Section>
            <SectionHeader>
              <SectionTitle>Top Candidates</SectionTitle>
              <ViewAllButton onClick={() => navigate('/talent-pool-manager')}>
                View All <ChevronRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            {topCandidates.length === 0 ? (
              <EmptyState>No candidates yet. Upload resumes to get started.</EmptyState>
            ) : (
              <CandidatesList>
                {topCandidates.map(c => (
                  <CandidateRow key={c.pipeline_id}>
                    <TierBadge tier={c.tier}>{c.tier.toUpperCase()}</TierBadge>
                    <CandidateName>{friendlyName(c.filename)}</CandidateName>
                    <CandidateJob>{c.job_title}</CandidateJob>
                    <Score>{c.tier_score}/100</Score>
                  </CandidateRow>
                ))}
              </CandidatesList>
            )}
          </Section>
        </>
      )}
    </Page>
  );
};

export default ClientDashboard;
