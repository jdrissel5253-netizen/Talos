import React, { useState } from 'react';
import styled from 'styled-components';
import { Zap, Target, RefreshCw } from 'lucide-react';
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
    pointer-events: none;
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
  background: linear-gradient(to right, #ffffff, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
// ... (omitted styles) ...

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

// Removed duplicate styles

const ProcessBox = styled.div`
  background: linear-gradient(135deg, #4ade80 0%, #4ade80 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem auto;
  max-width: 600px;
  text-align: center;
`;

const ProcessText = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
`;

const JobBoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
`;

const JobBoardCard = styled.div`
  background: #000000;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #333333;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4ade80;
    transform: translateY(-2px);
  }
`;

const JobBoardLogo = styled.img`
  width: 120px;
  height: 60px;
  object-fit: contain;
  margin: 0 auto 1rem;
  display: block;
  background: white;
  padding: 0.5rem;
  border-radius: 8px;
`;

const JobBoardName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 0.5rem;
`;

const JobBoardStatus = styled.span`
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
`;

const ActiveStatus = styled(JobBoardStatus)`
  background: #d4edda;
  color: #155724;
`;

const ComingSoonStatus = styled(JobBoardStatus)`
  background: #fff3cd;
  color: #856404;
`;

const FeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const FeatureCard = styled.div`
  background: #000000;
  padding: 2rem;
  border-radius: 12px;
  border-left: 4px solid #4ade80;
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #e0e0e0;
  line-height: 1.6;
`;

const CTASection = styled.section`
  text-align: center;
  margin-top: 4rem;
`;


const JobBoardIntegration: React.FC = () => {
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
            <MainTitle>Job Board Integration</MainTitle>
            <MainSubtitle>
              Post your job once. Let Talos handle the rest.
            </MainSubtitle>
          </HeroSection>

          <ContentSection>
            <p style={{ fontSize: '1.125rem', color: '#e0e0e0', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
              Posting a job through Talos takes minutes, not an afternoon. Fill out your job details once and your listing goes live — no copying and pasting across platforms, no reformatting, no juggling logins.
            </p>

            <ProcessBox>
              <ProcessText>
                Three clicks. Five minutes. Your job is live.
              </ProcessText>
            </ProcessBox>
          </ContentSection>

          <ContentSection>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80', marginBottom: '2rem', textAlign: 'center' }}>
              How it works
            </h2>

            <FeatureList>
              <FeatureCard>
                <FeatureIcon><Zap size={40} color="#4ade80" /></FeatureIcon>
                <FeatureTitle>Post in minutes</FeatureTitle>
                <FeatureDescription>
                  Fill out your job details once inside Talos and your listing goes live. No platform-hopping, no reformatting.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><Target size={40} color="#4ade80" /></FeatureIcon>
                <FeatureTitle>Built for HVAC hiring</FeatureTitle>
                <FeatureDescription>
                  Your posting is structured around the details that matter to HVAC candidates — certifications, pay type, schedule, and more.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon><RefreshCw size={40} color="#4ade80" /></FeatureIcon>
                <FeatureTitle>Candidates flow straight in</FeatureTitle>
                <FeatureDescription>
                  Every applicant who comes through gets scored and ranked automatically — so by the time you open your pipeline, the work is already done.
                </FeatureDescription>
              </FeatureCard>
            </FeatureList>
          </ContentSection>

          <CTASection>
            <CTAButton onClick={handleDemoClick}>
              See How It Works
            </CTAButton>
          </CTASection>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default JobBoardIntegration;