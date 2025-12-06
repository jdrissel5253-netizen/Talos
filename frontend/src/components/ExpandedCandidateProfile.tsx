import React from 'react';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ScoreDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
`;

const SummaryText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 12px;
`;

const AIInsight = styled.div`
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;

  &::before {
    content: '•';
    position: absolute;
    left: 8px;
    color: #3b82f6;
    font-weight: bold;
  }
`;

const StrengthItem = styled(ListItem)`
  &::before {
    content: '✓';
    color: #10b981;
  }
`;

const WeaknessItem = styled(ListItem)`
  &::before {
    content: '⚠';
    color: #f59e0b;
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  background: #dbeafe;
  color: #1e40af;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const MetaInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const MetaItem = styled.div`
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
`;

const MetaLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-weight: 600;
`;

const MetaValue = styled.div`
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 500;
`;

interface Candidate {
  pipeline_id: number;
  tier_score: number;
  summary: string;
  ai_summary?: string;
  years_of_experience: number;
  certifications_found: string[];
  strengths: string[];
  weaknesses: string[];
  contacted_via: string | null;
  contacted_at: string | null;
}

interface ExpandedCandidateProfileProps {
  candidate: Candidate;
}

const ExpandedCandidateProfile: React.FC<ExpandedCandidateProfileProps> = ({ candidate }) => {
  return (
    <ProfileContainer onClick={e => e.stopPropagation()}>
      <Section>
        <SectionTitle>
          📊 Candidate Score
        </SectionTitle>
        <ScoreDisplay>
          {candidate.tier_score} / 100
        </ScoreDisplay>
      </Section>

      {candidate.ai_summary && (
        <Section>
          <SectionTitle>🤖 AI Analysis</SectionTitle>
          <AIInsight>
            <SummaryText>{candidate.ai_summary}</SummaryText>
          </AIInsight>
        </Section>
      )}

      <Section>
        <SectionTitle>📝 Resume Summary</SectionTitle>
        <SummaryText>{candidate.summary}</SummaryText>
      </Section>

      <Section>
        <MetaInfo>
          <MetaItem>
            <MetaLabel>Years of Experience</MetaLabel>
            <MetaValue>{candidate.years_of_experience} years</MetaValue>
          </MetaItem>

          <MetaItem>
            <MetaLabel>Contact Status</MetaLabel>
            <MetaValue>
              {candidate.contacted_via ? (
                <>
                  Contacted via {candidate.contacted_via}
                  {candidate.contacted_at && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {new Date(candidate.contacted_at).toLocaleDateString()}
                    </div>
                  )}
                </>
              ) : (
                'Not contacted yet'
              )}
            </MetaValue>
          </MetaItem>
        </MetaInfo>
      </Section>

      {candidate.certifications_found && candidate.certifications_found.length > 0 && (
        <Section>
          <SectionTitle>🎓 Certifications</SectionTitle>
          <div>
            {candidate.certifications_found.map((cert, index) => (
              <Badge key={index}>{cert}</Badge>
            ))}
          </div>
        </Section>
      )}

      {candidate.strengths && candidate.strengths.length > 0 && (
        <Section>
          <SectionTitle>💪 Strengths</SectionTitle>
          <List>
            {candidate.strengths.map((strength, index) => (
              <StrengthItem key={index}>{strength}</StrengthItem>
            ))}
          </List>
        </Section>
      )}

      {candidate.weaknesses && candidate.weaknesses.length > 0 && (
        <Section>
          <SectionTitle>⚠️ Areas for Development</SectionTitle>
          <List>
            {candidate.weaknesses.map((weakness, index) => (
              <WeaknessItem key={index}>{weakness}</WeaknessItem>
            ))}
          </List>
        </Section>
      )}
    </ProfileContainer>
  );
};

export default ExpandedCandidateProfile;
