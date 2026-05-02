import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Target, BarChart3, MapPin, Wrench, ScrollText, CircleDollarSign, Home, Calendar, Lock, RefreshCw, FileText, TrendingUp, Bell, ChevronRight } from 'lucide-react';
import DemoModal from './DemoModal';

// ─── design tokens (matches JobsManagement) ────────────────────────────────────

const C = {
    bg:           '#07090d',
    surface:      '#0f1118',
    surfaceHov:   '#131620',
    border:       '#1a1e2a',
    borderBright: '#252b3a',
    amber:        '#f59e0b',
    amberGlow:    '#f59e0b22',
    amberHov:     '#fbbf24',
    text:         '#dde3f0',
    textMid:      '#8892a8',
    textDim:      '#353d52',
    white:        '#ffffff',
} as const;

// ─── animations ───────────────────────────────────────────────────────────────

const fadeSlideUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
`;

const expandWidth = keyframes`
    from { width: 0; }
    to   { width: 100%; }
`;

const countUp = keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
`;

// ─── fonts ────────────────────────────────────────────────────────────────────

const GlobalFonts = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
`;

// ─── page shell ───────────────────────────────────────────────────────────────

const Page = styled.div`
    min-height: 100vh;
    background: ${C.bg};
    font-family: 'Syne', system-ui, sans-serif;
    color: ${C.text};
    overflow-x: hidden;
`;

// ─── header bar ───────────────────────────────────────────────────────────────

const HeaderBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    height: 48px;
    border-bottom: 1px solid ${C.border};
    background: ${C.bg};
    position: sticky;
    top: 0;
    z-index: 20;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
`;

const BrandMark = styled.div`
    font-family: 'Syne', sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${C.amber};
`;

const HeaderSep = styled.div`
    width: 1px;
    height: 14px;
    background: ${C.border};
`;

const HeaderTitle = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    color: ${C.textDim};
    letter-spacing: 0.1em;
    text-transform: uppercase;
`;

const StatusPill = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    color: ${C.amber};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.22rem 0.6rem;
    border: 1px solid ${C.amberGlow};
    border-radius: 3px;
    background: ${C.amberGlow};
`;

const StatusDot = styled.span`
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${C.amber};
    animation: ${pulse} 2s ease-in-out infinite;
`;

// ─── hero ─────────────────────────────────────────────────────────────────────

const Hero = styled.div`
    padding: 4rem 2.5rem 3.5rem;
    border-bottom: 1px solid ${C.border};
    max-width: 1280px;
    margin: 0 auto;
    position: relative;
    animation: ${fadeSlideUp} 0.4s ease both;
`;

const HeroEyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2.25rem;
`;

const EyebrowTag = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${C.amber};
`;

const EyebrowLine = styled.div`
    flex: 1;
    max-width: 80px;
    height: 1px;
    background: ${C.border};
`;

const EyebrowMeta = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    color: ${C.textDim};
    letter-spacing: 0.08em;
`;

const HeroTitle = styled.h1`
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(3.25rem, 8vw, 6.5rem);
    line-height: 0.95;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: ${C.white};
    margin-bottom: 0;
`;

const HeroTitleAccent = styled.span`
    color: ${C.amber};
    display: block;
`;

const HeroAccentLine = styled.div`
    height: 2px;
    background: ${C.amber};
    margin: 2rem 0 2.25rem;
    animation: ${expandWidth} 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
    width: 0;
    max-width: 120px;
`;

const HeroBottom = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;

    @media (max-width: 640px) { flex-direction: column; align-items: flex-start; }
`;

const HeroDesc = styled.p`
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 400;
    color: ${C.textMid};
    line-height: 1.7;
    max-width: 480px;
`;

const HeroDocId = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.55rem;
    color: ${C.textDim};
    letter-spacing: 0.1em;
    text-align: right;
    white-space: nowrap;
    line-height: 1.8;
`;

// ─── stats strip ──────────────────────────────────────────────────────────────

const StatsStrip = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid ${C.border};

    @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCell = styled.div`
    padding: 1.75rem 2rem;
    border-right: 1px solid ${C.border};
    animation: ${fadeSlideUp} 0.4s ease var(--delay, 0.1s) both;

    &:last-child { border-right: none; }

    @media (max-width: 640px) {
        &:nth-child(2) { border-right: none; }
        border-bottom: 1px solid ${C.border};
    }
`;

const StatNum = styled.div`
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2.5rem;
    line-height: 1;
    color: ${C.white};
    letter-spacing: -0.02em;
    margin-bottom: 0.35rem;
    animation: ${countUp} 0.4s ease both;

    span { color: ${C.amber}; }
`;

const StatLabel = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${C.textDim};
`;

// ─── section header ───────────────────────────────────────────────────────────

const SectionWrap = styled.div`
    border-bottom: 1px solid ${C.border};
`;

const SectionInner = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2.5rem;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1rem 0 0.9rem;
    border-bottom: 1px solid ${C.border};
`;

const SectionIdx = styled.span`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: ${C.amber};
`;

const SectionTitle = styled.h2`
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${C.text};
`;

const SectionRule = styled.div`
    flex: 1;
    height: 1px;
    background: ${C.border};
`;

const SectionCount = styled.span`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    color: ${C.textDim};
    letter-spacing: 0.08em;
    white-space: nowrap;
`;

// ─── filter table ─────────────────────────────────────────────────────────────

const FilterTable = styled.div``;

const FilterRow = styled.div`
    display: grid;
    grid-template-columns: 48px 40px 1fr 1fr;
    align-items: center;
    border-bottom: 1px solid ${C.border};
    transition: background 0.12s ease;
    cursor: default;

    &:last-child { border-bottom: none; }

    &:hover {
        background: ${C.amberGlow};

        & > *:first-child { color: ${C.amber}; }
    }

    @media (max-width: 640px) {
        grid-template-columns: 40px 32px 1fr;
    }
`;

const FilterIdx = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    font-weight: 600;
    color: ${C.textDim};
    padding: 1.1rem 0 1.1rem 0;
    letter-spacing: 0.08em;
    transition: color 0.12s ease;
    text-align: center;
`;

const FilterIconWrap = styled.div`
    display: flex;
    align-items: center;
    color: ${C.textDim};
    transition: color 0.12s ease;
`;

const FilterName = styled.div`
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${C.text};
    padding: 1.1rem 1.25rem;
`;

const FilterDesc = styled.div`
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    font-weight: 400;
    color: ${C.textMid};
    padding: 1.1rem 1.5rem 1.1rem 0;
    line-height: 1.5;

    @media (max-width: 640px) { display: none; }
`;

// ─── features grid ────────────────────────────────────────────────────────────

const FeaturesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: ${C.border};

    @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const FeatureCell = styled.div`
    background: ${C.bg};
    padding: 2rem 2rem 2rem;
    position: relative;
    overflow: hidden;
    transition: background 0.15s ease;

    &:hover {
        background: ${C.surface};
    }

    &:hover > div:first-child { color: ${C.amberGlow}; }
    &:hover > div:nth-child(2) { border-color: ${C.amber}; color: ${C.amber}; }
`;

const FeatureBigIdx = styled.div`
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 4.5rem;
    line-height: 1;
    color: rgba(255,255,255,0.03);
    position: absolute;
    top: 0.75rem;
    right: 1rem;
    letter-spacing: -0.03em;
    transition: color 0.15s ease;
    pointer-events: none;
    user-select: none;
`;

const FeatureIconBox = styled.div`
    width: 32px;
    height: 32px;
    border: 1px solid ${C.border};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${C.textMid};
    margin-bottom: 1.1rem;
    transition: all 0.15s ease;
    border-radius: 3px;
`;

const FeatureName = styled.h3`
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: ${C.white};
    margin-bottom: 0.65rem;
    line-height: 1.3;
`;

const FeatureDesc = styled.p`
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    font-weight: 400;
    color: ${C.textMid};
    line-height: 1.7;
`;

// ─── CTA ──────────────────────────────────────────────────────────────────────

const CTAWrap = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    padding: 4rem 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const CTALeft = styled.div``;

const CTAEyebrow = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${C.amber};
    margin-bottom: 0.75rem;
`;

const CTATitle = styled.h2`
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: ${C.white};
    line-height: 1.05;
`;

const CTAButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: ${C.amber};
    color: ${C.bg};
    border: none;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s ease;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
        background: ${C.amberHov};
        transform: translateY(-1px);
        box-shadow: 0 4px 20px ${C.amberGlow};
        gap: 0.9rem;
    }
`;

// ─── count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900, delay = 0) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                setTimeout(() => {
                    const start = performance.now();
                    const tick = (now: number) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(ease * target));
                        if (progress < 1) requestAnimationFrame(tick);
                        else setCount(target);
                    };
                    requestAnimationFrame(tick);
                }, delay);
            }
        }, { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration, delay]);

    return { count, ref };
}

// ─── data ─────────────────────────────────────────────────────────────────────

const FILTERS = [
    { icon: <Target size={14} />,           name: 'Smart Tier Segmentation',  desc: 'Candidates auto-organized by performance score for instant prioritization' },
    { icon: <BarChart3 size={14} />,         name: 'Dynamic Score Analysis',    desc: 'Advanced filtering surfaces the most qualified candidates first' },
    { icon: <MapPin size={14} />,            name: 'Geographic Intelligence',   desc: 'Location matching optimized for commute feasibility and local experience' },
    { icon: <Wrench size={14} />,            name: 'Experience Profiling',      desc: 'AI classification of candidate seniority and skill progression' },
    { icon: <ScrollText size={14} />,        name: 'Credential Verification',   desc: 'Automated detection of industry certifications and licenses' },
    { icon: <CircleDollarSign size={14} />,  name: 'Compensation Alignment',    desc: 'Strategic matching of candidate expectations with your budget' },
    { icon: <Home size={14} />,              name: 'Specialization Mapping',    desc: 'Intelligent categorization of HVAC expertise across market segments' },
    { icon: <Calendar size={14} />,          name: 'Availability Tracking',     desc: 'Real-time monitoring of start date flexibility and availability' },
];

const FEATURES = [
    { icon: <Lock size={14} />,       name: 'Enterprise-Grade Security',       desc: 'Bank-level encryption and access controls keep your candidate pipeline completely confidential and protected from competitors.' },
    { icon: <RefreshCw size={14} />,   name: 'Living Database Intelligence',   desc: 'Continuous data integration enriches candidate profiles with updated qualifications, market movements, and availability signals.' },
    { icon: <FileText size={14} />,    name: 'Collaborative Workflow Tools',   desc: 'Annotation systems enable your team to share insights, track engagement history, and maintain institutional knowledge on each candidate.' },
    { icon: <TrendingUp size={14} />,  name: 'Predictive Analytics Engine',    desc: 'Machine learning analyzes hiring outcomes to continuously refine candidate quality predictions and optimize selection criteria.' },
    { icon: <Bell size={14} />,        name: 'Proactive Opportunity Alerts',   desc: 'Intelligent monitoring identifies optimal timing for candidate outreach and signals when your pipeline requires strategic refreshment.' },
    { icon: <BarChart3 size={14} />,   name: 'Strategic Intelligence Reports', desc: 'Analytics dashboards provide actionable insights into talent market trends, competitive positioning, and pipeline health.' },
];

// ─── animated stat cell ───────────────────────────────────────────────────────

const AnimatedStatCell: React.FC<{ target: number; suffix?: string; label: string; delay: number }> = ({ target, suffix = '', label, delay }) => {
    const { count, ref } = useCountUp(target, 900, delay);
    return (
        <StatCell ref={ref} style={{ '--delay': `${delay / 1000 + 0.05}s` } as React.CSSProperties}>
            <StatNum>{count}<span>{suffix}</span></StatNum>
            <StatLabel>{label}</StatLabel>
        </StatCell>
    );
};

// ─── component ────────────────────────────────────────────────────────────────

const TalentPool: React.FC = () => {
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    return (
        <>
            <GlobalFonts />
            <Page>

                {/* ── Header bar ── */}
                <HeaderBar>
                    <HeaderLeft>
                        <BrandMark>Talos</BrandMark>
                        <HeaderSep />
                        <HeaderTitle>talent-pool / v1</HeaderTitle>
                    </HeaderLeft>
                    <StatusPill>
                        <StatusDot />
                        System Active
                    </StatusPill>
                </HeaderBar>

                {/* ── Hero ── */}
                <Hero>
                    <HeroEyebrow>
                        <EyebrowTag>TP-001</EyebrowTag>
                        <EyebrowLine />
                        <EyebrowMeta>Talos / Talent Intelligence</EyebrowMeta>
                    </HeroEyebrow>

                    <HeroTitle>
                        Talent
                        <HeroTitleAccent>Pool</HeroTitleAccent>
                    </HeroTitle>

                    <HeroAccentLine />

                    <HeroBottom>
                        <HeroDesc>
                            Your private database of AI-ranked HVAC candidates — always current, always searchable, always yours.
                        </HeroDesc>
                        <HeroDocId>
                            DOC-TP-001 / CLASSIFICATION: CLIENT-ONLY<br />
                            FILTER DIMENSIONS: 08 / CAPABILITIES: 06
                        </HeroDocId>
                    </HeroBottom>
                </Hero>

                {/* ── Stats ── */}
                <StatsStrip>
                    <AnimatedStatCell target={8}   suffix=" +"  label="Filter Dimensions"  delay={0}   />
                    <AnimatedStatCell target={6}               label="Core Capabilities"   delay={80}  />
                    <AnimatedStatCell target={100} suffix="%"  label="Private & Encrypted" delay={160} />
                    <AnimatedStatCell target={24}  suffix="h"  label="Always Available"    delay={240} />
                </StatsStrip>

                {/* ── Filters ── */}
                <SectionWrap>
                    <SectionInner>
                        <SectionHeader>
                            <SectionIdx>01</SectionIdx>
                            <SectionTitle>Intelligent Organization</SectionTitle>
                            <SectionRule />
                            <SectionCount>8 filter dimensions</SectionCount>
                        </SectionHeader>
                        <FilterTable>
                            {FILTERS.map((f, i) => (
                                <FilterRow key={i}>
                                    <FilterIdx>{String(i + 1).padStart(2, '0')}</FilterIdx>
                                    <FilterIconWrap>{f.icon}</FilterIconWrap>
                                    <FilterName>{f.name}</FilterName>
                                    <FilterDesc>{f.desc}</FilterDesc>
                                </FilterRow>
                            ))}
                        </FilterTable>
                    </SectionInner>
                </SectionWrap>

                {/* ── Features ── */}
                <SectionWrap>
                    <SectionInner>
                        <SectionHeader>
                            <SectionIdx>02</SectionIdx>
                            <SectionTitle>Platform Capabilities</SectionTitle>
                            <SectionRule />
                            <SectionCount>6 core features</SectionCount>
                        </SectionHeader>
                    </SectionInner>
                    <FeaturesGrid>
                        {FEATURES.map((f, i) => (
                            <FeatureCell key={i}>
                                <FeatureBigIdx>{String(i + 1).padStart(2, '0')}</FeatureBigIdx>
                                <FeatureIconBox>{f.icon}</FeatureIconBox>
                                <FeatureName>{f.name}</FeatureName>
                                <FeatureDesc>{f.desc}</FeatureDesc>
                            </FeatureCell>
                        ))}
                    </FeaturesGrid>
                </SectionWrap>

                {/* ── CTA ── */}
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                    <CTAWrap>
                        <CTALeft>
                            <CTAEyebrow>Ready to deploy</CTAEyebrow>
                            <CTATitle>See the Talent<br />Pool in Action</CTATitle>
                        </CTALeft>
                        <CTAButton onClick={() => setIsDemoModalOpen(true)}>
                            Request Access <ChevronRight size={14} />
                        </CTAButton>
                    </CTAWrap>
                </div>

            </Page>

            <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
        </>
    );
};

export default TalentPool;
