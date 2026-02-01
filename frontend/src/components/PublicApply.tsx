import React, { useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { config } from '../config';

const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;

    @media (min-width: 480px) {
        padding: 2rem;
    }
`;

const FormCard = styled.div`
    background: #1a1a1a;
    border-radius: 12px;
    padding: 1.5rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

    @media (min-width: 480px) {
        padding: 2.5rem;
    }
`;

const Logo = styled.div`
    text-align: center;
    margin-bottom: 1.5rem;

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

const Title = styled.h2`
    font-size: 1.25rem;
    color: #e0e0e0;
    text-align: center;
    margin-bottom: 0.5rem;
    word-break: break-word;

    @media (min-width: 480px) {
        font-size: 1.5rem;
    }
`;

const Subtitle = styled.p`
    color: #999;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;

    @media (min-width: 480px) {
        margin-bottom: 2rem;
    }
`;

const JobDescriptionSection = styled.div`
    background: #000000;
    border: 1px solid #333333;
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    max-height: 300px;
    overflow-y: auto;

    @media (min-width: 480px) {
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: #4ade80;
        border-radius: 3px;
    }
`;

const JobDescriptionHeader = styled.h3`
    color: #4ade80;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #333;
    padding-bottom: 0.5rem;
`;

const JobDescriptionText = styled.p`
    color: #ccc;
    font-size: 0.85rem;
    line-height: 1.6;
    margin-bottom: 1rem;
`;

const JobDescriptionList = styled.ul`
    color: #ccc;
    font-size: 0.85rem;
    line-height: 1.7;
    margin: 0;
    padding-left: 1.25rem;

    li {
        margin-bottom: 0.5rem;
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    @media (min-width: 480px) {
        gap: 1.5rem;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: #e0e0e0;
    font-weight: 600;
    font-size: 0.9rem;
`;

const Input = styled.input`
    background: #000000;
    border: 2px solid #333333;
    border-radius: 8px;
    padding: 1rem;
    color: #e0e0e0;
    font-size: 16px; /* Prevents iOS zoom on focus */
    transition: border-color 0.2s ease;
    -webkit-appearance: none;
    min-height: 48px; /* Touch-friendly target size */

    &:focus {
        outline: none;
        border-color: #4ade80;
    }

    &::placeholder {
        color: #666;
    }
`;

const FileInputWrapper = styled.div`
    position: relative;
`;

const FileInput = styled.input`
    display: none;
`;

const FileInputLabel = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #000000;
    border: 2px dashed #333333;
    border-radius: 8px;
    padding: 1.25rem 1rem;
    color: #999;
    font-size: 0.9rem;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
    min-height: 60px; /* Touch-friendly */
    text-align: center;

    &:hover, &:active {
        border-color: #4ade80;
        color: #4ade80;
    }
`;

const FileName = styled.div`
    background: #000000;
    border: 2px solid #4ade80;
    border-radius: 8px;
    padding: 1rem;
    color: #4ade80;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    word-break: break-all;
`;

const RemoveFile = styled.button`
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 1.5rem;
    padding: 0.25rem 0.5rem;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover, &:active {
        color: #dc2626;
    }
`;

const SubmitButton = styled.button`
    background: #4ade80;
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
    margin-top: 0.5rem;
    min-height: 52px; /* Touch-friendly */
    -webkit-appearance: none;

    &:hover, &:active {
        background: #3bc76a;
    }

    &:disabled {
        background: #666;
        cursor: not-allowed;
    }
`;

const SuccessContainer = styled.div`
    text-align: center;
    padding: 1.5rem 1rem;

    @media (min-width: 480px) {
        padding: 2rem;
    }
`;

const SuccessIconWrapper = styled.div`
    width: 80px;
    height: 80px;
    background: #4ade80;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;

    @media (min-width: 480px) {
        width: 100px;
        height: 100px;
    }
`;

const SuccessCheckmark = styled.span`
    font-size: 2.5rem;
    color: white;

    @media (min-width: 480px) {
        font-size: 3rem;
    }
`;

const SuccessTitle = styled.h2`
    color: #4ade80;
    font-size: 1.5rem;
    margin-bottom: 1rem;

    @media (min-width: 480px) {
        font-size: 1.75rem;
    }
`;

const SuccessText = styled.p`
    color: #e0e0e0;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
`;

const SuccessDetails = styled.div`
    background: #000;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
    text-align: left;
`;

const SuccessDetailRow = styled.p`
    color: #999;
    font-size: 0.9rem;
    margin: 0.5rem 0;

    strong {
        color: #e0e0e0;
    }
`;

const ErrorMessage = styled.div`
    background: #ef4444;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 1rem;
    font-size: 0.9rem;
`;

const RequiredStar = styled.span`
    color: #ef4444;
`;

const PublicApply: React.FC = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('job');
    const jobTitle = searchParams.get('title') || 'Open Position';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [resume, setResume] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf' || file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                setResume(file);
                setError('');
            } else {
                setError('Please upload a PDF or Word document');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.phone) {
            setError('Please fill in all required fields');
            return;
        }

        if (!resume) {
            setError('Please attach your resume');
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('phone', formData.phone);
            submitData.append('resume', resume);
            if (jobId) submitData.append('jobId', jobId);
            submitData.append('jobTitle', jobTitle);

            const response = await fetch(`${config.apiUrl}/api/apply`, {
                method: 'POST',
                body: submitData
            });

            const data = await response.json();

            if (data.status === 'success') {
                setIsSubmitted(true);
            } else {
                setError(data.message || 'Failed to submit application');
            }
        } catch (err) {
            console.error('Error submitting application:', err);
            setError('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <PageContainer>
                <FormCard>
                    <SuccessContainer>
                        <SuccessIconWrapper>
                            <SuccessCheckmark>✓</SuccessCheckmark>
                        </SuccessIconWrapper>
                        <SuccessTitle>Application Submitted!</SuccessTitle>
                        <SuccessText>
                            Thank you for applying. We've received your application and will review it shortly.
                            If your qualifications match our needs, we'll be in touch.
                        </SuccessText>
                        <SuccessDetails>
                            <SuccessDetailRow><strong>Position:</strong> {jobTitle}</SuccessDetailRow>
                            <SuccessDetailRow><strong>Name:</strong> {formData.name}</SuccessDetailRow>
                            <SuccessDetailRow><strong>Email:</strong> {formData.email}</SuccessDetailRow>
                        </SuccessDetails>
                    </SuccessContainer>
                </FormCard>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <FormCard>
                <Logo>
                    <LogoText>TALOS</LogoText>
                </Logo>

                <Title>Apply for {jobTitle}</Title>
                <Subtitle>Submit your application below</Subtitle>

                <JobDescriptionSection>
                    <JobDescriptionHeader>Job Summary</JobDescriptionHeader>
                    <JobDescriptionText>
                        Join our team as an HVAC Service Technician and play a key role in delivering reliable heating, ventilation, air conditioning, and refrigeration solutions to our customers. In this hands-on position, you'll diagnose, repair, and maintain HVAC/R systems across residential and commercial settings. Your technical expertise will ensure optimal system performance, energy efficiency, and exceptional customer satisfaction. This role offers the opportunity to work with diverse equipment, sharpen your diagnostic skills, and grow within a company that values safety, quality workmanship, and professional development.
                    </JobDescriptionText>

                    <JobDescriptionHeader>Duties</JobDescriptionHeader>
                    <JobDescriptionList>
                        <li>Diagnose and repair HVAC systems including air conditioning units, heating systems (gas, electric, oil), and refrigeration equipment using schematics and technical manuals.</li>
                        <li>Perform routine preventive maintenance on HVAC/R systems to prevent breakdowns and extend equipment lifespan.</li>
                        <li>Install, calibrate, and test HVAC controls, thermostats, and system components to ensure proper operation and safety compliance.</li>
                        <li>Read and interpret blueprints, load calculations, and HVAC design plans to accurately troubleshoot issues and execute repairs.</li>
                        <li>Conduct field service visits for system diagnostics, repairs, and equipment upgrades across various customer sites.</li>
                        <li>Troubleshoot electrical, mechanical, and refrigerant-related issues using diagnostic tools and industry best practices.</li>
                        <li>Maintain detailed service records, complete inspection reports, and document all work performed for accountability and future reference.</li>
                        <li>Communicate effectively with customers to explain repairs, provide recommendations, and ensure a positive service experience.</li>
                    </JobDescriptionList>

                    <JobDescriptionHeader>Requirements</JobDescriptionHeader>
                    <JobDescriptionList>
                        <li>2+ years of proven experience as an HVAC Service Technician with hands-on troubleshooting and repair skills.</li>
                        <li>EPA 608 Universal Certification required; NATE Certification preferred.</li>
                        <li>Strong technical knowledge of air conditioning, heating systems, refrigeration, and ductwork installation.</li>
                        <li>Ability to read and interpret schematics, blueprints, and technical manuals accurately.</li>
                        <li>Proficiency with hand tools, power tools, and diagnostic equipment.</li>
                        <li>Valid driver's license with a clean driving record.</li>
                        <li>Experience with both residential and commercial HVAC systems preferred.</li>
                        <li>Strong customer service and communication skills with professional demeanor.</li>
                        <li>Commitment to safety protocols and OSHA compliance standards.</li>
                        <li>Ability to work in various environments including attics, crawl spaces, and rooftops, with physical capability to lift heavy equipment.</li>
                    </JobDescriptionList>
                </JobDescriptionSection>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Full Name <RequiredStar>*</RequiredStar></Label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Smith"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Email Address <RequiredStar>*</RequiredStar></Label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Phone Number <RequiredStar>*</RequiredStar></Label>
                        <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(555) 123-4567"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Resume <RequiredStar>*</RequiredStar></Label>
                        <FileInputWrapper>
                            {!resume ? (
                                <>
                                    <FileInput
                                        type="file"
                                        id="resume"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                    <FileInputLabel htmlFor="resume">
                                        📄 Click to upload your resume (PDF or Word)
                                    </FileInputLabel>
                                </>
                            ) : (
                                <FileName>
                                    <span>📄 {resume.name}</span>
                                    <RemoveFile type="button" onClick={() => setResume(null)}>
                                        ×
                                    </RemoveFile>
                                </FileName>
                            )}
                        </FileInputWrapper>
                    </FormGroup>

                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </SubmitButton>
                </Form>
            </FormCard>
        </PageContainer>
    );
};

export default PublicApply;
