import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Sora:wght@300;400;500;600&display=swap');
`;

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const lineGrow = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

const countUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Page Shell ───────────────────────────────────────────────────────────────

const Page = styled.div`
  background: #080808;
  color: #e8e8e8;
  font-family: 'Sora', sans-serif;
  overflow-x: hidden;
`;

// ─── Hero ─────────────────────────────────────────────────────────────────────

const Hero = styled.section`
  min-height: 92vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 3rem;
  align-items: center;
  gap: 4rem;
  position: relative;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 6rem 2rem 4rem;
  }
`;

const HeroLeft = styled.div`
  animation: ${fadeUp} 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const EyebrowLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 2rem;

  &::before {
    content: '';
    display: block;
    width: 28px;
    height: 1px;
    background: #4ade80;
  }
`;

const HeroHeadline = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: clamp(3.2rem, 6vw, 6rem);
  font-weight: 900;
  line-height: 1.04;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 2rem;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const HeroDivider = styled.div`
  width: 48px;
  height: 2px;
  background: #4ade80;
  margin-bottom: 1.75rem;
  transform-origin: left;
  animation: ${lineGrow} 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
`;

const HeroBody = styled.p`
  font-size: 1.1rem;
  font-weight: 300;
  line-height: 1.8;
  color: #a0a0a0;
  max-width: 440px;
  margin-bottom: 2.5rem;
`;

const HeroCTA = styled.button`
  background: #4ade80;
  color: #000;
  border: none;
  padding: 1rem 2.25rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  position: relative;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #6ee89a;
    transform: translateY(-2px);
  }
`;

const HeroRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5px;
  animation: ${fadeUp} 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;

  @media (max-width: 900px) {
    display: none;
  }
`;

const HeroStatRow = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 1.75rem 2rem;
  border: 1px solid ${p => p.active ? '#4ade80' : '#1a1a1a'};
  background: ${p => p.active ? 'rgba(74,222,128,0.04)' : 'transparent'};
  transition: border-color 0.3s ease, background 0.3s ease;
  cursor: default;

  &:hover {
    border-color: #4ade80;
    background: rgba(74,222,128,0.04);
  }
`;

const StatNumber = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 400;
  color: #555;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.4;
`;

const StatGreenText = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #4ade80;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: block;
  margin-top: 0.15rem;
`;

// ─── Marquee Banner ───────────────────────────────────────────────────────────

const marqueeScroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const MarqueeBanner = styled.div`
  border-top: 1px solid #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
  overflow: hidden;
  padding: 1rem 0;
  background: #0d0d0d;
`;

const MarqueeTrack = styled.div`
  display: flex;
  width: max-content;
  animation: ${marqueeScroll} 28s linear infinite;
`;

const MarqueeItem = styled.span`
  font-family: 'Sora', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #333;
  padding: 0 2.5rem;
  white-space: nowrap;

  &.accent {
    color: #4ade80;
  }
`;

// ─── Problem Statement ────────────────────────────────────────────────────────

const ProblemSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 7rem 3rem;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 6rem;
  align-items: center;
  border-bottom: 1px solid #1a1a1a;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 5rem 2rem;
    gap: 3rem;
  }
`;

const ProblemLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 1.5rem;
`;

const ProblemHeadline = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 700;
  line-height: 1.15;
  color: #ffffff;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const ProblemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const ProblemText = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #888;
`;

const ProblemPullQuote = styled.blockquote`
  border-left: 2px solid #4ade80;
  padding-left: 1.5rem;
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-style: italic;
  color: #cccccc;
  line-height: 1.6;
`;

// ─── Features ─────────────────────────────────────────────────────────────────

const FeaturesSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 7rem 3rem;

  @media (max-width: 900px) {
    padding: 5rem 2rem;
  }
`;

const FeaturesHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 5rem;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FeaturesTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
  max-width: 480px;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const FeaturesSubtext = styled.p`
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.7;
  color: #666;
  max-width: 320px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureItem = styled.div`
  padding: 2.75rem 0;
  border-bottom: 1px solid #1a1a1a;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1.5rem;
  align-items: start;
  transition: background 0.2s ease;
  cursor: default;

  &:nth-child(odd) {
    padding-right: 3rem;
    border-right: 1px solid #1a1a1a;
  }

  &:nth-child(even) {
    padding-left: 3rem;
  }

  &:nth-last-child(-n+2) {
    border-bottom: none;
  }

  &:hover .feature-num {
    color: #4ade80;
  }

  @media (max-width: 768px) {
    grid-template-columns: 60px 1fr;
    padding: 2rem 0 !important;
    border-right: none !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    border-bottom: 1px solid #1a1a1a !important;

    &:last-child {
      border-bottom: none !important;
    }
  }
`;

const FeatureNum = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #2a2a2a;
  letter-spacing: 0.05em;
  padding-top: 4px;
  transition: color 0.2s ease;
`;

const FeatureContent = styled.div``;

const FeatureTitle = styled.h3`
  font-family: 'Sora', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.6rem;
  letter-spacing: -0.01em;
`;

const FeatureDesc = styled.p`
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.8;
  color: #666;
`;

// ─── Callout Strip ────────────────────────────────────────────────────────────

const CalloutStrip = styled.section`
  background: #4ade80;
  padding: 5rem 3rem;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 4rem;
  max-width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 4rem 2rem;
    text-align: center;
  }
`;

const CalloutText = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  font-weight: 700;
  color: #000;
  line-height: 1.25;
  max-width: 820px;
`;

const CalloutCTA = styled.button`
  background: #000;
  color: #4ade80;
  border: none;
  padding: 1.1rem 2.5rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  white-space: nowrap;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #111;
    transform: translateY(-2px);
  }
`;

// ─── Final CTA ────────────────────────────────────────────────────────────────

const FinalSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 8rem 3rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
  border-top: 1px solid #1a1a1a;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 5rem 2rem;
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
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 3.2rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
`;

const FinalRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
`;

const FinalBody = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #777;
`;

const FinalCTA = styled.button`
  align-self: flex-start;
  background: transparent;
  color: #4ade80;
  border: 1px solid #4ade80;
  padding: 1rem 2.25rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #4ade80;
    color: #000;
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
    num: '01',
    title: 'Built Only for HVAC',
    desc: 'No generic platform bloat. Every scoring model, every prompt, every workflow was designed around the specific demands of HVAC hiring.',
  },
  {
    num: '02',
    title: 'Interviews in 3 Clicks',
    desc: 'From job post to ranked candidates to scheduled interview — without weeks of manual sourcing and screening.',
  },
  {
    num: '03',
    title: 'Eliminate Agency Fees',
    desc: 'One hire pays for an entire year of Talos. Stop writing $10–20K checks to staffing agencies for roles you can fill yourself.',
  },
  {
    num: '04',
    title: 'AI That Understands Trades',
    desc: 'Knows the difference between an EPA 608 Universal and a Section 608. Scores candidates on criteria that actually matter for your business.',
  },
  {
    num: '05',
    title: 'Reduce Costly Turnover',
    desc: 'Better matching means hires who stay. The system evaluates fit, not just credentials — so you stop re-hiring the same role every six months.',
  },
  {
    num: '06',
    title: 'Your Talent Pool, Always',
    desc: 'Every applicant is stored and ranked. A great candidate who wasn\'t right for today\'s opening might be perfect for the next one.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const WhyTalos: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeStatIdx, setActiveStatIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveStatIdx(i => (i + 1) % 3);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <FontImport />
      <Page>

        {/* ── Hero ── */}
        <Hero>
          <HeroLeft>
            <EyebrowLabel>AI-Powered HVAC Recruiting</EyebrowLabel>
            <HeroHeadline>
              Stop losing great<br />
              techs to <em>slow</em><br />
              hiring.
            </HeroHeadline>
            <HeroDivider />
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
            {[
              { num: '3', unit: 'clicks', label: 'from posting a job to a scheduled interview', green: 'Start to finish' },
              { num: '$0', unit: '', label: 'in staffing agency fees — ever', green: 'No agencies' },
              { num: '11', unit: 'roles', label: 'with dedicated AI scoring frameworks', green: 'HVAC-specific' },
            ].map((stat, i) => (
              <HeroStatRow key={i} active={activeStatIdx === i}>
                <div>
                  <StatNumber>{stat.num}</StatNumber>
                  {stat.unit && <StatLabel style={{ marginLeft: '0.4rem', fontSize: '1rem' }}>{stat.unit}</StatLabel>}
                </div>
                <StatLabel>
                  {stat.label}
                  <StatGreenText>{stat.green}</StatGreenText>
                </StatLabel>
              </HeroStatRow>
            ))}
          </HeroRight>
        </Hero>

        {/* ── Marquee ── */}
        <MarqueeBanner>
          <MarqueeTrack>
            {MARQUEE_ITEMS.map((item, i) => (
              <MarqueeItem key={i} className={item === '·' ? 'accent' : ''}>
                {item}
              </MarqueeItem>
            ))}
          </MarqueeTrack>
        </MarqueeBanner>

        {/* ── Problem ── */}
        <ProblemSection>
          <div>
            <ProblemLabel>The Reality</ProblemLabel>
            <ProblemHeadline>
              HVAC owners spend<br />
              <em>months</em> filling roles<br />
              that should take days.
            </ProblemHeadline>
          </div>
          <ProblemBody>
            <ProblemText>
              The average HVAC company spends 40+ hours per hire between posting jobs,
              sifting through unqualified resumes, scheduling interviews, and following up —
              all while their fleet sits short-staffed and revenue walks out the door.
            </ProblemText>
            <ProblemPullQuote>
              "Reliable technicians mean repeat clients. Repeat clients mean more money.
              Talos closes that loop."
            </ProblemPullQuote>
            <ProblemText>
              Talos automates the entire top-of-funnel. Every resume is analyzed,
              scored against HVAC-specific criteria, and ranked before you see it.
              You only spend time on candidates who are actually worth your time.
            </ProblemText>
          </ProblemBody>
        </ProblemSection>

        {/* ── Features ── */}
        <FeaturesSection>
          <FeaturesHeader>
            <FeaturesTitle>
              What Talos<br />
              <em>actually</em> does<br />
              for your business.
            </FeaturesTitle>
            <FeaturesSubtext>
              Six core capabilities that eliminate the friction between
              a job opening and a hired technician.
            </FeaturesSubtext>
          </FeaturesHeader>

          <FeaturesGrid>
            {FEATURES.map((f, i) => (
              <FeatureItem key={i}>
                <FeatureNum className="feature-num">{f.num}</FeatureNum>
                <FeatureContent>
                  <FeatureTitle>{f.title}</FeatureTitle>
                  <FeatureDesc>{f.desc}</FeatureDesc>
                </FeatureContent>
              </FeatureItem>
            ))}
          </FeaturesGrid>
        </FeaturesSection>

        {/* ── Callout ── */}
        <CalloutStrip>
          <CalloutText>
            You'll never pay a staffing agency again. One hire covers
            a full year of Talos.
          </CalloutText>
          <CalloutCTA onClick={() => setIsDemoModalOpen(true)}>
            Book a Demo
          </CalloutCTA>
        </CalloutStrip>

        {/* ── Final CTA ── */}
        <FinalSection>
          <div>
            <FinalLabel>Ready to start</FinalLabel>
            <FinalHeadline>
              Your next great hire<br />
              is already out there.
            </FinalHeadline>
          </div>
          <FinalRight>
            <FinalBody>
              Talos is actively scanning and ranking candidates right now.
              Get a live walkthrough of the platform and see exactly how it
              would work for your company — no commitment required.
            </FinalBody>
            <FinalCTA onClick={() => setIsDemoModalOpen(true)}>
              Get Your Demo
            </FinalCTA>
          </FinalRight>
        </FinalSection>

      </Page>
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default WhyTalos;
