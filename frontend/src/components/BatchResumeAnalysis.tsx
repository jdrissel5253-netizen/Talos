import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MapPin, Briefcase, FileText } from 'lucide-react';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import ResumeFileModal from './ResumeFileModal';

/* ── Layout ── */
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  display: flex;
`;

const Sidebar = styled.div<{ isCollapsed: boolean }>`
  width: ${props => props.isCollapsed ? '60px' : '280px'};
  background: #1a1a1a;
  border-right: 2px solid #333333;
  padding: ${props => props.isCollapsed ? '1rem 0.5rem' : '1.5rem'};
  transition: width 0.3s ease;
  overflow-y: auto;
  position: relative;
  @media (max-width: 768px) {
    position: fixed;
    left: ${props => props.isCollapsed ? '-280px' : '0'};
    top: 0; bottom: 0; z-index: 1000; width: 280px;
  }
`;

const ToggleButton = styled.button`
  background: #4ade80; color: white; border: none;
  padding: 0.5rem; border-radius: 6px; cursor: pointer;
  margin-bottom: 1rem; width: 100%; font-size: 0.875rem;
  &:hover { background: #3bc76a; }
`;

const SidebarTitle = styled.h3`
  color: #4ade80; font-size: 1.125rem; margin-bottom: 1rem;
`;

const JobItem = styled.div<{ isActive: boolean }>`
  background: ${p => p.isActive ? '#000' : '#0f0f0f'};
  border: 2px solid ${p => p.isActive ? '#4ade80' : '#333'};
  padding: 0.75rem; border-radius: 6px; margin-bottom: 0.75rem;
  cursor: pointer; transition: all 0.2s;
  &:hover { border-color: #4ade80; }
`;

const JobItemTitle = styled.div`
  color: #e0e0e0; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;
`;

const JobItemMeta = styled.div`
  color: #999; font-size: 0.75rem;
`;

const ViewAllButton = styled.button`
  background: transparent; border: 2px solid #4ade80; color: #4ade80;
  padding: 0.75rem; border-radius: 6px; cursor: pointer;
  width: 100%; font-weight: 600; margin-top: 1rem; transition: all 0.2s;
  &:hover { background: #4ade80; color: white; }
`;

const MainContent = styled.div`
  flex: 1; padding: 2rem; overflow-y: auto;
`;

const MainCard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
  padding: 3rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #4ade80;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #e0e0e0;
  font-size: 1.125rem;
`;

const PositionSelectorContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto 3rem;
  padding: 1.5rem;
  background: #000000;
  border-radius: 8px;
  border: 1px solid #333333;
`;

const PositionLabel = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #4ade80;
  margin-bottom: 0.75rem;
`;

const PositionSelect = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid #4ade80;
  border-radius: 6px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4ade80;
  }

  &:focus {
    outline: none;
    border-color: #4ade80;
    box-shadow: 0 0 0 3px rgba(26, 90, 58, 0.1);
  }
`;

const UploadSection = styled.div`
  border: 3px dashed #4ade80;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  margin-bottom: 2rem;
  background: #000000;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: #000000;
    border-color: #4ade80;
  }

  &.dragging {
    background: #1a1a1a;
    border-color: #4ade80;
  }
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const UploadHint = styled.p`
  font-size: 0.875rem;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
`;

const FileInput = styled.input`
  display: none;
`;

const BrowseButton = styled.button`
  background-color: #4ade80;
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #4ade80;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const FileList = styled.div`
  margin-top: 1.5rem;
  text-align: left;
`;

const FileItem = styled.div`
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #4ade80;
  font-weight: 600;
`;

const RemoveButton = styled.button`
  margin-left: auto;
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background: #c82333;
  }
`;

const AnalyzingLoader = styled.div`
  text-align: center;
  padding: 3rem;
`;

const LoaderSpinner = styled.div`
  border: 4px solid #333333;
  border-top: 4px solid #4ade80;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoaderText = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  font-weight: 600;
`;

const ProgressText = styled.p`
  font-size: 0.875rem;
  color: #999;
  margin-top: 0.5rem;
`;

const ResultsSection = styled.div`
  margin-top: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #333333;
`;

const ResultsTitle = styled.h2`
  font-size: 1.75rem;
  color: #4ade80;
`;

const ResultsCount = styled.p`
  font-size: 1rem;
  color: #e0e0e0;
`;

const CandidateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CandidateCard = styled.div<{ expanded: boolean }>`
  background: ${props => props.expanded ? '#000000' : '#1a1a1a'};
  border: 2px solid ${props => props.expanded ? '#4ade80' : '#333333'};
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4ade80;
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  }
`;

const CandidateHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const CandidateScore = styled.div`
  background: linear-gradient(135deg, #4ade80 0%, #4ade80 100%);
  color: white;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ScoreNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
`;

const ScoreLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
`;

const CandidateInfo = styled.div`
  flex: 1;
`;

const CandidateName = styled.h3`
  font-size: 1.25rem;
  color: #e0e0e0;
  margin-bottom: 0.25rem;
`;

const CandidateSummary = styled.p`
  font-size: 0.875rem;
  color: #e0e0e0;
  line-height: 1.5;
`;

const ExpandIcon = styled.div`
  font-size: 1.5rem;
  color: #4ade80;
  transition: transform 0.3s ease;
  transform: ${props => props.className?.includes('expanded') ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const CandidateDetails = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333333;
`;

/* ── Results: sections (same styling as single-resume analysis) ── */
const DetailSection = styled.div`
  background: #1a1a1a;
  padding: 1.25rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #333333;
`;

const DetailTitle = styled.h4`
  font-size: 1rem;
  color: #4ade80;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailContent = styled.div`
  color: #e0e0e0;
  line-height: 1.55;
  font-size: 0.9rem;
`;

const ScoreBadge = styled.span`
  background: #4ade80; color: white; padding: 0.2rem 0.6rem;
  border-radius: 20px; font-size: 0.8rem; margin-left: auto;
`;

/* Inline two-column grid for sections that pair naturally */
const SplitRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const TagRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.4rem;
`;

const Tag = styled.span<{ found?: boolean }>`
  font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px;
  background: ${p => p.found ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.10)'};
  color: ${p => p.found ? '#4ade80' : '#f87171'};
  border: 1px solid ${p => p.found ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.25)'};
`;

const MiniList = styled.ul`
  margin: 0.35rem 0 0 1rem; padding: 0;
  li { font-size: 0.875rem; color: #e0e0e0; margin-bottom: 0.3rem; }
`;

const RecommendationBadge = styled.div<{ type: 'success' | 'warning' | 'info' }>`
  padding: 1rem 1.25rem; border-radius: 8px; margin-bottom: 1rem;
  background: ${p => p.type === 'success' ? 'rgba(74,222,128,0.08)' : p.type === 'warning' ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.08)'};
  border: 1px solid ${p => p.type === 'success' ? 'rgba(74,222,128,0.3)' : p.type === 'warning' ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'};
  font-weight: 700; font-size: 0.9rem;
  color: ${p => p.type === 'success' ? '#4ade80' : p.type === 'warning' ? '#f87171' : '#fbbf24'};
`;

const ActionRow = styled.div`
  display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.25rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'ghost' }>`
  flex: 1; min-width: 160px; padding: 0.875rem 1.5rem;
  border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
  ${p => p.variant === 'ghost' ? `
    background: transparent; color: #e0e0e0; border: 2px solid #333;
    &:hover { border-color: #4ade80; color: #4ade80; }
  ` : `
    background: #4ade80; color: white; border: none;
    &:hover { background: #3bc76a; transform: translateY(-1px); }
  `}
`;

const NewAnalysisButton = styled.button`
  background-color: #4ade80;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 1.5rem;

  &:hover {
    background-color: #4ade80;
    transform: translateY(-1px);
  }
`;

/* ── Add-to-Job Modal ── */
const Modal = styled.div<{ isOpen: boolean }>`
  display: ${p => p.isOpen ? 'flex' : 'none'};
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  z-index: 9999; align-items: center; justify-content: center; padding: 2rem;
`;

const ModalContent = styled.div`
  background: #1a1a1a; border-radius: 12px; padding: 2rem;
  max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: #4ade80; margin-bottom: 1.25rem; font-size: 1.25rem;
`;

const ModalJobItem = styled.div<{ selected: boolean }>`
  background: ${p => p.selected ? '#0a2a1a' : '#000'};
  border: 2px solid ${p => p.selected ? '#4ade80' : '#333'};
  padding: 0.875rem 1rem; border-radius: 6px; margin-bottom: 0.75rem;
  cursor: pointer; transition: all 0.2s;
  &:hover { border-color: #4ade80; }
`;

const ModalActions = styled.div`
  display: flex; gap: 0.75rem; margin-top: 1rem;
`;

const ModalButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1; padding: 0.75rem; border-radius: 6px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
  ${p => p.variant === 'primary' ? `
    background: #4ade80; color: white; border: none;
    &:hover { background: #3bc76a; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  ` : `
    background: transparent; color: #e0e0e0; border: 2px solid #333;
    &:hover { border-color: #4ade80; }
  `}
`;

/* ── Types ── */
interface CandidateResult {
  id: number;
  filename: string;
  status: string;
  analysis?: {
    overallScore: number;
    isOverqualified?: boolean;
    overqualificationReason?: string | null;
    summary?: string;
    technicalSkills?: { score?: number; found?: string[]; missing?: string[]; feedback?: string; };
    certifications?: { score?: number; found?: string[]; recommended?: string[]; feedback?: string; };
    experience?: { score?: number; yearsOfExperience?: number; relevantExperience?: string[]; feedback?: string; };
    presentationQuality?: { score?: number; strengths?: string[]; improvements?: string[]; };
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    hiringRecommendation?: string;
  };
  error?: string;
}

interface Job {
  id: number; title: string; location: string; city?: string;
  required_years_experience: number; vehicle_required: boolean; flexible_on_title?: boolean;
}

const BatchResumeAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [expandedCandidates, setExpandedCandidates] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const [selectedPosition, setSelectedPosition] = useState('HVAC Service Technician');
  const [requiredYearsExperience, setRequiredYearsExperience] = useState<number>(2);
  const [flexibleOnTitle, setFlexibleOnTitle] = useState<boolean>(true);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [viewingResume, setViewingResume] = useState<{ candidateId: number; filename: string } | null>(null);
  const [isAddToJobModalOpen, setIsAddToJobModalOpen] = useState(false);
  const [selectedJobForAdd, setSelectedJobForAdd] = useState<number | null>(null);
  const [addToJobCandidateId, setAddToJobCandidateId] = useState<number | null>(null);
  const [addedCandidates, setAddedCandidates] = useState<Record<number, string>>({});

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/jobs?userId=1`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success') setJobs(data.data.jobs);
    } catch {}
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleRemoveFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress({ current: 0, total: selectedFiles.length });

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('resumes', file);
    });
    if (selectedJobId) {
      formData.append('job_id', selectedJobId.toString());
    } else {
      formData.append('position', selectedPosition);
      formData.append('requiredYearsExperience', requiredYearsExperience.toString());
      formData.append('flexibleOnTitle', flexibleOnTitle.toString());
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/resume/upload-batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const msg = errorData?.message || `Server error (${response.status})`;
        alert('Error analyzing resumes: ' + msg);
        return;
      }

      const data = await response.json();

      if (data.status === 'success') {
        setResults(data.data.results);
      } else {
        alert('Error analyzing resumes: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(
        'The request timed out — this usually happens with 4+ resumes. ' +
        'Your resumes may still have been processed. ' +
        'Check the Talent Pool in a minute to confirm, then try a smaller batch.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedFiles([]);
    setResults([]);
    setExpandedCandidates(new Set());
    setSelectedJobId(null);
    setAddedCandidates({});
    setViewingResume(null);
  };

  const toggleCandidate = (id: number) => {
    setExpandedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleConfirmAddToJob = async () => {
    if (!selectedJobForAdd || !addToJobCandidateId) return;
    try {
      const res = await fetch(
        `${config.apiUrl}/api/jobs/${selectedJobForAdd}/candidates/${addToJobCandidateId}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ vehicle_status: 'unknown' }) }
      );
      if (res.ok) {
        const job = jobs.find(j => j.id === selectedJobForAdd);
        setAddedCandidates(prev => ({ ...prev, [addToJobCandidateId]: job?.title || 'job' }));
        setIsAddToJobModalOpen(false);
        setSelectedJobForAdd(null);
        setAddToJobCandidateId(null);
      } else {
        alert('Failed to add candidate to job');
      }
    } catch {
      alert('Error adding candidate to job');
    }
  };

  const getRecommendationType = (recommendation: string): 'success' | 'warning' | 'info' => {
    if (recommendation.includes('STRONG_YES') || recommendation.includes('YES')) return 'success';
    if (recommendation.includes('NO')) return 'warning';
    return 'info';
  };

  return (
    <Container>
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed}>
        {!isSidebarCollapsed && (
          <>
            <ToggleButton onClick={() => setIsSidebarCollapsed(true)}>Hide ◀</ToggleButton>
            <ViewAllButton onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem' }}>← Dashboard</ViewAllButton>
            <SidebarTitle>My Jobs</SidebarTitle>
            <ViewAllButton onClick={() => navigate('/jobs-management')}>View All Jobs →</ViewAllButton>
            <ViewAllButton onClick={() => navigate('/talent-pool-manager')} style={{ marginTop: '0.5rem' }}>
              View Talent Pool →
            </ViewAllButton>
            {jobs.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.875rem', textAlign: 'center', marginTop: '1rem' }}>No jobs yet</p>
            ) : jobs.map(job => (
              <JobItem key={job.id} isActive={false} style={{ marginTop: job === jobs[0] ? '1rem' : undefined }}>
                <JobItemTitle>{job.title}</JobItemTitle>
                <JobItemMeta><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{job.location}</JobItemMeta>
                <JobItemMeta><Briefcase size={12} style={{ display: 'inline', marginRight: 4 }} />{job.required_years_experience}+ years</JobItemMeta>
              </JobItem>
            ))}
          </>
        )}
        {isSidebarCollapsed && <ToggleButton onClick={() => setIsSidebarCollapsed(false)}>▶</ToggleButton>}
      </Sidebar>

      {/* Main */}
      <MainContent>
        <MainCard>
          <Header>
            <Title>Batch Resume Analyzer</Title>
            <Subtitle>Upload multiple HVAC technician resumes for instant AI-powered analysis</Subtitle>
          </Header>

          {results.length === 0 ? (
            <>
              <PositionSelectorContainer>
                <PositionLabel htmlFor="job-select">Analyze Against</PositionLabel>
                <PositionSelect
                  id="job-select"
                  value={selectedJobId ?? ''}
                  onChange={e => setSelectedJobId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">— General analysis (no specific job) —</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}{job.city ? ` · ${job.city}` : job.location ? ` · ${job.location}` : ''}
                    </option>
                  ))}
                </PositionSelect>
                {selectedJobId && (() => {
                  const job = jobs.find(j => j.id === selectedJobId);
                  return job ? (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '6px', fontSize: '0.85rem', color: '#a3e4b8' }}>
                      <strong style={{ color: '#4ade80' }}>{job.title}</strong>
                      {' · '}{job.required_years_experience}+ yrs required
                      {job.city || job.location ? ` · ${job.city || job.location}` : ''}
                      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6a9a7a' }}>
                        Every resume in this batch will be scored specifically for this role and added to its pipeline
                      </div>
                    </div>
                  ) : null;
                })()}
                {!selectedJobId && (
                  <>
                    <PositionLabel htmlFor="position-select" style={{ marginTop: '1.5rem' }}>
                      Select Position to Evaluate For:
                    </PositionLabel>
                    <PositionSelect
                      id="position-select"
                      value={selectedPosition}
                      onChange={(e) => setSelectedPosition(e.target.value)}
                    >
                      <option value="Lead HVAC Technician">Lead HVAC Technician</option>
                      <option value="HVAC Service Technician">HVAC Service Technician</option>
                      <option value="HVAC Dispatcher">HVAC Dispatcher</option>
                      <option value="Administrative Assistant">Administrative Assistant</option>
                      <option value="Customer Service Representative">Customer Service Representative</option>
                      <option value="HVAC Installer">HVAC Installer</option>
                      <option value="Lead HVAC Installer">Lead HVAC Installer</option>
                      <option value="Maintenance Technician">Maintenance Technician</option>
                      <option value="Warehouse Associate">Warehouse Associate</option>
                      <option value="Bookkeeper">Bookkeeper</option>
                      <option value="HVAC Sales Representative">HVAC Sales Representative</option>
                      <option value="HVAC Service Manager">HVAC Service Manager</option>
                      <option value="Apprentice">Apprentice</option>
                    </PositionSelect>

                    <PositionLabel htmlFor="years-select" style={{ marginTop: '1.5rem' }}>
                      Required Years of Experience:
                    </PositionLabel>
                    <PositionSelect
                      id="years-select"
                      value={requiredYearsExperience}
                      onChange={(e) => setRequiredYearsExperience(Number(e.target.value))}
                    >
                      <option value="0.5">0.5 years</option>
                      <option value="1">1 year</option>
                      <option value="1.5">1.5 years</option>
                      <option value="2">2 years</option>
                      <option value="2.5">2.5 years</option>
                      <option value="3">3 years</option>
                      <option value="3.5">3.5 years</option>
                      <option value="4">4 years</option>
                      <option value="4.5">4.5 years</option>
                      <option value="5">5 years</option>
                      <option value="5.5">5.5 years</option>
                      <option value="6">6 years</option>
                      <option value="6.5">6.5 years</option>
                      <option value="7">7 years</option>
                      <option value="7.5">7.5 years</option>
                      <option value="8">8 years</option>
                      <option value="8.5">8.5 years</option>
                      <option value="9">9 years</option>
                      <option value="9.5">9.5 years</option>
                      <option value="10">10 years</option>
                    </PositionSelect>

                    {(selectedPosition === 'Lead HVAC Technician' || selectedPosition === 'HVAC Dispatcher' || selectedPosition === 'Administrative Assistant' || selectedPosition === 'Customer Service Representative') && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          color: '#e0e0e0',
                          fontSize: '0.95rem'
                        }}>
                          <input
                            type="checkbox"
                            checked={flexibleOnTitle}
                            onChange={(e) => setFlexibleOnTitle(e.target.checked)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#4ade80'
                            }}
                          />
                          <span>
                            <strong style={{ color: '#4ade80' }}>Flexible on role title</strong>
                            <br />
                            <span style={{ fontSize: '0.85rem', color: '#999' }}>
                              Accept equivalent roles with transferable skills as full experience
                            </span>
                          </span>
                        </label>
                        {!flexibleOnTitle && (
                          <p style={{
                            marginTop: '0.75rem',
                            fontSize: '0.8rem',
                            color: '#fbbf24',
                            padding: '0.5rem',
                            background: 'rgba(251, 191, 36, 0.1)',
                            borderRadius: '4px'
                          }}>
                            Note: Candidates with equivalent roles will receive a 9-point penalty
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </PositionSelectorContainer>

              <UploadSection
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={isDragging ? 'dragging' : ''}
              >
                <UploadIcon>📄</UploadIcon>
                <UploadText>
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
                    : 'Drop resumes here or click to browse'}
                </UploadText>
                <UploadHint>Upload up to 4 PDF files at a time (5MB each) — larger batches may time out</UploadHint>
                <FileInput
                  id="fileInput"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                />
                <BrowseButton as="div">
                  Browse Files
                </BrowseButton>

                {selectedFiles.length > 0 && (
                  <FileList onClick={(e) => e.stopPropagation()}>
                    {selectedFiles.map((file, index) => (
                      <FileItem key={index}>
                        📎 {file.name}
                        <RemoveButton onClick={(e) => handleRemoveFile(index, e)}>
                          Remove
                        </RemoveButton>
                      </FileItem>
                    ))}
                  </FileList>
                )}
              </UploadSection>

              {selectedFiles.length > 4 && !isAnalyzing && (
                <div style={{
                  margin: '0.75rem 0',
                  padding: '0.75rem 1rem',
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid #fbbf24',
                  borderRadius: '6px',
                  color: '#fbbf24',
                  fontSize: '0.875rem'
                }}>
                  ⚠️ {selectedFiles.length} files selected — batches over 4 resumes may time out. Consider splitting into smaller groups.
                </div>
              )}

              {selectedFiles.length > 0 && !isAnalyzing && (
                <BrowseButton onClick={handleAnalyze}>
                  Analyze {selectedFiles.length} Resume{selectedFiles.length > 1 ? 's' : ''} with AI
                </BrowseButton>
              )}

              {isAnalyzing && (
                <AnalyzingLoader>
                  <LoaderSpinner />
                  <LoaderText>Analyzing resumes with AI...</LoaderText>
                  <ProgressText>
                    This may take 15-20 seconds per resume ({selectedFiles.length} total)
                  </ProgressText>
                </AnalyzingLoader>
              )}
            </>
          ) : (
            <ResultsSection>
              <ResultsHeader>
                <ResultsTitle>Analysis Results</ResultsTitle>
                <ResultsCount>
                  {results.filter(r => r.status === 'success').length} of {results.length} candidates analyzed
                </ResultsCount>
              </ResultsHeader>

              <CandidateList>
                {results
                  .filter(r => r.status === 'success')
                  .sort((a, b) => (b.analysis?.overallScore || 0) - (a.analysis?.overallScore || 0))
                  .map((candidate) => {
                    const isExpanded = expandedCandidates.has(candidate.id);
                    const a = candidate.analysis;
                    return (
                      <CandidateCard
                        key={candidate.id}
                        expanded={isExpanded}
                        onClick={() => toggleCandidate(candidate.id)}
                      >
                        <CandidateHeader>
                          <CandidateScore>
                            <ScoreNumber>{a?.overallScore}</ScoreNumber>
                            <ScoreLabel>out of 100</ScoreLabel>
                          </CandidateScore>

                          <CandidateInfo>
                            <CandidateName>
                              {candidate.filename.replace('.pdf', '')}
                              {a?.isOverqualified && (
                                <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontSize: '0.875rem' }}>
                                  ⚠️ Overqualified
                                </span>
                              )}
                            </CandidateName>
                            <CandidateSummary>{a?.summary}</CandidateSummary>
                          </CandidateInfo>

                          <ExpandIcon className={isExpanded ? 'expanded' : ''}>
                            ▼
                          </ExpandIcon>
                        </CandidateHeader>

                        {isExpanded && a && (
                          <CandidateDetails>
                            {/* Hiring recommendation — at the top so it's the first thing seen */}
                            {a.hiringRecommendation && (
                              <RecommendationBadge type={getRecommendationType(a.hiringRecommendation)}>
                                Hiring Recommendation: {a.hiringRecommendation.replace(/_/g, ' ')}
                              </RecommendationBadge>
                            )}

                            {/* Overqualified warning */}
                            {a.isOverqualified && (
                              <DetailSection style={{ borderLeft: '4px solid #f59e0b', background: '#2a2a1a' }}>
                                <DetailTitle style={{ color: '#f59e0b' }}>⚠️ Overqualified</DetailTitle>
                                <DetailContent style={{ fontSize: '0.875rem' }}>
                                  {a.overqualificationReason || 'Placed in lower tier due to overqualification.'}
                                </DetailContent>
                              </DetailSection>
                            )}

                            {/* Summary */}
                            {a.summary && (
                              <DetailSection>
                                <DetailContent>{a.summary}</DetailContent>
                              </DetailSection>
                            )}

                            {/* Skills + Certifications side by side */}
                            <SplitRow>
                              {a.technicalSkills && (
                                <DetailSection style={{ marginBottom: 0 }}>
                                  <DetailTitle>
                                    Technical Skills
                                    {a.technicalSkills.score != null && <ScoreBadge>{a.technicalSkills.score}/100</ScoreBadge>}
                                  </DetailTitle>
                                  <DetailContent>
                                    <TagRow>
                                      {(a.technicalSkills.found ?? []).slice(0, 4).map((s, i) => <Tag key={i} found>{s}</Tag>)}
                                      {(a.technicalSkills.missing ?? []).slice(0, 3).map((s, i) => <Tag key={i}>{s}</Tag>)}
                                    </TagRow>
                                  </DetailContent>
                                </DetailSection>
                              )}
                              {a.certifications && (
                                <DetailSection style={{ marginBottom: 0 }}>
                                  <DetailTitle>
                                    Certifications
                                    {a.certifications.score != null && <ScoreBadge>{a.certifications.score}/100</ScoreBadge>}
                                  </DetailTitle>
                                  <DetailContent>
                                    <TagRow>
                                      {(a.certifications.found ?? []).length > 0
                                        ? (a.certifications.found!).slice(0, 4).map((c, i) => <Tag key={i} found>{c}</Tag>)
                                        : <Tag>None found</Tag>}
                                      {(a.certifications.recommended ?? []).slice(0, 2).map((c, i) => <Tag key={i}>{c}</Tag>)}
                                    </TagRow>
                                  </DetailContent>
                                </DetailSection>
                              )}
                            </SplitRow>

                            {/* Experience */}
                            {a.experience && (
                              <DetailSection>
                                <DetailTitle>
                                  Experience
                                  {a.experience.score != null && <ScoreBadge>{a.experience.score}/100</ScoreBadge>}
                                </DetailTitle>
                                <DetailContent>
                                  {a.experience.yearsOfExperience != null && (
                                    <p style={{ marginBottom: '0.5rem' }}><strong>{a.experience.yearsOfExperience} years</strong> of experience</p>
                                  )}
                                  {(a.experience.relevantExperience?.length ?? 0) > 0 && (
                                    <MiniList>
                                      {a.experience.relevantExperience!.slice(0, 4).map((e, i) => <li key={i}>{e}</li>)}
                                    </MiniList>
                                  )}
                                </DetailContent>
                              </DetailSection>
                            )}

                            {/* Strengths + Weaknesses side by side */}
                            {((a.strengths?.length ?? 0) > 0 || (a.weaknesses?.length ?? 0) > 0) && (
                              <SplitRow>
                                {(a.strengths?.length ?? 0) > 0 && (
                                  <DetailSection style={{ marginBottom: 0 }}>
                                    <DetailTitle>Strengths</DetailTitle>
                                    <DetailContent>
                                      <MiniList>
                                        {a.strengths!.slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}
                                      </MiniList>
                                    </DetailContent>
                                  </DetailSection>
                                )}
                                {(a.weaknesses?.length ?? 0) > 0 && (
                                  <DetailSection style={{ marginBottom: 0 }}>
                                    <DetailTitle style={{ color: '#f87171' }}>Weaknesses</DetailTitle>
                                    <DetailContent>
                                      <MiniList>
                                        {a.weaknesses!.slice(0, 4).map((w, i) => <li key={i}>{w}</li>)}
                                      </MiniList>
                                    </DetailContent>
                                  </DetailSection>
                                )}
                              </SplitRow>
                            )}

                            {/* Actions */}
                            <ActionRow onClick={e => e.stopPropagation()}>
                              <ActionButton variant="ghost" onClick={() => setViewingResume({ candidateId: candidate.id, filename: candidate.filename })}>
                                <FileText size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                                View Resume
                              </ActionButton>
                              {selectedJobId ? (
                                <ActionButton onClick={() => navigate('/talent-pool-manager')}>
                                  ✓ Added to {jobs.find(j => j.id === selectedJobId)?.title || 'job'} — View Pipeline →
                                </ActionButton>
                              ) : addedCandidates[candidate.id] ? (
                                <ActionButton onClick={() => navigate('/talent-pool-manager')}>
                                  ✓ Added to {addedCandidates[candidate.id]} — View Pipeline →
                                </ActionButton>
                              ) : (
                                <ActionButton onClick={() => { setAddToJobCandidateId(candidate.id); setIsAddToJobModalOpen(true); }}>
                                  💼 Add to Job Pipeline
                                </ActionButton>
                              )}
                            </ActionRow>
                          </CandidateDetails>
                        )}
                      </CandidateCard>
                    );
                  })}
              </CandidateList>

              <NewAnalysisButton onClick={handleNewAnalysis}>
                Analyze New Batch
              </NewAnalysisButton>
            </ResultsSection>
          )}
        </MainCard>
      </MainContent>

      {/* View Resume modal */}
      {viewingResume && (
        <ResumeFileModal
          isOpen={true}
          onClose={() => setViewingResume(null)}
          candidateId={viewingResume.candidateId}
          filename={viewingResume.filename}
        />
      )}

      {/* Add to Job modal */}
      <Modal isOpen={isAddToJobModalOpen}>
        <ModalContent>
          <ModalTitle>Add Candidate to Job</ModalTitle>
          {jobs.length === 0 ? (
            <p style={{ color: '#999' }}>No jobs available. Create a job first.</p>
          ) : jobs.map(job => (
            <ModalJobItem
              key={job.id}
              selected={selectedJobForAdd === job.id}
              onClick={() => setSelectedJobForAdd(job.id)}
            >
              <div style={{ fontWeight: 600, color: '#e0e0e0', marginBottom: '0.2rem' }}>{job.title}</div>
              <div style={{ fontSize: '0.875rem', color: '#999' }}>📍 {job.location} · 💼 {job.required_years_experience}+ years</div>
            </ModalJobItem>
          ))}
          <ModalActions>
            <ModalButton variant="secondary" onClick={() => { setIsAddToJobModalOpen(false); setSelectedJobForAdd(null); setAddToJobCandidateId(null); }}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" disabled={!selectedJobForAdd} onClick={handleConfirmAddToJob}>
              Add to Job
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default BatchResumeAnalysis;
