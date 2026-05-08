import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Upload, MapPin, Briefcase, FileText } from 'lucide-react';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

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
    top: 0;
    bottom: 0;
    z-index: 1000;
    width: 280px;
  }
`;

const ToggleButton = styled.button`
  background: #4ade80;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1rem;
  width: 100%;
  font-size: 0.875rem;

  &:hover {
    background: #3bc76a;
  }
`;

const SidebarTitle = styled.h3`
  color: #4ade80;
  font-size: 1.125rem;
  margin-bottom: 1rem;
`;

const JobItem = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? '#000000' : '#0f0f0f'};
  border: 2px solid ${props => props.isActive ? '#4ade80' : '#333333'};
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4ade80;
  }
`;

const JobItemTitle = styled.div`
  color: #e0e0e0;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const JobItemMeta = styled.div`
  color: #999;
  font-size: 0.75rem;
`;

const ViewAllButton = styled.button`
  background: transparent;
  border: 2px solid #4ade80;
  color: #4ade80;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #4ade80;
    color: white;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const MainCard = styled.div`
  max-width: 900px;
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

const FileName = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #1a1a1a;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4ade80;
  font-weight: 600;
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

const ResultsSection = styled.div`
  margin-top: 2rem;
`;

const ScoreCard = styled.div`
  background: linear-gradient(135deg, #4ade80 0%, #4ade80 100%);
  color: white;
  padding: 2.5rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
`;

const ScoreLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ScoreValue = styled.div`
  font-size: 5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ScoreOutOf = styled.div`
  font-size: 1.5rem;
  opacity: 0.8;
`;

const DetailSection = styled.div`
  background: #000000;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const DetailTitle = styled.h3`
  font-size: 1.25rem;
  color: #4ade80;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailContent = styled.div`
  color: #e0e0e0;
  line-height: 1.6;
`;

const ScoreBadge = styled.span`
  background: #4ade80;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  margin-left: auto;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
`;

const List = styled.ul`
  margin-left: 1.25rem;
  margin-bottom: 1rem;
`;

const RecommendationBadge = styled.div<{ type: 'success' | 'warning' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  background: ${props => {
    if (props.type === 'success') return '#e8f5e9';
    if (props.type === 'warning') return '#fff3e0';
    return '#e3f2fd';
  }};
  border-left: 4px solid ${props => {
    if (props.type === 'success') return '#4caf50';
    if (props.type === 'warning') return '#ff9800';
    return '#2196f3';
  }};
`;

const RecommendationText = styled.p`
  color: #e0e0e0;
  font-weight: 600;
  font-size: 1.125rem;
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

const AddToJobButton = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  color: #4ade80;
  margin-bottom: 1.5rem;
`;

const ModalJobList = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalJobItem = styled.div`
  background: #000000;
  border: 2px solid #333333;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4ade80;
  }

  &.selected {
    border-color: #4ade80;
    background: #0a2a1a;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ModalButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' ? `
    background: #4ade80;
    color: white;
    border: none;

    &:hover {
      background: #3bc76a;
    }
  ` : `
    background: transparent;
    color: #e0e0e0;
    border: 2px solid #333333;

    &:hover {
      border-color: #4ade80;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PositionSelector = styled.div`
  margin-bottom: 2rem;
`;

const PositionLabel = styled.label`
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #4ade80;
  margin-bottom: 0.75rem;
`;

const PositionDropdown = styled.select`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #4ade80;
  border-radius: 6px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    border-color: #4ade80;
  }

  &:focus {
    outline: none;
    border-color: #4ade80;
    box-shadow: 0 0 0 3px rgba(26, 90, 58, 0.1);
  }
`;

interface AnalysisResult {
  overallScore: number;
  scoreOutOf10?: number;
  isOverqualified?: boolean;
  overqualificationReason?: string | null;
  summary?: string;
  technicalSkills?: {
    score?: number;
    found?: string[];
    missing?: string[];
    feedback?: string;
  };
  certifications?: {
    score?: number;
    found?: string[];
    recommended?: string[];
    feedback?: string;
  };
  transferableSkills?: {
    schedulingCoordination?: string;
    customerInteraction?: string;
    highVolumeEnvironment?: string;
    administrativeCompetency?: string;
    feedback?: string;
  };
  experience?: {
    score?: number;
    yearsOfExperience?: number;
    relevantExperience?: string[];
    feedback?: string;
  };
  presentationQuality?: {
    score?: number;
    strengths?: string[];
    improvements?: string[];
    feedback?: string;
  };
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  hiringRecommendation?: string;
}

interface Job {
  id: number;
  title: string;
  location: string;
  city?: string;
  required_years_experience: number;
  vehicle_required: boolean;
  flexible_on_title?: boolean;
}

const ResumeAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>('hvac-technician');
  const [requiredYearsExperience, setRequiredYearsExperience] = useState<number>(2);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobForAdd, setSelectedJobForAdd] = useState<number | null>(null);
  const [isAddToJobModalOpen, setIsAddToJobModalOpen] = useState(false);
  const [candidateId, setCandidateId] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('fileInput')?.click();
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
      const response = await fetch(`${config.apiUrl}/api/resume/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setAnalysisResult(data.data.analysis);
        if (data.data.candidateId) {
          setCandidateId(data.data.candidateId);
        }
      } else {
        alert('Error analyzing resume: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setCandidateId(null);
    setSelectedJobId(null);
  };

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/jobs?userId=1`, { headers: getAuthHeaders() });
      const data = await response.json();
      if (data.status === 'success') {
        setJobs(data.data.jobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleAddToJob = () => {
    if (!candidateId) {
      alert('No candidate analysis found. Please analyze a resume first.');
      return;
    }
    setIsAddToJobModalOpen(true);
  };

  const handleConfirmAddToJob = async () => {
    if (!selectedJobForAdd || !candidateId) return;

    try {
      const response = await fetch(
        `${config.apiUrl}/api/jobs/${selectedJobForAdd}/candidates/${candidateId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle_status: 'unknown' // Can be enhanced later
          })
        }
      );

      if (response.ok) {
        alert('Candidate added to job successfully!');
        setIsAddToJobModalOpen(false);
        setSelectedJobForAdd(null);
      } else {
        alert('Failed to add candidate to job');
      }
    } catch (error) {
      console.error('Error adding candidate to job:', error);
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
      <Sidebar isCollapsed={isSidebarCollapsed}>
        {!isSidebarCollapsed && (
          <>
            <ToggleButton onClick={() => setIsSidebarCollapsed(true)}>
              Hide ◀
            </ToggleButton>
            <SidebarTitle>My Jobs</SidebarTitle>
            {jobs.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.875rem', textAlign: 'center' }}>
                No jobs yet
              </p>
            ) : (
              jobs.map(job => (
                <JobItem key={job.id} isActive={false}>
                  <JobItemTitle>{job.title}</JobItemTitle>
                  <JobItemMeta><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> {job.location}</JobItemMeta>
                  <JobItemMeta><Briefcase size={12} style={{ display: 'inline', marginRight: '4px' }} /> {job.required_years_experience}+ years</JobItemMeta>
                </JobItem>
              ))
            )}
            <ViewAllButton onClick={() => navigate('/jobs-management')}>
              View All Jobs →
            </ViewAllButton>
            <ViewAllButton onClick={() => navigate('/talent-pool-manager')} style={{ marginTop: '0.5rem' }}>
              View Talent Pool →
            </ViewAllButton>
          </>
        )}
        {isSidebarCollapsed && (
          <ToggleButton onClick={() => setIsSidebarCollapsed(false)}>
            ▶
          </ToggleButton>
        )}
      </Sidebar>

      <MainContent>
        <MainCard>
          <Header>
            <Title>AI Resume Analyzer</Title>
            <Subtitle>Upload an HVAC technician resume for instant AI-powered analysis</Subtitle>
          </Header>

          {!analysisResult ? (
            <>
              <PositionSelector>
                <PositionLabel htmlFor="job-select">
                  Analyze Against
                </PositionLabel>
                <PositionDropdown
                  id="job-select"
                  value={selectedJobId ?? ''}
                  onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : null)}
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
                      <PositionDropdown id="position-select" value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
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
                      <PositionDropdown id="years-select" value={requiredYearsExperience} onChange={(e) => setRequiredYearsExperience(Number(e.target.value))}>
                        {[0.5,1,1.5,2,2.5,3,3.5,4,5,6,7,8,10].map(y => (
                          <option key={y} value={y}>{y} {y === 1 ? 'year' : 'years'}</option>
                        ))}
                      </PositionDropdown>
                    </div>
                  </div>
                )}
              </PositionSelector>

              <UploadSection
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={isDragging ? 'dragging' : ''}
              >
                <UploadIcon><FileText size={64} color="#4ade80" /></UploadIcon>
                <UploadText>
                  {selectedFile ? 'File Selected!' : 'Drop your resume here or click to browse'}
                </UploadText>
                <UploadHint>Supports PDF files up to 5MB</UploadHint>
                <FileInput
                  id="fileInput"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                <BrowseButton as="div">
                  {selectedFile ? 'Change File' : 'Browse Files'}
                </BrowseButton>
                {selectedFile && (
                  <FileName>📎 {selectedFile.name}</FileName>
                )}
              </UploadSection>

              {selectedFile && !isAnalyzing && (
                <BrowseButton onClick={handleAnalyze}>
                  Analyze Resume with AI
                </BrowseButton>
              )}

              {isAnalyzing && (
                <AnalyzingLoader>
                  <LoaderSpinner />
                  <LoaderText>Analyzing resume with AI...</LoaderText>
                  <p style={{ color: '#999', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    This may take 10-15 seconds
                  </p>
                </AnalyzingLoader>
              )}
            </>
          ) : (
            <ResultsSection>
              <ScoreCard>
                <ScoreLabel>Overall Score</ScoreLabel>
                <ScoreValue>{analysisResult.overallScore}</ScoreValue>
                <ScoreOutOf>out of 100</ScoreOutOf>
              </ScoreCard>

              {analysisResult.isOverqualified && (
                <DetailSection style={{ background: '#2a2a1a', borderLeft: '4px solid #f59e0b' }}>
                  <DetailTitle style={{ color: '#f59e0b' }}>⚠️ Overqualified Candidate</DetailTitle>
                  <DetailContent>
                    {analysisResult.overqualificationReason}
                    <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#999' }}>
                      This candidate has been placed in the lower "give them a chance" tier (70-75) due to being overqualified for this position.
                    </p>
                  </DetailContent>
                </DetailSection>
              )}

              {analysisResult.summary && (
                <DetailSection>
                  <DetailTitle>Summary</DetailTitle>
                  <DetailContent>{analysisResult.summary}</DetailContent>
                </DetailSection>
              )}

              {analysisResult.technicalSkills && (
                <DetailSection>
                  <DetailTitle>
                    Technical Skills
                    {analysisResult.technicalSkills.score != null && (
                      <ScoreBadge>{analysisResult.technicalSkills.score}/100</ScoreBadge>
                    )}
                  </DetailTitle>
                  <DetailContent>
                    {(analysisResult.technicalSkills.found?.length ?? 0) > 0 && (
                      <>
                        <strong>Found:</strong>
                        <List>
                          {analysisResult.technicalSkills.found!.map((skill, idx) => (
                            <ListItem key={idx}>{skill}</ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    {(analysisResult.technicalSkills.missing?.length ?? 0) > 0 && (
                      <>
                        <strong>Missing:</strong>
                        <List>
                          {analysisResult.technicalSkills.missing!.map((skill, idx) => (
                            <ListItem key={idx}>{skill}</ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    {analysisResult.technicalSkills.feedback && (
                      <p>{analysisResult.technicalSkills.feedback}</p>
                    )}
                  </DetailContent>
                </DetailSection>
              )}

              {analysisResult.certifications && (
                <DetailSection>
                  <DetailTitle>
                    Certifications
                    {analysisResult.certifications.score != null && (
                      <ScoreBadge>{analysisResult.certifications.score}/100</ScoreBadge>
                    )}
                  </DetailTitle>
                  <DetailContent>
                    <strong>Found:</strong>
                    <List>
                      {(analysisResult.certifications.found?.length ?? 0) > 0
                        ? analysisResult.certifications.found!.map((cert, idx) => (
                            <ListItem key={idx}>{cert}</ListItem>
                          ))
                        : <ListItem>No certifications found</ListItem>
                      }
                    </List>
                    {(analysisResult.certifications.recommended?.length ?? 0) > 0 && (
                      <>
                        <strong>Recommended:</strong>
                        <List>
                          {analysisResult.certifications.recommended!.map((cert, idx) => (
                            <ListItem key={idx}>{cert}</ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    {analysisResult.certifications.feedback && (
                      <p>{analysisResult.certifications.feedback}</p>
                    )}
                  </DetailContent>
                </DetailSection>
              )}

              {analysisResult.transferableSkills && (
                <DetailSection>
                  <DetailTitle>Transferable Skills</DetailTitle>
                  <DetailContent>
                    <List>
                      {analysisResult.transferableSkills.schedulingCoordination && (
                        <ListItem><strong>Scheduling & Coordination:</strong> {analysisResult.transferableSkills.schedulingCoordination}</ListItem>
                      )}
                      {analysisResult.transferableSkills.customerInteraction && (
                        <ListItem><strong>Customer Interaction:</strong> {analysisResult.transferableSkills.customerInteraction}</ListItem>
                      )}
                      {analysisResult.transferableSkills.highVolumeEnvironment && (
                        <ListItem><strong>High-Volume Environment:</strong> {analysisResult.transferableSkills.highVolumeEnvironment}</ListItem>
                      )}
                      {analysisResult.transferableSkills.administrativeCompetency && (
                        <ListItem><strong>Administrative Competency:</strong> {analysisResult.transferableSkills.administrativeCompetency}</ListItem>
                      )}
                    </List>
                    {analysisResult.transferableSkills.feedback && (
                      <p>{analysisResult.transferableSkills.feedback}</p>
                    )}
                  </DetailContent>
                </DetailSection>
              )}

              {analysisResult.experience && (
                <DetailSection>
                  <DetailTitle>
                    Experience
                    {analysisResult.experience.score != null && (
                      <ScoreBadge>{analysisResult.experience.score}/100</ScoreBadge>
                    )}
                  </DetailTitle>
                  <DetailContent>
                    {analysisResult.experience.yearsOfExperience != null && (
                      <p><strong>Years of Experience:</strong> {analysisResult.experience.yearsOfExperience}</p>
                    )}
                    {(analysisResult.experience.relevantExperience?.length ?? 0) > 0 && (
                      <>
                        <strong>Relevant Experience:</strong>
                        <List>
                          {analysisResult.experience.relevantExperience!.map((exp, idx) => (
                            <ListItem key={idx}>{exp}</ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    {analysisResult.experience.feedback && (
                      <p>{analysisResult.experience.feedback}</p>
                    )}
                  </DetailContent>
                </DetailSection>
              )}

              {analysisResult.presentationQuality && (
                <DetailSection>
                  <DetailTitle>
                    Presentation Quality
                    {analysisResult.presentationQuality.score != null && (
                      <ScoreBadge>{analysisResult.presentationQuality.score}/100</ScoreBadge>
                    )}
                  </DetailTitle>
                  <DetailContent>
                    {(analysisResult.presentationQuality.strengths?.length ?? 0) > 0 && (
                      <>
                        <strong>Strengths:</strong>
                        <List>
                          {analysisResult.presentationQuality.strengths!.map((s, idx) => (
                            <ListItem key={idx}>{s}</ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    {(analysisResult.presentationQuality.improvements?.length ?? 0) > 0 && (
                      <>
                        <strong>Areas for Improvement:</strong>
                        <List>
                          {analysisResult.presentationQuality.improvements!.map((imp, idx) => (
                            <ListItem key={idx}>{imp}</ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    {analysisResult.presentationQuality.feedback && (
                      <p>{analysisResult.presentationQuality.feedback}</p>
                    )}
                  </DetailContent>
                </DetailSection>
              )}

              {(analysisResult.strengths?.length ?? 0) > 0 && (
                <DetailSection>
                  <DetailTitle>Key Strengths</DetailTitle>
                  <DetailContent>
                    <List>
                      {analysisResult.strengths!.map((s, idx) => <ListItem key={idx}>{s}</ListItem>)}
                    </List>
                  </DetailContent>
                </DetailSection>
              )}

              {(analysisResult.weaknesses?.length ?? 0) > 0 && (
                <DetailSection>
                  <DetailTitle>Areas for Improvement</DetailTitle>
                  <DetailContent>
                    <List>
                      {analysisResult.weaknesses!.map((w, idx) => <ListItem key={idx}>{w}</ListItem>)}
                    </List>
                  </DetailContent>
                </DetailSection>
              )}

              {(analysisResult.recommendations?.length ?? 0) > 0 && (
                <DetailSection>
                  <DetailTitle>Recommendations</DetailTitle>
                  <DetailContent>
                    <List>
                      {analysisResult.recommendations!.map((r, idx) => <ListItem key={idx}>{r}</ListItem>)}
                    </List>
                  </DetailContent>
                </DetailSection>
              )}

              {analysisResult.hiringRecommendation && (
                <RecommendationBadge type={getRecommendationType(analysisResult.hiringRecommendation)}>
                  <RecommendationText>
                    Hiring Recommendation: {analysisResult.hiringRecommendation.replace(/_/g, ' ')}
                  </RecommendationText>
                </RecommendationBadge>
              )}

              {selectedJobId ? (
                <AddToJobButton
                  style={{ background: '#166534', cursor: 'default' }}
                  onClick={() => navigate('/talent-pool-manager')}
                >
                  ✓ Added to {jobs.find(j => j.id === selectedJobId)?.title || 'job'} pipeline — View Talent Pool →
                </AddToJobButton>
              ) : (
                <AddToJobButton onClick={handleAddToJob}>
                  💼 Add to Job Pipeline
                </AddToJobButton>
              )}

              <NewAnalysisButton onClick={handleNewAnalysis}>
                Analyze Another Resume
              </NewAnalysisButton>
            </ResultsSection>
          )}
        </MainCard>
      </MainContent>

      <Modal isOpen={isAddToJobModalOpen}>
        <ModalContent>
          <ModalTitle>Add Candidate to Job</ModalTitle>
          <ModalJobList>
            {jobs.length === 0 ? (
              <p style={{ color: '#999' }}>No jobs available. Create a job first.</p>
            ) : (
              jobs.map(job => (
                <ModalJobItem
                  key={job.id}
                  className={selectedJobForAdd === job.id ? 'selected' : ''}
                  onClick={() => setSelectedJobForAdd(job.id)}
                >
                  <div style={{ fontWeight: 600, color: '#e0e0e0', marginBottom: '0.25rem' }}>
                    {job.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#999' }}>
                    📍 {job.location} • 💼 {job.required_years_experience}+ years
                  </div>
                </ModalJobItem>
              ))
            )}
          </ModalJobList>
          <ModalActions>
            <ModalButton variant="secondary" onClick={() => {
              setIsAddToJobModalOpen(false);
              setSelectedJobForAdd(null);
            }}>
              Cancel
            </ModalButton>
            <ModalButton
              variant="primary"
              disabled={!selectedJobForAdd}
              onClick={handleConfirmAddToJob}
            >
              Add to Job
            </ModalButton>
          </ModalActions>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ResumeAnalysis;
