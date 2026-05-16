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

const TermsOfService: React.FC = () => (
  <Page>
    <Inner>
      <Title>Terms of Service</Title>
      <Updated>Last updated: May 16, 2026</Updated>

      <Section>
        <H2>1. Acceptance of Terms</H2>
        <P>
          By creating an account or using the Talos platform at gotalos.io ("Service"), you agree to be bound by
          these Terms of Service. If you do not agree, do not use the Service.
        </P>
      </Section>

      <Section>
        <H2>2. Description of Service</H2>
        <P>
          Talos is an AI-powered hiring platform designed for HVAC companies. It provides tools to create job
          postings, receive applications, analyze resumes using artificial intelligence, and manage a candidate
          pipeline. The platform is currently offered as a beta product.
        </P>
      </Section>

      <Section>
        <H2>3. Beta Disclaimer</H2>
        <P>
          The Service is currently in beta. This means features may change, data may occasionally be lost, and
          the platform may experience downtime. We will make reasonable efforts to maintain availability and
          protect your data, but provide no uptime guarantees during the beta period.
        </P>
      </Section>

      <Section>
        <H2>4. Account Responsibilities</H2>
        <P>You are responsible for:</P>
        <Ul>
          <li>Providing accurate and truthful information when creating your account</li>
          <li>Maintaining the security of your account credentials</li>
          <li>All activity that occurs under your account</li>
          <li>Ensuring that your use of candidate data complies with applicable employment laws</li>
        </Ul>
      </Section>

      <Section>
        <H2>5. Acceptable Use</H2>
        <P>You agree not to:</P>
        <Ul>
          <li>Use the platform for any unlawful purpose or in violation of any applicable laws</li>
          <li>Upload malicious files or attempt to compromise the security of the platform</li>
          <li>Use AI-generated hiring recommendations as the sole basis for employment decisions in a way that violates anti-discrimination laws</li>
          <li>Share your account credentials with unauthorized parties</li>
          <li>Attempt to reverse engineer or copy the platform</li>
        </Ul>
      </Section>

      <Section>
        <H2>6. AI-Generated Content</H2>
        <P>
          Talos uses artificial intelligence to analyze resumes and generate scores and recommendations. These
          outputs are provided as informational aids only and do not constitute legal, HR, or professional advice.
          You are solely responsible for all hiring decisions made using the platform. AI scores and
          recommendations should be used as one input among many, not as a definitive judgment of any candidate.
        </P>
      </Section>

      <Section>
        <H2>7. Candidate Data</H2>
        <P>
          By using Talos, you agree to handle candidate personal information (names, emails, phone numbers,
          resumes) in accordance with applicable privacy and employment laws. You are the data controller for
          candidate information collected through your job postings. Talos processes this data on your behalf
          as a data processor.
        </P>
      </Section>

      <Section>
        <H2>8. Intellectual Property</H2>
        <P>
          The Talos platform, including its design, software, and AI models, is owned by Talos. You retain
          ownership of the job postings, company data, and candidate information you upload. You grant Talos
          a limited license to process this data to provide the Service.
        </P>
      </Section>

      <Section>
        <H2>9. Limitation of Liability</H2>
        <P>
          To the maximum extent permitted by law, Talos shall not be liable for any indirect, incidental, special,
          or consequential damages arising from your use of the Service, including but not limited to lost profits,
          data loss, or hiring decisions made based on AI-generated recommendations. Our total liability for any
          claim arising from use of the Service shall not exceed the amount you paid us in the 12 months preceding
          the claim.
        </P>
      </Section>

      <Section>
        <H2>10. Termination</H2>
        <P>
          You may stop using the Service at any time. We reserve the right to suspend or terminate accounts that
          violate these Terms. Upon termination, your access to the platform will cease and your data will be
          retained per our Privacy Policy.
        </P>
      </Section>

      <Section>
        <H2>11. Changes to Terms</H2>
        <P>
          We may update these Terms from time to time. We'll notify active users of material changes by email.
          Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
        </P>
      </Section>

      <Section>
        <H2>12. Governing Law</H2>
        <P>
          These Terms are governed by the laws of the United States. Any disputes shall be resolved through
          binding arbitration rather than in court, except where prohibited by law.
        </P>
      </Section>

      <Section>
        <H2>13. Contact</H2>
        <P>
          Questions about these Terms? Contact us at{' '}
          <a href="mailto:jake@gotalos.io" style={{ color: '#4ade80' }}>jake@gotalos.io</a>.
        </P>
      </Section>
    </Inner>
  </Page>
);

export default TermsOfService;
