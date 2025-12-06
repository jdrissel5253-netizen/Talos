import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { config } from '../config';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1a1a1a;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
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
`;

const JobMatchesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const JobMatchCard = styled.div`
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    background: white;
  }
`;

const JobMatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const JobMatchInfo = styled.div`
  flex: 1;
`;

const JobTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const JobLocation = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const MatchScore = styled.div<{ tier: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ScoreBadge = styled.div<{ tier: string }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
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
`;

const TierLabel = styled.div<{ tier: string }>`
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
  color: ${props =>
    props.tier === 'green' ? '#065f46' :
    props.tier === 'yellow' ? '#92400e' :
    '#991b1b'
  };
  text-transform: uppercase;
`;

const JobMetaInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
`;

interface JobMatch {
  job_id: number;
  job_title: string;
  job_location: string;
  position_type: string;
  required_years_experience: number;
  match_score: number;
  tier: 'green' | 'yellow' | 'red';
  years_experience_diff: number;
  vehicle_required: boolean;
}

interface SuggestedJobMatchesProps {
  candidateId: number;
  onClose: () => void;
}

const SuggestedJobMatches: React.FC<SuggestedJobMatchesProps> = ({ candidateId, onClose }) => {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobMatches();
  }, [candidateId]);

  const fetchJobMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.apiUrl}/api/pipeline/candidate/${candidateId}/job-matches`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch job matches');
      }

      const data = await response.json();
      setMatches(data.data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <ModalHeader>
          <ModalTitle>Suggested Job Matches</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {loading && <LoadingMessage>Evaluating job matches...</LoadingMessage>}

          {error && <ErrorMessage>Error: {error}</ErrorMessage>}

          {!loading && !error && matches.length === 0 && (
            <EmptyState>
              <h3>No job matches found</h3>
              <p>There are no active jobs to evaluate this candidate against.</p>
            </EmptyState>
          )}

          {!loading && !error && matches.length > 0 && (
            <>
              <p style={{ marginBottom: '16px', color: '#6b7280' }}>
                This candidate has been evaluated against {matches.length} active job{matches.length > 1 ? 's' : ''}.
                Results are ranked by match score.
              </p>

              <JobMatchesList>
                {matches.map((match, index) => (
                  <JobMatchCard key={match.job_id}>
                    <JobMatchHeader>
                      <JobMatchInfo>
                        <JobTitle>
                          {index + 1}. {match.job_title}
                        </JobTitle>
                        <JobLocation>📍 {match.job_location}</JobLocation>
                      </JobMatchInfo>

                      <MatchScore tier={match.tier}>
                        <ScoreBadge tier={match.tier}>
                          {match.match_score}
                        </ScoreBadge>
                        <TierLabel tier={match.tier}>
                          {getTierLabel(match.tier)} Tier
                        </TierLabel>
                      </MatchScore>
                    </JobMatchHeader>

                    <JobMetaInfo>
                      <MetaItem>
                        <span>📋</span>
                        <span>{match.position_type}</span>
                      </MetaItem>

                      <MetaItem>
                        <span>⏱️</span>
                        <span>{match.required_years_experience}+ years required</span>
                      </MetaItem>

                      {match.years_experience_diff !== 0 && (
                        <MetaItem>
                          {match.years_experience_diff > 0 ? (
                            <span style={{ color: '#10b981' }}>
                              ✓ {Math.abs(match.years_experience_diff)} years over requirement
                            </span>
                          ) : (
                            <span style={{ color: '#f59e0b' }}>
                              ⚠ {Math.abs(match.years_experience_diff)} years under requirement
                            </span>
                          )}
                        </MetaItem>
                      )}

                      {match.vehicle_required && (
                        <MetaItem>
                          <span>🚗</span>
                          <span>Vehicle required</span>
                        </MetaItem>
                      )}
                    </JobMetaInfo>
                  </JobMatchCard>
                ))}
              </JobMatchesList>
            </>
          )}
        </ModalBody>
      </Modal>
    </Overlay>
  );
};

export default SuggestedJobMatches;
