import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import AddJobForm from './AddJobForm';

// Types
interface Job {
    id: number;
    title: string;
    description: string;
    location: string;
    required_years_experience: number;
    vehicle_required: boolean;
    position_type: string;
    salary_min?: number;
    salary_max?: number;
    status: string;
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
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    display: flex;
`;

const LeftPanel = styled.div<{ isCollapsed: boolean }>`
    width: ${props => props.isCollapsed ? '60px' : '350px'};
    background: #1a1a1a;
    border-right: 2px solid #333333;
    overflow-y: auto;
    transition: width 0.3s ease;
    position: relative;

    @media (max-width: 768px) {
        position: fixed;
        left: ${props => props.isCollapsed ? '-350px' : '0'};
        top: 0;
        bottom: 0;
        z-index: 1000;
        width: 300px;
    }
`;

const CollapseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: #4ade80;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    z-index: 10;

    &:hover {
        background: #3bc76a;
    }
`;

const PanelHeader = styled.div`
    padding: 2rem 1.5rem 1rem;
    border-bottom: 1px solid #333333;
`;

const PanelTitle = styled.h2`
    font-size: 1.5rem;
    color: #4ade80;
    margin-bottom: 1rem;
`;

const BackButton = styled.button`
    background: #333333;
    color: #e0e0e0;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    margin-bottom: 0.75rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: #4ade80;
        color: white;
        transform: translateY(-1px);
    }
`;

const AddJobButton = styled.button`
    background: #4ade80;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s ease;

    &:hover {
        background: #3bc76a;
        transform: translateY(-1px);
    }
`;

const JobsList = styled.div`
    padding: 1rem;
`;

const JobCard = styled.div<{ isActive: boolean }>`
    background: ${props => props.isActive ? '#000000' : '#0f0f0f'};
    border: 2px solid ${props => props.isActive ? '#4ade80' : '#333333'};
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #4ade80;
        transform: translateX(4px);
    }
`;

const JobTitle = styled.h3`
    font-size: 1rem;
    color: #e0e0e0;
    margin-bottom: 0.5rem;
`;

const JobMeta = styled.div`
    font-size: 0.875rem;
    color: #999;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const MainContent = styled.div`
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
`;

const ContentHeader = styled.div`
    margin-bottom: 2rem;
`;

const ContentTitle = styled.h1`
    font-size: 2rem;
    color: #4ade80;
    margin-bottom: 0.5rem;
`;

const ContentSubtitle = styled.p`
    color: #e0e0e0;
    font-size: 1.125rem;
`;

const JobDetailsCard = styled.div`
    background: #1a1a1a;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
`;

const DetailRow = styled.div`
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const DetailLabel = styled.span`
    font-weight: 600;
    color: #4ade80;
    min-width: 180px;
`;

const DetailValue = styled.span`
    color: #e0e0e0;
`;

const PipelineTabs = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
`;

const Tab = styled.button<{ isActive: boolean }>`
    background: ${props => props.isActive ? '#4ade80' : '#1a1a1a'};
    color: ${props => props.isActive ? 'white' : '#e0e0e0'};
    border: 2px solid ${props => props.isActive ? '#4ade80' : '#333333'};
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #4ade80;
    }
`;

const FilterSortBar = styled.div`
    background: #1a1a1a;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
`;

const Select = styled.select`
    background: #000000;
    color: #e0e0e0;
    border: 2px solid #333333;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #4ade80;
    }
`;

const BulkActionsBar = styled.div`
    background: #1a1a1a;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
`;

const BulkActionButton = styled.button`
    background: #333333;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #4ade80;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const CandidatesGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const TierSection = styled.div`
    margin-bottom: 2rem;
`;

const TierHeader = styled.div<{ tier: string }>`
    background: ${props => {
        if (props.tier === 'green') return '#4ade80';
        if (props.tier === 'yellow') return '#fbbf24';
        return '#ef4444';
    }};
    color: white;
    padding: 1rem;
    border-radius: 8px 8px 0 0;
    font-weight: 700;
    font-size: 1.125rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CandidateCard = styled.div<{ isSelected: boolean }>`
    background: #1a1a1a;
    border: 2px solid ${props => props.isSelected ? '#4ade80' : '#333333'};
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.2s ease;

    &:hover {
        border-color: #4ade80;
    }
`;

const CandidateHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
`;

const CandidateInfo = styled.div`
    flex: 1;
`;

const CandidateName = styled.h3`
    font-size: 1.125rem;
    color: #e0e0e0;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StarRating = styled.span`
    color: #fbbf24;
    font-size: 1rem;
`;

const Score = styled.span<{ tier: string }>`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${props => {
        if (props.tier === 'green') return '#4ade80';
        if (props.tier === 'yellow') return '#fbbf24';
        return '#ef4444';
    }};
`;

const Badge = styled.span`
    background: #4ade80;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionIcon = styled.button<{ color: string }>`
    background: ${props => props.color};
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.1);
    }
`;

const Summary = styled.p`
    color: #e0e0e0;
    line-height: 1.6;
    margin-bottom: 1rem;
    font-size: 0.9375rem;
`;

const MetaRow = styled.div`
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    font-size: 0.875rem;
    color: #999;
`;

const Checkbox = styled.input`
    width: 20px;
    height: 20px;
    cursor: pointer;
    margin-right: 1rem;
`;

const MessageDropdown = styled.div`
    position: relative;
    display: inline-block;
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: absolute;
    background: #1a1a1a;
    min-width: 200px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    z-index: 1;
    right: 0;
    top: 100%;
    margin-top: 0.5rem;
    border: 2px solid #333333;
`;

const DropdownItem = styled.button`
    background: none;
    border: none;
    color: #e0e0e0;
    padding: 0.75rem 1rem;
    text-align: left;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s ease;

    &:hover {
        background: #333333;
    }

    &:first-child {
        border-radius: 4px 4px 0 0;
    }

    &:last-child {
        border-radius: 0 0 4px 4px;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: #999;
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

    const navigate = useNavigate();

    // Load jobs on mount
    useEffect(() => {
        loadJobs();
    }, []);

    // Load candidates when job is selected
    useEffect(() => {
        if (selectedJob) {
            loadCandidates(selectedJob.id);
        }
    }, [selectedJob, activeTab, filterTier, sortBy]);

    const loadJobs = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/api/jobs?userId=1`);
            const data = await response.json();
            if (data.status === 'success') {
                setJobs(data.data.jobs);
                if (data.data.jobs.length > 0 && !selectedJob) {
                    setSelectedJob(data.data.jobs[0]);
                }
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        }
    };

    const loadCandidates = async (jobId: number) => {
        try {
            const params = new URLSearchParams();
            if (activeTab !== 'all') {
                params.append('pipeline_status', activeTab);
            }
            if (filterTier !== 'all') {
                params.append('tier', filterTier);
            }
            params.append('sort_by', sortBy);

            const response = await fetch(`${config.apiUrl}/api/jobs/${jobId}?${params}`);
            const data = await response.json();
            if (data.status === 'success') {
                setCandidates(data.data.candidates);
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
        }
    };

    const handleCandidateAction = async (candidatePipelineId: number, action: string) => {
        try {
            const response = await fetch(`${config.apiUrl}/api/pipeline/${candidatePipelineId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedCandidates.size === 0) return;

        try {
            const response = await fetch(`${config.apiUrl}/api/pipeline/bulk-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        }
    };

    const handleSendMessage = async (candidatePipelineId: number, messageType: string) => {
        try {
            const response = await fetch(`${config.apiUrl}/api/pipeline/${candidatePipelineId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageType,
                    jobTitle: selectedJob?.title,
                    jobLocation: selectedJob?.location,
                    schedulingLink: 'https://calendly.com/your-link' // TODO: Make this configurable
                })
            });

            if (response.ok) {
                alert('Message sent successfully!');
                setMessageDropdownOpen(null);
                if (selectedJob) {
                    loadCandidates(selectedJob.id);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
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
        return '⭐'.repeat(fullStars) + (halfStar ? '½' : '');
    };

    // Group candidates by tier
    const candidatesByTier = {
        green: candidates.filter(c => c.tier === 'green'),
        yellow: candidates.filter(c => c.tier === 'yellow'),
        red: candidates.filter(c => c.tier === 'red')
    };

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

            <PageContainer>
            <LeftPanel isCollapsed={isLeftPanelCollapsed}>
                <CollapseButton onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}>
                    {isLeftPanelCollapsed ? '▶' : '◀'}
                </CollapseButton>

                {!isLeftPanelCollapsed && (
                    <>
                        <PanelHeader>
                            <PanelTitle>My Jobs</PanelTitle>
                            <BackButton onClick={() => navigate('/batch-resume-analysis')}>
                                ← Back to Resume Evaluator
                            </BackButton>
                            <AddJobButton onClick={() => setShowAddJobForm(true)}>
                                + Add New Job
                            </AddJobButton>
                        </PanelHeader>

                        <JobsList>
                            {jobs.length === 0 ? (
                                <EmptyState>
                                    <p>No jobs yet.</p>
                                    <p>Click "Add New Job" to get started!</p>
                                </EmptyState>
                            ) : (
                                jobs.map(job => (
                                    <JobCard
                                        key={job.id}
                                        isActive={selectedJob?.id === job.id}
                                        onClick={() => setSelectedJob(job)}
                                    >
                                        <JobTitle>{job.title}</JobTitle>
                                        <JobMeta>
                                            <span>📍 {job.location}</span>
                                            <span>💼 {job.required_years_experience}+ years</span>
                                            {job.vehicle_required && <span>🚗 Vehicle Required</span>}
                                        </JobMeta>
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
                            <h3 style={{ color: '#4ade80', marginBottom: '1rem' }}>Job Details</h3>
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
                            <span style={{ color: '#e0e0e0', fontWeight: 600 }}>Filter & Sort:</span>
                            <Select value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
                                <option value="all">All Tiers</option>
                                <option value="green">🟢 Green Tier</option>
                                <option value="yellow">🟡 Yellow Tier</option>
                                <option value="red">🔴 Red Tier</option>
                            </Select>
                            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="tier_score">Sort by Score</option>
                                <option value="years_of_experience">Sort by Experience</option>
                                <option value="star_rating">Sort by Star Rating</option>
                            </Select>
                        </FilterSortBar>

                        {selectedCandidates.size > 0 && (
                            <BulkActionsBar>
                                <span style={{ color: '#e0e0e0' }}>
                                    {selectedCandidates.size} selected
                                </span>
                                <BulkActionButton onClick={() => handleBulkAction('approved')}>
                                    ✓ Approve All
                                </BulkActionButton>
                                <BulkActionButton onClick={() => handleBulkAction('backup')}>
                                    👍 Move to Backup
                                </BulkActionButton>
                                <BulkActionButton onClick={() => handleBulkAction('rejected')}>
                                    ✗ Reject All
                                </BulkActionButton>
                            </BulkActionsBar>
                        )}

                        <CandidatesGrid>
                            {activeTab === 'all' ? (
                                <>
                                    {candidatesByTier.green.length > 0 && (
                                        <TierSection>
                                            <TierHeader tier="green">
                                                <span>🟢 GREEN TIER (80-100 points)</span>
                                                <span>{candidatesByTier.green.length} candidates</span>
                                            </TierHeader>
                                            {candidatesByTier.green.map(candidate => (
                                                <CandidateCard
                                                    key={candidate.id}
                                                    isSelected={selectedCandidates.has(candidate.id)}
                                                >
                                                    <CandidateHeader>
                                                        <CandidateInfo>
                                                            <CandidateName>
                                                                <Checkbox
                                                                    type="checkbox"
                                                                    checked={selectedCandidates.has(candidate.id)}
                                                                    onChange={() => toggleCandidateSelection(candidate.id)}
                                                                />
                                                                {candidate.filename.replace('.pdf', '')}
                                                                <StarRating>{getStars(candidate.star_rating)}</StarRating>
                                                                {candidate.give_them_a_chance && (
                                                                    <Badge>Give Them a Chance</Badge>
                                                                )}
                                                            </CandidateName>
                                                        </CandidateInfo>
                                                        <Score tier={candidate.tier}>{candidate.tier_score}</Score>
                                                    </CandidateHeader>

                                                    <Summary>{candidate.ai_summary}</Summary>

                                                    <MetaRow>
                                                        <span>📅 {candidate.years_of_experience} years exp</span>
                                                        <span>🚗 {candidate.vehicle_status.replace('_', ' ')}</span>
                                                        <span>📜 {candidate.certifications_found?.length || 0} certs</span>
                                                    </MetaRow>

                                                    <ActionButtons style={{ marginTop: '1rem' }}>
                                                        <ActionIcon
                                                            color="#4ade80"
                                                            onClick={() => handleCandidateAction(candidate.id, 'approved')}
                                                            title="Approve"
                                                        >
                                                            ✓
                                                        </ActionIcon>

                                                        <MessageDropdown>
                                                            <ActionIcon
                                                                color="#3b82f6"
                                                                onClick={() => setMessageDropdownOpen(
                                                                    messageDropdownOpen === candidate.id ? null : candidate.id
                                                                )}
                                                                title="Send Message"
                                                            >
                                                                ✉
                                                            </ActionIcon>
                                                            <DropdownContent isOpen={messageDropdownOpen === candidate.id}>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'sms')}>
                                                                    📱 Send SMS
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'email')}>
                                                                    📧 Send Email
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'rejection_email')}>
                                                                    ✗ Send Rejection
                                                                </DropdownItem>
                                                            </DropdownContent>
                                                        </MessageDropdown>

                                                        <ActionIcon
                                                            color="#fbbf24"
                                                            onClick={() => handleCandidateAction(candidate.id, 'backup')}
                                                            title="Move to Backup"
                                                        >
                                                            👍
                                                        </ActionIcon>

                                                        <ActionIcon
                                                            color="#ef4444"
                                                            onClick={() => handleCandidateAction(candidate.id, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            ✗
                                                        </ActionIcon>
                                                    </ActionButtons>
                                                </CandidateCard>
                                            ))}
                                        </TierSection>
                                    )}

                                    {candidatesByTier.yellow.length > 0 && (
                                        <TierSection>
                                            <TierHeader tier="yellow">
                                                <span>🟡 YELLOW TIER (50-79 points)</span>
                                                <span>{candidatesByTier.yellow.length} candidates</span>
                                            </TierHeader>
                                            {/* Similar candidate card rendering for yellow tier */}
                                            {candidatesByTier.yellow.map(candidate => (
                                                <CandidateCard
                                                    key={candidate.id}
                                                    isSelected={selectedCandidates.has(candidate.id)}
                                                >
                                                    {/* Same structure as green tier */}
                                                    <CandidateHeader>
                                                        <CandidateInfo>
                                                            <CandidateName>
                                                                <Checkbox
                                                                    type="checkbox"
                                                                    checked={selectedCandidates.has(candidate.id)}
                                                                    onChange={() => toggleCandidateSelection(candidate.id)}
                                                                />
                                                                {candidate.filename.replace('.pdf', '')}
                                                                <StarRating>{getStars(candidate.star_rating)}</StarRating>
                                                                {candidate.give_them_a_chance && (
                                                                    <Badge>Give Them a Chance</Badge>
                                                                )}
                                                            </CandidateName>
                                                        </CandidateInfo>
                                                        <Score tier={candidate.tier}>{candidate.tier_score}</Score>
                                                    </CandidateHeader>

                                                    <Summary>{candidate.ai_summary}</Summary>

                                                    <MetaRow>
                                                        <span>📅 {candidate.years_of_experience} years exp</span>
                                                        <span>🚗 {candidate.vehicle_status.replace('_', ' ')}</span>
                                                        <span>📜 {candidate.certifications_found?.length || 0} certs</span>
                                                    </MetaRow>

                                                    <ActionButtons style={{ marginTop: '1rem' }}>
                                                        <ActionIcon
                                                            color="#4ade80"
                                                            onClick={() => handleCandidateAction(candidate.id, 'approved')}
                                                            title="Approve"
                                                        >
                                                            ✓
                                                        </ActionIcon>

                                                        <MessageDropdown>
                                                            <ActionIcon
                                                                color="#3b82f6"
                                                                onClick={() => setMessageDropdownOpen(
                                                                    messageDropdownOpen === candidate.id ? null : candidate.id
                                                                )}
                                                                title="Send Message"
                                                            >
                                                                ✉
                                                            </ActionIcon>
                                                            <DropdownContent isOpen={messageDropdownOpen === candidate.id}>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'sms')}>
                                                                    📱 Send SMS
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'email')}>
                                                                    📧 Send Email
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'rejection_email')}>
                                                                    ✗ Send Rejection
                                                                </DropdownItem>
                                                            </DropdownContent>
                                                        </MessageDropdown>

                                                        <ActionIcon
                                                            color="#fbbf24"
                                                            onClick={() => handleCandidateAction(candidate.id, 'backup')}
                                                            title="Move to Backup"
                                                        >
                                                            👍
                                                        </ActionIcon>

                                                        <ActionIcon
                                                            color="#ef4444"
                                                            onClick={() => handleCandidateAction(candidate.id, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            ✗
                                                        </ActionIcon>
                                                    </ActionButtons>
                                                </CandidateCard>
                                            ))}
                                        </TierSection>
                                    )}

                                    {candidatesByTier.red.length > 0 && (
                                        <TierSection>
                                            <TierHeader tier="red">
                                                <span>🔴 RED TIER (0-49 points)</span>
                                                <span>{candidatesByTier.red.length} candidates</span>
                                            </TierHeader>
                                            {/* Similar candidate card rendering for red tier */}
                                            {candidatesByTier.red.map(candidate => (
                                                <CandidateCard
                                                    key={candidate.id}
                                                    isSelected={selectedCandidates.has(candidate.id)}
                                                >
                                                    {/* Same structure as green tier */}
                                                    <CandidateHeader>
                                                        <CandidateInfo>
                                                            <CandidateName>
                                                                <Checkbox
                                                                    type="checkbox"
                                                                    checked={selectedCandidates.has(candidate.id)}
                                                                    onChange={() => toggleCandidateSelection(candidate.id)}
                                                                />
                                                                {candidate.filename.replace('.pdf', '')}
                                                                <StarRating>{getStars(candidate.star_rating)}</StarRating>
                                                            </CandidateName>
                                                        </CandidateInfo>
                                                        <Score tier={candidate.tier}>{candidate.tier_score}</Score>
                                                    </CandidateHeader>

                                                    <Summary>{candidate.ai_summary}</Summary>

                                                    <MetaRow>
                                                        <span>📅 {candidate.years_of_experience} years exp</span>
                                                        <span>🚗 {candidate.vehicle_status.replace('_', ' ')}</span>
                                                        <span>📜 {candidate.certifications_found?.length || 0} certs</span>
                                                    </MetaRow>

                                                    <ActionButtons style={{ marginTop: '1rem' }}>
                                                        <ActionIcon
                                                            color="#4ade80"
                                                            onClick={() => handleCandidateAction(candidate.id, 'approved')}
                                                            title="Approve"
                                                        >
                                                            ✓
                                                        </ActionIcon>

                                                        <MessageDropdown>
                                                            <ActionIcon
                                                                color="#3b82f6"
                                                                onClick={() => setMessageDropdownOpen(
                                                                    messageDropdownOpen === candidate.id ? null : candidate.id
                                                                )}
                                                                title="Send Message"
                                                            >
                                                                ✉
                                                            </ActionIcon>
                                                            <DropdownContent isOpen={messageDropdownOpen === candidate.id}>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'sms')}>
                                                                    📱 Send SMS
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'email')}>
                                                                    📧 Send Email
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleSendMessage(candidate.id, 'rejection_email')}>
                                                                    ✗ Send Rejection
                                                                </DropdownItem>
                                                            </DropdownContent>
                                                        </MessageDropdown>

                                                        <ActionIcon
                                                            color="#fbbf24"
                                                            onClick={() => handleCandidateAction(candidate.id, 'backup')}
                                                            title="Move to Backup"
                                                        >
                                                            👍
                                                        </ActionIcon>

                                                        <ActionIcon
                                                            color="#ef4444"
                                                            onClick={() => handleCandidateAction(candidate.id, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            ✗
                                                        </ActionIcon>
                                                    </ActionButtons>
                                                </CandidateCard>
                                            ))}
                                        </TierSection>
                                    )}

                                    {candidates.length === 0 && (
                                        <EmptyState>
                                            <h3>No candidates yet</h3>
                                            <p>Upload resumes to start building your candidate pipeline!</p>
                                        </EmptyState>
                                    )}
                                </>
                            ) : (
                                // Simplified view for other tabs (approved, contacted, etc.)
                                <>
                                    {candidates.map(candidate => (
                                        <CandidateCard
                                            key={candidate.id}
                                            isSelected={selectedCandidates.has(candidate.id)}
                                        >
                                            <CandidateHeader>
                                                <CandidateInfo>
                                                    <CandidateName>
                                                        <Checkbox
                                                            type="checkbox"
                                                            checked={selectedCandidates.has(candidate.id)}
                                                            onChange={() => toggleCandidateSelection(candidate.id)}
                                                        />
                                                        {candidate.filename.replace('.pdf', '')}
                                                        <StarRating>{getStars(candidate.star_rating)}</StarRating>
                                                        {candidate.give_them_a_chance && (
                                                            <Badge>Give Them a Chance</Badge>
                                                        )}
                                                    </CandidateName>
                                                </CandidateInfo>
                                                <Score tier={candidate.tier}>{candidate.tier_score}</Score>
                                            </CandidateHeader>

                                            <Summary>{candidate.ai_summary}</Summary>

                                            <MetaRow>
                                                <span>📅 {candidate.years_of_experience} years exp</span>
                                                <span>🚗 {candidate.vehicle_status.replace('_', ' ')}</span>
                                                <span>📜 {candidate.certifications_found?.length || 0} certs</span>
                                            </MetaRow>

                                            <ActionButtons style={{ marginTop: '1rem' }}>
                                                <ActionIcon
                                                    color="#4ade80"
                                                    onClick={() => handleCandidateAction(candidate.id, 'approved')}
                                                    title="Approve"
                                                >
                                                    ✓
                                                </ActionIcon>

                                                <MessageDropdown>
                                                    <ActionIcon
                                                        color="#3b82f6"
                                                        onClick={() => setMessageDropdownOpen(
                                                            messageDropdownOpen === candidate.id ? null : candidate.id
                                                        )}
                                                        title="Send Message"
                                                    >
                                                        ✉
                                                    </ActionIcon>
                                                    <DropdownContent isOpen={messageDropdownOpen === candidate.id}>
                                                        <DropdownItem onClick={() => handleSendMessage(candidate.id, 'sms')}>
                                                            📱 Send SMS
                                                        </DropdownItem>
                                                        <DropdownItem onClick={() => handleSendMessage(candidate.id, 'email')}>
                                                            📧 Send Email
                                                        </DropdownItem>
                                                        <DropdownItem onClick={() => handleSendMessage(candidate.id, 'rejection_email')}>
                                                            ✗ Send Rejection
                                                        </DropdownItem>
                                                    </DropdownContent>
                                                </MessageDropdown>

                                                <ActionIcon
                                                    color="#fbbf24"
                                                    onClick={() => handleCandidateAction(candidate.id, 'backup')}
                                                    title="Move to Backup"
                                                >
                                                    👍
                                                </ActionIcon>

                                                <ActionIcon
                                                    color="#ef4444"
                                                    onClick={() => handleCandidateAction(candidate.id, 'rejected')}
                                                    title="Reject"
                                                >
                                                    ✗
                                                </ActionIcon>
                                            </ActionButtons>
                                        </CandidateCard>
                                    ))}

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
        </>
    );
};

export default JobsManagement;
