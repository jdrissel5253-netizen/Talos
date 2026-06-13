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

const SuggestionsWrap = styled.div`
  margin-top: 0.75rem;
`;

const SuggestionsLabel = styled.p`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.5rem;
`;

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SuggestionChip = styled.button`
  background: #1e2a1e;
  color: #4ade80;
  border: 1px solid #4ade8050;
  border-radius: 20px;
  padding: 0.3rem 0.85rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #4ade8020;
    border-color: #4ade80;
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

const RegenerateButton = styled.button`
  background: transparent;
  color: #4ade80;
  border: 1px solid #4ade8060;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: #4ade8015;
    border-color: #4ade80;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const ExperienceWarning = styled.div`
  margin-top: 0.6rem;
  padding: 0.75rem 1rem;
  background: #2a1f00;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  color: #fcd34d;
  font-size: 0.85rem;
  line-height: 1.5;
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

interface EditJobData {
  id: number;
  title?: string;
  company_name?: string;
  job_location_type?: string;
  city?: string;
  zip_code?: string;
  job_type?: string;
  pay_range_min?: number | null;
  pay_range_max?: number | null;
  pay_type?: string;
  required_years_experience?: number;
  education_requirements?: string;
  benefits?: string | string[];
  key_responsibilities?: string | string[];
  qualifications_certifications?: string | string[];
  other_relevant_titles?: string | string[];
  flexible_on_title?: boolean;
  drivers_license_required?: boolean;
  advancement_opportunities?: boolean;
  advancement_timeline?: string;
  company_culture?: string;
  description?: string;
  valid_through?: string;
}

interface AddJobFormProps {
  onClose: () => void;
  onJobCreated: () => void;
  editJob?: EditJobData;
}

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
  'Apprentice'
];

const SENIOR_ROLES = new Set([
  'Lead HVAC Technician',
  'Lead HVAC Installer',
  'HVAC Service Manager',
]);

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

const RESPONSIBILITIES_BY_TITLE: Record<string, string[]> = {
  'HVAC Service Technician': [
    'Diagnose and repair malfunctioning HVAC systems at residential and commercial sites',
    'Respond to emergency service calls and troubleshoot issues on-site',
    'Perform scheduled maintenance including tune-ups, filter changes, and coil cleaning',
    'Handle refrigerant recovery, recharge, and leak detection per EPA regulations',
    'Replace defective components including motors, compressors, and capacitors',
    'Document service reports accurately and communicate findings to customers',
    'Ensure all work meets local codes and company safety standards',
  ],
  'Preventative Maintenance Technician': [
    'Perform routine inspections and seasonal tune-ups on HVAC equipment',
    'Clean and replace air filters, coils, drain lines, and belts',
    'Lubricate moving parts and inspect electrical connections for wear',
    'Test system performance and identify potential issues before failure',
    'Maintain detailed maintenance logs and service records for each account',
    'Communicate maintenance findings and recommendations to customers clearly',
    'Coordinate with dispatch to manage and optimize PM routes',
  ],
  'HVAC Technician': [
    'Install, maintain, and repair residential and commercial HVAC systems',
    'Diagnose electrical, mechanical, and refrigerant issues accurately',
    'Perform seasonal tune-ups and preventive maintenance visits',
    'Read and interpret wiring diagrams, schematics, and equipment manuals',
    'Handle refrigerant in compliance with EPA 608 certification requirements',
    'Complete service documentation and job reports accurately after each call',
    'Maintain a clean, organized service vehicle and personal tool inventory',
  ],
  'Lead HVAC Technician': [
    'Lead a team of technicians on complex installation and service projects',
    'Diagnose and resolve advanced HVAC system failures that junior techs escalate',
    'Mentor and provide hands-on training to junior technicians and apprentices',
    'Perform quality control inspections on work completed by the team',
    'Coordinate with project managers and customers on job timelines and progress',
    'Handle escalated customer service issues professionally in the field',
    'Ensure all team work meets code requirements and company quality standards',
  ],
  'HVAC Dispatcher': [
    'Schedule and dispatch technicians to service calls efficiently throughout the day',
    'Prioritize emergency calls and adjust schedules in real time as needed',
    'Communicate job details, updates, and route changes to field technicians',
    'Coordinate parts availability to ensure technicians arrive prepared for each job',
    'Maintain accurate records of service calls, technician status, and job outcomes',
    'Serve as the primary contact for customer scheduling inquiries and updates',
    'Monitor technician locations and optimize routing to reduce drive time',
  ],
  'Administrative Assistant': [
    'Answer incoming calls and direct customer inquiries to the appropriate team member',
    'Process and track invoices, work orders, and purchase orders in the system',
    'Maintain accurate customer records and update the CRM regularly',
    'Assist with scheduling appointments and coordinating technician calendars',
    'Order and track office, shop, and operational supplies',
    'Prepare reports, correspondence, and presentations for management',
    'Support field technicians with administrative needs and paperwork processing',
  ],
  'Customer Service Representative': [
    'Handle inbound customer calls for service requests, questions, and scheduling',
    'Resolve customer complaints professionally and escalate issues when necessary',
    'Follow up with customers after service visits to ensure satisfaction',
    'Process payments and assist customers with billing questions and disputes',
    'Maintain accurate customer accounts and detailed service history records',
    'Present and sell maintenance agreements and service plans to customers',
    'Coordinate with dispatch to provide customers with accurate scheduling updates',
  ],
  'HVAC Installer': [
    'Install new HVAC systems including furnaces, air conditioners, and heat pumps',
    'Install, seal, and insulate ductwork and ventilation systems to spec',
    'Connect refrigerant lines, electrical wiring, and controls per manufacturer specs',
    'Commission newly installed systems and verify proper airflow and operation',
    'Read and follow blueprints, load calculations, and installation drawings',
    'Coordinate with other trades on new construction and renovation projects',
    'Ensure all installations meet local codes, manufacturer specs, and company standards',
  ],
  'Lead HVAC Installer': [
    'Oversee and coordinate multi-technician installation projects from start to finish',
    'Review blueprints and develop detailed installation plans before job start',
    'Install complex commercial and residential HVAC systems with precision',
    'Perform final commissioning and quality inspections on all completed installations',
    'Train, supervise, and mentor installers and helpers on job sites',
    'Communicate progress and issues to general contractors and project stakeholders',
    'Ensure all work meets code requirements, manufacturer specs, and company standards',
  ],
  'Maintenance Technician': [
    'Perform routine inspections and preventive maintenance on facility HVAC equipment',
    'Identify and address minor equipment issues before they become major failures',
    'Maintain detailed maintenance logs, work orders, and equipment records',
    'Respond promptly to facility maintenance and comfort complaints',
    'Coordinate with vendors and contractors for specialized repairs as needed',
    'Ensure all mechanical systems comply with safety and building code regulations',
    'Support the facilities team with general building maintenance tasks as assigned',
  ],
  'Warehouse Associate': [
    'Receive, inspect, and accurately stock incoming HVAC parts and equipment',
    'Pick, stage, and prepare parts orders for field technicians each day',
    'Maintain accurate inventory records using warehouse management software',
    'Load and unload delivery trucks and keep the warehouse organized',
    'Coordinate with purchasing to flag and reorder low-stock items proactively',
    'Maintain warehouse cleanliness and enforce safety standards at all times',
    'Process and verify shipping and receiving documentation accurately',
  ],
  'Bookkeeper': [
    'Process accounts payable and receivable transactions accurately and on time',
    'Reconcile bank statements, credit card accounts, and financial records monthly',
    'Process payroll and maintain accurate timekeeping and labor records',
    'Prepare monthly and quarterly financial reports for management review',
    'Manage vendor relationships and process supplier invoices efficiently',
    'Track job costs and assist management with project profitability analysis',
    'Coordinate with the CPA firm for tax preparation and year-end close',
  ],
  'HVAC Sales Representative': [
    'Generate and follow up on leads for residential and commercial HVAC services',
    'Conduct in-home or on-site system assessments and consultations',
    'Prepare and present detailed sales proposals, quotes, and financing options',
    'Educate customers on equipment choices, efficiency upgrades, and maintenance plans',
    'Meet or exceed monthly and quarterly revenue and close-rate targets',
    'Build and maintain long-term relationships with customers and referral partners',
    'Coordinate with installation teams to ensure smooth handoffs and project starts',
  ],
  'HVAC Service Manager': [
    'Oversee daily service department operations including dispatch and technician scheduling',
    'Manage, develop, and performance-review a team of service technicians',
    'Monitor KPIs including revenue per call, completion rates, and customer satisfaction',
    'Resolve escalated customer complaints and ensure a satisfactory outcome',
    'Coordinate with the parts and warehouse teams to maintain adequate inventory levels',
    'Develop and implement service processes to improve efficiency and quality',
    'Collaborate with ownership on departmental budgets, hiring, and growth strategy',
  ],
  'Apprentice': [
    'Assist experienced technicians with HVAC installations, maintenance, and repairs',
    'Learn to identify, use, and care for HVAC tools, equipment, and materials',
    'Help with loading, unloading, and organizing equipment and parts on job sites',
    'Observe and strictly follow safety procedures and company policies at all times',
    'Complete required apprenticeship coursework, exams, and on-the-job training hours',
    'Keep service vehicles, work areas, and job sites clean and organized',
    'Build foundational knowledge of HVAC systems, refrigeration, and electrical codes',
  ],
};

const DEFAULT_RESPONSIBILITIES = [
  'Perform core job duties as assigned by management',
  'Maintain safety and quality standards on all work',
  'Communicate effectively with team members and customers',
  'Complete required documentation and reporting accurately',
  'Support overall team goals and company objectives',
  'Participate in training and professional development',
  'Adhere to all company policies and procedures',
];

const getResponsibilityOptions = (title: string): string[] => {
  const presets = RESPONSIBILITIES_BY_TITLE[title] ?? DEFAULT_RESPONSIBILITIES;
  return [...presets, 'Other (type your own)'];
};

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

function parseJsonField<T>(val: string | T[] | undefined, fallback: T[]): T[] {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val as string); return Array.isArray(p) ? p : fallback; } catch {
    // Recover corrupted data saved as raw JS array .toString() (e.g. "EPA 608,NATE")
    const str = (val as string).trim();
    if (str) return str.split(',').map(s => s.trim()).filter(Boolean) as unknown as T[];
    return fallback;
  }
}

const AddJobForm: React.FC<AddJobFormProps> = ({ onClose, onJobCreated, editJob }) => {
  const isEditMode = !!editJob;
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [respIsOther, setRespIsOther] = useState<boolean[]>([false, false, false]);
  const [error, setError] = useState('');

  // Escape key to close & focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [formData, setFormData] = useState({
    title: editJob?.title || '',
    company_name: editJob?.company_name || '',
    job_location_type: editJob?.job_location_type || 'on-site',
    city: editJob?.city || '',
    zip_code: editJob?.zip_code || '',
    job_type: editJob?.job_type || 'full_time',
    pay_range_min: editJob?.pay_range_min != null ? String(editJob.pay_range_min) : '',
    pay_range_max: editJob?.pay_range_max != null ? String(editJob.pay_range_max) : '',
    pay_type: editJob?.pay_type || 'hourly',
    expected_hours: '',
    work_schedule: '',
    benefits: parseJsonField<string>(editJob?.benefits, []),
    key_responsibilities: (() => {
      const r = parseJsonField<string>(editJob?.key_responsibilities, ['', '', '']);
      while (r.length < 3) r.push('');
      return r;
    })(),
    qualifications_years: editJob?.required_years_experience != null ? String(editJob.required_years_experience) : '',
    qualifications_certifications: parseJsonField<string>(editJob?.qualifications_certifications, []),
    education_requirements: editJob?.education_requirements || 'no_degree',
    other_relevant_titles: parseJsonField<string>(editJob?.other_relevant_titles, []),
    flexible_on_title: editJob?.flexible_on_title !== undefined ? editJob.flexible_on_title : true,
    drivers_license_required: editJob?.drivers_license_required || false,
    advancement_opportunities: editJob?.advancement_opportunities || false,
    advancement_timeline: editJob?.advancement_timeline || '',
    company_culture: editJob?.company_culture || '',
    description: editJob?.description || '',
    valid_through: editJob?.valid_through ? editJob.valid_through.split('T')[0] : '',
  });

  const [newCertification, setNewCertification] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'title') {
        setFormData(prev => ({ ...prev, title: value, key_responsibilities: ['', '', ''] }));
        setRespIsOther([false, false, false]);
        setTitleSuggestions([]);
        if (value) {
          setLoadingSuggestions(true);
          fetch(`${config.apiUrl}/api/jobs/suggest-titles?title=${encodeURIComponent(value)}`, {
            headers: getAuthHeaders()
          })
            .then(r => r.json())
            .then(res => { if (res.status === 'success') setTitleSuggestions(res.data.suggestions); })
            .catch(() => {})
            .finally(() => setLoadingSuggestions(false));
        }
      }
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

  const handleResponsibilitySelect = (index: number, value: string) => {
    const isOther = value === 'Other (type your own)';
    const newIsOther = [...respIsOther];
    newIsOther[index] = isOther;
    setRespIsOther(newIsOther);
    const newResponsibilities = [...formData.key_responsibilities];
    newResponsibilities[index] = isOther ? '' : value;
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

  const handleRegenerate = async () => {
    if (!editJob?.id) return;
    setIsRegenerating(true);
    setError('');
    try {
      const response = await fetch(`${config.apiUrl}/api/jobs/${editJob.id}/regenerate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...formData,
          required_years_experience: parseFloat(formData.qualifications_years) || 0,
        }),
      });
      if (!response.ok) {
        setError('Failed to regenerate description. Please try again.');
        return;
      }
      const data = await response.json();
      if (data.status === 'success') {
        setFormData(prev => ({ ...prev, description: data.description }));
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a job title');
      return;
    }

    if (!isEditMode && (!formData.key_responsibilities[0] || !formData.key_responsibilities[1] || !formData.key_responsibilities[2])) {
      setError('Please select all 3 key job responsibilities');
      return;
    }

    setIsSubmitting(true);

    try {
      // PUT expects JSON strings (backend passes through as-is); POST backend stringifies raw arrays itself
      const arrayFields = isEditMode ? {
        benefits: JSON.stringify(formData.benefits || []),
        key_responsibilities: JSON.stringify(formData.key_responsibilities || []),
        qualifications_certifications: JSON.stringify(formData.qualifications_certifications || []),
        other_relevant_titles: JSON.stringify(formData.other_relevant_titles || []),
      } : {};
      const payload = {
        ...formData,
        ...arrayFields,
        location: `${formData.city}, ${formData.zip_code}`,
        required_years_experience: parseFloat(formData.qualifications_years) || 0,
        pay_range_min: parseFloat(formData.pay_range_min) || null,
        pay_range_max: parseFloat(formData.pay_range_max) || null,
        position_type: formData.title,
        vehicle_required: false,
        flexible_on_title: formData.flexible_on_title,
        drivers_license_required: formData.drivers_license_required,
        education_requirements: formData.education_requirements === 'no_degree'
          ? 'High School Diploma'
          : formData.education_requirements,
        valid_through: formData.valid_through || null,
      };

      const url = isEditMode
        ? `${config.apiUrl}/api/jobs/${editJob!.id}`
        : `${config.apiUrl}/api/jobs`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
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
          : `Failed to ${isEditMode ? 'save' : 'create'} job. Please check your information.`));
        return;
      }

      const data = await response.json();

      if (data.status === 'success') {
        onJobCreated();
        onClose();
      } else {
        setError(data.message || `Failed to ${isEditMode ? 'save' : 'create'} job`);
      }
    } catch (err) {
      console.error('Error saving job:', err);
      setError(`Failed to ${isEditMode ? 'save' : 'create'} job. Please check your connection and try again.`);
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
            <LoadingText>{isEditMode ? 'Saving changes...' : 'Creating job and generating AI description...'}</LoadingText>
          </LoadingOverlay>
        )}

        <CloseButton aria-label="Close" onClick={onClose}>&times;</CloseButton>

        <FormHeader>
          <FormTitle id="add-job-form-title">{isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}</FormTitle>
          <FormSubtitle>{isEditMode ? 'Update the job details below' : 'Fill out the details below and AI will generate a compelling job description'}</FormSubtitle>
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
                <Select
                  value={respIsOther[index] ? 'Other (type your own)' : (resp || '')}
                  onChange={(e) => handleResponsibilitySelect(index, e.target.value)}
                >
                  <option value="">-- Select a responsibility --</option>
                  {getResponsibilityOptions(formData.title).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
                {respIsOther[index] && (
                  <Input
                    type="text"
                    value={resp}
                    onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                    placeholder="Describe the responsibility..."
                    style={{ marginTop: '0.5rem' }}
                    autoFocus
                  />
                )}
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
                {SENIOR_ROLES.has(formData.title) && formData.qualifications_years === '0' && (
                  <ExperienceWarning>
                    ⚠️ <strong>Heads up:</strong> With 0 years required, Talos scores candidates on how polished their resume looks — not their actual skills or leadership experience. For a <strong>{formData.title}</strong>, we recommend requiring at least 3 years so the right candidates rise to the top.
                  </ExperienceWarning>
                )}
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
                    <RemoveButton type="button" onClick={() => removeCertification(index)}>Remove</RemoveButton>
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
                  <AddButton type="button" onClick={addCertification}>Add</AddButton>
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
              <CheckboxLabel style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="flexible_on_title"
                  checked={formData.flexible_on_title}
                  onChange={handleChange}
                  style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#4ade80', cursor: 'pointer' }}
                />
                <span>
                  <strong style={{ color: '#e0e0e0' }}>Flexible on role title</strong>
                  <span style={{ display: 'block', color: '#999', fontSize: '0.85rem', marginTop: '2px' }}>
                    If checked, candidates from equivalent roles with transferable skills will qualify under the required experience tier. If unchecked, those candidates score 9 points lower.
                  </span>
                </span>
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="drivers_license_required"
                  checked={formData.drivers_license_required}
                  onChange={handleChange}
                  style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#4ade80', cursor: 'pointer' }}
                />
                <span>
                  <strong style={{ color: '#e0e0e0' }}>Driver's license required</strong>
                  <span style={{ display: 'block', color: '#999', fontSize: '0.85rem', marginTop: '2px' }}>
                    If checked, "Valid driver's license with a clean driving record" will be guaranteed in the Qualifications section.
                  </span>
                </span>
              </CheckboxLabel>
            </FormGroup>

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
                  <AddButton type="button" onClick={addTitle}>Add</AddButton>
                </ArrayItemRow>
              </ArrayInputContainer>
              {(loadingSuggestions || titleSuggestions.length > 0) && (
                <SuggestionsWrap>
                  <SuggestionsLabel>
                    {loadingSuggestions ? 'Fetching suggestions…' : 'Suggested titles — click to add:'}
                  </SuggestionsLabel>
                  {!loadingSuggestions && (
                    <ChipsRow>
                      {titleSuggestions
                        .filter(s => !formData.other_relevant_titles.includes(s))
                        .map(suggestion => (
                          <SuggestionChip
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                other_relevant_titles: [...prev.other_relevant_titles, suggestion]
                              }));
                            }}
                          >
                            + {suggestion}
                          </SuggestionChip>
                        ))}
                    </ChipsRow>
                  )}
                </SuggestionsWrap>
              )}
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

            <FormGroup>
              <Label>
                Listing Expires On (Optional)
                <TooltipIcon>
                  ?
                  <Tooltip>Google for Jobs deprioritizes listings without an expiration date. Leave blank to use the default (90 days from today).</Tooltip>
                </TooltipIcon>
              </Label>
              <Input
                type="date"
                name="valid_through"
                value={formData.valid_through}
                onChange={handleChange}
              />
            </FormGroup>
          </FormSection>

          {isEditMode && (
            <FormSection>
              <SectionTitle>Job Description</SectionTitle>
              <FormGroup>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Label style={{ margin: 0 }}>Full Job Description</Label>
                  <RegenerateButton
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? 'Regenerating...' : '↺ Regenerate with AI'}
                  </RegenerateButton>
                </div>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Full job description..."
                  style={{ minHeight: '300px' }}
                />
              </FormGroup>
            </FormSection>
          )}

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (isEditMode ? 'Saving...' : 'Creating Job...')
              : (isEditMode ? 'Save Changes' : 'Create Job with AI Description')}
          </SubmitButton>
        </form>
      </FormCard>
    </FormContainer>
  );
};

export default AddJobForm;
