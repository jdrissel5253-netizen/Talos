import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { BarChart3, TrendingUp, Trophy, Thermometer, Building2, Briefcase, ArrowUpRight } from 'lucide-react';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');
`;

// ─── animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const tickerScroll = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// ─── page ─────────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  font-family: 'DM Sans', sans-serif;
  color: #e8eaf0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(ellipse 80% 50% at 10% 20%, rgba(74,222,128,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 90% 80%, rgba(74,222,128,0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 2.5rem;

  @media (max-width: 768px) { padding: 0 1.25rem; }
`;

// ─── ticker ───────────────────────────────────────────────────────────────────

const TickerWrap = styled.div`
  position: relative;
  z-index: 1;
  background: #4ade80;
  overflow: hidden;
  white-space: nowrap;
`;

const TickerInner = styled.div`
  display: inline-flex;
  animation: ${tickerScroll} 40s linear infinite;
  padding: 0.5rem 0;

  &:hover { animation-play-state: paused; }
`;

const TickerItem = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #000;
  padding: 0 2rem;

  &::after {
    content: '◆';
    margin-left: 2rem;
    font-size: 0.45rem;
    vertical-align: middle;
    opacity: 0.4;
  }
`;

// ─── top rule ─────────────────────────────────────────────────────────────────

const TopRule = styled.div`
  border-top: 2px solid #232830;
  padding-top: 3rem;
  margin-top: 3.5rem;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 2rem;
  animation: ${fadeIn} 0.6s ease both;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const TopLabel = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
`;

const TopMeta = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

// ─── hero ─────────────────────────────────────────────────────────────────────

const HeroSection = styled.div`
  padding: 4rem 0 3rem;
  text-align: center;
  animation: ${fadeUp} 0.7s ease 0.1s both;
`;

const HeroKicker = styled.p`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: #4ade80;
  margin-bottom: 1.25rem;
  letter-spacing: 0.01em;
`;

const HeroTitle = styled.h1`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 400;
  line-height: 1.08;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 1.75rem;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const HeroSub = styled.p`
  font-size: 1.1rem;
  font-weight: 300;
  color: #8a9ab0;
  max-width: 560px;
  margin: 0 auto 3rem;
  line-height: 1.7;
`;

const MidRule = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 4.5rem;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #232830;
  }
`;

const MidRuleOrb = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
`;

// ─── section header ───────────────────────────────────────────────────────────

const SectionBlock = styled.div`
  margin-bottom: 6rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 3rem;
  animation: ${fadeUp} 0.7s ease 0.35s both;
`;

const SectionTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.02em;
  white-space: nowrap;
`;

const SectionRule = styled.div`
  flex: 1;
  height: 1px;
  background: #232830;
`;

const SectionCount = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
  white-space: nowrap;
`;

// ─── insight cards ────────────────────────────────────────────────────────────

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #232830;
  border: 1px solid #232830;

  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const InsightCard = styled.div<{ delay: number }>`
  background: #111318;
  padding: 2.5rem;
  position: relative;
  transition: background 0.2s ease;
  animation: ${fadeUp} 0.6s ease ${p => p.delay}s both;

  &:hover { background: #1a1f2a; }
`;

const CardNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 3.5rem;
  color: rgba(74,222,128,0.12);
  line-height: 1;
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  pointer-events: none;
`;

const CardIcon = styled.div`
  width: 42px;
  height: 42px;
  border: 1.5px solid rgba(74,222,128,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: #4ade80;
`;

const CardCategory = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 0.5rem;
`;

const CardHeadline = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
`;

const CardBody = styled.p`
  font-size: 0.875rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.75;
`;

// ─── news cards ───────────────────────────────────────────────────────────────

const NewsCard = styled.div<{ delay: number }>`
  background: #111318;
  padding: 2.5rem;
  position: relative;
  transition: background 0.2s ease;
  display: flex;
  flex-direction: column;
  animation: ${fadeUp} 0.6s ease ${p => p.delay}s both;

  &:hover { background: #1a1f2a; }
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const NewsSource = styled.span`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 0.8rem;
  color: #6e7d8e;
`;

const NewsPill = styled.span`
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4ade80;
  border: 1px solid rgba(74,222,128,0.25);
  padding: 0.15rem 0.45rem;
`;

const NewsDate = styled.span`
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: #4e5d6e;
  text-transform: uppercase;
`;

const NewsHeadline = styled.h4`
  font-family: 'DM Serif Display', serif;
  font-size: 1.2rem;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.35;
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
  flex: 1;
`;

const NewsExcerpt = styled.p`
  font-size: 0.85rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.7;
  margin-bottom: 1.25rem;
`;

const NewsLink = styled.a`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4ade80;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0.7;
  transition: opacity 0.15s ease;
  width: fit-content;

  &:hover { opacity: 1; }
`;

// ─── pull quote ───────────────────────────────────────────────────────────────

const PullQuote = styled.blockquote`
  text-align: center;
  padding: 4rem 2rem;
  margin-bottom: 5rem;
  position: relative;
  animation: ${fadeUp} 0.7s ease 0.5s both;

  &::before {
    content: '"';
    font-family: 'DM Serif Display', serif;
    font-size: 10rem;
    color: rgba(74,222,128,0.07);
    position: absolute;
    top: -1rem;
    left: 50%;
    transform: translateX(-50%);
    line-height: 1;
    pointer-events: none;
  }
`;

const PullQuoteText = styled.p`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  color: #ffffff;
  line-height: 1.4;
  max-width: 720px;
  margin: 0 auto 1.5rem;
  position: relative;
  z-index: 1;
`;

const PullQuoteAttr = styled.cite`
  font-size: 0.75rem;
  font-weight: 600;
  font-style: normal;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #4ade80;
`;

// ─── CTA ──────────────────────────────────────────────────────────────────────

const CTASection = styled.div`
  border-top: 2px solid #232830;
  padding: 4rem 0 5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  animation: ${fadeUp} 0.7s ease 0.55s both;

  @media (max-width: 700px) {
    flex-direction: column;
    text-align: center;
  }
`;

const CTALeft = styled.div``;

const CTALabel = styled.p`
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 0.5rem;
`;

const CTATitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const CTAButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #4ade80;
  color: #000;
  border: none;
  padding: 1.1rem 2.25rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #6ee89a;
    svg { transform: translateX(3px) translateY(-3px); }
  }

  svg { transition: transform 0.2s ease; }
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
  { icon: <BarChart3 size={18} />, category: 'Market Data',   headline: 'Regional Salary Benchmarks',  body: 'Current salary ranges for HVAC positions by region, helping you stay competitive in your local market and attract top-tier technicians.' },
  { icon: <TrendingUp size={18} />, category: 'Demand',       headline: 'Demand Forecasting',          body: 'Seasonal hiring trends and predicted demand spikes to help you plan your recruitment strategy months ahead.' },
  { icon: <Trophy size={18} />,     category: 'Workforce',    headline: 'Skills in High Demand',       body: 'Most sought-after certifications and technical skills in the current HVAC job market.' },
  { icon: <Thermometer size={18} />,category: 'Seasonal',     headline: 'Seasonal Trends',             body: 'How weather patterns and regional demands shift hiring needs across different markets throughout the year.' },
  { icon: <Building2 size={18} />,  category: 'Growth',       headline: 'Industry Growth Data',        body: 'Market expansion trends, new construction impacts, and commercial vs. residential demand analysis.' },
  { icon: <Briefcase size={18} />,  category: 'Intelligence', headline: 'Competitor Analysis',         body: 'Anonymous insights into hiring practices and compensation trends among HVAC companies in your region.' },
];

const NEWS = [
  {
    date: 'Sep 26, 2025', category: 'Workforce', source: 'Contracting Business',
    headline: 'Navigating the HVAC Labor Shortage: How Technology and Talent Development Drive Growth',
    excerpt: 'Over 480,000 skilled trade jobs remain unfilled in the U.S. With demand projected to grow 6% through 2032, contractors are turning to technology and aggressive recruitment to close the gap.',
    url: 'https://www.contractingbusiness.com/contracting-business-success/article/55308154/navigating-the-hvac-labor-shortage-how-technology-and-talent-development-drive-growth',
  },
  {
    date: 'Apr 18, 2024', category: 'Regulation', source: 'Contracting Business',
    headline: 'Keeping Their Cool: How Refrigerant Service Will Impact HVAC',
    excerpt: 'With the AIM Act driving a phase-down of HFC refrigerants and A2L refrigerants entering the market, technicians must understand new handling and certification requirements.',
    url: 'https://www.contractingbusiness.com/refrigeration/article/21284959/how-refrigerant-service-will-impact-hvac-service',
  },
  {
    date: 'Feb 7, 2025', category: 'Growth', source: 'IEA',
    headline: 'Is a Turnaround in Sight for Heat Pump Markets?',
    excerpt: 'After a soft patch in early 2024, heat pump markets showed recovery signs. The IEA projects global installer demand to quadruple by 2030, with qualified installer shortages already an active bottleneck.',
    url: 'https://www.iea.org/commentaries/is-a-turnaround-in-sight-for-heat-pump-markets',
  },
  {
    date: 'May 2024', category: 'Salary', source: 'Bureau of Labor Statistics',
    headline: 'HVAC Mechanics & Installers: Occupational Outlook & Wage Data',
    excerpt: 'The BLS reports a median annual wage of $59,810 for HVAC technicians, with the top 10% earning over $91,020. Employment is projected to grow 8% through 2034.',
    url: 'https://www.bls.gov/ooh/installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm',
  },
  {
    date: 'Feb 9, 2026', category: 'Technology', source: 'Contracting Business',
    headline: 'Smart HVACR Systems and the Evolving Role of the Technician',
    excerpt: 'As AI diagnostics, IoT sensors, and connected building systems become standard, the most sought-after technicians blend mechanical know-how with digital fluency.',
    url: 'https://www.contractingbusiness.com/residential-hvac/article/55343258/smart-hvacr-systems-and-the-evolving-role-and-training-of-the-technician',
  },
  {
    date: 'Mar 14, 2024', category: 'Training', source: 'Construction Dive',
    headline: 'HVAC Pre-Apprenticeship Program Aims to Improve Skilled Worker Pipeline',
    excerpt: 'A new program gives high school seniors hands-on training, DOL-registered apprenticeship hours, and a path to EPA 608 and OSHA-10 certifications before graduation.',
    url: 'https://www.constructiondive.com/news/hvac-pre-apprenticeship-program-improve-skilled-workers-pipeline/710355/',
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

        <Wrapper>

          {/* ── Top rule ── */}
          <TopRule>
            <TopLabel>Talos &mdash; HVAC Intelligence</TopLabel>
            <TopMeta>Market Data &bull; Salary Benchmarks &bull; Industry News</TopMeta>
          </TopRule>

          {/* ── Hero ── */}
          <HeroSection>
            <HeroKicker>For HVAC hiring professionals</HeroKicker>
            <HeroTitle>
              The HVAC <em>Intelligence</em>
            </HeroTitle>
            <HeroSub>
              All the hiring news and market data fit to read — delivered to recruiters who demand precision.
            </HeroSub>
            <MidRule>
              <MidRuleOrb />
            </MidRule>
          </HeroSection>

          {/* ── Market Insights ── */}
          <SectionBlock>
            <SectionHeader>
              <SectionTitle>Market Insights</SectionTitle>
              <SectionRule />
              <SectionCount>Six data categories</SectionCount>
            </SectionHeader>
            <CardGrid>
              {INSIGHTS.map((item, i) => (
                <InsightCard key={i} delay={0.4 + i * 0.05}>
                  <CardNum>{String(i + 1).padStart(2, '0')}</CardNum>
                  <CardIcon>{item.icon}</CardIcon>
                  <CardCategory>{item.category}</CardCategory>
                  <CardHeadline>{item.headline}</CardHeadline>
                  <CardBody>{item.body}</CardBody>
                </InsightCard>
              ))}
            </CardGrid>
          </SectionBlock>

          {/* ── Pull quote ── */}
          <PullQuote>
            <PullQuoteText>
              480,000 skilled trade jobs unfilled. The operators who move first win the talent.
            </PullQuoteText>
            <PullQuoteAttr>Talos HVAC Intelligence</PullQuoteAttr>
          </PullQuote>

          {/* ── Latest Dispatches ── */}
          <SectionBlock>
            <SectionHeader>
              <SectionTitle>Latest Dispatches</SectionTitle>
              <SectionRule />
              <SectionCount>Industry news from across the nation</SectionCount>
            </SectionHeader>
            <CardGrid>
              {NEWS.map((article, i) => (
                <NewsCard key={i} delay={0.4 + i * 0.05}>
                  <NewsMeta>
                    <NewsSource>{article.source}</NewsSource>
                    <span style={{ color: '#2a3040' }}>·</span>
                    <NewsDate>{article.date}</NewsDate>
                    <NewsPill>{article.category}</NewsPill>
                  </NewsMeta>
                  <NewsHeadline>{article.headline}</NewsHeadline>
                  <NewsExcerpt>{article.excerpt}</NewsExcerpt>
                  <NewsLink href={article.url} target="_blank" rel="noopener noreferrer">
                    Continue reading <ArrowUpRight size={11} />
                  </NewsLink>
                </NewsCard>
              ))}
            </CardGrid>
          </SectionBlock>

          {/* ── CTA ── */}
          <CTASection>
            <CTALeft>
              <CTALabel>Full Intelligence Access</CTALabel>
              <CTATitle>See the full<br />insights dashboard</CTATitle>
            </CTALeft>
            <CTAButton onClick={() => setIsDemoModalOpen(true)}>
              Get a Demo <ArrowUpRight size={16} />
            </CTAButton>
          </CTASection>

        </Wrapper>
      </Page>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default HVACInsights;
