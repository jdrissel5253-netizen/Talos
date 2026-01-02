import React, { useState } from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, XCircle, GraduationCap, ScrollText, BarChart3, Wrench, MapPin, CircleDollarSign, Clock, Target, TrendingUp, RefreshCw, Scale } from 'lucide-react';
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
              Talos doesn't just find candidates—it ranks them. Every applicant is scored out of 100 and sorted into three tiers: Green, Yellow, or Red. This way, you know exactly who's worth your time.
            </p>

            <FeatureBox>
              <FeatureText>
                Focus on quality candidates first. Skip the resume pile and interview the best candidates immediately.
              </FeatureText>
            </FeatureBox>

            <TierSection>
              <TierCard tierColor="#22c55e">
                <TierIcon><CheckCircle size={48} color="#22c55e" /></TierIcon>
                <TierName tierColor="#22c55e">Green Tier</TierName>
                <TierScore tierColor="#22c55e">80-100 Score</TierScore>
                <TierDescription>
                  Top-tier candidates who are highly likely to be successful hires. These candidates should be your first priority for interviews.
                </TierDescription>
                <TierFeatures>
                  <TierFeature>Highest match across all evaluation criteria</TierFeature>
                  <TierFeature>Strong indicators of long-term success</TierFeature>
                  <TierFeature>Minimal risk factors identified</TierFeature>
                  <TierFeature>Ready to interview immediately</TierFeature>
                  <TierFeature>Best ROI on your hiring time</TierFeature>
                </TierFeatures>
              </TierCard>

              <TierCard tierColor="#eab308">
                <TierIcon><AlertCircle size={48} color="#eab308" /></TierIcon>
                <TierName tierColor="#eab308">Yellow Tier</TierName>
                <TierScore tierColor="#eab308">50-79 Score</TierScore>
                <TierDescription>
                  Solid candidates with potential who may need additional screening or could be good fits with some training.
                </TierDescription>
                <TierFeatures>
                  <TierFeature>Moderate match with some trade-offs</TierFeature>
                  <TierFeature>Potential for growth and development</TierFeature>
                  <TierFeature>Worth deeper evaluation if Green tier exhausted</TierFeature>
                  <TierFeature>May excel with proper onboarding</TierFeature>
                  <TierFeature>Good backup candidate pool</TierFeature>
                </TierFeatures>
              </TierCard>

              <TierCard tierColor="#ef4444">
                <TierIcon><XCircle size={48} color="#ef4444" /></TierIcon>
                <TierName tierColor="#ef4444">Red Tier</TierName>
                <TierScore tierColor="#ef4444">0-49 Score</TierScore>
                <TierDescription>
                  Candidates who don't meet basic requirements or show concerning patterns. Consider only if desperately needed.
                </TierDescription>
                <TierFeatures>
                  <TierFeature>Low match across multiple factors</TierFeature>
                  <TierFeature>Significant gaps in qualifications</TierFeature>
                  <TierFeature>Higher risk of turnover or poor fit</TierFeature>
                  <TierFeature>Requires extensive training investment</TierFeature>
                  <TierFeature>Consider only as last resort</TierFeature>
                </TierFeatures>
              </TierCard>
            </TierSection>
          </ContentSection>

          <ContentSection>
            <ScoringTitle>Our Intelligent Evaluation Process</ScoringTitle>

            <p style={{ fontSize: '1.125rem', color: '#e0e0e0', lineHeight: '1.8', textAlign: 'center', marginBottom: '3rem', maxWidth: '900px', margin: '0 auto 3rem' }}>
              Our proprietary AI algorithm analyzes multiple data points from each candidate's resume, application, and background. The system evaluates technical qualifications, professional experience, and job-specific criteria to generate a comprehensive score from 0-100. This multi-factor assessment ensures you see the complete picture of each candidate's potential fit.
            </p>

            <ScoringGrid>
              <ScoringCard>
                <ScoringIcon><GraduationCap size={32} color="#4ade80" /></ScoringIcon>
                <ScoringCriterion>HVAC Experience Assessment</ScoringCriterion>
                <p style={{ color: '#e0e0e0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Our AI evaluates years of hands-on HVAC experience, the complexity of systems candidates have worked on, and their progression through increasingly challenging roles. The algorithm identifies patterns that indicate deep expertise and practical knowledge.
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon><ScrollText size={32} color="#4ade80" /></ScoringIcon>
                <ScoringCriterion>Credentials & Certifications</ScoringCriterion>
                <p style={{ color: '#e0e0e0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  The system scans for relevant certifications including EPA 608, NATE credentials, manufacturer-specific training, and state licenses. It also evaluates the recency and relevance of each certification to your specific job requirements.
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon><BarChart3 size={32} color="#4ade80" /></ScoringIcon>
                <ScoringCriterion>Employment Track Record</ScoringCriterion>
                <p style={{ color: '#e0e0e0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Our algorithm analyzes job stability, career progression patterns, tenure at previous positions, and the context around role changes. This helps identify candidates with strong commitment and upward mobility.
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon><Wrench size={32} color="#4ade80" /></ScoringIcon>
                <ScoringCriterion>Technical Competencies</ScoringCriterion>
                <p style={{ color: '#e0e0e0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  The AI evaluates specific HVAC skills mentioned in resumes, equipment familiarity, diagnostic abilities, and troubleshooting experience. It matches these competencies against your job description to find the best technical fits.
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon><MapPin size={32} color="#4ade80" /></ScoringIcon>
                <ScoringCriterion>Geographic Compatibility</ScoringCriterion>
                <p style={{ color: '#e0e0e0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Location analysis includes proximity to your job sites, commute feasibility, relocation indicators, travel willingness, and local market experience. This helps predict long-term retention and daily logistics.
                </p>
              </ScoringCard>

              <ScoringCard>
                <ScoringIcon><CircleDollarSign size={32} color="#4ade80" /></ScoringIcon>
                <ScoringCriterion>Compensation Expectations</ScoringCriterion>
                <p style={{ color: '#e0e0e0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  The system compares stated salary expectations, benefits requirements, and compensation history against your budget and market rates. This ensures alignment before you invest time in interviews.
                </p>
              </ScoringCard>
            </ScoringGrid>

            <div style={{ marginTop: '3rem', padding: '2rem', background: '#000000', borderRadius: '12px', border: '2px solid #4ade80' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4ade80', marginBottom: '1rem', textAlign: 'center' }}>
                Proprietary Scoring Formula
              </h4>
              <p style={{ color: '#e0e0e0', lineHeight: '1.8', textAlign: 'center', margin: 0 }}>
                Each evaluation criterion is weighted based on extensive industry research and hiring outcome data. Our proprietary algorithm combines these weighted factors using advanced machine learning to generate accurate, predictive candidate scores. The exact formula and weights are continuously refined to improve hiring success rates.
              </p>
            </div>
          </ContentSection>

          <ContentSection>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80', marginBottom: '2rem', textAlign: 'center' }}>
              Benefits of AI-Powered Ranking
            </h2>

            <BenefitsList>
              <BenefitCard>
                <BenefitIcon><Clock size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Save Time on Screening</BenefitTitle>
                <BenefitDescription>
                  Stop wasting time on unqualified candidates. Focus your energy on Green tier candidates who are most likely to succeed.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><Target size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Reduce Hiring Mistakes</BenefitTitle>
                <BenefitDescription>
                  AI scoring reduces bias and human error in initial candidate evaluation, leading to better hiring decisions.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><TrendingUp size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Improve Hire Quality</BenefitTitle>
                <BenefitDescription>
                  By focusing on top-ranked candidates, you'll consistently hire higher-quality technicians who stay longer.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><RefreshCw size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Reduce Turnover</BenefitTitle>
                <BenefitDescription>
                  Better candidate matching leads to employees who are happier in their roles and more likely to stay long-term.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><Scale size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Consistent Evaluation</BenefitTitle>
                <BenefitDescription>
                  Every candidate is evaluated using the same criteria, ensuring fair and consistent assessment across all applicants.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><BarChart3 size={40} color="#4ade80" /></BenefitIcon>
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