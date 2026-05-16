import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { config } from '../config';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
`;

const Card = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  margin: 1rem;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 1.75rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: #111;
  border: 1px solid #333;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 1rem;
  &:focus { border-color: #4ade80; }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.85rem;
  background: #4ade80;
  border: none;
  color: #000;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.25rem;
  &:hover { background: #6ee89a; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #4ade80;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 1.25rem;
  display: block;
  &:hover { text-decoration: underline; }
`;

const Message = styled.div<{ error?: boolean }>`
  padding: 0.75rem 1rem;
  background: ${p => p.error ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)'};
  border: 1px solid ${p => p.error ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'};
  color: ${p => p.error ? '#f87171' : '#4ade80'};
  font-size: 0.82rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccess(true);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Page>
        <Card>
          <Title>Invalid link</Title>
          <Message error>This reset link is missing or malformed. Please request a new one.</Message>
          <BackLink onClick={() => navigate('/forgot-password')}>Request new reset link</BackLink>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        <Title>Set new password</Title>
        {success ? (
          <>
            <Message>Password updated successfully. You can now sign in.</Message>
            <Button onClick={() => navigate('/login')}>Go to sign in</Button>
          </>
        ) : (
          <>
            <Subtitle>Choose a new password for your account.</Subtitle>
            {error && <Message error>{error}</Message>}
            <form onSubmit={handleSubmit}>
              <Label htmlFor="rp-password">New password</Label>
              <Input
                id="rp-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoFocus
              />
              <Label htmlFor="rp-confirm">Confirm password</Label>
              <Input
                id="rp-confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Set new password'}
              </Button>
            </form>
            <BackLink onClick={() => navigate('/login')}>← Back to sign in</BackLink>
          </>
        )}
      </Card>
    </Page>
  );
};

export default ResetPassword;
