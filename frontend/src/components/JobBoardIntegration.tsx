import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Sora:wght@300;400;500;600&display=swap');
`;

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const lineGrow = keyframes`
  from { width: 0; }
  to   { width: 100%; }
`;

// ─── Page Shell ───────────────────────────────────────────────────────────────

const Page = styled.div`
  background: #080808;
  color: #e8e8e8;
  font-family: 'Sora', sans-serif;
  overflow-x: hidden;
`;

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroWrap = styled.section`
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
  padding: 7rem 3rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  border-bottom: 1px solid #1a1a1a;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 5rem 2rem 4rem;
  }
`;

const BackgroundWord = styled.div`
  position: absolute;
  right: -2rem;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Playfair Display', serif;
  font-size: clamp(8rem, 16vw, 18rem);
  font-weight: 900;
  font-style: italic;
  color: transparent;
  -webkit-text-stroke: 1px #1c1c1c;
  user-select: none;
  pointer-events: none;
  line-height: 1;
  white-space: nowrap;
  animation: ${fadeIn} 1.2s ease both;

  @media (max-width: 768px) { display: none; }
`;

const HeroTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  animation: ${fadeUp} 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const SideLabel = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #4ade80;
  padding-top: 0.5rem;
  flex-shrink: 0;
  align-self: stretch;
  display: flex;
  align-items: center;

  @media (max-width: 768px) { display: none; }
`;

const HeroContent = styled.div`
  flex: 1;
`;

const HeroHeadline = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 6vw, 6.5rem);
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: #ffffff;
  margin-bottom: 0;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const HeroBottom = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const HeroDesc = styled.p`
  font-size: 1.05rem;
  line-height: 1.75;
  color: #888;
  font-weight: 300;
  max-width: 480px;
  animation: ${fadeUp} 0.9s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const HeroMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: ${fadeUp} 0.9s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const MetaLine = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    display: block;
    width: 20px;
    height: 1px;
    background: #4ade80;
    flex-shrink: 0;
  }
`;

const HeroCTA = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  background: #4ade80;
  color: #000;
  border: none;
  padding: 0.85rem 2rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));

  &:hover {
    background: #6ee89a;
    transform: translateY(-1px);
  }
`;

// ─── Statement strip ──────────────────────────────────────────────────────────

const StatementStrip = styled.section`
  border-bottom: 1px solid #1a1a1a;
  padding: 5rem 3rem;
  max-width: 1320px;
  margin: 0 auto;

  @media (max-width: 768px) { padding: 4rem 2rem; }
`;

const StatementInner = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 4rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const StatementLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  padding-top: 0.4rem;
  line-height: 1.6;
`;

const StatementQuote = styled.blockquote`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 700;
  line-height: 1.25;
  color: #ffffff;
  margin: 0;

  span {
    color: #4ade80;
  }
`;

// ─── Steps ────────────────────────────────────────────────────────────────────

const StepsSection = styled.section`
  border-bottom: 1px solid #1a1a1a;
  padding: 6rem 3rem;
  max-width: 1320px;
  margin: 0 auto;

  @media (max-width: 768px) { padding: 4rem 2rem; }
`;

const SectionEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 3rem;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StepRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 3rem;
  padding: 2.5rem 0;
  border-bottom: 1px solid #141414;
  align-items: start;
  animation: ${fadeUp} 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;

  &:last-child { border-bottom: none; }

  @media (max-width: 600px) {
    grid-template-columns: 48px 1fr;
    gap: 1.5rem;
  }
`;

const StepNumber = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 900;
  font-style: italic;
  color: #1e1e1e;
  line-height: 1;
  user-select: none;
`;

const StepBody = styled.div``;

const StepTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.6rem;
  letter-spacing: -0.01em;
`;

const StepDesc = styled.p`
  font-size: 0.88rem;
  line-height: 1.7;
  color: #666;
  font-weight: 300;
  margin: 0;
  max-width: 540px;
`;

// ─── Callout ──────────────────────────────────────────────────────────────────

const CalloutSection = styled.section`
  border-bottom: 1px solid #1a1a1a;
  padding: 6rem 3rem;
  max-width: 1320px;
  margin: 0 auto;

  @media (max-width: 768px) { padding: 4rem 2rem; }
`;

const CalloutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: #1a1a1a;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CalloutItem = styled.div`
  background: #080808;
  padding: 2.5rem;

  &:hover { background: #0d0d0d; }
`;

const CalloutItemNum = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 900;
  color: #4ade80;
  line-height: 1;
  margin-bottom: 1rem;
`;

const CalloutItemTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 0.75rem;
`;

const CalloutItemDesc = styled.div`
  font-size: 0.83rem;
  line-height: 1.65;
  color: #555;
  font-weight: 300;
`;

// ─── CTA ──────────────────────────────────────────────────────────────────────

const CTASection = styled.section`
  padding: 7rem 3rem;
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;

  @media (max-width: 768px) { padding: 5rem 2rem; }
`;

const CTAHeadline = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 900;
  line-height: 1.1;
  color: #ffffff;
  max-width: 600px;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const CTAButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #4ade80;
  color: #000;
  border: none;
  padding: 0.9rem 2.25rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));

  &:hover {
    background: #6ee89a;
    transform: translateY(-1px);
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const steps = [
  {
    title: 'Fill out your job details once',
    desc: 'Title, pay, schedule, certifications required — enter it inside Talos and it\'s ready to go. No reformatting for different platforms.',
  },
  {
    title: 'Your listing goes live',
    desc: 'Talos pushes your job to where HVAC candidates are actually looking. No logins to juggle, no copy-pasting across sites.',
  },
  {
    title: 'Candidates flow straight into your pipeline',
    desc: 'Every applicant is scored and ranked automatically the instant they hit your pipeline.',
  },
];

const callouts = [
  {
    num: 'A few',
    title: 'Clicks to post',
    desc: 'Fill out your job details once and your listing goes live — no platform-hopping.',
  },
  {
    num: '0',
    title: 'Platforms to log into',
    desc: 'One place to post, manage, and review — start to finish.',
  },
  {
    num: '100%',
    title: 'Candidates ranked on arrival',
    desc: 'Every applicant is scored before you ever open your pipeline.',
  },
];

const JobBoardIntegration: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <FontImport />
      <Page>

        {/* ── Hero ── */}
        <HeroWrap>
          <BackgroundWord>Post.</BackgroundWord>

          <HeroTop>
            <SideLabel>Job board integration</SideLabel>
            <HeroContent>
              <HeroHeadline>
                Post once.<br />
                Hire <em>faster.</em>
              </HeroHeadline>
            </HeroContent>
          </HeroTop>

          <HeroBottom>
            <HeroDesc>
              Post a job through Talos and your listing goes live without
              logging into anything else. Fill out your details once, in one
              place — no platform-hopping, no reformatting, no juggling logins.
            </HeroDesc>
            <HeroMeta>
              <MetaLine>Built for HVAC hiring</MetaLine>
              <MetaLine>No platform accounts needed</MetaLine>
              <MetaLine>Candidates ranked automatically</MetaLine>
              <HeroCTA onClick={() => setIsDemoModalOpen(true)}>
                See how it works →
              </HeroCTA>
            </HeroMeta>
          </HeroBottom>
        </HeroWrap>

        {/* ── Statement ── */}
        <StatementStrip>
          <StatementInner>
            <StatementLabel>
              The method
            </StatementLabel>
            <StatementQuote>
              "A few clicks.{' '}
              <span>Your job is live.</span>"
            </StatementQuote>
          </StatementInner>
        </StatementStrip>

        {/* ── Steps ── */}
        <StepsSection>
          <SectionEyebrow>How it works</SectionEyebrow>
          <StepsList>
            {steps.map((step, i) => (
              <StepRow key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <StepNumber>0{i + 1}</StepNumber>
                <StepBody>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDesc>{step.desc}</StepDesc>
                </StepBody>
              </StepRow>
            ))}
          </StepsList>
        </StepsSection>

        {/* ── Callouts ── */}
        <CalloutSection>
          <SectionEyebrow>By the numbers</SectionEyebrow>
          <CalloutGrid>
            {callouts.map((item, i) => (
              <CalloutItem key={i}>
                <CalloutItemNum>{item.num}</CalloutItemNum>
                <CalloutItemTitle>{item.title}</CalloutItemTitle>
                <CalloutItemDesc>{item.desc}</CalloutItemDesc>
              </CalloutItem>
            ))}
          </CalloutGrid>
        </CalloutSection>

        {/* ── CTA ── */}
        <CTASection>
          <CTAHeadline>
            Ready to stop spending your afternoon<br />
            <em>posting jobs?</em>
          </CTAHeadline>
          <CTAButton onClick={() => setIsDemoModalOpen(true)}>
            Get a demo →
          </CTAButton>
        </CTASection>

      </Page>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default JobBoardIntegration;
