import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { config } from '../config';

interface JobSummary {
    id: number;
    title: string;
    company_name: string;
    location: string;
    job_location_type: string;
    job_type: string;
    pay_range_min: number;
    pay_range_max: number;
    pay_type: string;
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

const PageTitle = styled.h2`
    font-size: 1.25rem;
    color: #e0e0e0;
    font-weight: 600;
    margin-bottom: 1.5rem;

    @media (min-width: 480px) {
        font-size: 1.5rem;
        margin-bottom: 2rem;
    }
`;

const JobCount = styled.span`
    color: #666;
    font-size: 0.9rem;
    font-weight: 400;
    margin-left: 0.5rem;
`;

const JobCard = styled(Link)`
    display: block;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
    text-decoration: none;
    transition: border-color 0.2s ease, background 0.2s ease;

    &:hover {
        border-color: #4ade80;
        background: #1f1f1f;
    }

    @media (min-width: 480px) {
        padding: 1.5rem 2rem;
    }
`;

const JobTitle = styled.h3`
    font-size: 1.1rem;
    color: #e0e0e0;
    font-weight: 600;
    margin-bottom: 0.35rem;

    @media (min-width: 480px) {
        font-size: 1.2rem;
    }
`;

const CompanyName = styled.p`
    font-size: 0.95rem;
    color: #4ade80;
    font-weight: 500;
    margin-bottom: 0.75rem;
`;

const MetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
`;

const Badge = styled.span<{ variant?: 'green' | 'blue' | 'gray' }>`
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
    background: ${({ variant }) =>
        variant === 'green' ? '#22c55e20' :
        variant === 'blue' ? '#3b82f620' :
        '#ffffff10'};
    color: ${({ variant }) =>
        variant === 'green' ? '#4ade80' :
        variant === 'blue' ? '#60a5fa' :
        '#999'};
    text-transform: capitalize;
`;

const ArrowIcon = styled.span`
    margin-left: auto;
    color: #4ade80;
    font-size: 1rem;
    align-self: center;
`;

const CardInner = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
`;

const CardBody = styled.div`
    flex: 1;
    min-width: 0;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
    background: #1a1a1a;
    border-radius: 12px;
    border: 1px solid #2a2a2a;
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

function formatSalary(job: JobSummary): string {
    const min = job.pay_range_min;
    const max = job.pay_range_max;
    const payType = job.pay_type || 'hourly';
    if (!min && !max) return '';
    const suffix = payType === 'salary' ? '/yr' : '/hr';
    if (min && max) return `$${min.toLocaleString()}–$${max.toLocaleString()}${suffix}`;
    return min ? `$${min.toLocaleString()}+${suffix}` : `Up to $${max.toLocaleString()}${suffix}`;
}

function formatJobType(jobType: string): string {
    if (!jobType) return 'Full-time';
    return jobType.replace(/[_-]/g, ' ');
}

const PublicJobList: React.FC = () => {
    const [jobs, setJobs] = useState<JobSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = 'Open Positions | Talos';
        const fetchJobs = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/api/jobs/public`);
                const data = await response.json();
                if (data.status === 'success') {
                    setJobs(data.jobs);
                } else {
                    setError('Failed to load job listings');
                }
            } catch {
                setError('Failed to load job listings');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
        return () => { document.title = 'Talos'; };
    }, []);

    if (loading) {
        return <LoadingContainer>Loading open positions...</LoadingContainer>;
    }

    return (
        <PageContainer>
            <ContentWrapper>
                <Logo to="/">
                    <LogoText>TALOS</LogoText>
                </Logo>

                <PageTitle>
                    Open Positions
                    {!error && <JobCount>{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}</JobCount>}
                </PageTitle>

                {error ? (
                    <EmptyState>{error}</EmptyState>
                ) : jobs.length === 0 ? (
                    <EmptyState>No open positions at this time. Check back soon.</EmptyState>
                ) : (
                    jobs.map(job => {
                        const salary = formatSalary(job);
                        const jobType = formatJobType(job.job_type);
                        const location = job.location || 'Location not specified';

                        return (
                            <JobCard key={job.id} to={`/jobs/${job.id}`}>
                                <CardInner>
                                    <CardBody>
                                        <JobTitle>{job.title}</JobTitle>
                                        <CompanyName>{job.company_name || 'Company'}</CompanyName>
                                        <MetaRow>
                                            <Badge variant="gray">📍 {location}</Badge>
                                            <Badge variant="blue">{jobType}</Badge>
                                            {salary && <Badge variant="green">{salary}</Badge>}
                                            {job.job_location_type && (
                                                <Badge variant="gray">{job.job_location_type}</Badge>
                                            )}
                                        </MetaRow>
                                    </CardBody>
                                    <ArrowIcon>→</ArrowIcon>
                                </CardInner>
                            </JobCard>
                        );
                    })
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default PublicJobList;
