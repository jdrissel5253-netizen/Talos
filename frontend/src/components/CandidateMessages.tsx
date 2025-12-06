import React, { useState } from 'react';
import styled from 'styled-components';
import DemoModal from './DemoModal';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  position: relative;

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

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
`;

const MainTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const MainSubtitle = styled.p`
  font-size: 1.25rem;
  color: #e0e0e0;
  max-width: 800px;
  margin: 0 auto 4rem;
  line-height: 1.6;
  text-align: center;
`;

const ContentSection = styled.section`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
`;

const FeatureBox = styled.div`
  background: linear-gradient(135deg, #4ade80 0%, #4ade80 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin: 2rem auto;
  max-width: 700px;
  text-align: center;
`;

const MessageTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const MessageTypeCard = styled.div`
  background: #000000;
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid #333333;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4ade80;
    transform: translateY(-2px);
  }
`;

const MessageIcon = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const MessageTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 1rem;
  text-align: center;
`;

const MessageExample = styled.div`
  background: #1a1a1a;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #4ade80;
  margin-top: 1rem;
  font-style: italic;
  color: #555;
  line-height: 1.5;
`;

const CTAButton = styled.button`
  background-color: #4ade80;
  border: none;
  color: white;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(26, 90, 58, 0.3);
  display: block;
  margin: 4rem auto 0;

  &:hover {
    background-color: #4ade80;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 90, 58, 0.4);
  }
`;

const CandidateMessages: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <PageContainer>
        <ContentWrapper>
          <MainTitle>Candidate Message Generator</MainTitle>
          <MainSubtitle>
            AI-powered message drafting for interviews, follow-ups, and professional communication
          </MainSubtitle>

          <ContentSection>
            <p style={{ fontSize: '1.125rem', color: '#333', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
              Need to reach out? Talos can draft messages for interviews, phone screens, rejections, or follow-ups. No overthinking—just click, send, and move forward.
            </p>

            <FeatureBox>
              <p style={{ fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.6', margin: '0' }}>
                Professional, personalized messages in seconds. Maintain your brand voice while saving hours of writing time.
              </p>
            </FeatureBox>

            <MessageTypeGrid>
              <MessageTypeCard>
                <MessageIcon>📅</MessageIcon>
                <MessageTitle>Interview Invitations</MessageTitle>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '1rem' }}>
                  Professional interview scheduling with all necessary details
                </p>
                <MessageExample>
                  "Hi [Name], Thank you for your interest in the HVAC Technician position at [Company]. Based on your impressive background in residential HVAC systems, we'd like to schedule an interview. Are you available this Thursday at 2 PM for a 30-minute discussion about the role and your experience? We're located at [Address]. Please confirm your availability. Best regards, [Your Name]"
                </MessageExample>
              </MessageTypeCard>

              <MessageTypeCard>
                <MessageIcon>📞</MessageIcon>
                <MessageTitle>Phone Screen Requests</MessageTitle>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '1rem' }}>
                  Quick phone screening invitations to qualify candidates
                </p>
                <MessageExample>
                  "Hello [Name], Your HVAC experience caught our attention for the [Position] role. We'd like to have a brief 15-minute phone conversation to discuss your background and answer any initial questions you might have. When would be a convenient time for you this week? You can reach me directly at [Phone] or reply with your preferred times. Looking forward to speaking with you!"
                </MessageExample>
              </MessageTypeCard>

              <MessageTypeCard>
                <MessageIcon>✅</MessageIcon>
                <MessageTitle>Follow-Up Messages</MessageTitle>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '1rem' }}>
                  Professional follow-ups after interviews or applications
                </p>
                <MessageExample>
                  "Hi [Name], Thank you for taking the time to interview for the HVAC Service Technician position yesterday. We were impressed with your experience in commercial HVAC maintenance and your approach to customer service. We're currently reviewing all candidates and expect to make a decision by [Date]. We'll be in touch soon with next steps. Thanks again for your interest in joining our team!"
                </MessageExample>
              </MessageTypeCard>

              <MessageTypeCard>
                <MessageIcon>❌</MessageIcon>
                <MessageTitle>Professional Rejections</MessageTitle>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '1rem' }}>
                  Respectful rejection messages that maintain your reputation
                </p>
                <MessageExample>
                  "Dear [Name], Thank you for your interest in the HVAC Technician position and for the time you invested in our interview process. After careful consideration, we've decided to move forward with another candidate whose experience more closely matches our current needs. We were impressed with your background and encourage you to apply for future openings that may be a better fit. We'll keep your resume on file. Best of luck in your job search!"
                </MessageExample>
              </MessageTypeCard>
            </MessageTypeGrid>
          </ContentSection>

          <CTAButton onClick={() => setIsDemoModalOpen(true)}>
            Try the Message Generator
          </CTAButton>
        </ContentWrapper>
      </PageContainer>

      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};

export default CandidateMessages;