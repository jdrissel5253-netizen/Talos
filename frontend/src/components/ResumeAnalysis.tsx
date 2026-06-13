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
  max-width: 900px; margin: 0 auto;
  background: #1a1a1a; border-radius: 12px;
  box-shadow: 0 8px 32px rgba(255,255,255,0.1); padding: 3rem;
`;

const Header = styled.div`
  text-align: center; margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem; color: #4ade80; margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #e0e0e0; font-size: 1.125rem;
`;

/* ── Upload state ── */
const UploadSection = styled.div`
  border: 3px dashed #4ade80; border-radius: 12px;
  padding: 3rem; text-align: center; margin-bottom: 2rem;
  background: #000; transition: all 0.3s; cursor: pointer;
  &:hover, &.dragging { background: #1a1a1a; }
`;

const UploadText = styled.p`
  font-size: 1.125rem; color: #e0e0e0; margin-bottom: 0.5rem; font-weight: 600;
`;

const UploadHint = styled.p`
  font-size: 0.875rem; color: #e0e0e0; margin-bottom: 1.5rem;
`;

const BrowseButton = styled.button`
  background-color: #4ade80; color: white; border: none;
  padding: 0.875rem 2rem; border-radius: 6px;
  font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s;
  &:hover { transform: translateY(-1px); }
  &:disabled { background-color: #ccc; cursor: not-allowed; transform: none; }
`;

const FileName = styled.div`
  margin-top: 1rem; padding: 1rem; background: #1a1a1a;
  border-radius: 6px; font-size: 0.875rem; color: #4ade80; font-weight: 600;
`;

const AnalyzingLoader = styled.div`
  text-align: center; padding: 3rem;
`;

const LoaderSpinner = styled.div`
  border: 4px solid #333; border-top: 4px solid #4ade80;
  border-radius: 50%; width: 60px; height: 60px;
  animation: spin 1s linear infinite; margin: 0 auto 1.5rem;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const LoaderText = styled.p`
  font-size: 1.125rem; color: #e0e0e0; font-weight: 600;
`;

const PositionSelector = styled.div`
  margin-bottom: 2rem;
`;

const PositionLabel = styled.label`
  display: block; font-size: 1.125rem; font-weight: 600;
  color: #4ade80; margin-bottom: 0.75rem;
`;

const PositionDropdown = styled.select`
  width: 100%; padding: 1rem; font-size: 1rem;
  border: 2px solid #4ade80; border-radius: 6px;
  background-color: #1a1a1a; color: #e0e0e0;
  cursor: pointer; font-weight: 500;
  &:focus { outline: none; border-color: #4ade80; }
`;

/* ── Results: score card ── */
const ScoreCard = styled.div`
  background: linear-gradient(135deg, #4ade80 0%, #4ade80 100%);
  color: white; padding: 2rem; border-radius: 12px;
  text-align: center; margin-bottom: 1.5rem;
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.25rem;
  text-transform: uppercase; letter-spacing: 1px;
`;

const ScoreValue = styled.div`
  font-size: 4.5rem; font-weight: bold; line-height: 1;
`;

const ScoreOutOf = styled.div`
  font-size: 1.25rem; opacity: 0.8; margin-top: 0.25rem;
`;

/* ── Results: sections ── */
const DetailSection = styled.div`
  background: #000; padding: 1.25rem 1.5rem;
  border-radius: 8px; margin-bottom: 1rem;
`;

const DetailTitle = styled.h3`
  font-size: 1rem; color: #4ade80; margin-bottom: 0.75rem;
  display: flex; align-items: center; gap: 0.5rem;
`;

const DetailContent = styled.div`
  color: #e0e0e0; line-height: 1.55; font-size: 0.9rem;
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

/* ── Modal ── */
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
interface AnalysisResult {
  overallScore: number;
  isOverqualified?: boolean;
  overqualificationReason?: string | null;
  summary?: string;
  technicalSkills?: { score?: number; found?: string[]; missing?: string[]; feedback?: string; };
  certifications?: { score?: number; found?: string[]; recommended?: string[]; feedback?: string; };
  transferableSkills?: {
    schedulingCoordination?: string;
    customerInteraction?: string;
    highVolumeEnvironment?: string;
    administrativeCompetency?: string;
  };
  experience?: { score?: number; yearsOfExperience?: number; relevantExperience?: string[]; feedback?: string; };
  presentationQuality?: { score?: number; strengths?: string[]; improvements?: string[]; };
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  hiringRecommendation?: string;
}

interface Job {
  id: number; title: string; location: string; city?: string;
  required_years_experience: number; vehicle_required: boolean; flexible_on_title?: boolean;
}

function getRecType(r: string): 'success' | 'warning' | 'info' {
  if (r.includes('STRONG_YES') || r.includes('YES')) return 'success';
  if (r.includes('NO')) return 'warning';
  return 'info';
}

/* ── Component ── */
const ResumeAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPosition, setSelectedPosition] = useState('hvac-technician');
  const [requiredYearsExperience, setRequiredYearsExperience] = useState(2);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobForAdd, setSelectedJobForAdd] = useState<number | null>(null);
  const [isAddToJobModalOpen, setIsAddToJobModalOpen] = useState(false);
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [resumeFileOpen, setResumeFileOpen] = useState(false);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/jobs?userId=1`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success') setJobs(data.data.jobs);
    } catch {}
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);
    if (selectedJobId) {
      formData.append('job_id', selectedJobId.toString());
    } else {
      formData.append('position', selectedPosition);
      formData.append('requiredYearsExperience', requiredYearsExperience.toString());
    }
    try {
      const res = await fetch(`${config.apiUrl}/api/resume/upload`, {
        method: 'POST', headers: getAuthHeaders(), body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAnalysisResult(data.data.analysis);
        if (data.data.candidateId) setCandidateId(data.data.candidateId);
      } else {
        alert('Error analyzing resume: ' + data.message);
      }
    } catch {
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedFile(null); setAnalysisResult(null);
    setCandidateId(null); setSelectedJobId(null); setResumeFileOpen(false);
  };

  const handleConfirmAddToJob = async () => {
    if (!selectedJobForAdd || !candidateId) return;
    try {
      const res = await fetch(
        `${config.apiUrl}/api/jobs/${selectedJobForAdd}/candidates/${candidateId}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicle_status: 'unknown' }) }
      );
      if (res.ok) {
        alert('Candidate added to job successfully!');
        setIsAddToJobModalOpen(false); setSelectedJobForAdd(null);
      } else {
        alert('Failed to add candidate to job');
      }
    } catch { alert('Error adding candidate to job'); }
  };

  const r = analysisResult;

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
            <Title>AI Resume Analyzer</Title>
            <Subtitle>Upload an HVAC technician resume for instant AI-powered analysis</Subtitle>
          </Header>

          {!analysisResult ? (
            /* Upload state — unchanged */
            <>
              <PositionSelector>
                <PositionLabel htmlFor="job-select">Analyze Against</PositionLabel>
                <PositionDropdown
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
                </PositionDropdown>
                {selectedJobId && (() => {
                  const job = jobs.find(j => j.id === selectedJobId);
                  return job ? (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '6px', fontSize: '0.85rem', color: '#a3e4b8' }}>
                      <strong style={{ color: '#4ade80' }}>{job.title}</strong>
                      {' · '}{job.required_years_experience}+ yrs required
                      {job.city || job.location ? ` · ${job.city || job.location}` : ''}
                      <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6a9a7a' }}>
                        Resume will be scored specifically for this role and added to its pipeline
                      </div>
                    </div>
                  ) : null;
                })()}
                {!selectedJobId && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <PositionLabel htmlFor="position-select" style={{ fontSize: '0.85rem' }}>Position</PositionLabel>
                      <PositionDropdown id="position-select" value={selectedPosition} onChange={e => setSelectedPosition(e.target.value)}>
                        <option value="lead-hvac-technician">Lead HVAC Technician</option>
                        <option value="hvac-service-technician">HVAC Service Technician</option>
                        <option value="hvac-dispatcher">HVAC Dispatcher</option>
                        <option value="administrative-assistant">Administrative Assistant</option>
                        <option value="customer-service-representative">Customer Service Representative</option>
                        <option value="hvac-installer">HVAC Installer</option>
                        <option value="lead-hvac-installer">Lead HVAC Installer</option>
                        <option value="maintenance-technician">Maintenance Technician</option>
                        <option value="warehouse-associate">Warehouse Associate</option>
                        <option value="bookkeeper">Bookkeeper</option>
                        <option value="hvac-sales-representative">HVAC Sales Representative</option>
                        <option value="hvac-service-manager">HVAC Service Manager</option>
                        <option value="apprentice">Apprentice</option>
                      </PositionDropdown>
                    </div>
                    <div style={{ flex: '0 0 160px' }}>
                      <PositionLabel htmlFor="years-select" style={{ fontSize: '0.85rem' }}>Req. Experience</PositionLabel>
                      <PositionDropdown id="years-select" value={requiredYearsExperience} onChange={e => setRequiredYearsExperience(Number(e.target.value))}>
                        {[0.5,1,1.5,2,2.5,3,3.5,4,5,6,7,8,10].map(y => (
                          <option key={y} value={y}>{y} {y === 1 ? 'year' : 'years'}</option>
                        ))}
                      </PositionDropdown>
                    </div>
                  </div>
                )}
              </PositionSelector>

              <UploadSection
                onClick={() => document.getElementById('fileInput')?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]); }}
                className={isDragging ? 'dragging' : ''}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  <FileText size={64} color="#4ade80" />
                </div>
                <UploadText>{selectedFile ? 'File Selected!' : 'Drop your resume here or click to browse'}</UploadText>
                <UploadHint>Supports PDF files up to 5MB</UploadHint>
                <input id="fileInput" type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
                <BrowseButton as="div">{selectedFile ? 'Change File' : 'Browse Files'}</BrowseButton>
                {selectedFile && <FileName>📎 {selectedFile.name}</FileName>}
              </UploadSection>

              {selectedFile && !isAnalyzing && (
                <BrowseButton onClick={handleAnalyze}>Analyze Resume with AI</BrowseButton>
              )}
              {isAnalyzing && (
                <AnalyzingLoader>
                  <LoaderSpinner />
                  <LoaderText>Analyzing resume with AI...</LoaderText>
                  <p style={{ color: '#999', marginTop: '0.5rem', fontSize: '0.875rem' }}>This may take 10–15 seconds</p>
                </AnalyzingLoader>
              )}
            </>
          ) : (
            /* ── Results — same style, much shorter ── */
            <div>

              {/* Hiring recommendation — at the top so it's the first thing seen */}
              {r!.hiringRecommendation && (
                <RecommendationBadge type={getRecType(r!.hiringRecommendation)}>
                  Hiring Recommendation: {r!.hiringRecommendation.replace(/_/g, ' ')}
                </RecommendationBadge>
              )}

              {/* Score */}
              <ScoreCard>
                <ScoreLabel>Overall Score</ScoreLabel>
                <ScoreValue>{r!.overallScore}</ScoreValue>
                <ScoreOutOf>out of 100</ScoreOutOf>
              </ScoreCard>

              {/* Overqualified warning */}
              {r!.isOverqualified && (
                <DetailSection style={{ borderLeft: '4px solid #f59e0b', background: '#2a2a1a', marginBottom: '1rem' }}>
                  <DetailTitle style={{ color: '#f59e0b' }}>⚠️ Overqualified</DetailTitle>
                  <DetailContent style={{ fontSize: '0.875rem' }}>
                    {r!.overqualificationReason || 'Placed in lower tier due to overqualification.'}
                  </DetailContent>
                </DetailSection>
              )}

              {/* Summary */}
              {r!.summary && (
                <DetailSection>
                  <DetailContent>{r!.summary}</DetailContent>
                </DetailSection>
              )}

              {/* Skills + Certifications side by side */}
              <SplitRow>
                {r!.technicalSkills && (
                  <DetailSection style={{ marginBottom: 0 }}>
                    <DetailTitle>
                      Technical Skills
                      {r!.technicalSkills.score != null && <ScoreBadge>{r!.technicalSkills.score}/100</ScoreBadge>}
                    </DetailTitle>
                    <DetailContent>
                      <TagRow>
                        {(r!.technicalSkills.found ?? []).slice(0, 4).map((s, i) => <Tag key={i} found>{s}</Tag>)}
                        {(r!.technicalSkills.missing ?? []).slice(0, 3).map((s, i) => <Tag key={i}>{s}</Tag>)}
                      </TagRow>
                    </DetailContent>
                  </DetailSection>
                )}
                {r!.certifications && (
                  <DetailSection style={{ marginBottom: 0 }}>
                    <DetailTitle>
                      Certifications
                      {r!.certifications.score != null && <ScoreBadge>{r!.certifications.score}/100</ScoreBadge>}
                    </DetailTitle>
                    <DetailContent>
                      <TagRow>
                        {(r!.certifications.found ?? []).length > 0
                          ? (r!.certifications.found!).slice(0, 4).map((c, i) => <Tag key={i} found>{c}</Tag>)
                          : <Tag>None found</Tag>}
                        {(r!.certifications.recommended ?? []).slice(0, 2).map((c, i) => <Tag key={i}>{c}</Tag>)}
                      </TagRow>
                    </DetailContent>
                  </DetailSection>
                )}
              </SplitRow>

              {/* Experience */}
              {r!.experience && (
                <DetailSection>
                  <DetailTitle>
                    Experience
                    {r!.experience.score != null && <ScoreBadge>{r!.experience.score}/100</ScoreBadge>}
                  </DetailTitle>
                  <DetailContent>
                    {r!.experience.yearsOfExperience != null && (
                      <p style={{ marginBottom: '0.5rem' }}><strong>{r!.experience.yearsOfExperience} years</strong> of experience</p>
                    )}
                    {(r!.experience.relevantExperience?.length ?? 0) > 0 && (
                      <MiniList>
                        {r!.experience.relevantExperience!.slice(0, 4).map((e, i) => <li key={i}>{e}</li>)}
                      </MiniList>
                    )}
                  </DetailContent>
                </DetailSection>
              )}

              {/* Strengths + Weaknesses side by side */}
              {((r!.strengths?.length ?? 0) > 0 || (r!.weaknesses?.length ?? 0) > 0) && (
                <SplitRow>
                  {(r!.strengths?.length ?? 0) > 0 && (
                    <DetailSection style={{ marginBottom: 0 }}>
                      <DetailTitle>Strengths</DetailTitle>
                      <DetailContent>
                        <MiniList>
                          {r!.strengths!.slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}
                        </MiniList>
                      </DetailContent>
                    </DetailSection>
                  )}
                  {(r!.weaknesses?.length ?? 0) > 0 && (
                    <DetailSection style={{ marginBottom: 0 }}>
                      <DetailTitle style={{ color: '#f87171' }}>Weaknesses</DetailTitle>
                      <DetailContent>
                        <MiniList>
                          {r!.weaknesses!.slice(0, 4).map((w, i) => <li key={i}>{w}</li>)}
                        </MiniList>
                      </DetailContent>
                    </DetailSection>
                  )}
                </SplitRow>
              )}

              {/* Actions */}
              <ActionRow>
                {candidateId && selectedFile && (
                  <>
                    <ActionButton variant="ghost" onClick={() => setResumeFileOpen(true)}>
                      <FileText size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                      View Resume
                    </ActionButton>
                    <ResumeFileModal
                      isOpen={resumeFileOpen}
                      onClose={() => setResumeFileOpen(false)}
                      candidateId={candidateId}
                      filename={selectedFile.name}
                    />
                  </>
                )}
                {selectedJobId ? (
                  <ActionButton onClick={() => navigate('/talent-pool-manager')}>
                    ✓ Added to {jobs.find(j => j.id === selectedJobId)?.title || 'job'} — View Pipeline →
                  </ActionButton>
                ) : (
                  <ActionButton onClick={() => candidateId ? setIsAddToJobModalOpen(true) : alert('No candidate found.')}>
                    💼 Add to Job Pipeline
                  </ActionButton>
                )}
                <ActionButton variant="ghost" onClick={handleNewAnalysis}>Analyze Another</ActionButton>
              </ActionRow>
            </div>
          )}
        </MainCard>
      </MainContent>

      {/* Modal */}
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
            <ModalButton variant="secondary" onClick={() => { setIsAddToJobModalOpen(false); setSelectedJobForAdd(null); }}>
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

export default ResumeAnalysis;
