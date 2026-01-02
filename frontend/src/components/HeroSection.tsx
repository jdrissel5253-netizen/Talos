import React from 'react';
import styled from 'styled-components';
import { CheckCircle } from 'lucide-react';

const HeroContainer = styled.section`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
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
  font-size: 4rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 2rem;
  line-height: 1.1;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2.75rem;
  }

  @media (max-width: 480px) {
    font-size: 2.25rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #a3a3a3;
  margin-bottom: 3rem;
  line-height: 1.7;
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
  color: #000000;
  padding: 1rem 3rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(74, 222, 128, 0.5);
    background-color: #5ce08e;

    &::before {
      left: 100%;
    }
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