import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Star, CheckCircle, AlertCircle, XCircle, Check, ThumbsUp, X, MapPin, Briefcase, Car, Mail, Smartphone, Calendar, FileText, Link, Copy } from 'lucide-react';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';
import AddJobForm from './AddJobForm';
import ContactRejectionModal from './ContactRejectionModal';
import { extractCandidateName } from '../utils/templateHelpers';

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
        left: ${props => props.isCollapsed ? '-320px' : '0'};
        top: 0;
        bottom: 0;
        z-index: 1000;
        width: 300px;
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

const JobCard = styled.div<{ isActive: boolean }>`
    background: ${props => props.isActive ? 'rgba(74, 222, 128, 0.05)' : 'transparent'};
    border: 1px solid ${props => props.isActive ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 255, 255, 0.07)'};
    border-radius: 7px;
    padding: 0.875rem;
    padding-bottom: 2rem;
    margin-bottom: 0.625rem;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;

    &:hover {
        border-color: rgba(74, 222, 128, 0.25);
        background: rgba(74, 222, 128, 0.03);
    }
`;

const JobTitle = styled.h3`
    font-size: 0.9375rem;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 0.4rem;
    line-height: 1.3;
`;

const JobMeta = styled.div`
    font-size: 0.8rem;
    color: #555;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
`;

const CardEditButton = styled.button`
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    background: transparent;
    border: 1px solid rgba(74, 222, 128, 0.2);
    color: #4ade80;
    font-size: 0.675rem;
    font-weight: 600;
    padding: 0.18rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;

    &:hover {
        background: rgba(74, 222, 128, 0.08);
        border-color: rgba(74, 222, 128, 0.5);
    }
`;

const MainContent = styled.div`
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    min-width: 0;
`;

const ContentHeader = styled.div`
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
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

const JobDetailsCard = styled.div`
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.75rem;
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

const PipelineTabs = styled.div`
    display: flex;
    gap: 0;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
`;

const Tab = styled.button<{ isActive: boolean }>`
    background: transparent;
    color: ${props => props.isActive ? '#ffffff' : '#555'};
    border: none;
    border-bottom: 2px solid ${props => props.isActive ? '#4ade80' : 'transparent'};
    padding: 0.75rem 1.25rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-bottom: -1px;

    &:hover {
        color: #e0e0e0;
    }
`;

const FilterSortBar = styled.div`
    background: #0d0d0d;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 7px;
    padding: 0.875rem 1rem;
    margin-bottom: 1.25rem;
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

const CandidatesGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const TierSection = styled.div``;

const TierHeader = styled.div<{ tier: string }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
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

const CandidateCard = styled.div<{ isSelected: boolean }>`
    background: #0d0d0d;
    border: 1px solid ${props => props.isSelected ? 'rgba(74, 222, 128, 0.35)' : 'rgba(255, 255, 255, 0.07)'};
    border-radius: 8px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 0.625rem;
    transition: border-color 0.15s ease;

    &:last-child { margin-bottom: 0; }

    &:hover {
        border-color: ${props => props.isSelected ? 'rgba(74, 222, 128, 0.45)' : 'rgba(74, 222, 128, 0.2)'};
    }
`;

const CandidateHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.75rem;
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

const ActionButtons = styled.div`
    display: flex;
    gap: 0.4rem;
    margin-top: 1rem;
    padding-top: 0.875rem;
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

const Summary = styled.p`
    color: #666;
    line-height: 1.65;
    margin-bottom: 0.875rem;
    font-size: 0.9rem;
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
    const [selectedCandidateForContact, setSelectedCandidateForContact] = useState<{ pipelineId: number; name: string; position: string; } | null>(null);
    const [contactMode, setContactMode] = useState<'contact' | 'rejection'>('contact');
    const [contactCommunicationType, setContactCommunicationType] = useState<'email' | 'sms'>('email');
    const [copiedJobId, setCopiedJobId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingCandidates, setLoadingCandidates] = useState(false);

    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('new') === 'true') setShowAddJobForm(true);
    }, []);

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
            // Remove from list and clear selection immediately — don't wait for reload
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
                if (selectedJob) {
                    loadCandidates(selectedJob.id);
                }
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
                if (selectedJob) {
                    loadCandidates(selectedJob.id);
                }
                setSelectedCandidates(new Set());
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

        // Extract candidate name from filename
        const candidateName = extractCandidateName(candidate.filename || 'Candidate');

        // Set up modal state
        setSelectedCandidateForContact({
            pipelineId: candidatePipelineId,
            name: candidateName,
            position: selectedJob?.title || 'Position'
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

    const renderCandidateCard = (candidate: CandidatePipeline) => (
        <CandidateCard key={candidate.id} isSelected={selectedCandidates.has(candidate.id)}>
            <CandidateHeader>
                <CandidateInfo>
                    <CandidateName>
                        <Checkbox
                            type="checkbox"
                            checked={selectedCandidates.has(candidate.id)}
                            onChange={() => toggleCandidateSelection(candidate.id)}
                        />
                        {candidate.filename?.replace('.pdf', '') || 'Unknown'}
                        <StarRating>{getStars(candidate.star_rating)}</StarRating>
                        {candidate.give_them_a_chance && <Badge>Give Them a Chance</Badge>}
                    </CandidateName>
                </CandidateInfo>
                <Score tier={candidate.tier}>{candidate.tier_score}</Score>
            </CandidateHeader>

            <Summary>{candidate.ai_summary}</Summary>

            <MetaRow>
                <MetaItem><Calendar size={13} /> {candidate.years_of_experience} yrs exp</MetaItem>
                <MetaItem><Car size={13} /> {candidate.vehicle_status?.replace('_', ' ') || 'N/A'}</MetaItem>
                <MetaItem><FileText size={13} /> {candidate.certifications_found?.length || 0} certs</MetaItem>
            </MetaRow>

            <ActionButtons>
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
                <ActionIcon color="#fbbf24" onClick={() => handleCandidateAction(candidate.id, 'backup')} title="Move to Backup">
                    <ThumbsUp size={14} />
                </ActionIcon>
                <ActionIcon color="#ef4444" onClick={() => handleCandidateAction(candidate.id, 'rejected')} title="Reject">
                    <X size={14} />
                </ActionIcon>
            </ActionButtons>
        </CandidateCard>
    );

    return (
        <>
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
                                <PanelTitle>My Jobs</PanelTitle>
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
                                            onClick={() => navigate(`/jobs-management/${job.id}`)}
                                        >
                                            <JobTitle>{job.title}</JobTitle>
                                            <JobMeta>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {job.required_years_experience}+ years</span>
                                                {job.vehicle_required && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Car size={14} /> Vehicle Required</span>}
                                            </JobMeta>
                                            <CardEditButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditForm(job);
                                                }}
                                                disabled={loadingEditJob === job.id}
                                            >
                                                {loadingEditJob === job.id ? '...' : 'Edit'}
                                            </CardEditButton>
                                        </JobCard>
                                    ))
                                )}
                            </JobsList>
                        </>
                    )}
                </LeftPanel>

                <MainContent>
                    {selectedJob ? (
                        <>
                            <ContentHeader>
                                <ContentTitle>{selectedJob.title}</ContentTitle>
                                <ContentSubtitle>Candidate Pipeline</ContentSubtitle>
                            </ContentHeader>

                            <JobDetailsCard>
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
                                    <DetailRow>
                                        <DetailLabel>Description:</DetailLabel>
                                        <DetailValue>{selectedJob.description}</DetailValue>
                                    </DetailRow>
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
                            </JobDetailsCard>

                            <PipelineTabs>
                                <Tab isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                                    All ({candidates.length})
                                </Tab>
                                <Tab isActive={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>
                                    Approved
                                </Tab>
                                <Tab isActive={activeTab === 'contacted'} onClick={() => setActiveTab('contacted')}>
                                    Contacted
                                </Tab>
                                <Tab isActive={activeTab === 'backup'} onClick={() => setActiveTab('backup')}>
                                    Backups
                                </Tab>
                                <Tab isActive={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')}>
                                    Rejected
                                </Tab>
                            </PipelineTabs>

                            <FilterSortBar>
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

                            <CandidatesGrid>
                                {loadingCandidates ? (
                                    <LoadingSpinner>Loading candidates...</LoadingSpinner>
                                ) : activeTab === 'all' ? (
                                    <>
                                        {candidatesByTier.green.length > 0 && (
                                            <TierSection>
                                                <TierHeader tier="green">
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} /> Green Tier (80-100)</span>
                                                    <span>{candidatesByTier.green.length} candidates</span>
                                                </TierHeader>
                                                {candidatesByTier.green.map(renderCandidateCard)}
                                            </TierSection>
                                        )}
                                        {candidatesByTier.yellow.length > 0 && (
                                            <TierSection>
                                                <TierHeader tier="yellow">
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={14} /> Yellow Tier (50-79)</span>
                                                    <span>{candidatesByTier.yellow.length} candidates</span>
                                                </TierHeader>
                                                {candidatesByTier.yellow.map(renderCandidateCard)}
                                            </TierSection>
                                        )}
                                        {candidatesByTier.red.length > 0 && (
                                            <TierSection>
                                                <TierHeader tier="red">
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><XCircle size={14} /> Red Tier (0-49)</span>
                                                    <span>{candidatesByTier.red.length} candidates</span>
                                                </TierHeader>
                                                {candidatesByTier.red.map(renderCandidateCard)}
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
                                        {candidates.map(renderCandidateCard)}
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
