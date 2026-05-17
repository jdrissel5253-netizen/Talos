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

  @media (max-width: 768px) {
    display: none;
  }
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

  @media (max-width: 768px) {
    display: none;
  }
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
  animation: ${fadeUp} 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const HeroDesc = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #777;
  max-width: 480px;
`;

const HeroMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1.25rem;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const MetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  font-weight: 400;
  color: #444;
  letter-spacing: 0.05em;

  &::before {
    content: '';
    display: block;
    width: 20px;
    height: 1px;
    background: #333;
  }
`;

const HeroCTA = styled.button`
  align-self: flex-end;
  background: #4ade80;
  color: #000;
  border: none;
  padding: 0.9rem 2rem;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #6ee89a;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    align-self: flex-start;
  }
`;

// ─── Philosophy Strip ─────────────────────────────────────────────────────────

const PhilosophyStrip = styled.section`
  background: #0d0d0d;
  border-bottom: 1px solid #1a1a1a;
  padding: 5rem 3rem;

  @media (max-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const PhilosophyInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 5rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PhilosophyLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #444;
  padding-top: 0.5rem;
  line-height: 1.8;
`;

const PhilosophyQuote = styled.blockquote`
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-style: italic;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;

  span {
    color: #4ade80;
  }
`;

// ─── Comparison Table ─────────────────────────────────────────────────────────

const ComparisonSection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 7rem 3rem;
  border-bottom: 1px solid #1a1a1a;

  @media (max-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const ComparisonHeader = styled.div`
  margin-bottom: 3.5rem;
`;

const ComparisonEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 1.25rem;
`;

const ComparisonTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const Table = styled.div`
  width: 100%;
  border: 1px solid #1a1a1a;
`;

const TableHead = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  background: #0d0d0d;
  border-bottom: 1px solid #1a1a1a;

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TableHeadCell = styled.div<{ accent?: boolean; hide?: boolean }>`
  padding: 1.1rem 1.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${p => p.accent ? '#4ade80' : '#444'};
  border-right: 1px solid #1a1a1a;

  &:last-child { border-right: none; }

  @media (max-width: 600px) {
    display: ${p => p.hide ? 'none' : 'block'};
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  border-bottom: 1px solid #111;
  transition: background 0.15s ease;

  &:last-child { border-bottom: none; }
  &:hover { background: #0d0d0d; }

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TableCell = styled.div<{ dim?: boolean; bright?: boolean; hide?: boolean }>`
  padding: 1.4rem 1.5rem;
  font-size: 0.875rem;
  font-weight: ${p => p.bright ? '500' : '300'};
  color: ${p => p.bright ? '#e8e8e8' : p.dim ? '#3a3a3a' : '#777'};
  line-height: 1.5;
  border-right: 1px solid #111;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &:last-child { border-right: none; }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${p => p.bright ? '#4ade80' : '#2a2a2a'};
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    display: ${p => p.hide ? 'none' : 'flex'};
  }
`;

const CategoryCell = styled(TableCell)`
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #555;
`;

// ─── AI Deep Dive ─────────────────────────────────────────────────────────────

const AISection = styled.section`
  max-width: 1320px;
  margin: 0 auto;
  padding: 7rem 3rem;
  border-bottom: 1px solid #1a1a1a;

  @media (max-width: 768px) {
    padding: 5rem 2rem;
  }
`;

const AIHeader = styled.div`
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
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;

  em {
    font-style: italic;
    color: #4ade80;
  }
`;

const AISubtext = styled.p`
  font-size: 0.9rem;
  font-weight: 300;
  line-height: 1.85;
  color: #666;
  padding-top: 0.5rem;
`;

const AIList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const AIItem = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 2rem;
  padding: 2.5rem 0;
  border-bottom: 1px solid #131313;
  align-items: start;
  cursor: default;

  &:first-child { border-top: 1px solid #131313; }

  &:hover .ai-num {
    color: #4ade80;
  }
`;

const AINum = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: #222;
  padding-top: 3px;
  transition: color 0.2s ease;
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
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #e8e8e8;
  letter-spacing: -0.01em;
  line-height: 1.4;
`;

const AIItemDesc = styled.p`
  font-size: 0.85rem;
  font-weight: 300;
  line-height: 1.85;
  color: #666;
`;

// ─── Full-Bleed CTA ───────────────────────────────────────────────────────────

const ClosingSection = styled.section`
  padding: 8rem 3rem;
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 5rem 2rem;
    gap: 3rem;
  }
`;

const ClosingLeft = styled.div``;

const ClosingEyebrow = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 1.5rem;
`;

const ClosingHeadline = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.12;
`;

const ClosingRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const ClosingBody = styled.p`
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.85;
  color: #777;
`;

const ClosingCTARow = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const ClosingCTA = styled.button`
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

const ClosingNote = styled.span`
  font-size: 0.8rem;
  font-weight: 300;
  color: #444;
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
    talos: 'AI-scored 0–100 in seconds, every applicant',
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
    talos: 'Flat platform fee. No placement fees. Ever.',
  },
];

const AI_ITEMS = [
  {
    num: '01',
    title: 'Eleven Role-Specific Scoring Frameworks',
    desc: 'From HVAC Installer to Dispatcher to Bookkeeper — each role has its own AI scoring model built on the skills, certifications, and experience patterns that actually predict success in that position.',
  },
  {
    num: '02',
    title: 'Equivalent Title Recognition',
    desc: 'A "Service Coordinator" with scheduling duties gets evaluated the same as a "Dispatcher." Talos reads the bullets on a resume, not just the job title — so good candidates don\'t get filtered out on a technicality.',
  },
  {
    num: '03',
    title: 'Multi-Factor Candidate Scoring',
    desc: 'Every resume is evaluated across six dimensions: years of experience, resume quality, certifications, work gaps, job stability, and proximity to the job site. The result is a single honest score.',
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

        {/* ── Hero ── */}
        <HeroWrap>
          <BackgroundWord>Different.</BackgroundWord>

          <HeroTop>
            <SideLabel>Why Talos is different</SideLabel>
            <HeroContent>
              <HeroHeadline>
                Finally, a hiring tool<br />
                that actually <em>knows</em><br />
                your trade.
              </HeroHeadline>
            </HeroContent>
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

        {/* ── Philosophy ── */}
        <PhilosophyStrip>
          <PhilosophyInner>
            <PhilosophyLabel>
              Our philosophy<br />on recruiting
            </PhilosophyLabel>
            <PhilosophyQuote>
              "The method is simple: use AI trained specifically for HVAC.
              Write job descriptions that attract the right kind of techs.
              Rate candidates against <span>benchmarks built on the best workers
              in each role.</span> Talos is the first true AI recruiting expert in HVAC."
            </PhilosophyQuote>
          </PhilosophyInner>
        </PhilosophyStrip>

        {/* ── Comparison Table ── */}
        <ComparisonSection>
          <ComparisonHeader>
            <ComparisonEyebrow>Side by side</ComparisonEyebrow>
            <ComparisonTitle>
              Generic platforms<br />
              vs. <em>Talos.</em>
            </ComparisonTitle>
          </ComparisonHeader>

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
          <AIHeader>
            <AITitle>
              What makes the<br />
              AI <em>actually</em><br />
              different.
            </AITitle>
            <AISubtext>
              Most "AI recruiting" tools run the same large language model
              with a generic prompt. Talos built scoring frameworks from the
              ground up for each HVAC role — which changes everything about
              the quality of results you get.
            </AISubtext>
          </AIHeader>

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
          <ClosingLeft>
            <ClosingEyebrow>Ready to see it live</ClosingEyebrow>
            <ClosingHeadline>
              See exactly how<br />
              Talos would work<br />
              for your company.
            </ClosingHeadline>
          </ClosingLeft>
          <ClosingRight>
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
          </ClosingRight>
        </ClosingSection>

      </Page>
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default WhyTalosDifferent;
