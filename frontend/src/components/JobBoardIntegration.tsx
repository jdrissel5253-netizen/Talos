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
              Post to 5+ job boards instantly, scaling to 15 platforms
            </MainSubtitle>
          </HeroSection>

          <ContentSection>
            <p style={{ fontSize: '1.125rem', color: '#333', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
              With Talos, you can post a job description to 5+ job boards instantly—and we're scaling to 15. You'll have quick access to Indeed, ZipRecruiter, HVAC Insider, and more. For Indeed, you'll even have the option to sponsor postings for a small fee.
            </p>

            <ProcessBox>
              <ProcessText>
                Our method: three clicks, five minutes, and your job is live.
              </ProcessText>
            </ProcessBox>

            <JobBoardGrid>
              <JobBoardCard>
                <JobBoardLogo src="https://upload.wikimedia.org/wikipedia/commons/f/fc/Indeed_logo.svg" alt="Indeed Logo" />
                <JobBoardName>Indeed</JobBoardName>
                <ActiveStatus>Active</ActiveStatus>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  Optional sponsoring available
                </p>
              </JobBoardCard>

              <JobBoardCard>
                <JobBoardLogo src="https://upload.wikimedia.org/wikipedia/commons/6/64/ZipRecruiter_logo.svg" alt="ZipRecruiter Logo" />
                <JobBoardName>ZipRecruiter</JobBoardName>
                <ActiveStatus>Active</ActiveStatus>
              </JobBoardCard>

              <JobBoardCard>
                <JobBoardLogo src="https://via.placeholder.com/120x60/4ade80/000000?text=HVAC+Insider" alt="HVAC Insider Logo" />
                <JobBoardName>HVAC Insider</JobBoardName>
                <ActiveStatus>Active</ActiveStatus>
              </JobBoardCard>

              <JobBoardCard>
                <JobBoardLogo src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn Logo" />
                <JobBoardName>LinkedIn Jobs</JobBoardName>
                <ActiveStatus>Active</ActiveStatus>
              </JobBoardCard>

              <JobBoardCard>
                <JobBoardLogo src="https://via.placeholder.com/120x60/4ade80/000000?text=SimplyHired" alt="SimplyHired Logo" />
                <JobBoardName>SimplyHired</JobBoardName>
                <ActiveStatus>Active</ActiveStatus>
              </JobBoardCard>

              <JobBoardCard>
                <JobBoardLogo src="https://upload.wikimedia.org/wikipedia/commons/4/42/Monster_logo.svg" alt="Monster Logo" />
                <JobBoardName>Monster</JobBoardName>
                <ComingSoonStatus>Coming Soon</ComingSoonStatus>
              </JobBoardCard>

              <JobBoardCard>
                <JobBoardLogo src="https://via.placeholder.com/120x60/4ade80/000000?text=CareerBuilder" alt="CareerBuilder Logo" />
                <JobBoardName>CareerBuilder</JobBoardName>
                <ComingSoonStatus>Coming Soon</ComingSoonStatus>
              </JobBoardCard>

              <JobBoardCard>
                <JobBoardLogo src="https://upload.wikimedia.org/wikipedia/commons/5/50/Glassdoor_logo.svg" alt="Glassdoor Logo" />
                <JobBoardName>Glassdoor</JobBoardName>
                <ComingSoonStatus>Coming Soon</ComingSoonStatus>
              </JobBoardCard>
            </JobBoardGrid>
          </ContentSection>

          <ContentSection>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80', marginBottom: '2rem', textAlign: 'center' }}>
              Key Features
            </h2>

            <FeatureList>
              <FeatureCard>
                <FeatureIcon>⚡</FeatureIcon>
                <FeatureTitle>Instant Multi-Posting</FeatureTitle>
                <FeatureDescription>
                  Post to multiple job boards simultaneously with just three clicks. No need to visit each platform individually.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>🎯</FeatureIcon>
                <FeatureTitle>HVAC-Optimized Distribution</FeatureTitle>
                <FeatureDescription>
                  Your jobs are automatically posted to the most effective platforms for HVAC hiring, maximizing your reach.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>💰</FeatureIcon>
                <FeatureTitle>Sponsored Post Options</FeatureTitle>
                <FeatureDescription>
                  Boost your job visibility on Indeed and other premium platforms with optional sponsored postings.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>📊</FeatureIcon>
                <FeatureTitle>Performance Tracking</FeatureTitle>
                <FeatureDescription>
                  Track which job boards are delivering the best candidates for your specific roles and locations.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>🔄</FeatureIcon>
                <FeatureTitle>Automatic Renewal</FeatureTitle>
                <FeatureDescription>
                  Keep your postings fresh with automatic renewal options across all integrated platforms.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>📈</FeatureIcon>
                <FeatureTitle>Scaling to 15 Platforms</FeatureTitle>
                <FeatureDescription>
                  We're continuously adding new job board integrations to maximize your hiring reach and effectiveness.
                </FeatureDescription>
              </FeatureCard>
            </FeatureList>
          </ContentSection>

          <CTASection>
            <CTAButton onClick={handleDemoClick}>
              See Multi-Board Posting in Action
            </CTAButton>
          </CTASection>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default JobBoardIntegration;