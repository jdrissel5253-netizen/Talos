import React, { useState } from 'react';
import styled from 'styled-components';
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
  max-width: 800px;
  text-align: center;
`;

const HighlightText = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.6;
  margin: 0;
`;

const ComparisonSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 3rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonCard = styled.div`
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
`;

const OldWayCard = styled(ComparisonCard)`
  background: #ffebee;
  border: 2px solid #f44336;
`;

const NewWayCard = styled(ComparisonCard)`
  background: #e8f5e8;
  border: 2px solid #4ade80;
`;

const ComparisonTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const OldWayTitle = styled(ComparisonTitle)`
  color: #d32f2f;
`;

const NewWayTitle = styled(ComparisonTitle)`
  color: #4ade80;
`;

const ComparisonList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ComparisonItem = styled.li`
  padding: 0.5rem 0;
  line-height: 1.5;
`;

const OldWayItem = styled(ComparisonItem)`
  color: #e0e0e0;

  &::before {
    content: '❌ ';
    margin-right: 0.5rem;
  }
`;

const NewWayItem = styled(ComparisonItem)`
  color: #e0e0e0;

  &::before {
    content: '✅ ';
    margin-right: 0.5rem;
  }
`;

const FeatureGrid = styled.div`
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
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
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
  box-shadow: 0 4px 15px rgba(26, 90, 58, 0.3);

  &:hover {
    background-color: #4ade80;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 90, 58, 0.4);
  }
`;

const WhyTalosDifferent: React.FC = () => {
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
            <MainTitle>Why Talos Is Different</MainTitle>
            <MainSubtitle>
              The first true AI recruiting expert built exclusively for HVAC
            </MainSubtitle>
          </HeroSection>

          <ContentSection>
            <ContentText>
              Talos was built from the ground up for HVAC companies, and only HVAC companies. After countless hours of research, it was designed to patch the cracks that cause technician turnover and bridge the gap between dependable candidates and employers.
            </ContentText>

            <HighlightBox>
              <HighlightText>
                The method is simple: Talos uses AI trained specifically for HVAC. Job descriptions are written to attract the right kind of techs. Candidates are rated against benchmarks built on the best workers in each role. Talos is the first true AI recruiting expert in HVAC.
              </HighlightText>
            </HighlightBox>
          </ContentSection>

          <ContentSection>
            <SectionTitle>Generic Recruiting vs. Talos</SectionTitle>

            <ComparisonSection>
              <OldWayCard>
                <OldWayTitle>Generic Recruiting Platforms</OldWayTitle>
                <ComparisonList>
                  <OldWayItem>One-size-fits-all approach</OldWayItem>
                  <OldWayItem>Generic job description templates</OldWayItem>
                  <OldWayItem>No industry-specific screening</OldWayItem>
                  <OldWayItem>Manual candidate ranking</OldWayItem>
                  <OldWayItem>High turnover rates</OldWayItem>
                  <OldWayItem>Expensive staffing agency fees</OldWayItem>
                  <OldWayItem>Weeks of sourcing time</OldWayItem>
                </ComparisonList>
              </OldWayCard>

              <NewWayCard>
                <NewWayTitle>Talos HVAC-Specific Platform</NewWayTitle>
                <ComparisonList>
                  <NewWayItem>Built exclusively for HVAC</NewWayItem>
                  <NewWayItem>HVAC-optimized job descriptions</NewWayItem>
                  <NewWayItem>Industry-specific AI screening</NewWayItem>
                  <NewWayItem>AI-powered candidate ranking</NewWayItem>
                  <NewWayItem>Reduced turnover with better matching</NewWayItem>
                  <NewWayItem>No staffing agency fees</NewWayItem>
                  <NewWayItem>Top candidates in 3 clicks</NewWayItem>
                </ComparisonList>
              </NewWayCard>
            </ComparisonSection>
          </ContentSection>

          <ContentSection>
            <SectionTitle>What Makes Our AI Different</SectionTitle>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>🎯</FeatureIcon>
                <FeatureTitle>HVAC-Trained AI</FeatureTitle>
                <FeatureDescription>
                  Our AI has been specifically trained on HVAC roles, understanding the nuances between residential, commercial, and service technicians.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>📊</FeatureIcon>
                <FeatureTitle>Industry Benchmarks</FeatureTitle>
                <FeatureDescription>
                  Candidates are scored against proven benchmarks from top-performing HVAC professionals, not generic criteria.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>🔍</FeatureIcon>
                <FeatureTitle>Deep Industry Knowledge</FeatureTitle>
                <FeatureDescription>
                  Understands HVAC certifications, seasonal demands, geographic considerations, and company culture fits.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>⚡</FeatureIcon>
                <FeatureTitle>Continuous Learning</FeatureTitle>
                <FeatureDescription>
                  Our AI constantly learns from successful hires and failed placements to improve matching accuracy.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>🛠️</FeatureIcon>
                <FeatureTitle>Technical Expertise</FeatureTitle>
                <FeatureDescription>
                  Evaluates candidates based on specific HVAC skills, from basic installation to advanced diagnostics.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>📈</FeatureIcon>
                <FeatureTitle>Predictive Analytics</FeatureTitle>
                <FeatureDescription>
                  Predicts candidate success and longevity based on historical data from the HVAC industry.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
          </ContentSection>

          <CTASection>
            <CTAButton onClick={handleDemoClick}>
              Experience the Difference - Get Your Demo
            </CTAButton>
          </CTASection>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default WhyTalosDifferent;