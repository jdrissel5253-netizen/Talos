import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { config } from '../config';
import { getAuthHeaders } from '../utils/auth';

const FormContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 2rem;
`;

const FormCard = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 2.5rem;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #333333;
`;

const FormTitle = styled.h2`
  font-size: 1.75rem;
  color: #4ade80;
  margin-bottom: 0.5rem;
`;

const FormSubtitle = styled.p`
  color: #e0e0e0;
  font-size: 0.95rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;

  &:hover {
    color: #4ade80;
  }
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #4ade80;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequiredStar = styled.span`
  color: #ef4444;
`;

const Input = styled.input`
  background: #000000;
  border: 2px solid #333333;
  border-radius: 6px;
  padding: 0.75rem;
  color: #e0e0e0;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4ade80;
  }

  &::placeholder {
    color: #666;
  }
`;

const TextArea = styled.textarea`
  background: #000000;
  border: 2px solid #333333;
  border-radius: 6px;
  padding: 0.75rem;
  color: #e0e0e0;
  font-size: 0.95rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #4ade80;
  }

  &::placeholder {
    color: #666;
  }
`;

const Select = styled.select`
  background: #000000;
  border: 2px solid #333333;
  border-radius: 6px;
  padding: 0.75rem;
  color: #e0e0e0;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4ade80;
  }

  option {
    background: #1a1a1a;
    color: #e0e0e0;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  background: #000000;
  border-radius: 6px;
  border: 2px solid #333333;
  max-height: 300px;
  overflow-y: auto;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    color: #4ade80;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #4ade80;
  }
`;

const ArrayInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ArrayItemRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: #dc2626;
  }
`;

const AddButton = styled.button`
  background: #333333;
  color: #e0e0e0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;

  &:hover {
    background: #4ade80;
    color: white;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 2rem;
  padding: 0.75rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e0e0e0;
  cursor: pointer;

  input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #4ade80;
  }
`;

const SubmitButton = styled.button`
  background: #4ade80;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #3bc76a;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #333333;
  border-top: 4px solid #4ade80;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #e0e0e0;
  font-size: 1.125rem;
  margin-top: 1rem;
`;

const Tooltip = styled.span`
  background: #333333;
  color: #e0e0e0;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  position: absolute;
  white-space: nowrap;
  z-index: 100;
  margin-top: -2.5rem;
  display: none;
`;

const TooltipIcon = styled.span`
  background: #333333;
  color: #4ade80;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: help;
  position: relative;

  &:hover ${Tooltip} {
    display: block;
  }
`;

interface AddJobFormProps {
  onClose: () => void;
  onJobCreated: () => void;
}

const JOB_TITLE_OPTIONS = [
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
  'Apprentice'
];

const YEARS_OF_EXPERIENCE_OPTIONS = [
  { value: '0', label: 'No experience required' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5 years' },
  { value: '6', label: '6+ years' },
  { value: '7', label: '7+ years' },
  { value: '10', label: '10+ years' }
];

const BENEFITS_OPTIONS = [
  'Health insurance',
  'Paid time off',
  '401(k)',
  'Dental insurance',
  'Vision insurance',
  '401(k) matching',
  'Life insurance',
  '401(k) 2% match',
  '401(k) 3% match',
  '401(k) 4% match',
  '401(k) 5% match',
  '401(k) 6% match',
  '401(k) 7% match',
  '401(k) 8% match',
  '401(k) 9% match',
  '401(k) 10% match',
  'Company car',
  'Tools provided',
  'Health savings account',
  'On-the-job training',
  'Employee discount',
  'Referral program',
  'Employee assistance program',
  'Tuition reimbursement',
  'Retirement plan',
  'Flexible spending account',
  'Flexible schedule',
  'Parental leave',
  'Professional development assistance'
];

const AddJobForm: React.FC<AddJobFormProps> = ({ onClose, onJobCreated }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Escape key to close & focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    // Focus the modal container
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    job_location_type: 'on-site',
    city: '',
    zip_code: '',
    job_type: 'full_time',
    pay_range_min: '',
    pay_range_max: '',
    pay_type: 'hourly',
    expected_hours: '',
    work_schedule: '',
    benefits: [] as string[],
    key_responsibilities: ['', '', ''],
    qualifications_years: '',
    qualifications_certifications: [] as string[],
    education_requirements: 'no_degree',
    other_relevant_titles: [] as string[],
    advancement_opportunities: false,
    advancement_timeline: '',
    company_culture: ''
  });

  const [newCertification, setNewCertification] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBenefitToggle = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    const newResponsibilities = [...formData.key_responsibilities];
    newResponsibilities[index] = value;
    setFormData(prev => ({ ...prev, key_responsibilities: newResponsibilities }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications_certifications: [...prev.qualifications_certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications_certifications: prev.qualifications_certifications.filter((_, i) => i !== index)
    }));
  };

  const addTitle = () => {
    if (newTitle.trim()) {
      setFormData(prev => ({
        ...prev,
        other_relevant_titles: [...prev.other_relevant_titles, newTitle.trim()]
      }));
      setNewTitle('');
    }
  };

  const removeTitle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      other_relevant_titles: prev.other_relevant_titles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a job title');
      return;
    }

    if (!formData.key_responsibilities[0] || !formData.key_responsibilities[1] || !formData.key_responsibilities[2]) {
      setError('Please enter all 3 key job responsibilities');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        location: `${formData.city}, ${formData.zip_code}`,
        required_years_experience: parseFloat(formData.qualifications_years) || 0,
        pay_range_min: parseFloat(formData.pay_range_min) || null,
        pay_range_max: parseFloat(formData.pay_range_max) || null,
        position_type: formData.title,
        vehicle_required: false,
        flexible_on_title: true
      };

      const response = await fetch(`${config.apiUrl}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message || (response.status >= 500
          ? 'Something went wrong. Please try again later.'
          : 'Failed to create job. Please check your information.'));
        return;
      }

      const data = await response.json();

      if (data.status === 'success') {
        onJobCreated();
        onClose();
      } else {
        setError(data.message || 'Failed to create job');
      }
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer onClick={(e) => e.target === e.currentTarget && onClose()}>
      <FormCard
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-job-form-title"
      >
        {isSubmitting && (
          <LoadingOverlay>
            <LoadingSpinner />
            <LoadingText>Creating job and generating AI description...</LoadingText>
          </LoadingOverlay>
        )}

        <CloseButton aria-label="Close" onClick={onClose}>&times;</CloseButton>

        <FormHeader>
          <FormTitle id="add-job-form-title">Create New Job Posting</FormTitle>
          <FormSubtitle>Fill out the details below and AI will generate a compelling job description</FormSubtitle>
        </FormHeader>

        {error && (
          <div role="alert" style={{ background: '#7f1d1d', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>

            <FormRow>
              <FormGroup>
                <Label>
                  Job Title <RequiredStar>*</RequiredStar>
                </Label>
                <Select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select a job title --</option>
                  {JOB_TITLE_OPTIONS.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Company Name</Label>
                <Input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Your company name"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Job Location Type</Label>
                <Select
                  name="job_location_type"
                  value={formData.job_location_type}
                  onChange={handleChange}
                >
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>City</Label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </FormGroup>

              <FormGroup>
                <Label>Zip Code</Label>
                <Input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  placeholder="12345"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Job Type</Label>
              <Select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
              >
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
                <option value="temp_to_hire">Temp to hire</option>
              </Select>
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>Compensation</SectionTitle>

            <FormRow>
              <FormGroup>
                <Label>Pay Range (Minimum)</Label>
                <Input
                  type="number"
                  name="pay_range_min"
                  value={formData.pay_range_min}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                  step="0.01"
                />
              </FormGroup>

              <FormGroup>
                <Label>Pay Range (Maximum)</Label>
                <Input
                  type="number"
                  name="pay_range_max"
                  value={formData.pay_range_max}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  step="0.01"
                />
              </FormGroup>

              <FormGroup>
                <Label>Pay Type</Label>
                <RadioGroup>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="pay_type"
                      value="hourly"
                      checked={formData.pay_type === 'hourly'}
                      onChange={handleChange}
                    />
                    Hourly
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="pay_type"
                      value="yearly"
                      checked={formData.pay_type === 'yearly'}
                      onChange={handleChange}
                    />
                    Yearly
                  </RadioLabel>
                </RadioGroup>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Expected Hours</Label>
                <Input
                  type="text"
                  name="expected_hours"
                  value={formData.expected_hours}
                  onChange={handleChange}
                  placeholder="e.g., 40 hours per week"
                />
              </FormGroup>

              <FormGroup>
                <Label>Work Schedule</Label>
                <Input
                  type="text"
                  name="work_schedule"
                  value={formData.work_schedule}
                  onChange={handleChange}
                  placeholder="e.g., Monday-Friday, 8am-5pm"
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Benefits</SectionTitle>
            <CheckboxGroup>
              {BENEFITS_OPTIONS.map(benefit => (
                <CheckboxLabel key={benefit}>
                  <input
                    type="checkbox"
                    checked={formData.benefits.includes(benefit)}
                    onChange={() => handleBenefitToggle(benefit)}
                  />
                  {benefit}
                </CheckboxLabel>
              ))}
            </CheckboxGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>
              Key Job Responsibilities <RequiredStar>*</RequiredStar>
              <TooltipIcon>
                ?
                <Tooltip>Enter 3 key responsibilities. AI will expand these into a full job description.</Tooltip>
              </TooltipIcon>
            </SectionTitle>

            {formData.key_responsibilities.map((resp, index) => (
              <FormGroup key={index}>
                <Label>Responsibility {index + 1}</Label>
                <Input
                  type="text"
                  value={resp}
                  onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                  placeholder={`e.g., Perform HVAC system maintenance and repairs`}
                  required
                />
              </FormGroup>
            ))}
          </FormSection>

          <FormSection>
            <SectionTitle>Qualifications</SectionTitle>

            <FormRow>
              <FormGroup>
                <Label>Years of Experience</Label>
                <Select
                  name="qualifications_years"
                  value={formData.qualifications_years}
                  onChange={handleChange}
                >
                  <option value="">-- Select years of experience --</option>
                  {YEARS_OF_EXPERIENCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Education Requirements</Label>
                <Select
                  name="education_requirements"
                  value={formData.education_requirements}
                  onChange={handleChange}
                >
                  <option value="no_degree">No degree required</option>
                  <option value="college_degree">College degree</option>
                  <option value="technical_school">Technical school degree</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Required Certifications</Label>
              <ArrayInputContainer>
                {formData.qualifications_certifications.map((cert, index) => (
                  <ArrayItemRow key={index}>
                    <Input type="text" value={cert} disabled style={{ flex: 1 }} />
                    <RemoveButton onClick={() => removeCertification(index)}>Remove</RemoveButton>
                  </ArrayItemRow>
                ))}
                <ArrayItemRow>
                  <Select
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Select a certification or type custom below --</option>
                    <option value="EPA 608 Universal Certification">EPA 608 Universal Certification</option>
                    <option value="EPA 608 Type I (Small Appliances)">EPA 608 Type I (Small Appliances)</option>
                    <option value="EPA 608 Type II (High Pressure)">EPA 608 Type II (High Pressure)</option>
                    <option value="EPA 608 Type III (Low Pressure)">EPA 608 Type III (Low Pressure)</option>
                    <option value="NATE Certification">NATE Certification (North American Technician Excellence)</option>
                    <option value="HVAC Excellence Certification">HVAC Excellence Certification</option>
                    <option value="R-410A Certification">R-410A Certification</option>
                    <option value="OSHA 10 or 30 Hour Safety">OSHA 10 or 30 Hour Safety</option>
                    <option value="State HVAC License">State HVAC License</option>
                    <option value="Journeyman HVAC License">Journeyman HVAC License</option>
                    <option value="Master HVAC License">Master HVAC License</option>
                    <option value="Electrical License">Electrical License</option>
                    <option value="Building Performance Institute (BPI) Certification">Building Performance Institute (BPI) Certification</option>
                    <option value="RESNET HERS Rater Certification">RESNET HERS Rater Certification</option>
                    <option value="Commercial Refrigeration Certification">Commercial Refrigeration Certification</option>
                    <option value="Gas Piping/Fitting Certification">Gas Piping/Fitting Certification</option>
                    <option value="Boiler License">Boiler License</option>
                    <option value="Building Automation Systems (BAS) Certification">Building Automation Systems (BAS) Certification</option>
                    <option value="Smart Thermostat/Controls Certification">Smart Thermostat/Controls Certification</option>
                    <option value="Ductwork Certification">Ductwork Certification</option>
                    <option value="Sheet Metal License">Sheet Metal License</option>
                    <option value="Custom">Custom (type below)</option>
                  </Select>
                  <AddButton onClick={addCertification}>Add</AddButton>
                </ArrayItemRow>
                {newCertification === 'Custom' && (
                  <ArrayItemRow style={{ marginTop: '0.5rem' }}>
                    <Input
                      type="text"
                      value=""
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Enter custom certification"
                      style={{ flex: 1 }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                      autoFocus
                    />
                  </ArrayItemRow>
                )}
              </ArrayInputContainer>
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>Additional Information</SectionTitle>

            <FormGroup>
              <Label>
                Other Relevant Job Titles
                <TooltipIcon>
                  ?
                  <Tooltip>Alternative job titles that may be suitable for this position</Tooltip>
                </TooltipIcon>
              </Label>
              <ArrayInputContainer>
                {formData.other_relevant_titles.map((title, index) => (
                  <ArrayItemRow key={index}>
                    <Input type="text" value={title} disabled style={{ flex: 1 }} />
                    <RemoveButton onClick={() => removeTitle(index)}>Remove</RemoveButton>
                  </ArrayItemRow>
                ))}
                <ArrayItemRow>
                  <Input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., HVAC Technician, Climate Control Specialist"
                    style={{ flex: 1 }}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTitle())}
                  />
                  <AddButton onClick={addTitle}>Add</AddButton>
                </ArrayItemRow>
              </ArrayInputContainer>
            </FormGroup>

            <FormGroup>
              <Label>
                <input
                  type="checkbox"
                  name="advancement_opportunities"
                  checked={formData.advancement_opportunities}
                  onChange={handleChange}
                  style={{ marginRight: '0.5rem', width: '18px', height: '18px', accentColor: '#4ade80' }}
                />
                Opportunities for advancement available
              </Label>
            </FormGroup>

            {formData.advancement_opportunities && (
              <FormGroup>
                <Label>Advancement Timeline (Optional)</Label>
                <Input
                  type="text"
                  name="advancement_timeline"
                  value={formData.advancement_timeline}
                  onChange={handleChange}
                  placeholder="e.g., 6-12 months"
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>
                Company Culture (Optional)
                <TooltipIcon>
                  ?
                  <Tooltip>A positive company culture can help attract high quality candidates</Tooltip>
                </TooltipIcon>
              </Label>
              <TextArea
                name="company_culture"
                value={formData.company_culture}
                onChange={handleChange}
                placeholder="Describe your company culture, values, and work environment..."
              />
            </FormGroup>
          </FormSection>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Job...' : 'Create Job with AI Description'}
          </SubmitButton>
        </form>
      </FormCard>
    </FormContainer>
  );
};

export default AddJobForm;
