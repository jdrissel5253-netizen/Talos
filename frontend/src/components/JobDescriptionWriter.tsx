import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
`;

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ─── Page ─────────────────────────────────────────────────────────────────────

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

const HeroSection = styled.section`
  padding: 6rem 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  border-bottom: 1px solid #232830;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 5rem 0 4rem;
    gap: 3rem;
  }
`;

const HeroLeft = styled.div`
  animation: ${fadeUp} 0.7s ease 0.1s both;
`;

const HeroEyebrow = styled.div`
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
  font-size: clamp(2.8rem, 5vw, 5rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #fff;
  margin-bottom: 1.75rem;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const HeroBody = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
  max-width: 420px;
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

// ─── Mock Document Preview ────────────────────────────────────────────────────

const PreviewCard = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  overflow: hidden;
  animation: ${slideIn} 0.9s ease 0.2s both;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px #232830;

  &::before {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, #4ade80, #6ee89a, #4ade80);
  }
`;

const PreviewBar = styled.div`
  background: #0d1014;
  border-bottom: 1px solid #232830;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PreviewDot = styled.div<{ color: string }>`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${p => p.color};
  opacity: 0.5;
`;

const PreviewLabel = styled.span`
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  color: #6e7d8e;
  letter-spacing: 0.08em;
`;

const GeneratingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.2);
  padding: 0.2rem 0.6rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #4ade80;
  letter-spacing: 0.1em;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #4ade80;
    animation: ${blink} 1.2s ease-in-out infinite;
  }
`;

const PreviewBody = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const PreviewRole = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #4ade80;
`;

const PreviewTitle = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: #fff;
  line-height: 1.2;
`;

const PreviewDivider = styled.div`
  height: 1px;
  background: #232830;
`;

const PreviewText = styled.div`
  font-size: 0.78rem;
  font-weight: 300;
  line-height: 1.85;
  color: #6e7d8e;

  background: linear-gradient(90deg, #6e7d8e 0%, #8a9ab0 40%, #6e7d8e 60%, #6e7d8e 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
`;

const PreviewBullets = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const PreviewBullet = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.78rem;
  font-weight: 400;
  color: #c8d0dc;

  &::before {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #4ade80;
    flex-shrink: 0;
  }
`;

const PreviewCursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 0.85em;
  background: #4ade80;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: ${blink} 1s step-end infinite;
`;

const PreviewFooter = styled.div`
  border-top: 1px solid #232830;
  padding: 0.9rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PreviewFooterText = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #2e3540;
  letter-spacing: 0.06em;
`;

const PreviewWordCount = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #4ade80;
  letter-spacing: 0.06em;
`;

// ─── Section Utilities ────────────────────────────────────────────────────────

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 3rem;
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
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
  white-space: nowrap;
`;

// ─── Roles Section ────────────────────────────────────────────────────────────

const RolesSection = styled.section`
  position: relative;
  z-index: 1;
  border-bottom: 1px solid #232830;
  padding: 5rem 0;
`;

const RolesSubtext = styled.p`
  font-size: 0.9rem;
  color: #6e7d8e;
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 2.5rem;

  span {
    color: #8a9ab0;
    font-style: italic;
  }
`;

const RolesTagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const RoleTag = styled.div<{ featured?: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 0.78rem;
  font-weight: ${p => p.featured ? '500' : '300'};
  letter-spacing: 0.02em;
  color: ${p => p.featured ? '#4ade80' : '#6e7d8e'};
  background: ${p => p.featured ? 'rgba(74,222,128,0.08)' : 'transparent'};
  border: 1px solid ${p => p.featured ? 'rgba(74,222,128,0.3)' : '#232830'};
  cursor: default;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(74,222,128,0.4);
    color: #4ade80;
    background: rgba(74,222,128,0.06);
  }
`;

// ─── How It Works ─────────────────────────────────────────────────────────────

const ProcessSection = styled.section`
  position: relative;
  z-index: 1;
  padding: 7rem 0;
  border-bottom: 1px solid #232830;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 6rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ProcessLeft = styled.div`
  position: sticky;
  top: 4rem;

  @media (max-width: 900px) {
    position: static;
  }
`;

const ProcessEyebrow = styled.div`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 1.25rem;
`;

const ProcessTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 400;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const ProcessSubtext = styled.p`
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
`;

const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 2rem;
  padding-bottom: 3rem;
  position: relative;

  &:last-child { padding-bottom: 0; }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 23px;
    top: 48px;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, #232830, transparent);
  }
`;

const TimelineNode = styled.div`
  width: 48px;
  height: 48px;
  border: 1px solid #232830;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background: #111318;
  transition: border-color 0.2s ease;

  ${TimelineItem}:hover & {
    border-color: rgba(74,222,128,0.4);
  }
`;

const TimelineNodeNum = styled.span`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1rem;
  color: rgba(74,222,128,0.25);
  transition: color 0.2s ease;

  ${TimelineItem}:hover & {
    color: #4ade80;
  }
`;

const TimelineContent = styled.div`
  padding-top: 0.75rem;
`;

const TimelineTitle = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.15rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 0.6rem;
  letter-spacing: -0.01em;
`;

const TimelineDesc = styled.p`
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.8;
  color: #8a9ab0;
`;

// ─── Why It Works ─────────────────────────────────────────────────────────────

const WhySection = styled.section`
  position: relative;
  z-index: 1;
  background: #0d1014;
  border-bottom: 1px solid #232830;
  padding: 7rem 2.5rem;

  @media (max-width: 768px) {
    padding: 5rem 1.25rem;
  }
`;

const WhyInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const WhyEyebrow = styled.div`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 0.75rem;
`;

const WhyTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 400;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 4rem;
  max-width: 600px;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const WhyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #232830;
  border: 1px solid #232830;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const WhyItem = styled.div`
  background: #0d1014;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  cursor: default;
  transition: background 0.2s ease;

  &:hover {
    background: #1a1f2a;
  }

  &:hover .why-num {
    color: rgba(74,222,128,0.4);
  }
`;

const WhyNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 3rem;
  color: rgba(74,222,128,0.07);
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  line-height: 1;
  pointer-events: none;
  transition: color 0.2s ease;
`;

const WhyItemTitle = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.15rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
  line-height: 1.3;
`;

const WhyItemDesc = styled.p`
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
`;

// ─── CTA ─────────────────────────────────────────────────────────────────────

const CTASection = styled.section`
  position: relative;
  z-index: 1;
  background: #4ade80;
  padding: 6rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const CTAEyebrow = styled.div`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.4);
`;

const CTAHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 400;
  color: #000;
  line-height: 1.15;
  max-width: 640px;
  letter-spacing: -0.02em;
`;

const CTABody = styled.p`
  font-size: 1rem;
  font-weight: 400;
  color: rgba(0,0,0,0.55);
  max-width: 480px;
  line-height: 1.7;
`;

const CTAButton = styled.button`
  background: #0a0f0a;
  color: #4ade80;
  border: none;
  padding: 1rem 2.5rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #111318;
    transform: translateY(-2px);
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Enter your job details',
    desc: "Tell Talos what you're hiring for. That's all it needs.",
  },
  {
    num: '02',
    title: 'Get a complete job description',
    desc: 'A polished, HVAC-specific posting is ready — written for the kind of candidate you actually want to hire.',
  },
  {
    num: '03',
    title: 'Make it yours',
    desc: 'Use it as written, or put your own spin on it. Add company culture, tweak the tone, or copy it straight to your job board.',
  },
  {
    num: '04',
    title: 'Post and start receiving applications',
    desc: 'Publish and let the candidates come to you.',
  },
];

const WHY_ITEMS = [
  {
    num: '01',
    title: 'Industry-Specific Language',
    desc: 'Uses terminology that real HVAC professionals use and search for. No generic "dynamic team environment" filler.',
  },
  {
    num: '02',
    title: 'Certification Auto-Detection',
    desc: 'Automatically surfaces the relevant certifications for each role — EPA 608, NATE, OSHA, and others.',
  },
  {
    num: '03',
    title: 'Filters Poor Fits Early',
    desc: 'Well-written descriptions with clear requirements reduce unqualified applications before they reach your inbox.',
  },
  {
    num: '04',
    title: 'Structured for Search',
    desc: 'Formatted to perform well on job boards. Candidates searching for specific HVAC roles will find your posting.',
  },
  {
    num: '05',
    title: 'Minutes, Not Hours',
    desc: 'No blank-page paralysis. No copying from old postings. A complete, polished description in under 60 seconds.',
  },
  {
    num: '06',
    title: 'Customizable Every Time',
    desc: 'Use it as a starting point or post as-is. Every output is editable before it goes live.',
  },
];

const PREVIEW_BULLETS = [
  'Role-specific certifications and licensing',
  'Experience requirements tailored to your market',
  'Schedule, pay type, and benefits included',
  'Clear expectations — written for real candidates',
];

const FEATURED_ROLES = [
  'HVAC Installer',
  'Lead Technician',
  'Service Manager',
  'Dispatcher',
  'HVAC Service Tech',
];

// ─── Component ────────────────────────────────────────────────────────────────

const JobDescriptionWriter: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [visibleBullets, setVisibleBullets] = useState(0);

  useEffect(() => {
    if (visibleBullets >= PREVIEW_BULLETS.length) return;
    const t = setTimeout(() => setVisibleBullets(v => v + 1), 900);
    return () => clearTimeout(t);
  }, [visibleBullets]);

  return (
    <>
      <FontImport />
      <Page>

        <Wrapper>
          {/* ── Hero ── */}
          <HeroSection>
            <HeroLeft>
              <HeroEyebrow>AI Job Description Writer</HeroEyebrow>
              <HeroHeadline>
                Write job posts<br />
                that attract the<br />
                <em>right</em> techs.
              </HeroHeadline>
              <HeroBody>
                Give Talos a few details about the role and it generates a
                complete, HVAC-specific job description in seconds — written
                to filter out poor fits before they even apply.
              </HeroBody>
              <HeroCTA onClick={() => setIsDemoModalOpen(true)}>
                Try It in the Demo
              </HeroCTA>
            </HeroLeft>

            {/* Mock document preview */}
            <PreviewCard>
              <PreviewBar>
                <PreviewDot color="#ff5f57" />
                <PreviewDot color="#ffbd2e" />
                <PreviewDot color="#28ca41" />
                <PreviewLabel>talos_output.md</PreviewLabel>
                <GeneratingBadge>Generating</GeneratingBadge>
              </PreviewBar>

              <PreviewBody>
                <PreviewRole>HVAC Service Technician</PreviewRole>
                <PreviewTitle>Your next great hire starts here.</PreviewTitle>
                <PreviewDivider />
                <PreviewText>
                  Talos writes the job description for you — structured around your role,
                  your market, and the kind of candidate who actually stays. Every posting
                  is built to attract the right techs and filter out the rest.
                </PreviewText>
                <PreviewDivider />
                <PreviewBullets>
                  {PREVIEW_BULLETS.slice(0, visibleBullets).map((b, i) => (
                    <PreviewBullet key={i}>{b}</PreviewBullet>
                  ))}
                  {visibleBullets < PREVIEW_BULLETS.length && (
                    <PreviewBullet>
                      <PreviewCursor />
                    </PreviewBullet>
                  )}
                </PreviewBullets>
              </PreviewBody>

              <PreviewFooter>
                <PreviewFooterText>Generated by Talos · Built for HVAC</PreviewFooterText>
                <PreviewWordCount>412 words</PreviewWordCount>
              </PreviewFooter>
            </PreviewCard>
          </HeroSection>

          {/* ── Roles ── */}
          <RolesSection>
            <SectionHeader>
              <SectionTitle>15+ HVAC roles covered</SectionTitle>
              <SectionRule />
              <SectionCount>out of the box</SectionCount>
            </SectionHeader>
            <RolesSubtext>
              Every common HVAC position has a dedicated template —
              <span> from service tech to field supervisor.</span>
            </RolesSubtext>
            <RolesTagWrap>
              {FEATURED_ROLES.map((role, i) => (
                <RoleTag key={i} featured>{role}</RoleTag>
              ))}
              <RoleTag>+ more</RoleTag>
            </RolesTagWrap>
          </RolesSection>

          {/* ── Process ── */}
          <ProcessSection>
            <ProcessLeft>
              <ProcessEyebrow>How it works</ProcessEyebrow>
              <ProcessTitle>
                From details<br />
                to <em>done.</em>
              </ProcessTitle>
              <ProcessSubtext>
                No blank pages. No copying from old postings.
                Enter what you need, and Talos handles the rest.
              </ProcessSubtext>
            </ProcessLeft>

            <Timeline>
              {PROCESS_STEPS.map((step, i) => (
                <TimelineItem key={i}>
                  <TimelineNode>
                    <TimelineNodeNum>{step.num}</TimelineNodeNum>
                  </TimelineNode>
                  <TimelineContent>
                    <TimelineTitle>{step.title}</TimelineTitle>
                    <TimelineDesc>{step.desc}</TimelineDesc>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </ProcessSection>
        </Wrapper>

        {/* ── Why It Works ── */}
        <WhySection>
          <WhyInner>
            <WhyEyebrow>Why it works</WhyEyebrow>
            <WhyTitle>
              Not a template.<br />
              <em>Trained</em> on HVAC.
            </WhyTitle>
            <WhyGrid>
              {WHY_ITEMS.map((item, i) => (
                <WhyItem key={i}>
                  <WhyNum className="why-num">{item.num}</WhyNum>
                  <WhyItemTitle>{item.title}</WhyItemTitle>
                  <WhyItemDesc>{item.desc}</WhyItemDesc>
                </WhyItem>
              ))}
            </WhyGrid>
          </WhyInner>
        </WhySection>

        {/* ── CTA ── */}
        <CTASection>
          <CTAEyebrow>See it live</CTAEyebrow>
          <CTAHeadline>
            Watch Talos write a job description for your open role.
          </CTAHeadline>
          <CTABody>
            Book a 20-minute demo and we'll generate a description for one of your
            actual open positions live — so you can see exactly what you'd get.
          </CTABody>
          <CTAButton onClick={() => setIsDemoModalOpen(true)}>
            Book a Demo
          </CTAButton>
        </CTASection>

      </Page>
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default JobDescriptionWriter;
