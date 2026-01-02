import React, { useState } from 'react';
import styled from 'styled-components';
import { Wrench, Snowflake, Home, Building2, Settings, Hammer, Briefcase, BarChart3, GraduationCap, ClipboardList, Search, Zap, Target, TrendingUp, Clock, Thermometer, PenTool } from 'lucide-react';
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

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
`;

const RoleCard = styled.div`
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

const RoleIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const RoleName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #4ade80;
  margin: 0;
`;

const ProcessSection = styled.div`
  margin: 3rem 0;
`;

const ProcessTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4ade80;
  text-align: center;
  margin-bottom: 2rem;
`;

const ProcessSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const ProcessStep = styled.div`
  text-align: center;
  padding: 1.5rem;
`;

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  background: #4ade80;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  margin: 0 auto 1rem;
`;

const StepTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  color: #e0e0e0;
  line-height: 1.5;
  font-size: 0.875rem;
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

const JobDescriptionWriter: React.FC = () => {
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
            <MainTitle>Job Description Writer</MainTitle>
            <MainSubtitle>
              AI-generated, HVAC-specific job descriptions that attract reliable candidates
            </MainSubtitle>
          </HeroSection>

          <ContentSection>
            <p style={{ fontSize: '1.125rem', color: '#333', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
              Give Talos a few key details, and it will generate a complete HVAC-specific job description for you. With training across 20+ HVAC positions, the wording is tuned to attract reliable candidates.
            </p>

            <FeatureBox>
              <FeatureText>
                Prefer to put your own spin on it? You can adjust the tone before posting.
              </FeatureText>
            </FeatureBox>

            <ProcessSection>
              <ProcessTitle>How It Works</ProcessTitle>
              <ProcessSteps>
                <ProcessStep>
                  <StepNumber>1</StepNumber>
                  <StepTitle>Smart Input Processing</StepTitle>
                  <StepDescription>
                    Our AI analyzes your job requirements and company information to understand exactly what kind of candidate you need.
                  </StepDescription>
                </ProcessStep>

                <ProcessStep>
                  <StepNumber>2</StepNumber>
                  <StepTitle>Intelligent Content Generation</StepTitle>
                  <StepDescription>
                    Advanced algorithms trained on successful HVAC job postings craft compelling, industry-specific descriptions that resonate with qualified candidates.
                  </StepDescription>
                </ProcessStep>

                <ProcessStep>
                  <StepNumber>3</StepNumber>
                  <StepTitle>Optimization & Refinement</StepTitle>
                  <StepDescription>
                    The system refines language, tone, and structure based on data from thousands of high-performing HVAC job listings to maximize candidate engagement.
                  </StepDescription>
                </ProcessStep>

                <ProcessStep>
                  <StepNumber>4</StepNumber>
                  <StepTitle>Multi-Channel Distribution</StepTitle>
                  <StepDescription>
                    Your polished job description is formatted and ready for seamless distribution across all major job platforms with optimized visibility.
                  </StepDescription>
                </ProcessStep>
              </ProcessSteps>
            </ProcessSection>
          </ContentSection>

          <ContentSection>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80', marginBottom: '2rem', textAlign: 'center' }}>
              20+ HVAC Positions Covered
            </h2>

            <RoleGrid>
              <RoleCard>
                <RoleIcon><Wrench size={32} color="#4ade80" /></RoleIcon>
                <RoleName>HVAC Technician</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><Snowflake size={32} color="#4ade80" /></RoleIcon>
                <RoleName>Refrigeration Tech</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><Home size={32} color="#4ade80" /></RoleIcon>
                <RoleName>Residential HVAC</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><Building2 size={32} color="#4ade80" /></RoleIcon>
                <RoleName>Commercial HVAC</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><Settings size={32} color="#4ade80" /></RoleIcon>
                <RoleName>Service Technician</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><Hammer size={32} color="#4ade80" /></RoleIcon>
                <RoleName>Installation Tech</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><Briefcase size={32} color="#4ade80" /></RoleIcon>
                <RoleName>HVAC Sales Rep</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><BarChart3 size={32} color="#4ade80" /></RoleIcon>
                <RoleName>Field Supervisor</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><GraduationCap size={32} color="#4ade80" /></RoleIcon>
                <RoleName>HVAC Apprentice</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><ClipboardList size={32} color="#4ade80" /></RoleIcon>
                <RoleName>Service Manager</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><Search size={32} color="#4ade80" /></RoleIcon>
                <RoleName>HVAC Inspector</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon><Zap size={32} color="#4ade80" /></RoleIcon>
                <RoleName>Controls Technician</RoleName>
              </RoleCard>
            </RoleGrid>
          </ContentSection>

          <ContentSection>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80', marginBottom: '2rem', textAlign: 'center' }}>
              Why Our AI-Generated Descriptions Work Better
            </h2>

            <BenefitsList>
              <BenefitCard>
                <BenefitIcon><Target size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Industry-Specific Language</BenefitTitle>
                <BenefitDescription>
                  Uses terminology and requirements that HVAC professionals understand and respond to, improving application quality.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><TrendingUp size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Optimized for Results</BenefitTitle>
                <BenefitDescription>
                  Based on analysis of thousands of successful HVAC job postings to maximize candidate attraction and conversion.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><Clock size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Save Hours of Work</BenefitTitle>
                <BenefitDescription>
                  No more struggling with blank pages or copying generic templates. Get professional descriptions in minutes.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><Wrench size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Certification Requirements</BenefitTitle>
                <BenefitDescription>
                  Automatically includes relevant certifications, licenses, and technical requirements for each HVAC role.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon><Thermometer size={40} color="#4ade80" /></BenefitIcon>
                <BenefitTitle>Seasonal Considerations</BenefitTitle>
                <BenefitDescription>
                  Accounts for seasonal demands, peak periods, and geographic climate considerations in job descriptions.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <RoleIcon><PenTool size={40} color="#4ade80" /></RoleIcon>
                <BenefitTitle>Customizable Tone</BenefitTitle>
                <BenefitDescription>
                  Adjust the description tone to match your company culture - from corporate professional to family-friendly local business.
                </BenefitDescription>
              </BenefitCard>
            </BenefitsList>
          </ContentSection>

          <CTASection>
            <CTAButton onClick={handleDemoClick}>
              Try the Job Description Writer
            </CTAButton>
          </CTASection>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default JobDescriptionWriter;