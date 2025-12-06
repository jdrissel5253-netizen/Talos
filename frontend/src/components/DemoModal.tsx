import React, { useState } from 'react';
import styled from 'styled-components';
import { config } from '../config';

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background: #1a1a1a;
  padding: 3rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #e0e0e0;
  padding: 0.5rem;
  line-height: 1;

  &:hover {
    color: #4ade80;
  }
`;

const ModalTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1rem;
  text-align: center;
`;

const ModalSubtitle = styled.p`
  color: #e0e0e0;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #e0e0e0;
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

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #333333;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #1a1a1a;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4ade80;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #333333;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4ade80;
  }
`;

const SubmitButton = styled.button`
  background-color: #4ade80;
  border: none;
  color: white;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

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

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  margin-bottom: 1rem;
`;

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    companySize: '',
    currentChallenges: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${config.apiUrl}/api/demo-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            company: '',
            phone: '',
            companySize: '',
            currentChallenges: ''
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting demo request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setIsSubmitted(false);
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>×</CloseButton>

        {isSubmitted ? (
          <>
            <SuccessMessage>
              Thank you! We'll be in touch within 24 hours to schedule your personalized demo.
            </SuccessMessage>
            <ModalTitle>Demo Request Submitted!</ModalTitle>
          </>
        ) : (
          <>
            <ModalTitle>Request Your Demo</ModalTitle>
            <ModalSubtitle>
              See how Talos can streamline your HVAC hiring process.
              Get a personalized demo tailored to your company's needs.
            </ModalSubtitle>

            <Form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label htmlFor="email">Work Email *</Label>
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
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="companySize">Company Size</Label>
                <Select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                >
                  <option value="">Select...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="200+">200+ employees</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="currentChallenges">Current Hiring Challenges</Label>
                <TextArea
                  id="currentChallenges"
                  name="currentChallenges"
                  placeholder="Tell us about your current hiring challenges..."
                  value={formData.currentChallenges}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Get My Demo'}
              </SubmitButton>
            </Form>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default DemoModal;