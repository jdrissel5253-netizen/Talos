import React, { useState } from 'react';
import styled from 'styled-components';
import { config } from '../config';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  padding: 2rem;
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
  border-bottom: 2px solid #e5e5e5;
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
  border-top: 1px solid #e5e5e5;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const DetailSection = styled.div`
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #333333;
`;

const DetailTitle = styled.h4`
  font-size: 1rem;
  color: #4ade80;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailScore = styled.span`
  background: #4ade80;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: auto;
`;

const DetailContent = styled.div`
  color: #e0e0e0;
  font-size: 0.875rem;
  line-height: 1.6;
`;

const List = styled.ul`
  margin: 0.5rem 0;
  padding-left: 1.25rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.25rem;
`;

const RecommendationBadge = styled.div<{ type: 'success' | 'warning' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
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
  font-size: 0.875rem;
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

const NavButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const NavButton = styled.button`
  background: transparent;
  border: 2px solid #4ade80;
  color: #4ade80;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    background: #4ade80;
    color: white;
    transform: translateY(-1px);
  }
`;

interface CandidateResult {
  id: number;
  filename: string;
  status: string;
  analysis?: {
    overallScore: number;
    scoreOutOf10: number;
    isOverqualified?: boolean;
    overqualificationReason?: string | null;
    summary: string;
    technicalSkills?: any;
    certifications?: any;
    experience?: any;
    presentationQuality?: any;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    hiringRecommendation?: string;
    // New format fields
    keyStrengths?: string[];
    concerns?: string[];
    recommendationSummary?: string;
  };
  error?: string;
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
    formData.append('position', selectedPosition);
    formData.append('requiredYearsExperience', requiredYearsExperience.toString());
    formData.append('flexibleOnTitle', flexibleOnTitle.toString());

    try {
      const response = await fetch(`${config.apiUrl}/api/resume/upload-batch`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'success') {
        setResults(data.data.results);
      } else {
        alert('Error analyzing resumes: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze resumes. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedFiles([]);
    setResults([]);
    setExpandedCandidates(new Set());
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

  const getRecommendationType = (recommendation: string): 'success' | 'warning' | 'info' => {
    if (recommendation.includes('STRONG_YES') || recommendation.includes('YES')) return 'success';
    if (recommendation.includes('NO')) return 'warning';
    return 'info';
  };

  return (
    <Container>
      <MainCard>
        <Header>
          <Title>Batch Resume Analyzer</Title>
          <Subtitle>Upload multiple HVAC technician resumes for instant AI-powered analysis</Subtitle>
        </Header>

        <NavButtonsContainer>
          <NavButton onClick={() => navigate('/jobs-management')}>
            💼 View My Jobs
          </NavButton>
          <NavButton onClick={() => navigate('/talent-pool-manager')}>
            👥 View Talent Pool
          </NavButton>
        </NavButtonsContainer>

        <PositionSelectorContainer>
          <PositionLabel htmlFor="position-select">
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
        </PositionSelectorContainer>

        {results.length === 0 ? (
          <>
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
              <UploadHint>Upload up to 10 PDF files (5MB each)</UploadHint>
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
                  This may take 10-15 seconds per resume ({selectedFiles.length} total)
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
                  return (
                    <CandidateCard
                      key={candidate.id}
                      expanded={isExpanded}
                      onClick={() => toggleCandidate(candidate.id)}
                    >
                      <CandidateHeader>
                        <CandidateScore>
                          <ScoreNumber>{candidate.analysis?.overallScore}</ScoreNumber>
                          <ScoreLabel>out of 100</ScoreLabel>
                        </CandidateScore>

                        <CandidateInfo>
                          <CandidateName>
                            {candidate.filename.replace('.pdf', '')}
                            {candidate.analysis?.isOverqualified && (
                              <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontSize: '0.875rem' }}>
                                ⚠️ Overqualified
                              </span>
                            )}
                          </CandidateName>
                          <CandidateSummary>{candidate.analysis?.summary}</CandidateSummary>
                        </CandidateInfo>

                        <ExpandIcon className={isExpanded ? 'expanded' : ''}>
                          ▼
                        </ExpandIcon>
                      </CandidateHeader>

                      {isExpanded && candidate.analysis && (
                        <CandidateDetails>
                          {candidate.analysis.isOverqualified && (
                            <DetailSection style={{ background: '#2a2a1a', borderLeft: '4px solid #f59e0b', gridColumn: '1 / -1' }}>
                              <DetailTitle style={{ color: '#f59e0b' }}>⚠️ Overqualified Candidate</DetailTitle>
                              <DetailContent>
                                <p>{candidate.analysis.overqualificationReason}</p>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
                                  Placed in lower "give them a chance" tier (70-75) due to overqualification.
                                </p>
                              </DetailContent>
                            </DetailSection>
                          )}

                          {/* Only show detailed breakdown if old format data exists */}
                          {candidate.analysis.technicalSkills && (
                            <DetailGrid>
                              <DetailSection>
                                <DetailTitle>
                                  Technical Skills
                                  <DetailScore>{candidate.analysis.technicalSkills?.score || 0}/100</DetailScore>
                                </DetailTitle>
                                <DetailContent>
                                  <strong>Found:</strong>
                                  <List>
                                    {(candidate.analysis.technicalSkills?.found || []).slice(0, 3).map((skill: string, idx: number) => (
                                      <ListItem key={idx}>{skill}</ListItem>
                                    ))}
                                  </List>
                                </DetailContent>
                              </DetailSection>

                              <DetailSection>
                                <DetailTitle>
                                  Certifications
                                  <DetailScore>{candidate.analysis.certifications?.score || 0}/100</DetailScore>
                                </DetailTitle>
                                <DetailContent>
                                  {(candidate.analysis.certifications?.found || []).length > 0 ? (
                                    <List>
                                      {candidate.analysis.certifications.found.map((cert: string, idx: number) => (
                                        <ListItem key={idx}>{cert}</ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <p>No certifications found</p>
                                  )}
                                </DetailContent>
                              </DetailSection>

                              <DetailSection>
                                <DetailTitle>
                                  Experience
                                  <DetailScore>{candidate.analysis.experience?.score || 0}/100</DetailScore>
                                </DetailTitle>
                                <DetailContent>
                                  <p><strong>Years:</strong> {candidate.analysis.experience?.yearsOfExperience || 0}</p>
                                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                    {candidate.analysis.experience?.feedback || ''}
                                  </p>
                                </DetailContent>
                              </DetailSection>

                              <DetailSection>
                                <DetailTitle>
                                  Presentation
                                  <DetailScore>{candidate.analysis.presentationQuality?.score || 0}/100</DetailScore>
                                </DetailTitle>
                                <DetailContent>
                                  <p>{candidate.analysis.presentationQuality?.feedback || ''}</p>
                                </DetailContent>
                              </DetailSection>
                            </DetailGrid>
                          )}

                          <DetailSection>
                            <DetailTitle>Key Strengths</DetailTitle>
                            <DetailContent>
                              <List>
                                {(candidate.analysis.keyStrengths || candidate.analysis.strengths || []).map((strength, idx) => (
                                  <ListItem key={idx}>{strength}</ListItem>
                                ))}
                              </List>
                            </DetailContent>
                          </DetailSection>

                          <DetailSection style={{ marginTop: '1rem' }}>
                            <DetailTitle>Areas for Development</DetailTitle>
                            <DetailContent>
                              <List>
                                {(candidate.analysis.concerns || candidate.analysis.weaknesses || []).map((item, idx) => (
                                  <ListItem key={idx}>{item}</ListItem>
                                ))}
                              </List>
                            </DetailContent>
                          </DetailSection>

                          {(candidate.analysis.recommendations || candidate.analysis.recommendationSummary) && (
                            <DetailSection style={{ marginTop: '1rem' }}>
                              <DetailTitle>Recommendations</DetailTitle>
                              <DetailContent>
                                {candidate.analysis.recommendationSummary ? (
                                  <p>{candidate.analysis.recommendationSummary}</p>
                                ) : (
                                  <List>
                                    {(candidate.analysis.recommendations || []).map((rec, idx) => (
                                      <ListItem key={idx}>{rec}</ListItem>
                                    ))}
                                  </List>
                                )}
                              </DetailContent>
                            </DetailSection>
                          )}

                          {candidate.analysis.hiringRecommendation && (
                            <RecommendationBadge type={getRecommendationType(candidate.analysis.hiringRecommendation)}>
                              <RecommendationText>
                                Hiring Recommendation: {candidate.analysis.hiringRecommendation.replace(/_/g, ' ')}
                              </RecommendationText>
                            </RecommendationBadge>
                          )}
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
    </Container>
  );
};

export default BatchResumeAnalysis;
