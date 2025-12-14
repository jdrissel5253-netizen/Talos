import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

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
  margin-bottom: 20px;
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

const ContentCard = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #2a2a2a;
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 12px;
`;

const PositionSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: 2px solid #2a2a2a;
  border-radius: 8px;
  background: #0a0a0a;
  color: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3a3a3a;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  option {
    background: #1a1a1a;
    color: #f9fafb;
  }
`;

const ViewButton = styled.button`
  width: 100%;
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    background: #4a4a4a;
    color: #6b7280;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #2a1a1a;
  border: 1px solid #4a2a2a;
  border-radius: 8px;
  padding: 16px;
  color: #fca5a5;
  margin-bottom: 20px;
`;

const JobSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier') as 'green' | 'yellow' | 'red' | null;
  const [selectedPosition, setSelectedPosition] = useState<string>('');

  const positions = [
    'Lead HVAC Technician',
    'HVAC Service Technician',
    'HVAC Dispatcher',
    'Administrative Assistant',
    'Customer Service Representative',
    'HVAC Installer',
    'Lead HVAC Installer',
    'Maintenance Technician',
    'Warehouse Associate',
    'Bookkeeper',
    'HVAC Sales Representative',
    'HVAC Service Manager',
    'Apprentice'
  ];

  const handleViewCandidates = () => {
    if (selectedPosition) {
      navigate(`/talent-pool/candidates?tier=${tier}&position=${encodeURIComponent(selectedPosition)}`);
    }
  };

  const handleBack = () => {
    navigate('/talent-pool');
  };

  const getTierLabel = (tier: string | null) => {
    if (!tier) return 'All Tiers';
    return tier.charAt(0).toUpperCase() + tier.slice(1) + ' Tier';
  };

  const getTierIcon = (tier: string | null) => {
    if (tier === 'green') return '🟢';
    if (tier === 'yellow') return '🟡';
    if (tier === 'red') return '🔴';
    return '⚪';
  };

  if (!tier) {
    return (
      <Container>
        <ContentCard>
          <ErrorMessage>
            Invalid tier selection. Please go back and select a tier.
          </ErrorMessage>
          <BackButton onClick={handleBack}>← Back to Talent Pool</BackButton>
        </ContentCard>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderTop>
          <BackButton onClick={handleBack}>← Back</BackButton>
          <TitleSection>
            <Title>
              Select Position
              <TierBadge tier={tier}>
                {getTierIcon(tier)} {getTierLabel(tier)}
              </TierBadge>
            </Title>
            <Subtitle>Choose a position to view matching candidates</Subtitle>
          </TitleSection>
        </HeaderTop>
      </Header>

      <ContentCard>
        <SectionLabel htmlFor="position-select">
          Position Type
        </SectionLabel>
        <PositionSelect
          id="position-select"
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
        >
          <option value="">-- Select a Position --</option>
          {positions.map(position => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </PositionSelect>
        <ViewButton
          onClick={handleViewCandidates}
          disabled={!selectedPosition}
        >
          View {selectedPosition || 'Candidates'}
        </ViewButton>
      </ContentCard>
    </Container>
  );
};

export default JobSelectionScreen;
