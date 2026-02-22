import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';
import { getTemplate, renderTemplate, getInterviewTypes, getTones } from '../utils/templateHelpers';

interface ContactRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    pipelineId: number;
    name: string;
    position: string;
  };
  initialMode: 'contact' | 'rejection';
  initialCommunicationType?: 'email' | 'sms';
  onSuccess: () => void;
}

const ContactRejectionModal: React.FC<ContactRejectionModalProps> = ({
  isOpen,
  onClose,
  candidate,
  initialMode,
  initialCommunicationType = 'email',
  onSuccess
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'contact' | 'rejection'>(initialMode);
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>(initialCommunicationType);
  const [interviewType, setInterviewType] = useState<'video' | 'phone' | 'in-person'>('video');
  const [tone, setTone] = useState<'conversational' | 'friendly' | 'professional'>('friendly');
  const [isNudge, setIsNudge] = useState(false);
  const [schedulingLink, setSchedulingLink] = useState(config.defaultSchedulingLink || '[link]');
  const [silentRejection, setSilentRejection] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Escape key to close & auto-focus
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Update communication type when initialCommunicationType changes
  useEffect(() => {
    setCommunicationType(initialCommunicationType);
  }, [initialCommunicationType]);

  if (!isOpen) return null;

  // Get the current template
  const template = getTemplate(
    mode,
    tone,
    isNudge,
    mode === 'contact' ? interviewType : undefined,
    communicationType
  );

  // Render the template with actual values
  const renderedMessage = template
    ? renderTemplate(template, candidate.name, candidate.position, schedulingLink)
    : null;

  const handleSend = async () => {
    try {
      setSending(true);
      setError(null);

      if (mode === 'rejection' && silentRejection) {
        // Silent rejection - just update status without sending message
        const response = await fetch(
          `${config.apiUrl}/api/pipeline/${candidate.pipelineId}/reject`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to reject candidate');
        }

        onSuccess();
        onClose();
        return;
      }

      // Validate email if sending email
      if (communicationType === 'email' && !recipientEmail) {
        throw new Error('Please enter a recipient email address');
      }

      // Send message
      if (!template || !renderedMessage) {
        throw new Error('No template found for the selected options');
      }

      const response = await fetch(
        `${config.apiUrl}/api/pipeline/${candidate.pipelineId}/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            communicationType,
            messageContent: renderedMessage.body,
            messageSubject: renderedMessage.subject,
            category: mode,
            templateType: mode === 'contact' ? interviewType : undefined,
            templateTone: tone,
            isNudge,
            schedulingLink,
            candidateName: candidate.name,
            jobTitle: candidate.position,
            recipientEmail: communicationType === 'email' ? recipientEmail : undefined
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send message');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle id="contact-modal-title">{mode === 'contact' ? 'Contact Candidate' : 'Reject Candidate'}</ModalTitle>
          <CloseButton aria-label="Close" onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Mode Toggle */}
          <ModeToggleContainer>
            <ModeToggleButton
              active={mode === 'contact'}
              aria-pressed={mode === 'contact'}
              onClick={() => setMode('contact')}
            >
              Contact
            </ModeToggleButton>
            <ModeToggleButton
              active={mode === 'rejection'}
              aria-pressed={mode === 'rejection'}
              onClick={() => setMode('rejection')}
            >
              Reject
            </ModeToggleButton>
          </ModeToggleContainer>

          {/* Communication Type (only for contact mode) */}
          {mode === 'contact' && (
            <FormRow>
              <Label>Communication Type</Label>
              <CommunicationTypeContainer>
                <CommunicationTypeButton
                  active={communicationType === 'email'}
                  aria-pressed={communicationType === 'email'}
                  onClick={() => setCommunicationType('email')}
                >
                  📧 Email
                </CommunicationTypeButton>
                <CommunicationTypeButton
                  active={communicationType === 'sms'}
                  aria-pressed={communicationType === 'sms'}
                  onClick={() => setCommunicationType('sms')}
                >
                  💬 Text
                </CommunicationTypeButton>
              </CommunicationTypeContainer>
            </FormRow>
          )}

          {/* Recipient Email (only when sending an email) */}
          {((mode === 'contact' && communicationType === 'email') || (mode === 'rejection' && !silentRejection)) && (
            <FormRow>
              <Label htmlFor="modal-recipient-email">Recipient Email</Label>
              <Input
                id="modal-recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="candidate@example.com"
                required
              />
            </FormRow>
          )}

          {/* Interview Type (only for contact mode) */}
          {mode === 'contact' && (
            <FormRow>
              <Label>Interview Type</Label>
              <Select value={interviewType} onChange={(e) => setInterviewType(e.target.value as any)}>
                {getInterviewTypes().map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </FormRow>
          )}

          {/* Tone */}
          <FormRow>
            <Label>Tone</Label>
            <Select value={tone} onChange={(e) => setTone(e.target.value as any)}>
              {getTones().map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </FormRow>

          {/* Follow-up Nudge (only for contact mode) */}
          {mode === 'contact' && (
            <FormRow>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={isNudge}
                  onChange={(e) => setIsNudge(e.target.checked)}
                />
                <span>This is a follow-up nudge</span>
              </CheckboxLabel>
            </FormRow>
          )}

          {/* Silent Rejection (only for rejection mode) */}
          {mode === 'rejection' && (
            <FormRow>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={silentRejection}
                  onChange={(e) => setSilentRejection(e.target.checked)}
                />
                <span>Reject without sending a message</span>
              </CheckboxLabel>
            </FormRow>
          )}

          {/* Scheduling Link (only for contact mode and not silent rejection) */}
          {mode === 'contact' && (
            <FormRow>
              <Label htmlFor="modal-scheduling-link">Scheduling Link</Label>
              <Input
                id="modal-scheduling-link"
                type="text"
                value={schedulingLink}
                onChange={(e) => setSchedulingLink(e.target.value)}
                placeholder="https://your-scheduling-link.com"
              />
            </FormRow>
          )}

          {/* Message Preview */}
          {!silentRejection && renderedMessage && (
            <PreviewSection>
              <PreviewLabel>Message Preview</PreviewLabel>
              {renderedMessage.subject && (
                <PreviewSubject>
                  <strong>Subject:</strong> {renderedMessage.subject}
                </PreviewSubject>
              )}
              <PreviewBody>{renderedMessage.body}</PreviewBody>
              {communicationType === 'sms' && (
                <CharacterCount>
                  {renderedMessage.body.length} characters
                  {renderedMessage.body.length > 160 && (
                    <span style={{ color: '#fca5a5', marginLeft: '8px' }}>
                      (Will be sent as {Math.ceil(renderedMessage.body.length / 160)} messages)
                    </span>
                  )}
                </CharacterCount>
              )}
            </PreviewSection>
          )}

          {/* Error Message */}
          {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

          {/* Candidate Info */}
          <CandidateInfo>
            <strong>Candidate:</strong> {candidate.name} | <strong>Position:</strong> {candidate.position}
          </CandidateInfo>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose} disabled={sending}>
            Cancel
          </CancelButton>
          <SendButton onClick={handleSend} disabled={sending}>
            {sending
              ? 'Sending...'
              : mode === 'rejection'
                ? silentRejection
                  ? 'Reject Candidate'
                  : 'Send Rejection'
                : 'Send Message'
            }
          </SendButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #2a2a2a;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #f9fafb;
  }
`;

const ModalBody = styled.div`
  padding: 24px 28px;
`;

const ModeToggleContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const ModeToggleButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid ${props => props.active ? '#3b82f6' : '#2a2a2a'};
  background: ${props => props.active ? '#3b82f6' : '#2a2a2a'};
  color: ${props => props.active ? '#ffffff' : '#9ca3af'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#2563eb' : '#3a3a3a'};
    border-color: ${props => props.active ? '#2563eb' : '#3a3a3a'};
  }
`;

const CommunicationTypeContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const CommunicationTypeButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid ${props => props.active ? '#3b82f6' : '#2a2a2a'};
  background: ${props => props.active ? 'rgba(59, 130, 246, 0.1)' : '#2a2a2a'};
  color: ${props => props.active ? '#3b82f6' : '#9ca3af'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'rgba(59, 130, 246, 0.2)' : '#3a3a3a'};
    border-color: ${props => props.active ? '#3b82f6' : '#3a3a3a'};
  }
`;

const FormRow = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  background: #2a2a2a;
  color: #f9fafb;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3a3a3a;
    background: #3a3a3a;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: #2a2a2a;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  background: #2a2a2a;
  color: #f9fafb;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    border-color: #3a3a3a;
    background: #3a3a3a;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: #2a2a2a;
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #e5e7eb;
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const PreviewSection = styled.div`
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const PreviewLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const PreviewSubject = styled.div`
  font-size: 14px;
  color: #e5e7eb;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #2a2a2a;

  strong {
    color: #9ca3af;
  }
`;

const PreviewBody = styled.div`
  font-size: 14px;
  color: #e5e7eb;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const CharacterCount = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #2a2a2a;
  font-size: 12px;
  color: #9ca3af;
`;

const ErrorMessage = styled.div`
  background: #2a1a1a;
  border: 1px solid #4a2a2a;
  border-radius: 6px;
  padding: 12px;
  color: #fca5a5;
  font-size: 14px;
  margin-bottom: 20px;
`;

const CandidateInfo = styled.div`
  padding: 12px;
  background: #2a2a2a;
  border-radius: 6px;
  font-size: 13px;
  color: #9ca3af;

  strong {
    color: #e5e7eb;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid #2a2a2a;
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  background: #2a2a2a;
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #3a3a3a;
    border-color: #3a3a3a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 10px 24px;
  border-radius: 6px;
  border: 1px solid #3b82f6;
  background: #3b82f6;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default ContactRejectionModal;
