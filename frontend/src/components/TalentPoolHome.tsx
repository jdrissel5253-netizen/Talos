import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 48px;
  text-align: center;
`;

const TierButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
`;

const TierButton = styled.button<{ tierColor: string }>`
  background: ${props => props.tierColor};
  border: none;
  border-radius: 16px;
  padding: 48px 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const TierIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const TierTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const TierDescription = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

interface TalentPoolHomeProps {
  className?: string;
}

const TalentPoolHome: React.FC<TalentPoolHomeProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleTierClick = (tier: 'green' | 'yellow' | 'red') => {
    navigate(`/talent-pool/jobs?tier=${tier}`);
  };

  return (
    <Container className={className}>
      <Title>Talent Pool</Title>
      <Subtitle>Select a tier to view candidates</Subtitle>

      <TierButtonsContainer>
        <TierButton
          tierColor="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          onClick={() => handleTierClick('green')}
        >
          <TierIcon>🟢</TierIcon>
          <TierTitle>Green Tier Candidates</TierTitle>
          <TierDescription>
            Top-performing candidates (80-100 points). Strong matches with excellent qualifications and experience.
          </TierDescription>
        </TierButton>

        <TierButton
          tierColor="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          onClick={() => handleTierClick('yellow')}
        >
          <TierIcon>🟡</TierIcon>
          <TierTitle>Yellow Tier Candidates</TierTitle>
          <TierDescription>
            Solid candidates (50-79 points). Good matches with potential for growth or some areas needing development.
          </TierDescription>
        </TierButton>

        <TierButton
          tierColor="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          onClick={() => handleTierClick('red')}
        >
          <TierIcon>🔴</TierIcon>
          <TierTitle>Red Tier Candidates</TierTitle>
          <TierDescription>
            Below threshold (0-49 points). May lack required qualifications or experience for current positions.
          </TierDescription>
        </TierButton>
      </TierButtonsContainer>
    </Container>
  );
};

export default TalentPoolHome;
