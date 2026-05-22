import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, FileText } from 'lucide-react';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidateId: number | null;
  filename: string;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: #1a1a1a;
  border-radius: 10px;
  width: 92%;
  max-width: 860px;
  height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
`;

const Header = styled.div`
  background: #2d3748;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #4ade80;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const IframeWrapper = styled.div`
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const StatusText = styled.p`
  color: #aaa;
  font-size: 0.95rem;
`;

const ResumeFileModal: React.FC<Props> = ({ isOpen, onClose, candidateId, filename }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const prevCandidateId = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !candidateId) return;
    if (candidateId === prevCandidateId.current && (blobUrl || htmlContent)) return;

    prevCandidateId.current = candidateId;
    setStatus('loading');
    setBlobUrl(null);
    setHtmlContent(null);

    let objectUrl: string;

    fetch(`${config.apiUrl}/api/resume/preview/${candidateId}`, {
      headers: getAuthHeaders()
    })
      .then(async response => {
        if (!response.ok) throw new Error(`${response.status}`);
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          const html = await response.text();
          setHtmlContent(html);
        } else {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
        setStatus('ready');
      })
      .catch(() => setStatus('error'));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, candidateId]);

  useEffect(() => {
    if (!isOpen) {
      setBlobUrl(null);
      setHtmlContent(null);
      setStatus('loading');
      prevCandidateId.current = null;
    }
  }, [isOpen]);

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <FileText size={20} color="#4ade80" />
            <span style={{ fontWeight: 600 }}>{filename}</span>
          </HeaderLeft>
          <CloseButton onClick={onClose} aria-label="Close">
            <X size={22} />
          </CloseButton>
        </Header>
        <IframeWrapper>
          {status === 'loading' && <StatusText>Loading resume...</StatusText>}
          {status === 'error' && <StatusText>Failed to load resume. The file may no longer be available.</StatusText>}
          {status === 'ready' && blobUrl && (
            <StyledIframe src={blobUrl} title="Resume" />
          )}
          {status === 'ready' && htmlContent && (
            <StyledIframe srcDoc={htmlContent} title="Resume" />
          )}
        </IframeWrapper>
      </Modal>
    </Overlay>
  );
};

export default ResumeFileModal;
