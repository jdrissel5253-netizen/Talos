import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Target, BarChart3, MapPin, Wrench, ScrollText, CircleDollarSign, Home, Calendar, Lock, RefreshCw, FileText, TrendingUp, Bell, ChevronRight } from 'lucide-react';
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

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
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

  @media (max-width: 768px) {
    padding: 0 1.25rem;
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

// ─── preview section ──────────────────────────────────────────────────────────

const PreviewWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 6rem;
  align-items: center;
  animation: ${fadeUp} 0.7s ease 0.25s both;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewLeft = styled.div``;

const PreviewTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #4ade80;
  border: 1px solid rgba(74,222,128,0.25);
  padding: 0.3rem 0.75rem;
  margin-bottom: 1.5rem;
`;

const PreviewHeading = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: 2.4rem;
  font-weight: 400;
  line-height: 1.2;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;

  em { font-style: italic; color: #4ade80; }
`;

const PreviewBody = styled.p`
  font-size: 0.95rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.75;
  margin-bottom: 1.5rem;
`;

const StatRow = styled.div`
  display: flex;
  gap: 2.5rem;
  margin-top: 1.5rem;
`;

const Stat = styled.div``;

const StatNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.2rem;

  span { color: #4ade80; }
`;

const StatDesc = styled.div`
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

// ─── pool card (floating preview) ────────────────────────────────────────────

const PoolCard = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  box-shadow:
    0 2px 0 #1a1f2a,
    0 12px 40px rgba(0,0,0,0.4),
    0 2px 8px rgba(0,0,0,0.2);
  padding: 1.75rem 1.75rem 1.5rem;
  position: relative;
  animation: ${float} 6s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4ade80, #6ee89a, #4ade80);
  }
`;

const PoolCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #232830;
`;

const PoolCardLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

const PoolCardBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4ade80;
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.2);
  padding: 0.2rem 0.6rem;
`;

const LiveDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const CandidateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const CandidateEntry = styled.div<{ delay: number; visible: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #111318;
  border: 1px solid #232830;
  opacity: ${p => p.visible ? 1 : 0};
  animation: ${p => p.visible ? slideIn : 'none'} 0.4s ease ${p => p.delay}s both;
  transition: background 0.15s ease;

  &:hover { background: #0f1118; }
`;

const CandidateEntryLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const CandidateName = styled.div`
  font-size: 0.82rem;
  font-weight: 500;
  color: #c8d0dc;
`;

const CandidateRole = styled.div`
  font-size: 0.7rem;
  color: #6e7d8e;
  font-weight: 300;
`;

const TierBadge = styled.div<{ color: string; bg: string }>`
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${p => p.color};
  background: ${p => p.bg};
  border: 1px solid ${p => p.color}33;
  padding: 0.2rem 0.55rem;
  flex-shrink: 0;
`;

const PoolCardFooter = styled.div`
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #232830;
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 0.9rem;
  color: #8a9ab0;
`;

// ─── section (filters + features) ────────────────────────────────────────────

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

const ItemGrid = styled.div<{ cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${p => p.cols ?? 2}, 1fr);
  gap: 1px;
  background: #232830;
  border: 1px solid #232830;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const ItemCard = styled.div<{ delay: number }>`
  background: #111318;
  padding: 2.5rem;
  position: relative;
  transition: background 0.2s ease;
  animation: ${fadeUp} 0.6s ease ${p => p.delay}s both;

  &:hover {
    background: #1a1f2a;
  }
`;

const ItemNum = styled.div`
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

const ItemIcon = styled.div`
  width: 42px;
  height: 42px;
  border: 1.5px solid rgba(74,222,128,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: #4ade80;
`;

const ItemName = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
`;

const ItemDesc = styled.p`
  font-size: 0.875rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.75;
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
  position: relative;
  overflow: hidden;
  transition: background 0.2s ease;

  &:hover {
    background: #6ee89a;

    svg {
      transform: translateX(4px);
    }
  }

  svg {
    transition: transform 0.2s ease;
  }
`;

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── data ─────────────────────────────────────────────────────────────────────

const MOCK_POOL = [
  { name: 'D. Mitchell',  role: 'HVAC Service Technician', tier: 'Green',  color: '#4ade80', bg: 'rgba(74,222,128,0.08)'  },
  { name: 'R. Castillo',  role: 'HVAC Installer',          tier: 'Green',  color: '#4ade80', bg: 'rgba(74,222,128,0.08)'  },
  { name: 'T. Okonkwo',   role: 'HVAC Apprentice',         tier: 'Yellow', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)'  },
  { name: 'J. Hartmann',  role: 'HVAC Service Technician', tier: 'Red',    color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
];

const FILTERS = [
  { icon: <Target size={18} />,           name: 'Ranked by Fit',       desc: 'Your strongest candidates surface first — no digging required.' },
  { icon: <Wrench size={18} />,            name: 'Role Type',           desc: 'Filter by the specific HVAC role you\'re actively hiring for.' },
  { icon: <MapPin size={18} />,            name: 'Location',            desc: 'Find candidates within a practical commute of your job site.' },
  { icon: <BarChart3 size={18} />,         name: 'Experience Level',    desc: 'Browse by years in the trade and seniority.' },
  { icon: <ScrollText size={18} />,        name: 'Certifications',      desc: 'Filter for the credentials your roles require.' },
  { icon: <CircleDollarSign size={18} />,  name: 'Pay Expectations',    desc: 'Find candidates whose expectations fit your budget.' },
  { icon: <Home size={18} />,              name: 'HVAC Specialty',      desc: 'Residential, commercial, refrigeration, and more.' },
  { icon: <Calendar size={18} />,          name: 'Availability',        desc: 'See who\'s ready to start now vs. open to the right opportunity.' },
];

const FEATURES = [
  { icon: <Lock size={18} />,       name: 'Private & Yours',     desc: 'Your candidate pool is completely separate from other companies\' data. Nobody else sees who\'s in your pipeline.' },
  { icon: <RefreshCw size={18} />,  name: 'Always Current',      desc: 'New applicants flow in and stay organized automatically. Your pool grows every time someone applies.' },
  { icon: <FileText size={18} />,   name: 'Notes & History',     desc: 'Track conversations, add notes, and keep your team aligned on every candidate.' },
  { icon: <TrendingUp size={18} />, name: 'Fast Shortlisting',   desc: 'Filter down to your best candidates in seconds — without reading through every resume.' },
  { icon: <Bell size={18} />,       name: 'Instant Alerts',      desc: 'Get notified when a strong candidate enters your pipeline so you can move before someone else does.' },
  { icon: <BarChart3 size={18} />,  name: 'Pipeline Visibility', desc: 'See the full picture of who\'s applied, who\'s been contacted, and who\'s still worth a call.' },
];

// ─── animated pool card ───────────────────────────────────────────────────────

const AnimatedPoolCard: React.FC = () => {
  const [visible, setVisible] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        MOCK_POOL.forEach((_, i) => {
          setTimeout(() => setVisible(v => v + 1), i * 500 + 300);
        });
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <PoolCard ref={ref}>
      <PoolCardHeader>
        <PoolCardLabel>Talos &bull; Talent Pool</PoolCardLabel>
        <PoolCardBadge><LiveDot />Live</PoolCardBadge>
      </PoolCardHeader>
      <CandidateList>
        {MOCK_POOL.map((c, i) => (
          <CandidateEntry key={i} delay={i * 0.1} visible={i < visible}>
            <CandidateEntryLeft>
              <CandidateName>{c.name}</CandidateName>
              <CandidateRole>{c.role}</CandidateRole>
            </CandidateEntryLeft>
            <TierBadge color={c.color} bg={c.bg}>{c.tier}</TierBadge>
          </CandidateEntry>
        ))}
      </CandidateList>
      <PoolCardFooter>4 candidates · ranked on arrival</PoolCardFooter>
    </PoolCard>
  );
};

// ─── component ────────────────────────────────────────────────────────────────

const TalentPool: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <FontImport />
      <Page>
        <Wrapper>

          {/* ── Top rule ── */}
          <TopRule>
            <TopLabel>Talos &mdash; Talent Pool</TopLabel>
            <TopMeta>Private &bull; Ranked &bull; Always Available</TopMeta>
          </TopRule>

          {/* ── Hero ── */}
          <HeroSection>
            <HeroKicker>Your candidates, organized</HeroKicker>
            <HeroTitle>
              Every applicant, <em>ranked</em><br />and ready.
            </HeroTitle>
            <HeroSub>
              Your private database of HVAC candidates — always current, always searchable, always yours.
            </HeroSub>
            <MidRule>
              <MidRuleOrb />
            </MidRule>
          </HeroSection>

          {/* ── Preview ── */}
          <PreviewWrap>
            <PreviewLeft>
              <PreviewTag>Live Preview</PreviewTag>
              <PreviewHeading>
                Your pipeline,<br /><em>at a glance</em>
              </PreviewHeading>
              <PreviewBody>
                Open your talent pool and your best candidates are already at the top — ranked, filtered, and ready for your call. No stacks of resumes. No guesswork.
              </PreviewBody>
              <StatRow>
                <Stat>
                  <StatNum>8<span>+</span></StatNum>
                  <StatDesc>filter options</StatDesc>
                </Stat>
                <Stat>
                  <StatNum>24<span>h</span></StatNum>
                  <StatDesc>always available</StatDesc>
                </Stat>
              </StatRow>
            </PreviewLeft>

            <AnimatedPoolCard />
          </PreviewWrap>

          {/* ── Filters ── */}
          <SectionBlock>
            <SectionHeader>
              <SectionTitle>Eight ways to filter</SectionTitle>
              <SectionRule />
              <SectionCount>Find who you need</SectionCount>
            </SectionHeader>
            <ItemGrid cols={2}>
              {FILTERS.map((f, i) => (
                <ItemCard key={i} delay={0.4 + i * 0.05}>
                  <ItemNum>{String(i + 1).padStart(2, '0')}</ItemNum>
                  <ItemIcon>{f.icon}</ItemIcon>
                  <ItemName>{f.name}</ItemName>
                  <ItemDesc>{f.desc}</ItemDesc>
                </ItemCard>
              ))}
            </ItemGrid>
          </SectionBlock>

          {/* ── Pull quote ── */}
          <PullQuote>
            <PullQuoteText>
              No more stacks of resumes. Open your pipeline and your best candidates are already waiting.
            </PullQuoteText>
            <PullQuoteAttr>Talos Talent Pool</PullQuoteAttr>
          </PullQuote>

          {/* ── Features ── */}
          <SectionBlock>
            <SectionHeader>
              <SectionTitle>Built to work for you</SectionTitle>
              <SectionRule />
              <SectionCount>Six core features</SectionCount>
            </SectionHeader>
            <ItemGrid cols={2}>
              {FEATURES.map((f, i) => (
                <ItemCard key={i} delay={0.4 + i * 0.05}>
                  <ItemNum>{String(i + 1).padStart(2, '0')}</ItemNum>
                  <ItemIcon>{f.icon}</ItemIcon>
                  <ItemName>{f.name}</ItemName>
                  <ItemDesc>{f.desc}</ItemDesc>
                </ItemCard>
              ))}
            </ItemGrid>
          </SectionBlock>

          {/* ── CTA ── */}
          <CTASection>
            <CTALeft>
              <CTALabel>Ready to build your pool?</CTALabel>
              <CTATitle>See the Talent Pool in action</CTATitle>
            </CTALeft>
            <CTAButton onClick={() => setIsDemoModalOpen(true)}>
              Get a Demo <ArrowRight />
            </CTAButton>
          </CTASection>

        </Wrapper>
      </Page>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default TalentPool;
