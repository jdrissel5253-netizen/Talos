import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Star, CheckCircle, AlertCircle, XCircle, Check, ThumbsUp, X, MapPin, Briefcase, Car, Mail, Smartphone, Calendar, FileText, Link, Copy, User, ExternalLink, LayoutGrid, LayoutList, Minimize2, ChevronDown, ZoomOut, ZoomIn, Settings, Edit2, Pause, Play, Trash2 } from 'lucide-react';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';
import AddJobForm from './AddJobForm';
import ContactRejectionModal from './ContactRejectionModal';
import ResumeFileModal from './ResumeFileModal';
import { extractCandidateName } from '../utils/templateHelpers';
import { renderJobDescription } from '../utils/renderJobDescription';

// Types
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
    full_name?: string | null;
    email?: string;
    overall_score: number;
    years_of_experience: number;
    certifications_found: string[];
    hiring_recommendation: string;
}

type PipelineTab = 'all' | 'approved' | 'contacted' | 'backup' | 'rejected';

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
`;

const LeftPanel = styled.div<{ isCollapsed: boolean }>`
    width: ${props => props.isCollapsed ? '52px' : '320px'};
    background: #0d0d0d;
    border-right: 1px solid rgba(255, 255, 255, 0.07);
    overflow-y: auto;
    transition: width 0.25s ease;
    position: relative;
    flex-shrink: 0;

    @media (max-width: 768px) {
        position: fixed;
        left: ${props => props.isCollapsed ? '-100vw' : '0'};
        top: 0;
        bottom: 0;
        z-index: 1000;
        width: min(300px, 85vw);
    }
`;

const CollapseButton = styled.button`
    position: absolute;
    top: 12px;
    right: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: #555;
    border: 1px solid rgba(255, 255, 255, 0.08);
    width: 28px;
    height: 28px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.75rem;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.09);
        color: #e0e0e0;
    }
`;

const PanelHeader = styled.div`
    padding: 3rem 1.25rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
`;

const PanelTitle = styled.h2`
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 1rem;
    letter-spacing: -0.01em;
`;

const BackButton = styled.button`
    background: rgba(255, 255, 255, 0.04);
    color: #a3a3a3;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.5rem 0.875rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8125rem;
    cursor: pointer;
    width: 100%;
    margin-bottom: 0.5rem;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #e0e0e0;
        border-color: rgba(255, 255, 255, 0.14);
    }
`;

const AddJobButton = styled.button`
    background: #4ade80;
    color: #000;
    border: none;
    padding: 0.5rem 0.875rem;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.8125rem;
    cursor: pointer;
    width: 100%;
    margin-bottom: 0.5rem;
    transition: background 0.15s ease;

    &:hover {
        background: #86efac;
    }
`;

const JobsList = styled.div`
    padding: 0.875rem;
`;

const JobCard = styled.div<{ isActive: boolean; compact?: boolean }>`
    background: ${props => props.isActive ? 'rgba(74, 222, 128, 0.05)' : 'transparent'};
    border: 1px solid ${props => props.isActive ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 255, 255, 0.07)'};
    border-radius: 7px;
    padding: ${p => p.compact ? '0.5rem 0.75rem' : '0.875rem'};
    padding-right: ${p => p.compact ? '2.2rem' : '0.875rem'};
    padding-bottom: ${p => p.compact ? '0.5rem' : '2rem'};
    margin-bottom: ${p => p.compact ? '0.35rem' : '0.625rem'};
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;

    &:hover {
        border-color: rgba(74, 222, 128, 0.25);
        background: rgba(74, 222, 128, 0.03);
    }
`;

const JobTitle = styled.h3<{ compact?: boolean }>`
    font-size: ${p => p.compact ? '0.8125rem' : '0.9375rem'};
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: ${p => p.compact ? '0' : '0.4rem'};
    line-height: 1.3;
    ${p => p.compact ? `
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    ` : ''}
`;

const JobMeta = styled.div`
    font-size: 0.8rem;
    color: #555;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
`;

const JobMenuWrapper = styled.div<{ compact?: boolean }>`
    position: absolute;
    ${p => p.compact ? `
        top: 50%;
        right: 0.5rem;
        transform: translateY(-50%);
    ` : `
        bottom: 0.5rem;
        right: 0.5rem;
    `}
`;

const GearButton = styled.button<{ compact?: boolean }>`
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #888;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    ${p => p.compact ? `
        width: 20px;
        height: 20px;
    ` : `
        width: 24px;
        height: 24px;
    `}

    &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.3);
        color: #ccc;
    }
`;

const JobMenuDropdown = styled.div<{ isOpen: boolean }>`
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    background: #1a1a1a;
    min-width: 160px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    border-radius: 7px;
    z-index: 20;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
`;

const JobMenuItem = styled.button<{ danger?: boolean }>`
    background: none;
    border: none;
    color: ${p => p.danger ? '#ef4444' : '#a3a3a3'};
    padding: 0.6rem 0.9rem;
    text-align: left;
    cursor: pointer;
    width: 100%;
    font-size: 0.8rem;
    font-family: inherit;
    white-space: nowrap;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 0.55rem;

    &:hover {
        background: ${p => p.danger ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.05)'};
        color: ${p => p.danger ? '#f87171' : '#e0e0e0'};
    }

    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
`;

const MainContent = styled.div<{ compact?: boolean }>`
    flex: 1;
    padding: ${p => p.compact ? '1.25rem 1.5rem' : '2rem'};
    overflow-y: auto;
    min-width: 0;
`;

const ContentHeader = styled.div<{ compact?: boolean }>`
    margin-bottom: ${p => p.compact ? '0.75rem' : '1.5rem'};
    padding-bottom: ${p => p.compact ? '0.75rem' : '1.5rem'};
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
`;

const ContentTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.2rem;
    letter-spacing: -0.02em;
`;

const ContentSubtitle = styled.p`
    color: #555;
    font-size: 0.875rem;
`;

const JobDetailsCard = styled.div<{ compact?: boolean }>`
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    padding: ${p => p.compact ? '0' : '1.5rem'};
    margin-bottom: ${p => p.compact ? '1rem' : '1.75rem'};
`;

const JobDetailsToggle = styled.button`
    width: 100%;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #4ade80;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease;

    &:hover {
        background: rgba(74, 222, 128, 0.04);
    }
`;

const JobDetailsBody = styled.div`
    padding: 1.25rem 1.5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const DetailRow = styled.div`
    margin-bottom: 0.75rem;
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const DetailLabel = styled.span`
    font-weight: 600;
    font-size: 0.8125rem;
    color: #4ade80;
    min-width: 160px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
    color: #a3a3a3;
    font-size: 0.9rem;
`;

const IndeedButton = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #2164f3;
    color: white;
    padding: 0.5rem 1.125rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8125rem;
    text-decoration: none;
    transition: background 0.15s ease;

    &:hover {
        background: #1a4fc9;
    }
`;

const CopyLinkButton = styled.button<{ copied?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: ${props => props.copied ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.05)'};
    color: ${props => props.copied ? '#4ade80' : '#a3a3a3'};
    border: 1px solid ${props => props.copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.09)'};
    padding: 0.5rem 1.125rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        background: ${props => props.copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.09)'};
    }
`;

const JobActionsRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const DeleteButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    color: #ef4444;
    padding: 0.5rem 1.125rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8125rem;
    border: 1px solid rgba(239, 68, 68, 0.3);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;

    &:hover {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.5);
    }
`;

const PipelineTabs = styled.div<{ compact?: boolean }>`
    display: flex;
    gap: 0;
    margin-bottom: ${p => p.compact ? '0.75rem' : '1.25rem'};
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
`;

const Tab = styled.button<{ isActive: boolean; compact?: boolean }>`
    background: transparent;
    color: ${props => props.isActive ? '#ffffff' : '#555'};
    border: none;
    border-bottom: 2px solid ${props => props.isActive ? '#4ade80' : 'transparent'};
    padding: ${p => p.compact ? '0.5rem 1rem' : '0.75rem 1.25rem'};
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: -1px;

    &:hover {
        color: #e0e0e0;
    }
`;

const FilterSortBar = styled.div<{ compact?: boolean }>`
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 7px;
    padding: ${p => p.compact ? '0.5rem 0.75rem' : '0.875rem 1rem'};
    margin-bottom: ${p => p.compact ? '0.75rem' : '1.25rem'};
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
`;

const Select = styled.select`
    background: #161616;
    color: #e0e0e0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.5rem 0.875rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.15s;

    &:focus {
        outline: none;
        border-color: rgba(74, 222, 128, 0.5);
    }
`;

const ViewToggleBtn = styled.button<{ active: boolean }>`
    background: ${p => p.active ? 'rgba(74,222,128,0.12)' : 'transparent'};
    border: 1px solid ${p => p.active ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'};
    color: ${p => p.active ? '#4ade80' : '#555'};
    padding: 0.4rem 0.5rem;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.15s ease;
    &:hover { border-color: rgba(74,222,128,0.3); color: #4ade80; }
`;

const CompactCandidateRow = styled.div<{ compact?: boolean }>`
    display: grid;
    grid-template-columns: 44px 1fr auto auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: ${p => p.compact ? '0.35rem 0.75rem' : '0.6rem 0.75rem'};
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.12s ease;
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255,255,255,0.02); }
`;

const CompactScore = styled.div<{ tier: string }>`
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 1rem;
    color: ${p => p.tier === 'green' ? '#4ade80' : p.tier === 'yellow' ? '#fbbf24' : '#ef4444'};
    text-align: center;
`;

const CompactName = styled.div`
    font-size: 0.82rem;
    font-weight: 600;
    color: #e0e0e0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const CompactMeta = styled.div`
    font-size: 0.72rem;
    color: #555;
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin-top: 0.15rem;
`;

const BulkActionsBar = styled.div`
    background: rgba(74, 222, 128, 0.04);
    border: 1px solid rgba(74, 222, 128, 0.15);
    border-radius: 7px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
    display: flex;
    gap: 0.75rem;
    align-items: center;
`;

const BulkActionButton = styled.button`
    background: rgba(255, 255, 255, 0.05);
    color: #a3a3a3;
    border: 1px solid rgba(255, 255, 255, 0.09);
    padding: 0.4rem 0.875rem;
    border-radius: 5px;
    font-weight: 600;
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    &:hover {
        background: rgba(74, 222, 128, 0.1);
        color: #4ade80;
        border-color: rgba(74, 222, 128, 0.3);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const CandidatesGrid = styled.div<{ compact?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${p => p.compact ? '1rem' : '1.5rem'};
`;

const TierSection = styled.div``;

const TierHeader = styled.div<{ tier: string; compact?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${p => p.compact ? '0.5rem 0.875rem' : '0.75rem 1rem'};
    margin-bottom: ${p => p.compact ? '0.5rem' : '0.75rem'};
    border-left: 3px solid ${props => {
        if (props.tier === 'green') return '#4ade80';
        if (props.tier === 'yellow') return '#fbbf24';
        return '#ef4444';
    }};
    background: ${props => {
        if (props.tier === 'green') return 'rgba(74,222,128,0.05)';
        if (props.tier === 'yellow') return 'rgba(251,191,36,0.05)';
        return 'rgba(239,68,68,0.05)';
    }};
    border-radius: 0 6px 6px 0;
    font-weight: 600;
    font-size: 0.8125rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${props => {
        if (props.tier === 'green') return '#4ade80';
        if (props.tier === 'yellow') return '#fbbf24';
        return '#ef4444';
    }};
`;

const CandidateCard = styled.div<{ isSelected: boolean; compact?: boolean }>`
    background: #0d0d0d;
    border: 1px solid ${props => props.isSelected ? 'rgba(74, 222, 128, 0.35)' : 'rgba(255, 255, 255, 0.07)'};
    border-radius: 8px;
    padding: ${p => p.compact ? '0.875rem 1.125rem' : '1.25rem 1.5rem'};
    margin-bottom: ${p => p.compact ? '0.5rem' : '0.625rem'};
    transition: border-color 0.15s ease;

    &:last-child { margin-bottom: 0; }

    &:hover {
        border-color: ${props => props.isSelected ? 'rgba(74, 222, 128, 0.45)' : 'rgba(74, 222, 128, 0.2)'};
    }
`;

const CandidateHeader = styled.div<{ compact?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: ${p => p.compact ? '0.4rem' : '0.75rem'};
`;

const CandidateInfo = styled.div`
    flex: 1;
`;

const CandidateName = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const StarRating = styled.span`
    color: #fbbf24;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
`;

const Score = styled.span<{ tier: string }>`
    font-size: 1.375rem;
    font-weight: 700;
    color: ${props => {
        if (props.tier === 'green') return '#4ade80';
        if (props.tier === 'yellow') return '#fbbf24';
        return '#ef4444';
    }};
`;

const Badge = styled.span`
    background: rgba(74, 222, 128, 0.1);
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, 0.25);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
`;

const ActionButtons = styled.div<{ compact?: boolean }>`
    display: flex;
    gap: 0.4rem;
    margin-top: ${p => p.compact ? '0.5rem' : '1rem'};
    padding-top: ${p => p.compact ? '0.5rem' : '0.875rem'};
    border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const ActionIcon = styled.button<{ color: string }>`
    background: transparent;
    color: ${props => props.color};
    border: 1px solid ${props => props.color}40;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    flex-shrink: 0;

    &:hover {
        background: ${props => props.color}18;
        border-color: ${props => props.color}80;
    }
`;

const Summary = styled.p<{ compact?: boolean }>`
    color: #666;
    line-height: 1.65;
    margin-bottom: ${p => p.compact ? '0.5rem' : '0.875rem'};
    font-size: 0.9rem;
    ${p => p.compact && `
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    `}
`;

const MetaRow = styled.div`
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    color: #555;
    align-items: center;
`;

const MetaItem = styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const ViewActions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
`;

const ViewBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: transparent;
    border: 1px solid #2a2a2a;
    color: #6e7d8e;
    font-size: 0.72rem;
    font-weight: 500;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.02em;

    &:hover {
        border-color: #4ade80;
        color: #4ade80;
    }
`;

const Checkbox = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #4ade80;
    flex-shrink: 0;
`;

const MessageDropdown = styled.div`
    position: relative;
    display: inline-block;
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: absolute;
    background: #1a1a1a;
    min-width: 170px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    border-radius: 7px;
    z-index: 10;
    left: 0;
    top: calc(100% + 6px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
`;

const DropdownItem = styled.button`
    background: none;
    border: none;
    color: #a3a3a3;
    padding: 0.65rem 1rem;
    text-align: left;
    cursor: pointer;
    width: 100%;
    font-size: 0.875rem;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #e0e0e0;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: #444;
`;

const ErrorBanner = styled.div`
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 7px;
    padding: 0.75rem 1rem;
    margin: 0.5rem;
    color: #fca5a5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
`;

const ErrorDismiss = styled.button`
    background: none;
    border: none;
    color: #fca5a5;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0 0.25rem;
    &:hover { color: #ef4444; }
`;

const LoadingSpinner = styled.div`
    text-align: center;
    padding: 2rem;
    color: #444;
    font-size: 0.875rem;
`;


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
    const [selectedCandidateForContact, setSelectedCandidateForContact] = useState<{ pipelineId: number; name: string; position: string; email?: string; } | null>(null);
    const [contactMode, setContactMode] = useState<'contact' | 'rejection'>('contact');
    const [contactCommunicationType, setContactCommunicationType] = useState<'email' | 'sms'>('email');
    const [copiedJobId, setCopiedJobId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [resumeModal, setResumeModal] = useState<{ candidateId: number; filename: string } | null>(null);
    const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
    const [schedulingLink, setSchedulingLink] = useState('');
    const [compactPage, setCompactPage] = useState(() => localStorage.getItem('jobsManagementCompactPage') === 'true');
    const [jobDetailsExpanded, setJobDetailsExpanded] = useState(false);
    const [compactJobsList, setCompactJobsList] = useState(() => localStorage.getItem('jobsManagementCompactJobsList') === 'true');
    const [smallDescription, setSmallDescription] = useState(() => localStorage.getItem('jobsManagementSmallDescription') === 'true');
    const [openJobMenuId, setOpenJobMenuId] = useState<number | null>(null);
    const [togglingJobStatus, setTogglingJobStatus] = useState<number | null>(null);
    const jobMenuRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('new') === 'true') setShowAddJobForm(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('jobsManagementCompactPage', String(compactPage));
    }, [compactPage]);

    useEffect(() => {
        localStorage.setItem('jobsManagementCompactJobsList', String(compactJobsList));
    }, [compactJobsList]);

    useEffect(() => {
        localStorage.setItem('jobsManagementSmallDescription', String(smallDescription));
    }, [smallDescription]);

    // Close the job actions menu when clicking outside of it
    useEffect(() => {
        if (openJobMenuId === null) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (jobMenuRef.current && !jobMenuRef.current.contains(e.target as Node)) {
                setOpenJobMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openJobMenuId]);

    const openSchedulingLink = (candidateName: string) => {
        if (!schedulingLink) return;
        try {
            const url = new URL(schedulingLink);
            url.searchParams.set('name', candidateName);
            window.open(url.toString(), '_blank');
        } catch {
            window.open(schedulingLink, '_blank');
        }
    };

    const copyApplyLink = (job: Job) => {
        const baseUrl = window.location.origin;
        const applyUrl = `${baseUrl}/apply?job=${job.id}&title=${encodeURIComponent(job.title)}`;
        navigator.clipboard.writeText(applyUrl).then(() => {
            setCopiedJobId(job.id);
            setTimeout(() => setCopiedJobId(null), 2000);
        });
    };

    // Load jobs on mount
    useEffect(() => {
        loadJobs();
        fetch(`${config.apiUrl}/api/auth/me`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(d => { if (d.status === 'success') setSchedulingLink(d.data.schedulingLink || ''); })
            .catch(() => {});
    }, []);

    // Sync selectedJob when URL param changes (e.g. browser back/forward)
    useEffect(() => {
        if (!jobId || jobs.length === 0) return;
        const id = parseInt(jobId, 10);
        const match = jobs.find(j => j.id === id);
        if (match && match.id !== selectedJob?.id) {
            setSelectedJob(match);
        }
    }, [jobId, jobs]);

    // Load candidates when job is selected (debounced with request cancellation)
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
            // Remove from list immediately — don't wait for reload
            setJobs(prev => prev.filter(j => j.id !== job.id));
            if (selectedJob?.id === job.id) {
                setSelectedJob(null);
                navigate('/jobs-management', { replace: true });
            }
        } catch {
            alert('Failed to delete job. Please try again.');
        }
    };

    const toggleJobStatus = async (job: Job) => {
        const newStatus = job.status === 'active' ? 'inactive' : 'active';
        setTogglingJobStatus(job.id);
        try {
            const response = await fetch(`${config.apiUrl}/api/jobs/${job.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                alert('Failed to update job status. Please try again.');
                return;
            }
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
            if (selectedJob?.id === job.id) {
                setSelectedJob(prev => prev ? { ...prev, status: newStatus } : prev);
            }
        } catch {
            alert('Failed to update job status. Please try again.');
        } finally {
            setTogglingJobStatus(null);
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
            if (activeTab !== 'all') {
                params.append('pipeline_status', activeTab);
            }
            if (filterTier !== 'all') {
                params.append('tier', filterTier);
            }
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
                // Remove the candidate from the current view immediately so the
                // action (e.g. Reject/Approve/Backup) gives visible feedback,
                // instead of leaving them in place with the same action buttons.
                setCandidates(prev => prev.filter(c => c.id !== candidatePipelineId));
                setSelectedCandidates(prev => {
                    const next = new Set(prev);
                    next.delete(candidatePipelineId);
                    return next;
                });
            } else {
                setError('Failed to update candidate status. Please try again.');
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
                const updatedIds = selectedCandidates;
                setCandidates(prev => prev.filter(c => !updatedIds.has(c.id)));
                setSelectedCandidates(new Set());
            } else {
                setError('Failed to update candidates. Please try again.');
            }
        } catch (error) {
            console.error('Error bulk updating:', error);
            setError('Failed to update candidates. Please try again.');
        }
    };

    const handleSendMessage = (candidatePipelineId: number, messageType: string) => {
        // Find the candidate
        const candidate = candidates.find(c => c.id === candidatePipelineId);
        if (!candidate) return;

        // Use the AI-extracted name when available, fall back to the filename
        const candidateName = candidate.full_name || extractCandidateName(candidate.filename || 'Candidate');

        // Set up modal state
        setSelectedCandidateForContact({
            pipelineId: candidatePipelineId,
            name: candidateName,
            position: selectedJob?.title || 'Position',
            email: candidate.email
        });

        // Determine mode and communication type
        if (messageType === 'rejection_email') {
            setContactMode('rejection');
            setContactCommunicationType('email');
        } else {
            setContactMode('contact');
            setContactCommunicationType(messageType === 'sms' ? 'sms' : 'email');
        }

        // Close dropdown and open modal
        setMessageDropdownOpen(null);
        setContactModalOpen(true);
    };

    const handleContactSuccess = () => {
        setContactModalOpen(false);
        setSelectedCandidateForContact(null);
        // Reload candidates to reflect updated status
        if (selectedJob) {
            loadCandidates(selectedJob.id);
        }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        fill={i < fullStars ? "#fbbf24" : "none"}
                        color="#fbbf24"
                        className={i === fullStars && halfStar ? 'half-star' : ''}
                    />
                ))}
            </div>
        );
    };

    const candidatesByTier = useMemo(() => ({
        green: candidates.filter(c => c.tier === 'green'),
        yellow: candidates.filter(c => c.tier === 'yellow'),
        red: candidates.filter(c => c.tier === 'red')
    }), [candidates]);

    const renderCompactCandidate = (candidate: CandidatePipeline) => (
        <CompactCandidateRow key={`compact-${candidate.id}`} compact={compactPage}>
            <CompactScore tier={candidate.tier}>{candidate.tier_score}</CompactScore>
            <div style={{ overflow: 'hidden' }}>
                <CompactName>{candidate.full_name || extractCandidateName(candidate.filename || 'Unknown')}</CompactName>
                <CompactMeta>
                    <span><Calendar size={11} /> {candidate.years_of_experience}yr</span>
                    <span><FileText size={11} /> {candidate.certifications_found?.length || 0} certs</span>
                    <span style={{ color: '#333' }}>{candidate.pipeline_status}</span>
                </CompactMeta>
            </div>
            <ActionIcon color="#a3a3a3" onClick={() => navigate(`/candidates/${candidate.id}`, { state: { from: '/jobs-management' } })} title="Profile">
                <User size={13} />
            </ActionIcon>
            <ActionIcon color="#4ade80" onClick={() => handleCandidateAction(candidate.id, 'approved')} title="Approve">
                <Check size={13} />
            </ActionIcon>
            {schedulingLink && (
                <ActionIcon color="#a78bfa" onClick={() => openSchedulingLink(candidate.full_name || extractCandidateName(candidate.filename || ''))} title="Schedule Interview">
                    <Calendar size={13} />
                </ActionIcon>
            )}
            <ActionIcon color="#ef4444" onClick={() => handleCandidateAction(candidate.id, 'rejected')} title="Reject">
                <X size={13} />
            </ActionIcon>
        </CompactCandidateRow>
    );

    const renderCandidateCard = (candidate: CandidatePipeline) => (
        <CandidateCard key={`card-${candidate.id}`} isSelected={selectedCandidates.has(candidate.id)} compact={compactPage}>
            <CandidateHeader compact={compactPage}>
                <CandidateInfo>
                    <CandidateName>
                        <Checkbox
                            type="checkbox"
                            checked={selectedCandidates.has(candidate.id)}
                            onChange={() => toggleCandidateSelection(candidate.id)}
                        />
                        {candidate.full_name || extractCandidateName(candidate.filename || 'Unknown')}
                        <StarRating>{getStars(candidate.star_rating)}</StarRating>
                        {candidate.give_them_a_chance && <Badge>Give Them a Chance</Badge>}
                    </CandidateName>
                </CandidateInfo>
                <Score tier={candidate.tier}>{candidate.tier_score}</Score>
            </CandidateHeader>

            <Summary compact={compactPage}>{candidate.ai_summary}</Summary>

            <MetaRow>
                <MetaItem><Calendar size={13} /> {candidate.years_of_experience} yrs exp</MetaItem>
                <MetaItem><Car size={13} /> {candidate.vehicle_status?.replace('_', ' ') || 'N/A'}</MetaItem>
                <MetaItem><FileText size={13} /> {candidate.certifications_found?.length || 0} certs</MetaItem>
            </MetaRow>

            <ViewActions>
                <ViewBtn onClick={() => setResumeModal({ candidateId: candidate.candidate_id, filename: candidate.filename })}>
                    <FileText size={12} /> Resume
                </ViewBtn>
                <ViewBtn onClick={() => navigate(`/candidates/${candidate.id}`, { state: { from: '/jobs-management' } })}>
                    <User size={12} /> Profile
                </ViewBtn>
            </ViewActions>

            <ActionButtons compact={compactPage}>
                <ActionIcon color="#4ade80" onClick={() => handleCandidateAction(candidate.id, 'approved')} title="Approve">
                    <Check size={14} />
                </ActionIcon>
                <MessageDropdown>
                    <ActionIcon
                        color="#3b82f6"
                        onClick={() => setMessageDropdownOpen(messageDropdownOpen === candidate.id ? null : candidate.id)}
                        title="Send Message"
                    >
                        <Mail size={14} />
                    </ActionIcon>
                    <DropdownContent isOpen={messageDropdownOpen === candidate.id}>
                        <DropdownItem onClick={() => handleSendMessage(candidate.id, 'sms')}>
                            <Smartphone size={13} /> SMS
                        </DropdownItem>
                        <DropdownItem onClick={() => handleSendMessage(candidate.id, 'email')}>
                            <Mail size={13} /> Email
                        </DropdownItem>
                        <DropdownItem onClick={() => handleSendMessage(candidate.id, 'rejection_email')}>
                            <X size={13} /> Rejection
                        </DropdownItem>
                    </DropdownContent>
                </MessageDropdown>
                {schedulingLink && (
                    <ActionIcon color="#a78bfa" onClick={() => openSchedulingLink(candidate.full_name || extractCandidateName(candidate.filename || ''))} title="Schedule Interview">
                        <Calendar size={14} />
                    </ActionIcon>
                )}
                <ActionIcon color="#fbbf24" onClick={() => handleCandidateAction(candidate.id, 'backup')} title="Move to Backup">
                    <ThumbsUp size={14} />
                </ActionIcon>
                <ActionIcon color="#ef4444" onClick={() => handleCandidateAction(candidate.id, 'rejected')} title="Reject">
                    <X size={14} />
                </ActionIcon>
            </ActionButtons>
        </CandidateCard>
    );

    const JobDetailsWrapper = compactPage ? JobDetailsBody : React.Fragment;

    return (
        <>
            <ResumeFileModal
                isOpen={resumeModal !== null}
                onClose={() => setResumeModal(null)}
                candidateId={resumeModal?.candidateId ?? null}
                filename={resumeModal?.filename ?? ''}
            />

            {showAddJobForm && (
                <AddJobForm
                    onClose={() => setShowAddJobForm(false)}
                    onJobCreated={() => {
                        loadJobs();
                        setShowAddJobForm(false);
                    }}
                />
            )}

            {editingJob && (
                <AddJobForm
                    editJob={editingJob}
                    onClose={() => setEditingJob(null)}
                    onJobCreated={() => {
                        loadJobs();
                        setEditingJob(null);
                    }}
                />
            )}

            <PageContainer>
                {error && (
                    <ErrorBanner>
                        <span>{error}</span>
                        <ErrorDismiss onClick={() => setError(null)}>×</ErrorDismiss>
                    </ErrorBanner>
                )}
                <LeftPanel isCollapsed={isLeftPanelCollapsed}>
                    <CollapseButton onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}>
                        {isLeftPanelCollapsed ? '▶' : '◀'}
                    </CollapseButton>

                    {!isLeftPanelCollapsed && (
                        <>
                            <PanelHeader>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <PanelTitle style={{ marginBottom: 0 }}>My Jobs</PanelTitle>
                                    <ViewToggleBtn
                                        active={compactJobsList}
                                        onClick={() => setCompactJobsList(!compactJobsList)}
                                        title={compactJobsList ? 'Switch to full job cards' : 'Switch to compact job cards'}
                                    >
                                        <Minimize2 size={14} />
                                    </ViewToggleBtn>
                                </div>
                                <BackButton onClick={() => navigate('/dashboard')}>
                                    ← Dashboard
                                </BackButton>
                                <BackButton onClick={() => navigate('/batch-resume-analysis')}>
                                    ← Back to Resume Evaluator
                                </BackButton>
                                <AddJobButton onClick={() => setShowAddJobForm(true)}>
                                    + Add New Job
                                </AddJobButton>
                                <BackButton onClick={() => navigate('/talent-pool-manager')}>
                                    View Talent Pool →
                                </BackButton>
                            </PanelHeader>

                            <JobsList>
                                {loadingJobs ? (
                                    <LoadingSpinner>Loading jobs...</LoadingSpinner>
                                ) : jobs.length === 0 ? (
                                    <EmptyState>
                                        <p>No jobs yet.</p>
                                        <p>Click "Add New Job" to get started!</p>
                                    </EmptyState>
                                ) : (
                                    jobs.map(job => (
                                        <JobCard
                                            key={job.id}
                                            isActive={selectedJob?.id === job.id}
                                            compact={compactJobsList}
                                            onClick={() => navigate(`/jobs-management/${job.id}`)}
                                        >
                                            <JobTitle compact={compactJobsList}>{job.title}</JobTitle>
                                            {!compactJobsList && (
                                                <JobMeta>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {job.required_years_experience}+ years</span>
                                                    {job.vehicle_required && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Car size={14} /> Vehicle Required</span>}
                                                </JobMeta>
                                            )}
                                            <JobMenuWrapper
                                                compact={compactJobsList}
                                                ref={openJobMenuId === job.id ? jobMenuRef : undefined}
                                            >
                                                <GearButton
                                                    compact={compactJobsList}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenJobMenuId(openJobMenuId === job.id ? null : job.id);
                                                    }}
                                                    title="Job actions"
                                                >
                                                    <Settings size={compactJobsList ? 12 : 14} />
                                                </GearButton>
                                                <JobMenuDropdown isOpen={openJobMenuId === job.id}>
                                                    <JobMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenJobMenuId(null);
                                                            openEditForm(job);
                                                        }}
                                                        disabled={loadingEditJob === job.id}
                                                    >
                                                        <Edit2 size={14} /> {loadingEditJob === job.id ? 'Loading...' : 'Edit'}
                                                    </JobMenuItem>
                                                    <JobMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenJobMenuId(null);
                                                            toggleJobStatus(job);
                                                        }}
                                                        disabled={togglingJobStatus === job.id}
                                                    >
                                                        {job.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                                                        {togglingJobStatus === job.id ? 'Updating...' : (job.status === 'active' ? 'Deactivate' : 'Activate')}
                                                    </JobMenuItem>
                                                    <JobMenuItem
                                                        danger
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenJobMenuId(null);
                                                            deleteJob(job);
                                                        }}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </JobMenuItem>
                                                </JobMenuDropdown>
                                            </JobMenuWrapper>
                                        </JobCard>
                                    ))
                                )}
                            </JobsList>
                        </>
                    )}
                </LeftPanel>

                <MainContent compact={compactPage}>
                    {selectedJob ? (
                        <>
                            <ContentHeader compact={compactPage}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <ContentTitle>{selectedJob.title}</ContentTitle>
                                        <ContentSubtitle>Candidate Pipeline</ContentSubtitle>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                        {candidates.length > 0 && (
                                            <>
                                                <ViewToggleBtn active={viewMode === 'cards'} onClick={() => setViewMode('cards')} title="Card view">
                                                    <LayoutGrid size={16} />
                                                </ViewToggleBtn>
                                                <ViewToggleBtn active={viewMode === 'compact'} onClick={() => setViewMode('compact')} title="Compact view">
                                                    <LayoutList size={16} />
                                                </ViewToggleBtn>
                                            </>
                                        )}
                                        <ViewToggleBtn
                                            active={compactPage}
                                            onClick={() => setCompactPage(!compactPage)}
                                            title={compactPage ? 'Switch to full page view' : 'Switch to compact page view'}
                                        >
                                            <Minimize2 size={16} />
                                        </ViewToggleBtn>
                                        <ViewToggleBtn
                                            active={smallDescription}
                                            onClick={() => setSmallDescription(!smallDescription)}
                                            title={smallDescription ? 'Restore job description text size' : 'Shrink job description text'}
                                        >
                                            {smallDescription ? <ZoomIn size={16} /> : <ZoomOut size={16} />}
                                        </ViewToggleBtn>
                                    </div>
                                </div>
                            </ContentHeader>

                            <JobDetailsCard compact={compactPage}>
                                {compactPage && (
                                    <JobDetailsToggle onClick={() => setJobDetailsExpanded(!jobDetailsExpanded)}>
                                        <span>Job Details &amp; Application Link</span>
                                        <ChevronDown size={16} style={{ transform: jobDetailsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                                    </JobDetailsToggle>
                                )}
                                {(!compactPage || jobDetailsExpanded) && (
                                <JobDetailsWrapper>
                                <h3 style={{ color: '#4ade80', marginBottom: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Application Link</h3>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <a
                                        href={`${window.location.origin}/jobs/${selectedJob.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            color: '#4ade80',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            borderBottom: '1px solid rgba(74,222,128,0.3)',
                                            paddingBottom: '0.1rem',
                                            transition: 'border-color 0.15s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#4ade80')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(74,222,128,0.3)')}
                                    >
                                        <ExternalLink size={13} />
                                        View published job posting
                                    </a>
                                </div>
                                <h3 style={{ color: '#4ade80', marginBottom: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Job Details</h3>
                                <DetailRow>
                                    <DetailLabel>Location:</DetailLabel>
                                    <DetailValue>{selectedJob.location}</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Required Experience:</DetailLabel>
                                    <DetailValue>{selectedJob.required_years_experience}+ years</DetailValue>
                                </DetailRow>
                                <DetailRow>
                                    <DetailLabel>Vehicle Required:</DetailLabel>
                                    <DetailValue>{selectedJob.vehicle_required ? 'Yes' : 'No'}</DetailValue>
                                </DetailRow>
                                {selectedJob.description && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1e1e1e' }}>
                                        {renderJobDescription(selectedJob.description, smallDescription)}
                                    </div>
                                )}
                                <JobActionsRow>
                                    <CopyLinkButton
                                        onClick={() => copyApplyLink(selectedJob)}
                                        copied={copiedJobId === selectedJob.id}
                                    >
                                        {copiedJobId === selectedJob.id ? (
                                            <>
                                                <Check size={18} /> Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Link size={18} /> Copy Apply Link
                                            </>
                                        )}
                                    </CopyLinkButton>
                                    <IndeedButton
                                        href="https://employers.indeed.com/p/posting/orientation?jobId=697e7bd81fa87b7b4f80d2f4"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Post to Indeed
                                    </IndeedButton>
                                    <DeleteButton onClick={() => deleteJob(selectedJob)}>
                                        <X size={16} /> Delete Job
                                    </DeleteButton>
                                </JobActionsRow>
                                </JobDetailsWrapper>
                                )}
                            </JobDetailsCard>

                            <PipelineTabs compact={compactPage}>
                                <Tab compact={compactPage} isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                                    All ({candidates.length})
                                </Tab>
                                <Tab compact={compactPage} isActive={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>
                                    Approved
                                </Tab>
                                <Tab compact={compactPage} isActive={activeTab === 'contacted'} onClick={() => setActiveTab('contacted')}>
                                    Contacted
                                </Tab>
                                <Tab compact={compactPage} isActive={activeTab === 'backup'} onClick={() => setActiveTab('backup')}>
                                    Backups
                                </Tab>
                                <Tab compact={compactPage} isActive={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')}>
                                    Rejected
                                </Tab>
                            </PipelineTabs>

                            <FilterSortBar compact={compactPage}>
                                <span style={{ color: '#555', fontWeight: 600, fontSize: '0.8125rem' }}>Filter & Sort:</span>
                                <Select value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
                                    <option value="all">All Tiers</option>
                                    <option value="green">Green Tier</option>
                                    <option value="yellow">Yellow Tier</option>
                                    <option value="red">Red Tier</option>
                                </Select>
                                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="tier_score">Sort by Score</option>
                                    <option value="years_of_experience">Sort by Experience</option>
                                    <option value="star_rating">Sort by Star Rating</option>
                                </Select>
                            </FilterSortBar>

                            {selectedCandidates.size > 0 && (
                                <BulkActionsBar>
                                    <span style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.8125rem' }}>
                                        {selectedCandidates.size} selected
                                    </span>
                                    <BulkActionButton onClick={() => handleBulkAction('approved')}>
                                        <Check size={13} /> Approve All
                                    </BulkActionButton>
                                    <BulkActionButton onClick={() => handleBulkAction('backup')}>
                                        <ThumbsUp size={13} /> Move to Backup
                                    </BulkActionButton>
                                    <BulkActionButton onClick={() => handleBulkAction('rejected')}>
                                        <X size={13} /> Reject All
                                    </BulkActionButton>
                                </BulkActionsBar>
                            )}

                            <CandidatesGrid compact={compactPage}>
                                {loadingCandidates ? (
                                    <LoadingSpinner>Loading candidates...</LoadingSpinner>
                                ) : activeTab === 'all' ? (
                                    <>
                                        {candidatesByTier.green.length > 0 && (
                                            <TierSection>
                                                <TierHeader tier="green" compact={compactPage}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} /> Green Tier (80-100)</span>
                                                    <span>{candidatesByTier.green.length} candidates</span>
                                                </TierHeader>
                                                {candidatesByTier.green.map(viewMode === 'compact' ? renderCompactCandidate : renderCandidateCard)}
                                            </TierSection>
                                        )}
                                        {candidatesByTier.yellow.length > 0 && (
                                            <TierSection>
                                                <TierHeader tier="yellow" compact={compactPage}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={14} /> Yellow Tier (50-79)</span>
                                                    <span>{candidatesByTier.yellow.length} candidates</span>
                                                </TierHeader>
                                                {candidatesByTier.yellow.map(viewMode === 'compact' ? renderCompactCandidate : renderCandidateCard)}
                                            </TierSection>
                                        )}
                                        {candidatesByTier.red.length > 0 && (
                                            <TierSection>
                                                <TierHeader tier="red" compact={compactPage}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><XCircle size={14} /> Red Tier (0-49)</span>
                                                    <span>{candidatesByTier.red.length} candidates</span>
                                                </TierHeader>
                                                {candidatesByTier.red.map(viewMode === 'compact' ? renderCompactCandidate : renderCandidateCard)}
                                            </TierSection>
                                        )}
                                        {candidates.length === 0 && (
                                            <EmptyState>
                                                <h3>No candidates yet</h3>
                                                <p>Upload resumes to start building your candidate pipeline.</p>
                                            </EmptyState>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {candidates.map(viewMode === 'compact' ? renderCompactCandidate : renderCandidateCard)}
                                        {candidates.length === 0 && (
                                            <EmptyState>
                                                <h3>No candidates in this category</h3>
                                            </EmptyState>
                                        )}
                                    </>
                                )}
                            </CandidatesGrid>
                        </>
                    ) : (
                        <EmptyState>
                            <h2>Welcome to Jobs Management</h2>
                            <p>Create a job to start managing your candidate pipeline!</p>
                        </EmptyState>
                    )}
                </MainContent>
            </PageContainer>

            {/* Contact/Rejection Modal */}
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
