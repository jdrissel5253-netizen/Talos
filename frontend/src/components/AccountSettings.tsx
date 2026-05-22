import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';

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
  const [profileMsg, setProfileMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetch(`${config.apiUrl}/api/auth/me`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          setEmail(data.data.email);
          setCompanyName(data.data.companyName || '');
          setSchedulingLink(data.data.schedulingLink || '');
          setCreatedAt(data.data.createdAt || '');
        }
      })
      .catch(() => {});
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, schedulingLink }),
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
          <Avatar>{initials}</Avatar>
          <AvatarInfo>
            <AvatarName>{displayName}</AvatarName>
            <AvatarEmail>{email}</AvatarEmail>
            <BadgeRow>
              <ActiveBadge>Active</ActiveBadge>
              <PlanBadge>Professional</PlanBadge>
            </BadgeRow>
          </AvatarInfo>
        </AvatarCard>

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
