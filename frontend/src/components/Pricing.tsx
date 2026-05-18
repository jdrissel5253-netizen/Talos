import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import DemoModal from './DemoModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
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

const barGrow = keyframes`
  from { width: 0; }
  to   { width: 100%; }
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
  max-width: 900px;
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

  @media (max-width: 600px) { flex-direction: column; gap: 0.5rem; }
`;

const TopLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
`;

const TopMeta = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

// ─── hero ─────────────────────────────────────────────────────────────────────

const HeroSection = styled.div`
  padding: 4rem 0 3rem;
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
  font-size: clamp(2.75rem, 6.5vw, 5rem);
  font-weight: 400;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 1.75rem;

  em { font-style: italic; color: #4ade80; }
`;

const HeroSub = styled.p`
  font-size: 1.05rem;
  font-weight: 300;
  color: #8a9ab0;
  max-width: 680px;
  margin-bottom: 3rem;
  line-height: 1.8;
`;

// ─── section dividers ─────────────────────────────────────────────────────────

const MidRule = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 4rem 0;

  &::before, &::after { content: ''; flex: 1; height: 1px; background: #232830; }
`;

const MidRuleOrb = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
`;

// ─── chapter headers ──────────────────────────────────────────────────────────

const ChapterWrap = styled.div<{ delay?: number }>`
  padding: 5rem 0 0;
  animation: ${fadeUp} 0.7s ease ${p => p.delay ?? 0}s both;
`;

const ChapterEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: #4ade80;
  }
`;

const ChapterTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.9rem, 3.5vw, 2.75rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;

  em { font-style: italic; color: #4ade80; }
`;

const ChapterRange = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  background: rgba(74,222,128,0.06);
  border: 1px solid rgba(74,222,128,0.15);
  padding: 0.7rem 1.25rem;
  margin-bottom: 2rem;
`;

const ChapterRangeNum = styled.span`
  font-family: 'DM Serif Display', serif;
  font-size: 1.8rem;
  color: #4ade80;
  line-height: 1;
`;

const ChapterRangeLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

const ChapterBody = styled.p`
  font-size: 1rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.9;
  margin-bottom: 1.5rem;

  strong {
    font-weight: 600;
    color: #c8d0dc;
  }
`;

// ─── callout stat ─────────────────────────────────────────────────────────────

const StatCallout = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  border-left: 3px solid #4ade80;
  padding: 1.75rem 2rem;
  margin: 2rem 0;
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const StatCalloutNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 2.8rem;
  color: #ffffff;
  line-height: 1;
  flex-shrink: 0;

  span { color: #4ade80; }
`;

const StatCalloutText = styled.div`
  font-size: 0.9rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.7;

  strong { font-weight: 600; color: #c8d0dc; }
`;

// ─── calculation card ─────────────────────────────────────────────────────────

const CalcCard = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  margin: 2rem 0;
  overflow: hidden;

  &::before {
    content: '';
    display: block;
    height: 2px;
    background: linear-gradient(90deg, #4ade80, transparent);
  }
`;

const CalcCardLabel = styled.div`
  padding: 1rem 1.5rem 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #6e7d8e;
  border-bottom: 1px solid #232830;
`;

const CalcRow = styled.div<{ total?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: ${p => p.total ? '1rem 1.5rem' : '0.7rem 1.5rem'};
  border-bottom: ${p => p.total ? 'none' : '1px solid #1a1f2a'};
  background: ${p => p.total ? 'rgba(74,222,128,0.05)' : 'transparent'};

  &:last-child { border-bottom: none; }
`;

const CalcRowLabel = styled.span<{ total?: boolean }>`
  font-size: ${p => p.total ? '0.8rem' : '0.8rem'};
  font-weight: ${p => p.total ? '600' : '300'};
  color: ${p => p.total ? '#ffffff' : '#8a9ab0'};
`;

const CalcRowValue = styled.span<{ total?: boolean; accent?: boolean }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: ${p => p.total ? '1.1rem' : '0.82rem'};
  font-weight: ${p => p.total ? '500' : '400'};
  color: ${p => p.total ? '#4ade80' : p.accent ? '#4ade80' : '#c8d0dc'};
`;

// ─── fee table ────────────────────────────────────────────────────────────────

const FeeTable = styled.div`
  margin: 2rem 0;
  border: 1px solid #232830;
  overflow: hidden;
`;

const FeeTableHead = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: #1a1f2a;
  border-bottom: 1px solid #232830;
`;

const FeeTableHeadCell = styled.div<{ accent?: boolean }>`
  padding: 0.75rem 1.25rem;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${p => p.accent ? '#4ade80' : '#6e7d8e'};
  border-right: 1px solid #232830;

  &:last-child { border-right: none; }
`;

const FeeTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid #1a1f2a;
  transition: background 0.15s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: #1a1f2a; }
`;

const FeeTableCell = styled.div<{ accent?: boolean }>`
  padding: 0.9rem 1.25rem;
  font-size: 0.85rem;
  font-weight: ${p => p.accent ? '500' : '300'};
  color: ${p => p.accent ? '#4ade80' : '#8a9ab0'};
  border-right: 1px solid #1a1f2a;
  font-family: ${p => p.accent ? "'JetBrains Mono', monospace" : 'inherit'};

  &:last-child { border-right: none; }
`;

// ─── time breakdown ───────────────────────────────────────────────────────────

const TimelineWrap = styled.div`
  margin: 2rem 0;
`;

const TimelineRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 0.9rem 0;
  border-bottom: 1px solid #1a1f2a;

  &:last-child { border-bottom: none; }

  @media (max-width: 600px) {
    grid-template-columns: 80px 1fr auto;
    gap: 0.75rem;
  }
`;

const TimelinePhase = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

const TimelineBar = styled.div`
  height: 6px;
  background: #232830;
  position: relative;
  overflow: hidden;
`;

const TimelineFill = styled.div<{ pct: number; color: string }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${p => p.pct}%;
  background: ${p => p.color};
  animation: ${barGrow} 1.2s ease 0.4s both;
`;

const TimelineDuration = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #c8d0dc;
  white-space: nowrap;
`;

// ─── component breakdown ──────────────────────────────────────────────────────

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #232830;
  border: 1px solid #232830;
  margin: 2rem 0;

  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const ComponentItem = styled.div`
  background: #111318;
  padding: 1.5rem;
  transition: background 0.15s ease;

  &:hover { background: #1a1f2a; }
`;

const ComponentItemLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 0.4rem;
`;

const ComponentItemRange = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 0.3rem;
`;

const ComponentItemNote = styled.div`
  font-size: 0.78rem;
  font-weight: 300;
  color: #6e7d8e;
  line-height: 1.5;
`;

// ─── talos callout ────────────────────────────────────────────────────────────

const TalosCard = styled.div`
  background: rgba(74,222,128,0.04);
  border: 1px solid rgba(74,222,128,0.15);
  padding: 1.5rem 1.75rem;
  margin: 2.5rem 0;
`;

const TalosCardLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 0.6rem;
`;

const TalosCardText = styled.p`
  font-size: 0.9rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.75;
  margin: 0;

  strong { font-weight: 600; color: #c8d0dc; }
`;

// ─── bullet list ──────────────────────────────────────────────────────────────

const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BulletItem = styled.li`
  font-size: 0.9rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.7;
  padding-left: 1.5rem;
  position: relative;

  &::before {
    content: '—';
    position: absolute;
    left: 0;
    color: #4ade80;
    font-size: 0.75rem;
    top: 0.05em;
  }

  strong { font-weight: 600; color: #c8d0dc; }
`;

// ─── total bar ────────────────────────────────────────────────────────────────

const TotalBar = styled.div`
  border: 1px solid #232830;
  border-top: 3px solid #4ade80;
  padding: 3rem;
  margin: 5rem 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3rem;
  align-items: center;
  animation: ${fadeUp} 0.7s ease 0.3s both;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const TotalLeft = styled.div``;

const TotalEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 0.5rem;
`;

const TotalHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
`;

const TotalBody = styled.p`
  font-size: 0.88rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.7;
  max-width: 560px;
  margin: 0;
`;

const TotalFigure = styled.div`
  text-align: right;

  @media (max-width: 700px) { text-align: left; }
`;

const TotalAmount = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 3.5rem;
  font-weight: 400;
  color: #4ade80;
  line-height: 1;
  margin-bottom: 0.4rem;
`;

const TotalSub = styled.div`
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

// ─── pull quote ───────────────────────────────────────────────────────────────

const PullQuote = styled.blockquote`
  text-align: center;
  padding: 4rem 2rem;
  margin-bottom: 5rem;
  position: relative;
  animation: ${fadeUp} 0.7s ease 0.4s both;

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
  font-size: clamp(1.4rem, 2.75vw, 2rem);
  color: #ffffff;
  line-height: 1.45;
  max-width: 760px;
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
  animation: ${fadeUp} 0.7s ease 0.5s both;

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

const CTASub = styled.p`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 0.95rem;
  color: #6e7d8e;
  margin-top: 0.4rem;
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
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #6ee89a;
    transform: translateY(-2px);
    svg { transform: translateX(4px); }
  }

  svg { transition: transform 0.2s ease; }
`;

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── component ────────────────────────────────────────────────────────────────

const Pricing: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <FontImport />
      <Page>
        <Wrapper>

          <TopRule>
            <TopLabel>Talos — Pricing</TopLabel>
            <TopMeta>What HVAC hiring actually costs</TopMeta>
          </TopRule>

          {/* ── Hero ── */}
          <HeroSection>
            <HeroKicker>Before you ask what Talos costs</HeroKicker>
            <HeroTitle>
              Here's what you're <em>already</em><br />
              spending on hiring.
            </HeroTitle>
            <HeroSub>
              Most HVAC companies don't track their hiring costs — they just feel the pain. This page breaks down what that pain actually costs, section by section, with real numbers. By the time you get to the bottom, the question won't be whether you can afford Talos. It'll be how long you've been unable to afford not having it.
            </HeroSub>
          </HeroSection>

          <MidRule><MidRuleOrb /></MidRule>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 1 — TIME TO SCREEN APPLICANTS
          ══════════════════════════════════════════════════════════════════ */}
          <ChapterWrap delay={0.2}>
            <ChapterEyebrow>01 — Screening Applicants</ChapterEyebrow>
            <ChapterTitle>
              Going through 50–150 applications<br />to find <em>five worth calling</em>
            </ChapterTitle>
            <ChapterRange>
              <ChapterRangeNum>25 – 40 hours</ChapterRangeNum>
              <ChapterRangeLabel>per open position</ChapterRangeLabel>
            </ChapterRange>

            <ChapterBody>
              A single HVAC service technician posting typically generates <strong>50 to 150 applications</strong>. That's far fewer than a general labor role — but the pool is no cleaner. A significant portion are unqualified, in the wrong market, or lack the certifications the role requires. Some applied to 40 jobs this week and will ghost you if you call.
            </ChapterBody>

            <ChapterBody>
              The work of separating the five worth talking to from the 295 who aren't is entirely manual — and it happens before you've made a single call. Most owners do it at night or on weekends, between service calls, in windows that are supposed to be for running the business.
            </ChapterBody>

            <StatCallout>
              <StatCalloutNum>50<span>–150</span></StatCalloutNum>
              <StatCalloutText>
                <strong>Typical applications per HVAC service tech posting.</strong><br />
                At 5–7 minutes per resume, that's 4–18 hours of reading before a single phone screen — and most of them won't be worth calling.
              </StatCalloutText>
            </StatCallout>

            <ChapterBody>
              Here's how that time actually breaks down across a full hiring cycle:
            </ChapterBody>

            <TimelineWrap>
              <TimelineRow>
                <TimelinePhase>Resume Review</TimelinePhase>
                <TimelineBar><TimelineFill pct={100} color="#4ade80" /></TimelineBar>
                <TimelineDuration>15 – 20 hrs</TimelineDuration>
              </TimelineRow>
              <TimelineRow>
                <TimelinePhase>Phone Calls</TimelinePhase>
                <TimelineBar><TimelineFill pct={65} color="#4ade80" /></TimelineBar>
                <TimelineDuration>1 – 4 hrs</TimelineDuration>
              </TimelineRow>
              <TimelineRow>
                <TimelinePhase>Scheduling</TimelinePhase>
                <TimelineBar><TimelineFill pct={30} color="#fbbf24" /></TimelineBar>
                <TimelineDuration>2 – 4 hrs</TimelineDuration>
              </TimelineRow>
              <TimelineRow>
                <TimelinePhase>In-Person Interviews</TimelinePhase>
                <TimelineBar><TimelineFill pct={45} color="#4ade80" /></TimelineBar>
                <TimelineDuration>5 – 8 hrs</TimelineDuration>
              </TimelineRow>
              <TimelineRow>
                <TimelinePhase>Reference Checks</TimelinePhase>
                <TimelineBar><TimelineFill pct={20} color="#fbbf24" /></TimelineBar>
                <TimelineDuration>1 – 2 hrs</TimelineDuration>
              </TimelineRow>
            </TimelineWrap>

            <ChapterBody>
              That's <strong>25 to 40 hours of hiring work per open position</strong> — and that's for a company that's reasonably organized. Many owners spend more. If you're paying an office manager to help with this, you're pulling them off billing, scheduling, and customer service. If you're doing it yourself, you're doing it on time that should be generating revenue.
            </ChapterBody>

            <CalcCard>
              <CalcCardLabel>Opportunity cost — owner doing the screening at $80/hr effective rate</CalcCardLabel>
              <CalcRow><CalcRowLabel>Resume screening (100 apps × 6 min)</CalcRowLabel><CalcRowValue>10 hrs × $80 = $800</CalcRowValue></CalcRow>
              <CalcRow><CalcRowLabel>Phone screens (15 candidates × 20 min)</CalcRowLabel><CalcRowValue>5 hrs × $80 = $400</CalcRowValue></CalcRow>
              <CalcRow><CalcRowLabel>Scheduling back-and-forth</CalcRowLabel><CalcRowValue>4 hrs × $80 = $320</CalcRowValue></CalcRow>
              <CalcRow><CalcRowLabel>Interviews + debrief</CalcRowLabel><CalcRowValue>6 hrs × $80 = $480</CalcRowValue></CalcRow>
              <CalcRow total><CalcRowLabel total>Time cost per hire (one position)</CalcRowLabel><CalcRowValue total>$4,000 – $6,000</CalcRowValue></CalcRow>
            </CalcCard>

            <BulletList>
              <BulletItem><strong>Certifications are rarely standardized on resumes.</strong> An EPA 608 Universal might appear as "Universal EPA," "EPA Certified," or "Section 608 Type I/II/III" — manual screening misses qualified candidates on word choice alone.</BulletItem>
              <BulletItem><strong>Top candidates move fast.</strong> The best technicians are typically off the market within 7–10 days. Manual screening takes weeks.</BulletItem>
              <BulletItem><strong>Consistency is nearly impossible.</strong> Reviewing resumes across multiple sittings means your criteria drifts. The 80th resume doesn't get the same attention as the 10th.</BulletItem>
              <BulletItem><strong>Rejection communications get skipped.</strong> There's no bandwidth to respond to everyone who didn't make it — damaging your reputation as an employer in your local market.</BulletItem>
            </BulletList>

            <TalosCard>
              <TalosCardLabel>What Talos does instead</TalosCardLabel>
              <TalosCardText>
                Every applicant is scored the moment they submit — against a formula built specifically for the role. <strong>You open your pipeline to a ranked list, not a pile.</strong> The top candidates are already identified before you've opened the dashboard. Total time to your first qualified interview: minutes, not weeks.
              </TalosCardText>
            </TalosCard>
          </ChapterWrap>

          <MidRule><MidRuleOrb /></MidRule>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 2 — TOTAL TIME TO HIRE
          ══════════════════════════════════════════════════════════════════ */}
          <ChapterWrap delay={0.2}>
            <ChapterEyebrow>02 — Total Time to Hire</ChapterEyebrow>
            <ChapterTitle>
              How long a role actually sits<br />
              <em>empty</em> while you hire
            </ChapterTitle>
            <ChapterRange>
              <ChapterRangeNum>6 – 12 weeks</ChapterRangeNum>
              <ChapterRangeLabel>from "we need to hire" to first day</ChapterRangeLabel>
            </ChapterRange>

            <ChapterBody>
              The industry average time-to-fill for skilled trades positions is <strong>42 days</strong>. For HVAC specifically — where the candidate pool is smaller and certifications matter — it regularly runs 6 to 12 weeks from the moment you decide to hire to the moment someone shows up for their first day.
            </ChapterBody>

            <ChapterBody>
              During every week that role sits open, you're operating at reduced capacity. If a technician generates <strong>$180,000 to $250,000 in annual revenue</strong>, an empty seat costs $3,500 to $4,800 per week in unrealized work — not counting the overtime you're paying the rest of your team to cover.
            </ChapterBody>

            <CalcCard>
              <CalcCardLabel>Revenue cost of an open technician seat (8-week average)</CalcCardLabel>
              <CalcRow><CalcRowLabel>Technician annual revenue contribution</CalcRowLabel><CalcRowValue>~$200,000 / yr</CalcRowValue></CalcRow>
              <CalcRow><CalcRowLabel>Weekly revenue gap</CalcRowLabel><CalcRowValue>$3,846 / week</CalcRowValue></CalcRow>
              <CalcRow><CalcRowLabel>8-week hiring timeline</CalcRowLabel><CalcRowValue>× 8 weeks</CalcRowValue></CalcRow>
              <CalcRow total><CalcRowLabel total>Revenue left on the table</CalcRowLabel><CalcRowValue total>~$30,000</CalcRowValue></CalcRow>
            </CalcCard>

            <ChapterBody>
              Here's where the time goes, week by week:
            </ChapterBody>

            <TimelineWrap>
              <TimelineRow>
                <TimelinePhase>Weeks 1–2</TimelinePhase>
                <TimelineBar><TimelineFill pct={20} color="#4ade80" /></TimelineBar>
                <TimelineDuration>Write &amp; post job description</TimelineDuration>
              </TimelineRow>
              <TimelineRow>
                <TimelinePhase>Weeks 2–4</TimelinePhase>
                <TimelineBar><TimelineFill pct={45} color="#4ade80" /></TimelineBar>
                <TimelineDuration>Applications come in, initial screening</TimelineDuration>
              </TimelineRow>
              <TimelineRow>
                <TimelinePhase>Weeks 3–5</TimelinePhase>
                <TimelineBar><TimelineFill pct={60} color="#fbbf24" /></TimelineBar>
                <TimelineDuration>Phone screens &amp; scheduling</TimelineDuration>
              </TimelineRow>
              <TimelineRow>
                <TimelinePhase>Weeks 5–7</TimelinePhase>
                <TimelineBar><TimelineFill pct={80} color="#fbbf24" /></TimelineBar>
                <TimelineDuration>In-person interviews, references, offer</TimelineDuration>
              </TimelineRow>
              <TimelineRow>
                <TimelinePhase>Weeks 7–10</TimelinePhase>
                <TimelineBar><TimelineFill pct={100} color="#ef4444" /></TimelineBar>
                <TimelineDuration>Background check, notice period, start date</TimelineDuration>
              </TimelineRow>
            </TimelineWrap>

            <ChapterBody>
              Notice what's missing from that timeline: <strong>none of it is moving quickly</strong>. Each stage stalls. Resumes pile up unread over a weekend. Phone tag delays screens by three days. Candidates who applied two weeks ago have already accepted somewhere else by the time you call.
            </ChapterBody>

            <BulletList>
              <BulletItem><strong>The best candidates are off the market in 7–10 days.</strong> By the time most companies finish their initial review, the A-tier applicants are already placed.</BulletItem>
              <BulletItem><strong>Most technicians need to give two weeks notice.</strong> Even after you make an offer, you're waiting. Some are locked into a full month at their current employer.</BulletItem>
              <BulletItem><strong>A re-hire resets the clock entirely.</strong> If your first choice declines or backs out, you restart from week three or four — not week one.</BulletItem>
              <BulletItem><strong>Existing staff absorbs the gap.</strong> 6–10 weeks of overtime and overextension increases the risk that a second technician burns out or leaves while you're still trying to fill the first seat.</BulletItem>
            </BulletList>

            <TalosCard>
              <TalosCardLabel>What Talos does instead</TalosCardLabel>
              <TalosCardText>
                Talos compresses weeks 2 through 4 into hours. <strong>Applications are scored and ranked in real time</strong> — the moment someone submits, they're evaluated and placed in your pipeline. You're interviewing your top three candidates by day two, not week four. The role gets filled in days, not months.
              </TalosCardText>
            </TalosCard>
          </ChapterWrap>

          <MidRule><MidRuleOrb /></MidRule>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 3 — COST OF A BAD HIRE
          ══════════════════════════════════════════════════════════════════ */}
          <ChapterWrap delay={0.2}>
            <ChapterEyebrow>03 — The Cost of a Bad Hire</ChapterEyebrow>
            <ChapterTitle>
              What happens when gut feeling<br />picks the <em>wrong technician</em>
            </ChapterTitle>
            <ChapterRange>
              <ChapterRangeNum>$18,000 – $120,000</ChapterRangeNum>
              <ChapterRangeLabel>cost of one bad hire</ChapterRangeLabel>
            </ChapterRange>

            <ChapterBody>
              The HVAC industry has an annual turnover rate of <strong>35–40%</strong>. That means roughly one in three technicians you hire this year will be gone by next year. Some will leave for a competitor. Some won't make it through training. Some will stay just long enough to cost you customers before they go.
            </ChapterBody>

            <ChapterBody>
              The Society for Human Resource Management (SHRM) estimates that a bad hire costs <strong>50–200% of the position's annual salary</strong>. The U.S. Department of Labor puts the floor at 30%. Most HVAC owners instinctively know the damage is significant — they just haven't added it up.
            </ChapterBody>

            <StatCallout>
              <StatCalloutNum>$<span>30K</span></StatCalloutNum>
              <StatCalloutText>
                <strong>Conservative cost of a bad hire on a $60,000 technician.</strong><br />
                SHRM's 50% estimate. The full range goes to $120,000 at the high end — more than the person ever earned working for you.
              </StatCalloutText>
            </StatCallout>

            <ChapterBody>
              The damage isn't a single line item. It accumulates across every stage of the failed hire:
            </ChapterBody>

            <ComponentGrid>
              <ComponentItem>
                <ComponentItemLabel>Training Investment</ComponentItemLabel>
                <ComponentItemRange>$2,000 – $6,000</ComponentItemRange>
                <ComponentItemNote>Onboarding time, materials, rides-along with senior tech, systems access setup</ComponentItemNote>
              </ComponentItem>
              <ComponentItem>
                <ComponentItemLabel>Low-Productivity Period</ComponentItemLabel>
                <ComponentItemRange>$4,000 – $12,000</ComponentItemRange>
                <ComponentItemNote>1–3 months of partial productivity while the tech ramps up — or never does</ComponentItemNote>
              </ComponentItem>
              <ComponentItem>
                <ComponentItemLabel>Customer Callbacks &amp; Rework</ComponentItemLabel>
                <ComponentItemRange>$1,500 – $10,000</ComponentItemRange>
                <ComponentItemNote>Service failures, warranty callbacks, refunds, and damaged customer relationships</ComponentItemNote>
              </ComponentItem>
              <ComponentItem>
                <ComponentItemLabel>Management Overhead</ComponentItemLabel>
                <ComponentItemRange>$2,000 – $6,000</ComponentItemRange>
                <ComponentItemNote>Time spent coaching, documenting, disciplining, and eventually terminating</ComponentItemNote>
              </ComponentItem>
              <ComponentItem>
                <ComponentItemLabel>Overtime for Remaining Team</ComponentItemLabel>
                <ComponentItemRange>$3,000 – $8,000</ComponentItemRange>
                <ComponentItemNote>Other techs absorbing the gap while you re-hire — affecting morale and retention</ComponentItemNote>
              </ComponentItem>
              <ComponentItem>
                <ComponentItemLabel>Re-Hiring Costs</ComponentItemLabel>
                <ComponentItemRange>$4,000 – $18,000</ComponentItemRange>
                <ComponentItemNote>The full cost of the hiring process starting over from scratch</ComponentItemNote>
              </ComponentItem>
            </ComponentGrid>

            <ChapterBody>
              There's also the compounding effect that doesn't show up in any spreadsheet: <strong>a bad hire damages your employer reputation</strong>. In most markets, the HVAC technician community is small. The tech who had a bad experience at your company tells two others. Recruiting gets harder each time it happens.
            </ChapterBody>

            <BulletList>
              <BulletItem><strong>Most HVAC hiring is reactive, not systematic.</strong> Someone quits on a Friday, you need a tech by Monday. You hire whoever's available and willing — not whoever's right.</BulletItem>
              <BulletItem><strong>Interview performance doesn't predict job performance.</strong> The tech who presents well in an interview isn't always the one who handles a difficult customer at 7pm in August.</BulletItem>
              <BulletItem><strong>References are almost never disqualifying.</strong> No one lists a bad reference. And most managers won't say anything negative on the record for legal reasons. References rarely prevent a bad hire.</BulletItem>
            </BulletList>

            <TalosCard>
              <TalosCardLabel>What Talos does instead</TalosCardLabel>
              <TalosCardText>
                Talos evaluates every candidate across the signals that actually predict retention: <strong>employment stability, experience depth, role alignment, and geographic fit</strong> — not just what's on the top line of a resume. Consistent, structured evaluation catches the patterns that gut feeling misses, before you've invested a day of training.
              </TalosCardText>
            </TalosCard>
          </ChapterWrap>

          <MidRule><MidRuleOrb /></MidRule>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 4 — OUTREACH + JOB BOARD
          ══════════════════════════════════════════════════════════════════ */}
          <ChapterWrap delay={0.2}>
            <ChapterEyebrow>04 — Job Board &amp; Outreach Costs</ChapterEyebrow>
            <ChapterTitle>
              Getting your posting seen —<br />and <em>following up</em> on it
            </ChapterTitle>
            <ChapterRange>
              <ChapterRangeNum>$500 – $3,000+</ChapterRangeNum>
              <ChapterRangeLabel>per hire in ad spend + time</ChapterRangeLabel>
            </ChapterRange>

            <ChapterBody>
              Indeed's free listings get buried within 24 hours in competitive markets. Sponsored posts are pay-per-click — and in HVAC, where multiple companies are competing for the same pool of candidates, cost-per-click ranges from <strong>$5 to $15 in most metro markets</strong>. To generate 50 qualified applicants at a typical 5% application rate, you need 1,000 clicks. At $10 CPC, that's $10,000 in ad spend for one role.
            </ChapterBody>

            <ChapterBody>
              Most companies don't spend that much — they cap their budget, get fewer applicants, and then wonder why the pool is thin. The alternative is free listings on multiple platforms, which means <strong>30–60 minutes of reformatting per platform</strong> and manual renewal every 30 days.
            </ChapterBody>

            <BulletList>
              <BulletItem><strong>Indeed sponsored: $5–$15 per click.</strong> You pay for every click, whether the person applies or not. A 5% application rate is considered good.</BulletItem>
              <BulletItem><strong>ZipRecruiter, LinkedIn, and niche boards add up.</strong> Posting everywhere manually doubles the admin work and cost with limited incremental return.</BulletItem>
              <BulletItem><strong>Once you have candidates, you still need to reach them.</strong> Industry data shows it takes 4–8 touchpoints to successfully schedule a single interview with a passive candidate.</BulletItem>
              <BulletItem><strong>Outreach messages are written from scratch, every time.</strong> Most owners default to one-line texts and wonder why their response rate is low. Good outreach takes time to write and personalize.</BulletItem>
            </BulletList>

            <TalosCard>
              <TalosCardLabel>What Talos does instead</TalosCardLabel>
              <TalosCardText>
                Talos handles posting and generates personalized outreach for every stage of your pipeline — interview invitations, follow-ups, and rejections — <strong>tailored to each candidate and your specific role</strong>. No copy-pasting. No blank pages. No re-logging into platforms.
              </TalosCardText>
            </TalosCard>
          </ChapterWrap>

          <MidRule><MidRuleOrb /></MidRule>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 5 — STAFFING AGENCIES
          ══════════════════════════════════════════════════════════════════ */}
          <ChapterWrap delay={0.2}>
            <ChapterEyebrow>05 — Staffing &amp; Placement Agencies</ChapterEyebrow>
            <ChapterTitle>
              What you pay when someone else<br />finds your <em>technician</em>
            </ChapterTitle>
            <ChapterRange>
              <ChapterRangeNum>$8,000 – $18,750</ChapterRangeNum>
              <ChapterRangeLabel>per placement</ChapterRangeLabel>
            </ChapterRange>

            <ChapterBody>
              Staffing agencies are the default solution for HVAC companies that don't have a hiring process. You call, describe the role, and a few weeks later they send you candidates. It works — but the fee structure is built entirely in the agency's favor.
            </ChapterBody>

            <ChapterBody>
              The standard model is a <strong>placement fee of 15–25% of the hired candidate's first-year salary</strong>. That's not per hour. That's not a monthly retainer. That's a one-time check you write per hire. For a senior service technician at $65,000, you're looking at $9,750 to $16,250 for a single placement — before the person has set foot in your truck.
            </ChapterBody>

            <StatCallout>
              <StatCalloutNum>25<span>%</span></StatCalloutNum>
              <StatCalloutText>
                <strong>The agency's cut of your new hire's first-year salary.</strong><br />
                On a $60,000 technician, that's $15,000 — before training, before benefits, before their first service call.
              </StatCalloutText>
            </StatCallout>

            <ChapterBody>
              Here's what placement fees look like across common HVAC roles:
            </ChapterBody>

            <FeeTable>
              <FeeTableHead>
                <FeeTableHeadCell>Role</FeeTableHeadCell>
                <FeeTableHeadCell>Avg. Salary</FeeTableHeadCell>
                <FeeTableHeadCell accent>Agency Fee (15–25%)</FeeTableHeadCell>
              </FeeTableHead>
              <FeeTableRow>
                <FeeTableCell>HVAC Apprentice</FeeTableCell>
                <FeeTableCell>$38,000 – $45,000</FeeTableCell>
                <FeeTableCell accent>$5,700 – $11,250</FeeTableCell>
              </FeeTableRow>
              <FeeTableRow>
                <FeeTableCell>HVAC Service Technician</FeeTableCell>
                <FeeTableCell>$52,000 – $65,000</FeeTableCell>
                <FeeTableCell accent>$7,800 – $16,250</FeeTableCell>
              </FeeTableRow>
              <FeeTableRow>
                <FeeTableCell>Lead / Senior Technician</FeeTableCell>
                <FeeTableCell>$65,000 – $80,000</FeeTableCell>
                <FeeTableCell accent>$9,750 – $20,000</FeeTableCell>
              </FeeTableRow>
              <FeeTableRow>
                <FeeTableCell>HVAC Installer</FeeTableCell>
                <FeeTableCell>$48,000 – $62,000</FeeTableCell>
                <FeeTableCell accent>$7,200 – $15,500</FeeTableCell>
              </FeeTableRow>
              <FeeTableRow>
                <FeeTableCell>Service Manager</FeeTableCell>
                <FeeTableCell>$70,000 – $90,000</FeeTableCell>
                <FeeTableCell accent>$10,500 – $22,500</FeeTableCell>
              </FeeTableRow>
            </FeeTable>

            <ChapterBody>
              Most HVAC companies hire <strong>two to five technicians per year</strong> — a mix of growth hiring and backfill from turnover. At that pace, agency fees alone can run $25,000–$75,000 annually. That's before you account for the hidden costs most owners don't factor in.
            </ChapterBody>

            <BulletList>
              <BulletItem><strong>You don't control who you meet.</strong> The agency screens first. Candidates who might be perfect for your company but don't fit the agency's template never reach you.</BulletItem>
              <BulletItem><strong>Guarantee periods are replacements, not refunds.</strong> The standard 90-day guarantee means if the hire leaves or doesn't work out, you get a free replacement search — not your money back. You still lost 90 days.</BulletItem>
              <BulletItem><strong>Urgency costs more.</strong> If you need someone in two weeks instead of six, some agencies charge a rush fee or bump the percentage.</BulletItem>
              <BulletItem><strong>The agency is optimizing for placement speed, not fit.</strong> Their incentive is to place someone and collect the fee — not to find the best long-term hire for your company.</BulletItem>
            </BulletList>

            <CalcCard>
              <CalcCardLabel>Example — HVAC company hiring 3 technicians per year</CalcCardLabel>
              <CalcRow><CalcRowLabel>Service Technician ($60k) × 20%</CalcRowLabel><CalcRowValue>$12,000</CalcRowValue></CalcRow>
              <CalcRow><CalcRowLabel>HVAC Installer ($55k) × 20%</CalcRowLabel><CalcRowValue>$11,000</CalcRowValue></CalcRow>
              <CalcRow><CalcRowLabel>Lead Technician ($72k) × 22%</CalcRowLabel><CalcRowValue>$15,840</CalcRowValue></CalcRow>
              <CalcRow total><CalcRowLabel total>Annual agency fees</CalcRowLabel><CalcRowValue total>$38,840</CalcRowValue></CalcRow>
            </CalcCard>

            <TalosCard>
              <TalosCardLabel>What Talos does instead</TalosCardLabel>
              <TalosCardText>
                Talos charges a <strong>flat platform fee — no placement fees, no per-hire charges, no percentage of salary. Ever.</strong> Whether you hire one technician this year or ten, your cost doesn't change. Most companies recoup the entire cost of Talos on their first hire alone.
              </TalosCardText>
            </TalosCard>
          </ChapterWrap>

          <MidRule><MidRuleOrb /></MidRule>

          {/* ── Total ── */}
          <TotalBar>
            <TotalLeft>
              <TotalEyebrow>Adding it up</TotalEyebrow>
              <TotalHeadline>
                The true cost of hiring one HVAC technician without a system
              </TotalHeadline>
              <TotalBody>
                Agency fees, screening time, ad spend, outreach, and the risk of a bad hire — hiring a single technician the traditional way routinely costs $15,000 to $50,000 in direct and indirect expenses. And that number resets every time someone leaves. With a 35–40% annual turnover rate, most HVAC companies are paying this cost multiple times per year.
              </TotalBody>
            </TotalLeft>
            <TotalFigure>
              <TotalAmount>$50K</TotalAmount>
              <TotalSub>potential cost per hire</TotalSub>
            </TotalFigure>
          </TotalBar>

          {/* ── Pull quote ── */}
          <PullQuote>
            <PullQuoteText>
              The question isn't what Talos costs. It's what one bad hire — or one agency placement — was already costing you.
            </PullQuoteText>
            <PullQuoteAttr>Talos — Built for HVAC</PullQuoteAttr>
          </PullQuote>

          {/* ── CTA ── */}
          <CTASection>
            <CTALeft>
              <CTALabel>See the numbers yourself</CTALabel>
              <CTATitle>Get a demo and see<br />what Talos replaces</CTATitle>
              <CTASub>No placement fees. No per-hire charges. Ever.</CTASub>
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

export default Pricing;
