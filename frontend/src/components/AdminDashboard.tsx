import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Users, Briefcase, UserCheck, TrendingUp, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { getAuthHeaders, isAdmin } from '../utils/auth';
import { config as appConfig } from '../config';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  font-family: 'Sora', sans-serif;
  padding: 0 0 5rem;
  color: #e0e6f0;
`;

const TopBar = styled.div`
  border-bottom: 1px solid #232830;
  padding: 1.75rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #111318;
  position: sticky;
  top: 0;
  z-index: 50;

  @media (max-width: 600px) { padding: 1.25rem 1.25rem; }
`;

const TopBarTitle = styled.h1`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
`;

const AdminBadge = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 0.25rem 0.6rem;
  color: #a78bfa;
  background: rgba(167,139,250,0.08);
  border: 1px solid rgba(167,139,250,0.2);
  text-transform: uppercase;
`;

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 2.5rem 0;
  animation: ${fadeUp} 0.4s ease both;

  @media (max-width: 768px) { padding: 1.5rem 1rem 0; }
`;

const SectionTitle = styled.h2`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 1rem;
`;

// ── stats cards ──────────────────────────────────────────────────────────────

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; }
`;

const StatCard = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

const StatValue = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
`;

const StatSub = styled.span`
  font-size: 0.68rem;
  color: #4ade80;
  font-family: 'JetBrains Mono', monospace;
`;

// ── user table ───────────────────────────────────────────────────────────────

const Table = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 40px;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #232830;
  gap: 1rem;

  @media (max-width: 700px) {
    grid-template-columns: 2fr 1fr 1fr 40px;
  }
`;

const TableRow = styled.div<{ expanded?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 40px;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #1e2330;
  gap: 1rem;
  align-items: center;
  cursor: pointer;
  transition: background 0.12s ease;

  &:hover { background: rgba(255,255,255,0.02); }
  &:last-child { border-bottom: none; }

  @media (max-width: 700px) {
    grid-template-columns: 2fr 1fr 1fr 40px;
  }
`;

const ColHead = styled.span`
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4e5d6e;
`;

const Cell = styled.span`
  font-size: 0.8rem;
  color: #c8d0dc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CellMono = styled(Cell)`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
`;

const HideMobile = styled.span`
  @media (max-width: 700px) { display: none; }
`;

const ExpandBtn = styled.button`
  background: transparent;
  border: none;
  color: #4e5d6e;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.12s;

  &:hover { color: #8a9ab0; }
`;

const ExpandedPanel = styled.div`
  background: #151a24;
  border-bottom: 1px solid #1e2330;
  padding: 1rem 1.5rem 1.25rem;
  animation: ${fadeUp} 0.2s ease both;
`;

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const JobRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.78rem;
  color: #8a9ab0;
`;

const JobTitle = styled.span`
  color: #c8d0dc;
  font-weight: 500;
  min-width: 180px;
`;

const JobMeta = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: #4e5d6e;
`;

const StatusDot = styled.span<{ status: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${p =>
    p.status === 'active' ? '#4ade80' :
    p.status === 'paused' ? '#fbbf24' : '#4e5d6e'};
`;

const EmptyNote = styled.div`
  font-size: 0.75rem;
  color: #4e5d6e;
  font-family: 'JetBrains Mono', monospace;
  padding: 0.5rem 0;
`;

const CenterMsg = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: #6e7d8e;
  letter-spacing: 0.08em;
`;

// ── types ────────────────────────────────────────────────────────────────────

interface Overview {
  total_companies: string;
  total_jobs: string;
  total_candidates: string;
  new_signups_7d: string;
  new_candidates_7d: string;
}

interface UserRow {
  id: number;
  email: string;
  company_name: string | null;
  created_at: string;
  job_count: string;
  candidate_count: string;
  last_job_posted_at: string | null;
}

interface JobRow {
  id: number;
  title: string;
  city: string | null;
  status: string;
  created_at: string;
  candidate_count: string;
}

// ── component ────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [userJobs, setUserJobs] = useState<Record<number, JobRow[]>>({});

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    Promise.all([
      fetch(`${appConfig.apiUrl}/api/admin/overview`, { headers }).then(r => r.json()),
      fetch(`${appConfig.apiUrl}/api/admin/users`, { headers }).then(r => r.json()),
    ]).then(([ov, us]) => {
      if (ov.status === 'success') setOverview(ov.data);
      if (us.status === 'success') setUsers(us.data);
    }).finally(() => setLoading(false));
  }, [navigate]);

  const toggleUser = async (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    if (userJobs[userId]) return;
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    const res = await fetch(`${appConfig.apiUrl}/api/admin/users/${userId}/jobs`, { headers });
    const data = await res.json();
    if (data.status === 'success') {
      setUserJobs(prev => ({ ...prev, [userId]: data.data }));
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Page>
      <TopBar>
        <TopBarTitle>Admin Dashboard</TopBarTitle>
        <AdminBadge>Admin</AdminBadge>
      </TopBar>

      <Inner>
        {loading && <CenterMsg>Loading...</CenterMsg>}

        {!loading && overview && (
          <>
            <SectionTitle>Platform Overview</SectionTitle>
            <StatsGrid>
              <StatCard>
                <Users size={16} color="#6e7d8e" />
                <StatValue>{overview.total_companies}</StatValue>
                <StatLabel>Companies</StatLabel>
                {parseInt(overview.new_signups_7d) > 0 && (
                  <StatSub>+{overview.new_signups_7d} this week</StatSub>
                )}
              </StatCard>
              <StatCard>
                <Briefcase size={16} color="#6e7d8e" />
                <StatValue>{overview.total_jobs}</StatValue>
                <StatLabel>Active Jobs</StatLabel>
              </StatCard>
              <StatCard>
                <UserCheck size={16} color="#6e7d8e" />
                <StatValue>{overview.total_candidates}</StatValue>
                <StatLabel>Total Applicants</StatLabel>
                {parseInt(overview.new_candidates_7d) > 0 && (
                  <StatSub>+{overview.new_candidates_7d} this week</StatSub>
                )}
              </StatCard>
              <StatCard>
                <TrendingUp size={16} color="#6e7d8e" />
                <StatValue>
                  {overview.total_companies === '0' ? '—' :
                    Math.round(parseInt(overview.total_candidates) / parseInt(overview.total_companies))}
                </StatValue>
                <StatLabel>Avg Applicants / Co.</StatLabel>
              </StatCard>
            </StatsGrid>

            <SectionTitle>Companies</SectionTitle>
            <Table>
              <TableHeader>
                <ColHead>Company / Email</ColHead>
                <HideMobile><ColHead>Joined</ColHead></HideMobile>
                <ColHead>Jobs</ColHead>
                <ColHead>Applicants</ColHead>
                <HideMobile><ColHead>Last Job</ColHead></HideMobile>
                <span />
              </TableHeader>

              {users.map(user => (
                <React.Fragment key={user.id}>
                  <TableRow onClick={() => toggleUser(user.id)}>
                    <div style={{ overflow: 'hidden' }}>
                      <Cell style={{ display: 'block', color: '#ffffff', fontWeight: 600 }}>
                        {user.company_name || <span style={{ color: '#4e5d6e', fontStyle: 'italic' }}>No company name</span>}
                      </Cell>
                      <Cell style={{ display: 'block', fontSize: '0.7rem', color: '#6e7d8e', marginTop: 2 }}>
                        {user.email}
                      </Cell>
                    </div>
                    <HideMobile>
                      <CellMono>{fmt(user.created_at)}</CellMono>
                    </HideMobile>
                    <CellMono>{user.job_count}</CellMono>
                    <CellMono>{user.candidate_count}</CellMono>
                    <HideMobile>
                      <CellMono>{user.last_job_posted_at ? fmt(user.last_job_posted_at) : '—'}</CellMono>
                    </HideMobile>
                    <ExpandBtn>
                      {expandedUser === user.id
                        ? <ChevronDown size={16} />
                        : <ChevronRight size={16} />}
                    </ExpandBtn>
                  </TableRow>

                  {expandedUser === user.id && (
                    <ExpandedPanel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4e5d6e' }}>
                          Jobs
                        </span>
                        <a
                          href={`/jobs-management`}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: '#4e5d6e', textDecoration: 'none' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink size={11} />
                        </a>
                      </div>
                      {userJobs[user.id] === undefined ? (
                        <EmptyNote>Loading...</EmptyNote>
                      ) : userJobs[user.id].length === 0 ? (
                        <EmptyNote>No jobs posted yet.</EmptyNote>
                      ) : (
                        <JobList>
                          {userJobs[user.id].map(job => (
                            <JobRow key={job.id}>
                              <StatusDot status={job.status} />
                              <JobTitle>{job.title}</JobTitle>
                              {job.city && <JobMeta>{job.city}</JobMeta>}
                              <JobMeta>{job.candidate_count} applicants</JobMeta>
                              <JobMeta>{fmt(job.created_at)}</JobMeta>
                            </JobRow>
                          ))}
                        </JobList>
                      )}
                    </ExpandedPanel>
                  )}
                </React.Fragment>
              ))}

              {users.length === 0 && (
                <CenterMsg>No companies signed up yet.</CenterMsg>
              )}
            </Table>
          </>
        )}
      </Inner>
    </Page>
  );
};

export default AdminDashboard;
