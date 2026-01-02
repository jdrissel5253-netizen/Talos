import React, { useState } from 'react';
import styled from 'styled-components';
import { Calendar, Phone, CheckSquare, X } from 'lucide-react';
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
    pointer-events: none;
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
  background: linear-gradient(to right, #ffffff, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  color: #000000;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
  display: block;
  margin: 4rem auto 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(74, 222, 128, 0.5);
    background-color: #5ce08e;

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
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
                <MessageIcon><Calendar size={48} color="#4ade80" /></MessageIcon>
                <MessageTitle>Interview Invitations</MessageTitle>
                <p style={{ color: '#e0e0e0', lineHeight: '1.8', marginBottom: '1rem' }}>
                  Our AI crafts personalized interview invitations that balance professionalism with warmth. Messages automatically highlight relevant candidate qualifications, suggest optimal meeting times based on scheduling patterns, and include all necessary logistical details formatted for maximum response rates.
                </p>
                <ul style={{ color: '#e0e0e0', lineHeight: '1.8', textAlign: 'left', paddingLeft: '1.5rem' }}>
                  <li>Personalized opening based on candidate background</li>
                  <li>Strategic timing suggestions for higher acceptance rates</li>
                  <li>Optimized call-to-action for quick confirmations</li>
                  <li>Professional tone that reflects your company culture</li>
                </ul>
              </MessageTypeCard>

              <MessageTypeCard>
                <MessageIcon><Phone size={48} color="#4ade80" /></MessageIcon>
                <MessageTitle>Phone Screen Requests</MessageTitle>
                <p style={{ color: '#e0e0e0', lineHeight: '1.8', marginBottom: '1rem' }}>
                  Generate concise, engaging phone screen invitations that respect candidates' time while generating curiosity. Our system analyzes candidate profiles to emphasize the most relevant aspects of the opportunity, increasing screening call acceptance rates.
                </p>
                <ul style={{ color: '#e0e0e0', lineHeight: '1.8', textAlign: 'left', paddingLeft: '1.5rem' }}>
                  <li>Brief format optimized for busy professionals</li>
                  <li>Highlight key opportunity factors for each candidate</li>
                  <li>Flexible scheduling language to maximize responses</li>
                  <li>Clear expectations for call duration and format</li>
                </ul>
              </MessageTypeCard>

              <MessageTypeCard>
                <MessageIcon><CheckSquare size={48} color="#4ade80" /></MessageIcon>
                <MessageTitle>Follow-Up Communications</MessageTitle>
                <p style={{ color: '#e0e0e0', lineHeight: '1.8', marginBottom: '1rem' }}>
                  Maintain candidate engagement with thoughtfully timed follow-up messages. The system references specific conversation points from interviews and applications, demonstrating genuine interest while keeping top candidates engaged throughout your hiring process.
                </p>
                <ul style={{ color: '#e0e0e0', lineHeight: '1.8', textAlign: 'left', paddingLeft: '1.5rem' }}>
                  <li>Personalized callbacks to interview discussions</li>
                  <li>Timeline updates that manage candidate expectations</li>
                  <li>Enthusiasm indicators to keep top candidates interested</li>
                  <li>Strategic messaging to prevent candidate drop-off</li>
                </ul>
              </MessageTypeCard>

              <MessageTypeCard>
                <MessageIcon><X size={48} color="#ef4444" /></MessageIcon>
                <MessageTitle>Professional Rejections</MessageTitle>
                <p style={{ color: '#e0e0e0', lineHeight: '1.8', marginBottom: '1rem' }}>
                  Deliver tactful rejection messages that preserve your employer brand and maintain positive candidate relationships. Messages are crafted to provide closure while leaving the door open for future opportunities, protecting your company's reputation in the talent market.
                </p>
                <ul style={{ color: '#e0e0e0', lineHeight: '1.8', textAlign: 'left', paddingLeft: '1.5rem' }}>
                  <li>Respectful language that maintains candidate dignity</li>
                  <li>Appreciation for time invested in the process</li>
                  <li>Future opportunity language for qualified candidates</li>
                  <li>Tone calibrated to interview stage and candidate quality</li>
                </ul>
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