import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DemoModal from './DemoModal';
import { config } from '../config';
import { setToken } from '../utils/auth';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    z-index: 1;
  }
`;

const LoginCard = styled.div`
  background: #1a1a1a;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 400px;
  z-index: 2;
  position: relative;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const CompanyName = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #4ade80;
  margin-bottom: 0.25rem;
`;

const Tagline = styled.p`
  color: #e0e0e0;
  font-size: 0.875rem;
  margin-bottom: 2rem;
`;

const WelcomeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #e0e0e0;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  color: #e0e0e0;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #e0e0e0;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #333333;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4ade80;
  }
`;

const ForgotLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.75rem;
  margin-top: -0.5rem;
`;

const ForgotLink = styled.button`
  background: none;
  border: none;
  color: #4ade80;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.75rem;

  &:hover {
    color: #4ade80;
  }
`;

const LoginButton = styled.button`
  background-color: #4ade80;
  border: none;
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

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

const DemoButton = styled.button`
  background: transparent;
  border: 2px solid #4ade80;
  color: #4ade80;
  padding: 0.875rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    background-color: #4ade80;
    color: white;
  }
`;

const SupportText = styled.p`
  text-align: center;
  font-size: 0.75rem;
  color: #e0e0e0;
  margin-top: 1.5rem;
  line-height: 1.4;

  a {
    color: #4ade80;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ModeToggle = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #e0e0e0;
  margin-top: 1.25rem;

  button {
    background: none;
    border: none;
    color: #4ade80;
    cursor: pointer;
    font-size: 0.875rem;
    text-decoration: underline;
    padding: 0;

    &:hover {
      color: #86efac;
    }
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
    setFormData({ email: '', password: '', confirmPassword: '', companyName: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'register') {
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body: Record<string, string> = {
        email: formData.email.trim(),
        password: formData.password
      };
      if (mode === 'register' && formData.companyName.trim()) {
        body.companyName = formData.companyName.trim();
      }

      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || (mode === 'login' ? 'Invalid email or password.' : 'Registration failed.'));
        return;
      }

      setToken(data.data.token);
      navigate(data.data.user.role === 'admin' ? '/' : '/dashboard');
    } catch (err) {
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = prompt('Enter your email address to reset your password:');
    if (email && email.trim()) {
      alert(`Password reset instructions have been sent to ${email}`);
    }
  };

  return (
    <>
      <LoginContainer>
        <LoginCard>
          <LogoSection>
            <LogoIcon>🔧</LogoIcon>
            <CompanyName>Talos</CompanyName>
            <Tagline>HVAC Hiring Solutions</Tagline>
          </LogoSection>

          <WelcomeTitle>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</WelcomeTitle>
          <WelcomeSubtitle>
            {mode === 'login' ? 'Sign in to your Talos account' : 'Get started with Talos'}
          </WelcomeSubtitle>

          {error && (
            <div role="alert" style={{ background: '#7f1d1d', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <FormGroup>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </FormGroup>

            {mode === 'register' && (
              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
            )}

            {mode === 'login' && (
              <ForgotLinks>
                <ForgotLink type="button" onClick={handleForgotPassword}>
                  Forgot Password?
                </ForgotLink>
              </ForgotLinks>
            )}

            <LoginButton type="submit" disabled={isLoading}>
              {isLoading
                ? (mode === 'login' ? 'Signing In...' : 'Creating Account...')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </LoginButton>

            {mode === 'login' && (
              <DemoButton type="button" onClick={() => setIsDemoModalOpen(true)}>
                Get Demo
              </DemoButton>
            )}
          </Form>

          <ModeToggle>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('register')}>Create one</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')}>Sign in</button>
              </>
            )}
          </ModeToggle>

          {mode === 'login' && (
            <SupportText>
              If you are having trouble logging in,<br />
              please email <a href="mailto:support@talos-hvac.com">support@talos-hvac.com</a>
            </SupportText>
          )}
        </LoginCard>
      </LoginContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default Login;