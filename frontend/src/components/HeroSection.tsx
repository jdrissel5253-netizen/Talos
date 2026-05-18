import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');
`;

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
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3rem, 6vw, 5.5rem);
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 2rem;
  line-height: 1.08;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2.75rem;
  }

  @media (max-width: 480px) {
    font-size: 2.25rem;
  }
`;

const HeroSubtitle = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 1.15rem;
  font-weight: 300;
  color: #8a9ab0;
  margin-bottom: 3rem;
  line-height: 1.8;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
`;

const CTAGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const JobsLink = styled(Link)`
  display: inline-block;
  background: transparent;
  border: 1px solid rgba(74,222,128,0.4);
  color: #4ade80;
  padding: 0.9rem 2rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(74,222,128,0.06);
    border-color: #4ade80;
    transform: translateY(-2px);
  }
`;

const CTAButton = styled.button`
  background: #4ade80;
  border: none;
  color: #0a0f0a;
  padding: 0.9rem 2.5rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: #6ee89a;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(74,222,128,0.25);
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
  font-family: 'DM Sans', sans-serif;
  color: #8a9ab0;
  font-size: 0.875rem;
  font-weight: 500;
`;

interface HeroSectionProps {
  onDemoClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onDemoClick }) => {
  return (
    <>
      <FontImport />
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
            <CTAGroup>
              <CTAButton onClick={onDemoClick}>
                Get Demo
              </CTAButton>
            </CTAGroup>

            <TrustIndicators>
              <TrustBadge>
                <CheckCircle size={16} color="#4ade80" />
                Top Job Boards
              </TrustBadge>
              <TrustBadge>
                <CheckCircle size={16} color="#4ade80" />
                AI-Powered Matching
              </TrustBadge>
              <TrustBadge>
                <CheckCircle size={16} color="#4ade80" />
                HVAC-Specialized
              </TrustBadge>
            </TrustIndicators>
          </HeroContent>
        </HeroLayout>
      </HeroContainer>
    </>
  );
};

export default HeroSection;
