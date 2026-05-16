import React from 'react';
import styled from 'styled-components';

const Page = styled.div`
  min-height: 100vh;
  background: #111318;
  padding: 4rem 2rem;
  font-family: 'Inter', sans-serif;
`;

const Inner = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
  letter-spacing: -0.03em;
`;

const Updated = styled.p`
  font-size: 0.78rem;
  color: #6e7d8e;
  margin-bottom: 3rem;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const H2 = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #4ade80;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
`;

const P = styled.p`
  font-size: 0.9rem;
  color: #b0bec5;
  line-height: 1.75;
  margin-bottom: 0.75rem;
`;

const Ul = styled.ul`
  font-size: 0.9rem;
  color: #b0bec5;
  line-height: 1.75;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;

  li { margin-bottom: 0.3rem; }
`;

const PrivacyPolicy: React.FC = () => (
  <Page>
    <Inner>
      <Title>Privacy Policy</Title>
      <Updated>Last updated: May 16, 2026</Updated>

      <Section>
        <H2>1. Overview</H2>
        <P>
          Talos ("we," "our," or "us") operates an AI-powered hiring platform for HVAC companies at gotalos.io.
          This Privacy Policy explains how we collect, use, and protect information when you use our services —
          whether you're an HVAC company using Talos to manage hiring, or a job candidate applying through a
          Talos-powered application link.
        </P>
      </Section>

      <Section>
        <H2>2. Information We Collect</H2>
        <P><strong style={{ color: '#e0e0e0' }}>For company accounts:</strong></P>
        <Ul>
          <li>Name, email address, and company name at registration</li>
          <li>Job postings you create, including job titles, descriptions, and requirements</li>
          <li>Account activity such as candidate pipeline status changes and notes</li>
        </Ul>
        <P><strong style={{ color: '#e0e0e0' }}>For job candidates:</strong></P>
        <Ul>
          <li>Name, email address, and phone number submitted on application forms</li>
          <li>Resume files uploaded as part of an application</li>
          <li>AI-generated analysis scores and summaries derived from your resume</li>
        </Ul>
      </Section>

      <Section>
        <H2>3. How We Use Your Information</H2>
        <Ul>
          <li>To create and manage your company account and job postings</li>
          <li>To analyze candidate resumes using AI and generate hiring recommendations</li>
          <li>To power the candidate pipeline and help companies manage their hiring process</li>
          <li>To send transactional emails such as application confirmations and new applicant alerts</li>
          <li>To send password reset emails and account notifications</li>
          <li>To improve the platform and fix issues</li>
        </Ul>
        <P>We do not sell your personal information to third parties.</P>
      </Section>

      <Section>
        <H2>4. Third-Party Services</H2>
        <P>We use the following third-party services to operate the platform:</P>
        <Ul>
          <li><strong style={{ color: '#e0e0e0' }}>Anthropic</strong> — AI analysis of resumes. Resume text is sent to Anthropic's API for scoring and summarization.</li>
          <li><strong style={{ color: '#e0e0e0' }}>Amazon Web Services (AWS)</strong> — Cloud hosting, database storage (RDS), and resume file storage (S3). All data is stored in the US East region.</li>
          <li><strong style={{ color: '#e0e0e0' }}>Google (Gmail API)</strong> — Sending transactional emails from jake@gotalos.io.</li>
        </Ul>
        <P>Each of these providers has their own privacy policies and data handling practices.</P>
      </Section>

      <Section>
        <H2>5. Data Retention</H2>
        <P>
          Company account data is retained for as long as your account is active. Candidate resume files and
          analysis data are retained as part of the hiring company's pipeline until they delete the record or
          close their account. If you'd like your data removed, contact us at jake@gotalos.io.
        </P>
      </Section>

      <Section>
        <H2>6. Security</H2>
        <P>
          We use industry-standard security practices including HTTPS encryption in transit, encrypted database
          connections, and secure file storage. Passwords are hashed using bcrypt and never stored in plaintext.
          No system is completely secure, and we cannot guarantee absolute security.
        </P>
      </Section>

      <Section>
        <H2>7. Candidates' Rights</H2>
        <P>
          If you applied for a job through a Talos-powered link and would like to know what information we hold
          about you, or would like it deleted, contact us at jake@gotalos.io. We will respond within 30 days.
        </P>
      </Section>

      <Section>
        <H2>8. Changes to This Policy</H2>
        <P>
          We may update this policy from time to time. When we do, we'll update the date at the top of this page.
          Continued use of the platform after changes constitutes acceptance of the updated policy.
        </P>
      </Section>

      <Section>
        <H2>9. Contact</H2>
        <P>
          Questions about this policy? Reach us at <a href="mailto:jake@gotalos.io" style={{ color: '#4ade80' }}>jake@gotalos.io</a>.
        </P>
      </Section>
    </Inner>
  </Page>
);

export default PrivacyPolicy;
