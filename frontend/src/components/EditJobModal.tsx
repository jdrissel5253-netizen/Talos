import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';

interface Job {
    id: number;
    title: string;
    description: string;
    location: string;
    city?: string;
    zip_code?: string;
    job_type?: string;
    job_location_type?: string;
    pay_range_min?: number;
    pay_range_max?: number;
    pay_type?: string;
    required_years_experience: number;
    education_requirements?: string;
    status: string;
    company_name?: string;
}

interface Props {
    job: Job;
    onClose: () => void;
    onSaved: (updated: Job) => void;
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
`;

const Modal = styled.div`
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2rem;
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.75rem;
`;

const ModalTitle = styled.h2`
    color: #4ade80;
    font-size: 1.25rem;
    font-weight: 700;
`;

const CloseBtn = styled.button`
    background: none;
    border: none;
    color: #aaa;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    &:hover { color: #fff; }
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
`;

const Label = styled.label`
    color: #aaa;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const Input = styled.input`
    background: #0d0d0d;
    border: 1px solid #333;
    border-radius: 6px;
    color: #fff;
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
    font-family: inherit;
    width: 100%;
    &:focus { outline: none; border-color: #4ade80; }
`;

const Select = styled.select`
    background: #0d0d0d;
    border: 1px solid #333;
    border-radius: 6px;
    color: #fff;
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
    font-family: inherit;
    width: 100%;
    &:focus { outline: none; border-color: #4ade80; }
`;

const Textarea = styled.textarea`
    background: #0d0d0d;
    border: 1px solid #333;
    border-radius: 6px;
    color: #fff;
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
    font-family: inherit;
    width: 100%;
    min-height: 120px;
    resize: vertical;
    &:focus { outline: none; border-color: #4ade80; }
`;

const ErrorMsg = styled.div`
    background: #2a0d0d;
    border: 1px solid #ef444460;
    color: #f87171;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
`;

const CancelBtn = styled.button`
    background: transparent;
    border: 1px solid #444;
    color: #aaa;
    padding: 0.65rem 1.25rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    &:hover { border-color: #666; color: #fff; }
`;

const SaveBtn = styled.button`
    background: #4ade80;
    border: none;
    color: #000;
    padding: 0.65rem 1.5rem;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s;
    &:hover { background: #22c55e; }
    &:disabled { background: #555; color: #888; cursor: not-allowed; }
`;

const JOB_TITLE_OPTIONS = [
    'HVAC Service Technician',
    'Preventative Maintenance Technician',
    'HVAC Technician',
    'Lead HVAC Technician',
    'HVAC Dispatcher',
    'Administrative Assistant',
    'Customer Service Representative',
    'HVAC Installer',
    'Lead HVAC Installer',
    'Maintenance Technician',
    'Warehouse Associate',
    'Bookkeeper',
    'HVAC Sales Representative',
    'HVAC Service Manager',
    'Apprentice',
];

const EditJobModal: React.FC<Props> = ({ job, onClose, onSaved }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [form, setForm] = useState({
        title: job.title || '',
        status: job.status || 'active',
        city: job.city || job.location?.split(',')[0]?.trim() || '',
        zip_code: job.zip_code || '',
        job_type: job.job_type || 'full-time',
        job_location_type: job.job_location_type || 'on-site',
        pay_range_min: job.pay_range_min != null ? String(job.pay_range_min) : '',
        pay_range_max: job.pay_range_max != null ? String(job.pay_range_max) : '',
        pay_type: job.pay_type || 'hourly',
        required_years_experience: String(job.required_years_experience ?? ''),
        education_requirements: job.education_requirements || 'High School Diploma',
        description: job.description || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        modalRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setError('');
        if (!form.title.trim()) { setError('Title is required.'); return; }

        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                title: form.title,
                status: form.status,
                city: form.city,
                zip_code: form.zip_code,
                location: form.city && form.zip_code ? `${form.city}, ${form.zip_code}` : form.city || form.zip_code,
                job_type: form.job_type,
                job_location_type: form.job_location_type,
                required_years_experience: parseFloat(form.required_years_experience) || 0,
                education_requirements: form.education_requirements === 'no_degree' ? 'High School Diploma' : form.education_requirements,
                description: form.description,
            };
            if (form.pay_range_min) payload.pay_range_min = parseFloat(form.pay_range_min);
            if (form.pay_range_max) payload.pay_range_max = parseFloat(form.pay_range_max);
            if (form.pay_type) payload.pay_type = form.pay_type;

            const res = await fetch(`${config.apiUrl}/api/jobs/${job.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.message || 'Failed to save changes.');
                return;
            }

            const data = await res.json();
            onSaved(data.data?.job ?? { ...job, ...payload });
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <Modal
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-job-modal-title"
            >
                <ModalHeader>
                    <ModalTitle id="edit-job-modal-title">Edit Job</ModalTitle>
                    <CloseBtn onClick={onClose} aria-label="Close"><X size={20} /></CloseBtn>
                </ModalHeader>

                {error && <ErrorMsg role="alert">{error}</ErrorMsg>}

                <FormGroup>
                    <Label htmlFor="edit-title">Job Title</Label>
                    <Select id="edit-title" name="title" value={form.title} onChange={handleChange}>
                        {JOB_TITLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        {!JOB_TITLE_OPTIONS.includes(form.title) && (
                            <option value={form.title}>{form.title}</option>
                        )}
                    </Select>
                </FormGroup>

                <FormRow>
                    <FormGroup>
                        <Label htmlFor="edit-status">Status</Label>
                        <Select id="edit-status" name="status" value={form.status} onChange={handleChange}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="closed">Closed</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="edit-job-type">Job Type</Label>
                        <Select id="edit-job-type" name="job_type" value={form.job_type} onChange={handleChange}>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="temporary">Temporary</option>
                        </Select>
                    </FormGroup>
                </FormRow>

                <FormRow>
                    <FormGroup>
                        <Label htmlFor="edit-city">City</Label>
                        <Input id="edit-city" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Charlotte" />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="edit-zip">ZIP Code</Label>
                        <Input id="edit-zip" name="zip_code" value={form.zip_code} onChange={handleChange} placeholder="e.g. 28201" />
                    </FormGroup>
                </FormRow>

                <FormRow>
                    <FormGroup>
                        <Label htmlFor="edit-location-type">Work Location</Label>
                        <Select id="edit-location-type" name="job_location_type" value={form.job_location_type} onChange={handleChange}>
                            <option value="on-site">On-site</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="edit-exp">Years Experience Required</Label>
                        <Select id="edit-exp" name="required_years_experience" value={form.required_years_experience} onChange={handleChange}>
                            <option value="0">No experience required</option>
                            <option value="1">1 year</option>
                            <option value="2">2 years</option>
                            <option value="3">3 years</option>
                            <option value="4">4 years</option>
                            <option value="5">5 years</option>
                            <option value="6">6+ years</option>
                            <option value="10">10+ years</option>
                        </Select>
                    </FormGroup>
                </FormRow>

                <FormRow>
                    <FormGroup>
                        <Label htmlFor="edit-pay-min">Pay Min</Label>
                        <Input id="edit-pay-min" name="pay_range_min" type="number" value={form.pay_range_min} onChange={handleChange} placeholder="e.g. 20" />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="edit-pay-max">Pay Max</Label>
                        <Input id="edit-pay-max" name="pay_range_max" type="number" value={form.pay_range_max} onChange={handleChange} placeholder="e.g. 30" />
                    </FormGroup>
                </FormRow>

                <FormRow>
                    <FormGroup>
                        <Label htmlFor="edit-pay-type">Pay Type</Label>
                        <Select id="edit-pay-type" name="pay_type" value={form.pay_type} onChange={handleChange}>
                            <option value="hourly">Hourly</option>
                            <option value="salary">Salary</option>
                        </Select>
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="edit-education">Education</Label>
                        <Select id="edit-education" name="education_requirements" value={form.education_requirements} onChange={handleChange}>
                            <option value="High School Diploma">High School Diploma</option>
                            <option value="college_degree">College Degree</option>
                            <option value="technical_school">Technical School</option>
                        </Select>
                    </FormGroup>
                </FormRow>

                <FormGroup>
                    <Label htmlFor="edit-description">Job Description</Label>
                    <Textarea id="edit-description" name="description" value={form.description} onChange={handleChange} placeholder="Job description..." />
                </FormGroup>

                <ButtonRow>
                    <CancelBtn onClick={onClose}>Cancel</CancelBtn>
                    <SaveBtn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</SaveBtn>
                </ButtonRow>
            </Modal>
        </Overlay>
    );
};

export default EditJobModal;
