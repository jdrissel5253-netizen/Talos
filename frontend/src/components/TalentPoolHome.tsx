import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';

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
  justify-content: space-between;
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
  text-align: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #9ca3af;
  margin: 4px 0 0 0;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #2a2a2a;
`;

const Tab = styled.button<{ active?: boolean; tierColor?: string }>`
  background: ${props => props.active ? '#2a2a2a' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? props.tierColor : 'transparent'};
  padding: 12px 24px;
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? props.tierColor : '#9ca3af'};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  margin-bottom: -2px;

  &:hover {
    background: ${props => props.active ? '#2a2a2a' : '#1f1f1f'};
    color: ${props => props.tierColor};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ borderColor: string }>`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #2a2a2a;
  border-left: 4px solid ${props => props.borderColor};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
    transform: translateY(-2px);
    border-color: #3a3a3a;
    border-left-color: ${props => props.borderColor};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatIcon = styled.div`
  font-size: 24px;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 8px;
`;

const StatDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
  width: 100%;

  &:hover {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const InfoSection = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #2a2a2a;
  text-align: center;
`;

const InfoTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #f9fafb;
  margin-bottom: 12px;
`;

const InfoText = styled.p`
  font-size: 15px;
  color: #9ca3af;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

interface TalentPoolHomeProps {
  className?: string;
}

interface Stats {
  green: number;
  yellow: number;
  red: number;
  total: number;
}

const TalentPoolHome: React.FC<TalentPoolHomeProps> = ({ className }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'green' | 'yellow' | 'red'>('green');
  const [stats, setStats] = useState<Stats>({ green: 0, yellow: 0, red: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/pipeline/talent-pool/stats`, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || { green: 0, yellow: 0, red: 0, total: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tier: 'green' | 'yellow' | 'red') => {
    setActiveTab(tier);
  };

  const handleViewCandidates = (tier: 'green' | 'yellow' | 'red') => {
    navigate(`/talent-pool/jobs?tier=${tier}`);
  };

  const handleBackToEvaluation = () => {
    navigate('/batch-resume-analysis');
  };

  const tierColors = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444'
  };

  const tierDescriptions = {
    green: 'Exceptional candidates with 80-100 points. Top performers with excellent qualifications.',
    yellow: 'Solid candidates with 50-79 points. Good potential with room for development.',
    red: 'Candidates below 50 points. May require additional training or experience.'
  };

  return (
    <Container className={className}>
      <Header>
        <HeaderTop>
          <BackButton onClick={handleBackToEvaluation}>
            ← Back
          </BackButton>
          <TitleSection>
            <Title>Talent Pool Dashboard</Title>
            <Subtitle>Manage and review your candidate pipeline</Subtitle>
          </TitleSection>
          <div style={{ width: '80px' }} /> {/* Spacer for centering */}
        </HeaderTop>

        <TabsContainer>
          <Tab
            active={activeTab === 'green'}
            tierColor={tierColors.green}
            onClick={() => handleTabClick('green')}
          >
            🟢 Green Tier
          </Tab>
          <Tab
            active={activeTab === 'yellow'}
            tierColor={tierColors.yellow}
            onClick={() => handleTabClick('yellow')}
          >
            🟡 Yellow Tier
          </Tab>
          <Tab
            active={activeTab === 'red'}
            tierColor={tierColors.red}
            onClick={() => handleTabClick('red')}
          >
            🔴 Red Tier
          </Tab>
        </TabsContainer>
      </Header>

      <StatsGrid>
        <StatCard
          borderColor={tierColors.green}
          onClick={() => handleViewCandidates('green')}
        >
          <StatHeader>
            <StatLabel>Green Tier</StatLabel>
            <StatIcon>🟢</StatIcon>
          </StatHeader>
          <StatValue>{loading ? '...' : stats.green}</StatValue>
          <StatDescription>
            Top-performing candidates (80-100 points)
          </StatDescription>
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            handleViewCandidates('green');
          }}>
            View Candidates
          </ActionButton>
        </StatCard>

        <StatCard
          borderColor={tierColors.yellow}
          onClick={() => handleViewCandidates('yellow')}
        >
          <StatHeader>
            <StatLabel>Yellow Tier</StatLabel>
            <StatIcon>🟡</StatIcon>
          </StatHeader>
          <StatValue>{loading ? '...' : stats.yellow}</StatValue>
          <StatDescription>
            Solid candidates with growth potential (50-79 points)
          </StatDescription>
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            handleViewCandidates('yellow');
          }}>
            View Candidates
          </ActionButton>
        </StatCard>

        <StatCard
          borderColor={tierColors.red}
          onClick={() => handleViewCandidates('red')}
        >
          <StatHeader>
            <StatLabel>Red Tier</StatLabel>
            <StatIcon>🔴</StatIcon>
          </StatHeader>
          <StatValue>{loading ? '...' : stats.red}</StatValue>
          <StatDescription>
            Candidates needing development (0-49 points)
          </StatDescription>
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            handleViewCandidates('red');
          }}>
            View Candidates
          </ActionButton>
        </StatCard>
      </StatsGrid>

      <InfoSection>
        <InfoTitle>About {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tier Candidates</InfoTitle>
        <InfoText>{tierDescriptions[activeTab]}</InfoText>
      </InfoSection>
    </Container>
  );
};

export default TalentPoolHome;
