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

const FeatureBox = styled.div`
  background: linear-gradient(135deg, #4ade80 0%, #4ade80 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem auto;
  max-width: 700px;
  text-align: center;
`;

const FeatureText = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.6;
  margin: 0;
`;

const TierSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const TierCard = styled.div<{ tierColor: string }>`
  background: #1a1a1a;
  border: 3px solid ${props => props.tierColor};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.tierColor};
  }
`;

const TierIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const TierName = styled.h3<{ tierColor: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.tierColor};
  margin-bottom: 1rem;
`;

const TierScore = styled.div<{ tierColor: string }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.tierColor};
  margin-bottom: 1rem;
`;

const TierDescription = styled.p`
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const TierFeatures = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
`;

const TierFeature = styled.li`
  padding: 0.5rem 0;
  color: #e0e0e0;

  &::before {
    content: '✓ ';
    color: #4ade80;
    font-weight: bold;
    margin-right: 0.5rem;
  }
`;

const ScoringSection = styled.div`
  margin: 3rem 0;
`;

const ScoringTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #4ade80;
  text-align: center;
  margin-bottom: 2rem;
`;

const ScoringGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ScoringCard = styled.div`
  background: #000000;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #4ade80;
`;

const ScoringIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const ScoringCriterion = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 0.5rem;
`;

const ScoringWeight = styled.span`
  font-size: 0.875rem;
  color: #e0e0e0;
  font-weight: 600;
`;

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const BenefitCard = styled.div`
  background: #000000;
  padding: 2rem;
  border-radius: 12px;
  border-left: 4px solid #4ade80;
`;

const BenefitIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const BenefitTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 1rem;
`;

const BenefitDescription = styled.p`
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

const CandidateRanking: React.FC = () => {
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
            <MainTitle>Candidate Ranking System</MainTitle>
            <MainSubtitle>
              AI-powered candidate scoring with Green, Yellow, and Red tier classification
            </MainSubtitle>
          </HeroSection>

          <ContentSection>
            <p style={{ fontSize: '1.125rem', color: '#333', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
              Talos doesn't just find candidates—it ranks them. Every applicant is scored out of 10 and sorted into three tiers: Green, Yellow, or Red. This way, you know exactly who's worth your time.
            </p>

            <FeatureBox>
              <FeatureText>
                Focus on quality candidates first. Skip the resume pile and interview the best candidates immediately.
              </FeatureText>
            </FeatureBox>

            <TierSection>
              <TierCard tierColor="#22c55e">
                <TierIcon>🟢</TierIcon>
                <TierName tierColor="#22c55e">Green Tier</TierName>
                <TierScore tierColor="#22c55e">8-10 Score</TierScore>
                <TierDescription>
                  Top-tier candidates who are highly likely to be successful hires. These candidates should be your first priority for interviews.
                </TierDescription>
                <TierFeatures>
                  <TierFeature>Extensive HVAC experience</TierFeature>
                  <TierFeature>Relevant certifications</TierFeature>
                  <TierFeature>Strong work history</TierFeature>
                  <TierFeature>Geographic match</TierFeature>
                  <TierFeature>Salary expectations aligned</TierFeature>
                </TierFeatures>
              </TierCard>

              <TierCard tierColor="#eab308">
                <TierIcon>🟡</TierIcon>
                <TierName tierColor="#eab308">Yellow Tier</TierName>
                <TierScore tierColor="#eab308">5-7 Score</TierScore>
                <TierDescription>
                  Solid candidates with potential who may need additional screening or could be good fits with some training.
                </TierDescription>
                <TierFeatures>
                  <TierFeature>Some HVAC experience</TierFeature>
                  <TierFeature>Basic certifications</TierFeature>
                  <TierFeature>Decent work history</TierFeature>
                  <TierFeature>May need additional training</TierFeature>
                  <TierFeature>Good cultural fit potential</TierFeature>
                </TierFeatures>
              </TierCard>

              <TierCard tierColor="#ef4444">
                <TierIcon>🔴</TierIcon>
                <TierName tierColor="#ef4444">Red Tier</TierName>
                <TierScore tierColor="#ef4444">1-4 Score</TierScore>
                <TierDescription>
                  Candidates who don't meet basic requirements or show concerning patterns. Consider only if desperately needed.
                </TierDescription>
                <TierFeatures>
                  <TierFeature>Limited or no HVAC experience</TierFeature>
                  <TierFeature>Missing required certifications</TierFeature>
                  <TierFeature>Gaps in work history</TierFeature>
                  <TierFeature>Location mismatch</TierFeature>
                  <TierFeature>Salary expectations misaligned</TierFeature>
                </TierFeatures>
              </TierCard>
            </TierSection>
          </ContentSection>

          <ContentSection>
            <ScoringTitle>How We Score Candidates</ScoringTitle>

            <ScoringGrid>
              <ScoringCard>
                <ScoringIcon>🎓</ScoringIcon>
                <ScoringCriterion>HVAC Experience</ScoringCriterion>
                <ScoringWeight>Weight: 25%</ScoringWeight>
                <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Years of hands-on HVAC experience, complexity of systems worked on
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon>📜</ScoringIcon>
                <ScoringCriterion>Certifications</ScoringCriterion>
                <ScoringWeight>Weight: 20%</ScoringWeight>
                <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  EPA 608, NATE, manufacturer certifications, state licenses
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon>📊</ScoringIcon>
                <ScoringCriterion>Work History</ScoringCriterion>
                <ScoringWeight>Weight: 20%</ScoringWeight>
                <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Job stability, progression, reasons for leaving previous positions
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon>🔧</ScoringIcon>
                <ScoringCriterion>Technical Skills</ScoringCriterion>
                <ScoringWeight>Weight: 15%</ScoringWeight>
                <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Specific HVAC skills, equipment familiarity, troubleshooting ability
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon>📍</ScoringIcon>
                <ScoringCriterion>Location Match</ScoringCriterion>
                <ScoringWeight>Weight: 10%</ScoringWeight>
                <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Proximity to job site, willingness to travel, local market knowledge
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon>💰</ScoringIcon>
                <ScoringCriterion>Salary Alignment</ScoringCriterion>
                <ScoringWeight>Weight: 10%</ScoringWeight>
                <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Salary expectations vs. budget, benefits expectations, flexibility
                </p>
              </ScoringCard>
            </ScoringGrid>
          </ContentSection>

          <ContentSection>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80', marginBottom: '2rem', textAlign: 'center' }}>
              Benefits of AI-Powered Ranking
            </h2>

            <BenefitsList>
              <BenefitCard>
                <BenefitIcon>⏱️</BenefitIcon>
                <BenefitTitle>Save Time on Screening</BenefitTitle>
                <BenefitDescription>
                  Stop wasting time on unqualified candidates. Focus your energy on Green tier candidates who are most likely to succeed.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>🎯</BenefitIcon>
                <BenefitTitle>Reduce Hiring Mistakes</BenefitTitle>
                <BenefitDescription>
                  AI scoring reduces bias and human error in initial candidate evaluation, leading to better hiring decisions.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>📈</BenefitIcon>
                <BenefitTitle>Improve Hire Quality</BenefitTitle>
                <BenefitDescription>
                  By focusing on top-ranked candidates, you'll consistently hire higher-quality technicians who stay longer.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>🔄</BenefitIcon>
                <BenefitTitle>Reduce Turnover</BenefitTitle>
                <BenefitDescription>
                  Better candidate matching leads to employees who are happier in their roles and more likely to stay long-term.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>⚖️</BenefitIcon>
                <BenefitTitle>Consistent Evaluation</BenefitTitle>
                <BenefitDescription>
                  Every candidate is evaluated using the same criteria, ensuring fair and consistent assessment across all applicants.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>📊</BenefitIcon>
                <BenefitTitle>Data-Driven Insights</BenefitTitle>
                <BenefitDescription>
                  Track which scoring factors correlate with successful hires and continuously improve your hiring process.
                </BenefitDescription>
              </BenefitCard>
            </BenefitsList>
          </ContentSection>

          <CTASection>
            <CTAButton onClick={handleDemoClick}>
              See Candidate Ranking in Action
            </CTAButton>
          </CTASection>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default CandidateRanking;