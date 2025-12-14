import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { config } from '../config';
import ExpandedCandidateProfile from './ExpandedCandidateProfile';
import SuggestedJobMatches from './SuggestedJobMatches';
import ContactRejectionModal from './ContactRejectionModal';
import { extractCandidateName } from '../utils/templateHelpers';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px;
  background: #0a0a0a;
  min-height: calc(100vh - 80px);
`;

const Header = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #2a2a2a;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #3a3a3a;
    border-color: #4a4a4a;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TierBadge = styled.span<{ tier: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
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
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
`;

const CandidatesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CandidateCard = styled.div<{ isExpanded: boolean }>`
  background: #1a1a1a;
  border: ${props => props.isExpanded ? '2px solid #3b82f6' : '1px solid #2a2a2a'};
  border-radius: 12px;
  padding: 20px 24px;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: ${props => props.isExpanded ? '0 8px 24px rgba(59, 130, 246, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.5)'};

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
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
  color: #f9fafb;
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

const RejectButton = styled.button`
  background: #dc2626;
  color: white;
  border: 1px solid #991b1b;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #b91c1c;
    border-color: #7f1d1d;
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
  color: #9ca3af;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
`;

const ErrorMessage = styled.div`
  background: #2a1a1a;
  border: 1px solid #4a2a2a;
  border-radius: 8px;
  padding: 16px;
  color: #fca5a5;
  margin-bottom: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
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
  const position = searchParams.get('position');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showJobMatches, setShowJobMatches] = useState<number | null>(null);
  const [contactModal, setContactModal] = useState<{
    isOpen: boolean;
    mode: 'contact' | 'rejection';
    communicationType?: 'email' | 'sms';
    candidate?: { pipelineId: number; name: string; position: string };
  }>({ isOpen: false, mode: 'contact' });

  useEffect(() => {
    if (tier && position) {
      fetchCandidates();
    }
  }, [tier, position]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.apiUrl}/api/pipeline/talent-pool?tier=${tier}&position=${encodeURIComponent(position!)}`
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

  const handleEmailClick = (e: React.MouseEvent | number, pipelineIdParam?: number) => {
    // Handle both direct calls and event-based calls
    const pipelineId = typeof e === 'number' ? e : pipelineIdParam!;
    if (typeof e !== 'number') e.stopPropagation();

    const candidate = candidates.find(c => c.pipeline_id === pipelineId);
    if (candidate) {
      setContactModal({
        isOpen: true,
        mode: 'contact',
        communicationType: 'email',
        candidate: {
          pipelineId: candidate.pipeline_id,
          name: extractCandidateName(candidate.filename),
          position: position!
        }
      });
    }
  };

  const handleTextClick = (e: React.MouseEvent | number, pipelineIdParam?: number) => {
    // Handle both direct calls and event-based calls
    const pipelineId = typeof e === 'number' ? e : pipelineIdParam!;
    if (typeof e !== 'number') e.stopPropagation();

    const candidate = candidates.find(c => c.pipeline_id === pipelineId);
    if (candidate) {
      setContactModal({
        isOpen: true,
        mode: 'contact',
        communicationType: 'sms',
        candidate: {
          pipelineId: candidate.pipeline_id,
          name: extractCandidateName(candidate.filename),
          position: position!
        }
      });
    }
  };

  const handleRejectClick = (e: React.MouseEvent, pipelineId: number) => {
    e.stopPropagation();
    const candidate = candidates.find(c => c.pipeline_id === pipelineId);
    if (candidate) {
      setContactModal({
        isOpen: true,
        mode: 'rejection',
        candidate: {
          pipelineId: candidate.pipeline_id,
          name: extractCandidateName(candidate.filename),
          position: position!
        }
      });
    }
  };

  const handleSuggestedJobsClick = (e: React.MouseEvent, candidateId: number) => {
    e.stopPropagation();
    setShowJobMatches(candidateId);
  };

  if (!tier || !position) {
    return (
      <Container>
        <ErrorMessage>
          Invalid selection. Please go back and select a tier and position.
        </ErrorMessage>
        <BackButton onClick={() => navigate('/talent-pool')}>
          ← Back to Talent Pool
        </BackButton>
      </Container>
    );
  }

  const getTierIcon = (tier: string | null) => {
    if (tier === 'green') return '🟢';
    if (tier === 'yellow') return '🟡';
    if (tier === 'red') return '🔴';
    return '⚪';
  };

  const getTierLabel = (tier: string | null) => {
    if (!tier) return 'All Tiers';
    return tier.charAt(0).toUpperCase() + tier.slice(1) + ' Tier';
  };

  return (
    <Container>
      <Header>
        <HeaderTop>
          <BackButton onClick={handleBack}>← Back</BackButton>
          <TitleSection>
            <Title>
              {position}
              <TierBadge tier={tier}>
                {getTierIcon(tier)} {getTierLabel(tier)}
              </TierBadge>
            </Title>
            <Subtitle>
              Showing {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
            </Subtitle>
          </TitleSection>
        </HeaderTop>
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

                    <RejectButton
                      onClick={e => handleRejectClick(e, candidate.pipeline_id)}
                    >
                      ❌ Reject
                    </RejectButton>

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
                  <ExpandedCandidateProfile
                    candidate={candidate}
                    onEmailClick={(pipelineId) => handleEmailClick(pipelineId)}
                    onTextClick={(pipelineId) => handleTextClick(pipelineId)}
                    onContactStatusChange={handleContactStatusChange}
                  />
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

      {contactModal.isOpen && contactModal.candidate && (
        <ContactRejectionModal
          isOpen={contactModal.isOpen}
          onClose={() => setContactModal({ isOpen: false, mode: 'contact' })}
          candidate={contactModal.candidate}
          initialMode={contactModal.mode}
          initialCommunicationType={contactModal.communicationType}
          onSuccess={() => {
            setContactModal({ isOpen: false, mode: 'contact' });
            fetchCandidates(); // Refresh list
          }}
        />
      )}
    </Container>
  );
};

export default CandidateListScreen;
