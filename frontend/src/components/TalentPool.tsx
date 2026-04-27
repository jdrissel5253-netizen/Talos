import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Target, BarChart3, MapPin, Wrench, ScrollText, CircleDollarSign, Home, Calendar, Lock, RefreshCw, FileText, TrendingUp, Bell, ChevronRight } from 'lucide-react';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=Barlow:wght@300;400;500&display=swap');
`;

// ─── animations ───────────────────────────────────────────────────────────────

const scan = keyframes`
  0%   { top: -4px; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const expandWidth = keyframes`
  from { width: 0; }
  to   { width: 100%; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ─── page ─────────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  font-family: 'Barlow', sans-serif;
  color: #ffffff;
  overflow-x: hidden;
`;

// ─── hero ─────────────────────────────────────────────────────────────────────

const Hero = styled.div`
  position: relative;
  padding: 5rem 0 4rem;
  border-bottom: 1px solid #232830;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 39px,
        rgba(255,255,255,0.015) 39px,
        rgba(255,255,255,0.015) 40px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 79px,
        rgba(255,255,255,0.015) 79px,
        rgba(255,255,255,0.015) 80px
      );
    pointer-events: none;
  }
`;

const ScanLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(74,222,128,0.6), transparent);
  animation: ${scan} 4s linear infinite;
  pointer-events: none;
  z-index: 2;
`;

const HeroInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem;
  position: relative;
  z-index: 3;

  @media (max-width: 768px) { padding: 0 1.5rem; }
`;

const HeroMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.5s ease both;
`;

const HeroMetaTag = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #4ade80;
`;

const HeroMetaDivider = styled.span`
  width: 40px;
  height: 1px;
  background: #232830;
`;

const HeroMetaLabel = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  color: #6e7d8e;
  letter-spacing: 0.12em;
`;

const HeroStatusDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  animation: ${pulse} 2s ease-in-out infinite;
  margin-right: 0.4rem;
`;

const HeroTitle = styled.h1`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: clamp(4rem, 10vw, 8.5rem);
  line-height: 0.92;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 0.5rem;
  animation: ${fadeUp} 0.5s ease 0.1s both;
`;

const HeroTitleAccent = styled.span`
  color: #4ade80;
  display: block;
`;

const HeroAccentBar = styled.div`
  height: 4px;
  background: #4ade80;
  margin: 1.75rem 0;
  animation: ${expandWidth} 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
  width: 0;
`;

const HeroSubRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 3rem;
  animation: ${fadeUp} 0.5s ease 0.35s both;

  @media (max-width: 700px) { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
`;

const HeroSub = styled.p`
  font-family: 'Barlow', sans-serif;
  font-size: 1.1rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.6;
  max-width: 520px;
`;

const HeroDocId = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  color: #3a4555;
  letter-spacing: 0.1em;
  text-align: right;
  white-space: nowrap;
`;

// ─── stats strip ──────────────────────────────────────────────────────────────

const StatsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid #232830;

  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCell = styled.div`
  padding: 2.25rem 2rem;
  border-right: 1px solid #232830;
  animation: ${fadeUp} 0.5s ease var(--delay, 0.4s) both;

  &:last-child { border-right: none; }

  @media (max-width: 700px) {
    &:nth-child(2) { border-right: none; }
    border-bottom: 1px solid #232830;
  }
`;

const StatNum = styled.div`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 3.25rem;
  line-height: 1;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 0.4rem;

  span { color: #4ade80; }
`;

const StatLabel = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

// ─── section wrapper ──────────────────────────────────────────────────────────

const Section = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem;

  @media (max-width: 768px) { padding: 0 1.5rem; }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  padding: 3.5rem 0 2rem;
  border-bottom: 1px solid #232830;
  margin-bottom: 0;
`;

const SectionIndex = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: #4ade80;
`;

const SectionTitle = styled.h2`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 1.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff;
`;

const SectionRule = styled.div`
  flex: 1;
  height: 1px;
  background: #1e2330;
`;

const SectionDesc = styled.span`
  font-family: 'Barlow', sans-serif;
  font-size: 0.8rem;
  color: #6e7d8e;
  white-space: nowrap;
`;

// ─── filter table ─────────────────────────────────────────────────────────────

const FilterTable = styled.div`
  border-bottom: 1px solid #232830;
  margin-bottom: 0;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 52px 44px 1fr 1fr;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid #1a1f2a;
  transition: background 0.15s ease;
  cursor: default;

  &:last-child { border-bottom: none; }

  &:hover {
    background: rgba(74,222,128,0.03);

    & > *:first-child { color: #4ade80; }
    & svg { color: #4ade80; }
  }

  @media (max-width: 700px) {
    grid-template-columns: 40px 36px 1fr;
  }
`;

const FilterIdx = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  color: #3a4555;
  padding: 1.35rem 0 1.35rem 2rem;
  letter-spacing: 0.08em;
  transition: color 0.15s ease;
`;

const FilterIconWrap = styled.div`
  display: flex;
  align-items: center;
  color: #4a5568;
  transition: color 0.15s ease;
`;

const FilterName = styled.div`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #c8d0dc;
  padding: 1.35rem 1.5rem;
`;

const FilterDesc = styled.div`
  font-family: 'Barlow', sans-serif;
  font-size: 0.8rem;
  font-weight: 300;
  color: #6e7d8e;
  padding: 1.35rem 2rem 1.35rem 0;
  line-height: 1.5;

  @media (max-width: 700px) { display: none; }
`;

// ─── features grid ────────────────────────────────────────────────────────────

const FeaturesWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: #1a1f2a;
  border-bottom: 1px solid #232830;

  @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const FeatureCell = styled.div`
  background: #111318;
  padding: 2.5rem 2rem;
  position: relative;
  overflow: hidden;
  transition: background 0.2s ease;

  &:hover {
    background: #141820;

    & > div:first-child { color: rgba(74,222,128,0.2); }
  }
`;

const FeatureBigNum = styled.div`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 5rem;
  line-height: 1;
  color: rgba(255,255,255,0.04);
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  letter-spacing: -0.03em;
  transition: color 0.2s ease;
  pointer-events: none;
  user-select: none;
`;

const FeatureIconWrap = styled.div`
  width: 36px;
  height: 36px;
  border: 1px solid #232830;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4ade80;
  margin-bottom: 1.25rem;
`;

const FeatureName = styled.h3`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin-bottom: 0.75rem;
  line-height: 1.2;
`;

const FeatureDesc = styled.p`
  font-family: 'Barlow', sans-serif;
  font-size: 0.82rem;
  font-weight: 300;
  color: #6e7d8e;
  line-height: 1.7;
`;

// ─── CTA ──────────────────────────────────────────────────────────────────────

const CTAWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5rem 2rem;
  text-align: center;
  position: relative;

  &::before {
    content: 'ACCESS';
    position: absolute;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: clamp(5rem, 18vw, 13rem);
    color: rgba(255,255,255,0.025);
    letter-spacing: -0.02em;
    pointer-events: none;
    user-select: none;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
  }
`;

const CTALabel = styled.div`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const CTATitle = styled.h2`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 4rem);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  line-height: 1.05;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
`;

const CTAButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: #4ade80;
  color: #000;
  border: none;
  padding: 1rem 2.25rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: background 0.15s ease, gap 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));

  &:hover {
    background: #6ee89a;
    gap: 1.1rem;
  }
`;

// ─── count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
        }, delay);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, delay]);

  return { count, ref };
}

// ─── data ─────────────────────────────────────────────────────────────────────

const FILTERS = [
  { icon: <Target size={16} />,           name: 'Smart Tier Segmentation',  desc: 'Candidates auto-organized by performance score for instant prioritization' },
  { icon: <BarChart3 size={16} />,         name: 'Dynamic Score Analysis',    desc: 'Advanced filtering surfaces the most qualified candidates first' },
  { icon: <MapPin size={16} />,            name: 'Geographic Intelligence',   desc: 'Location matching optimized for commute feasibility and local experience' },
  { icon: <Wrench size={16} />,            name: 'Experience Profiling',      desc: 'AI classification of candidate seniority and skill progression' },
  { icon: <ScrollText size={16} />,        name: 'Credential Verification',   desc: 'Automated detection of industry certifications and licenses' },
  { icon: <CircleDollarSign size={16} />,  name: 'Compensation Alignment',    desc: 'Strategic matching of candidate expectations with your budget' },
  { icon: <Home size={16} />,              name: 'Specialization Mapping',    desc: 'Intelligent categorization of HVAC expertise across market segments' },
  { icon: <Calendar size={16} />,          name: 'Availability Tracking',     desc: 'Real-time monitoring of start date flexibility and availability' },
];

const FEATURES = [
  { icon: <Lock size={16} />,       name: 'Enterprise-Grade Security',       desc: 'Bank-level encryption and access controls keep your candidate pipeline completely confidential and protected from competitors.' },
  { icon: <RefreshCw size={16} />,   name: 'Living Database Intelligence',   desc: 'Continuous data integration enriches candidate profiles with updated qualifications, market movements, and availability signals.' },
  { icon: <FileText size={16} />,    name: 'Collaborative Workflow Tools',   desc: 'Annotation systems enable your team to share insights, track engagement history, and maintain institutional knowledge on each candidate.' },
  { icon: <TrendingUp size={16} />,  name: 'Predictive Analytics Engine',    desc: 'Machine learning analyzes hiring outcomes to continuously refine candidate quality predictions and optimize selection criteria.' },
  { icon: <Bell size={16} />,        name: 'Proactive Opportunity Alerts',   desc: 'Intelligent monitoring identifies optimal timing for candidate outreach and signals when your pipeline requires strategic refreshment.' },
  { icon: <BarChart3 size={16} />,   name: 'Strategic Intelligence Reports', desc: 'Analytics dashboards provide actionable insights into talent market trends, competitive positioning, and pipeline health.' },
];

// ─── stat cell component ──────────────────────────────────────────────────────

const StatCellAnimated: React.FC<{ target: number; suffix?: string; label: string; delay: number }> = ({ target, suffix = '', label, delay }) => {
  const { count, ref } = useCountUp(target, 1000, delay);
  return (
    <StatCell ref={ref} style={{ '--delay': `${0.4 + delay / 1000}s` } as React.CSSProperties}>
      <StatNum>{count}<span>{suffix}</span></StatNum>
      <StatLabel>{label}</StatLabel>
    </StatCell>
  );
};

// ─── component ────────────────────────────────────────────────────────────────

const TalentPool: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <FontImport />
      <Page>

        {/* ── Hero ── */}
        <Hero>
          <ScanLine />
          <HeroInner>
            <HeroMeta>
              <HeroMetaTag><HeroStatusDot />System Active</HeroMetaTag>
              <HeroMetaDivider />
              <HeroMetaLabel>Talos / Talent Intelligence</HeroMetaLabel>
            </HeroMeta>

            <HeroTitle>
              Talent
              <HeroTitleAccent>Pool</HeroTitleAccent>
            </HeroTitle>

            <HeroAccentBar />

            <HeroSubRow>
              <HeroSub>
                Your private database of AI-ranked HVAC candidates — always current, always searchable, always yours.
              </HeroSub>
              <HeroDocId>
                DOC-TP-001 / CLASSIFICATION: CLIENT-ONLY<br />
                FILTER DIMENSIONS: 08 / CAPABILITIES: 06
              </HeroDocId>
            </HeroSubRow>
          </HeroInner>
        </Hero>

        {/* ── Stats ── */}
        <StatsStrip>
          <StatCellAnimated target={8}   suffix=" +"  label="Filter Dimensions"  delay={0}   />
          <StatCellAnimated target={6}               label="Core Capabilities"   delay={100} />
          <StatCellAnimated target={100} suffix="%"  label="Private & Encrypted" delay={200} />
          <StatCellAnimated target={24}  suffix="h"  label="Always Available"    delay={300} />
        </StatsStrip>

        {/* ── Filters ── */}
        <div style={{ borderBottom: '1px solid #232830' }}>
          <Section>
            <SectionHeader>
              <SectionIndex>01</SectionIndex>
              <SectionTitle>Intelligent Organization</SectionTitle>
              <SectionRule />
              <SectionDesc>8 filter dimensions</SectionDesc>
            </SectionHeader>
          </Section>

          <Section>
            <FilterTable>
              {FILTERS.map((f, i) => (
                <FilterRow key={i}>
                  <FilterIdx>{String(i + 1).padStart(2, '0')}</FilterIdx>
                  <FilterIconWrap>{f.icon}</FilterIconWrap>
                  <FilterName>{f.name}</FilterName>
                  <FilterDesc>{f.desc}</FilterDesc>
                </FilterRow>
              ))}
            </FilterTable>
          </Section>
        </div>

        {/* ── Features ── */}
        <div style={{ borderBottom: '1px solid #232830' }}>
          <Section>
            <SectionHeader>
              <SectionIndex>02</SectionIndex>
              <SectionTitle>Platform Capabilities</SectionTitle>
              <SectionRule />
              <SectionDesc>6 core features</SectionDesc>
            </SectionHeader>
          </Section>

          <FeaturesWrap>
            {FEATURES.map((f, i) => (
              <FeatureCell key={i}>
                <FeatureBigNum>{String(i + 1).padStart(2, '0')}</FeatureBigNum>
                <FeatureIconWrap>{f.icon}</FeatureIconWrap>
                <FeatureName>{f.name}</FeatureName>
                <FeatureDesc>{f.desc}</FeatureDesc>
              </FeatureCell>
            ))}
          </FeaturesWrap>
        </div>

        {/* ── CTA ── */}
        <CTAWrap>
          <CTALabel>Ready to deploy</CTALabel>
          <CTATitle>See the Talent<br />Pool in Action</CTATitle>
          <CTAButton onClick={() => setIsDemoModalOpen(true)}>
            Request Access <ChevronRight size={16} />
          </CTAButton>
        </CTAWrap>

      </Page>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default TalentPool;
