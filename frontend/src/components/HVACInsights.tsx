import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { BarChart3, TrendingUp, Trophy, Thermometer, Building2, Briefcase, ArrowUpRight } from 'lucide-react';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400;1,6..72,600&display=swap');
`;

// ─── animations ───────────────────────────────────────────────────────────────

const tickerScroll = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── page ─────────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  font-family: 'Libre Franklin', sans-serif;
  color: #e8eaf0;
`;

const MaxWidth = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2.5rem;

  @media (max-width: 768px) { padding: 0 1.25rem; }
`;

// ─── ticker ───────────────────────────────────────────────────────────────────

const TickerWrap = styled.div`
  background: #4ade80;
  overflow: hidden;
  white-space: nowrap;
`;

const TickerInner = styled.div`
  display: inline-flex;
  animation: ${tickerScroll} 40s linear infinite;
  padding: 0.45rem 0;

  &:hover { animation-play-state: paused; }
`;

const TickerItem = styled.span`
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #000;
  padding: 0 2.5rem;

  &::after {
    content: '◆';
    margin-left: 2.5rem;
    font-size: 0.5rem;
    vertical-align: middle;
    opacity: 0.5;
  }
`;

// ─── masthead ─────────────────────────────────────────────────────────────────

const Masthead = styled.div`
  padding: 2.5rem 0 0;
  animation: ${fadeIn} 0.6s ease both;
`;

const MastheadTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #232830;
  margin-bottom: 1.25rem;
`;

const MastheadMeta = styled.span`
  font-family: 'Newsreader', serif;
  font-style: italic;
  font-size: 0.75rem;
  color: #6e7d8e;
`;

const MastheadLive = styled.span`
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #4ade80;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
  }
`;

const MastheadTitle = styled.h1`
  font-family: 'Libre Franklin', sans-serif;
  font-weight: 900;
  font-size: clamp(2.8rem, 7vw, 5.75rem);
  color: #ffffff;
  letter-spacing: -0.025em;
  line-height: 0.95;
  text-align: center;
  text-transform: uppercase;
  margin: 0 0 1rem;
`;

const MastheadDeck = styled.p`
  font-family: 'Newsreader', serif;
  font-style: italic;
  font-size: 1rem;
  color: #8a9ab0;
  text-align: center;
  margin-bottom: 1.25rem;
`;

const DoubleRule = styled.div`
  border-top: 3px double #232830;
  margin-bottom: 0;
`;

// ─── section label ────────────────────────────────────────────────────────────

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid #232830;
  margin-bottom: 0;
`;

const SectionLabelText = styled.span`
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #ffffff;
  white-space: nowrap;
`;

const SectionLabelRule = styled.div`
  flex: 1;
  height: 1px;
  background: #232830;
`;

const SectionLabelSub = styled.span`
  font-family: 'Newsreader', serif;
  font-style: italic;
  font-size: 0.75rem;
  color: #6e7d8e;
  white-space: nowrap;
`;

// ─── insight articles (newspaper grid) ───────────────────────────────────────

const InsightGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  animation: ${fadeUp} 0.6s ease 0.2s both;

  @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const InsightArticle = styled.div<{ feature?: boolean }>`
  padding: 1.75rem 1.5rem;
  border-right: 1px solid #232830;
  border-bottom: 1px solid #232830;
  transition: background 0.15s ease;
  cursor: default;

  &:nth-child(3n) { border-right: none; }
  &:hover { background: rgba(74,222,128,0.02); }

  ${p => p.feature && `
    grid-column: span 2;
    @media (max-width: 560px) { grid-column: span 1; }
  `}

  @media (max-width: 900px) {
    &:nth-child(3n) { border-right: 1px solid #232830; }
    &:nth-child(2n) { border-right: none; }
  }
  @media (max-width: 560px) {
    border-right: none !important;
  }
`;

const ArticleCategory = styled.div`
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 1px;
    background: #4ade80;
  }
`;

const ArticleHeadline = styled.h3<{ large?: boolean }>`
  font-family: 'Libre Franklin', sans-serif;
  font-weight: ${p => p.large ? 800 : 700};
  font-size: ${p => p.large ? '1.5rem' : '1.1rem'};
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 0.75rem;
`;

const ArticleRule = styled.div`
  height: 1px;
  background: #232830;
  margin: 0.75rem 0;
`;

const ArticleBody = styled.p`
  font-family: 'Newsreader', serif;
  font-size: 0.875rem;
  color: #8a9ab0;
  line-height: 1.7;
`;

const ArticleIcon = styled.div`
  color: #4ade80;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

// ─── news section ─────────────────────────────────────────────────────────────

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  animation: ${fadeUp} 0.6s ease 0.35s both;

  @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const NewsArticle = styled.div`
  padding: 1.75rem 1.5rem;
  border-right: 1px solid #232830;
  border-bottom: 1px solid #232830;
  transition: background 0.15s ease;
  cursor: default;
  display: flex;
  flex-direction: column;

  &:nth-child(3n) { border-right: none; }
  &:hover { background: rgba(255,255,255,0.015); }

  @media (max-width: 900px) {
    &:nth-child(3n) { border-right: 1px solid #232830; }
    &:nth-child(2n) { border-right: none; }
  }
  @media (max-width: 560px) {
    border-right: none !important;
  }
`;

const NewsDateline = styled.div`
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const NewsCategoryPill = styled.span`
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #4ade80;
  border: 1px solid rgba(74,222,128,0.25);
  padding: 0.1rem 0.4rem;
`;

const NewsHeadline = styled.h4`
  font-family: 'Libre Franklin', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #e8eaf0;
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
  flex: 1;
`;

const NewsExcerpt = styled.p`
  font-family: 'Newsreader', serif;
  font-size: 0.82rem;
  color: #6e7d8e;
  line-height: 1.65;
  margin-bottom: 1rem;
`;

const NewsReadMore = styled.span`
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4ade80;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  width: fit-content;
  opacity: 0.7;
  transition: opacity 0.15s ease;

  &:hover { opacity: 1; }
`;

// ─── CTA ──────────────────────────────────────────────────────────────────────

const CTAWrap = styled.div`
  border: 1px solid #232830;
  border-top: none;
  margin: 0;
  padding: 3.5rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  animation: ${fadeUp} 0.6s ease 0.45s both;

  @media (max-width: 700px) {
    flex-direction: column;
    text-align: center;
  }
`;

const CTALeft = styled.div``;

const CTAEyebrow = styled.div`
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 0.6rem;
`;

const CTAHeadline = styled.h2`
  font-family: 'Libre Franklin', sans-serif;
  font-weight: 900;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.1;
`;

const CTASubline = styled.p`
  font-family: 'Newsreader', serif;
  font-style: italic;
  font-size: 0.9rem;
  color: #6e7d8e;
  margin-top: 0.4rem;
`;

const CTAButton = styled.button`
  flex-shrink: 0;
  background: #4ade80;
  color: #000;
  border: none;
  padding: 1rem 2rem;
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.15s ease, gap 0.2s ease;

  &:hover {
    background: #6ee89a;
    gap: 0.75rem;
  }
`;

// ─── data ─────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  'HVAC TECH DEMAND +18% YOY',
  'AVG FIELD TECH SALARY: $52K–$74K',
  'EPA 608 CERTIFICATION: HIGH DEMAND',
  'HEAT PUMP INSTALLS +40% YOY',
  'SOUTHWEST LABOR SHORTAGE: CRITICAL',
  'COMMERCIAL HVAC WAGES OUTPACING RESIDENTIAL',
  'NEW EPA REGS RESHAPE TRAINING REQUIREMENTS',
  'SMART HVAC OPENS NEW CAREER PATHS',
  'APPRENTICESHIPS UP 22% NATIONWIDE',
];

const INSIGHTS = [
  {
    icon: <BarChart3 size={20} />,
    category: 'Market Data',
    headline: 'Regional Salary Benchmarks',
    body: 'Current salary ranges for HVAC positions by region, helping you stay competitive in your local market and attract top-tier technicians.',
    feature: true,
  },
  {
    icon: <TrendingUp size={20} />,
    category: 'Demand',
    headline: 'Demand Forecasting',
    body: 'Seasonal hiring trends and predicted demand spikes to help you plan your recruitment strategy months ahead.',
  },
  {
    icon: <Trophy size={20} />,
    category: 'Workforce',
    headline: 'Skills in High Demand',
    body: 'Most sought-after certifications and technical skills in the current HVAC job market.',
  },
  {
    icon: <Thermometer size={20} />,
    category: 'Seasonal',
    headline: 'Seasonal Trends',
    body: 'How weather patterns and regional demands shift hiring needs across different markets throughout the year.',
  },
  {
    icon: <Building2 size={20} />,
    category: 'Growth',
    headline: 'Industry Growth Data',
    body: 'Market expansion trends, new construction impacts, and commercial vs. residential demand analysis.',
  },
  {
    icon: <Briefcase size={20} />,
    category: 'Intelligence',
    headline: 'Competitor Analysis',
    body: 'Anonymous insights into hiring practices and compensation trends among HVAC companies in your region.',
  },
];

const NEWS = [
  {
    date: 'Jan 15, 2025',
    category: 'Workforce',
    headline: 'HVAC Labor Shortage Reaches Critical Point in Southwest',
    excerpt: 'Arizona and Nevada report unprecedented demand for qualified HVAC technicians as new construction booms and extreme temperatures drive system replacements.',
  },
  {
    date: 'Jan 12, 2025',
    category: 'Regulation',
    headline: 'New EPA Regulations Impact HVAC Training Requirements',
    excerpt: 'Updated certification standards for refrigerant handling are reshaping the skills landscape for HVAC professionals nationwide.',
  },
  {
    date: 'Jan 10, 2025',
    category: 'Growth',
    headline: 'Heat Pump Installation Jobs Surge 40% Year-over-Year',
    excerpt: 'Growing demand for energy-efficient heating solutions creates new opportunities for technicians with specialized heat pump training.',
  },
  {
    date: 'Jan 8, 2025',
    category: 'Salary',
    headline: 'Commercial HVAC Market Drives Salary Increases',
    excerpt: 'Large-scale projects and complex building systems command premium wages for experienced commercial HVAC specialists.',
  },
  {
    date: 'Jan 5, 2025',
    category: 'Technology',
    headline: 'Smart HVAC Technology Creates New Career Paths',
    excerpt: 'IoT-enabled systems and building automation require technicians with both traditional HVAC skills and digital expertise.',
  },
  {
    date: 'Jan 3, 2025',
    category: 'Training',
    headline: 'Apprenticeship Programs Expand to Meet Growing Demand',
    excerpt: 'Trade schools and community colleges launch new HVAC programs to address the skilled worker shortage coast to coast.',
  },
];

// ─── component ────────────────────────────────────────────────────────────────

const HVACInsights: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <FontImport />
      <Page>

        {/* ── Ticker ── */}
        <TickerWrap>
          <TickerInner>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <TickerItem key={i}>{item}</TickerItem>
            ))}
          </TickerInner>
        </TickerWrap>

        {/* ── Masthead ── */}
        <MaxWidth>
          <Masthead>
            <MastheadTop>
              <MastheadMeta>Vol. I, No. 24 &nbsp;·&nbsp; Spring 2025 Edition</MastheadMeta>
              <MastheadMeta style={{ textAlign: 'center' }}>
                Published by Talos &nbsp;·&nbsp; Market Intelligence for HVAC Recruiters
              </MastheadMeta>
              <MastheadLive>Live Data</MastheadLive>
            </MastheadTop>

            <MastheadTitle>The HVAC Intelligence</MastheadTitle>
            <MastheadDeck>
              All the hiring news and market data fit to read — delivered to recruiters who demand precision.
            </MastheadDeck>
          </Masthead>
        </MaxWidth>

        <DoubleRule />

        {/* ── Market Insights ── */}
        <MaxWidth>
          <SectionLabel>
            <SectionLabelText>Market Insights</SectionLabelText>
            <SectionLabelRule />
            <SectionLabelSub>Six data categories tracked in real time</SectionLabelSub>
          </SectionLabel>
        </MaxWidth>

        <div style={{ borderTop: '1px solid #232830' }}>
          <MaxWidth>
            <InsightGrid>
              {INSIGHTS.map((insight, i) => (
                <InsightArticle key={i} feature={insight.feature}>
                  <ArticleCategory>{insight.category}</ArticleCategory>
                  <ArticleIcon>{insight.icon}</ArticleIcon>
                  <ArticleHeadline large={insight.feature}>{insight.headline}</ArticleHeadline>
                  <ArticleRule />
                  <ArticleBody>{insight.body}</ArticleBody>
                </InsightArticle>
              ))}
            </InsightGrid>
          </MaxWidth>
        </div>

        {/* ── News ── */}
        <MaxWidth>
          <SectionLabel>
            <SectionLabelText>Latest Dispatches</SectionLabelText>
            <SectionLabelRule />
            <SectionLabelSub>Industry news from across the nation</SectionLabelSub>
          </SectionLabel>
        </MaxWidth>

        <div style={{ borderTop: '1px solid #232830' }}>
          <MaxWidth>
            <NewsGrid>
              {NEWS.map((article, i) => (
                <NewsArticle key={i}>
                  <NewsDateline>
                    {article.date}
                    <NewsCategoryPill>{article.category}</NewsCategoryPill>
                  </NewsDateline>
                  <NewsHeadline>{article.headline}</NewsHeadline>
                  <NewsExcerpt>{article.excerpt}</NewsExcerpt>
                  <NewsReadMore>
                    Continue reading <ArrowUpRight size={11} />
                  </NewsReadMore>
                </NewsArticle>
              ))}
            </NewsGrid>
          </MaxWidth>
        </div>

        {/* ── CTA ── */}
        <MaxWidth>
          <CTAWrap>
            <CTALeft>
              <CTAEyebrow>Full Intelligence Access</CTAEyebrow>
              <CTAHeadline>Access the Full<br />Insights Dashboard</CTAHeadline>
              <CTASubline>Real-time market data, salary benchmarks, and hiring forecasts.</CTASubline>
            </CTALeft>
            <CTAButton onClick={() => setIsDemoModalOpen(true)}>
              Get a Demo <ArrowUpRight size={14} />
            </CTAButton>
          </CTAWrap>
        </MaxWidth>

      </Page>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default HVACInsights;
