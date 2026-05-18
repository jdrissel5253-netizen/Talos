import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Plus } from 'lucide-react';

const FontLoad = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
`;

// ─── Shared ───────────────────────────────────────────────────────────────────

const SectionLabel = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  color: #4ade80;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  &::before {
    content: '';
    display: block;
    width: 2rem;
    height: 1px;
    background: #4ade80;
    flex-shrink: 0;
  }
`;

// ─── Stats Strip ──────────────────────────────────────────────────────────────

const StatsStrip = styled.div`
  background: rgba(17, 19, 24, 0.88);
  backdrop-filter: blur(14px);
  border-top: 1px solid rgba(74, 222, 128, 0.1);
  border-bottom: 1px solid rgba(74, 222, 128, 0.1);
  padding: 5.5rem 7vw;
  position: relative;
  z-index: 2;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1px 1fr 1px 1fr;
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const StatDivider = styled.div`
  background: rgba(74, 222, 128, 0.1);

  @media (max-width: 768px) {
    display: none;
  }
`;

const StatItem = styled.div`
  padding: 0 3.5rem;
  text-align: center;

  &:first-child {
    padding-left: 0;
    text-align: left;
  }

  &:last-child {
    padding-right: 0;
    text-align: right;
  }

  @media (max-width: 1024px) {
    padding: 0 2rem;
  }

  @media (max-width: 768px) {
    padding: 0;
    text-align: left !important;
  }
`;

const StatNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(3.5rem, 7vw, 6.5rem);
  font-weight: 400;
  color: #4ade80;
  line-height: 1;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
`;

const StatTitle = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 0.625rem;
`;

const StatDesc = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 300;
  color: #6e7d8e;
  line-height: 1.55;
`;

// ─── Value Props ──────────────────────────────────────────────────────────────

const ValueSection = styled.section`
  padding: 9rem 7vw;
  background: rgba(17, 19, 24, 0.72);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(35, 40, 48, 0.8);
  position: relative;
  z-index: 2;
`;

const ValueInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 7rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 300px 1fr;
    gap: 4rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ValueLeft = styled.div`
  position: sticky;
  top: 100px;

  @media (max-width: 768px) {
    position: static;
  }
`;

const ValueHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
`;

const ValueSubtext = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9375rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.8;
  margin-bottom: 2.5rem;
`;

const ApproachBox = styled.div`
  padding: 1.75rem;
  border: 1px solid rgba(74, 222, 128, 0.18);
  background: rgba(74, 222, 128, 0.03);

  p {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 300;
    color: #8a9ab0;
    line-height: 1.8;
    margin: 0;
  }
`;

const ApproachTag = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: #4ade80;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.875rem;
`;

const ValueRight = styled.div``;

const GoalRow = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 2rem 0;
  border-bottom: 1px solid rgba(35, 40, 48, 0.7);
  transition: transform 0.2s ease;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    transform: translateX(8px);
  }
`;

const GoalNum = styled.div`
  font-family: 'DM Serif Display', serif;
  font-style: italic;
  font-size: 1.1rem;
  color: rgba(74,222,128,0.3);
  padding-top: 0.15rem;
  flex-shrink: 0;
  width: 2rem;
  line-height: 1;
`;

const GoalText = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 1.0625rem;
  font-weight: 300;
  color: #c8d0dc;
  line-height: 1.65;
`;

// ─── Features ─────────────────────────────────────────────────────────────────

const FeaturesSection = styled.section`
  padding: 8rem 7vw;
  background: rgba(17, 19, 24, 0.9);
  backdrop-filter: blur(14px);
  border-top: 1px solid rgba(35, 40, 48, 0.8);
  border-bottom: 1px solid rgba(35, 40, 48, 0.8);
  position: relative;
  z-index: 2;
`;

const FeaturesInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FeaturesHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.5rem, 5.5vw, 5rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin-bottom: 3.5rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(35, 40, 48, 0.9);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1px;
  }
`;

const FeatureCard = styled.div`
  background: rgba(17, 19, 24, 0.97);
  padding: 3rem 2.5rem;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(26, 31, 42, 0.98);
  }

  @media (max-width: 900px) {
    padding: 2.5rem 2rem;
  }
`;

const FeatureNum = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6rem;
  color: #4ade80;
  letter-spacing: 0.2em;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 1.75rem;
`;

const FeatureTitle = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 1rem;
  line-height: 1.2;
  letter-spacing: -0.01em;
`;

const FeatureDesc = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.75;
  margin-bottom: 1.75rem;
`;

const FeatureBullets = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid rgba(35, 40, 48, 0.9);
  padding-top: 1.5rem;
`;

const FeatureBullet = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  margin-bottom: 0.875rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.55;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BulletDot = styled.span`
  width: 4px;
  height: 4px;
  background: #4ade80;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.5rem;
`;

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQSection = styled.section`
  padding: 9rem 7vw;
  background: rgba(17, 19, 24, 0.82);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(35, 40, 48, 0.8);
  position: relative;
  z-index: 2;
`;

const FAQInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 7rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const FAQLeft = styled.div`
  position: sticky;
  top: 100px;
  align-self: start;

  @media (max-width: 900px) {
    position: static;
  }
`;

const FAQTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.02em;
`;

const FAQRight = styled.div``;

const FAQItem = styled.div`
  border-bottom: 1px solid rgba(35, 40, 48, 0.9);

  &:first-child {
    border-top: 1px solid rgba(35, 40, 48, 0.9);
  }
`;

const FAQTrigger = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 1.75rem 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: color 0.15s;
  color: #c8d0dc;
  font-family: 'DM Sans', sans-serif;

  &:hover {
    color: #ffffff;
  }
`;

const FAQQuestion = styled.span`
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
`;

const FAQIndicator = styled.span<{ open: boolean }>`
  color: #4ade80;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  transform: ${p => (p.open ? 'rotate(45deg)' : 'rotate(0deg)')};
  display: flex;
  align-items: center;
`;

const FAQAnswer = styled.div<{ open: boolean }>`
  max-height: ${p => (p.open ? '300px' : '0')};
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1);
`;

const FAQAnswerInner = styled.div`
  padding-bottom: 1.75rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9375rem;
  font-weight: 300;
  color: #8a9ab0;
  line-height: 1.8;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const ContentSections: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggle = (i: number) => setOpenFAQ(openFAQ === i ? null : i);

  const faqs = [
    {
      q: 'How does Talos integrate with existing job boards?',
      a: 'Talos connects with top job boards through our API integrations, automatically posting your job descriptions and managing applications from a single dashboard.',
    },
    {
      q: 'What makes Talos different from other hiring platforms?',
      a: 'Talos is specifically designed for HVAC companies, with AI that understands technical skills, certifications, and industry-specific requirements. Our candidate ranking system is trained on successful HVAC hires.',
    },
    {
      q: 'How accurate is the AI candidate ranking system?',
      a: 'Our AI ranking system considers technical skills, experience, certifications, and cultural fit indicators — achieving over 90% alignment with hiring manager preferences on shortlisted candidates.',
    },
    {
      q: 'Can I customize job descriptions for different positions?',
      a: 'Yes. Our Job Description Generator creates tailored descriptions for various HVAC roles including technicians, installers, service managers, and office support — all optimized for your local market.',
    },
    {
      q: 'What kind of support do you provide during onboarding?',
      a: 'We provide comprehensive onboarding including account setup, integration assistance, team training, and ongoing support to ensure you get maximum value from Talos from day one.',
    },
  ];

  return (
    <>
      <FontLoad />

      {/* Stats */}
      <StatsStrip>
        <StatsGrid>
          <StatItem>
            <StatNum>85%</StatNum>
            <StatTitle>Faster</StatTitle>
            <StatDesc>Time from posting to qualified shortlist</StatDesc>
          </StatItem>
          <StatDivider />
          <StatItem>
            <StatNum>10x</StatNum>
            <StatTitle>More Reach</StatTitle>
            <StatDesc>Candidates reached via multi-platform posting</StatDesc>
          </StatItem>
          <StatDivider />
          <StatItem>
            <StatNum>90%</StatNum>
            <StatTitle>Accuracy</StatTitle>
            <StatDesc>AI ranking matches hiring manager preferences</StatDesc>
          </StatItem>
        </StatsGrid>
      </StatsStrip>

      {/* Value Props */}
      <ValueSection>
        <ValueInner>
          <ValueLeft>
            <SectionLabel>01 — What You Get</SectionLabel>
            <ValueHeadline>Smarter hiring for HVAC companies.</ValueHeadline>
            <ValueSubtext>
              Stop losing great candidates to slow processes and inefficient
              screening. Talos gives you the tools to hire faster, smarter, and
              with confidence.
            </ValueSubtext>
            <ApproachBox>
              <ApproachTag>Our Approach</ApproachTag>
              <p>
                We combine AI-powered automation with HVAC industry expertise
                to eliminate bottlenecks in your hiring — from writing job
                descriptions to ranking candidates to managing your talent
                pipeline.
              </p>
            </ApproachBox>
          </ValueLeft>

          <ValueRight>
            <GoalRow>
              <GoalNum>01</GoalNum>
              <GoalText>
                AI-generated job descriptions that attract qualified technicians
              </GoalText>
            </GoalRow>
            <GoalRow>
              <GoalNum>02</GoalNum>
              <GoalText>
                Instant candidate ranking and scoring to identify top talent
              </GoalText>
            </GoalRow>
            <GoalRow>
              <GoalNum>03</GoalNum>
              <GoalText>
                Automated posting to top job boards with one click
              </GoalText>
            </GoalRow>
            <GoalRow>
              <GoalNum>04</GoalNum>
              <GoalText>
                Private talent pool to track and revisit candidates over time
              </GoalText>
            </GoalRow>
          </ValueRight>
        </ValueInner>
      </ValueSection>

      {/* Features */}
      <FeaturesSection>
        <FeaturesInner>
          <SectionLabel>02 — How It Works</SectionLabel>
          <FeaturesHeadline>Everything you need to hire better.</FeaturesHeadline>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureNum>01 — AI</FeatureNum>
              <FeatureTitle>AI-Powered Job Description Generator</FeatureTitle>
              <FeatureDesc>
                Say goodbye to writer's block. Our generator creates compelling,
                industry-specific postings tailored to your exact needs.
              </FeatureDesc>
              <FeatureBullets>
                <FeatureBullet>
                  <BulletDot />
                  Optimizes automatically for SEO and job board algorithms
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Includes HVAC-specific certifications and skill requirements
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Generates multiple variations for A/B testing
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Customizes tone to attract top-tier talent in your market
                </FeatureBullet>
              </FeatureBullets>
            </FeatureCard>

            <FeatureCard>
              <FeatureNum>02 — POST</FeatureNum>
              <FeatureTitle>One-Click Multi-Platform Posting</FeatureTitle>
              <FeatureDesc>
                Forget logging into multiple job boards. Posting your job is
                three clicks and five minutes with our seamless integrations.
              </FeatureDesc>
              <FeatureBullets>
                <FeatureBullet>
                  <BulletDot />
                  Automatic formatting for each board's requirements
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Optional sponsored posting on premium platforms
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Simultaneous posting saves hours of manual work
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Unified dashboard to manage all postings centrally
                </FeatureBullet>
              </FeatureBullets>
            </FeatureCard>

            <FeatureCard>
              <FeatureNum>03 — TARGET</FeatureNum>
              <FeatureTitle>Targeted Marketing to Quality Technicians</FeatureTitle>
              <FeatureDesc>
                We don't just post your job — we actively market it to experienced
                HVAC professionals who match your exact requirements.
              </FeatureDesc>
              <FeatureBullets>
                <FeatureBullet>
                  <BulletDot />
                  Geo-targeted distribution in your service area
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Skills-based filtering for EPA certifications and licenses
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Direct outreach to our pre-screened HVAC professional database
                </FeatureBullet>
                <FeatureBullet>
                  <BulletDot />
                  Smart timing to post when quality candidates search most
                </FeatureBullet>
              </FeatureBullets>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesInner>
      </FeaturesSection>

      {/* FAQ */}
      <FAQSection>
        <FAQInner>
          <FAQLeft>
            <SectionLabel>03 — FAQ</SectionLabel>
            <FAQTitle>Frequently asked questions.</FAQTitle>
          </FAQLeft>

          <FAQRight>
            {faqs.map((faq, i) => (
              <FAQItem key={i}>
                <FAQTrigger onClick={() => toggle(i)}>
                  <FAQQuestion>{faq.q}</FAQQuestion>
                  <FAQIndicator open={openFAQ === i}>
                    <Plus size={18} strokeWidth={1.5} />
                  </FAQIndicator>
                </FAQTrigger>
                <FAQAnswer open={openFAQ === i}>
                  <FAQAnswerInner>{faq.a}</FAQAnswerInner>
                </FAQAnswer>
              </FAQItem>
            ))}
          </FAQRight>
        </FAQInner>
      </FAQSection>
    </>
  );
};

export default ContentSections;
