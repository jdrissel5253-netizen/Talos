import React, { useState } from 'react';
import styled from 'styled-components';

const SectionContainer = styled.div`
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const JobBoardSection = styled.section`
  background-color: #1a1a1a;
  padding: 6rem 2rem;
  text-align: center;
`;

const ValuePropsSection = styled.section`
  padding: 6rem 2rem;
  background-color: #000000;
`;

const FAQSection = styled.section`
  background-color: #1a1a1a;
  padding: 6rem 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 3rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const JobBoardDisplay = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #4ade80;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const JobBoardTickerContainer = styled.div`
  width: 100%;
  max-width: 900px;
  height: 80px;
  background: #000000;
  border: 2px solid #4ade80;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin: 0 auto 3rem;
  display: flex;
  align-items: center;
`;

const JobBoardTickerTrack = styled.div`
  display: flex;
  gap: 4rem;
  animation: scrollBoards 35s linear infinite;
  white-space: nowrap;
  padding: 0 1rem;

  @keyframes scrollBoards {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`;

const JobBoardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #e0e0e0;
  font-size: 1.25rem;
  font-weight: 600;
  white-space: nowrap;
`;

const JobBoardLogo = styled.div`
  width: 50px;
  height: 50px;
  background: #4ade80;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 1.5rem;
  font-weight: bold;
`;

const JobBoardDescription = styled.p`
  font-size: 1.25rem;
  color: #e0e0e0;
  max-width: 800px;
  margin: 0 auto 3rem;
  line-height: 1.6;
`;

const DetailedContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: left;
`;

const PyramidTop = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PyramidBottom = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const DetailSection = styled.div`
  background: #000000;
  padding: 2.5rem;
  border-radius: 12px;
  border-left: 4px solid #4ade80;
`;

const DetailTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 1.5rem;
`;

const DetailText = styled.p`
  font-size: 1.125rem;
  color: #e0e0e0;
  line-height: 1.8;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  color: #e0e0e0;
  line-height: 1.6;

  &:before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: #4ade80;
    border-radius: 50%;
    color: #000000;
    font-weight: bold;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const ValuePropsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const ValuePropCard = styled.div`
  background: #1a1a1a;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(255, 255, 255, 0.1);
  }
`;

const ValuePropIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4ade80, #4ade80);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: white;
`;

const ValuePropTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 1rem;
`;

const ValuePropDescription = styled.p`
  color: #e0e0e0;
  line-height: 1.6;
`;

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled.div`
  background: #000000;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.5rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color 0.2s ease;

  &:hover {
    color: #4ade80;
  }
`;

const FAQAnswer = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '0 1.5rem 1.5rem' : '0'};
  max-height: ${props => props.isOpen ? '200px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  color: #e0e0e0;
  line-height: 1.6;
`;

const ExpandIcon = styled.span<{ isOpen: boolean }>`
  transform: ${props => props.isOpen ? 'rotate(45deg)' : 'rotate(0)'};
  transition: transform 0.2s ease;
  font-size: 1.25rem;
  color: #4ade80;

  &::before {
    content: '+';
  }
`;

const ContentSections: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const jobBoards = [
    { name: 'Indeed', icon: 'I' },
    { name: 'ZipRecruiter', icon: 'Z' },
    { name: 'LinkedIn', icon: 'in' },
    { name: 'HVAC Insider', icon: 'H' },
    { name: 'SimplyHired', icon: 'S' },
    { name: 'Monster', icon: 'M' },
    { name: 'CareerBuilder', icon: 'C' },
    { name: 'Glassdoor', icon: 'G' },
    { name: 'Craigslist', icon: 'CL' },
    { name: 'HVAC Agent', icon: 'HA' },
    { name: 'ServiceTitan', icon: 'ST' },
    { name: 'HVACR Career Connect', icon: 'HC' },
    { name: 'TechNet', icon: 'T' },
    { name: 'Blue Collar Jobs', icon: 'BC' },
    { name: 'Snagajob', icon: 'SJ' }
  ];

  const faqData = [
    {
      question: "How does Talos integrate with existing job boards?",
      answer: "Talos seamlessly connects with over 100 job boards through our API integrations, automatically posting your job descriptions and managing applications from a single dashboard."
    },
    {
      question: "What makes Talos different from other hiring platforms?",
      answer: "Talos is specifically designed for HVAC companies, with AI that understands technical skills, certifications, and industry-specific requirements. Our candidate ranking system is trained on successful HVAC hires."
    },
    {
      question: "How accurate is the AI candidate ranking system?",
      answer: "Our AI ranking system uses machine learning trained on thousands of successful HVAC hires, considering technical skills, experience, certifications, and cultural fit indicators with 85%+ accuracy."
    },
    {
      question: "Can I customize job descriptions for different positions?",
      answer: "Yes, our Job Description Writer creates tailored descriptions for various HVAC roles including technicians, installers, service managers, and office support, all optimized for your local market."
    },
    {
      question: "What kind of support do you provide during onboarding?",
      answer: "We provide comprehensive onboarding including account setup, integration assistance, team training, and ongoing support to ensure you're getting the most value from Talos."
    }
  ];

  return (
    <>
      <ValuePropsSection>
        <SectionContainer>
          <SectionTitle>What Talos Brings to the Table</SectionTitle>
          <ValuePropsGrid>
            <ValuePropCard>
              <ValuePropIcon>🔧</ValuePropIcon>
              <ValuePropTitle>Lead Service Technician? Been there, filled that</ValuePropTitle>
              <ValuePropDescription>
                Posted to job board within minutes • Marketed to the right candidates •
                Graded by Talos • Revenue growth
              </ValuePropDescription>
            </ValuePropCard>

            <ValuePropCard>
              <ValuePropIcon>📚</ValuePropIcon>
              <ValuePropTitle>Vast Candidate Database</ValuePropTitle>
              <ValuePropDescription>
                Talos maintains an extensive database of candidates organized into graded tiers,
                ensuring you always have access to pre-qualified talent ranked by their skills,
                experience, and fit for your HVAC positions.
              </ValuePropDescription>
            </ValuePropCard>

            <ValuePropCard>
              <ValuePropIcon>📰</ValuePropIcon>
              <ValuePropTitle>Want the latest HVAC news?</ValuePropTitle>
              <ValuePropDescription>
                Talos's Knowledge Hub is your comprehensive resource for everything HVAC.
                Stay ahead with the latest industry trends, seasonal hiring strategies,
                business growth tips, regulatory updates, and expert insights to help
                your HVAC company thrive in a competitive market.
              </ValuePropDescription>
            </ValuePropCard>
          </ValuePropsGrid>
        </SectionContainer>
      </ValuePropsSection>

      <JobBoardSection>
        <SectionContainer>
          <JobBoardDisplay>Post on 15+ job boards</JobBoardDisplay>

          <JobBoardTickerContainer>
            <JobBoardTickerTrack>
              {[...jobBoards, ...jobBoards].map((board, index) => (
                <JobBoardItem key={index}>
                  <JobBoardLogo>{board.icon}</JobBoardLogo>
                  {board.name}
                </JobBoardItem>
              ))}
            </JobBoardTickerTrack>
          </JobBoardTickerContainer>

          <JobBoardDescription>
            Maximize your reach and find qualified HVAC professionals across all major job platforms
            with a single click. Our extensive network ensures your positions get maximum visibility.
          </JobBoardDescription>

          <DetailedContent>
            <PyramidTop>
              <DetailSection>
                <DetailTitle>AI-Powered Job Description Generator</DetailTitle>
                <DetailText>
                  Say goodbye to writer's block. Our intelligent Job Description Generator creates
                  compelling, industry-specific job postings tailored to your exact needs. Simply input
                  the role, requirements, and your company details—Talos handles the rest.
                </DetailText>
                <FeatureList>
                  <FeatureItem>
                    Automatically optimizes for SEO and job board algorithms to increase visibility
                  </FeatureItem>
                  <FeatureItem>
                    Includes HVAC-specific technical requirements, certifications, and skills
                  </FeatureItem>
                  <FeatureItem>
                    Customizes tone and language to attract top-tier talent in your market
                  </FeatureItem>
                  <FeatureItem>
                    Generates multiple variations so you can A/B test what works best
                  </FeatureItem>
                </FeatureList>
              </DetailSection>

              <DetailSection>
                <DetailTitle>One-Click Multi-Platform Posting</DetailTitle>
                <DetailText>
                  Forget about logging into 15 different job boards. With Talos, posting your job
                  description is as simple as three clicks and five minutes. Our seamless integration
                  handles all the technical details, formatting, and submission requirements for each platform.
                </DetailText>
                <FeatureList>
                  <FeatureItem>
                    Automatic formatting adjustments for each job board's specific requirements
                  </FeatureItem>
                  <FeatureItem>
                    Optional sponsored posting on premium platforms like Indeed for maximum reach
                  </FeatureItem>
                  <FeatureItem>
                    Simultaneous posting across all platforms saves hours of manual work
                  </FeatureItem>
                  <FeatureItem>
                    Unified dashboard to manage all your postings from one central location
                  </FeatureItem>
                </FeatureList>
              </DetailSection>
            </PyramidTop>

            <PyramidBottom>
              <DetailSection>
                <DetailTitle>Targeted Marketing to Quality Technicians</DetailTitle>
                <DetailText>
                  We don't just post your job—we actively market it to the right candidates. Talos uses
                  advanced targeting algorithms to ensure your positions reach experienced HVAC professionals
                  who match your specific requirements.
                </DetailText>
                <FeatureList>
                  <FeatureItem>
                    Geo-targeted distribution to candidates in your service area
                  </FeatureItem>
                  <FeatureItem>
                    Skills-based filtering to reach technicians with EPA certifications, HVAC licenses,
                    and relevant experience levels
                  </FeatureItem>
                  <FeatureItem>
                    Direct outreach to our curated database of pre-screened HVAC professionals
                  </FeatureItem>
                  <FeatureItem>
                    Smart timing to post when quality candidates are most actively searching
                  </FeatureItem>
                  <FeatureItem>
                    Automated follow-ups and engagement to keep top candidates interested in your positions
                  </FeatureItem>
                </FeatureList>
              </DetailSection>
            </PyramidBottom>
          </DetailedContent>
        </SectionContainer>
      </JobBoardSection>

      <FAQSection>
        <SectionContainer>
          <SectionTitle>Frequently Asked Questions</SectionTitle>
          <FAQContainer>
            {faqData.map((faq, index) => (
              <FAQItem key={index}>
                <FAQQuestion onClick={() => toggleFAQ(index)}>
                  {faq.question}
                  <ExpandIcon isOpen={openFAQ === index} />
                </FAQQuestion>
                <FAQAnswer isOpen={openFAQ === index}>
                  {faq.answer}
                </FAQAnswer>
              </FAQItem>
            ))}
          </FAQContainer>
        </SectionContainer>
      </FAQSection>
    </>
  );
};

export default ContentSections;