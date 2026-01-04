import React from 'react';
import styled from 'styled-components';
import { X, FileText, User, Briefcase, Award, AlertCircle, CheckCircle } from 'lucide-react';

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

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: #fdfdfd;
  color: #333;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const ModalHeader = styled.div`
  background: #2d3748;
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #4ade80;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TitleText = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const SubText = styled.p`
  margin: 0.25rem 0 0;
  opacity: 0.8;
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
  overflow-y: auto;
  line-height: 1.6;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #718096;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #1a202c;
`;

const SummaryBox = styled.div`
  background: #f7fafc;
  border-left: 4px solid #4ade80;
  padding: 1.5rem;
  border-radius: 0 4px 4px 0;
  margin-bottom: 1.5rem;
`;

const ScoreBadge = styled.span<{ score: number }>`
  background: ${props => props.score >= 90 ? '#4ade80' : props.score >= 70 ? '#ecc94b' : '#f56565'};
  color: ${props => props.score >= 70 ? '#1a202c' : '#fff'};
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.875rem;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const RecommendationBox = styled.div`
  background: #ebf8ff;
  border: 1px solid #bee3f8;
  padding: 1rem;
  border-radius: 6px;
  color: #2c5282;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({ isOpen, onClose, candidate }) => {
  if (!candidate) return null;

  // Mock data for missing fields if needed
  const safeFilename = candidate.filename || "Candidate_Name.pdf";
  const firstName = safeFilename.split('_')[0] || "Candidate";
  const lastName = safeFilename.split('_')[1]?.replace('.pdf', '') || "";

  // Helper to ensure we always have an array
  const ensureArray = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return data.split(',').map(s => s.trim());
      }
    }
    return [];
  };

  const certifications = ensureArray(candidate.certifications_found);
  const strengths = ensureArray(candidate.strengths);
  const weaknesses = ensureArray(candidate.weaknesses);

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <HeaderTitle>
            <FileText size={24} color="#4ade80" />
            <div>
              <TitleText>Resume Preview</TitleText>
              <SubText>{safeFilename}</SubText>
            </div>
          </HeaderTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: '0 0 0.5rem 0', color: '#1a202c' }}>{firstName} {lastName}</h1>
                <p style={{ margin: 0, color: '#4a5568', fontSize: '1.1rem' }}>{candidate.position_type}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <InfoLabel>Overall Match Score</InfoLabel>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2d3748' }}>
                  {candidate.overall_score || 0}%
                </div>
              </div>
            </div>
          </Section>

          <Section>
            <SectionTitle><User size={18} /> Candidate Profile</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Experience</InfoLabel>
                <InfoValue>{candidate.years_of_experience || 0} Years</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Location</InfoLabel>
                <InfoValue>{candidate.job_location || 'Not specified'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Tier</InfoLabel>
                <InfoValue style={{ textTransform: 'capitalize' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: candidate.tier === 'green' ? '#4ade80' : candidate.tier === 'yellow' ? '#ecc94b' : '#f56565',
                    marginRight: '6px'
                  }} />
                  {candidate.tier || 'Unknown'} Tier
                </InfoValue>
              </InfoItem>
            </InfoGrid>

            <SummaryBox>
              <InfoLabel>AI Summary</InfoLabel>
              <p style={{ margin: '0.5rem 0 0 0', color: '#2d3748' }}>{candidate.ai_summary || "No summary available."}</p>
            </SummaryBox>
          </Section>

          <Section>
            <SectionTitle><Award size={18} /> Certifications & Skills</SectionTitle>
            <TagContainer>
              {certifications.length > 0 ? (
                certifications.map((cert, index) => (
                  <Tag key={index}>{cert}</Tag>
                ))
              ) : (
                <span style={{ color: '#718096', fontStyle: 'italic' }}>No certifications listed</span>
              )}
            </TagContainer>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <Section>
              <SectionTitle><CheckCircle size={18} color="#48bb78" /> Strengths</SectionTitle>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#2d3748' }}>
                {strengths.length > 0 ? (
                  strengths.map((strength, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{strength}</li>
                  ))
                ) : (
                  <li>No specific strengths identified</li>
                )}
              </ul>
            </Section>

            <Section>
              <SectionTitle><AlertCircle size={18} color="#ecc94b" /> Areas of Review</SectionTitle>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#2d3748' }}>
                {weaknesses.length > 0 ? (
                  weaknesses.map((weakness, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{weakness}</li>
                  ))
                ) : (
                  <li>None identified</li>
                )}
              </ul>
            </Section>
          </div>

          <Section>
            <SectionTitle><Briefcase size={18} /> Recommendation</SectionTitle>
            <RecommendationBox>
              <InfoLabel style={{ whiteSpace: 'nowrap', marginTop: '3px' }}>AI VERDICT:</InfoLabel>
              <div>{candidate.hiring_recommendation || "Consider for interview."}</div>
            </RecommendationBox>
          </Section>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ResumePreviewModal;
