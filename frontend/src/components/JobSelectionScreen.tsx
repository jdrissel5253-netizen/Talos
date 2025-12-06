import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { config } from '../config';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const BackButton = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  margin-bottom: 16px;
  transition: background 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const TierBadge = styled.span<{ tier: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  background: ${props =>
    props.tier === 'green' ? '#10b981' :
    props.tier === 'yellow' ? '#f59e0b' :
    '#ef4444'
  };
  color: white;
  margin-left: 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin-top: 8px;
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const JobCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }
`;

const JobTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const JobLocation = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
`;

const JobMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #9ca3af;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  color: #991b1b;
  margin-bottom: 20px;
`;

interface Job {
  id: number;
  title: string;
  location: string;
  position_type: string;
  required_years_experience: number;
  status: string;
}

const JobSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier') as 'green' | 'yellow' | 'red' | null;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/jobs?userId=1`);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.data.jobs.filter((job: Job) => job.status === 'active'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId: number) => {
    navigate(`/talent-pool/candidates?tier=${tier}&jobId=${jobId}`);
  };

  const handleBack = () => {
    navigate('/talent-pool');
  };

  const getTierLabel = (tier: string | null) => {
    if (!tier) return 'All Tiers';
    return tier.charAt(0).toUpperCase() + tier.slice(1) + ' Tier';
  };

  if (!tier) {
    return (
      <Container>
        <ErrorMessage>
          Invalid tier selection. Please go back and select a tier.
        </ErrorMessage>
        <BackButton onClick={handleBack}>← Back to Talent Pool</BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>← Back to Talent Pool</BackButton>
        <Title>
          Select a Job Position
          <TierBadge tier={tier}>{getTierLabel(tier)}</TierBadge>
        </Title>
        <Subtitle>Choose a job to view matching candidates</Subtitle>
      </Header>

      {loading && <LoadingMessage>Loading jobs...</LoadingMessage>}

      {error && (
        <ErrorMessage>
          Error loading jobs: {error}
        </ErrorMessage>
      )}

      {!loading && !error && jobs.length === 0 && (
        <LoadingMessage>
          No active jobs found. Please create a job first.
        </LoadingMessage>
      )}

      {!loading && !error && jobs.length > 0 && (
        <JobsGrid>
          {jobs.map(job => (
            <JobCard key={job.id} onClick={() => handleJobClick(job.id)}>
              <JobTitle>{job.title}</JobTitle>
              <JobLocation>📍 {job.location}</JobLocation>
              <JobMeta>
                <span>{job.position_type}</span>
                <span>•</span>
                <span>{job.required_years_experience}+ years</span>
              </JobMeta>
            </JobCard>
          ))}
        </JobsGrid>
      )}
    </Container>
  );
};

export default JobSelectionScreen;
