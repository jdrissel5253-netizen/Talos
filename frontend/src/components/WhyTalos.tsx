import React, { useState } from 'react';
import styled from 'styled-components';
import { Target, Zap, DollarSign, Repeat, TrendingUp, Filter } from 'lucide-react';
import DemoModal from './DemoModal';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    z-index: 1;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 4rem;
`;

const MainTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const MainSubtitle = styled.p`
  font-size: 1.25rem;
  color: #e0e0e0;
  max-width: 800px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const ContentSection = styled.section`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ContentText = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  text-align: center;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
`;

const HighlightBox = styled.div`
  background: linear-gradient(135deg, #4ade80 0%, #4ade80 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem auto;
  max-width: 700px;
  text-align: center;
`;

const HighlightText = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.6;
  margin: 0;
`;

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  margin: 4rem 0;
`;

const BenefitCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
`;

const IconWrapper = styled.div`
  margin-bottom: 1.5rem;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  padding: 1rem;
  border-radius: 8px;
  display: inline-flex;
`;

const BenefitTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
`;

const BenefitDescription = styled.p`
  color: #a3a3a3;
  line-height: 1.6;
  font-size: 1.125rem;
`;

const CTASection = styled.section`
  text-align: center;
  margin-top: 4rem;
`;

const CTAButton = styled.button`
  background-color: #4ade80;
  border: none;
  color: #000000;
  padding: 1rem 2.5rem;
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

const WhyTalos: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleDemoClick = () => {
    setIsDemoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDemoModalOpen(false);
  };

  return (
    <>
      <PageContainer>
        <ContentWrapper>
          <HeroSection>
            <MainTitle>Why Talos?</MainTitle>
            <MainSubtitle>
              The premium recruiting tool built exclusively for HVAC companies
            </MainSubtitle>
          </HeroSection>

          <ContentSection>
            <ContentText>
              Imagine a world where finding reliable techs isn't a grind. Imagine stepping into the shoes of a seasoned recruiter—without years of experience. Or picture your recruiting team with a tool that cranks up efficiency and pulls in top talent like a lion cutting through a school of fish.
            </ContentText>

            <HighlightBox>
              <HighlightText>
                Talos is the premium recruiting tool built only for HVAC. Reliable technicians = repeat clients. Repeat clients = more money. Top-notch HVAC salespeople = more meetings. More meetings = more money.
              </HighlightText>
            </HighlightBox>

            <ContentText>
              Talos is tailored specifically for HVAC companies—no other industries, no extra noise. Its only mission: solve HVAC turnover and help owners and recruiters quickly find reliable workers without wasting time sourcing.
            </ContentText>

            <ContentText>
              With Talos, interviews with top candidates are just three clicks away. And here's the kicker: you'll never pay a staffing agency again.
            </ContentText>
          </ContentSection>

          <ContentSection>
            <SectionTitle>What This Means for Your Business</SectionTitle>

            <BenefitsList>
              <BenefitCard>
                <IconWrapper>
                  <Target size={32} />
                </IconWrapper>
                <BenefitTitle>HVAC-Specific Focus</BenefitTitle>
                <BenefitDescription>
                  No generic solutions. Every feature is designed specifically for HVAC hiring challenges, from technician roles to sales positions.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <IconWrapper>
                  <Zap size={32} />
                </IconWrapper>
                <BenefitTitle>Lightning-Fast Results</BenefitTitle>
                <BenefitDescription>
                  From job posting to top candidate interviews in just three clicks. No more weeks of sourcing and screening.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <IconWrapper>
                  <DollarSign size={32} />
                </IconWrapper>
                <BenefitTitle>Cost Savings</BenefitTitle>
                <BenefitDescription>
                  Eliminate expensive staffing agency fees. Talos pays for itself with just one successful hire.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <IconWrapper>
                  <Repeat size={32} />
                </IconWrapper>
                <BenefitTitle>Reduce Turnover</BenefitTitle>
                <BenefitDescription>
                  AI-powered matching ensures you find candidates who are the right fit for your company culture and requirements.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <IconWrapper>
                  <TrendingUp size={32} />
                </IconWrapper>
                <BenefitTitle>Scale Your Team</BenefitTitle>
                <BenefitDescription>
                  Whether you need one tech or fifty, Talos scales with your business needs without missing a beat.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <IconWrapper>
                  <Filter size={32} />
                </IconWrapper>
                <BenefitTitle>Quality Over Quantity</BenefitTitle>
                <BenefitDescription>
                  Stop wading through hundreds of unqualified resumes. Get pre-ranked, HVAC-ready candidates delivered to you.
                </BenefitDescription>
              </BenefitCard>
            </BenefitsList>
          </ContentSection>

          <CTASection>
            <CTAButton onClick={handleDemoClick}>
              See Talos in Action - Get Your Demo
            </CTAButton>
          </CTASection>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default WhyTalos;