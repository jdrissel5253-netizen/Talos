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

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const scoreReveal = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const barFill = keyframes`
  from { width: 0; }
  to   { width: var(--fill); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
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
  padding: 6rem 3rem 5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  border-bottom: 1px solid #141414;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 5rem 2rem 4rem;
    gap: 3.5rem;
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
  font-size: clamp(2.8rem, 5vw, 5.2rem);
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

// ─── Leaderboard Visual ───────────────────────────────────────────────────────

const Leaderboard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: ${fadeIn} 1s ease 0.3s both;
`;

const LeaderboardHeader = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 64px 80px;
  gap: 1rem;
  padding: 0 1.25rem 0.75rem;
  align-items: center;
`;

const LeaderboardHeadCell = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #2a2a2a;
`;

const CandidateRow = styled.div<{ delay: number }>`
  display: grid;
  grid-template-columns: 32px 1fr 64px 80px;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: #0d0d0d;
  border: 1px solid #141414;
  align-items: center;
  cursor: default;
  transition: border-color 0.2s ease;
  animation: ${scoreReveal} 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${p => p.delay}s both;

  &:hover {
    border-color: #222;
  }
`;

const CandidateRank = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #2a2a2a;
  text-align: center;
`;

const CandidateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const CandidateName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #e8e8e8;
  letter-spacing: -0.01em;
`;

const CandidateMeta = styled.span`
  font-size: 0.7rem;
  font-weight: 300;
  color: #333;
  letter-spacing: 0.02em;
`;

const CandidateScore = styled.span<{ color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${p => p.color};
  text-align: center;
  line-height: 1;
`;

const TierBadge = styled.div<{ color: string; bg: string }>`
  padding: 0.3rem 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${p => p.color};
  background: ${p => p.bg};
  border: 1px solid ${p => p.color}33;
  text-align: center;
`;

const LeaderboardFooter = styled.div`
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterNote = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #222;
  letter-spacing: 0.08em;
`;

const LiveIndicator = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
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
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

// ─── Philosophy Section ───────────────────────────────────────────────────────

const PhilosophySection = styled.section`
  background: #4ade80;
  padding: 5rem 3rem;

  @media (max-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const PhilosophyInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PhilosophyHeadline = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 3.2rem);
  font-weight: 900;
  color: #000;
  line-height: 1.1;
`;

const PhilosophyRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const PhilosophyText = styled.p`
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.8;
  color: rgba(0,0,0,0.65);
`;

const PhilosophyNote = styled.p`
  font-size: 0.78rem;
  font-weight: 500;
  color: rgba(0,0,0,0.4);
  font-style: italic;
  border-top: 1px solid rgba(0,0,0,0.15);
  padding-top: 1.25rem;
`;

// ─── Tiers ────────────────────────────────────────────────────────────────────

const TiersSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 7rem 3rem;
  border-bottom: 1px solid #141414;

  @media (max-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const TiersHeader = styled.div`
  margin-bottom: 4rem;
`;

const TiersEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 1.25rem;
`;

const TiersTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.15;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const TiersStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const TierRow = styled.div<{ borderColor: string }>`
  display: grid;
  grid-template-columns: 180px 1fr 1fr;
  border: 1px solid #141414;
  border-left: 3px solid ${p => p.borderColor};
  transition: background 0.2s ease;
  cursor: default;

  &:hover {
    background: #0d0d0d;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    border-left: 3px solid ${p => p.borderColor};
  }
`;

const TierLeft = styled.div`
  padding: 2.5rem 2rem;
  border-right: 1px solid #141414;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #141414;
    padding: 1.75rem 1.5rem;
  }
`;

const TierLabel = styled.div<{ color: string }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${p => p.color};
`;

const TierRange = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
`;

const TierMiddle = styled.div`
  padding: 2.5rem 2rem;
  border-right: 1px solid #141414;

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #141414;
    padding: 1.75rem 1.5rem;
  }
`;

const TierDesc = styled.p`
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.8;
  color: #777;
`;

const TierRight = styled.div`
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  @media (max-width: 768px) {
    padding: 1.75rem 1.5rem;
  }
`;

const TierAction = styled.div`
  font-size: 0.82rem;
  font-weight: 500;
  color: #e8e8e8;
  letter-spacing: -0.01em;
`;

const TierSubaction = styled.div`
  font-size: 0.78rem;
  font-weight: 300;
  color: #444;
  line-height: 1.6;
`;

// ─── Signals Section ──────────────────────────────────────────────────────────

const SignalsSection = styled.section`
  background: #0a0a0a;
  border-bottom: 1px solid #141414;
  padding: 7rem 3rem;

  @media (max-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const SignalsInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 7rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const SignalsLeft = styled.div``;

const SignalsEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 1.25rem;
`;

const SignalsTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 1.5rem;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const SignalsSubtext = styled.p`
  font-size: 0.88rem;
  font-weight: 300;
  line-height: 1.85;
  color: #555;
`;

const SignalsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const SignalItem = styled.div`
  padding: 1.75rem 0;
  border-bottom: 1px solid #141414;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2rem;
  cursor: default;

  &:first-child { border-top: 1px solid #141414; }

  &:hover .signal-bar-fill {
    filter: brightness(1.3);
  }
`;

const SignalInfo = styled.div``;

const SignalName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #e8e8e8;
  margin-bottom: 0.35rem;
  letter-spacing: -0.01em;
`;

const SignalDesc = styled.div`
  font-size: 0.78rem;
  font-weight: 300;
  color: #444;
  line-height: 1.5;
`;

const SignalBar = styled.div`
  width: 100px;
  height: 2px;
  background: #141414;
  position: relative;
  flex-shrink: 0;
`;

const SignalBarFill = styled.div<{ fill: string; color: string }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: var(--fill);
  background: ${p => p.color};
  --fill: ${p => p.fill};
  animation: ${barFill} 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
`;

const SignalWeight = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #333;
  letter-spacing: 0.1em;
  margin-top: 0.4rem;
  text-align: right;
`;

// ─── Benefits ─────────────────────────────────────────────────────────────────

const BenefitsSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 7rem 3rem;
  border-bottom: 1px solid #141414;

  @media (max-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const BenefitsHeader = styled.div`
  margin-bottom: 4rem;
`;

const BenefitsEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 1.25rem;
`;

const BenefitsTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.15;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid #141414;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitItem = styled.div`
  padding: 2.75rem;
  border-right: 1px solid #141414;
  border-bottom: 1px solid #141414;
  cursor: default;
  transition: background 0.2s ease;

  &:nth-child(2n) { border-right: none; }
  &:nth-last-child(-n+2) { border-bottom: none; }

  &:hover {
    background: #0d0d0d;
  }

  &:hover .benefit-accent {
    color: #4ade80;
  }

  @media (max-width: 768px) {
    border-right: none;
    &:nth-last-child(-n+2) { border-bottom: 1px solid #141414; }
    &:last-child { border-bottom: none; }
  }
`;

const BenefitAccent = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e1e1e;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
`;

const BenefitTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #e8e8e8;
  margin-bottom: 0.65rem;
  letter-spacing: -0.01em;
`;

const BenefitDesc = styled.p`
  font-size: 0.82rem;
  font-weight: 300;
  line-height: 1.85;
  color: #555;
`;

// ─── Closing ─────────────────────────────────────────────────────────────────

const ClosingSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 8rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const ClosingLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #555;
`;

const ClosingHeadline = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.12;
  max-width: 640px;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const ClosingBody = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.8;
  color: #666;
  max-width: 480px;
`;

const ClosingCTA = styled.button`
  background: transparent;
  color: #4ade80;
  border: 1px solid #4ade80;
  padding: 1rem 2.5rem;
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

const MOCK_CANDIDATES = [
  { rank: 1,  name: 'D. Mitchell',   meta: 'HVAC Service Tech · Miami, FL',    score: 91, tier: 'Green',  tColor: '#4ade80', tBg: 'rgba(74,222,128,0.06)' },
  { rank: 2,  name: 'R. Castillo',   meta: 'HVAC Installer · Hialeah, FL',     score: 78, tier: 'Yellow', tColor: '#fbbf24', tBg: 'rgba(251,191,36,0.06)'  },
  { rank: 3,  name: 'T. Okonkwo',    meta: 'HVAC Apprentice · Doral, FL',      score: 64, tier: 'Yellow', tColor: '#fbbf24', tBg: 'rgba(251,191,36,0.06)'  },
  { rank: 4,  name: 'J. Hartmann',   meta: 'HVAC Service Tech · Kendall, FL',  score: 38, tier: 'Red',    tColor: '#ef4444', tBg: 'rgba(239,68,68,0.06)'   },
];

const SIGNALS = [
  {
    name: 'Relevant Experience',
    desc: 'Years, depth, and role type — weighted against what the position actually requires',
    fill: '88%',
    color: '#4ade80',
    weight: 'Primary signal',
  },
  {
    name: 'Industry Credentials',
    desc: 'Certifications and licenses evaluated for relevance to the specific role',
    fill: '70%',
    color: '#4ade80',
    weight: 'High weight',
  },
  {
    name: 'Employment Patterns',
    desc: 'Stability, tenure, and progression — indicators of long-term retention',
    fill: '55%',
    color: '#fbbf24',
    weight: 'Moderate weight',
  },
  {
    name: 'Geographic Fit',
    desc: 'Proximity and commute feasibility relative to the job location',
    fill: '40%',
    color: '#fbbf24',
    weight: 'Contextual',
  },
  {
    name: 'Role Alignment',
    desc: 'How closely the candidate\'s background maps to the specific position requirements',
    fill: '72%',
    color: '#4ade80',
    weight: 'High weight',
  },
];

const BENEFITS = [
  {
    num: '01',
    title: 'Stop Reading Every Resume',
    desc: 'Every applicant gets scored before you see them. You open your inbox to a ranked list, not a pile.',
  },
  {
    num: '02',
    title: 'Interview the Right People First',
    desc: 'Green tier candidates are ready to talk. Start there, work down only if needed.',
  },
  {
    num: '03',
    title: 'Consistent, Bias-Free Evaluation',
    desc: 'Every candidate is measured against the same criteria for the same role. No gut-feel variation.',
  },
  {
    num: '04',
    title: 'Reduce Costly Bad Hires',
    desc: 'The patterns that predict poor retention are caught before you invest time in an interview.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const CandidateRanking: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    if (visibleRows >= MOCK_CANDIDATES.length) return;
    const t = setTimeout(() => setVisibleRows(v => v + 1), 600);
    return () => clearTimeout(t);
  }, [visibleRows]);

  return (
    <>
      <FontImport />
      <Page>

        {/* ── Hero ── */}
        <HeroSection>
          <HeroLeft>
            <HeroEyebrow>AI Candidate Ranking</HeroEyebrow>
            <HeroHeadline>
              Every applicant<br />
              ranked before you<br />
              read a single<br />
              <em>resume.</em>
            </HeroHeadline>
            <HeroBody>
              Talos scores every candidate from 0–100 and places them into
              one of three tiers. You open your pipeline to a ranked list —
              not a pile. The best people rise to the top automatically.
            </HeroBody>
            <HeroCTA onClick={() => setIsDemoModalOpen(true)}>
              See It in Action
            </HeroCTA>
          </HeroLeft>

          {/* Mock leaderboard */}
          <Leaderboard>
            <LeaderboardHeader>
              <LeaderboardHeadCell>#</LeaderboardHeadCell>
              <LeaderboardHeadCell>Candidate</LeaderboardHeadCell>
              <LeaderboardHeadCell>Score</LeaderboardHeadCell>
              <LeaderboardHeadCell>Tier</LeaderboardHeadCell>
            </LeaderboardHeader>

            {MOCK_CANDIDATES.slice(0, visibleRows).map((c, i) => (
              <CandidateRow key={i} delay={0}>
                <CandidateRank>{c.rank}</CandidateRank>
                <CandidateInfo>
                  <CandidateName>{c.name}</CandidateName>
                  <CandidateMeta>{c.meta}</CandidateMeta>
                </CandidateInfo>
                <CandidateScore color={c.tColor}>{c.score}</CandidateScore>
                <TierBadge color={c.tColor} bg={c.tBg}>{c.tier}</TierBadge>
              </CandidateRow>
            ))}

            {visibleRows < MOCK_CANDIDATES.length && (
              <CandidateRow delay={0} style={{ opacity: 0.3 }}>
                <CandidateRank>·</CandidateRank>
                <CandidateInfo>
                  <CandidateName style={{ color: '#222' }}>Analyzing...</CandidateName>
                </CandidateInfo>
                <CandidateScore color="#222">—</CandidateScore>
                <TierBadge color="#222" bg="transparent">—</TierBadge>
              </CandidateRow>
            )}

            <LeaderboardFooter>
              <FooterNote>4 applicants · HVAC Service Tech · Miami</FooterNote>
              <LiveIndicator>Live ranking</LiveIndicator>
            </LeaderboardFooter>
          </Leaderboard>
        </HeroSection>

        {/* ── Philosophy ── */}
        <PhilosophySection>
          <PhilosophyInner>
            <PhilosophyHeadline>
              The right hire is obvious —<br />
              if you have<br />
              the right data.
            </PhilosophyHeadline>
            <PhilosophyRight>
              <PhilosophyText>
                Most hiring decisions in HVAC come down to whoever called back fastest,
                whoever interviewed on a good day, or whoever the owner had a gut feeling about.
                Talos replaces gut feeling with a structured, consistent evaluation that surfaces
                the candidates most likely to succeed in each specific role.
              </PhilosophyText>
              <PhilosophyText>
                The score isn't a gimmick. It's the output of a system trained on what
                actually separates reliable long-term hires from expensive mistakes in
                trades hiring.
              </PhilosophyText>
              <PhilosophyNote>
                The exact methodology is proprietary — but the results speak for themselves in your demo.
              </PhilosophyNote>
            </PhilosophyRight>
          </PhilosophyInner>
        </PhilosophySection>

        {/* ── Tiers ── */}
        <TiersSection>
          <TiersHeader>
            <TiersEyebrow>The three tiers</TiersEyebrow>
            <TiersTitle>
              Every applicant lands in<br />
              <em>one of three places.</em>
            </TiersTitle>
          </TiersHeader>

          <TiersStack>
            <TierRow borderColor="#4ade80">
              <TierLeft>
                <TierLabel color="#4ade80">Green Tier</TierLabel>
                <TierRange>80–100</TierRange>
              </TierLeft>
              <TierMiddle>
                <TierDesc>
                  Strong match across the dimensions that matter most for this role.
                  These candidates have the experience, credentials, and profile
                  that indicate a reliable, long-term hire. Interview these first.
                </TierDesc>
              </TierMiddle>
              <TierRight>
                <TierAction>Interview immediately</TierAction>
                <TierSubaction>
                  Highest probability of a successful hire. Don't let these sit in your inbox.
                </TierSubaction>
              </TierRight>
            </TierRow>

            <TierRow borderColor="#fbbf24">
              <TierLeft>
                <TierLabel color="#fbbf24">Yellow Tier</TierLabel>
                <TierRange>50–79</TierRange>
              </TierLeft>
              <TierMiddle>
                <TierDesc>
                  Solid candidates with real potential. They may have trade-offs worth
                  discussing — slightly less experience, further distance, or a mixed work
                  history. Worth a conversation when your Green tier is exhausted.
                </TierDesc>
              </TierMiddle>
              <TierRight>
                <TierAction>Review after Green</TierAction>
                <TierSubaction>
                  Good backup candidates. Some will surprise you in an interview.
                </TierSubaction>
              </TierRight>
            </TierRow>

            <TierRow borderColor="#ef4444">
              <TierLeft>
                <TierLabel color="#ef4444">Red Tier</TierLabel>
                <TierRange>0–49</TierRange>
              </TierLeft>
              <TierMiddle>
                <TierDesc>
                  Significant gaps against the requirements for this role. Not necessarily
                  a bad person — just not the right fit right now. Save your time for
                  candidates who are genuinely ready.
                </TierDesc>
              </TierMiddle>
              <TierRight>
                <TierAction>Hold for now</TierAction>
                <TierSubaction>
                  Consider only when options are exhausted, or revisit for different roles.
                </TierSubaction>
              </TierRight>
            </TierRow>
          </TiersStack>
        </TiersSection>

        {/* ── Signals ── */}
        <SignalsSection>
          <SignalsInner>
            <SignalsLeft>
              <SignalsEyebrow>What it evaluates</SignalsEyebrow>
              <SignalsTitle>
                Multiple<br />
                signals.<br />
                One <em>clear</em><br />
                answer.
              </SignalsTitle>
              <SignalsSubtext>
                Talos evaluates each candidate across several dimensions — weighted
                differently per role and adjusted based on what you've told us matters
                most for this position. The specifics stay under the hood.
              </SignalsSubtext>
            </SignalsLeft>

            <SignalsList>
              {SIGNALS.map((s, i) => (
                <SignalItem key={i}>
                  <SignalInfo>
                    <SignalName>{s.name}</SignalName>
                    <SignalDesc>{s.desc}</SignalDesc>
                  </SignalInfo>
                  <div>
                    <SignalBar>
                      <SignalBarFill
                        className="signal-bar-fill"
                        fill={s.fill}
                        color={s.color}
                      />
                    </SignalBar>
                    <SignalWeight>{s.weight}</SignalWeight>
                  </div>
                </SignalItem>
              ))}
            </SignalsList>
          </SignalsInner>
        </SignalsSection>

        {/* ── Benefits ── */}
        <BenefitsSection>
          <BenefitsHeader>
            <BenefitsEyebrow>What this means for you</BenefitsEyebrow>
            <BenefitsTitle>
              Less time screening.<br />
              <em>Better</em> hires.
            </BenefitsTitle>
          </BenefitsHeader>

          <BenefitsGrid>
            {BENEFITS.map((b, i) => (
              <BenefitItem key={i}>
                <BenefitAccent className="benefit-accent">{b.num}</BenefitAccent>
                <BenefitTitle>{b.title}</BenefitTitle>
                <BenefitDesc>{b.desc}</BenefitDesc>
              </BenefitItem>
            ))}
          </BenefitsGrid>
        </BenefitsSection>

        {/* ── Closing ── */}
        <ClosingSection>
          <ClosingLabel>Ready to see it live</ClosingLabel>
          <ClosingHeadline>
            See your next hire<br />
            <em>ranked</em> before the<br />
            interview.
          </ClosingHeadline>
          <ClosingBody>
            Book a demo and submit a real resume from one of your open roles.
            Watch Talos score it, place it in a tier, and explain the ranking —
            live, in 20 minutes.
          </ClosingBody>
          <ClosingCTA onClick={() => setIsDemoModalOpen(true)}>
            See Candidate Ranking Live
          </ClosingCTA>
        </ClosingSection>

      </Page>
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default CandidateRanking;
