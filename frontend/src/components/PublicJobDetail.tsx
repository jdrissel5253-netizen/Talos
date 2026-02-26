import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { config } from '../config';

interface Job {
    id: number;
    title: string;
    company_name: string;
    description: string;
    location: string;
    city: string;
    zip_code: string;
    job_location_type: string;
    job_type: string;
    position_type: string;
    pay_range_min: number;
    pay_range_max: number;
    pay_type: string;
    benefits: string;
    key_responsibilities: string;
    qualifications_certifications: string;
    education_requirements: string;
    required_years_experience: number;
    created_at: string;
}

const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    padding: 1rem;

    @media (min-width: 480px) {
        padding: 2rem;
    }
`;

const ContentWrapper = styled.div`
    max-width: 800px;
    margin: 0 auto;
`;

const Logo = styled(Link)`
    display: block;
    text-align: center;
    margin-bottom: 1.5rem;
    text-decoration: none;

    @media (min-width: 480px) {
        margin-bottom: 2rem;
    }
`;

const LogoText = styled.h1`
    font-size: 1.75rem;
    font-weight: 700;
    color: #4ade80;

    @media (min-width: 480px) {
        font-size: 2rem;
    }
`;

const JobCard = styled.div`
    background: #1a1a1a;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

    @media (min-width: 480px) {
        padding: 2.5rem;
    }
`;

const JobHeader = styled.div`
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #333;

    @media (min-width: 480px) {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
    }
`;

const JobTitle = styled.h1`
    font-size: 1.5rem;
    color: #e0e0e0;
    margin-bottom: 0.5rem;
    word-break: break-word;

    @media (min-width: 480px) {
        font-size: 2rem;
    }
`;

const CompanyName = styled.h2`
    font-size: 1.1rem;
    color: #4ade80;
    font-weight: 600;
    margin-bottom: 1rem;

    @media (min-width: 480px) {
        font-size: 1.25rem;
    }
`;

const MetaInfo = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    color: #999;
    font-size: 0.9rem;
`;

const MetaItem = styled.span`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const Section = styled.div`
    margin-bottom: 1.5rem;

    @media (min-width: 480px) {
        margin-bottom: 2rem;
    }
`;

const SectionTitle = styled.h3`
    color: #4ade80;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #333;
    padding-bottom: 0.5rem;
`;

const Description = styled.div`
    color: #ccc;
    font-size: 0.95rem;
    line-height: 1.7;
    white-space: pre-wrap;
`;

const DetailsList = styled.ul`
    color: #ccc;
    font-size: 0.95rem;
    line-height: 1.7;
    margin: 0;
    padding-left: 1.25rem;

    li {
        margin-bottom: 0.5rem;
    }
`;

const ApplyButton = styled(Link)`
    display: block;
    background: #4ade80;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    transition: background 0.2s ease;
    margin-top: 1.5rem;

    &:hover {
        background: #3bc76a;
    }

    @media (min-width: 480px) {
        margin-top: 2rem;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #000;
    color: #4ade80;
    font-size: 1rem;
`;

const ErrorContainer = styled.div`
    text-align: center;
    padding: 2rem;
`;

const ErrorTitle = styled.h2`
    color: #ef4444;
    font-size: 1.5rem;
    margin-bottom: 1rem;
`;

const ErrorText = styled.p`
    color: #999;
    font-size: 1rem;
    margin-bottom: 1.5rem;
`;

const BackLink = styled(Link)`
    color: #4ade80;
    text-decoration: none;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const SalaryBadge = styled.span`
    background: #22c55e20;
    color: #4ade80;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-weight: 600;
`;

const JobTypeBadge = styled.span`
    background: #3b82f620;
    color: #60a5fa;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-weight: 500;
    text-transform: capitalize;
`;

/**
 * Format salary for display
 */
function formatSalary(job: Job): string {
    const min = job.pay_range_min;
    const max = job.pay_range_max;
    const payType = job.pay_type || 'hourly';

    if (!min && !max) return '';

    const suffix = payType === 'salary' ? '/year' : '/hr';
    if (min && max) {
        return `$${min.toLocaleString()}-$${max.toLocaleString()}${suffix}`;
    }
    return min ? `$${min.toLocaleString()}+${suffix}` : `Up to $${max.toLocaleString()}${suffix}`;
}

/**
 * Format job type for display
 */
function formatJobType(jobType: string): string {
    if (!jobType) return 'Full-time';
    return jobType.replace(/_/g, '-').replace(/-/g, ' ');
}

/**
 * Map job type to Google schema employment type
 */
function mapEmploymentType(jobType: string): string {
    const mapping: Record<string, string> = {
        'full-time': 'FULL_TIME',
        'full_time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'part_time': 'PART_TIME',
        'contract': 'CONTRACTOR',
        'temporary': 'TEMPORARY',
        'internship': 'INTERN'
    };
    return mapping[(jobType || '').toLowerCase()] || 'FULL_TIME';
}

/**
 * Generate JSON-LD schema for Google for Jobs
 */
function generateJobSchema(job: Job): object {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        'title': job.title,
        'description': job.description,
        'datePosted': job.created_at?.split('T')[0],
        'employmentType': mapEmploymentType(job.job_type),
        'hiringOrganization': {
            '@type': 'Organization',
            'name': job.company_name || 'Company'
        },
        'jobLocation': {
            '@type': 'Place',
            'address': {
                '@type': 'PostalAddress',
                'addressLocality': job.city || job.location || '',
                'postalCode': job.zip_code || '',
                'addressCountry': 'US'
            }
        }
    };

    // Add salary if available
    if (job.pay_range_min || job.pay_range_max) {
        const unitText = job.pay_type === 'salary' ? 'YEAR' : 'HOUR';
        schema['baseSalary'] = {
            '@type': 'MonetaryAmount',
            'currency': 'USD',
            'value': {
                '@type': 'QuantitativeValue',
                ...(job.pay_range_min && { 'minValue': job.pay_range_min }),
                ...(job.pay_range_max && { 'maxValue': job.pay_range_max }),
                'unitText': unitText
            }
        };
    }

    return schema;
}

const PublicJobDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/api/jobs/public/${id}`);
                const data = await response.json();

                if (data.status === 'success' && data.job) {
                    setJob(data.job);

                    // Update page title
                    document.title = `${data.job.title} at ${data.job.company_name || 'Company'} | Talos`;
                } else {
                    setError(data.message || 'Job not found');
                }
            } catch (err) {
                console.error('Error fetching job:', err);
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJob();
        }

        // Cleanup: reset title on unmount
        return () => {
            document.title = 'Talos';
        };
    }, [id]);

    // Add JSON-LD schema to head
    useEffect(() => {
        if (!job) return;

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(generateJobSchema(job));
        script.id = 'job-posting-schema';
        document.head.appendChild(script);

        return () => {
            const existingScript = document.getElementById('job-posting-schema');
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [job]);

    if (loading) {
        return <LoadingContainer>Loading job details...</LoadingContainer>;
    }

    if (error || !job) {
        return (
            <PageContainer>
                <ContentWrapper>
                    <Logo to="/">
                        <LogoText>TALOS</LogoText>
                    </Logo>
                    <JobCard>
                        <ErrorContainer>
                            <ErrorTitle>Job Not Found</ErrorTitle>
                            <ErrorText>
                                {error || 'This job posting may have been removed or is no longer available.'}
                            </ErrorText>
                            <BackLink to="/">Return to Home</BackLink>
                        </ErrorContainer>
                    </JobCard>
                </ContentWrapper>
            </PageContainer>
        );
    }

    const salary = formatSalary(job);
    const jobType = formatJobType(job.job_type);
    const location = job.city || job.location || 'Location not specified';

    // Parse responsibilities/qualifications if they're stored as strings
    const parseList = (text: string | undefined): string[] => {
        if (!text) return [];
        // Try to split by newlines or bullet points
        return text.split(/[\n•\-]/).map(s => s.trim()).filter(Boolean);
    };

    const responsibilities = parseList(job.key_responsibilities);
    const qualifications = parseList(job.qualifications_certifications);

    return (
        <PageContainer>
            <ContentWrapper>
                <Logo to="/">
                    <LogoText>TALOS</LogoText>
                </Logo>

                <JobCard>
                    <JobHeader>
                        <JobTitle>{job.title}</JobTitle>
                        <CompanyName>{job.company_name || 'Company'}</CompanyName>
                        <MetaInfo>
                            <MetaItem>
                                <span role="img" aria-label="location">📍</span> {location}
                            </MetaItem>
                            <MetaItem>
                                <JobTypeBadge>{jobType}</JobTypeBadge>
                            </MetaItem>
                            {salary && (
                                <MetaItem>
                                    <SalaryBadge>{salary}</SalaryBadge>
                                </MetaItem>
                            )}
                            {job.job_location_type && (
                                <MetaItem>
                                    <span role="img" aria-label="work type">🏢</span> {job.job_location_type}
                                </MetaItem>
                            )}
                        </MetaInfo>
                    </JobHeader>

                    {job.description && (
                        <Section>
                            <SectionTitle>About This Role</SectionTitle>
                            <Description>{job.description}</Description>
                        </Section>
                    )}

                    {responsibilities.length > 0 && (
                        <Section>
                            <SectionTitle>Key Responsibilities</SectionTitle>
                            <DetailsList>
                                {responsibilities.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </DetailsList>
                        </Section>
                    )}

                    {qualifications.length > 0 && (
                        <Section>
                            <SectionTitle>Qualifications</SectionTitle>
                            <DetailsList>
                                {qualifications.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </DetailsList>
                        </Section>
                    )}

                    {job.required_years_experience > 0 && (
                        <Section>
                            <SectionTitle>Experience Required</SectionTitle>
                            <Description>
                                {job.required_years_experience}+ years of relevant experience
                            </Description>
                        </Section>
                    )}

                    {job.education_requirements && (
                        <Section>
                            <SectionTitle>Education</SectionTitle>
                            <Description>{job.education_requirements}</Description>
                        </Section>
                    )}

                    {job.benefits && (
                        <Section>
                            <SectionTitle>Benefits</SectionTitle>
                            <Description>{job.benefits}</Description>
                        </Section>
                    )}

                    <ApplyButton to={`/apply?job=${job.id}&title=${encodeURIComponent(job.title)}`}>
                        Apply Now
                    </ApplyButton>
                </JobCard>
            </ContentWrapper>
        </PageContainer>
    );
};

export default PublicJobDetail;
