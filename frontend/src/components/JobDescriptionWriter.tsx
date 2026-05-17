import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
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
  background: #080808;
  color: #e8e8e8;
  font-family: 'Sora', sans-serif;
  overflow-x: hidden;
`;

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 6rem 3rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  border-bottom: 1px solid #141414;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 5rem 2rem 4rem;
    gap: 3rem;
  }
`;

const HeroLeft = styled.div`
  animation: ${fadeUp} 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const HeroEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 1.75rem;

  &::before {
    content: '';
    display: block;
    width: 24px;
    height: 1px;
    background: #4ade80;
  }
`;

const HeroHeadline = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.8rem, 5vw, 5.5rem);
  font-weight: 900;
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
  color: #777;
  max-width: 420px;
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
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #6ee89a;
    transform: translateY(-2px);
  }
`;

// ─── Mock Document Preview ────────────────────────────────────────────────────

const PreviewCard = styled.div`
  background: #0d0d0d;
  border: 1px solid #1e1e1e;
  padding: 0;
  overflow: hidden;
  animation: ${slideIn} 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px #1a1a1a;
`;

const PreviewBar = styled.div`
  background: #111;
  border-bottom: 1px solid #1e1e1e;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PreviewDot = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.color};
  opacity: 0.6;
`;

const PreviewLabel = styled.span`
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: #333;
  letter-spacing: 0.08em;
`;

const GeneratingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
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
  font-family: 'Sora', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #4ade80;
`;

const PreviewTitle = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
`;

const PreviewDivider = styled.div`
  height: 1px;
  background: #1a1a1a;
`;

const PreviewText = styled.div`
  font-size: 0.78rem;
  font-weight: 300;
  line-height: 1.85;
  color: #555;

  background: linear-gradient(90deg, #555 0%, #777 40%, #555 60%, #555 100%);
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
  color: #e8e8e8;

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
  border-top: 1px solid #141414;
  padding: 0.9rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PreviewFooterText = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #2a2a2a;
  letter-spacing: 0.06em;
`;

const PreviewWordCount = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #4ade80;
  letter-spacing: 0.06em;
`;

// ─── Roles Section ────────────────────────────────────────────────────────────

const RolesSection = styled.section`
  border-bottom: 1px solid #141414;
  padding: 5rem 3rem;

  @media (max-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const RolesInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
`;

const RolesHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
`;

const RolesTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.15;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const RolesCount = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 6vw, 6rem);
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 1px #222;
  line-height: 1;
  flex-shrink: 0;
`;

const RolesTagWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const RoleTag = styled.div<{ featured?: boolean }>`
  padding: 0.55rem 1.1rem;
  font-size: 0.78rem;
  font-weight: ${p => p.featured ? '600' : '400'};
  letter-spacing: 0.03em;
  color: ${p => p.featured ? '#000' : '#555'};
  background: ${p => p.featured ? '#4ade80' : 'transparent'};
  border: 1px solid ${p => p.featured ? '#4ade80' : '#1e1e1e'};
  cursor: default;
  transition: all 0.2s ease;
  clip-path: ${p => p.featured ? 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' : 'none'};

  &:hover {
    border-color: #4ade80;
    color: ${p => p.featured ? '#000' : '#4ade80'};
  }
`;

// ─── How It Works ─────────────────────────────────────────────────────────────

const ProcessSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 7rem 3rem;
  border-bottom: 1px solid #141414;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 6rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 5rem 2rem;
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
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 1.25rem;
`;

const ProcessTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
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
  color: #555;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 2rem;
  padding-bottom: 3rem;
  position: relative;

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 23px;
    top: 40px;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, #222, transparent);
  }
`;

const TimelineNode = styled.div`
  width: 48px;
  height: 48px;
  border: 1px solid #222;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  background: #080808;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  transition: border-color 0.2s ease;

  ${TimelineItem}:hover & {
    border-color: #4ade80;
  }
`;

const TimelineNodeNum = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
  transition: color 0.2s ease;

  ${TimelineItem}:hover & {
    color: #4ade80;
  }
`;

const TimelineContent = styled.div`
  padding-top: 0.75rem;
`;

const TimelineTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #e8e8e8;
  margin-bottom: 0.6rem;
  letter-spacing: -0.01em;
`;

const TimelineDesc = styled.p`
  font-size: 0.85rem;
  font-weight: 300;
  line-height: 1.8;
  color: #555;
`;

// ─── Why It Works ─────────────────────────────────────────────────────────────

const WhySection = styled.section`
  background: #0a0a0a;
  border-bottom: 1px solid #141414;
  padding: 7rem 3rem;

  @media (max-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const WhyInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
`;

const WhyHeader = styled.div`
  margin-bottom: 4rem;
  max-width: 600px;
`;

const WhyEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 1.25rem;
`;

const WhyTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.15;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const WhyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  border: 1px solid #141414;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const WhyItem = styled.div`
  padding: 2.5rem;
  border-right: 1px solid #141414;
  border-bottom: 1px solid #141414;
  cursor: default;
  transition: background 0.2s ease;

  &:nth-child(3n) { border-right: none; }
  &:nth-last-child(-n+3) { border-bottom: none; }

  &:hover {
    background: #0d0d0d;
  }

  &:hover .why-num {
    color: #4ade80;
  }

  @media (max-width: 900px) {
    border-right: none;

    &:last-child { border-bottom: none; }
    &:nth-last-child(-n+3) { border-bottom: 1px solid #141414; }
    &:last-child { border-bottom: none; }
  }
`;

const WhyNum = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 1.25rem;
  transition: color 0.2s ease;
`;

const WhyItemTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #e8e8e8;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
  line-height: 1.3;
`;

const WhyItemDesc = styled.p`
  font-size: 0.82rem;
  font-weight: 300;
  line-height: 1.85;
  color: #555;
`;

// ─── CTA ─────────────────────────────────────────────────────────────────────

const CTASection = styled.section`
  background: #4ade80;
  padding: 6rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const CTAEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.4);
`;

const CTAHeadline = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  color: #000;
  line-height: 1.12;
  max-width: 640px;
`;

const CTABody = styled.p`
  font-size: 1rem;
  font-weight: 400;
  color: rgba(0,0,0,0.55);
  max-width: 480px;
  line-height: 1.7;
`;

const CTAButton = styled.button`
  background: #000;
  color: #4ade80;
  border: none;
  padding: 1.1rem 2.5rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #111;
    transform: translateY(-2px);
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROLES = [
  { label: 'HVAC Service Technician', featured: true },
  { label: 'HVAC Installer' },
  { label: 'Lead HVAC Technician' },
  { label: 'Preventative Maintenance Tech' },
  { label: 'HVAC Apprentice' },
  { label: 'Refrigeration Technician' },
  { label: 'Commercial HVAC Tech' },
  { label: 'Residential HVAC Tech' },
  { label: 'HVAC Dispatcher', featured: true },
  { label: 'Service Manager' },
  { label: 'HVAC Sales Representative' },
  { label: 'Controls Technician' },
  { label: 'Sheet Metal Worker' },
  { label: 'Warehouse Associate' },
  { label: 'Administrative Assistant', featured: true },
  { label: 'Customer Service Rep' },
  { label: 'Bookkeeper' },
  { label: 'HVAC Project Manager' },
  { label: 'Field Supervisor' },
  { label: 'HVAC Inspector' },
  { label: 'Energy Auditor' },
  { label: 'HVAC Estimator' },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Enter Your Job Details',
    desc: 'Provide the role, location, pay range, certifications required, and experience level. Talos takes it from there.',
  },
  {
    num: '02',
    title: 'AI Generates the Description',
    desc: 'The AI writes a complete job description using language tuned to attract the right candidates for that specific HVAC role — not generic boilerplate.',
  },
  {
    num: '03',
    title: 'Review and Adjust Tone',
    desc: 'Put your own spin on it. Adjust tone, add company culture details, or use it exactly as written.',
  },
  {
    num: '04',
    title: 'Post and Start Receiving Applications',
    desc: 'Publish directly or copy to your preferred job board. The description is structured for both search visibility and candidate resonance.',
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

// ─── Animated Preview ─────────────────────────────────────────────────────────

const PREVIEW_BULLETS = [
  'Role-specific certifications and licensing',
  'Experience requirements tailored to your market',
  'Schedule, pay type, and benefits included',
  'Clear expectations — written for real candidates',
];

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
          <RolesInner>
            <RolesHeader>
              <RolesTitle>
                <em>20+</em> HVAC roles<br />covered out of the box.
              </RolesTitle>
              <RolesCount>20+</RolesCount>
            </RolesHeader>
            <RolesTagWrap>
              {ROLES.map((r, i) => (
                <RoleTag key={i} featured={r.featured}>{r.label}</RoleTag>
              ))}
            </RolesTagWrap>
          </RolesInner>
        </RolesSection>

        {/* ── Process ── */}
        <ProcessSection>
          <ProcessLeft>
            <ProcessEyebrow>How it works</ProcessEyebrow>
            <ProcessTitle>
              From details<br />
              to <em>done</em><br />
              in 60 seconds.
            </ProcessTitle>
            <ProcessSubtext>
              No blank pages, no copy-paste from old postings.
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

        {/* ── Why It Works ── */}
        <WhySection>
          <WhyInner>
            <WhyHeader>
              <WhyEyebrow>Why it works</WhyEyebrow>
              <WhyTitle>
                Not a template.<br />
                <em>Trained</em> on HVAC.
              </WhyTitle>
            </WhyHeader>
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
