import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';
import { FileText, CheckCircle, AlertCircle, XCircle, Star, Calendar, Car, ClipboardList, Mail, Smartphone, X } from 'lucide-react';
import ResumePreviewModal from './ResumePreviewModal';
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
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  padding: 2rem;
`;

const MainCard = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
  padding: 3rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #4ade80;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #e0e0e0;
  font-size: 1.125rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: #000000;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #333333;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #4ade80;
`;

const FilterSection = styled.div`
  background: #000000;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #333333;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4ade80;
`;


const NavButton = styled.button`
  background: #333333;
  color: #e0e0e0;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #4ade80;
    color: white;
    transform: translateY(-1px);
  }
`;

const GoogleConnectButton = styled.button<{ connected: boolean }>`
  background: ${props => props.connected ? 'rgba(74, 222, 128, 0.1)' : '#333'};
  color: ${props => props.connected ? '#4ade80' : '#fff'};
  border: 1px solid ${props => props.connected ? '#4ade80' : '#444'};
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${props => props.connected ? 'default' : 'pointer'};
  transition: all 0.2s;
  margin: 1rem auto 0;

  &:hover {
    background: ${props => props.connected ? 'rgba(74, 222, 128, 0.1)' : '#444'};
    border-color: ${props => props.connected ? '#4ade80' : '#666'};
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 2px solid #333333;
  border-radius: 6px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4ade80;
  }
`;

const FilterInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #333333;
  border-radius: 6px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4ade80;
  }
`;

// New Card-Based Components (Copied/Adapted from JobsManagement)
const CandidatesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TierSection = styled.div`
  margin-bottom: 2rem;
`;

const TierHeader = styled.div<{ tier: string }>`
  background: ${props => {
    if (props.tier === 'green') return '#4ade80';
    if (props.tier === 'yellow') return '#fbbf24';
    return '#ef4444';
  }};
  color: ${props => props.tier === 'yellow' ? '#000' : '#fff'};
  padding: 1rem;
  border-radius: 8px 8px 0 0;
  font-weight: 700;
  font-size: 1.125rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CandidateCard = styled.div`
  background: #0f0f0f;
  border: 2px solid #333333;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4ade80;
    transform: translateY(-2px);
  }
`;

const CandidateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const CandidateInfo = styled.div`
  flex: 1;
`;

const CandidateName = styled.h3`
  font-size: 1.25rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StarRating = styled.span`
  color: #fbbf24;
  font-size: 1rem;
  margin-left: 0.5rem;
`;

const Score = styled.span<{ tier: string }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => {
    if (props.tier === 'green') return '#4ade80';
    if (props.tier === 'yellow') return '#fbbf24';
    return '#ef4444';
  }};
`;

const Badge = styled.span`
  background: #4ade80;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const Summary = styled.p`
  color: #999;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: #e0e0e0;
  margin-bottom: 1rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  border-top: 1px solid #333;
  padding-top: 1rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: #333333;
  color: #e0e0e0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #4ade80;
    color: #000;
  }
`;

const ActionIcon = styled.button<{ color: string }>`
    background: ${props => props.color};
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.1);
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
    min-width: 200px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    z-index: 10;
    right: 0;
    top: 100%;
    margin-top: 0.5rem;
    border: 2px solid #333333;
`;

const DropdownItem = styled.button`
    background: none;
    border: none;
    color: #e0e0e0;
    padding: 0.75rem 1rem;
    text-align: left;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;

    &:hover {
        background: #333333;
    }

    &:first-child {
        border-radius: 4px 4px 0 0;
    }

    &:last-child {
        border-radius: 0 0 4px 4px;
    }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #e0e0e0;
  font-size: 1.125rem;
`;

const ErrorMessage = styled.div`
  background: #dc2626;
  color: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #e0e0e0;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const TalentPoolManager: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<TalentPoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resume Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Contact Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedCandidateForContact, setSelectedCandidateForContact] = useState<{ pipelineId: number; name: string; position: string; } | null>(null);
  const [contactMode, setContactMode] = useState<'contact' | 'rejection'>('contact');
  const [contactCommunicationType, setContactCommunicationType] = useState<'email' | 'sms'>('email');
  const [messageDropdownOpen, setMessageDropdownOpen] = useState<number | null>(null);

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

  const handleConnectGmail = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/auth/google/url`);
      const data = await response.json();
      if (data.status === 'success') {
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error('Error fetching auth URL:', error);
      alert('Failed to initiate Gmail connection');
    }
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
      const data = await response.json();

      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
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
          <div style={{ color: '#999', fontSize: '0.9rem' }}>{candidate.position_type} • {candidate.job_location || 'Remote/TBD'}</div>
        </CandidateInfo>
        <Score tier={candidate.tier}>{candidate.tier_score}</Score>
      </CandidateHeader>

      <Summary>{candidate.ai_summary}</Summary>

      <MetaRow>
        <MetaItem><Calendar size={16} /> {candidate.years_of_experience} years experience</MetaItem>
        <MetaItem><Car size={16} /> {candidate.vehicle_status?.replace('_', ' ') || 'N/A'}</MetaItem>
        <MetaItem><ClipboardList size={16} /> {candidate.certifications_found?.length || 0} certifications</MetaItem>
      </MetaRow>

      <ActionButtons>
        <ActionButton onClick={() => handleViewResume(candidate)}>
          <FileText size={16} /> View Resume Preview
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
      </ActionButtons>
    </CandidateCard>
  );

  return (
    <Container>
      <MainCard>
        <Header>
          <Title>Talent Pool Management</Title>
          <Subtitle>View and manage all candidates in your talent pipeline</Subtitle>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
            <NavButton onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </NavButton>
            <NavButton onClick={() => navigate('/jobs-management')}>
              ← View My Jobs
            </NavButton>
            <GoogleConnectButton
              connected={isGmailConnected}
              onClick={!isGmailConnected ? handleConnectGmail : undefined}
            >
              {isGmailConnected ? <CheckCircle size={16} /> : <Mail size={16} />}
              {isGmailConnected ? 'Gmail Connected' : 'Connect Gmail Account'}
            </GoogleConnectButton>
          </div>
        </Header>

        {stats && (
          <StatsGrid>
            <StatCard>
              <StatLabel>Total Candidates</StatLabel>
              <StatValue>{stats.total}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Green Tier</StatLabel>
              <StatValue>{stats.tierDistribution.green || 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Yellow Tier</StatLabel>
              <StatValue>{stats.tierDistribution.yellow || 0}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Red Tier</StatLabel>
              <StatValue>{stats.tierDistribution.red || 0}</StatValue>
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
                {candidatesByTier.green.map(renderCandidateCard)}
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
                {candidatesByTier.yellow.map(renderCandidateCard)}
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
                {candidatesByTier.red.map(renderCandidateCard)}
              </TierSection>
            )}
          </CandidatesGrid>
        )}
      </MainCard>

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
