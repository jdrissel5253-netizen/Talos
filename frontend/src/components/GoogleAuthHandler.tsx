import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { config } from '../config';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
`;

const Modal = styled.div`
  background: #1a1a1a;
  padding: 2.5rem;
  border-radius: 12px;
  border: 2px solid #333;
  width: 90%;
  max-width: 400px;
  text-align: center;
  color: #e0e0e0;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
`;

const Title = styled.h2`
  color: #fff;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: #aaa;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid #4ade80;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Button = styled.button`
  background: #333;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4ade80;
    color: #000;
  }
`;

const StatusIcon = styled.div<{ color: string }>`
    color: ${props => props.color};
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
`;

const GoogleAuthHandler: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (code && status === 'idle') {
            handleAuthCode(code);
        }
    }, [location, status]);

    const handleAuthCode = async (code: string) => {
        setStatus('processing');
        setMessage('Connecting your Gmail account...');

        try {
            const response = await fetch(`${config.apiUrl}/api/auth/google/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setStatus('success');
                setMessage('Successfully connected to Gmail! You can now send emails directly from the platform.');
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to connect to Gmail.');
            }
        } catch (error) {
            console.error('Auth error:', error);
            setStatus('error');
            setMessage('An error occurred while connecting to Gmail.');
        }
    };

    const handleClose = () => {
        // Remove query params
        navigate(location.pathname, { replace: true });
        setStatus('idle');
    };

    if (status === 'idle') return null;

    return (
        <Overlay>
            <Modal>
                {status === 'processing' && (
                    <>
                        <Spinner />
                        <Title>Connecting...</Title>
                        <Message>{message}</Message>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <StatusIcon color="#4ade80"><CheckCircle size={48} /></StatusIcon>
                        <Title>Connected!</Title>
                        <Message>{message}</Message>
                        <Button onClick={handleClose}>Continue</Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <StatusIcon color="#ef4444"><AlertCircle size={48} /></StatusIcon>
                        <Title>Connection Failed</Title>
                        <Message>{message}</Message>
                        <Button onClick={handleClose}>Close</Button>
                    </>
                )}
            </Modal>
        </Overlay>
    );
};

export default GoogleAuthHandler;
