import React from 'react';
import styled from 'styled-components';
import { CheckCircle } from 'lucide-react';
import AirflowAnimation from './AirflowAnimation';

const HeroContainer = styled.section`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000000;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;





const HeroLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  z-index: 2;
  position: relative;
`;



const HeroContent = styled.div`
  max-width: 800px;
  text-align: center;
  z-index: 2;
  position: relative;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 2rem;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #e0e0e0;
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButton = styled.button`
  background-color: #4ade80;
  border: none;
  color: white;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);

  &:hover {
    background-color: #4ade80;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 222, 128, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TrustIndicators = styled.div`
  margin-top: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
  opacity: 0.7;

  @media (max-width: 768px) {
    gap: 2rem;
    margin-top: 3rem;
  }
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: 500;
`;



interface HeroSectionProps {
  onDemoClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onDemoClick }) => {
  return (
    <HeroContainer>
      <AirflowAnimation />
      <HeroLayout>
        <HeroContent>
          <HeroTitle>
            The key to finding reliable technicians
          </HeroTitle>
          <HeroSubtitle>
            Streamline your HVAC hiring process with automated sourcing,
            job board posting, and intelligent candidate ranking.
            Find the right talent faster.
          </HeroSubtitle>
          <CTAButton onClick={onDemoClick}>
            Get Demo
          </CTAButton>

          <TrustIndicators>
            <TrustBadge>
              <CheckCircle size={18} color="#4ade80" />
              15+ Job Boards
            </TrustBadge>
            <TrustBadge>
              <CheckCircle size={18} color="#4ade80" />
              AI-Powered Matching
            </TrustBadge>
            <TrustBadge>
              <CheckCircle size={18} color="#4ade80" />
              HVAC-Specialized
            </TrustBadge>
          </TrustIndicators>
        </HeroContent>
      </HeroLayout>
    </HeroContainer>
  );
};

export default HeroSection;