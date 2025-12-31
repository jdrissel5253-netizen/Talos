import React from 'react';
import styled from 'styled-components';
import { Linkedin, Twitter, Facebook } from 'lucide-react';

const FooterContainer = styled.footer`
  background-color: #1a1a1a;
  color: white;
  padding: 4rem 2rem 2rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #4ade80;
  margin-bottom: 1.5rem;
`;

const FooterLink = styled.a`
  color: #ccc;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.2s ease;

  &:hover {
    color: #4ade80;
  }
`;

const FooterDescription = styled.p`
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 0px #4ade80;
  margin-bottom: 1rem;
`;

const FooterBottom = styled.div`
  border-top: 1px solid #333;
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: #888;
  font-size: 0.875rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialLink = styled.a`
  color: #888;
  font-size: 1.25rem;
  transition: color 0.2s ease;

  &:hover {
    color: #4ade80;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <Logo>Talos</Logo>
            <FooterDescription>
              Your comprehensive HVAC hiring solution. Find reliable technicians
              and office support staff with AI-powered sourcing and nationwide
              job board integration.
            </FooterDescription>
            <SocialLinks>
              <SocialLink href="#" aria-label="LinkedIn"><Linkedin size={20} /></SocialLink>
              <SocialLink href="#" aria-label="Twitter"><Twitter size={20} /></SocialLink>
              <SocialLink href="#" aria-label="Facebook"><Facebook size={20} /></SocialLink>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <FooterTitle>Why Talos?</FooterTitle>
            <FooterLink href="#overview">Overview</FooterLink>
            <FooterLink href="#different">Why Talos is different</FooterLink>
            <FooterLink href="#value">What Talos brings to the table</FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterTitle>Product</FooterTitle>
            <FooterLink href="#job-board">Job Board Integration</FooterLink>
            <FooterLink href="#job-writer">Job Description Writer</FooterLink>
            <FooterLink href="#candidate-ranking">Candidate Ranking System</FooterLink>
            <FooterLink href="#message-generator">Candidate Message Generator</FooterLink>
            <FooterLink href="#talent-pool">Personalized Candidate Talent Pool</FooterLink>
            <FooterLink href="#insights">HVAC Hiring Insights (nationwide)</FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterTitle>Resources</FooterTitle>
            <FooterLink href="#pricing">Pricing</FooterLink>
            <FooterLink href="#knowledge-hub">Knowledge Hub</FooterLink>
            <FooterLink href="#support">Support</FooterLink>
            <FooterLink href="#contact">Contact</FooterLink>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <Copyright>
            © 2024 Talos. All rights reserved. Built for HVAC professionals.
          </Copyright>
          <div>
            <FooterLink href="#privacy" style={{ marginRight: '2rem' }}>
              Privacy Policy
            </FooterLink>
            <FooterLink href="#terms">Terms of Service</FooterLink>
          </div>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;