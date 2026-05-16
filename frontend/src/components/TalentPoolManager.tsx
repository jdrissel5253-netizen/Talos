import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { config } from '../config';
import { getAuthHeaders, handleUnauthorized } from '../utils/auth';
import { FileText, CheckCircle, AlertCircle, XCircle, Star, Calendar, Car, ClipboardList, Mail, Smartphone, X, Trash2, ChevronDown, ChevronRight, LayoutGrid, LayoutList } from 'lucide-react';
import ResumePreviewModal from './ResumePreviewModal';
import ResumeFileModal from './ResumeFileModal';
import ContactRejectionModal from './ContactRejectionModal';
import { extractCandidateName } from '../utils/templateHelpers';

interface Candidate {
  pipeline_id: number;
  candidate_id: number;
  job_id: number;
  tier: 'green' | 'yellow' | 'red';
  tier_score: number;
  star_rating: number;
  pipeline_status: string;
  give_them_a_chance: boolean;
  vehicle_status: string;
  ai_summary: string;
  contacted_via: string | null;
  contacted_at: string | null;
  filename: string;
  file_path: string;
  candidate_status: string;
  uploaded_at: string;
  overall_score: number;
  score_out_of_10: number;
  summary: string;
  years_of_experience: number;
  certifications_found: string[];
  hiring_recommendation: string;
  strengths: string[];
  weaknesses: string[];
  job_title: string;
  position_type: string;
  job_location: string;
  jobs_applied: number;
}

interface ApplicationEntry {
  pipeline_id: number;
  job_title: string;
  position_type: string;
  tier: 'green' | 'yellow' | 'red';
  tier_score: number;
  pipeline_status: string;
  applied_at: string;
}

interface TalentPoolStats {
  total: number;
  tierDistribution: {
    green?: number;
    yellow?: number;
    red?: number;
  };
  positionBreakdown: { [key: string]: number };
  statusBreakdown: { [key: string]: number };
  averageScoreByTier: {
    [key: string]: {
      avgScore: number;
      count: number;
    };
  };
}

const Container = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  padding: 2rem;
`;

const MainCard = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 2.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin-bottom: 2.5rem;
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: #555;
  font-size: 0.9375rem;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ active?: boolean; tier?: 'green' | 'yellow' | 'red' | 'total' }>`
  background: #0a0a0a;
  padding: 1.25rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
  border: 1px solid ${p => {
    if (!p.active) return 'rgba(255, 255, 255, 0.07)';
    if (p.tier === 'green') return 'rgba(74, 222, 128, 0.5)';
    if (p.tier === 'yellow') return 'rgba(251, 191, 36, 0.5)';
    if (p.tier === 'red') return 'rgba(239, 68, 68, 0.5)';
    return 'rgba(255, 255, 255, 0.3)';
  }};
  background: ${p => {
    if (!p.active) return '#0a0a0a';
    if (p.tier === 'green') return 'rgba(74, 222, 128, 0.06)';
    if (p.tier === 'yellow') return 'rgba(251, 191, 36, 0.06)';
    if (p.tier === 'red') return 'rgba(239, 68, 68, 0.06)';
    return 'rgba(255, 255, 255, 0.04)';
  }};

  &:hover {
    border-color: ${p => {
      if (p.tier === 'green') return 'rgba(74, 222, 128, 0.4)';
      if (p.tier === 'yellow') return 'rgba(251, 191, 36, 0.4)';
      if (p.tier === 'red') return 'rgba(239, 68, 68, 0.4)';
      return 'rgba(255, 255, 255, 0.2)';
    }};
  }
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #555;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
`;

const StatValue = styled.div<{ tier?: 'green' | 'yellow' | 'red' | 'total' }>`
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1;
  color: ${p => {
    if (p.tier === 'yellow') return '#fbbf24';
    if (p.tier === 'red') return '#ef4444';
    return '#4ade80';
  }};
`;

const FilterSection = styled.div`
  background: #0a0a0a;
  padding: 1.25rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: #4ade80;
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  color: #a3a3a3;
  border: 1px solid rgba(255, 255, 255, 0.09);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.09);
    color: #e0e0e0;
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const GoogleConnectButton = styled.button<{ connected: boolean }>`
  background: ${props => props.connected ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255,255,255,0.05)'};
  color: ${props => props.connected ? '#4ade80' : '#a3a3a3'};
  border: 1px solid ${props => props.connected ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.09)'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${props => props.connected ? 'default' : 'pointer'};
  transition: all 0.15s;

  &:hover {
    background: ${props => props.connected ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255,255,255,0.09)'};
    border-color: ${props => props.connected ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)'};
  }
`;

const FilterSelect = styled.select`
  padding: 0.625rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background-color: #161616;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.875rem;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: rgba(74, 222, 128, 0.5);
  }
`;

const FilterInput = styled.input`
  padding: 0.625rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background-color: #161616;
  color: #e0e0e0;
  font-size: 0.875rem;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: rgba(74, 222, 128, 0.5);
  }
`;

const CandidatesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TierSection = styled.div``;

const TierHeader = styled.div<{ tier: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  border-left: 3px solid ${props => {
    if (props.tier === 'green') return '#4ade80';
    if (props.tier === 'yellow') return '#fbbf24';
    return '#ef4444';
  }};
  background: ${props => {
    if (props.tier === 'green') return 'rgba(74,222,128,0.05)';
    if (props.tier === 'yellow') return 'rgba(251,191,36,0.05)';
    return 'rgba(239,68,68,0.05)';
  }};
  border-radius: 0 6px 6px 0;

  font-weight: 600;
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  color: ${props => {
    if (props.tier === 'green') return '#4ade80';
    if (props.tier === 'yellow') return '#fbbf24';
    return '#ef4444';
  }};
`;

const CandidateCard = styled.div`
  background: #0d0d0d;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 0.75rem;
  transition: border-color 0.15s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: rgba(74, 222, 128, 0.25);
  }
`;

const CandidateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.875rem;
`;

const CandidateInfo = styled.div`
  flex: 1;
`;

const CandidateName = styled.h3`
  font-size: 1.0625rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StarRating = styled.span`
  color: #fbbf24;
  font-size: 0.875rem;
`;

const Score = styled.span<{ tier: string }>`
  font-size: 1.375rem;
  font-weight: 700;
  color: ${props => {
    if (props.tier === 'green') return '#4ade80';
    if (props.tier === 'yellow') return '#fbbf24';
    return '#ef4444';
  }};
`;

const Badge = styled.span`
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.25);
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
`;

const Summary = styled.p`
  color: #666;
  line-height: 1.65;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  font-size: 0.8125rem;
  color: #666;
  margin-bottom: 1rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  color: #a3a3a3;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.4rem 0.875rem;
  border-radius: 5px;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    background: rgba(74, 222, 128, 0.1);
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.3);
  }
`;

const JobsBadge = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-left: 0.5rem;
  color: #4ade80;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  opacity: 0.8;
  &:hover { opacity: 1; }
`;

const ApplicationsExpanded = styled.div`
  margin-top: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 0.75rem;
`;

const ApplicationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.5rem;
  border-radius: 5px;
  &:hover { background: rgba(255,255,255,0.03); }
`;

const AppJobTitle = styled.span`
  font-size: 0.875rem;
  color: #ccc;
  flex: 1;
`;

const AppScore = styled.span<{ tier: 'green' | 'yellow' | 'red' }>`
  font-size: 0.875rem;
  font-weight: 700;
  min-width: 2.5rem;
  text-align: right;
  color: ${p => p.tier === 'green' ? '#4ade80' : p.tier === 'yellow' ? '#fbbf24' : '#ef4444'};
`;

const AppStatus = styled.span`
  font-size: 0.75rem;
  color: #555;
  margin-left: 0.75rem;
  text-transform: capitalize;
  min-width: 4rem;
  text-align: right;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 6px;
  overflow: hidden;
`;

const ViewToggleBtn = styled.button<{ active: boolean }>`
  background: ${p => p.active ? 'rgba(74, 222, 128, 0.12)' : 'transparent'};
  color: ${p => p.active ? '#4ade80' : '#555'};
  border: none;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
  &:hover { color: ${p => p.active ? '#4ade80' : '#999'}; }
`;

const CompactRow = styled.div`
  display: grid;
  grid-template-columns: 2.75rem 1fr auto auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.12s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(74, 222, 128, 0.15);
  }
`;

const CompactScore = styled.span<{ tier: string }>`
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  color: ${p => p.tier === 'green' ? '#4ade80' : p.tier === 'yellow' ? '#fbbf24' : '#ef4444'};
`;

const CompactNameBlock = styled.div`
  min-width: 0;
`;

const CompactName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const CompactSub = styled.div`
  font-size: 0.75rem;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
`;

const CompactStats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #555;
  white-space: nowrap;
`;

const CompactStatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const CompactStatusBadge = styled.span<{ status: string }>`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  text-transform: capitalize;
  white-space: nowrap;
  background: ${p => {
    if (p.status === 'approved') return 'rgba(74,222,128,0.1)';
    if (p.status === 'contacted') return 'rgba(59,130,246,0.1)';
    if (p.status === 'rejected') return 'rgba(239,68,68,0.1)';
    if (p.status === 'backup') return 'rgba(251,191,36,0.1)';
    return 'rgba(255,255,255,0.05)';
  }};
  color: ${p => {
    if (p.status === 'approved') return '#4ade80';
    if (p.status === 'contacted') return '#60a5fa';
    if (p.status === 'rejected') return '#f87171';
    if (p.status === 'backup') return '#fbbf24';
    return '#666';
  }};
`;

const CompactActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const CompactApplicationsExpanded = styled.div`
  grid-column: 1 / -1;
  padding: 0.35rem 0.75rem 0.35rem 3.5rem;
  border-top: 1px solid rgba(255,255,255,0.04);
`;

const ActionIcon = styled.button<{ color: string }>`
  background: transparent;
  color: ${props => props.color};
  border: 1px solid ${props => props.color}40;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.color}18;
    border-color: ${props => props.color}80;
  }
`;

const MessageDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  background: #1a1a1a;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  border-radius: 7px;
  z-index: 10;
  right: 0;
  top: calc(100% + 6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  color: #a3a3a3;
  padding: 0.7rem 1rem;
  text-align: left;
  cursor: pointer;
  width: 100%;
  font-size: 0.875rem;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e0e0e0;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #555;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  background: rgba(220, 38, 38, 0.1);
  color: #f87171;
  border: 1px solid rgba(220, 38, 38, 0.25);
  padding: 0.875rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #555;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.4;
`;

const TalentPoolManager: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<TalentPoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resume File Modal State
  const [resumeFileCandidate, setResumeFileCandidate] = useState<{ id: number; filename: string } | null>(null);
  const [isResumeFileModalOpen, setIsResumeFileModalOpen] = useState(false);

  // Quick Summary Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Contact Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedCandidateForContact, setSelectedCandidateForContact] = useState<{ pipelineId: number; name: string; position: string; } | null>(null);
  const [contactMode, setContactMode] = useState<'contact' | 'rejection'>('contact');
  const [contactCommunicationType, setContactCommunicationType] = useState<'email' | 'sms'>('email');
  const [messageDropdownOpen, setMessageDropdownOpen] = useState<number | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');

  // Applications expand
  const [expandedPipelineId, setExpandedPipelineId] = useState<number | null>(null);
  const [personApplications, setPersonApplications] = useState<{ [pipelineId: number]: ApplicationEntry[] }>({});
  const [loadingApplications, setLoadingApplications] = useState<number | null>(null);

  // Gmail Connection
  const [isGmailConnected, setIsGmailConnected] = useState(false);

  // Filters
  const [tierFilter, setTierFilter] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  useEffect(() => {
    fetchTalentPool();
    fetchStats();
    checkGmailConnection();
  }, [tierFilter, positionFilter, statusFilter, minScore, maxScore, sortBy, sortOrder]);

  useEffect(() => {
    if (searchParams.get('gmail_connected')) {
      checkGmailConnection();
      navigate('/talent-pool', { replace: true });
    }
  }, [searchParams]);

  const checkGmailConnection = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/google/status`);
      const data = await response.json();
      if (data.status === 'success') {
        setIsGmailConnected(data.data.isConnected);
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
    }
  };

  const handleConnectGmail = () => {
    window.location.href = `${config.apiUrl}/api/auth/google/url?return=/talent-pool`;
  };

  const fetchTalentPool = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (tierFilter) params.append('tier', tierFilter);
      if (positionFilter) params.append('position', positionFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (minScore) params.append('minScore', minScore);
      if (maxScore) params.append('maxScore', maxScore);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const response = await fetch(`${config.apiUrl}/api/pipeline/talent-pool?${params.toString()}`, { headers: getAuthHeaders() });
      if (handleUnauthorized(response)) return;
      const data = await response.json();

      if (data.status === 'success') {
        setCandidates(data.data.candidates);
        setError(null);
      } else {
        setError('Failed to load talent pool');
      }
    } catch (err) {
      console.error('Error fetching talent pool:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/pipeline/talent-pool/stats`, { headers: getAuthHeaders() });
      if (handleUnauthorized(response)) return;
      const data = await response.json();

      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleToggleApplications = async (pipelineId: number) => {
    if (expandedPipelineId === pipelineId) {
      setExpandedPipelineId(null);
      return;
    }
    setExpandedPipelineId(pipelineId);
    if (personApplications[pipelineId]) return;
    setLoadingApplications(pipelineId);
    try {
      const res = await fetch(`${config.apiUrl}/api/pipeline/person-applications/${pipelineId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPersonApplications(prev => ({ ...prev, [pipelineId]: data.data }));
      }
    } finally {
      setLoadingApplications(null);
    }
  };

  const handleViewResume = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsResumeModalOpen(true);
  };

  const handleSendMessage = (candidatePipelineId: number, messageType: string) => {
    // Find the candidate
    const candidate = candidates.find(c => c.pipeline_id === candidatePipelineId);
    if (!candidate) return;

    // Extract candidate name from filename
    const candidateName = extractCandidateName(candidate.filename || 'Candidate');

    // Set up modal state
    setSelectedCandidateForContact({
      pipelineId: candidatePipelineId,
      name: candidateName,
      position: candidate.job_title || candidate.position_type || 'Position'
    });

    // Determine mode and communication type
    if (messageType === 'rejection_email') {
      setContactMode('rejection');
      setContactCommunicationType('email');
    } else {
      setContactMode('contact');
      setContactCommunicationType(messageType === 'sms' ? 'sms' : 'email');
    }

    // Close dropdown and open modal
    setMessageDropdownOpen(null);
    setContactModalOpen(true);
  };

  const handleRemoveCandidate = async (pipelineId: number) => {
    if (!window.confirm('Remove this candidate from the talent pool?')) return;
    try {
      const response = await fetch(`${config.apiUrl}/api/pipeline/${pipelineId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to remove');
      setCandidates(prev => prev.filter(c => c.pipeline_id !== pipelineId));
      fetchStats();
    } catch (err) {
      console.error('Error removing candidate:', err);
      setError('Failed to remove candidate');
    }
  };

  const handleContactSuccess = () => {
    setContactModalOpen(false);
    setSelectedCandidateForContact(null);
    // Reload candidates and stats to reflect status changes
    fetchTalentPool();
    fetchStats();
  };

  const getStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    return (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ opacity: i < fullStars ? 1 : 0.3 }}>★</span>
        ))}
      </span>
    );
  };

  // Group candidates by tier for display
  const candidatesByTier = {
    green: candidates.filter(c => c.tier === 'green'),
    yellow: candidates.filter(c => c.tier === 'yellow'),
    red: candidates.filter(c => c.tier === 'red')
  };

  const renderCandidateCard = (candidate: Candidate) => (
    <CandidateCard key={candidate.pipeline_id}>
      <CandidateHeader>
        <CandidateInfo>
          <CandidateName>
            {candidate.filename?.replace('.pdf', '') || 'Unknown Candidate'}
            <StarRating>{getStars(candidate.star_rating)}</StarRating>
            {candidate.give_them_a_chance && <Badge>High Potential</Badge>}
          </CandidateName>
          <div style={{ color: '#999', fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {candidate.position_type} • {candidate.job_location || 'Remote/TBD'}
            {candidate.jobs_applied > 1 ? (
              <JobsBadge onClick={() => handleToggleApplications(candidate.pipeline_id)}>
                {expandedPipelineId === candidate.pipeline_id
                  ? <ChevronDown size={13} />
                  : <ChevronRight size={13} />}
                {candidate.jobs_applied} jobs applied
              </JobsBadge>
            ) : (
              <span style={{ marginLeft: '0.5rem', color: '#4ade80', fontSize: '0.8rem', fontWeight: 600, opacity: 0.7 }}>
                · {candidate.job_title}
              </span>
            )}
          </div>
        </CandidateInfo>
        <Score tier={candidate.tier}>{candidate.tier_score}</Score>
      </CandidateHeader>

      <Summary>{candidate.ai_summary}</Summary>

      {expandedPipelineId === candidate.pipeline_id && (
        <ApplicationsExpanded>
          {loadingApplications === candidate.pipeline_id ? (
            <div style={{ color: '#555', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Loading…</div>
          ) : (personApplications[candidate.pipeline_id] || []).map(app => (
            <ApplicationRow key={app.pipeline_id}>
              <AppJobTitle>{app.job_title || app.position_type}</AppJobTitle>
              <AppStatus>{app.pipeline_status}</AppStatus>
              <AppScore tier={app.tier}>{app.tier_score}</AppScore>
            </ApplicationRow>
          ))}
        </ApplicationsExpanded>
      )}

      <MetaRow>
        <MetaItem><Calendar size={16} /> {candidate.years_of_experience} years experience</MetaItem>
        <MetaItem><Car size={16} /> {candidate.vehicle_status?.replace('_', ' ') || 'N/A'}</MetaItem>
        <MetaItem><ClipboardList size={16} /> {candidate.certifications_found?.length || 0} certifications</MetaItem>
      </MetaRow>

      <ActionButtons>
        <ActionButton onClick={() => navigate(`/candidates/${candidate.pipeline_id}`)}>
            <FileText size={16} /> View Profile
          </ActionButton>
          <ActionButton onClick={() => {
            setResumeFileCandidate({ id: candidate.candidate_id, filename: candidate.filename });
            setIsResumeFileModalOpen(true);
          }}>
            Resume
          </ActionButton>
          <ActionButton onClick={() => handleViewResume(candidate)}>
            Quick Summary
          </ActionButton>

        <MessageDropdown>
          <ActionIcon
            color="#3b82f6"
            onClick={() => setMessageDropdownOpen(
              messageDropdownOpen === candidate.pipeline_id ? null : candidate.pipeline_id
            )}
            title="Send Message"
          >
            <Mail size={16} />
          </ActionIcon>
          <DropdownContent isOpen={messageDropdownOpen === candidate.pipeline_id}>
            <DropdownItem onClick={() => handleSendMessage(candidate.pipeline_id, 'sms')}>
              <Smartphone size={14} style={{ marginRight: '8px' }} /> SMS
            </DropdownItem>
            <DropdownItem onClick={() => handleSendMessage(candidate.pipeline_id, 'email')}>
              <Mail size={14} style={{ marginRight: '8px' }} /> Email
            </DropdownItem>
            <DropdownItem onClick={() => handleSendMessage(candidate.pipeline_id, 'rejection_email')}>
              <X size={14} style={{ marginRight: '8px' }} /> Rejection
            </DropdownItem>
          </DropdownContent>
        </MessageDropdown>

        <ActionIcon
          color="#ef4444"
          onClick={() => handleRemoveCandidate(candidate.pipeline_id)}
          title="Remove from talent pool"
        >
          <Trash2 size={16} />
        </ActionIcon>
      </ActionButtons>
    </CandidateCard>
  );

  const renderCompactRow = (candidate: Candidate) => (
    <React.Fragment key={candidate.pipeline_id}>
      <CompactRow>
        <CompactScore tier={candidate.tier}>{candidate.tier_score}</CompactScore>

        <CompactNameBlock>
          <CompactName>
            {candidate.filename?.replace('.pdf', '') || 'Unknown'}
            <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>{getStars(candidate.star_rating)}</span>
            {candidate.give_them_a_chance && (
              <Badge style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>HP</Badge>
            )}
          </CompactName>
          <CompactSub>
            {candidate.position_type} · {candidate.job_location || 'Remote/TBD'}
            {candidate.jobs_applied > 1 ? (
              <JobsBadge onClick={() => handleToggleApplications(candidate.pipeline_id)} style={{ fontSize: '0.72rem' }}>
                {expandedPipelineId === candidate.pipeline_id ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                {candidate.jobs_applied} jobs
              </JobsBadge>
            ) : (
              <span style={{ marginLeft: '0.4rem', color: '#4ade80', fontSize: '0.72rem', fontWeight: 600, opacity: 0.7 }}>
                · {candidate.job_title}
              </span>
            )}
          </CompactSub>
        </CompactNameBlock>

        <CompactStats>
          <CompactStatItem><Calendar size={12} />{candidate.years_of_experience}yr</CompactStatItem>
          <CompactStatItem><ClipboardList size={12} />{candidate.certifications_found?.length || 0}</CompactStatItem>
          <CompactStatItem><Car size={12} />{candidate.vehicle_status === 'has_vehicle' ? '✓' : candidate.vehicle_status === 'no_vehicle' ? '✗' : '?'}</CompactStatItem>
        </CompactStats>

        <CompactStatusBadge status={candidate.pipeline_status}>{candidate.pipeline_status}</CompactStatusBadge>

        <CompactActions>
          <ActionIcon color="#a3a3a3" title="View Profile" onClick={() => navigate(`/candidates/${candidate.pipeline_id}`)}>
            <FileText size={14} />
          </ActionIcon>
          <ActionIcon color="#a3a3a3" title="Resume" onClick={() => {
            setResumeFileCandidate({ id: candidate.candidate_id, filename: candidate.filename });
            setIsResumeFileModalOpen(true);
          }}>
            <ClipboardList size={14} />
          </ActionIcon>
          <MessageDropdown>
            <ActionIcon color="#3b82f6" title="Send Message"
              onClick={() => setMessageDropdownOpen(messageDropdownOpen === candidate.pipeline_id ? null : candidate.pipeline_id)}>
              <Mail size={14} />
            </ActionIcon>
            <DropdownContent isOpen={messageDropdownOpen === candidate.pipeline_id}>
              <DropdownItem onClick={() => handleSendMessage(candidate.pipeline_id, 'sms')}><Smartphone size={14} style={{ marginRight: '8px' }} /> SMS</DropdownItem>
              <DropdownItem onClick={() => handleSendMessage(candidate.pipeline_id, 'email')}><Mail size={14} style={{ marginRight: '8px' }} /> Email</DropdownItem>
              <DropdownItem onClick={() => handleSendMessage(candidate.pipeline_id, 'rejection_email')}><X size={14} style={{ marginRight: '8px' }} /> Rejection</DropdownItem>
            </DropdownContent>
          </MessageDropdown>
          <ActionIcon color="#ef4444" title="Remove" onClick={() => handleRemoveCandidate(candidate.pipeline_id)}>
            <Trash2 size={14} />
          </ActionIcon>
        </CompactActions>
      </CompactRow>

      {expandedPipelineId === candidate.pipeline_id && (
        <CompactApplicationsExpanded>
          {loadingApplications === candidate.pipeline_id ? (
            <div style={{ color: '#555', fontSize: '0.75rem' }}>Loading…</div>
          ) : (personApplications[candidate.pipeline_id] || []).map(app => (
            <ApplicationRow key={app.pipeline_id}>
              <AppJobTitle style={{ fontSize: '0.8rem' }}>{app.job_title || app.position_type}</AppJobTitle>
              <AppStatus>{app.pipeline_status}</AppStatus>
              <AppScore tier={app.tier} style={{ fontSize: '0.8rem' }}>{app.tier_score}</AppScore>
            </ApplicationRow>
          ))}
        </CompactApplicationsExpanded>
      )}
    </React.Fragment>
  );

  return (
    <Container>
      <MainCard>
        <Header>
          <HeaderLeft>
            <Title>Talent Pool</Title>
            <Subtitle>View and manage all candidates in your talent pipeline</Subtitle>
          </HeaderLeft>
          <HeaderActions>
            <ViewToggle>
              <ViewToggleBtn active={viewMode === 'cards'} onClick={() => setViewMode('cards')} title="Card view">
                <LayoutGrid size={15} />
              </ViewToggleBtn>
              <ViewToggleBtn active={viewMode === 'compact'} onClick={() => setViewMode('compact')} title="Compact view">
                <LayoutList size={15} />
              </ViewToggleBtn>
            </ViewToggle>
            <NavButton onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </NavButton>
            <NavButton onClick={() => navigate('/jobs-management')}>
              ← My Jobs
            </NavButton>
            <NavButton onClick={() => navigate('/resume-analysis')}>
              Resume Analyzer
            </NavButton>
            <GoogleConnectButton
              connected={isGmailConnected}
              onClick={!isGmailConnected ? handleConnectGmail : undefined}
            >
              {isGmailConnected ? <CheckCircle size={15} /> : <Mail size={15} />}
              {isGmailConnected ? 'Gmail Connected' : 'Connect Gmail'}
            </GoogleConnectButton>
          </HeaderActions>
        </Header>

        {stats && (
          <StatsGrid>
            <StatCard
              tier="total"
              active={tierFilter === ''}
              onClick={() => setTierFilter('')}
            >
              <StatLabel>Total Candidates</StatLabel>
              <StatValue tier="total">{stats.total}</StatValue>
            </StatCard>
            <StatCard
              tier="green"
              active={tierFilter === 'green'}
              onClick={() => setTierFilter(tierFilter === 'green' ? '' : 'green')}
            >
              <StatLabel>Green Tier</StatLabel>
              <StatValue tier="green">{stats.tierDistribution.green || 0}</StatValue>
            </StatCard>
            <StatCard
              tier="yellow"
              active={tierFilter === 'yellow'}
              onClick={() => setTierFilter(tierFilter === 'yellow' ? '' : 'yellow')}
            >
              <StatLabel>Yellow Tier</StatLabel>
              <StatValue tier="yellow">{stats.tierDistribution.yellow || 0}</StatValue>
            </StatCard>
            <StatCard
              tier="red"
              active={tierFilter === 'red'}
              onClick={() => setTierFilter(tierFilter === 'red' ? '' : 'red')}
            >
              <StatLabel>Red Tier</StatLabel>
              <StatValue tier="red">{stats.tierDistribution.red || 0}</StatValue>
            </StatCard>
          </StatsGrid>
        )}

        <FilterSection>
          <FilterGrid>
            <FilterGroup>
              <FilterLabel>Tier</FilterLabel>
              <FilterSelect value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                <option value="">All Tiers</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Position</FilterLabel>
              <FilterSelect value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)}>
                <option value="">All Positions</option>
                <option value="HVAC Service Technician">HVAC Service Technician</option>
                <option value="Lead HVAC Technician">Lead HVAC Technician</option>
                <option value="Sales Representative">Sales Representative</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Customer Service Representative">Customer Service Representative</option>
                <option value="Administrative Assistant">Administrative Assistant</option>
                <option value="Bookkeeper">Bookkeeper</option>
                <option value="HVAC Installer">HVAC Installer</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Status</FilterLabel>
              <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="approved">Approved</option>
                <option value="backup">Backup</option>
                <option value="rejected">Rejected</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Min Score</FilterLabel>
              <FilterInput
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Max Score</FilterLabel>
              <FilterInput
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </FilterGroup>
          </FilterGrid>
        </FilterSection>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {loading ? (
          <LoadingMessage>Loading talent pool...</LoadingMessage>
        ) : candidates.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📭</EmptyIcon>
            <h3>No candidates found</h3>
            <p>Try adjusting your filters or upload resumes to build your talent pool.</p>
          </EmptyState>
        ) : (
          <CandidatesGrid>
            {candidatesByTier.green.length > 0 && (
              <TierSection>
                <TierHeader tier="green">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={20} /> GREEN TIER (80-100 points)
                  </div>
                  <span>{candidatesByTier.green.length} candidates</span>
                </TierHeader>
                {candidatesByTier.green.map(viewMode === 'compact' ? renderCompactRow : renderCandidateCard)}
              </TierSection>
            )}

            {candidatesByTier.yellow.length > 0 && (
              <TierSection>
                <TierHeader tier="yellow">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} /> YELLOW TIER (50-79 points)
                  </div>
                  <span>{candidatesByTier.yellow.length} candidates</span>
                </TierHeader>
                {candidatesByTier.yellow.map(viewMode === 'compact' ? renderCompactRow : renderCandidateCard)}
              </TierSection>
            )}

            {candidatesByTier.red.length > 0 && (
              <TierSection>
                <TierHeader tier="red">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={20} /> RED TIER (0-49 points)
                  </div>
                  <span>{candidatesByTier.red.length} candidates</span>
                </TierHeader>
                {candidatesByTier.red.map(viewMode === 'compact' ? renderCompactRow : renderCandidateCard)}
              </TierSection>
            )}
          </CandidatesGrid>
        )}
      </MainCard>

      <ResumeFileModal
        isOpen={isResumeFileModalOpen}
        onClose={() => { setIsResumeFileModalOpen(false); setResumeFileCandidate(null); }}
        candidateId={resumeFileCandidate?.id ?? null}
        filename={resumeFileCandidate?.filename ?? ''}
      />

      <ResumePreviewModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        candidate={selectedCandidate}
      />

      {selectedCandidateForContact && (
        <ContactRejectionModal
          isOpen={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setSelectedCandidateForContact(null);
          }}
          candidate={selectedCandidateForContact}
          initialMode={contactMode}
          initialCommunicationType={contactCommunicationType}
          onSuccess={handleContactSuccess}
        />
      )}
    </Container>
  );
};

export default TalentPoolManager;
