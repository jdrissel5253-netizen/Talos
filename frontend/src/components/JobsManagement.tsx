import React, { useState, useEffect, useMemo } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, CheckCircle, AlertCircle, XCircle, Check, ThumbsUp, X, MapPin, Briefcase, Car, Mail, Smartphone, Calendar, FileText, Link, Copy } from 'lucide-react';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';
import AddJobForm from './AddJobForm';
import ContactRejectionModal from './ContactRejectionModal';
import { extractCandidateName } from '../utils/templateHelpers';

// ─── types ────────────────────────────────────────────────────────────────────

interface Job {
    id: number;
    title: string;
    description: string;
    location: string;
    city?: string;
    zip_code?: string;
    job_type?: string;
    job_location_type?: string;
    pay_range_min?: number;
    pay_range_max?: number;
    pay_type?: string;
    required_years_experience: number;
    vehicle_required: boolean;
    position_type: string;
    salary_min?: number;
    salary_max?: number;
    status: string;
    company_name?: string;
    education_requirements?: string;
    benefits?: string;
    key_responsibilities?: string;
    qualifications_certifications?: string;
    advancement_opportunities?: boolean;
    advancement_timeline?: string;
    company_culture?: string;
}

interface CandidatePipeline {
    id: number;
    candidate_id: number;
    job_id: number;
    pipeline_status: string;
    tier: string;
    tier_score: number;
    star_rating: number;
    give_them_a_chance: boolean;
    vehicle_status: string;
    ai_summary: string;
    filename: string;
    overall_score: number;
    years_of_experience: number;
    certifications_found: string[];
    hiring_recommendation: string;
}

type PipelineTab = 'all' | 'approved' | 'contacted' | 'backup' | 'rejected';

// ─── design tokens ────────────────────────────────────────────────────────────

const C = {
    bg:          '#07090d',
    rail:        '#0b0d12',
    surface:     '#0f1118',
    surfaceHov:  '#131620',
    border:      '#1a1e2a',
    borderBright:'#252b3a',
    amber:       '#f59e0b',
    amberGlow:   '#f59e0b22',
    amberHov:    '#fbbf24',
    green:       '#22c55e',
    greenGlow:   '#22c55e18',
    yellow:      '#eab308',
    yellowGlow:  '#eab30818',
    red:         '#f87171',
    redGlow:     '#f8717118',
    blue:        '#60a5fa',
    text:        '#dde3f0',
    textMid:     '#8892a8',
    textDim:     '#353d52',
    white:       '#ffffff',
} as const;

const tierColor = (tier: string): string => {
    if (tier === 'green')  return C.green;
    if (tier === 'yellow') return C.yellow;
    return C.red;
};

const tierGlow = (tier: string): string => {
    if (tier === 'green')  return C.greenGlow;
    if (tier === 'yellow') return C.yellowGlow;
    return C.redGlow;
};

// ─── animations ───────────────────────────────────────────────────────────────

const fadeSlideUp = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
`;

// ─── fonts ────────────────────────────────────────────────────────────────────

const GlobalFonts = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
`;

// ─── layout ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
    min-height: 100vh;
    background: ${C.bg};
    display: flex;
    font-family: 'Syne', system-ui, sans-serif;
    color: ${C.text};
    position: relative;
`;

const LeftRail = styled.div<{ isCollapsed: boolean }>`
    width: ${p => p.isCollapsed ? '48px' : '262px'};
    min-height: 100vh;
    background: ${C.rail};
    border-right: 1px solid ${C.border};
    display: flex;
    flex-direction: column;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 10;
    flex-shrink: 0;

    @media (max-width: 768px) {
        position: fixed;
        top: 0;
        bottom: 0;
        left: ${p => p.isCollapsed ? '-262px' : '0'};
        width: 262px;
    }
`;

const CollapseBtn = styled.button`
    position: absolute;
    top: 0.85rem;
    right: 0.75rem;
    width: 26px;
    height: 26px;
    border-radius: 4px;
    background: transparent;
    border: 1px solid ${C.border};
    color: ${C.textDim};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    z-index: 10;
    transition: all 0.15s;
    font-family: 'JetBrains Mono', monospace;

    &:hover {
        border-color: ${C.amber};
        color: ${C.amber};
        background: ${C.amberGlow};
    }
`;

const RailBrand = styled.div`
    padding: 1.1rem 1.1rem 0.85rem;
    border-bottom: 1px solid ${C.border};
`;

const BrandMark = styled.div`
    font-family: 'Syne', sans-serif;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${C.amber};
`;

const BrandSub = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    color: ${C.textDim};
    letter-spacing: 0.08em;
    margin-top: 3px;
`;

const NavSection = styled.div`
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid ${C.border};
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const NavBtn = styled.button`
    background: transparent;
    border: none;
    color: ${C.textMid};
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.38rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;

    &:hover {
        color: ${C.text};
        background: ${C.surface};
    }
`;

const AddJobBtn = styled.button`
    margin: 0.75rem;
    background: ${C.amber};
    color: ${C.bg};
    border: none;
    padding: 0.55rem 1rem;
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
    width: calc(100% - 1.5rem);

    &:hover {
        background: ${C.amberHov};
        transform: translateY(-1px);
        box-shadow: 0 4px 16px ${C.amberGlow};
    }
`;

const JobsScroll = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
`;

const JobItem = styled.div<{ isActive: boolean }>`
    padding: 0.6rem 0.7rem;
    margin-bottom: 2px;
    border-radius: 5px;
    cursor: pointer;
    border-left: 3px solid ${p => p.isActive ? C.amber : 'transparent'};
    background: ${p => p.isActive ? C.surface : 'transparent'};
    transition: all 0.15s;
    position: relative;

    &:hover {
        background: ${C.surface};
        border-left-color: ${p => p.isActive ? C.amber : C.borderBright};
    }
`;

const JobItemTitle = styled.div`
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${C.text};
    margin-bottom: 0.18rem;
    padding-right: 2.2rem;
    line-height: 1.3;
`;

const JobItemMeta = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    color: ${C.textDim};
    letter-spacing: 0.04em;
`;

const JobItemEditBtn = styled.button`
    position: absolute;
    top: 0.55rem;
    right: 0.5rem;
    background: transparent;
    border: 1px solid ${C.border};
    color: ${C.textDim};
    font-size: 0.58rem;
    padding: 0.12rem 0.3rem;
    border-radius: 3px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.04em;
    transition: all 0.15s;

    &:hover {
        border-color: ${C.amber};
        color: ${C.amber};
        background: ${C.amberGlow};
    }

    &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const RailFooter = styled.div`
    padding: 0.75rem;
    border-top: 1px solid ${C.border};
`;

const TalentPoolBtn = styled.button`
    width: 100%;
    background: transparent;
    border: 1px solid ${C.border};
    color: ${C.textMid};
    font-family: 'Syne', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.45rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
        border-color: ${C.amber};
        color: ${C.amber};
        background: ${C.amberGlow};
    }
`;

// ─── main stage ───────────────────────────────────────────────────────────────

const MainStage = styled.div`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    &::-webkit-scrollbar { width: 5px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
`;

const StageHeader = styled.div`
    background: ${C.rail};
    border-bottom: 1px solid ${C.border};
    padding: 1.5rem 2rem 1.25rem;
    position: sticky;
    top: 0;
    z-index: 5;
`;

const HeaderEyebrow = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    color: ${C.amber};
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
    animation: ${fadeSlideUp} 0.3s ease both;
`;

const HeaderTop = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    animation: ${fadeSlideUp} 0.3s 0.05s ease both;
`;

const JobTitleDisplay = styled.h1`
    font-family: 'Syne', sans-serif;
    font-size: 1.85rem;
    font-weight: 800;
    color: ${C.text};
    margin: 0;
    line-height: 1.1;
    letter-spacing: -0.01em;
`;

const TagRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    animation: ${fadeSlideUp} 0.3s 0.1s ease both;
`;

const Tag = styled.span`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.67rem;
    color: ${C.textMid};
    background: ${C.surface};
    border: 1px solid ${C.border};
    padding: 0.22rem 0.6rem;
    border-radius: 3px;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    letter-spacing: 0.03em;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;
    flex-wrap: wrap;
`;

const GhostBtn = styled.button<{ $danger?: boolean }>`
    background: transparent;
    border: 1px solid ${p => p.$danger ? C.red + '55' : C.border};
    color: ${p => p.$danger ? C.red : C.textMid};
    font-family: 'Syne', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.42rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.15s;

    &:hover {
        background: ${p => p.$danger ? C.redGlow : C.surface};
        border-color: ${p => p.$danger ? C.red : C.amber};
        color: ${p => p.$danger ? C.red : C.amber};
    }
`;

const AmberOutlineBtn = styled.button<{ $copied?: boolean }>`
    background: ${p => p.$copied ? C.green : 'transparent'};
    border: 1px solid ${p => p.$copied ? C.green : C.amber + '70'};
    color: ${p => p.$copied ? C.white : C.amber};
    font-family: 'Syne', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.42rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.15s;

    &:hover {
        background: ${p => p.$copied ? C.green + 'dd' : C.amberGlow};
        border-color: ${p => p.$copied ? C.green : C.amber};
    }
`;

const IndeedLink = styled.a`
    background: #1d4ed8;
    color: ${C.white};
    font-family: 'Syne', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.42rem 0.8rem;
    border-radius: 4px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid transparent;
    transition: background 0.15s;

    &:hover { background: #1e40af; }
`;

// ─── pipeline body ────────────────────────────────────────────────────────────

const PipelineBody = styled.div`
    padding: 1.5rem 2rem 3rem;
    flex: 1;
`;

const TabStrip = styled.div`
    display: flex;
    border-bottom: 1px solid ${C.border};
    margin-bottom: 1.5rem;
    gap: 0;
`;

const TabItem = styled.button<{ $isActive: boolean }>`
    background: transparent;
    border: none;
    border-bottom: 2px solid ${p => p.$isActive ? C.amber : 'transparent'};
    color: ${p => p.$isActive ? C.amber : C.textMid};
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    font-weight: ${p => p.$isActive ? 700 : 500};
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.55rem 1.1rem;
    cursor: pointer;
    margin-bottom: -1px;
    transition: all 0.15s;

    &:hover { color: ${p => p.$isActive ? C.amber : C.text}; }
`;

const ControlRow = styled.div`
    display: flex;
    gap: 0.6rem;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
`;

const ControlLabel = styled.span`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    color: ${C.textDim};
    letter-spacing: 0.1em;
    text-transform: uppercase;
`;

const FilterSelect = styled.select`
    background: ${C.surface};
    border: 1px solid ${C.border};
    color: ${C.text};
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    padding: 0.32rem 0.65rem;
    border-radius: 3px;
    cursor: pointer;
    letter-spacing: 0.03em;

    &:focus {
        outline: none;
        border-color: ${C.amber};
    }

    option { background: ${C.surface}; }
`;

const BulkBar = styled.div`
    background: ${C.amberGlow};
    border: 1px solid ${C.amber}44;
    border-radius: 5px;
    padding: 0.6rem 1rem;
    margin-bottom: 1.25rem;
    display: flex;
    gap: 0.6rem;
    align-items: center;
`;

const BulkCount = styled.span`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: ${C.amber};
    font-weight: 600;
    margin-right: 0.25rem;
`;

const BulkBtn = styled.button`
    background: ${C.surface};
    border: 1px solid ${C.border};
    color: ${C.text};
    font-family: 'Syne', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.32rem 0.7rem;
    border-radius: 3px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    transition: all 0.15s;

    &:hover {
        border-color: ${C.amber};
        color: ${C.amber};
        background: ${C.amberGlow};
    }
`;

// ─── tier sections ────────────────────────────────────────────────────────────

const TierGroup = styled.div`
    margin-bottom: 2.5rem;
    animation: ${fadeSlideUp} 0.3s ease both;
`;

const TierLabelRow = styled.div<{ $tier: string }>`
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid ${p => tierColor(p.$tier)}28;
`;

const TierBar = styled.div<{ $tier: string }>`
    width: 3px;
    height: 1.1rem;
    border-radius: 2px;
    background: ${p => tierColor(p.$tier)};
    box-shadow: 0 0 6px ${p => tierColor(p.$tier)}88;
`;

const TierName = styled.span<{ $tier: string }>`
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${p => tierColor(p.$tier)};
`;

const TierRange = styled.span`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    color: ${C.textDim};
    letter-spacing: 0.04em;
`;

const TierCount = styled.span`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.67rem;
    color: ${C.textMid};
    margin-left: auto;
`;

// ─── candidate dossier card ───────────────────────────────────────────────────

const DossierCard = styled.div<{ $isSelected: boolean; $tier?: string }>`
    background: ${p => p.$isSelected ? C.surface : 'transparent'};
    border: 1px solid ${p => p.$isSelected ? C.amber + '44' : C.border};
    border-left: 3px solid ${p => p.$isSelected ? C.amber : (p.$tier ? tierColor(p.$tier) + '30' : C.border)};
    border-radius: 5px;
    padding: 0.9rem 1.1rem;
    margin-bottom: 0.4rem;
    display: grid;
    grid-template-columns: 18px 52px 1fr auto;
    column-gap: 0.9rem;
    align-items: start;
    transition: all 0.15s;

    &:hover {
        background: ${C.surface};
        border-left-color: ${p => p.$tier ? tierColor(p.$tier) : C.amber};
        border-color: ${p => p.$tier ? tierColor(p.$tier) + '44' : C.border};
    }
`;

const CardCheckbox = styled.input`
    width: 15px;
    height: 15px;
    margin-top: 3px;
    cursor: pointer;
    accent-color: ${C.amber};
    flex-shrink: 0;
`;

const ScoreCircle = styled.div<{ $tier: string }>`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: ${p => tierGlow(p.$tier)};
    border: 1.5px solid ${p => tierColor(p.$tier)}55;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.88rem;
    font-weight: 700;
    color: ${p => tierColor(p.$tier)};
    flex-shrink: 0;
    line-height: 1;
`;

const CardBody = styled.div`
    min-width: 0;
`;

const CardTopRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;
    margin-bottom: 0.28rem;
`;

const CandidateName = styled.span`
    font-family: 'Syne', sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    color: ${C.text};
`;

const StarRowWrap = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 1px;
`;

const ChanceBadge = styled.span`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.07em;
    color: ${C.amber};
    border: 1px solid ${C.amber}55;
    padding: 0.1rem 0.38rem;
    border-radius: 2px;
    text-transform: uppercase;
`;

const CardMetaRow = styled.div`
    display: flex;
    gap: 1.1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.64rem;
    color: ${C.textMid};
    margin-bottom: 0.45rem;
    flex-wrap: wrap;
    letter-spacing: 0.03em;
`;

const CardSummary = styled.p`
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    font-weight: 400;
    color: ${C.textMid};
    line-height: 1.6;
    margin: 0;
`;

const CardActions = styled.div`
    display: flex;
    gap: 0.3rem;
    align-items: flex-start;
    flex-shrink: 0;
`;

const ActionBtn = styled.button<{ $color: string }>`
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background: ${p => p.$color}18;
    border: 1px solid ${p => p.$color}44;
    color: ${p => p.$color};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;

    &:hover {
        background: ${p => p.$color}30;
        border-color: ${p => p.$color};
        transform: translateY(-1px);
    }
`;

const MsgDropdownWrap = styled.div`
    position: relative;
`;

const MsgMenu = styled.div<{ $isOpen: boolean }>`
    display: ${p => p.$isOpen ? 'block' : 'none'};
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    background: ${C.surface};
    border: 1px solid ${C.borderBright};
    border-radius: 5px;
    min-width: 140px;
    z-index: 20;
    box-shadow: 0 12px 32px rgba(0,0,0,0.6);
    overflow: hidden;
`;

const MsgMenuItem = styled.button`
    background: transparent;
    border: none;
    color: ${C.text};
    font-family: 'Syne', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.48rem 0.85rem;
    width: 100%;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.1s;

    &:hover { background: ${C.surfaceHov}; }
`;

// ─── misc ─────────────────────────────────────────────────────────────────────

const EmptyBox = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: ${C.textDim};
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 2;
`;

const LoadingText = styled.div`
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: ${C.textDim};
    letter-spacing: 0.1em;
    text-align: center;
    padding: 2.5rem;
    animation: ${pulse} 1.5s ease infinite;
`;

const ErrorToast = styled.div`
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: #110a0a;
    border: 1px solid ${C.red}55;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    color: #fca5a5;
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: 360px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
`;

const ErrorClose = styled.button`
    background: none;
    border: none;
    color: #fca5a5;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    margin-left: auto;
    flex-shrink: 0;
    &:hover { color: ${C.red}; }
`;

const WelcomeState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 60vh;
    text-align: center;
    padding: 2rem;
    gap: 0.75rem;
`;

const WelcomeTitle = styled.h2`
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: ${C.textDim};
    margin: 0;
    letter-spacing: -0.01em;
`;

const WelcomeSub = styled.p`
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    color: ${C.textDim};
    margin: 0;
`;

// ─── component ────────────────────────────────────────────────────────────────

const JobsManagement: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [candidates, setCandidates] = useState<CandidatePipeline[]>([]);
    const [activeTab, setActiveTab] = useState<PipelineTab>('all');
    const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [filterTier, setFilterTier] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('tier_score');
    const [messageDropdownOpen, setMessageDropdownOpen] = useState<number | null>(null);
    const [showAddJobForm, setShowAddJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [loadingEditJob, setLoadingEditJob] = useState<number | null>(null);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [selectedCandidateForContact, setSelectedCandidateForContact] = useState<{ pipelineId: number; name: string; position: string; } | null>(null);
    const [contactMode, setContactMode] = useState<'contact' | 'rejection'>('contact');
    const [contactCommunicationType, setContactCommunicationType] = useState<'email' | 'sms'>('email');
    const [copiedJobId, setCopiedJobId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();

    const copyApplyLink = (job: Job) => {
        const baseUrl = window.location.origin;
        const applyUrl = `${baseUrl}/apply?job=${job.id}&title=${encodeURIComponent(job.title)}`;
        navigator.clipboard.writeText(applyUrl).then(() => {
            setCopiedJobId(job.id);
            setTimeout(() => setCopiedJobId(null), 2000);
        });
    };

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        if (!jobId || jobs.length === 0) return;
        const id = parseInt(jobId, 10);
        const match = jobs.find(j => j.id === id);
        if (match && match.id !== selectedJob?.id) {
            setSelectedJob(match);
        }
    }, [jobId, jobs]);

    useEffect(() => {
        if (!selectedJob) return;

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
            loadCandidates(selectedJob.id, abortController.signal);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            abortController.abort();
        };
    }, [selectedJob, activeTab, filterTier, sortBy]);

    const openEditForm = async (job: Job) => {
        setLoadingEditJob(job.id);
        try {
            const response = await fetch(`${config.apiUrl}/api/jobs/${job.id}`, { headers: getAuthHeaders() });
            if (response.ok) {
                const data = await response.json();
                setEditingJob(data.data?.job ?? job);
            } else {
                setEditingJob(job);
            }
        } catch {
            setEditingJob(job);
        } finally {
            setLoadingEditJob(null);
        }
    };

    const deleteJob = async (job: Job) => {
        if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
        try {
            const response = await fetch(`${config.apiUrl}/api/jobs/${job.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                alert('Failed to delete job. Please try again.');
                return;
            }
            setJobs(prev => prev.filter(j => j.id !== job.id));
            setSelectedJob(null);
            navigate('/jobs-management', { replace: true });
        } catch {
            alert('Failed to delete job. Please try again.');
        }
    };

    const loadJobs = async () => {
        setLoadingJobs(true);
        setError(null);
        try {
            const response = await fetch(`${config.apiUrl}/api/jobs?userId=1`, { headers: getAuthHeaders(), cache: 'no-store' });
            if (!response.ok) {
                setError(response.status >= 500
                    ? 'Something went wrong loading jobs. Please try again later.'
                    : 'Failed to load jobs. Please try again.');
                return;
            }
            const data = await response.json();
            if (data.status === 'success') {
                setJobs(data.data.jobs);
                if (data.data.jobs.length > 0 && !selectedJob) {
                    const paramId = jobId ? parseInt(jobId, 10) : null;
                    const match = paramId ? data.data.jobs.find((j: Job) => j.id === paramId) : null;
                    const jobToSelect = match || data.data.jobs[0];
                    setSelectedJob(jobToSelect);
                    if (!match) navigate(`/jobs-management/${jobToSelect.id}`, { replace: true });
                }
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            setError('Failed to load jobs. Please check your connection and try again.');
        } finally {
            setLoadingJobs(false);
        }
    };

    const loadCandidates = async (jobId: number, signal?: AbortSignal) => {
        setLoadingCandidates(true);
        try {
            const params = new URLSearchParams();
            if (activeTab !== 'all') params.append('pipeline_status', activeTab);
            if (filterTier !== 'all') params.append('tier', filterTier);
            params.append('sort_by', sortBy);

            const response = await fetch(`${config.apiUrl}/api/jobs/${jobId}?${params}`, { signal, headers: getAuthHeaders() });
            if (!response.ok) {
                setError(response.status >= 500
                    ? 'Something went wrong loading candidates. Please try again later.'
                    : 'Failed to load candidates. Please try again.');
                return;
            }
            const data = await response.json();
            if (data.status === 'success') {
                setCandidates(data.data.candidates);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error('Error loading candidates:', error);
            setError('Failed to load candidates. Please check your connection and try again.');
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleCandidateAction = async (candidatePipelineId: number, action: string) => {
        try {
            const response = await fetch(`${config.apiUrl}/api/pipeline/${candidatePipelineId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status: action })
            });
            if (response.ok) {
                if (selectedJob) loadCandidates(selectedJob.id);
                setSelectedCandidates(new Set());
            }
        } catch (error) {
            console.error('Error updating candidate:', error);
            setError('Failed to update candidate status. Please try again.');
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedCandidates.size === 0) return;
        try {
            const response = await fetch(`${config.apiUrl}/api/pipeline/bulk-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    candidatePipelineIds: Array.from(selectedCandidates),
                    status: action
                })
            });
            if (response.ok) {
                if (selectedJob) loadCandidates(selectedJob.id);
                setSelectedCandidates(new Set());
            }
        } catch (error) {
            console.error('Error bulk updating:', error);
            setError('Failed to update candidates. Please try again.');
        }
    };

    const handleSendMessage = (candidatePipelineId: number, messageType: string) => {
        const candidate = candidates.find(c => c.id === candidatePipelineId);
        if (!candidate) return;
        const candidateName = extractCandidateName(candidate.filename || 'Candidate');
        setSelectedCandidateForContact({
            pipelineId: candidatePipelineId,
            name: candidateName,
            position: selectedJob?.title || 'Position'
        });
        if (messageType === 'rejection_email') {
            setContactMode('rejection');
            setContactCommunicationType('email');
        } else {
            setContactMode('contact');
            setContactCommunicationType(messageType === 'sms' ? 'sms' : 'email');
        }
        setMessageDropdownOpen(null);
        setContactModalOpen(true);
    };

    const handleContactSuccess = () => {
        setContactModalOpen(false);
        setSelectedCandidateForContact(null);
        if (selectedJob) loadCandidates(selectedJob.id);
    };

    const toggleCandidateSelection = (id: number) => {
        const newSelection = new Set(selectedCandidates);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedCandidates(newSelection);
    };

    const getStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        return (
            <StarRowWrap>
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={11}
                        fill={i < fullStars ? '#f59e0b' : 'none'}
                        color={i < fullStars ? '#f59e0b' : '#353d52'}
                        className={i === fullStars && halfStar ? 'half-star' : ''}
                    />
                ))}
            </StarRowWrap>
        );
    };

    const candidatesByTier = useMemo(() => ({
        green:  candidates.filter(c => c.tier === 'green'),
        yellow: candidates.filter(c => c.tier === 'yellow'),
        red:    candidates.filter(c => c.tier === 'red')
    }), [candidates]);

    const renderCandidateCard = (candidate: CandidatePipeline) => (
        <DossierCard
            key={candidate.id}
            $isSelected={selectedCandidates.has(candidate.id)}
            $tier={candidate.tier}
        >
            <CardCheckbox
                type="checkbox"
                checked={selectedCandidates.has(candidate.id)}
                onChange={() => toggleCandidateSelection(candidate.id)}
            />

            <ScoreCircle $tier={candidate.tier}>
                {candidate.tier_score}
            </ScoreCircle>

            <CardBody>
                <CardTopRow>
                    <CandidateName>
                        {candidate.filename?.replace('.pdf', '') || 'Unknown'}
                    </CandidateName>
                    {getStars(candidate.star_rating)}
                    {candidate.give_them_a_chance && (
                        <ChanceBadge>Give a Chance</ChanceBadge>
                    )}
                </CardTopRow>
                <CardMetaRow>
                    <span>{candidate.years_of_experience}yr exp</span>
                    <span>{candidate.vehicle_status?.replace('_', ' ') || 'N/A'}</span>
                    <span>{candidate.certifications_found?.length || 0} cert(s)</span>
                </CardMetaRow>
                {candidate.ai_summary && (
                    <CardSummary>{candidate.ai_summary}</CardSummary>
                )}
            </CardBody>

            <CardActions>
                <ActionBtn
                    $color={C.green}
                    onClick={() => handleCandidateAction(candidate.id, 'approved')}
                    title="Approve"
                >
                    <Check size={13} />
                </ActionBtn>

                <MsgDropdownWrap>
                    <ActionBtn
                        $color={C.blue}
                        onClick={() => setMessageDropdownOpen(
                            messageDropdownOpen === candidate.id ? null : candidate.id
                        )}
                        title="Send Message"
                    >
                        <Mail size={13} />
                    </ActionBtn>
                    <MsgMenu $isOpen={messageDropdownOpen === candidate.id}>
                        <MsgMenuItem onClick={() => handleSendMessage(candidate.id, 'sms')}>
                            <Smartphone size={12} /> SMS
                        </MsgMenuItem>
                        <MsgMenuItem onClick={() => handleSendMessage(candidate.id, 'email')}>
                            <Mail size={12} /> Email
                        </MsgMenuItem>
                        <MsgMenuItem onClick={() => handleSendMessage(candidate.id, 'rejection_email')}>
                            <X size={12} /> Rejection
                        </MsgMenuItem>
                    </MsgMenu>
                </MsgDropdownWrap>

                <ActionBtn
                    $color={C.yellow}
                    onClick={() => handleCandidateAction(candidate.id, 'backup')}
                    title="Move to Backup"
                >
                    <ThumbsUp size={13} />
                </ActionBtn>

                <ActionBtn
                    $color={C.red}
                    onClick={() => handleCandidateAction(candidate.id, 'rejected')}
                    title="Reject"
                >
                    <X size={13} />
                </ActionBtn>
            </CardActions>
        </DossierCard>
    );

    return (
        <>
            <GlobalFonts />

            {showAddJobForm && (
                <AddJobForm
                    onClose={() => setShowAddJobForm(false)}
                    onJobCreated={() => { loadJobs(); setShowAddJobForm(false); }}
                />
            )}

            {editingJob && (
                <AddJobForm
                    editJob={editingJob}
                    onClose={() => setEditingJob(null)}
                    onJobCreated={() => { loadJobs(); setEditingJob(null); }}
                />
            )}

            <PageWrapper>
                {error && (
                    <ErrorToast>
                        <span>{error}</span>
                        <ErrorClose onClick={() => setError(null)}>×</ErrorClose>
                    </ErrorToast>
                )}

                {/* ── left rail ── */}
                <LeftRail isCollapsed={isLeftPanelCollapsed}>
                    <CollapseBtn onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}>
                        {isLeftPanelCollapsed ? '▶' : '◀'}
                    </CollapseBtn>

                    {!isLeftPanelCollapsed && (
                        <>
                            <RailBrand>
                                <BrandMark>Talos Ops</BrandMark>
                                <BrandSub>JOB MANAGEMENT CONSOLE</BrandSub>
                            </RailBrand>

                            <NavSection>
                                <NavBtn onClick={() => navigate('/dashboard')}>← Dashboard</NavBtn>
                                <NavBtn onClick={() => navigate('/batch-resume-analysis')}>← Resume Evaluator</NavBtn>
                            </NavSection>

                            <AddJobBtn onClick={() => setShowAddJobForm(true)}>
                                + Post New Job
                            </AddJobBtn>

                            <JobsScroll>
                                {loadingJobs ? (
                                    <LoadingText>LOADING JOBS...</LoadingText>
                                ) : jobs.length === 0 ? (
                                    <EmptyBox>No active positions</EmptyBox>
                                ) : (
                                    jobs.map(job => (
                                        <JobItem
                                            key={job.id}
                                            isActive={selectedJob?.id === job.id}
                                            onClick={() => navigate(`/jobs-management/${job.id}`)}
                                        >
                                            <JobItemTitle>{job.title}</JobItemTitle>
                                            <JobItemMeta>
                                                {job.location} · {job.required_years_experience}yr
                                            </JobItemMeta>
                                            <JobItemEditBtn
                                                onClick={e => { e.stopPropagation(); openEditForm(job); }}
                                                disabled={loadingEditJob === job.id}
                                            >
                                                {loadingEditJob === job.id ? '···' : 'edit'}
                                            </JobItemEditBtn>
                                        </JobItem>
                                    ))
                                )}
                            </JobsScroll>

                            <RailFooter>
                                <TalentPoolBtn onClick={() => navigate('/talent-pool-manager')}>
                                    Talent Pool →
                                </TalentPoolBtn>
                            </RailFooter>
                        </>
                    )}
                </LeftRail>

                {/* ── main stage ── */}
                <MainStage>
                    {selectedJob ? (
                        <>
                            <StageHeader>
                                <HeaderEyebrow>Active Position</HeaderEyebrow>
                                <HeaderTop>
                                    <div>
                                        <JobTitleDisplay>{selectedJob.title}</JobTitleDisplay>
                                        <TagRow style={{ marginTop: '0.7rem' }}>
                                            <Tag><MapPin size={10} /> {selectedJob.location}</Tag>
                                            <Tag><Briefcase size={10} /> {selectedJob.required_years_experience}+ yrs exp</Tag>
                                            <Tag><Car size={10} /> Vehicle {selectedJob.vehicle_required ? 'Required' : 'Not Required'}</Tag>
                                        </TagRow>
                                    </div>
                                    <HeaderActions>
                                        <AmberOutlineBtn
                                            onClick={() => copyApplyLink(selectedJob)}
                                            $copied={copiedJobId === selectedJob.id}
                                        >
                                            {copiedJobId === selectedJob.id
                                                ? <><Check size={13} /> Copied</>
                                                : <><Link size={13} /> Copy Apply Link</>
                                            }
                                        </AmberOutlineBtn>
                                        <IndeedLink
                                            href="https://employers.indeed.com/p/posting/orientation?jobId=697e7bd81fa87b7b4f80d2f4"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Post to Indeed
                                        </IndeedLink>
                                        <GhostBtn $danger onClick={() => deleteJob(selectedJob)}>
                                            <X size={13} /> Delete
                                        </GhostBtn>
                                    </HeaderActions>
                                </HeaderTop>
                            </StageHeader>

                            <PipelineBody>
                                <TabStrip>
                                    {(['all', 'approved', 'contacted', 'backup', 'rejected'] as PipelineTab[]).map(tab => (
                                        <TabItem
                                            key={tab}
                                            $isActive={activeTab === tab}
                                            onClick={() => setActiveTab(tab)}
                                        >
                                            {tab === 'all' ? `All (${candidates.length})` : tab}
                                        </TabItem>
                                    ))}
                                </TabStrip>

                                <ControlRow>
                                    <ControlLabel>Filter</ControlLabel>
                                    <FilterSelect value={filterTier} onChange={e => setFilterTier(e.target.value)}>
                                        <option value="all">All Tiers</option>
                                        <option value="green">Green</option>
                                        <option value="yellow">Yellow</option>
                                        <option value="red">Red</option>
                                    </FilterSelect>
                                    <ControlLabel style={{ marginLeft: '0.4rem' }}>Sort</ControlLabel>
                                    <FilterSelect value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                        <option value="tier_score">Score</option>
                                        <option value="years_of_experience">Experience</option>
                                        <option value="star_rating">Stars</option>
                                    </FilterSelect>
                                </ControlRow>

                                {selectedCandidates.size > 0 && (
                                    <BulkBar>
                                        <BulkCount>{selectedCandidates.size} selected</BulkCount>
                                        <BulkBtn onClick={() => handleBulkAction('approved')}>
                                            <Check size={12} /> Approve All
                                        </BulkBtn>
                                        <BulkBtn onClick={() => handleBulkAction('backup')}>
                                            <ThumbsUp size={12} /> Backup
                                        </BulkBtn>
                                        <BulkBtn onClick={() => handleBulkAction('rejected')}>
                                            <X size={12} /> Reject All
                                        </BulkBtn>
                                    </BulkBar>
                                )}

                                {loadingCandidates ? (
                                    <LoadingText>LOADING CANDIDATES...</LoadingText>
                                ) : activeTab === 'all' ? (
                                    <>
                                        {candidatesByTier.green.length > 0 && (
                                            <TierGroup>
                                                <TierLabelRow $tier="green">
                                                    <TierBar $tier="green" />
                                                    <TierName $tier="green">Green Tier</TierName>
                                                    <TierRange>80–100 pts</TierRange>
                                                    <TierCount>{candidatesByTier.green.length}</TierCount>
                                                </TierLabelRow>
                                                {candidatesByTier.green.map(renderCandidateCard)}
                                            </TierGroup>
                                        )}

                                        {candidatesByTier.yellow.length > 0 && (
                                            <TierGroup>
                                                <TierLabelRow $tier="yellow">
                                                    <TierBar $tier="yellow" />
                                                    <TierName $tier="yellow">Yellow Tier</TierName>
                                                    <TierRange>50–79 pts</TierRange>
                                                    <TierCount>{candidatesByTier.yellow.length}</TierCount>
                                                </TierLabelRow>
                                                {candidatesByTier.yellow.map(renderCandidateCard)}
                                            </TierGroup>
                                        )}

                                        {candidatesByTier.red.length > 0 && (
                                            <TierGroup>
                                                <TierLabelRow $tier="red">
                                                    <TierBar $tier="red" />
                                                    <TierName $tier="red">Red Tier</TierName>
                                                    <TierRange>0–49 pts</TierRange>
                                                    <TierCount>{candidatesByTier.red.length}</TierCount>
                                                </TierLabelRow>
                                                {candidatesByTier.red.map(renderCandidateCard)}
                                            </TierGroup>
                                        )}

                                        {candidates.length === 0 && (
                                            <EmptyBox>
                                                No candidates in pipeline<br />
                                                Upload resumes to begin evaluation
                                            </EmptyBox>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {candidates.map(renderCandidateCard)}
                                        {candidates.length === 0 && (
                                            <EmptyBox>No candidates in this category</EmptyBox>
                                        )}
                                    </>
                                )}
                            </PipelineBody>
                        </>
                    ) : (
                        <WelcomeState>
                            <WelcomeTitle>Job Management Console</WelcomeTitle>
                            <WelcomeSub>
                                Select a position from the sidebar or post a new job to begin.
                            </WelcomeSub>
                        </WelcomeState>
                    )}
                </MainStage>
            </PageWrapper>

            {selectedCandidateForContact && (
                <ContactRejectionModal
                    isOpen={contactModalOpen}
                    onClose={() => {
                        setContactModalOpen(false);
                        setSelectedCandidateForContact(null);
                    }}
                    candidate={selectedCandidateForContact}
                    initialMode={contactMode}
                    initialCommunicationType={contactCommunicationType}
                    onSuccess={handleContactSuccess}
                />
            )}
        </>
    );
};

export default JobsManagement;
