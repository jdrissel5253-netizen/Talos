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
                  <StepTitle>Input Job Details</StepTitle>
                  <StepDescription>
                    Provide basic information: position type, experience level, location, and any specific requirements.
                  </StepDescription>
                </ProcessStep>

                <ProcessStep>
                  <StepNumber>2</StepNumber>
                  <StepTitle>AI Generates Description</StepTitle>
                  <StepDescription>
                    Our HVAC-trained AI creates a compelling job description using industry-specific language and requirements.
                  </StepDescription>
                </ProcessStep>

                <ProcessStep>
                  <StepNumber>3</StepNumber>
                  <StepTitle>Customize & Refine</StepTitle>
                  <StepDescription>
                    Review and adjust the tone, add company-specific details, or modify requirements to match your needs.
                  </StepDescription>
                </ProcessStep>

                <ProcessStep>
                  <StepNumber>4</StepNumber>
                  <StepTitle>Post Instantly</StepTitle>
                  <StepDescription>
                    Once satisfied, post your optimized job description to multiple job boards with a single click.
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
                <RoleIcon>🔧</RoleIcon>
                <RoleName>HVAC Technician</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>❄️</RoleIcon>
                <RoleName>Refrigeration Tech</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>🏠</RoleIcon>
                <RoleName>Residential HVAC</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>🏢</RoleIcon>
                <RoleName>Commercial HVAC</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>⚙️</RoleIcon>
                <RoleName>Service Technician</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>🔨</RoleIcon>
                <RoleName>Installation Tech</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>👨‍💼</RoleIcon>
                <RoleName>HVAC Sales Rep</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>📊</RoleIcon>
                <RoleName>Field Supervisor</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>🎓</RoleIcon>
                <RoleName>HVAC Apprentice</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>📋</RoleIcon>
                <RoleName>Service Manager</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>🔍</RoleIcon>
                <RoleName>HVAC Inspector</RoleName>
              </RoleCard>
              <RoleCard>
                <RoleIcon>⚡</RoleIcon>
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
                <BenefitIcon>🎯</BenefitIcon>
                <BenefitTitle>Industry-Specific Language</BenefitTitle>
                <BenefitDescription>
                  Uses terminology and requirements that HVAC professionals understand and respond to, improving application quality.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>📈</BenefitIcon>
                <BenefitTitle>Optimized for Results</BenefitTitle>
                <BenefitDescription>
                  Based on analysis of thousands of successful HVAC job postings to maximize candidate attraction and conversion.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>⏱️</BenefitIcon>
                <BenefitTitle>Save Hours of Work</BenefitTitle>
                <BenefitDescription>
                  No more struggling with blank pages or copying generic templates. Get professional descriptions in minutes.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>🔧</BenefitIcon>
                <BenefitTitle>Certification Requirements</BenefitTitle>
                <BenefitDescription>
                  Automatically includes relevant certifications, licenses, and technical requirements for each HVAC role.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <BenefitIcon>🌡️</BenefitIcon>
                <BenefitTitle>Seasonal Considerations</BenefitTitle>
                <BenefitDescription>
                  Accounts for seasonal demands, peak periods, and geographic climate considerations in job descriptions.
                </BenefitDescription>
              </BenefitCard>

              <BenefitCard>
                <RoleIcon>✍️</RoleIcon>
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