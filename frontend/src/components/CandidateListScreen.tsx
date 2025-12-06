import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { config } from '../config';
import ExpandedCandidateProfile from './ExpandedCandidateProfile';
import SuggestedJobMatches from './SuggestedJobMatches';

const Container = styled.div`
  max-width: 1400px;
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

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
`;

const CandidatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CandidateCard = styled.div<{ isExpanded: boolean }>`
  background: white;
  border: 2px solid ${props => props.isExpanded ? '#3b82f6' : '#e5e7eb'};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }
`;

const CandidateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const CandidateInfo = styled.div`
  flex: 1;
`;

const CandidateName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const CandidateScore = styled.div<{ tier: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: ${props =>
    props.tier === 'green' ? '#d1fae5' :
    props.tier === 'yellow' ? '#fef3c7' :
    '#fee2e2'
  };
  color: ${props =>
    props.tier === 'green' ? '#065f46' :
    props.tier === 'yellow' ? '#92400e' :
    '#991b1b'
  };
  margin-right: 8px;
`;

const CandidateActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' ? '#3b82f6' : '#f3f4f6'};
  color: ${props => props.variant === 'primary' ? 'white' : '#374151'};
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#2563eb' : '#e5e7eb'};
  }
`;

const ResumeLink = styled.a`
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: #eff6ff;
    text-decoration: underline;
  }
`;

const ContactDropdown = styled.select<{ isContacted: boolean }>`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.isContacted ? '#10b981' : '#d1d5db'};
  background: ${props => props.isContacted ? '#d1fae5' : 'white'};
  color: ${props => props.isContacted ? '#065f46' : '#374151'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.isContacted ? '#059669' : '#9ca3af'};
  }
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
`;

interface Candidate {
  pipeline_id: number;
  candidate_id: number;
  job_id: number;
  tier: 'green' | 'yellow' | 'red';
  tier_score: number;
  filename: string;
  file_path: string;
  contacted_via: string | null;
  contacted_at: string | null;
  summary: string;
  years_of_experience: number;
  certifications_found: string[];
  strengths: string[];
  weaknesses: string[];
  ai_summary: string;
}

const CandidateListScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier') as 'green' | 'yellow' | 'red' | null;
  const jobId = searchParams.get('jobId');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showJobMatches, setShowJobMatches] = useState<number | null>(null);

  useEffect(() => {
    if (tier && jobId) {
      fetchCandidates();
      fetchJobDetails();
    }
  }, [tier, jobId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.apiUrl}/api/pipeline/talent-pool?tier=${tier}&job_id=${jobId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      setCandidates(data.data.candidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobTitle(data.data.job.title);
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
  };

  const handleBack = () => {
    navigate(`/talent-pool/jobs?tier=${tier}`);
  };

  const handleCandidateClick = (candidateId: number) => {
    if (expandedId === candidateId) {
      setExpandedId(null);
    } else {
      setExpandedId(candidateId);
    }
  };

  const handleContactStatusChange = async (pipelineId: number, value: string) => {
    try {
      const isContacted = value === 'contacted';
      const response = await fetch(
        `${config.apiUrl}/api/pipeline/${pipelineId}/contact-status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isContacted, contactedVia: 'manual' })
        }
      );

      if (response.ok) {
        // Update local state
        setCandidates(prev =>
          prev.map(c =>
            c.pipeline_id === pipelineId
              ? { ...c, contacted_via: isContacted ? 'manual' : null }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to update contact status:', err);
    }
  };

  const handleEmailClick = (e: React.MouseEvent, pipelineId: number) => {
    e.stopPropagation();
    // TODO: Implement email functionality
    alert('Email functionality coming soon!');
  };

  const handleTextClick = (e: React.MouseEvent, pipelineId: number) => {
    e.stopPropagation();
    // TODO: Implement text message functionality
    alert('Text message functionality coming soon!');
  };

  const handleSuggestedJobsClick = (e: React.MouseEvent, candidateId: number) => {
    e.stopPropagation();
    setShowJobMatches(candidateId);
  };

  if (!tier || !jobId) {
    return (
      <Container>
        <ErrorMessage>
          Invalid selection. Please go back and select a tier and job.
        </ErrorMessage>
        <BackButton onClick={() => navigate('/talent-pool')}>
          ← Back to Talent Pool
        </BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>← Back to Jobs</BackButton>
        <Title>{jobTitle || 'Job Position'} Candidates</Title>
        <Subtitle>
          Showing {candidates.length} {tier} tier candidate{candidates.length !== 1 ? 's' : ''}
        </Subtitle>
      </Header>

      {loading && <LoadingMessage>Loading candidates...</LoadingMessage>}

      {error && <ErrorMessage>Error loading candidates: {error}</ErrorMessage>}

      {!loading && !error && candidates.length === 0 && (
        <EmptyState>
          <h3>No candidates found</h3>
          <p>There are no {tier} tier candidates for this position yet.</p>
        </EmptyState>
      )}

      {!loading && !error && candidates.length > 0 && (
        <CandidatesList>
          {candidates.map(candidate => (
            <React.Fragment key={candidate.pipeline_id}>
              <CandidateCard
                isExpanded={expandedId === candidate.pipeline_id}
                onClick={() => handleCandidateClick(candidate.pipeline_id)}
              >
                <CandidateHeader>
                  <CandidateInfo>
                    <CandidateName>
                      {candidate.filename.replace(/\.(pdf|docx?)$/i, '')}
                      <CandidateScore tier={candidate.tier}>
                        {candidate.tier_score} / 100
                      </CandidateScore>
                    </CandidateName>
                  </CandidateInfo>

                  <CandidateActions onClick={e => e.stopPropagation()}>
                    <ResumeLink
                      href={`${config.apiUrl}/${candidate.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📄 Resume
                    </ResumeLink>

                    <ActionButton
                      variant="secondary"
                      onClick={e => handleSuggestedJobsClick(e, candidate.candidate_id)}
                    >
                      🎯 Other Jobs
                    </ActionButton>

                    <ActionButton
                      variant="secondary"
                      onClick={e => handleEmailClick(e, candidate.pipeline_id)}
                    >
                      📧 Email
                    </ActionButton>

                    <ActionButton
                      variant="secondary"
                      onClick={e => handleTextClick(e, candidate.pipeline_id)}
                    >
                      💬 Text
                    </ActionButton>

                    <ContactDropdown
                      isContacted={!!candidate.contacted_via}
                      value={candidate.contacted_via ? 'contacted' : 'uncontacted'}
                      onChange={e => handleContactStatusChange(candidate.pipeline_id, e.target.value)}
                    >
                      <option value="uncontacted">Uncontacted</option>
                      <option value="contacted">Contacted</option>
                    </ContactDropdown>
                  </CandidateActions>
                </CandidateHeader>

                {expandedId === candidate.pipeline_id && (
                  <ExpandedCandidateProfile candidate={candidate} />
                )}
              </CandidateCard>
            </React.Fragment>
          ))}
        </CandidatesList>
      )}

      {showJobMatches && (
        <SuggestedJobMatches
          candidateId={showJobMatches}
          onClose={() => setShowJobMatches(null)}
        />
      )}
    </Container>
  );
};

export default CandidateListScreen;
