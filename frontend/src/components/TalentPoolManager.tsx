import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { config } from '../config';


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

const CandidatesTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #000000;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4ade80;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #333333;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #1a1a1a;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #333333;
  transition: background 0.2s ease;

  &:hover {
    background: #000000;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #e0e0e0;
  font-size: 0.875rem;
`;

const TierBadge = styled.span<{ tier: 'green' | 'yellow' | 'red' }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props =>
    props.tier === 'green' ? '#4ade80' :
    props.tier === 'yellow' ? '#fbbf24' :
    '#ef4444'};
  color: ${props => props.tier === 'yellow' ? '#000' : '#fff'};
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props =>
    props.status === 'new' ? '#6366f1' :
    props.status === 'contacted' ? '#3b82f6' :
    props.status === 'approved' ? '#10b981' :
    props.status === 'backup' ? '#f59e0b' :
    '#6b7280'};
  color: #fff;
`;

const ScoreBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 0.75rem;
  background: #333333;
  border-radius: 6px;
  font-weight: bold;
  color: #4ade80;
`;

const StarRating = styled.div`
  color: #fbbf24;
`;

const ViewButton = styled.button`
  background-color: #4ade80;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #22c55e;
    transform: translateY(-1px);
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
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<TalentPoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [tierFilter, positionFilter, statusFilter, minScore, maxScore, sortBy, sortOrder]);

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

      const response = await fetch(`${config.apiUrl}/api/pipeline/talent-pool?${params.toString()}`);
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
      const response = await fetch(`${config.apiUrl}/api/pipeline/talent-pool/stats`);
      const data = await response.json();

      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }

    return stars.join('');
  };

  return (
    <Container>
      <MainCard>
        <Header>
          <Title>Talent Pool Management</Title>
          <Subtitle>View and manage all candidates in your talent pipeline</Subtitle>
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
          <CandidatesTable>
            <Table>
              <TableHead>
                <tr>
                  <TableHeader onClick={() => handleSort('name')}>
                    Candidate {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHeader>
                  <TableHeader onClick={() => handleSort('position')}>
                    Position {sortBy === 'position' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHeader>
                  <TableHeader onClick={() => handleSort('score')}>
                    Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHeader>
                  <TableHeader>Tier</TableHeader>
                  <TableHeader>Rating</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Experience</TableHeader>
                  <TableHeader onClick={() => handleSort('date')}>
                    Uploaded {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.pipeline_id}>
                    <TableCell>{candidate.filename.replace('.pdf', '')}</TableCell>
                    <TableCell>{candidate.position_type}</TableCell>
                    <TableCell>
                      <ScoreBadge>{candidate.tier_score}</ScoreBadge>
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={candidate.tier}>{candidate.tier}</TierBadge>
                    </TableCell>
                    <TableCell>
                      <StarRating>{renderStarRating(candidate.star_rating)}</StarRating>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={candidate.pipeline_status}>
                        {candidate.pipeline_status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{candidate.years_of_experience} yrs</TableCell>
                    <TableCell>{new Date(candidate.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <ViewButton onClick={() => alert('View details coming soon!')}>
                        View
                      </ViewButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CandidatesTable>
        )}
      </MainCard>
    </Container>
  );
};

export default TalentPoolManager;
