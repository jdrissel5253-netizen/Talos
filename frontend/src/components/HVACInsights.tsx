import React, { useState } from 'react';
import styled from 'styled-components';
import { BarChart3, TrendingUp, Trophy, Thermometer, Building2, Briefcase } from 'lucide-react';
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

const MainTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #ffffff, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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

const InsightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const InsightCard = styled.div`
  background: #000000;
  padding: 2rem;
  border-radius: 12px;
  border-left: 4px solid #4ade80;
`;

const InsightIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const InsightTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 1rem;
`;

const NewsSection = styled.div`
  margin: 3rem 0;
`;

const NewsTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #4ade80;
  text-align: center;
  margin-bottom: 2rem;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const NewsCard = styled.div`
  background: #1a1a1a;
  border: 2px solid #333333;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4ade80;
    transform: translateY(-2px);
  }
`;

const NewsDate = styled.div`
  font-size: 0.875rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
`;

const NewsHeadline = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const NewsExcerpt = styled.p`
  color: #e0e0e0;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const ReadMoreLink = styled.a`
  color: #4ade80;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
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
  display: block;
  margin: 4rem auto 0;
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

const HVACInsights: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <PageContainer>
        <ContentWrapper>
          <MainTitle>HVAC Hiring Insights</MainTitle>
          <MainSubtitle>
            Stay informed with the latest HVAC hiring trends and industry updates nationwide
          </MainSubtitle>

          <ContentSection>
            <p style={{ fontSize: '1.125rem', color: '#333', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
              On top of sourcing, Talos keeps you up to speed with the latest HVAC hiring news and industry updates from across the country.
            </p>

            <FeatureBox>
              <p style={{ fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.6', margin: '0' }}>
                Make informed hiring decisions with real-time market intelligence and industry trends.
              </p>
            </FeatureBox>

            <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#4ade80', textAlign: 'center', margin: '3rem 0 2rem' }}>
              Key Insights & Market Data
            </h3>

            <InsightGrid>
              <InsightCard>
                <InsightIcon><BarChart3 size={40} color="#4ade80" /></InsightIcon>
                <InsightTitle>Regional Salary Benchmarks</InsightTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Current salary ranges for HVAC positions by region, helping you stay competitive in your local market.
                </p>
              </InsightCard>

              <InsightCard>
                <InsightIcon><TrendingUp size={40} color="#4ade80" /></InsightIcon>
                <InsightTitle>Demand Forecasting</InsightTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Seasonal hiring trends and predicted demand spikes to help you plan your recruitment strategy.
                </p>
              </InsightCard>

              <InsightCard>
                <InsightIcon><Trophy size={40} color="#4ade80" /></InsightIcon>
                <InsightTitle>Skills in High Demand</InsightTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Most sought-after certifications and technical skills in the current HVAC job market.
                </p>
              </InsightCard>

              <InsightCard>
                <InsightIcon><Thermometer size={40} color="#4ade80" /></InsightIcon>
                <InsightTitle>Seasonal Trends</InsightTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  How weather patterns and seasonal demands affect hiring needs across different regions.
                </p>
              </InsightCard>

              <InsightCard>
                <InsightIcon><Building2 size={40} color="#4ade80" /></InsightIcon>
                <InsightTitle>Industry Growth Data</InsightTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Market expansion trends, new construction impacts, and commercial vs. residential demand.
                </p>
              </InsightCard>

              <InsightCard>
                <InsightIcon><Briefcase size={40} color="#4ade80" /></InsightIcon>
                <InsightTitle>Competitor Analysis</InsightTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Anonymous insights into hiring practices and compensation trends among HVAC companies.
                </p>
              </InsightCard>
            </InsightGrid>
          </ContentSection>

          <ContentSection>
            <NewsTitle>Latest HVAC Industry News</NewsTitle>

            <NewsGrid>
              <NewsCard>
                <NewsDate>January 15, 2025</NewsDate>
                <NewsHeadline>HVAC Labor Shortage Reaches Critical Point in Southwest</NewsHeadline>
                <NewsExcerpt>
                  Arizona and Nevada report unprecedented demand for qualified HVAC technicians as new construction booms and extreme temperatures drive system replacements...
                </NewsExcerpt>
                <ReadMoreLink href="#">Read more →</ReadMoreLink>
              </NewsCard>

              <NewsCard>
                <NewsDate>January 12, 2025</NewsDate>
                <NewsHeadline>New EPA Regulations Impact HVAC Training Requirements</NewsHeadline>
                <NewsExcerpt>
                  Updated certification standards for refrigerant handling are reshaping the skills landscape for HVAC professionals nationwide...
                </NewsExcerpt>
                <ReadMoreLink href="#">Read more →</ReadMoreLink>
              </NewsCard>

              <NewsCard>
                <NewsDate>January 10, 2025</NewsDate>
                <NewsHeadline>Heat Pump Installation Jobs Surge 40% Year-over-Year</NewsHeadline>
                <NewsExcerpt>
                  Growing demand for energy-efficient heating solutions creates new opportunities for technicians with specialized heat pump training...
                </NewsExcerpt>
                <ReadMoreLink href="#">Read more →</ReadMoreLink>
              </NewsCard>

              <NewsCard>
                <NewsDate>January 8, 2025</NewsDate>
                <NewsHeadline>Commercial HVAC Market Drives Salary Increases</NewsHeadline>
                <NewsExcerpt>
                  Large-scale projects and complex building systems command premium wages for experienced commercial HVAC specialists...
                </NewsExcerpt>
                <ReadMoreLink href="#">Read more →</ReadMoreLink>
              </NewsCard>

              <NewsCard>
                <NewsDate>January 5, 2025</NewsDate>
                <NewsHeadline>Smart HVAC Technology Creates New Career Paths</NewsHeadline>
                <NewsExcerpt>
                  IoT-enabled systems and building automation require technicians with both traditional HVAC skills and digital expertise...
                </NewsExcerpt>
                <ReadMoreLink href="#">Read more →</ReadMoreLink>
              </NewsCard>

              <NewsCard>
                <NewsDate>January 3, 2025</NewsDate>
                <NewsHeadline>Apprenticeship Programs Expand to Meet Growing Demand</NewsHeadline>
                <NewsExcerpt>
                  Trade schools and community colleges across the nation launch new HVAC programs to address the skilled worker shortage...
                </NewsExcerpt>
                <ReadMoreLink href="#">Read more →</ReadMoreLink>
              </NewsCard>
            </NewsGrid>
          </ContentSection>

          <CTAButton onClick={() => setIsDemoModalOpen(true)}>
            Access Full Insights Dashboard
          </CTAButton>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default HVACInsights;