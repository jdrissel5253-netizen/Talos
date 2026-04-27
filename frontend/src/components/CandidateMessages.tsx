import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { Calendar, Phone, CheckSquare, X } from 'lucide-react';
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

const slideRight = keyframes`
  from { width: 0; }
  to   { width: 100%; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
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

  @media (max-width: 768px) {
    padding: 0 1.25rem;
  }
`;

// ─── header rule ──────────────────────────────────────────────────────────────

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
  letter-spacing: 0.01em;
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

// ─── preview card ─────────────────────────────────────────────────────────────

const PreviewWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 6rem;
  align-items: center;
  animation: ${fadeUp} 0.7s ease 0.25s both;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewLeft = styled.div``;

const PreviewTag = styled.div`
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
  margin-bottom: 1.5rem;
`;

const PreviewHeading = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: 2.4rem;
  font-weight: 400;
  line-height: 1.2;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;

  em { font-style: italic; color: #4ade80; }
`;

const PreviewBody = styled.p`
  font-size: 0.95rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.75;
  margin-bottom: 1.5rem;
`;

const StatRow = styled.div`
  display: flex;
  gap: 2.5rem;
  margin-top: 1.5rem;
`;

const Stat = styled.div``;

const StatNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.2rem;

  span { color: #4ade80; }
`;

const StatDesc = styled.div`
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

const LetterCard = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  box-shadow:
    0 2px 0 #1a1f2a,
    0 12px 40px rgba(0,0,0,0.4),
    0 2px 8px rgba(0,0,0,0.2);
  padding: 2rem 2rem 1.5rem;
  position: relative;
  animation: ${float} 6s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4ade80, #6ee89a, #4ade80);
  }
`;

const LetterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #232830;
`;

const LetterFrom = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

const LetterBadge = styled.div`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4ade80;
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.2);
  padding: 0.2rem 0.6rem;
`;

const LetterBody = styled.div`
  font-size: 0.88rem;
  line-height: 1.75;
  color: #c8d0dc;
  min-height: 120px;
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #4ade80;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: ${blink} 1s step-end infinite;
`;

const LetterSig = styled.div`
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #232830;
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1.1rem;
  color: #8a9ab0;
`;

// ─── message types ────────────────────────────────────────────────────────────

const TypesSection = styled.div`
  margin-bottom: 6rem;
`;

const TypesHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 3rem;
  animation: ${fadeUp} 0.7s ease 0.35s both;
`;

const TypesTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.02em;
`;

const TypesRule = styled.div`
  flex: 1;
  height: 1px;
  background: #232830;
`;

const TypesCount = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
  white-space: nowrap;
`;

const TypesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #232830;
  border: 1px solid #232830;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const TypeCard = styled.div<{ delay: number }>`
  background: #111318;
  padding: 2.5rem;
  position: relative;
  transition: background 0.2s ease;
  animation: ${fadeUp} 0.6s ease ${p => p.delay}s both;

  &:hover {
    background: #1a1f2a;
  }
`;

const TypeNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 3.5rem;
  color: rgba(74,222,128,0.12);
  line-height: 1;
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  pointer-events: none;
`;

const TypeIcon = styled.div`
  width: 42px;
  height: 42px;
  border: 1.5px solid rgba(74,222,128,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: #4ade80;
`;

const TypeName = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
`;

const TypeDesc = styled.p`
  font-size: 0.875rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.75;
  margin-bottom: 1.25rem;
`;

const TypeList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

const TypeListItem = styled.li`
  font-size: 0.8rem;
  color: #8a9ab0;
  padding-left: 1.1rem;
  position: relative;
  line-height: 1.5;

  &::before {
    content: '—';
    position: absolute;
    left: 0;
    color: #4ade80;
    font-size: 0.7rem;
  }
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
  max-width: 720px;
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
  position: relative;
  overflow: hidden;
  transition: background 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 2px;
    background: #4ade80;
    width: 0;
    transition: width 0.3s ease;
  }

  &:hover {
    background: #6ee89a;

    &::after {
      width: 100%;
    }
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateX(4px);
  }
`;

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── typewriter hook ──────────────────────────────────────────────────────────

const MESSAGES = [
  `Hi Marcus,\n\nFollowing your application for the HVAC Service Technician role, we'd love to schedule a quick 20-minute phone screen.\n\nAre you available this week? We're flexible on timing and can work around your schedule.`,
  `Dear Jordan,\n\nThank you for your interest in the Commercial HVAC Installer position. After reviewing your EPA 608 certification and 6 years of experience, we'd like to invite you for an interview.\n\nWould Thursday at 10am work for you?`,
  `Hi Reyna,\n\nWe wanted to follow up on your recent interview for the PM Technician role. The team was genuinely impressed — particularly with your background in preventative maintenance programs.\n\nWe're finalizing our decision this week.`,
];

function useTypewriter(messages: string[], speed = 28) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const full = messages[msgIdx];
    if (typing) {
      if (displayed.length < full.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(full.slice(0, displayed.length + 1));
        }, speed);
      } else {
        timeoutRef.current = setTimeout(() => setTyping(false), 2400);
      }
    } else {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(d => d.slice(0, -1));
        }, 10);
      } else {
        setMsgIdx(i => (i + 1) % messages.length);
        setTyping(true);
      }
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [displayed, typing, msgIdx, messages, speed]);

  return displayed;
}

// ─── message types data ───────────────────────────────────────────────────────

const MESSAGE_TYPES = [
  {
    icon: <Calendar size={18} />,
    name: 'Interview Invitations',
    desc: 'Personalized invitations that balance professionalism with warmth, automatically surfacing the candidate qualifications most relevant to the role.',
    bullets: [
      'Personalized opening based on candidate background',
      'Strategic timing suggestions for higher acceptance',
      'Optimized call-to-action for quick confirmations',
      'Tone that reflects your company culture',
    ],
    num: '01',
    delay: 0.45,
  },
  {
    icon: <Phone size={18} />,
    name: 'Phone Screen Requests',
    desc: "Concise, engaging outreach that respects candidates' time while generating genuine curiosity about the opportunity.",
    bullets: [
      'Brief format optimized for busy professionals',
      'Highlight key opportunity factors per candidate',
      'Flexible scheduling language to maximize response',
      'Clear expectations for call duration and format',
    ],
    num: '02',
    delay: 0.5,
  },
  {
    icon: <CheckSquare size={18} />,
    name: 'Follow-Up Communications',
    desc: 'Thoughtfully timed messages that reference specific conversation points, demonstrating genuine interest and keeping top candidates engaged.',
    bullets: [
      'Personalized callbacks to interview discussions',
      'Timeline updates that manage expectations',
      'Enthusiasm signals to prevent candidate drop-off',
      'Stage-appropriate tone and detail level',
    ],
    num: '03',
    delay: 0.55,
  },
  {
    icon: <X size={18} />,
    name: 'Professional Rejections',
    desc: 'Tactful messages that preserve your employer brand and leave the door open for future opportunities — protecting your reputation in the talent market.',
    bullets: [
      'Respectful language that maintains candidate dignity',
      'Appreciation for time invested in the process',
      'Future opportunity language for qualified candidates',
      'Tone calibrated to stage and candidate quality',
    ],
    num: '04',
    delay: 0.6,
  },
];

// ─── component ────────────────────────────────────────────────────────────────

const CandidateMessages: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const text = useTypewriter(MESSAGES);

  const formatted = text.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <>
      <FontImport />
      <Page>
        <Wrapper>

          {/* ── Top rule ── */}
          <TopRule>
            <TopLabel>Talos &mdash; Candidate Messaging</TopLabel>
            <TopMeta>AI-Drafted &bull; Personalized &bull; Instant</TopMeta>
          </TopRule>

          {/* ── Hero ── */}
          <HeroSection>
            <HeroKicker>The right words, every time</HeroKicker>
            <HeroTitle>
              Messages that <em>move</em><br />candidates forward
            </HeroTitle>
            <HeroSub>
              AI-drafted outreach for every stage of the hiring process — personalized to each candidate, refined for your industry.
            </HeroSub>
            <MidRule>
              <MidRuleOrb />
            </MidRule>
          </HeroSection>

          {/* ── Live preview ── */}
          <PreviewWrap>
            <PreviewLeft>
              <PreviewTag>Live preview</PreviewTag>
              <PreviewHeading>
                Watch it<br /><em>write itself</em>
              </PreviewHeading>
              <PreviewBody>
                Talos analyses the candidate's background, the role requirements, and the stage of your pipeline — then drafts a message that sounds like it came from you, not a robot.
              </PreviewBody>
              <StatRow>
                <Stat>
                  <StatNum>3<span>s</span></StatNum>
                  <StatDesc>avg. draft time</StatDesc>
                </Stat>
                <Stat>
                  <StatNum>4<span>×</span></StatNum>
                  <StatDesc>faster outreach</StatDesc>
                </Stat>
              </StatRow>
            </PreviewLeft>

            <LetterCard>
              <LetterHeader>
                <LetterFrom>Talos &bull; Message Draft</LetterFrom>
                <LetterBadge>Generating</LetterBadge>
              </LetterHeader>
              <LetterBody>
                {formatted}
                <Cursor />
              </LetterBody>
              <LetterSig>The Hiring Team</LetterSig>
            </LetterCard>
          </PreviewWrap>

          {/* ── Message types ── */}
          <TypesSection>
            <TypesHeader>
              <TypesTitle>Four message types</TypesTitle>
              <TypesRule />
              <TypesCount>Covered end-to-end</TypesCount>
            </TypesHeader>

            <TypesGrid>
              {MESSAGE_TYPES.map(t => (
                <TypeCard key={t.num} delay={t.delay}>
                  <TypeNum>{t.num}</TypeNum>
                  <TypeIcon>{t.icon}</TypeIcon>
                  <TypeName>{t.name}</TypeName>
                  <TypeDesc>{t.desc}</TypeDesc>
                  <TypeList>
                    {t.bullets.map((b, i) => (
                      <TypeListItem key={i}>{b}</TypeListItem>
                    ))}
                  </TypeList>
                </TypeCard>
              ))}
            </TypesGrid>
          </TypesSection>

          {/* ── Pull quote ── */}
          <PullQuote>
            <PullQuoteText>
              No more staring at a blank screen. Just click, review, and send — in under a minute.
            </PullQuoteText>
            <PullQuoteAttr>Talos Candidate Messaging</PullQuoteAttr>
          </PullQuote>

          {/* ── CTA ── */}
          <CTASection>
            <CTALeft>
              <CTALabel>Ready to start?</CTALabel>
              <CTATitle>Try the Message Generator</CTATitle>
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

export default CandidateMessages;
