import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Target, Wrench, CircleDollarSign, BarChart3, RefreshCw, ScrollText } from 'lucide-react';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');
`;

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
`;

const marqueeScroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

// ─── Page Shell ───────────────────────────────────────────────────────────────

const Page = styled.div`
  background: #111318;
  color: #e8eaf0;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  position: relative;

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

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = styled.section`
  padding: 7rem 0 5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 5rem 0 3rem;
    gap: 3rem;
  }
`;

const HeroLeft = styled.div`
  animation: ${fadeUp} 0.7s ease 0.1s both;
`;

const EyebrowTag = styled.div`
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
  margin-bottom: 2rem;
`;

const HeroHeadline = styled.h1`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3rem, 5.5vw, 5rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 1.75rem;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const HeroBody = styled.p`
  font-size: 1.05rem;
  font-weight: 300;
  line-height: 1.8;
  color: #8a9ab0;
  max-width: 460px;
  margin-bottom: 2.5rem;
`;

const HeroCTA = styled.button`
  background: #4ade80;
  color: #0a0f0a;
  border: none;
  padding: 0.9rem 2.25rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: #6ee89a;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(74,222,128,0.25);
  }
`;

const HeroRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #232830;
  border: 1px solid #232830;
  animation: ${fadeUp} 0.7s ease 0.2s both;

  @media (max-width: 900px) {
    display: none;
  }
`;

const StatBlock = styled.div<{ active?: boolean }>`
  background: ${p => p.active ? '#1a1f2a' : '#111318'};
  padding: 2rem 2rem;
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease;
  cursor: default;

  &:hover {
    background: #1a1f2a;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: ${p => p.active ? '#4ade80' : 'transparent'};
    transition: background 0.3s ease;
  }
`;

const StatBlockNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 2.8rem;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.4rem;

  span { color: #4ade80; }
`;

const StatBlockLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.5;
  margin-bottom: 0.25rem;
`;

const StatBlockTag = styled.div`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4ade80;
`;

// ─── Marquee ──────────────────────────────────────────────────────────────────

const MarqueeBand = styled.div`
  position: relative;
  z-index: 1;
  border-top: 1px solid #232830;
  border-bottom: 1px solid #232830;
  overflow: hidden;
  padding: 1rem 0;
  background: #0d1014;
`;

const MarqueeTrack = styled.div`
  display: flex;
  width: max-content;
  animation: ${marqueeScroll} 30s linear infinite;
`;

const MarqueeItem = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #2e3540;
  padding: 0 2.5rem;
  white-space: nowrap;

  &.accent { color: #4ade80; }
`;

// ─── Section Utilities ────────────────────────────────────────────────────────

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 3.5rem;
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

const MidRule = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 5rem 0;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #232830;
  }
`;

const MidOrb = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
`;

// ─── Problem Section ──────────────────────────────────────────────────────────

const ProblemSection = styled.section`
  position: relative;
  z-index: 1;
  padding: 6rem 0;
  border-top: 1px solid #232830;
`;

const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 6rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ProblemLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 1.5rem;
`;

const ProblemHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #ffffff;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const ProblemRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProblemText = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
`;

const PullQuoteCard = styled.blockquote`
  background: #1a1f2a;
  border: 1px solid #232830;
  border-left: 3px solid #4ade80;
  padding: 1.5rem 2rem;
  margin: 0;
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1.1rem;
  color: #c8d0dc;
  line-height: 1.6;
`;

// ─── Features ─────────────────────────────────────────────────────────────────

const FeaturesSection = styled.section`
  position: relative;
  z-index: 1;
  padding: 2rem 0 6rem;
`;

const FeaturesIntro = styled.p`
  font-size: 0.9rem;
  font-weight: 300;
  color: #6e7d8e;
  max-width: 380px;
  line-height: 1.7;
  margin-left: auto;
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
    margin-left: 0;
    max-width: 100%;
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #232830;
  border: 1px solid #232830;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const ItemCard = styled.div<{ delay: number }>`
  background: #111318;
  padding: 2.75rem;
  position: relative;
  overflow: hidden;
  transition: background 0.2s ease;
  animation: ${fadeUp} 0.6s ease ${p => p.delay}s both;

  &:hover {
    background: #1a1f2a;
  }
`;

const ItemGhostNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 5rem;
  color: rgba(74,222,128,0.07);
  line-height: 1;
  position: absolute;
  top: 1.25rem;
  right: 1.75rem;
  pointer-events: none;
  user-select: none;
`;

const ItemIcon = styled.div`
  width: 40px;
  height: 40px;
  border: 1.5px solid rgba(74,222,128,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: #4ade80;
`;

const ItemName = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
`;

const ItemDesc = styled.p`
  font-size: 0.875rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.8;
`;

// ─── Pull Quote ───────────────────────────────────────────────────────────────

const BigQuote = styled.blockquote`
  text-align: center;
  padding: 5rem 2rem;
  position: relative;

  &::before {
    content: '"';
    font-family: 'DM Serif Display', serif;
    font-size: 12rem;
    color: rgba(74,222,128,0.06);
    position: absolute;
    top: -2rem;
    left: 50%;
    transform: translateX(-50%);
    line-height: 1;
    pointer-events: none;
    user-select: none;
  }
`;

const BigQuoteText = styled.p`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  color: #ffffff;
  line-height: 1.4;
  max-width: 720px;
  margin: 0 auto 1.5rem;
  position: relative;
  z-index: 1;
`;

// ─── Callout Strip ────────────────────────────────────────────────────────────

const CalloutStrip = styled.section`
  position: relative;
  z-index: 1;
  background: #4ade80;
  padding: 5rem 2.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 4rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 4rem 1.5rem;
    text-align: center;
  }
`;

const CalloutText = styled.p`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 400;
  color: #0a0f0a;
  line-height: 1.3;
  max-width: 700px;

  em {
    font-style: italic;
  }
`;

const CalloutCTA = styled.button`
  background: #0a0f0a;
  color: #4ade80;
  border: none;
  padding: 1rem 2.5rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #111318;
    transform: translateY(-2px);
  }
`;

// ─── Final CTA ────────────────────────────────────────────────────────────────

const FinalSection = styled.section`
  position: relative;
  z-index: 1;
  padding: 8rem 0;
  border-top: 1px solid #232830;
`;

const FinalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const FinalLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 1.5rem;
`;

const FinalHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.02em;
`;

const FinalBody = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
  margin-bottom: 2rem;
`;

const FinalCTA = styled.button`
  background: transparent;
  color: #4ade80;
  border: 1px solid rgba(74,222,128,0.4);
  padding: 0.9rem 2.25rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #4ade80;
    border-color: #4ade80;
    color: #0a0f0a;
    transform: translateY(-2px);
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  'AI Resume Scoring', '·', 'HVAC-Specific', '·', 'Talent Pipeline', '·',
  'Job Description AI', '·', 'Zero Staffing Fees', '·', 'Instant Rankings', '·',
  'AI Resume Scoring', '·', 'HVAC-Specific', '·', 'Talent Pipeline', '·',
  'Job Description AI', '·', 'Zero Staffing Fees', '·', 'Instant Rankings', '·',
];

const FEATURES = [
  {
    icon: Target,
    num: '01',
    title: 'Built Only for HVAC',
    desc: 'No generic platform bloat. Every scoring model, every prompt, every workflow was designed around the specific demands of HVAC hiring.',
  },
  {
    icon: Wrench,
    num: '02',
    title: 'Interviews in 3 Clicks',
    desc: 'From job post to ranked candidates to scheduled interview — without weeks of manual sourcing and screening.',
  },
  {
    icon: CircleDollarSign,
    num: '03',
    title: 'Eliminate Agency Fees',
    desc: 'One hire pays for an entire year of Talos. Stop writing $10–20K checks to staffing agencies for roles you can fill yourself.',
  },
  {
    icon: BarChart3,
    num: '04',
    title: 'AI That Understands Trades',
    desc: 'Knows the difference between an EPA 608 Universal and a Section 608. Scores candidates on criteria that actually matter for your business.',
  },
  {
    icon: RefreshCw,
    num: '05',
    title: 'Reduce Costly Turnover',
    desc: 'Better matching means hires who stay. The system evaluates fit, not just credentials — so you stop re-hiring the same role every six months.',
  },
  {
    icon: ScrollText,
    num: '06',
    title: 'Your Talent Pool, Always',
    desc: "Every applicant is stored and ranked. A great candidate who wasn't right for today's opening might be perfect for the next one.",
  },
];

const STATS = [
  { num: '3', unit: ' clicks', label: 'from posting a job to a scheduled interview', tag: 'Start to finish' },
  { num: '$0', unit: '', label: 'in staffing agency fees — ever', tag: 'No agencies' },
  { num: '11', unit: ' roles', label: 'with dedicated scoring built for HVAC hiring', tag: 'HVAC-specific' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const WhyTalos: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeStatIdx, setActiveStatIdx] = useState(0);

  return (
    <>
      <FontImport />
      <Page>

        <Wrapper>
          {/* ── Hero ── */}
          <Hero>
            <HeroLeft>
              <EyebrowTag>AI-Powered HVAC Recruiting</EyebrowTag>
              <HeroHeadline>
                Stop losing great<br />
                techs to <em>slow</em><br />
                hiring.
              </HeroHeadline>
              <HeroBody>
                Talos is the only recruiting platform built exclusively
                for HVAC companies. Find, rank, and hire reliable technicians
                without ever paying a staffing agency again.
              </HeroBody>
              <HeroCTA onClick={() => setIsDemoModalOpen(true)}>
                See Talos in Action
              </HeroCTA>
            </HeroLeft>

            <HeroRight>
              {STATS.map((stat, i) => (
                <StatBlock
                  key={i}
                  active={activeStatIdx === i}
                  onMouseEnter={() => setActiveStatIdx(i)}
                >
                  <StatBlockNum>
                    {stat.num}<span>{stat.unit}</span>
                  </StatBlockNum>
                  <StatBlockLabel>{stat.label}</StatBlockLabel>
                  <StatBlockTag>{stat.tag}</StatBlockTag>
                </StatBlock>
              ))}
            </HeroRight>
          </Hero>
        </Wrapper>

        {/* ── Marquee ── */}
        <MarqueeBand>
          <MarqueeTrack>
            {MARQUEE_ITEMS.map((item, i) => (
              <MarqueeItem key={i} className={item === '·' ? 'accent' : ''}>
                {item}
              </MarqueeItem>
            ))}
          </MarqueeTrack>
        </MarqueeBand>

        <Wrapper>
          {/* ── Problem ── */}
          <ProblemSection>
            <ProblemGrid>
              <div>
                <ProblemLabel>The Reality</ProblemLabel>
                <ProblemHeadline>
                  HVAC owners spend<br />
                  <em>months</em> filling roles<br />
                  that should take days.
                </ProblemHeadline>
              </div>
              <ProblemRight>
                <ProblemText>
                  The average HVAC company spends 40+ hours per hire between posting jobs,
                  sifting through unqualified resumes, scheduling interviews, and following up —
                  all while their fleet sits short-staffed and revenue walks out the door.
                </ProblemText>
                <PullQuoteCard>
                  "Reliable technicians mean repeat clients. Repeat clients mean more money.
                  Talos closes that loop."
                </PullQuoteCard>
                <ProblemText>
                  Talos automates the entire top-of-funnel. Every resume is analyzed,
                  scored against HVAC-specific criteria, and ranked before you see it.
                  You only spend time on candidates who are actually worth your time.
                </ProblemText>
              </ProblemRight>
            </ProblemGrid>
          </ProblemSection>

          {/* ── Features ── */}
          <FeaturesSection>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3.5rem', gap: '2rem', flexWrap: 'wrap' }}>
              <SectionHeader style={{ marginBottom: 0, flex: 1, minWidth: 260 }}>
                <SectionTitle>What Talos does for your business</SectionTitle>
                <SectionRule />
              </SectionHeader>
              <FeaturesIntro>
                Six core capabilities that eliminate the friction between
                a job opening and a hired technician.
              </FeaturesIntro>
            </div>

            <ItemGrid>
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <ItemCard key={i} delay={0.1 + i * 0.05}>
                    <ItemGhostNum>{f.num}</ItemGhostNum>
                    <ItemIcon>
                      <Icon size={18} />
                    </ItemIcon>
                    <ItemName>{f.title}</ItemName>
                    <ItemDesc>{f.desc}</ItemDesc>
                  </ItemCard>
                );
              })}
            </ItemGrid>
          </FeaturesSection>

          {/* ── Pull Quote ── */}
          <BigQuote>
            <BigQuoteText>
              You'll never pay a staffing agency again.
              One hire covers a full year of Talos.
            </BigQuoteText>
            <MidRule style={{ margin: '0 auto', maxWidth: 200 }}>
              <MidOrb />
            </MidRule>
          </BigQuote>

        </Wrapper>

        {/* ── Callout Strip ── */}
        <CalloutStrip>
          <CalloutText>
            Your next great hire is already out there.
            <em> Talos finds them before your competitors do.</em>
          </CalloutText>
          <CalloutCTA onClick={() => setIsDemoModalOpen(true)}>
            Book a Demo
          </CalloutCTA>
        </CalloutStrip>

        <Wrapper>
          {/* ── Final CTA ── */}
          <FinalSection>
            <FinalGrid>
              <div>
                <FinalLabel>Ready to start</FinalLabel>
                <FinalHeadline>
                  Your next great hire<br />
                  is already out there.
                </FinalHeadline>
              </div>
              <div>
                <FinalBody>
                  Talos is actively scanning and ranking candidates right now.
                  Get a live walkthrough of the platform and see exactly how it
                  would work for your company — no commitment required.
                </FinalBody>
                <FinalCTA onClick={() => setIsDemoModalOpen(true)}>
                  Get Your Demo
                </FinalCTA>
              </div>
            </FinalGrid>
          </FinalSection>
        </Wrapper>

      </Page>
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default WhyTalos;
