import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
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

// ─── statement ────────────────────────────────────────────────────────────────

const StatementBlock = styled.div`
  margin-bottom: 6rem;
  animation: ${fadeUp} 0.7s ease 0.25s both;
`;

const StatementInner = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 4rem;
  align-items: center;
  padding: 3rem 0;
  border-top: 1px solid #232830;
  border-bottom: 1px solid #232830;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatementLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
`;

const StatementQuote = styled.blockquote`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 400;
  line-height: 1.25;
  color: #ffffff;
  margin: 0;

  span { color: #4ade80; font-style: italic; }
`;

// ─── steps ────────────────────────────────────────────────────────────────────

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

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StepRow = styled.div<{ delay: number }>`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 3rem;
  padding: 2.5rem 0;
  border-bottom: 1px solid #141414;
  align-items: start;
  animation: ${fadeUp} 0.7s ease ${p => p.delay}s both;

  &:last-child { border-bottom: none; }

  @media (max-width: 600px) {
    grid-template-columns: 48px 1fr;
    gap: 1.5rem;
  }
`;

const StepNumber = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 3rem;
  font-weight: 400;
  font-style: italic;
  color: rgba(74,222,128,0.15);
  line-height: 1;
  user-select: none;
`;

const StepBody = styled.div``;

const StepTitle = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: #ffffff;
  margin: 0 0 0.6rem;
  letter-spacing: -0.01em;
`;

const StepDesc = styled.p`
  font-size: 0.88rem;
  line-height: 1.7;
  color: #8a9ab0;
  font-weight: 300;
  margin: 0;
`;

// ─── callout grid ─────────────────────────────────────────────────────────────

const CalloutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: #232830;
  border: 1px solid #232830;
  margin-bottom: 6rem;
  animation: ${fadeUp} 0.7s ease 0.4s both;

  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const CalloutItem = styled.div`
  background: #111318;
  padding: 2.5rem;
  transition: background 0.15s ease;

  &:hover { background: #1a1f2a; }
`;

const CalloutNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 2.75rem;
  font-weight: 400;
  color: #4ade80;
  line-height: 1;
  margin-bottom: 0.75rem;
`;

const CalloutTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 0.6rem;
`;

const CalloutDesc = styled.div`
  font-size: 0.85rem;
  font-weight: 300;
  line-height: 1.65;
  color: #6e7d8e;
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
  max-width: 700px;
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
    svg { transform: translateX(4px); }
  }

  svg { transition: transform 0.2s ease; }
`;

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── data ─────────────────────────────────────────────────────────────────────

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

// ─── component ────────────────────────────────────────────────────────────────

const JobBoardIntegration: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <FontImport />
      <Page>
        <Wrapper>

          {/* ── Top rule ── */}
          <TopRule>
            <TopLabel>Talos &mdash; Job Board Integration</TopLabel>
            <TopMeta>Post once &bull; Candidates ranked automatically</TopMeta>
          </TopRule>

          {/* ── Hero ── */}
          <HeroSection>
            <HeroKicker>One place for everything</HeroKicker>
            <HeroTitle>
              Post once.<br />
              Hire <em>faster.</em>
            </HeroTitle>
            <HeroSub>
              Post a job through Talos and your listing goes live without logging into anything else. Fill out your details once, in one place — no platform-hopping, no reformatting.
            </HeroSub>
            <MidRule>
              <MidRuleOrb />
            </MidRule>
          </HeroSection>

          {/* ── Statement ── */}
          <StatementBlock>
            <StatementInner>
              <StatementLabel>The method</StatementLabel>
              <StatementQuote>
                "A few clicks.{' '}
                <span>Your job is live.</span>"
              </StatementQuote>
            </StatementInner>
          </StatementBlock>

          {/* ── Steps ── */}
          <SectionBlock>
            <SectionHeader>
              <SectionTitle>How it works</SectionTitle>
              <SectionRule />
              <SectionCount>Three steps</SectionCount>
            </SectionHeader>
            <StepsList>
              {steps.map((step, i) => (
                <StepRow key={i} delay={0.4 + i * 0.1}>
                  <StepNumber>0{i + 1}</StepNumber>
                  <StepBody>
                    <StepTitle>{step.title}</StepTitle>
                    <StepDesc>{step.desc}</StepDesc>
                  </StepBody>
                </StepRow>
              ))}
            </StepsList>
          </SectionBlock>

          {/* ── Callouts ── */}
          <CalloutGrid>
            {callouts.map((item, i) => (
              <CalloutItem key={i}>
                <CalloutNum>{item.num}</CalloutNum>
                <CalloutTitle>{item.title}</CalloutTitle>
                <CalloutDesc>{item.desc}</CalloutDesc>
              </CalloutItem>
            ))}
          </CalloutGrid>

          {/* ── Pull quote ── */}
          <PullQuote>
            <PullQuoteText>
              Post it once. Let it work while you focus on the people worth calling.
            </PullQuoteText>
            <PullQuoteAttr>Talos Job Board Integration</PullQuoteAttr>
          </PullQuote>

          {/* ── CTA ── */}
          <CTASection>
            <CTALeft>
              <CTALabel>Ready to post smarter?</CTALabel>
              <CTATitle>See how it works</CTATitle>
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

export default JobBoardIntegration;
