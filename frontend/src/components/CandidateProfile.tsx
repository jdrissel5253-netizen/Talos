import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { ArrowLeft, User, Briefcase, Star, Shield, AlertTriangle, Award, Phone, Mail, MapPin, Calendar, Clock, FileText, Smartphone, XCircle, Pencil, Check, X } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { config as appConfig } from '../config';
import ResumeFileModal from './ResumeFileModal';
import ContactRejectionModal from './ContactRejectionModal';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── layout ───────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  font-family: 'Sora', sans-serif;
  padding: 0 0 5rem;
`;

const TopBar = styled.div`
  border-bottom: 1px solid #232830;
  padding: 1.75rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: #111318;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid #2a3040;
  color: #8a9ab0;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));

  &:hover {
    border-color: #4ade80;
    color: #4ade80;
  }
`;

const TopBarTitle = styled.h1`
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.01em;
`;

const Inner = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 2.5rem 0;
  animation: ${fadeUp} 0.5s ease both;

  @media (max-width: 768px) {
    padding: 1.5rem 1.5rem 0;
  }
`;

// ─── hero ─────────────────────────────────────────────────────────────────────

const Hero = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  padding: 2rem;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const HeroLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CandidateName = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

const JobBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: #8a9ab0;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: #6e7d8e;
  font-family: 'JetBrains Mono', monospace;
`;

const HeroRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
`;

const ScoreRing = styled.div<{ tier: string }>`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid ${p =>
    p.tier === 'green' ? '#4ade80' :
    p.tier === 'yellow' ? '#fbbf24' : '#f87171'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${p =>
    p.tier === 'green' ? 'rgba(74,222,128,0.05)' :
    p.tier === 'yellow' ? 'rgba(251,191,36,0.05)' : 'rgba(248,113,113,0.05)'};
`;

const ScoreNumber = styled.span<{ tier: string }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1;
  color: ${p =>
    p.tier === 'green' ? '#4ade80' :
    p.tier === 'yellow' ? '#fbbf24' : '#f87171'};
`;

const ScoreLabel = styled.span`
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
  margin-top: 2px;
`;

const TierBadge = styled.span<{ tier: string }>`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 0.3rem 0.75rem;
  color: ${p =>
    p.tier === 'green' ? '#4ade80' :
    p.tier === 'yellow' ? '#fbbf24' : '#f87171'};
  background: ${p =>
    p.tier === 'green' ? 'rgba(74,222,128,0.08)' :
    p.tier === 'yellow' ? 'rgba(251,191,36,0.08)' : 'rgba(248,113,113,0.08)'};
  border: 1px solid ${p =>
    p.tier === 'green' ? 'rgba(74,222,128,0.2)' :
    p.tier === 'yellow' ? 'rgba(251,191,36,0.2)' : 'rgba(248,113,113,0.2)'};
`;

const StatusBadge = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.6rem;
  color: #8a9ab0;
  border: 1px solid #2a3040;
  text-transform: uppercase;
`;

// ─── cards ────────────────────────────────────────────────────────────────────

const Card = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #1e2330;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const CardTitle = styled.h3`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8a9ab0;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

// ─── summary ──────────────────────────────────────────────────────────────────

const SummaryText = styled.p`
  font-size: 0.88rem;
  line-height: 1.7;
  color: #c8d0dc;
  font-weight: 400;
`;

// ─── strengths / weaknesses ───────────────────────────────────────────────────

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const StrengthItem = styled.li`
  display: flex;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: #c8d0dc;
  line-height: 1.5;

  &::before {
    content: '•';
    color: #4ade80;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const WeaknessItem = styled.li`
  display: flex;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: #c8d0dc;
  line-height: 1.5;

  &::before {
    content: '•';
    color: #f59e0b;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

// ─── certs ────────────────────────────────────────────────────────────────────

const CertList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CertChip = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: #a78bfa;
  background: rgba(167,139,250,0.08);
  border: 1px solid rgba(167,139,250,0.2);
  padding: 0.3rem 0.75rem;
  letter-spacing: 0.04em;
`;

// ─── contact ──────────────────────────────────────────────────────────────────

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ContactLabel = styled.span`
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6e7d8e;
`;

const ContactValue = styled.span`
  font-size: 0.82rem;
  color: #c8d0dc;
  font-weight: 500;
`;

const EmailEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const EmailInput = styled.input`
  background: #111318;
  border: 1px solid #2a3040;
  color: #c8d0dc;
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  padding: 0.3rem 0.6rem;
  outline: none;
  width: 200px;
  &:focus { border-color: #4ade80; }
`;

const IconBtn = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  color: #6e7d8e;
  transition: color 0.15s;
  &:hover { color: #4ade80; }
`;

// ─── action bar ───────────────────────────────────────────────────────────────

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  background: transparent;
  border: 1px solid #2a3040;
  color: #8a9ab0;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));

  &:hover {
    border-color: #4ade80;
    color: #4ade80;
  }
`;

const StatusSelect = styled.select`
  padding: 0.55rem 1.1rem;
  background: #1a1f2a;
  border: 1px solid #2a3040;
  color: #8a9ab0;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.02em;
  outline: none;
  transition: border-color 0.15s ease;

  &:hover, &:focus { border-color: #4ade80; color: #c8d0dc; }

  option { background: #1a1f2a; }
`;

const StatusLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6e7d8e;
  align-self: center;
`;

// ─── loading / error ──────────────────────────────────────────────────────────

const CenterMsg = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: #6e7d8e;
  letter-spacing: 0.08em;
`;

// ─── helpers ──────────────────────────────────────────────────────────────────

function friendlyName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()).trim();
}

// ─── types ────────────────────────────────────────────────────────────────────

interface Profile {
  pipeline_id: number;
  candidate_id: number;
  job_id: number;
  tier: 'green' | 'yellow' | 'red';
  tier_score: number;
  star_rating: number;
  pipeline_status: string;
  vehicle_status: string;
  ai_summary: string;
  contacted_via: string | null;
  contacted_at: string | null;
  filename: string;
  upload_date: string;
  applicant_email: string | null;
  overall_score: number;
  summary: string;
  years_of_experience: number;
  certifications_found: string[];
  hiring_recommendation: string;
  strengths: string[];
  weaknesses: string[];
  job_title: string;
  job_city: string;
}

// ─── component ────────────────────────────────────────────────────────────────

const CandidateProfile: React.FC = () => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [contactModal, setContactModal] = useState<{ mode: 'contact' | 'rejection'; commType: 'email' | 'sms' } | null>(null);
  const [schedulingLink, setSchedulingLink] = useState('');
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  useEffect(() => {
    fetch(`${appConfig.apiUrl}/api/auth/me`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setSchedulingLink(d.data.schedulingLink || ''); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
    fetch(`${appConfig.apiUrl}/api/pipeline/${pipelineId}/profile`, { headers })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') setProfile(res.data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [pipelineId]);

  const displayName = profile ? friendlyName(profile.filename) : '';

  const handleEmailSave = async () => {
    if (!profile || emailSaving) return;
    setEmailSaving(true);
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/pipeline/${profile.pipeline_id}/email`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailDraft.trim() }),
      });
      if (res.ok) {
        setProfile(p => p ? { ...p, applicant_email: emailDraft.trim() || null } : p);
        setEmailEditing(false);
      }
    } finally {
      setEmailSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!profile || statusUpdating) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/pipeline/${profile.pipeline_id}/status`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setProfile(p => p ? { ...p, pipeline_status: newStatus } : p);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <>
      <FontImport />
      <Page>
        <TopBar>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={13} /> Back
          </BackButton>
          <TopBarTitle>Candidate Profile</TopBarTitle>
        </TopBar>

        <Inner>
          {loading && <CenterMsg>Loading profile...</CenterMsg>}
          {error && <CenterMsg>Could not load candidate profile.</CenterMsg>}

          <ResumeFileModal
            isOpen={resumeOpen}
            onClose={() => setResumeOpen(false)}
            candidateId={profile?.candidate_id ?? null}
            filename={profile?.filename ?? ''}
          />

          {profile && (
            <>
              {/* ── Action Bar ── */}
              <ActionBar>
                <ActionBtn onClick={() => setResumeOpen(true)}>
                  <FileText size={13} /> View Resume
                </ActionBtn>
                <ActionBtn onClick={() => setContactModal({ mode: 'contact', commType: 'email' })}>
                  <Mail size={13} /> Email
                </ActionBtn>
                <ActionBtn onClick={() => setContactModal({ mode: 'contact', commType: 'sms' })}>
                  <Smartphone size={13} /> SMS
                </ActionBtn>
                {schedulingLink && (
                  <ActionBtn onClick={() => {
                    try {
                      const url = new URL(schedulingLink);
                      url.searchParams.set('name', displayName);
                      window.open(url.toString(), '_blank');
                    } catch {
                      window.open(schedulingLink, '_blank');
                    }
                  }} style={{ borderColor: 'rgba(167,139,250,0.3)', color: '#a78bfa' }}>
                    <Calendar size={13} /> Schedule Interview
                  </ActionBtn>
                )}
                <ActionBtn onClick={() => setContactModal({ mode: 'rejection', commType: 'email' })}
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                  <XCircle size={13} /> Reject
                </ActionBtn>
                <StatusLabel>Status</StatusLabel>
                <StatusSelect
                  value={profile.pipeline_status}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={statusUpdating}
                >
                  <option value="new">New</option>
                  <option value="approved">Approved</option>
                  <option value="contacted">Contacted</option>
                  <option value="backup">Backup</option>
                  <option value="rejected">Rejected</option>
                </StatusSelect>
              </ActionBar>

              <ContactRejectionModal
                isOpen={contactModal !== null}
                onClose={() => setContactModal(null)}
                candidate={{
                  pipelineId: profile.pipeline_id,
                  name: displayName,
                  position: profile.job_title,
                  email: profile.applicant_email ?? undefined,
                }}
                initialMode={contactModal?.mode ?? 'contact'}
                initialCommunicationType={contactModal?.commType ?? 'email'}
                onSuccess={() => {
                  setContactModal(null);
                  setProfile(p => p ? { ...p, pipeline_status: 'contacted', contacted_via: contactModal?.commType ?? 'email', contacted_at: new Date().toISOString() } : p);
                }}
              />

              {/* ── Hero ── */}
              <Hero>
                <HeroLeft>
                  <CandidateName>{displayName}</CandidateName>
                  <JobBadge>
                    <Briefcase size={13} /> {profile.job_title}
                    {profile.job_city && <><MapPin size={11} style={{ marginLeft: '0.5rem' }} />{profile.job_city}</>}
                  </JobBadge>
                  <MetaRow>
                    {profile.years_of_experience > 0 && (
                      <MetaItem><Clock size={11} />{profile.years_of_experience} yrs exp</MetaItem>
                    )}
                    {profile.upload_date && (
                      <MetaItem><Calendar size={11} />{new Date(profile.upload_date).toLocaleDateString()}</MetaItem>
                    )}
                    {profile.contacted_via && (
                      <MetaItem><Mail size={11} />Contacted via {profile.contacted_via}</MetaItem>
                    )}
                  </MetaRow>
                  <MetaRow>
                    <StatusBadge>{profile.pipeline_status}</StatusBadge>
                    {profile.hiring_recommendation && (
                      <StatusBadge style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.2)' }}>
                        {profile.hiring_recommendation}
                      </StatusBadge>
                    )}
                  </MetaRow>
                  {emailEditing ? (
                    <EmailEditRow>
                      <EmailInput
                        autoFocus
                        type="email"
                        value={emailDraft}
                        onChange={e => setEmailDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEmailSave(); if (e.key === 'Escape') setEmailEditing(false); }}
                        placeholder="email@example.com"
                      />
                      <IconBtn onClick={handleEmailSave} disabled={emailSaving} title="Save">
                        <Check size={14} color="#4ade80" />
                      </IconBtn>
                      <IconBtn onClick={() => setEmailEditing(false)} title="Cancel">
                        <X size={14} color="#f87171" />
                      </IconBtn>
                    </EmailEditRow>
                  ) : (
                    <EmailEditRow>
                      <MetaItem>
                        <Mail size={11} />
                        {profile.applicant_email || <span style={{ color: '#4a5568', fontStyle: 'italic' }}>Add email</span>}
                      </MetaItem>
                      <IconBtn onClick={() => { setEmailDraft(profile.applicant_email || ''); setEmailEditing(true); }} title="Edit email">
                        <Pencil size={11} />
                      </IconBtn>
                    </EmailEditRow>
                  )}
                </HeroLeft>

                <HeroRight>
                  <ScoreRing tier={profile.tier}>
                    <ScoreNumber tier={profile.tier}>{profile.tier_score}</ScoreNumber>
                    <ScoreLabel>/ 100</ScoreLabel>
                  </ScoreRing>
                  <TierBadge tier={profile.tier}>{profile.tier.toUpperCase()} TIER</TierBadge>
                </HeroRight>
              </Hero>

              {/* ── AI Summary ── */}
              {profile.ai_summary && (
                <Card>
                  <CardHeader>
                    <Star size={13} color="#8a9ab0" />
                    <CardTitle>AI Assessment</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <SummaryText>{profile.ai_summary}</SummaryText>
                  </CardBody>
                </Card>
              )}

              {/* ── Resume Summary ── */}
              {profile.summary && (
                <Card>
                  <CardHeader>
                    <User size={13} color="#8a9ab0" />
                    <CardTitle>Resume Summary</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <SummaryText>{profile.summary}</SummaryText>
                  </CardBody>
                </Card>
              )}

              {/* ── Strengths + Weaknesses ── */}
              {((profile.strengths?.length > 0) || (profile.weaknesses?.length > 0)) && (
                <TwoCol>
                  {profile.strengths?.length > 0 && (
                    <Card style={{ marginBottom: 0 }}>
                      <CardHeader>
                        <Shield size={13} color="#4ade80" />
                        <CardTitle>Strengths</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <BulletList>
                          {profile.strengths.map((s, i) => (
                            <StrengthItem key={i}>{s}</StrengthItem>
                          ))}
                        </BulletList>
                      </CardBody>
                    </Card>
                  )}
                  {profile.weaknesses?.length > 0 && (
                    <Card style={{ marginBottom: 0 }}>
                      <CardHeader>
                        <AlertTriangle size={13} color="#f59e0b" />
                        <CardTitle>Areas for Development</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <BulletList>
                          {profile.weaknesses.map((w, i) => (
                            <WeaknessItem key={i}>{w}</WeaknessItem>
                          ))}
                        </BulletList>
                      </CardBody>
                    </Card>
                  )}
                </TwoCol>
              )}

              {/* ── Certifications ── */}
              {profile.certifications_found?.length > 0 && (
                <Card>
                  <CardHeader>
                    <Award size={13} color="#8a9ab0" />
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <CertList>
                      {profile.certifications_found.map((cert, i) => (
                        <CertChip key={i}>{cert}</CertChip>
                      ))}
                    </CertList>
                  </CardBody>
                </Card>
              )}

              {/* ── Contact Info (contacted_via / last contacted only) ── */}
              {(profile.contacted_via || profile.contacted_at) && (
                <Card>
                  <CardHeader>
                    <Phone size={13} color="#8a9ab0" />
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <ContactGrid>
                      {profile.contacted_via && (
                        <ContactItem>
                          <ContactLabel>Contacted Via</ContactLabel>
                          <ContactValue>{profile.contacted_via}</ContactValue>
                        </ContactItem>
                      )}
                      {profile.contacted_at && (
                        <ContactItem>
                          <ContactLabel>Last Contacted</ContactLabel>
                          <ContactValue>{new Date(profile.contacted_at).toLocaleDateString()}</ContactValue>
                        </ContactItem>
                      )}
                    </ContactGrid>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </Inner>
      </Page>
    </>
  );
};

export default CandidateProfile;
