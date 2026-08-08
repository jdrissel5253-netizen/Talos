import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';
import OnboardingChecklist from './OnboardingChecklist';

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  padding: 2.5rem;
  font-family: 'Inter', sans-serif;

  @media (max-width: 600px) { padding: 1.5rem; }
`;

const Inner = styled.div`
  max-width: 560px;
  margin: 0 auto;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0;
  letter-spacing: -0.02em;
`;

const BackBtn = styled.button`
  background: transparent;
  border: 1px solid #2a3040;
  color: #6e7d8e;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.45rem 1rem;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;

  &:hover { border-color: #4ade80; color: #4ade80; }
`;

/* ── Avatar card ── */
const AvatarCard = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  padding: 2rem 1.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a2a 0%, #14271d 100%);
  border: 2px solid #4ade8040;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #4ade80;
  flex-shrink: 0;
  letter-spacing: -0.02em;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const LogoButton = styled.label`
  font-size: 0.72rem;
  font-weight: 600;
  color: #8a9ab0;
  border: 1px solid #2a3040;
  padding: 0.35rem 0.8rem;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;

  &:hover { border-color: #4ade80; color: #4ade80; }

  input { display: none; }
`;

const RemoveLogoButton = styled.button`
  background: transparent;
  border: none;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6e7d8e;
  cursor: pointer;
  padding: 0.15rem 0;

  &:hover { color: #f87171; }
`;

const AvatarInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AvatarName = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AvatarEmail = styled.div`
  font-size: 0.8rem;
  color: #6e7d8e;
  margin-bottom: 0.6rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 480px) { justify-content: center; }
`;

const ActiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.25);
  padding: 0.25rem 0.65rem;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    display: inline-block;
  }
`;

const PlanBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a9ab0;
  background: rgba(138, 154, 176, 0.08);
  border: 1px solid rgba(138, 154, 176, 0.18);
  padding: 0.25rem 0.65rem;
`;

/* ── Info strip ── */
const InfoStrip = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  padding: 1.25rem 1.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 2.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4a5568;
  margin-bottom: 0.3rem;
`;

const InfoValue = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #c8d3e0;
`;

/* ── Sections ── */
const Section = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8a9ab0;
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  background: #111318;
  border: 1px solid #2a3040;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 1rem;
  &:focus { border-color: #4ade80; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ReadOnly = styled.div`
  padding: 0.7rem 1rem;
  background: #111318;
  border: 1px solid #1e2330;
  color: #6e7d8e;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.65rem 1.5rem;
  background: #4ade80;
  border: none;
  color: #000;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  transition: background 0.15s;
  &:hover { background: #6ee89a; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Msg = styled.div<{ error?: boolean }>`
  font-size: 0.78rem;
  padding: 0.6rem 1rem;
  margin-top: 0.75rem;
  background: ${p => p.error ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)'};
  border: 1px solid ${p => p.error ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'};
  color: ${p => p.error ? '#f87171' : '#4ade80'};
`;

/* ── Team ── */
const TeamRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid #232830;
  &:last-child { border-bottom: none; }
`;

const TeamEmail = styled.div`
  font-size: 0.85rem;
  color: #c8d3e0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TeamMeta = styled.div`
  font-size: 0.72rem;
  color: #4a5568;
  flex-shrink: 0;
`;

const RemoveTeamButton = styled.button`
  background: transparent;
  border: none;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6e7d8e;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { color: #f87171; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const InviteRow = styled.form`
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;

  @media (max-width: 480px) { flex-direction: column; }
`;

const InviteInput = styled(Input)`
  margin-bottom: 0;
  flex: 1;
`;

const EmptyTeamNote = styled.div`
  font-size: 0.8rem;
  color: #4a5568;
`;

/* ── Support card ── */
const SupportCard = styled.div`
  background: #161b24;
  border: 1px solid #232830;
  padding: 1.5rem 1.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SupportText = styled.div``;

const SupportHeading = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #c8d3e0;
  margin-bottom: 0.3rem;
`;

const SupportSub = styled.div`
  font-size: 0.78rem;
  color: #4a5568;
`;

const SupportLink = styled.a`
  font-size: 0.78rem;
  font-weight: 600;
  color: #4ade80;
  text-decoration: none;
  white-space: nowrap;
  &:hover { text-decoration: underline; }
`;

function getInitials(companyName: string, email: string): string {
  if (companyName && companyName.trim()) {
    const words = companyName.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return companyName.trim().slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : '?';
}

function formatMemberSince(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [schedulingLink, setSchedulingLink] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoMsg, setLogoMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [profileMsg, setProfileMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [isOwner, setIsOwner] = useState(true);
  const [teamMembers, setTeamMembers] = useState<{ id: number; email: string; createdAt: string }[]>([]);
  const [pendingInvites, setPendingInvites] = useState<{ id: number; email: string; expiresAt: string }[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const loadTeam = () => {
    fetch(`${config.apiUrl}/api/auth/team`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          setIsOwner(data.data.isOwner);
          setTeamMembers(data.data.members || []);
          setPendingInvites(data.data.pendingInvites || []);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch(`${config.apiUrl}/api/auth/me`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          setEmail(data.data.email);
          setCompanyName(data.data.companyName || '');
          setSchedulingLink(data.data.schedulingLink || '');
          setCreatedAt(data.data.createdAt || '');
          setLogoUrl(data.data.logoUrl || '');
          setServiceArea(data.data.serviceArea || '');
        }
      })
      .catch(() => {});
    loadTeam();
  }, []);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg(null);
    setInviteLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/invite`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setInviteMsg({ text: 'Invite sent.', error: false });
        setInviteEmail('');
        loadTeam();
      } else {
        setInviteMsg({ text: data.message || 'Failed to send invite.', error: true });
      }
    } catch {
      setInviteMsg({ text: 'Could not connect to server.', error: true });
    } finally {
      setInviteLoading(false);
    }
  };

  const removeMember = async (id: number) => {
    setInviteMsg(null);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/team/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status === 'success') {
        loadTeam();
      } else {
        setInviteMsg({ text: data.message || 'Failed to remove teammate.', error: true });
      }
    } catch {
      setInviteMsg({ text: 'Could not connect to server.', error: true });
    }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setLogoLoading(true);
    setLogoMsg(null);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch(`${config.apiUrl}/api/auth/logo`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLogoUrl(data.data.logoUrl);
      } else {
        setLogoMsg({ text: data.message || 'Failed to upload logo.', error: true });
      }
    } catch {
      setLogoMsg({ text: 'Could not connect to server.', error: true });
    } finally {
      setLogoLoading(false);
    }
  };

  const removeLogo = async () => {
    setLogoLoading(true);
    setLogoMsg(null);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/logo`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLogoUrl('');
      } else {
        setLogoMsg({ text: data.message || 'Failed to remove logo.', error: true });
      }
    } catch {
      setLogoMsg({ text: 'Could not connect to server.', error: true });
    } finally {
      setLogoLoading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, schedulingLink, serviceArea }),
      });
      const data = await res.json();
      setProfileMsg({ text: data.status === 'success' ? 'Company name updated.' : (data.message || 'Update failed.'), error: data.status !== 'success' });
    } catch {
      setProfileMsg({ text: 'Could not connect to server.', error: true });
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ text: 'New passwords do not match.', error: true });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ text: 'Password must be at least 8 characters.', error: true });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/change-password`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPwMsg({ text: 'Password updated successfully.', error: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwMsg({ text: data.message || 'Failed to update password.', error: true });
      }
    } catch {
      setPwMsg({ text: 'Could not connect to server.', error: true });
    } finally {
      setPwLoading(false);
    }
  };

  const initials = getInitials(companyName, email);
  const displayName = companyName || email || 'Your Account';

  return (
    <Page>
      <Inner>
        <TopRow>
          <PageTitle>Account Settings</PageTitle>
          <BackBtn onClick={() => navigate('/dashboard')}>← Dashboard</BackBtn>
        </TopRow>

        <AvatarCard>
          <Avatar>{logoUrl ? <img src={logoUrl} alt={`${displayName} logo`} /> : initials}</Avatar>
          <AvatarInfo>
            <AvatarName>{displayName}</AvatarName>
            <AvatarEmail>{email}</AvatarEmail>
            <BadgeRow>
              <ActiveBadge>Active</ActiveBadge>
              <PlanBadge>Professional</PlanBadge>
            </BadgeRow>
          </AvatarInfo>
          <AvatarActions>
            <LogoButton>
              {logoLoading ? 'Uploading...' : logoUrl ? 'Change logo' : 'Upload logo'}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={uploadLogo} disabled={logoLoading} />
            </LogoButton>
            {logoUrl && <RemoveLogoButton onClick={removeLogo} disabled={logoLoading}>Remove</RemoveLogoButton>}
          </AvatarActions>
        </AvatarCard>
        {logoMsg && <Msg error={logoMsg.error}>{logoMsg.text}</Msg>}

        <InfoStrip>
          <InfoItem>
            <InfoLabel>Member since</InfoLabel>
            <InfoValue>{formatMemberSince(createdAt)}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Account type</InfoLabel>
            <InfoValue>HVAC Employer</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Platform</InfoLabel>
            <InfoValue>Talos Hiring</InfoValue>
          </InfoItem>
        </InfoStrip>

        <OnboardingChecklist
          heading="Onboarding Steps"
          subheading="Revisit any step below any time."
          showWhenComplete
          collapsible
        />

        <Section>
          <SectionTitle>Profile</SectionTitle>
          <form onSubmit={saveProfile}>
            <Label>Email address</Label>
            <ReadOnly>{email || '—'}</ReadOnly>
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Your company name"
            />
            <Label htmlFor="service-area">Service area</Label>
            <Input
              id="service-area"
              type="text"
              value={serviceArea}
              onChange={e => setServiceArea(e.target.value)}
              placeholder="e.g. Greater Dallas-Fort Worth"
            />
            <Label htmlFor="scheduling-link">Scheduling link</Label>
            <Input
              id="scheduling-link"
              type="url"
              value={schedulingLink}
              onChange={e => setSchedulingLink(e.target.value)}
              placeholder="https://calendly.com/your-link"
            />
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save changes'}
            </Button>
            {profileMsg && <Msg error={profileMsg.error}>{profileMsg.text}</Msg>}
          </form>
        </Section>

        <Section>
          <SectionTitle>Team</SectionTitle>
          {isOwner ? (
            <>
              {teamMembers.length === 0 && pendingInvites.length === 0 ? (
                <EmptyTeamNote>No teammates yet. Invite one below — they'll see the same jobs, candidates, and pipeline as you.</EmptyTeamNote>
              ) : (
                <>
                  {teamMembers.map(m => (
                    <TeamRow key={m.id}>
                      <TeamEmail>{m.email}</TeamEmail>
                      <TeamMeta>Joined {formatMemberSince(m.createdAt)}</TeamMeta>
                      <RemoveTeamButton onClick={() => removeMember(m.id)}>Remove</RemoveTeamButton>
                    </TeamRow>
                  ))}
                  {pendingInvites.map(i => (
                    <TeamRow key={`invite-${i.id}`}>
                      <TeamEmail>{i.email}</TeamEmail>
                      <TeamMeta>Invite pending</TeamMeta>
                    </TeamRow>
                  ))}
                </>
              )}
              <InviteRow onSubmit={sendInvite}>
                <InviteInput
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  required
                />
                <Button type="submit" disabled={inviteLoading}>
                  {inviteLoading ? 'Sending...' : 'Invite'}
                </Button>
              </InviteRow>
              {inviteMsg && <Msg error={inviteMsg.error}>{inviteMsg.text}</Msg>}
            </>
          ) : (
            <EmptyTeamNote>You're part of a shared team account. Only the account owner can invite or remove teammates.</EmptyTeamNote>
          )}
        </Section>

        <Section>
          <SectionTitle>Change Password</SectionTitle>
          <form onSubmit={changePassword}>
            <Label htmlFor="current-pw">Current password</Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Your current password"
              required
            />
            <Label htmlFor="new-pw">New password</Label>
            <Input
              id="new-pw"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
            <Label htmlFor="confirm-pw">Confirm new password</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
            />
            <Button type="submit" disabled={pwLoading}>
              {pwLoading ? 'Updating...' : 'Update password'}
            </Button>
            {pwMsg && <Msg error={pwMsg.error}>{pwMsg.text}</Msg>}
          </form>
        </Section>

        <SupportCard>
          <SupportText>
            <SupportHeading>Need help with your account?</SupportHeading>
            <SupportSub>Our team typically responds within one business day.</SupportSub>
          </SupportText>
          <SupportLink href="mailto:support@gotalos.io">support@gotalos.io</SupportLink>
        </SupportCard>
      </Inner>
    </Page>
  );
};

export default AccountSettings;
