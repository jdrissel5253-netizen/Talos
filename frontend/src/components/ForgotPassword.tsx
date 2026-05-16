import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  line-height: 1.5;
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
  margin-top: 1.25rem;
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
  margin-top: 1rem;
  line-height: 1.5;
`;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSent(true);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <Title>Reset your password</Title>
        {sent ? (
          <>
            <Message>
              If that email is registered, a reset link is on its way. Check your inbox (and spam folder).
            </Message>
            <BackLink onClick={() => navigate('/login')}>← Back to sign in</BackLink>
          </>
        ) : (
          <>
            <Subtitle>Enter your account email and we'll send you a link to reset your password.</Subtitle>
            <form onSubmit={handleSubmit}>
              <Label htmlFor="fp-email">Email address</Label>
              <Input
                id="fp-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
              {error && <Message error>{error}</Message>}
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
            <BackLink onClick={() => navigate('/login')}>← Back to sign in</BackLink>
          </>
        )}
      </Card>
    </Page>
  );
};

export default ForgotPassword;
