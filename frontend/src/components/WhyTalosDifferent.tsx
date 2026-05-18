import React, { useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
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

const HeroWrap = styled.section`
  position: relative;
  padding: 7rem 0 6rem;
  border-bottom: 1px solid #232830;
  overflow: hidden;
  animation: ${fadeUp} 0.7s ease 0.1s both;
`;

const GhostWord = styled.div`
  position: absolute;
  right: -1rem;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'DM Serif Display', serif;
  font-size: clamp(8rem, 16vw, 18rem);
  font-style: italic;
  font-weight: 400;
  color: transparent;
  -webkit-text-stroke: 1px #1e2330;
  user-select: none;
  pointer-events: none;
  line-height: 1;
  white-space: nowrap;
  animation: ${fadeIn} 1.4s ease both;

  @media (max-width: 768px) { display: none; }
`;

const HeroTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const SideLabel = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 0.62rem;
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

const HeroHeadline = styled.h1`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3rem, 6vw, 6rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: #ffffff;

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
    gap: 2.5rem;
  }
`;

const HeroDesc = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
  max-width: 480px;
`;

const HeroMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;

  @media (max-width: 768px) { align-items: flex-start; }
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  font-weight: 400;
  color: #6e7d8e;
  letter-spacing: 0.04em;

  &::before {
    content: '';
    display: block;
    width: 20px;
    height: 1px;
    background: #232830;
  }
`;

const HeroCTA = styled.button`
  margin-top: 0.5rem;
  background: #4ade80;
  color: #0a0f0a;
  border: none;
  padding: 0.9rem 2rem;
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

// ─── Philosophy Strip ─────────────────────────────────────────────────────────

const PhilosophyStrip = styled.section`
  position: relative;
  z-index: 1;
  background: #0d1014;
  border-bottom: 1px solid #232830;
  padding: 5rem 2.5rem;
`;

const PhilosophyInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 5rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PhilosophyLabel = styled.div`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6e7d8e;
  padding-top: 0.5rem;
  line-height: 2;
`;

const PhilosophyQuote = styled.blockquote`
  margin: 0;
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-style: italic;
  font-weight: 400;
  color: #ffffff;
  line-height: 1.35;

  span { color: #4ade80; }
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

const SectionCount = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
  white-space: nowrap;
`;

// ─── Comparison Table ─────────────────────────────────────────────────────────

const ComparisonSection = styled.section`
  position: relative;
  z-index: 1;
  padding: 7rem 0;
  border-bottom: 1px solid #232830;
`;

const ComparisonEyebrow = styled.div`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-bottom: 0.75rem;
`;

const ComparisonTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 3.5rem;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const Table = styled.div`
  width: 100%;
  border: 1px solid #232830;
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  background: #1a1f2a;
  border-bottom: 1px solid #232830;

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TableHeadCell = styled.div<{ accent?: boolean; hide?: boolean }>`
  padding: 1rem 1.5rem;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${p => p.accent ? '#4ade80' : '#6e7d8e'};
  border-right: 1px solid #232830;

  &:last-child { border-right: none; }

  @media (max-width: 600px) {
    display: ${p => p.hide ? 'none' : 'block'};
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  border-bottom: 1px solid #1a1f2a;
  transition: background 0.15s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: #1a1f2a; }

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TableCell = styled.div<{ dim?: boolean; bright?: boolean; hide?: boolean }>`
  padding: 1.4rem 1.5rem;
  font-size: 0.875rem;
  font-weight: ${p => p.bright ? '400' : '300'};
  color: ${p => p.bright ? '#e8eaf0' : p.dim ? '#2e3540' : '#6e7d8e'};
  line-height: 1.5;
  border-right: 1px solid #1a1f2a;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &:last-child { border-right: none; }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${p => p.bright ? '#4ade80' : '#232830'};
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    display: ${p => p.hide ? 'none' : 'flex'};
  }
`;

const CategoryCell = styled(TableCell)`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

// ─── AI Deep Dive ─────────────────────────────────────────────────────────────

const AISection = styled.section`
  position: relative;
  z-index: 1;
  padding: 7rem 0;
  border-bottom: 1px solid #232830;
`;

const AIGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  margin-bottom: 5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const AITitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.02em;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const AISubtext = styled.p`
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
  padding-top: 0.5rem;
`;

const AIList = styled.div`
  display: flex;
  flex-direction: column;
`;

const AIItem = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 2rem;
  padding: 2.5rem 0;
  border-bottom: 1px solid #1a1f2a;
  align-items: start;
  transition: background 0.15s ease;
  cursor: default;

  &:first-child { border-top: 1px solid #1a1f2a; }

  &:hover .ai-num { color: #4ade80; }
`;

const AINum = styled.span`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1.5rem;
  color: rgba(74,222,128,0.2);
  padding-top: 2px;
  transition: color 0.2s ease;
  line-height: 1;
`;

const AIContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 2.5rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const AIItemTitle = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.15rem;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.01em;
  line-height: 1.35;
`;

const AIItemDesc = styled.p`
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
`;

// ─── Closing CTA ─────────────────────────────────────────────────────────────

const ClosingSection = styled.section`
  position: relative;
  z-index: 1;
  padding: 8rem 0;
`;

const ClosingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ClosingEyebrow = styled.div`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 1.5rem;
`;

const ClosingHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.12;
  letter-spacing: -0.02em;
`;

const ClosingBody = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #8a9ab0;
  margin-bottom: 2rem;
`;

const ClosingCTARow = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const ClosingCTA = styled.button`
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

const ClosingNote = styled.span`
  font-size: 0.8rem;
  font-weight: 300;
  color: #6e7d8e;
  letter-spacing: 0.03em;
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPARISON_ROWS = [
  {
    category: 'Job Descriptions',
    generic: 'Copy-paste templates, generic language',
    talos: 'AI-written, HVAC-optimized, role-specific',
  },
  {
    category: 'Resume Screening',
    generic: 'Manual review, hours per posting',
    talos: 'Every applicant scored 0–100 against criteria built for your trade',
  },
  {
    category: 'Candidate Ranking',
    generic: 'Gut feeling, seniority bias',
    talos: '11 role-specific frameworks with industry benchmarks',
  },
  {
    category: 'Certifications',
    generic: 'Checked manually if at all',
    talos: 'Automatically detected and weighted per role',
  },
  {
    category: 'Distance & Location',
    generic: 'Not factored in',
    talos: 'Scored against job location, commute risk weighted',
  },
  {
    category: 'Time to Interview',
    generic: '2–4 weeks of sourcing',
    talos: '3 clicks from job post to qualified candidate',
  },
  {
    category: 'Cost',
    generic: '$10–20K+ per agency hire',
    talos: 'No placement fees. Ever.',
  },
];

const AI_ITEMS = [
  {
    num: '01',
    title: 'Eleven Role-Specific Scoring Frameworks',
    desc: 'From HVAC Installer to Dispatcher to Bookkeeper — each role has its own scoring formula built on the skills, certifications, and experience patterns that actually predict success in that position.',
  },
  {
    num: '02',
    title: 'Equivalent Title Recognition',
    desc: "Job titles vary by company — what matters is what someone actually did. Talos reads the work, not just the title, so strong candidates don't get missed on a technicality.",
  },
  {
    num: '03',
    title: 'Multi-Factor Candidate Scoring',
    desc: 'Every resume is evaluated across multiple dimensions — not just experience, but the full picture of who someone is as a hire. The result is a single honest score.',
  },
  {
    num: '04',
    title: 'AI Job Description Generation',
    desc: 'Talos generates job descriptions that attract the right candidates from the start. Written to rank for the searches real technicians make, with language that filters out poor fits before they apply.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const WhyTalosDifferent: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <FontImport />
      <Page>

        <Wrapper>
          {/* ── Hero ── */}
          <HeroWrap>
            <GhostWord>Different.</GhostWord>

            <HeroTop>
              <SideLabel>Why Talos is different</SideLabel>
              <HeroHeadline>
                Finally, a hiring tool<br />
                that actually <em>knows</em><br />
                your trade.
              </HeroHeadline>
            </HeroTop>

            <HeroBottom>
              <HeroDesc>
                Generic recruiting platforms treat HVAC like any other industry.
                Talos was built from scratch on the assumption that hiring a
                residential service tech and hiring a commercial installer are
                fundamentally different problems — and they deserve fundamentally
                different tools.
              </HeroDesc>
              <HeroMeta>
                <MetaLine>Built exclusively for HVAC</MetaLine>
                <MetaLine>11 role-specific scoring frameworks</MetaLine>
                <MetaLine>No staffing agency fees</MetaLine>
                <HeroCTA onClick={() => setIsDemoModalOpen(true)}>
                  See the Difference
                </HeroCTA>
              </HeroMeta>
            </HeroBottom>
          </HeroWrap>
        </Wrapper>

        {/* ── Philosophy Strip ── */}
        <PhilosophyStrip>
          <PhilosophyInner>
            <PhilosophyLabel>
              Our philosophy<br />on recruiting
            </PhilosophyLabel>
            <PhilosophyQuote>
              "Not all tools were built for this industry — and it shows. Talos is the first true AI recruiting expert in HVAC."
            </PhilosophyQuote>
          </PhilosophyInner>
        </PhilosophyStrip>

        <Wrapper>
          {/* ── Comparison Table ── */}
          <ComparisonSection>
            <ComparisonEyebrow>Side by side</ComparisonEyebrow>
            <ComparisonTitle>
              Generic platforms<br />
              vs. <em>Talos.</em>
            </ComparisonTitle>

            <Table>
              <TableHead>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell hide>Generic Platforms</TableHeadCell>
                <TableHeadCell accent>Talos</TableHeadCell>
              </TableHead>
              {COMPARISON_ROWS.map((row, i) => (
                <TableRow key={i}>
                  <CategoryCell>{row.category}</CategoryCell>
                  <TableCell dim hide>{row.generic}</TableCell>
                  <TableCell bright>
                    <span className="dot" />
                    {row.talos}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </ComparisonSection>

          {/* ── AI Deep Dive ── */}
          <AISection>
            <AIGrid>
              <AITitle>
                What makes<br />
                Talos <em>actually</em><br />
                different.
              </AITitle>
              <AISubtext>
                Generic tools apply the same checklist to every industry.
                Talos uses a scoring formula built from the ground up for HVAC —
                factoring in role-specific certifications, experience type, and
                the skills that actually matter on the job.
              </AISubtext>
            </AIGrid>

            <SectionHeader>
              <SectionTitle>Under the hood</SectionTitle>
              <SectionRule />
              <SectionCount>{AI_ITEMS.length} capabilities</SectionCount>
            </SectionHeader>

            <AIList>
              {AI_ITEMS.map((item, i) => (
                <AIItem key={i}>
                  <AINum className="ai-num">{item.num}</AINum>
                  <AIContent>
                    <AIItemTitle>{item.title}</AIItemTitle>
                    <AIItemDesc>{item.desc}</AIItemDesc>
                  </AIContent>
                </AIItem>
              ))}
            </AIList>
          </AISection>

          {/* ── Closing ── */}
          <ClosingSection>
            <ClosingGrid>
              <div>
                <ClosingEyebrow>Ready to see it live</ClosingEyebrow>
                <ClosingHeadline>
                  See exactly how<br />
                  Talos would work<br />
                  for your company.
                </ClosingHeadline>
              </div>
              <div>
                <ClosingBody>
                  A live walkthrough takes 20 minutes. You'll see the AI score
                  a real resume, generate a job description for one of your open
                  roles, and get a full picture of what your pipeline would look
                  like inside Talos — with no commitment required.
                </ClosingBody>
                <ClosingCTARow>
                  <ClosingCTA onClick={() => setIsDemoModalOpen(true)}>
                    Book a Demo
                  </ClosingCTA>
                  <ClosingNote>No commitment. 20 minutes.</ClosingNote>
                </ClosingCTARow>
              </div>
            </ClosingGrid>
          </ClosingSection>
        </Wrapper>

      </Page>
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default WhyTalosDifferent;
