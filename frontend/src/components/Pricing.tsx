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
  font-size: clamp(2.75rem, 6.5vw, 5rem);
  font-weight: 400;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 1.75rem;

  em { font-style: italic; color: #4ade80; }
`;

const HeroSub = styled.p`
  font-size: 1.1rem;
  font-weight: 300;
  color: #8a9ab0;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.7;
`;

const MidRule = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 5rem;

  &::before, &::after { content: ''; flex: 1; height: 1px; background: #232830; }
`;

const MidRuleOrb = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
`;

// ─── cost sections ────────────────────────────────────────────────────────────

const CostSection = styled.div<{ delay: number }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding: 4rem 0;
  border-bottom: 1px solid #1a1e2a;
  animation: ${fadeUp} 0.7s ease ${p => p.delay}s both;

  &:last-of-type { border-bottom: none; }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const CostLeft = styled.div``;

const CostEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 1px;
    background: #4ade80;
  }
`;

const CostHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
`;

const CostFigure = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  background: rgba(74,222,128,0.06);
  border: 1px solid rgba(74,222,128,0.15);
  padding: 0.6rem 1.1rem;
  margin-bottom: 1.25rem;
`;

const CostAmount = styled.span`
  font-family: 'DM Serif Display', serif;
  font-size: 1.6rem;
  color: #4ade80;
  line-height: 1;
`;

const CostLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

const CostBody = styled.p`
  font-size: 0.92rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.8;
`;

const CostRight = styled.div`
  padding-top: 0.5rem;
`;

const CostRightLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 1rem;
`;

const CostBullets = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CostBullet = styled.li`
  font-size: 0.875rem;
  font-weight: 300;
  color: #c8d0dc;
  line-height: 1.6;
  padding-left: 1.25rem;
  position: relative;

  &::before {
    content: '—';
    position: absolute;
    left: 0;
    color: #4ade80;
    font-size: 0.75rem;
  }
`;

const TalosHandles = styled.div`
  background: rgba(74,222,128,0.04);
  border: 1px solid rgba(74,222,128,0.12);
  padding: 1.25rem 1.5rem;
`;

const TalosHandlesLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 0.6rem;
`;

const TalosHandlesText = styled.p`
  font-size: 0.85rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.7;
  margin: 0;
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
  animation: ${fadeUp} 0.7s ease 0.6s both;

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
  animation: ${fadeUp} 0.7s ease 0.65s both;

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

const COST_ITEMS = [
  {
    eyebrow: 'Job Descriptions',
    headline: 'Writing a compelling job description that attracts the right tech',
    figure: '$150 – $400',
    figureLabel: 'per posting',
    body: 'A generic job description attracts generic applicants. Writing one that speaks to a real HVAC technician — right certifications, honest pay, clear expectations — takes several hours of focused work, or a copywriter who understands the trade.',
    bullets: [
      '2–4 hours to write from scratch, often based on an outdated template',
      'Freelance copywriter with trade knowledge: $150–$400 per posting',
      'Poorly written descriptions attract underqualified applicants, wasting screening time downstream',
      'Most owners copy-paste old postings and wonder why the same type of candidate keeps showing up',
    ],
    talosHandles: 'Talos generates a complete, HVAC-specific job description from your details — role, pay, schedule, certifications required — in the time it takes to fill out a form.',
  },
  {
    eyebrow: 'Job Board Posting',
    headline: 'Getting your posting in front of HVAC candidates who are actually looking',
    figure: '$300 – $1,500+',
    figureLabel: 'per month, per job',
    body: 'Indeed\'s free listings get buried fast. Sponsored posts on Indeed charge per click — and in competitive HVAC markets, those clicks add up quickly. That\'s before accounting for the time to log in, reformat for each platform, and refresh listings every 30 days.',
    bullets: [
      'Indeed sponsored posts: $5–$15 per click in most HVAC markets',
      'To generate 50 qualified applicants at a 5% apply rate: 1,000 clicks = $5,000–$15,000',
      '30–60 minutes per posting per platform, multiplied by however many boards you use',
      'Job listings expire and need manual renewal — easy to miss when you\'re running calls',
    ],
    talosHandles: 'Talos handles the posting so you fill out your details once and your listing goes live — no logins to juggle, no reformatting, no copy-pasting across platforms.',
  },
  {
    eyebrow: 'Resume Screening',
    headline: 'Going through 200 applications to find the 5 worth calling',
    figure: '25 – 40 hours',
    figureLabel: 'per open position',
    body: 'A single HVAC service tech posting on Indeed routinely generates 150–400 applications. Most are unqualified. Screening them manually — reading each resume, checking certifications, filtering by experience — is one of the most time-consuming parts of hiring, and it happens before you\'ve even made a single call.',
    bullets: [
      'Industry average: 200–400 applicants per skilled trade posting',
      'Thorough resume review: 5–10 minutes each = 20–40 hours of screening time',
      'Phone screens for shortlisted candidates: another 8–12 hours',
      'Candidates with different job titles for the same role often get filtered out unfairly',
    ],
    talosHandles: 'Every applicant is scored against a formula built for HVAC the moment they apply. You open your pipeline to a ranked list — not a pile. The strongest candidates are already at the top.',
  },
  {
    eyebrow: 'The Cost of a Bad Hire',
    headline: 'What happens when gut feeling picks the wrong technician',
    figure: '$15,000 – $35,000',
    figureLabel: 'cost of one bad hire',
    body: 'Most HVAC companies hire on gut feeling, availability, or whoever called back first. When it doesn\'t work out — and HVAC industry turnover runs 35–40% annually — the cost goes far beyond the next job posting. It includes training time, lost productivity, customer callbacks, and the full cycle starting over.',
    bullets: [
      'SHRM estimates bad hires cost 50–200% of the position\'s annual salary',
      'For a $60,000 technician: $30,000–$120,000 in total replacement cost',
      'Lost customers from poor service quality during the gap period',
      'Training investment written off when the hire doesn\'t stick',
    ],
    talosHandles: 'Talos scores every candidate across multiple dimensions — not just experience, but the full picture of who someone is as a hire. Consistent evaluation catches what gut feeling misses.',
  },
  {
    eyebrow: 'Staffing & Placement Agencies',
    headline: 'What you\'re paying when someone else finds your technician',
    figure: '$8,000 – $15,000',
    figureLabel: 'per placement',
    body: 'Staffing agencies are the default solution for HVAC companies that don\'t have a hiring process. They work — but at 15–25% of the hired candidate\'s first-year salary, a single placement for a senior tech easily runs five figures. Companies that hire multiple technicians per year are paying agency fees that compound into tens of thousands annually.',
    bullets: [
      'Standard placement fee: 15–25% of first-year salary',
      'Senior HVAC technician at $65,000: $9,750–$16,250 per hire',
      'Three hires per year: $29,250–$48,750 in placement fees alone',
      'You also lose control over candidate quality — the agency decides who you meet',
    ],
    talosHandles: 'Talos charges a flat platform fee — no placement fees, no per-hire charges, no percentage of salary. Ever. The more you hire, the more you save compared to agency costs.',
  },
  {
    eyebrow: 'Candidate Outreach & Scheduling',
    headline: 'The back-and-forth that happens before a single interview gets booked',
    figure: '3 – 6 hours',
    figureLabel: 'per open position',
    body: 'Once you\'ve found candidates worth talking to, getting them on the phone is its own job. Industry data shows it takes an average of six touchpoints to successfully schedule an interview with a passive candidate. Multiply that across a shortlist of ten people and you\'ve spent a half-day on logistics alone.',
    bullets: [
      'Average touchpoints to schedule one interview: 4–8 calls, texts, or emails',
      'Writing personalized outreach for each candidate: 15–20 minutes each',
      'Candidates go cold while you\'re playing phone tag — top techs have options',
      'Rejection communications skipped entirely, damaging your employer brand',
    ],
    talosHandles: 'Talos generates personalized outreach messages for every stage of your pipeline — interview invitations, follow-ups, and professional rejections — tailored to each candidate and your role.',
  },
];

// ─── component ────────────────────────────────────────────────────────────────

const Pricing: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <FontImport />
      <Page>
        <Wrapper>

          {/* ── Top rule ── */}
          <TopRule>
            <TopLabel>Talos &mdash; Pricing</TopLabel>
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
              Most HVAC companies don't have a hiring budget — they just have a hiring problem. Here's a breakdown of what that problem is actually costing you, line by line.
            </HeroSub>
            <MidRule>
              <MidRuleOrb />
            </MidRule>
          </HeroSection>

          {/* ── Cost sections ── */}
          {COST_ITEMS.map((item, i) => (
            <CostSection key={i} delay={0.3 + i * 0.05}>
              <CostLeft>
                <CostEyebrow>{item.eyebrow}</CostEyebrow>
                <CostHeadline>{item.headline}</CostHeadline>
                <CostFigure>
                  <CostAmount>{item.figure}</CostAmount>
                  <CostLabel>{item.figureLabel}</CostLabel>
                </CostFigure>
                <CostBody>{item.body}</CostBody>
              </CostLeft>

              <CostRight>
                <CostRightLabel>What it actually involves</CostRightLabel>
                <CostBullets>
                  {item.bullets.map((b, j) => (
                    <CostBullet key={j}>{b}</CostBullet>
                  ))}
                </CostBullets>
                <TalosHandles>
                  <TalosHandlesLabel>What Talos handles</TalosHandlesLabel>
                  <TalosHandlesText>{item.talosHandles}</TalosHandlesText>
                </TalosHandles>
              </CostRight>
            </CostSection>
          ))}

          {/* ── Total ── */}
          <TotalBar>
            <TotalLeft>
              <TotalEyebrow>Adding it up</TotalEyebrow>
              <TotalHeadline>
                The true cost of hiring one HVAC technician without a system
              </TotalHeadline>
              <TotalBody>
                Between job board spend, screening time, outreach, and the risk of a bad hire or agency placement — hiring a single technician the old way routinely costs $15,000–$50,000 in direct and indirect expenses. And that resets every time someone leaves.
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
