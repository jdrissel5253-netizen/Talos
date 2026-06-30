import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { setToken } from '../utils/auth';
import { config } from '../config';

const FontImport = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  font-family: 'DM Sans', sans-serif;
  color: #e0e0e0;
`;

const Hero = styled.div`
  position: relative;
  padding: 7rem 2rem 5rem;
  text-align: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const BetaPill = styled.span`
  display: inline-block;
  background: rgba(74,222,128,0.1);
  border: 1px solid rgba(74,222,128,0.3);
  color: #4ade80;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 0.35rem 1rem;
  margin-bottom: 1.75rem;
`;

const Headline = styled.h1`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.1;
  letter-spacing: -0.02em;
  max-width: 800px;
  margin: 0 auto 1.5rem;
`;

const Accent = styled.em`
  color: #4ade80;
  font-style: italic;
`;

const Subheadline = styled.p`
  font-size: 1.1rem;
  color: #8a9ab0;
  max-width: 520px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  font-weight: 300;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem 6rem;
  animation: ${fadeUp} 0.6s ease both 0.1s;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const PerksSection = styled.div``;

const SectionLabel = styled.p`
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #4ade80;
  margin-bottom: 1.5rem;
`;

const PerkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Perk = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 0.75rem;
  align-items: flex-start;
`;

const PerkDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  margin-top: 0.55rem;
  flex-shrink: 0;
`;

const PerkText = styled.div``;

const PerkTitle = styled.p`
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.2rem;
`;

const PerkDesc = styled.p`
  font-size: 0.82rem;
  color: #6e7d8e;
  line-height: 1.5;
`;

const Divider = styled.div`
  width: 1px;
  background: #232830;

  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
  }
`;

const FormSection = styled.div``;

const FormCard = styled.div`
  background: #1a1f2a;
  border: 1px solid #232830;
  padding: 2rem;
`;

const FormTitle = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 0.4rem;
`;

const FormSub = styled.p`
  font-size: 0.8rem;
  color: #6e7d8e;
  margin-bottom: 1.75rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 600;
  color: #8a9ab0;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.35rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: #111318;
  border: 1px solid #2a3040;
  color: #e0e0e0;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #4ade80;
  }

  &::placeholder {
    color: #3a4555;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  background: #4ade80;
  border: none;
  color: #000;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.9rem;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  transition: background 0.15s ease;
  margin-top: 0.5rem;

  &:hover { background: #6ee89a; }
  &:disabled { background: #2a3a2a; color: #4a5a4a; cursor: not-allowed; }
`;

const ErrorMsg = styled.div`
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.2);
  color: #f87171;
  font-size: 0.82rem;
  padding: 0.75rem 1rem;
`;

const LoginLink = styled.p`
  font-size: 0.78rem;
  color: #6e7d8e;
  text-align: center;
  margin-top: 1rem;

  button {
    background: none;
    border: none;
    color: #4ade80;
    cursor: pointer;
    font-size: 0.78rem;
    text-decoration: underline;
    padding: 0;
  }
`;

const PERKS = [
  {
    title: 'Free during beta',
    desc: 'Full access to all features at no cost while you\'re a beta tester.'
  },
  {
    title: 'AI resume scoring',
    desc: 'Every applicant is automatically scored and ranked against your job requirements.'
  },
  {
    title: 'Public job links',
    desc: 'Share a link and applicants can apply directly — no job board needed.'
  },
  {
    title: 'Shape the product',
    desc: 'Your feedback directly influences what we build next. You have a real voice.'
  },
  {
    title: 'Priority support',
    desc: 'Beta testers get direct access to the team. We\'ll respond fast.'
  },
];

const BetaLanding: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ companyName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          companyName: form.companyName.trim(),
          isBeta: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      setToken(data.data.token);
      navigate('/dashboard');
    } catch {
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FontImport />
      <Page>
        <Hero>
          <BetaPill>Early Access</BetaPill>
          <Headline>
            Hire better HVAC techs.<br />
            <Accent>Free during beta.</Accent>
          </Headline>
          <Subheadline>
            Talos uses AI to score and rank every resume against your job requirements —
            so you spend time on your best candidates, not your inbox.
          </Subheadline>
        </Hero>

        <TwoCol>
          <PerksSection>
            <SectionLabel>What you get</SectionLabel>
            <PerkList>
              {PERKS.map(p => (
                <Perk key={p.title}>
                  <PerkDot />
                  <PerkText>
                    <PerkTitle>{p.title}</PerkTitle>
                    <PerkDesc>{p.desc}</PerkDesc>
                  </PerkText>
                </Perk>
              ))}
            </PerkList>
          </PerksSection>

          <Divider />

          <FormSection>
            <FormCard>
              <FormTitle>Join the beta</FormTitle>
              <FormSub>Takes 30 seconds. No credit card required.</FormSub>

              {error && <ErrorMsg>{error}</ErrorMsg>}

              <Form onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Acme HVAC"
                    value={form.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Create password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="8+ characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <SubmitBtn type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Get free access →'}
                </SubmitBtn>
              </Form>

              <LoginLink>
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')}>Sign in</button>
              </LoginLink>
            </FormCard>
          </FormSection>
        </TwoCol>
      </Page>
    </>
  );
};

export default BetaLanding;
