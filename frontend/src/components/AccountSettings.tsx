import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
`;

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

const AccountSettings: React.FC = () => {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
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
        body: JSON.stringify({ companyName }),
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

  return (
    <Page>
      <Inner>
        <PageTitle>Account Settings</PageTitle>

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
      </Inner>
    </Page>
  );
};

export default AccountSettings;
