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

const MainTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const MainSubtitle = styled.p`
  font-size: 1.25rem;
  color: #e0e0e0;
  max-width: 800px;
  margin: 0 auto 4rem;
  line-height: 1.6;
  text-align: center;
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

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
`;

const FilterCard = styled.div`
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

const FilterIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const FilterTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 0.5rem;
`;

const FeaturesList = styled.div`
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
  display: block;
  margin: 4rem auto 0;

  &:hover {
    background-color: #4ade80;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 90, 58, 0.4);
  }
`;

const TalentPool: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <PageContainer>
        <ContentWrapper>
          <MainTitle>Personalized Talent Pool</MainTitle>
          <MainSubtitle>
            Your private database of ranked HVAC candidates, always at your fingertips
          </MainSubtitle>

          <ContentSection>
            <p style={{ fontSize: '1.125rem', color: '#333', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
              Once candidates are ranked, Talos stores them in your private database. Browse by tier, score, or filters like location and experience. Your HVAC talent pool is always at your fingertips.
            </p>

            <FeatureBox>
              <p style={{ fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.6', margin: '0' }}>
                Build a lasting talent pipeline. Never lose track of quality candidates again.
              </p>
            </FeatureBox>

            <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#4ade80', textAlign: 'center', margin: '3rem 0 2rem' }}>
              Powerful Search & Filter Options
            </h3>

            <FilterGrid>
              <FilterCard>
                <FilterIcon>🎯</FilterIcon>
                <FilterTitle>By Tier Rating</FilterTitle>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Green, Yellow, or Red tier candidates
                </p>
              </FilterCard>

              <FilterCard>
                <FilterIcon>📊</FilterIcon>
                <FilterTitle>By Score Range</FilterTitle>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Filter by specific score ranges (1-10)
                </p>
              </FilterCard>

              <FilterCard>
                <FilterIcon>📍</FilterIcon>
                <FilterTitle>By Location</FilterTitle>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  City, state, or radius from job site
                </p>
              </FilterCard>

              <FilterCard>
                <FilterIcon>🔧</FilterIcon>
                <FilterTitle>By Experience Level</FilterTitle>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Entry-level, experienced, or senior
                </p>
              </FilterCard>

              <FilterCard>
                <FilterIcon>📜</FilterIcon>
                <FilterTitle>By Certifications</FilterTitle>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  EPA 608, NATE, manufacturer certs
                </p>
              </FilterCard>

              <FilterCard>
                <FilterIcon>💰</FilterIcon>
                <FilterTitle>By Salary Range</FilterTitle>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Match budget expectations
                </p>
              </FilterCard>

              <FilterCard>
                <FilterIcon>🏠</FilterIcon>
                <FilterTitle>By Specialization</FilterTitle>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Residential, commercial, service
                </p>
              </FilterCard>

              <FilterCard>
                <FilterIcon>📅</FilterIcon>
                <FilterTitle>By Availability</FilterTitle>
                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                  Immediate, 2-week notice, future
                </p>
              </FilterCard>
            </FilterGrid>
          </ContentSection>

          <ContentSection>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#4ade80', marginBottom: '2rem', textAlign: 'center' }}>
              Talent Pool Features
            </h2>

            <FeaturesList>
              <FeatureCard>
                <FeatureIcon>🔒</FeatureIcon>
                <FeatureTitle>Private & Secure</FeatureTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Your talent pool is completely private to your company. No other employers can see or access your candidates.
                </p>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>🔄</FeatureIcon>
                <FeatureTitle>Automatic Updates</FeatureTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Candidate profiles are automatically updated as they gain new experience, certifications, or change availability.
                </p>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>📝</FeatureIcon>
                <FeatureTitle>Notes & Tags</FeatureTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Add internal notes, interview feedback, and custom tags to track your interactions with each candidate.
                </p>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>📈</FeatureIcon>
                <FeatureTitle>Performance Tracking</FeatureTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Track which candidates you've hired and their success rates to improve future candidate selection.
                </p>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>🔔</FeatureIcon>
                <FeatureTitle>Smart Alerts</FeatureTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Get notified when high-scoring candidates become available or when your talent pool needs refreshing.
                </p>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>📊</FeatureIcon>
                <FeatureTitle>Export & Reports</FeatureTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Export candidate data, generate reports, and analyze your talent pipeline for strategic planning.
                </p>
              </FeatureCard>
            </FeaturesList>
          </ContentSection>

          <CTAButton onClick={() => setIsDemoModalOpen(true)}>
            Explore Your Talent Pool
          </CTAButton>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default TalentPool;