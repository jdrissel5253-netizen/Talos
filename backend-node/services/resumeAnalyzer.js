const Anthropic = require('@anthropic-ai/sdk');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

// Initialize Anthropic client
if (!process.env.ANTHROPIC_API_KEY) {
   console.error('CRITICAL ERROR: ANTHROPIC_API_KEY is missing from environment variables');
}

const anthropic = new Anthropic({
   apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Extract text from PDF resume
 */
async function extractTextFromPDF(filePath) {
   const dataBuffer = await fs.readFile(filePath);
   const data = await pdfParse(dataBuffer);
   return data.text;
}

/**
 * Get position-specific evaluation criteria
 */
function getPositionCriteria(position) {
   const criteria = {
      'HVAC Technician': {
         title: 'HVAC Technician',
         keySkills: [
            '- EPA 608 Universal Certification',
            '- NATE Certification',
            '- HVAC Installation & Maintenance',
            '- Refrigeration Systems',
            '- Air Conditioning Systems',
            '- Heating Systems (Gas, Electric, Oil)',
            '- Ductwork Installation',
            '- Troubleshooting & Diagnostics',
            '- HVAC Controls & Thermostats',
            '- Residential and/or Commercial Experience',
            '- Load Calculations',
            '- Blueprint Reading',
            '- Safety Protocols (OSHA)',
            '- Customer Service Skills',
            '- Hand and Power Tool Proficiency'
         ],
         experienceGuidelines: 'Look for 2-5 years of hands-on HVAC experience. Experience with both installation and service/repair is valuable.',
         additionalNotes: 'Focus on technical competence, problem-solving abilities, and customer interaction skills. Safety consciousness is critical.'
      },
      'Lead HVAC Technician': {
         title: 'Lead HVAC Technician',
         keySkills: [
            '- EPA 608 Universal Certification (Required)',
            '- NATE Certification (Preferred)',
            '- Advanced HVAC Systems Knowledge',
            '- Team Leadership & Supervision Experience',
            '- Project Management Skills',
            '- Quality Control & Inspection',
            '- Training & Mentoring Abilities',
            '- Complex Troubleshooting & Diagnostics',
            '- Commercial HVAC Experience',
            '- Blueprint Reading & System Design',
            '- Code Compliance (Local, State, Federal)',
            '- Budget Management',
            '- Vendor Relations',
            '- Advanced Safety Management',
            '- Client Communication & Relationship Building'
         ],
         experienceGuidelines: 'Look for 5+ years of HVAC experience with demonstrated leadership capabilities. Prior supervisory or lead technician experience is highly valued.',
         additionalNotes: 'Prioritize leadership qualities, project management experience, and ability to handle complex commercial systems. Look for evidence of training others, managing teams, and coordinating work schedules.'
      },
      'HVAC Dispatcher': {
         title: 'HVAC Dispatcher',
         keySkills: [
            '- Dispatch Software Proficiency (ServiceTitan, FieldEdge, etc.)',
            '- HVAC Industry Knowledge',
            '- Customer Service Excellence',
            '- Multi-line Phone System Experience',
            '- Scheduling & Route Optimization',
            '- Priority Assessment & Triage',
            '- CRM Software Experience',
            '- Communication Skills (written & verbal)',
            '- Problem-solving & Conflict Resolution',
            '- Time Management & Organization',
            '- Basic Understanding of HVAC Equipment',
            '- Emergency Call Handling',
            '- Data Entry & Record Keeping',
            '- Team Coordination',
            '- Microsoft Office Suite (Excel, Outlook)'
         ],
         experienceGuidelines: 'Look for 1-3 years of dispatch, customer service, or administrative experience. HVAC industry experience is a plus but not required if they have strong dispatch/coordination background.',
         additionalNotes: 'Focus on organizational skills, communication abilities, multitasking capacity, and customer service orientation. Look for experience with scheduling software and handling high-volume communications.'
      },
      'Administrative Assistant': {
         title: 'Administrative Assistant',
         keySkills: [
            '- Microsoft Office Suite (Word, Excel, PowerPoint, Outlook)',
            '- Google Workspace (Docs, Sheets, Gmail, Calendar)',
            '- Calendar Management & Scheduling',
            '- Filing & Organization (digital and physical)',
            '- Data Entry & Record Keeping',
            '- Phone & Email Communication',
            '- Customer Service Skills',
            '- Document Preparation & Formatting',
            '- CRM or Database Experience',
            '- Multi-tasking & Prioritization',
            '- Attention to Detail',
            '- Time Management',
            '- Professional Communication (written & verbal)',
            '- Office Supply Management',
            '- Meeting Coordination'
         ],
         experienceGuidelines: 'Look for 1-3 years of administrative, office support, or customer service experience. Direct admin assistant experience is valuable, but equivalent roles (receptionist, office coordinator, executive assistant) with transferable skills are also strong candidates.',
         additionalNotes: 'Focus on organizational abilities, attention to detail, communication skills, and proficiency with office software. Look for candidates who can multitask effectively in busy office environments and support multiple team members.'
      },
      'Customer Service Representative': {
         title: 'Customer Service Representative',
         keySkills: [
            '- Customer Interaction & Communication',
            '- Call Center or Phone System Experience',
            '- Problem Solving & Issue Resolution',
            '- Conflict De-escalation',
            '- CRM Systems (Salesforce, Zendesk, HubSpot, ServiceNow)',
            '- Active Listening & Empathy',
            '- Multi-tasking in High-Volume Environment',
            '- Ticketing Systems & Documentation',
            '- Professional Written & Verbal Communication',
            '- Handling Customer Complaints',
            '- Product/Service Knowledge',
            '- Data Entry & Record Keeping',
            '- Time Management & Organization',
            '- Positive Attitude & Patience',
            '- Adaptability & Flexibility'
         ],
         experienceGuidelines: 'Look for 2+ years of customer-facing experience. Direct CSR experience is valuable, but equivalent roles (call center rep, retail associate, hospitality staff, front desk, receptionist) with strong customer interaction skills are also strong candidates.',
         additionalNotes: 'Focus on communication abilities, problem-solving skills, empathy, and ability to handle high-volume customer interactions. Look for candidates who can remain professional under pressure, de-escalate conflicts, and maintain a positive customer experience.'
      },
      'HVAC Installer': {
         title: 'HVAC Installer',
         keySkills: [
            '- HVAC System Installation',
            '- Ductwork Installation & Fabrication',
            '- EPA 608 Certification (Preferred)',
            '- Refrigerant Line Installation',
            '- Electrical Wiring & Connections',
            '- Blueprint Reading',
            '- Hand & Power Tool Proficiency',
            '- Residential & Commercial Installation',
            '- System Start-up & Testing',
            '- Safety Protocols (OSHA)',
            '- Physical Stamina & Strength',
            '- Team Collaboration',
            '- Time Management',
            '- Quality Workmanship',
            '- Customer Service Skills'
         ],
         experienceGuidelines: 'Look for 1-3 years of HVAC installation experience. Entry-level candidates with apprenticeship experience or strong mechanical aptitude are also considered.',
         additionalNotes: 'Focus on installation expertise, ability to work in various environments (attics, crawl spaces), physical capability, and attention to detail in system installation. Safety consciousness is critical.'
      },
      'Lead HVAC Installer': {
         title: 'Lead HVAC Installer',
         keySkills: [
            '- Advanced HVAC Installation Expertise',
            '- EPA 608 Universal Certification (Required)',
            '- Team Leadership & Crew Supervision',
            '- Job Site Management',
            '- Blueprint Reading & System Design',
            '- Load Calculations',
            '- Quality Control & Inspection',
            '- Training & Mentoring',
            '- Material & Equipment Coordination',
            '- Code Compliance (Local, State, Federal)',
            '- Project Scheduling',
            '- Customer Communication',
            '- Problem-solving on Complex Installations',
            '- Safety Management',
            '- Multi-system Installation (Residential & Commercial)'
         ],
         experienceGuidelines: 'Look for 4+ years of HVAC installation experience with demonstrated leadership capabilities. Prior lead or supervisory experience is highly valued.',
         additionalNotes: 'Prioritize leadership qualities, project coordination skills, and ability to manage installation crews. Look for evidence of training others, managing job sites, and ensuring quality installations on schedule.'
      },
      'Maintenance Technician': {
         title: 'Maintenance Technician',
         keySkills: [
            '- Preventive Maintenance Programs',
            '- HVAC Systems Maintenance',
            '- Electrical Systems & Troubleshooting',
            '- Plumbing Systems Knowledge',
            '- Building Systems (HVAC, Electrical, Plumbing)',
            '- Mechanical Repairs',
            '- Hand & Power Tool Proficiency',
            '- Equipment Inspection & Testing',
            '- Work Order Management Systems',
            '- Safety Protocols & OSHA Compliance',
            '- Basic Welding & Fabrication (Preferred)',
            '- Facility Management Software',
            '- Problem-solving & Diagnostics',
            '- Record Keeping & Documentation',
            '- Customer Service Skills'
         ],
         experienceGuidelines: 'Look for 2-4 years of maintenance experience in commercial or industrial settings. Multi-skilled candidates with broad mechanical, electrical, and HVAC knowledge are ideal.',
         additionalNotes: 'Focus on versatility, preventive maintenance experience, troubleshooting abilities, and ability to work independently. Look for candidates who can handle multiple building systems and respond to urgent maintenance needs.'
      },
      'Warehouse Associate': {
         title: 'Warehouse Associate',
         keySkills: [
            '- Inventory Management',
            '- Forklift Operation (Certification Preferred)',
            '- Warehouse Management Systems (WMS)',
            '- Picking, Packing & Shipping',
            '- Receiving & Inspection',
            '- Barcode Scanning & RF Devices',
            '- Material Handling Equipment',
            '- Physical Stamina & Lifting (50+ lbs)',
            '- Safety Protocols & OSHA Compliance',
            '- Organization & Attention to Detail',
            '- Basic Computer Skills',
            '- Team Collaboration',
            '- Time Management',
            '- Quality Control',
            '- Order Fulfillment'
         ],
         experienceGuidelines: 'Look for 1-2 years of warehouse, logistics, or inventory experience. Forklift certification and WMS experience are strong advantages.',
         additionalNotes: 'Focus on reliability, physical capability, attention to detail, and safety consciousness. Look for candidates who can work efficiently in fast-paced warehouse environments and maintain accurate inventory records.'
      },
      'Bookkeeper': {
         title: 'Bookkeeper',
         keySkills: [
            '- Accounting Software (QuickBooks, Xero, Sage)',
            '- Accounts Payable & Receivable',
            '- General Ledger Maintenance',
            '- Bank Reconciliation',
            '- Financial Record Keeping',
            '- Payroll Processing',
            '- Invoice Processing',
            '- Expense Tracking & Reporting',
            '- Microsoft Excel (Advanced)',
            '- Tax Preparation Support',
            '- Financial Reporting',
            '- Attention to Detail & Accuracy',
            '- Confidentiality & Ethics',
            '- Time Management',
            '- Communication Skills'
         ],
         experienceGuidelines: 'Look for 2-4 years of bookkeeping or accounting experience. QuickBooks proficiency is highly valued. Accounting degree or certification (Certified Bookkeeper) is a plus.',
         additionalNotes: 'Focus on accuracy, attention to detail, accounting software proficiency, and ability to maintain confidential financial records. Look for candidates who can work independently and manage multiple accounting tasks efficiently.'
      },
      'HVAC Sales Representative': {
         title: 'HVAC Sales Representative',
         keySkills: [
            '- Sales Experience (B2B or B2C)',
            '- HVAC Systems Knowledge',
            '- Lead Generation & Prospecting',
            '- Customer Needs Assessment',
            '- Solution Selling & Consultation',
            '- CRM Systems (Salesforce, HubSpot)',
            '- Proposal & Quote Preparation',
            '- Contract Negotiation',
            '- Product Knowledge (Equipment, Systems)',
            '- Communication & Presentation Skills',
            '- Relationship Building',
            '- Territory Management',
            '- Sales Target Achievement',
            '- Technical Product Training',
            '- Customer Service Orientation'
         ],
         experienceGuidelines: 'Look for 2-5 years of sales experience, preferably in HVAC, construction, or technical products. Track record of meeting or exceeding sales targets is essential.',
         additionalNotes: 'Focus on sales achievements, technical aptitude, relationship-building skills, and ability to explain complex HVAC solutions to customers. Look for candidates who can balance technical knowledge with strong sales capabilities.'
      },
      'HVAC Service Manager': {
         title: 'HVAC Service Manager',
         keySkills: [
            '- HVAC Technical Expertise',
            '- Team Leadership & Management',
            '- Service Department Operations',
            '- Scheduling & Dispatch Management',
            '- Budget & P&L Management',
            '- Customer Relationship Management',
            '- Quality Assurance & Control',
            '- Performance Management & KPIs',
            '- Service Software (ServiceTitan, FieldEdge)',
            '- EPA 608 Certification (Preferred)',
            '- Hiring, Training & Development',
            '- Contract Management',
            '- Code Compliance & Safety Management',
            '- Problem Resolution & Conflict Management',
            '- Strategic Planning & Process Improvement'
         ],
         experienceGuidelines: 'Look for 5+ years of HVAC experience with 2+ years in supervisory or management roles. Strong service department management background is essential.',
         additionalNotes: 'Prioritize leadership experience, operational management skills, and ability to drive service department profitability. Look for candidates who can manage technician teams, ensure customer satisfaction, and optimize service operations.'
      },
      'Apprentice': {
         title: 'Apprentice',
         keySkills: [
            '- Eagerness to Learn & Develop Skills',
            '- Basic Mechanical Aptitude',
            '- Hand & Power Tool Familiarity',
            '- Physical Stamina & Ability to Lift',
            '- Following Directions & Instructions',
            '- Safety Awareness & Protocols',
            '- Reliable & Punctual',
            '- Team Collaboration',
            '- Problem-solving Interest',
            '- Basic Math Skills',
            '- Valid Driver\'s License (Preferred)',
            '- Technical/Trade School Education (Preferred)',
            '- OSHA 10 Certification (Preferred)',
            '- Willingness to Work in Various Conditions',
            '- Professional Attitude & Work Ethic'
         ],
         experienceGuidelines: 'Look for candidates with 0-1 years of experience. Previous trade experience, technical school training, or related apprenticeships are valuable. Focus on potential, attitude, and willingness to learn rather than extensive experience.',
         additionalNotes: 'Focus on trainability, work ethic, mechanical aptitude, and genuine interest in learning the HVAC trade. Look for candidates with strong foundational skills, positive attitude, and commitment to professional development. Prior exposure to construction, mechanical work, or hands-on technical fields is a plus.'
      }
   };

   return criteria[position] || criteria['HVAC Technician'];
}

/**
 * Generate unified scoring rubric (Service Technician format) for any position
 * @param {boolean} includeCerts - Whether certifications should be a factor (false for office positions)
 */
function generateUnifiedScoringRubric(requiredYears, includeCerts = true) {
   const certsLabel = includeCerts ? 'certifications' : 'relevant skills/software';
   const certsListed = includeCerts ? 'Certs Listed' : 'Skills Listed';
   const certsNotListed = includeCerts ? 'NO Certs Listed' : 'NO Skills Listed';

   return `
=== DETAILED SCORING MATRIX ===

REQUIRED EXPERIENCE TIER (Has ${requiredYears}+ years of required experience):

Good Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 90-100
  - No gap + Not hoppy + 30-50mi: 75-84
  - No gap + Not hoppy + >50mi: 55-64
  - No gap + Job hoppy + <30mi: 75-79
  - No gap + Job hoppy + 30-50mi: 60-64
  - No gap + Job hoppy + >50mi: 45-49
  - Small gap + Not hoppy + <30mi: 85-89
  - Small gap + Not hoppy + 30-50mi: 70-74
  - Small gap + Not hoppy + >50mi: 50-54
  - Small gap + Job hoppy + <30mi: 70-74
  - Small gap + Job hoppy + 30-50mi: 55-59
  - Small gap + Job hoppy + >50mi: 40-44
  - Large gap + Not hoppy + <30mi: 75-79
  - Large gap + Not hoppy + 30-50mi: 60-64
  - Large gap + Not hoppy + >50mi: 45-49
  - Large gap + Job hoppy + <30mi: 60-64
  - Large gap + Job hoppy + 30-50mi: 45-49
  - Large gap + Job hoppy + >50mi: 30-34

Good Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 85-89
  - No gap + Not hoppy + 30-50mi: 70-74
  - No gap + Not hoppy + >50mi: 50-54
  - No gap + Job hoppy + <30mi: 70-74
  - No gap + Job hoppy + 30-50mi: 55-59
  - No gap + Job hoppy + >50mi: 40-44
  - Small gap + Not hoppy + <30mi: 80-84
  - Small gap + Not hoppy + 30-50mi: 65-69
  - Small gap + Not hoppy + >50mi: 45-49
  - Small gap + Job hoppy + <30mi: 65-69
  - Small gap + Job hoppy + 30-50mi: 50-54
  - Small gap + Job hoppy + >50mi: 35-39
  - Large gap + Not hoppy + <30mi: 70-74
  - Large gap + Not hoppy + 30-50mi: 55-59
  - Large gap + Not hoppy + >50mi: 40-44
  - Large gap + Job hoppy + <30mi: 55-59
  - Large gap + Job hoppy + 30-50mi: 40-44
  - Large gap + Job hoppy + >50mi: 25-29

Mid Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 80-84
  - No gap + Not hoppy + 30-50mi: 65-69
  - No gap + Not hoppy + >50mi: 50-54
  - No gap + Job hoppy + <30mi: 65-69
  - No gap + Job hoppy + 30-50mi: 50-54
  - No gap + Job hoppy + >50mi: 40-44
  - Small gap + Not hoppy + <30mi: 75-79
  - Small gap + Not hoppy + 30-50mi: 60-64
  - Small gap + Not hoppy + >50mi: 45-49
  - Small gap + Job hoppy + <30mi: 60-64
  - Small gap + Job hoppy + 30-50mi: 45-49
  - Small gap + Job hoppy + >50mi: 35-39
  - Large gap + Not hoppy + <30mi: 65-69
  - Large gap + Not hoppy + 30-50mi: 50-54
  - Large gap + Not hoppy + >50mi: 40-44
  - Large gap + Job hoppy + <30mi: 50-54
  - Large gap + Job hoppy + 30-50mi: 40-44
  - Large gap + Job hoppy + >50mi: 30-34

Mid Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 75-79
  - No gap + Not hoppy + 30-50mi: 60-64
  - No gap + Not hoppy + >50mi: 45-49
  - No gap + Job hoppy + <30mi: 60-64
  - No gap + Job hoppy + 30-50mi: 45-49
  - No gap + Job hoppy + >50mi: 35-39
  - Small gap + Not hoppy + <30mi: 70-74
  - Small gap + Not hoppy + 30-50mi: 55-59
  - Small gap + Not hoppy + >50mi: 40-44
  - Small gap + Job hoppy + <30mi: 55-59
  - Small gap + Job hoppy + 30-50mi: 40-44
  - Small gap + Job hoppy + >50mi: 30-34
  - Large gap + Not hoppy + <30mi: 60-64
  - Large gap + Not hoppy + 30-50mi: 45-49
  - Large gap + Not hoppy + >50mi: 35-39
  - Large gap + Job hoppy + <30mi: 45-49
  - Large gap + Job hoppy + 30-50mi: 35-39
  - Large gap + Job hoppy + >50mi: 25-29

Poor Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 75-79
  - No gap + Not hoppy + 30-50mi: 60-64
  - No gap + Not hoppy + >50mi: 45-49
  - No gap + Job hoppy + <30mi: 60-64
  - No gap + Job hoppy + 30-50mi: 45-49
  - No gap + Job hoppy + >50mi: 35-39
  - Small gap + Not hoppy + <30mi: 70-74
  - Small gap + Not hoppy + 30-50mi: 55-59
  - Small gap + Not hoppy + >50mi: 40-44
  - Small gap + Job hoppy + <30mi: 55-59
  - Small gap + Job hoppy + 30-50mi: 40-44
  - Small gap + Job hoppy + >50mi: 30-34
  - Large gap + Not hoppy + <30mi: 60-64
  - Large gap + Not hoppy + 30-50mi: 45-49
  - Large gap + Not hoppy + >50mi: 35-39
  - Large gap + Job hoppy + <30mi: 45-49
  - Large gap + Job hoppy + 30-50mi: 35-39
  - Large gap + Job hoppy + >50mi: 25-29

Poor Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 70-74
  - No gap + Not hoppy + 30-50mi: 55-59
  - No gap + Not hoppy + >50mi: 40-44
  - No gap + Job hoppy + <30mi: 55-59
  - No gap + Job hoppy + 30-50mi: 40-44
  - No gap + Job hoppy + >50mi: 30-34
  - Small gap + Not hoppy + <30mi: 65-69
  - Small gap + Not hoppy + 30-50mi: 50-54
  - Small gap + Not hoppy + >50mi: 35-39
  - Small gap + Job hoppy + <30mi: 50-54
  - Small gap + Job hoppy + 30-50mi: 35-39
  - Small gap + Job hoppy + >50mi: 25-29
  - Large gap + Not hoppy + <30mi: 55-59
  - Large gap + Not hoppy + 30-50mi: 40-44
  - Large gap + Not hoppy + >50mi: 30-34
  - Large gap + Job hoppy + <30mi: 40-44
  - Large gap + Job hoppy + 30-50mi: 30-34
  - Large gap + Job hoppy + >50mi: 20-24

CLOSE TO REQUIRED EXPERIENCE (${requiredYears * 0.5} to ${requiredYears * 0.95} years - 50-95% of required):

Good Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 80-84
  - No gap + Not hoppy + 30-50mi: 65-69
  - No gap + Not hoppy + >50mi: 50-54
  - No gap + Job hoppy + <30mi: 65-69
  - No gap + Job hoppy + 30-50mi: 50-54
  - No gap + Job hoppy + >50mi: 40-44
  - Small gap + Not hoppy + <30mi: 75-79
  - Small gap + Not hoppy + 30-50mi: 60-64
  - Small gap + Not hoppy + >50mi: 45-49
  - Small gap + Job hoppy + <30mi: 60-64
  - Small gap + Job hoppy + 30-50mi: 45-49
  - Small gap + Job hoppy + >50mi: 35-39
  - Large gap + Not hoppy + <30mi: 65-69
  - Large gap + Not hoppy + 30-50mi: 50-54
  - Large gap + Not hoppy + >50mi: 40-44
  - Large gap + Job hoppy + <30mi: 50-54
  - Large gap + Job hoppy + 30-50mi: 40-44
  - Large gap + Job hoppy + >50mi: 30-34

Good Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 75-79
  - No gap + Not hoppy + 30-50mi: 60-64
  - No gap + Not hoppy + >50mi: 45-49
  - No gap + Job hoppy + <30mi: 60-64
  - No gap + Job hoppy + 30-50mi: 45-49
  - No gap + Job hoppy + >50mi: 35-39
  - Small gap + Not hoppy + <30mi: 70-74
  - Small gap + Not hoppy + 30-50mi: 55-59
  - Small gap + Not hoppy + >50mi: 40-44
  - Small gap + Job hoppy + <30mi: 55-59
  - Small gap + Job hoppy + 30-50mi: 40-44
  - Small gap + Job hoppy + >50mi: 30-34
  - Large gap + Not hoppy + <30mi: 60-64
  - Large gap + Not hoppy + 30-50mi: 45-49
  - Large gap + Not hoppy + >50mi: 35-39
  - Large gap + Job hoppy + <30mi: 45-49
  - Large gap + Job hoppy + 30-50mi: 35-39
  - Large gap + Job hoppy + >50mi: 25-29

Mid Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 70-74
  - No gap + Not hoppy + 30-50mi: 55-59
  - No gap + Not hoppy + >50mi: 45-49
  - No gap + Job hoppy + <30mi: 55-59
  - No gap + Job hoppy + 30-50mi: 45-49
  - No gap + Job hoppy + >50mi: 35-39
  - Small gap + Not hoppy + <30mi: 65-69
  - Small gap + Not hoppy + 30-50mi: 50-54
  - Small gap + Not hoppy + >50mi: 40-44
  - Small gap + Job hoppy + <30mi: 50-54
  - Small gap + Job hoppy + 30-50mi: 40-44
  - Small gap + Job hoppy + >50mi: 30-34
  - Large gap + Not hoppy + <30mi: 55-59
  - Large gap + Not hoppy + 30-50mi: 45-49
  - Large gap + Not hoppy + >50mi: 35-39
  - Large gap + Job hoppy + <30mi: 45-49
  - Large gap + Job hoppy + 30-50mi: 35-39
  - Large gap + Job hoppy + >50mi: 25-29

Mid Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 65-69
  - No gap + Not hoppy + 30-50mi: 50-54
  - No gap + Not hoppy + >50mi: 40-44
  - No gap + Job hoppy + <30mi: 50-54
  - No gap + Job hoppy + 30-50mi: 40-44
  - No gap + Job hoppy + >50mi: 30-34
  - Small gap + Not hoppy + <30mi: 60-64
  - Small gap + Not hoppy + 30-50mi: 45-49
  - Small gap + Not hoppy + >50mi: 35-39
  - Small gap + Job hoppy + <30mi: 45-49
  - Small gap + Job hoppy + 30-50mi: 35-39
  - Small gap + Job hoppy + >50mi: 25-29
  - Large gap + Not hoppy + <30mi: 50-54
  - Large gap + Not hoppy + 30-50mi: 40-44
  - Large gap + Not hoppy + >50mi: 30-34
  - Large gap + Job hoppy + <30mi: 40-44
  - Large gap + Job hoppy + 30-50mi: 30-34
  - Large gap + Job hoppy + >50mi: 20-24

Poor Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 65-69
  - No gap + Not hoppy + 30-50mi: 50-54
  - No gap + Not hoppy + >50mi: 40-44
  - No gap + Job hoppy + <30mi: 50-54
  - No gap + Job hoppy + 30-50mi: 40-44
  - No gap + Job hoppy + >50mi: 30-34
  - Small gap + Not hoppy + <30mi: 60-64
  - Small gap + Not hoppy + 30-50mi: 45-49
  - Small gap + Not hoppy + >50mi: 35-39
  - Small gap + Job hoppy + <30mi: 45-49
  - Small gap + Job hoppy + 30-50mi: 35-39
  - Small gap + Job hoppy + >50mi: 25-29
  - Large gap + Not hoppy + <30mi: 50-54
  - Large gap + Not hoppy + 30-50mi: 40-44
  - Large gap + Not hoppy + >50mi: 30-34
  - Large gap + Job hoppy + <30mi: 40-44
  - Large gap + Job hoppy + 30-50mi: 30-34
  - Large gap + Job hoppy + >50mi: 20-24

Poor Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 60-64
  - No gap + Not hoppy + 30-50mi: 45-49
  - No gap + Not hoppy + >50mi: 35-39
  - No gap + Job hoppy + <30mi: 45-49
  - No gap + Job hoppy + 30-50mi: 35-39
  - No gap + Job hoppy + >50mi: 25-29
  - Small gap + Not hoppy + <30mi: 55-59
  - Small gap + Not hoppy + 30-50mi: 40-44
  - Small gap + Not hoppy + >50mi: 30-34
  - Small gap + Job hoppy + <30mi: 40-44
  - Small gap + Job hoppy + 30-50mi: 30-34
  - Small gap + Job hoppy + >50mi: 20-24
  - Large gap + Not hoppy + <30mi: 45-49
  - Large gap + Not hoppy + 30-50mi: 35-39
  - Large gap + Not hoppy + >50mi: 25-29
  - Large gap + Job hoppy + <30mi: 35-39
  - Large gap + Job hoppy + 30-50mi: 25-29
  - Large gap + Job hoppy + >50mi: 15-19

NOT CLOSE TO REQUIRED EXPERIENCE (under ${requiredYears * 0.5} years - <50% of required):

Good Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 50-54
  - No gap + Not hoppy + 30-50mi: 40-44
  - No gap + Not hoppy + >50mi: 30-34
  - No gap + Job hoppy + <30mi: 40-44
  - No gap + Job hoppy + 30-50mi: 30-34
  - No gap + Job hoppy + >50mi: 25-29
  - Small gap + Not hoppy + <30mi: 45-49
  - Small gap + Not hoppy + 30-50mi: 35-39
  - Small gap + Not hoppy + >50mi: 25-29
  - Small gap + Job hoppy + <30mi: 35-39
  - Small gap + Job hoppy + 30-50mi: 25-29
  - Small gap + Job hoppy + >50mi: 20-24
  - Large gap + Not hoppy + <30mi: 40-44
  - Large gap + Not hoppy + 30-50mi: 30-34
  - Large gap + Not hoppy + >50mi: 25-29
  - Large gap + Job hoppy + <30mi: 30-34
  - Large gap + Job hoppy + 30-50mi: 25-29
  - Large gap + Job hoppy + >50mi: 15-19

Good Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 45-49
  - No gap + Not hoppy + 30-50mi: 35-39
  - No gap + Not hoppy + >50mi: 25-29
  - No gap + Job hoppy + <30mi: 35-39
  - No gap + Job hoppy + 30-50mi: 25-29
  - No gap + Job hoppy + >50mi: 20-24
  - Small gap + Not hoppy + <30mi: 40-44
  - Small gap + Not hoppy + 30-50mi: 30-34
  - Small gap + Not hoppy + >50mi: 20-24
  - Small gap + Job hoppy + <30mi: 30-34
  - Small gap + Job hoppy + 30-50mi: 20-24
  - Small gap + Job hoppy + >50mi: 15-19
  - Large gap + Not hoppy + <30mi: 35-39
  - Large gap + Not hoppy + 30-50mi: 25-29
  - Large gap + Not hoppy + >50mi: 20-24
  - Large gap + Job hoppy + <30mi: 25-29
  - Large gap + Job hoppy + 30-50mi: 20-24
  - Large gap + Job hoppy + >50mi: 10-14

Mid Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 40-44
  - No gap + Not hoppy + 30-50mi: 30-34
  - No gap + Not hoppy + >50mi: 25-29
  - No gap + Job hoppy + <30mi: 30-34
  - No gap + Job hoppy + 30-50mi: 25-29
  - No gap + Job hoppy + >50mi: 20-24
  - Small gap + Not hoppy + <30mi: 35-39
  - Small gap + Not hoppy + 30-50mi: 25-29
  - Small gap + Not hoppy + >50mi: 20-24
  - Small gap + Job hoppy + <30mi: 25-29
  - Small gap + Job hoppy + 30-50mi: 20-24
  - Small gap + Job hoppy + >50mi: 15-19
  - Large gap + Not hoppy + <30mi: 30-34
  - Large gap + Not hoppy + 30-50mi: 25-29
  - Large gap + Not hoppy + >50mi: 20-24
  - Large gap + Job hoppy + <30mi: 25-29
  - Large gap + Job hoppy + 30-50mi: 20-24
  - Large gap + Job hoppy + >50mi: 10-14

Mid Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 35-39
  - No gap + Not hoppy + 30-50mi: 25-29
  - No gap + Not hoppy + >50mi: 20-24
  - No gap + Job hoppy + <30mi: 25-29
  - No gap + Job hoppy + 30-50mi: 20-24
  - No gap + Job hoppy + >50mi: 15-19
  - Small gap + Not hoppy + <30mi: 30-34
  - Small gap + Not hoppy + 30-50mi: 20-24
  - Small gap + Not hoppy + >50mi: 15-19
  - Small gap + Job hoppy + <30mi: 20-24
  - Small gap + Job hoppy + 30-50mi: 15-19
  - Small gap + Job hoppy + >50mi: 10-14
  - Large gap + Not hoppy + <30mi: 25-29
  - Large gap + Not hoppy + 30-50mi: 20-24
  - Large gap + Not hoppy + >50mi: 15-19
  - Large gap + Job hoppy + <30mi: 20-24
  - Large gap + Job hoppy + 30-50mi: 15-19
  - Large gap + Job hoppy + >50mi: 5-9

Poor Resume + ${certsListed}:
  - No gap + Not hoppy + <30mi: 35-39
  - No gap + Not hoppy + 30-50mi: 25-29
  - No gap + Not hoppy + >50mi: 20-24
  - No gap + Job hoppy + <30mi: 25-29
  - No gap + Job hoppy + 30-50mi: 20-24
  - No gap + Job hoppy + >50mi: 15-19
  - Small gap + Not hoppy + <30mi: 30-34
  - Small gap + Not hoppy + 30-50mi: 20-24
  - Small gap + Not hoppy + >50mi: 15-19
  - Small gap + Job hoppy + <30mi: 20-24
  - Small gap + Job hoppy + 30-50mi: 15-19
  - Small gap + Job hoppy + >50mi: 10-14
  - Large gap + Not hoppy + <30mi: 25-29
  - Large gap + Not hoppy + 30-50mi: 20-24
  - Large gap + Not hoppy + >50mi: 15-19
  - Large gap + Job hoppy + <30mi: 20-24
  - Large gap + Job hoppy + 30-50mi: 15-19
  - Large gap + Job hoppy + >50mi: 5-9

Poor Resume + ${certsNotListed}:
  - No gap + Not hoppy + <30mi: 30-34
  - No gap + Not hoppy + 30-50mi: 20-24
  - No gap + Not hoppy + >50mi: 15-19
  - No gap + Job hoppy + <30mi: 20-24
  - No gap + Job hoppy + 30-50mi: 15-19
  - No gap + Job hoppy + >50mi: 10-14
  - Small gap + Not hoppy + <30mi: 25-29
  - Small gap + Not hoppy + 30-50mi: 15-19
  - Small gap + Not hoppy + >50mi: 10-14
  - Small gap + Job hoppy + <30mi: 15-19
  - Small gap + Job hoppy + 30-50mi: 10-14
  - Small gap + Job hoppy + >50mi: 5-9
  - Large gap + Not hoppy + <30mi: 20-24
  - Large gap + Not hoppy + 30-50mi: 15-19
  - Large gap + Not hoppy + >50mi: 10-14
  - Large gap + Job hoppy + <30mi: 15-19
  - Large gap + Job hoppy + 30-50mi: 10-14
  - Large gap + Job hoppy + >50mi: 1-4

===================================================================================================
END OF RUBRIC
===================================================================================================
`;
}

/**
 * Get HVAC Dispatcher tiered evaluation criteria
 */
function getDispatcherCriteria(requiredYears, flexibleOnTitle = true) {
   const flexibilityPenalty = flexibleOnTitle ? 0 : 9;

   return {
      framework: `
HVAC DISPATCHER RESUME EVALUATION FRAMEWORK
Job Requirement: ${requiredYears} years of Dispatcher or equivalent experience
Flexibility on Role Title: ${flexibleOnTitle ? 'YES - Accept equivalent roles with transferable skills' : 'NO - Strict title matching, equivalent roles score lower'}

=== CRITICAL EVALUATION RULES ===

EXPERIENCE CATEGORIES:
- REQUIRED EXPERIENCE: Candidate has ${requiredYears}+ years as Dispatcher OR equivalent role
- CLOSE TO REQUIRED: Candidate has ${requiredYears * 0.5} to ${requiredYears * 0.95} years (50-95% of required)
- NOT CLOSE TO REQUIRED: Candidate has less than ${requiredYears * 0.5} years (<50% of required)

=== TRANSFERABLE SKILLS EVALUATION ===

Evaluate the candidate's experience against these FOUR skill categories:

A. SCHEDULING & COORDINATION
   - Dispatching technicians or field workers
   - Coordinating appointments or service calls
   - Managing calendars, schedules, or workflow
   - Route optimization or technician assignment

B. CUSTOMER INTERACTION
   - Handling incoming calls (high volume)
   - Managing customer complaints or escalations
   - Front-facing customer service
   - Phone etiquette and professional communication

C. HIGH-VOLUME, FAST-PACED ENVIRONMENT
   - Call center experience
   - Busy office environments with multitasking
   - Retail environments requiring quick decisions
   - Emergency or urgent request handling

D. ADMINISTRATIVE / OFFICE COMPETENCY
   - Data entry and record keeping
   - CRM or dispatch software usage (ServiceTitan, FieldEdge, etc.)
   - Filing and documentation
   - Billing support or invoicing

IMPORTANT: A candidate does NOT need all four categories to qualify. Having strong experience in 2-3 categories can still result in a high score.

=== EQUIVALENT JOB TITLES ===

STRONG EQUIVALENTS (Count as direct dispatcher experience):
- Service Coordinator
- Scheduler
- Office Administrator
- Administrative Assistant
- Office Assistant
- Customer Service Representative (with scheduling duties)
- Receptionist (with scheduling duties)
- Call Center Representative

CONDITIONAL EQUIVALENTS (Require skill confirmation in resume):
- Retail Sales Associate (if shows scheduling/coordination)
- Inside Sales (if shows customer management)
- Front Desk Associate (if shows appointment booking)
- Hospitality roles - hotel front desk (if shows reservation/coordination)

${flexibleOnTitle ?
            `FLEXIBILITY MODE: ON
- Strong Equivalents count as FULL dispatcher experience
- Conditional Equivalents count as FULL experience IF resume demonstrates relevant skills
- Focus on transferable skills, not just job titles` :
            `FLEXIBILITY MODE: OFF
- Strong Equivalents count as "Close to Required" experience (apply -${flexibilityPenalty} point penalty)
- Conditional Equivalents count as "Not Close to Required"
- Candidates without exact "Dispatcher" title will score lower`}

=== RESUME QUALITY DEFINITIONS ===

- GOOD RESUME: Proper formatting, no typos, proper punctuation/grammar, at least 2 substantive bullets per experience demonstrating dispatcher-relevant skills
- MID RESUME: Professional formatting with few grammatical errors, but missing key elements like bullets under experiences, or has limited bullets, or has small formatting issues
- POOR RESUME: Multiple punctuation errors + multiple typos, numerous formatting issues, AND lacks substantive content

=== KEY SKILLS TO LOOK FOR ===

Technical/Software Skills:
- Dispatch software (ServiceTitan, FieldEdge, Housecall Pro, etc.)
- CRM systems
- Multi-line phone systems
- Microsoft Office (especially Excel, Outlook)
- Scheduling software

Soft Skills:
- Multitasking ability
- Communication (written and verbal)
- Problem-solving under pressure
- Organization and time management
- Conflict resolution
- Team coordination

Industry Knowledge (bonus, not required):
- HVAC terminology
- Understanding of service call types
- Knowledge of technician skillsets
- Geographic/route awareness

=== WORK GAPS ===

- NO WORK GAP: Under 6 months of unemployment
- SMALL WORK GAP: 6 months to 1 year of unemployment
- LARGE WORK GAP: Over 1 year of unemployment
- IMPORTANT: Overlapping jobs = POSITIVE, not a gap
- Career transitions INTO dispatching should NOT be penalized

=== JOB STABILITY ===

- NOT JOB HOPPY: Stable employment (2+ years per employer)
- JOB HOPPY: Multiple jobs under 1.5 years each
- NOTE: Dispatcher roles require familiarity with company operations, service areas, and technician teams - stability is critical

=== LOCATION/DISTANCE ===

- WITHIN 30 MILES: Minimal impact
- 30-50 MILES: Moderate negative impact
- OVER 50 MILES: Major negative impact

${generateUnifiedScoringRubric(requiredYears, false)}

=== FLEXIBILITY PENALTY APPLICATION ===

${flexibleOnTitle ?
            `NO PENALTY APPLIED - Equivalent roles score the same as direct dispatcher experience.` :
            `PENALTY APPLIES: If candidate has equivalent role experience (not exact "Dispatcher" title):
- After calculating score from rubric, SUBTRACT ${flexibilityPenalty} points
- Example: Score of 79 becomes 70
- This moves strong equivalent candidates down in the rankings
- Minimum score after penalty is 1`}

=== EVALUATION INSTRUCTIONS ===

1. IDENTIFY ALL RELEVANT EXPERIENCE:
   - Count direct dispatcher experience first
   - Then count Strong Equivalent roles (Service Coordinator, Scheduler, Administrative Assistant, etc.)
   - For Conditional Equivalents, verify transferable skills are demonstrated in resume
   - Calculate TOTAL relevant experience

2. EVALUATE THE 4 SKILL CATEGORIES:
   - Score each category (A, B, C, D) based on resume evidence
   - Note which categories are strong/weak
   - A candidate with 3 strong categories is still excellent

3. ASSESS RESUME QUALITY:
   - Good/Mid/Poor based on formatting, bullets, grammar
   - Look for specific dispatcher-relevant accomplishments

4. CHECK WORK HISTORY:
   - Calculate any gaps
   - Assess job stability

5. APPLY THE RUBRIC:
   - Find matching combination in scoring matrix
   - Assign score within range

6. ${flexibleOnTitle ? 'No penalty needed' : `APPLY -${flexibilityPenalty} POINT PENALTY if candidate's experience is from equivalent roles, not exact dispatcher title`}

7. CRITICAL: Experience is THE MOST IMPORTANT factor, followed by demonstrated transferable skills.
`,
      scoring: {
         greenTier: { min: 80, max: 100 },
         yellowTier: { min: 50, max: 79 },
         redTier: { min: 0, max: 49 }
      },
      flexibilityPenalty: flexibilityPenalty
   };
}

/**
 * Generate Service Technician-specific scoring matrix with updated ranges
 */
function generateServiceTechnicianScoringMatrix(requiredYears) {
   return `
=== DETAILED SCORING MATRIX FOR HVAC SERVICE TECHNICIAN ===

REQUIRED EXPERIENCE TIER (Has ${requiredYears}+ years of Service Technician experience):

Good Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 90-100
  - No gap + Not hoppy + 30-50mi: 70-79
  - No gap + Not hoppy + >50mi: 50-60
  - No gap + Job hoppy + <30mi: 70-79
  - No gap + Job hoppy + 30-50mi: 50-60
  - No gap + Job hoppy + >50mi: 40-49
  - Small gap + Not hoppy + <30mi: 85-89
  - Small gap + Not hoppy + 30-50mi: 70-79
  - Small gap + Not hoppy + >50mi: 50-59
  - Small gap + Job hoppy + <30mi: 60-69
  - Small gap + Job hoppy + 30-50mi: 50-59
  - Small gap + Job hoppy + >50mi: 40-50
  - Large gap + Not hoppy + <30mi: 70-79
  - Large gap + Not hoppy + 30-50mi: 60-69
  - Large gap + Not hoppy + >50mi: 40-50
  - Large gap + Job hoppy + <30mi: 50-59
  - Large gap + Job hoppy + 30-50mi: 40-49
  - Large gap + Job hoppy + >50mi: 20-29

Good Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 85-90
  - No gap + Not hoppy + 30-50mi: 70-79
  - No gap + Not hoppy + >50mi: 50-59
  - No gap + Job hoppy + <30mi: 70-74
  - No gap + Job hoppy + 30-50mi: 60-69
  - No gap + Job hoppy + >50mi: 40-49
  - Small gap + Not hoppy + <30mi: 70-79
  - Small gap + Not hoppy + 30-50mi: 60-69
  - Small gap + Not hoppy + >50mi: 50-59
  - Small gap + Job hoppy + <30mi: 60-69
  - Small gap + Job hoppy + 30-50mi: 50-59
  - Small gap + Job hoppy + >50mi: 30-39
  - Large gap + Not hoppy + <30mi: 60-69
  - Large gap + Not hoppy + 30-50mi: 50-55
  - Large gap + Not hoppy + >50mi: 30-39
  - Large gap + Job hoppy + <30mi: 50-59
  - Large gap + Job hoppy + 30-50mi: 40-49
  - Large gap + Job hoppy + >50mi: 30-39

Mid Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 80-89
  - No gap + Not hoppy + 30-50mi: 70-79
  - No gap + Not hoppy + >50mi: 60-69
  - No gap + Job hoppy + <30mi: 60-69
  - No gap + Job hoppy + 30-50mi: 50-59
  - No gap + Job hoppy + >50mi: 40-49
  - Small gap + Not hoppy + <30mi: 70-79
  - Small gap + Not hoppy + 30-50mi: 60-69
  - Small gap + Not hoppy + >50mi: 40-49
  - Small gap + Job hoppy + <30mi: 60-69
  - Small gap + Job hoppy + 30-50mi: 40-49
  - Small gap + Job hoppy + >50mi: 30-39
  - Large gap + Not hoppy + <30mi: 70-74
  - Large gap + Not hoppy + 30-50mi: 60-69
  - Large gap + Not hoppy + >50mi: 40-49
  - Large gap + Job hoppy + <30mi: 50-59
  - Large gap + Job hoppy + 30-50mi: 40-49
  - Large gap + Job hoppy + >50mi: 30-39

Mid Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 80-81
  - No gap + Not hoppy + 30-50mi: 70-74
  - No gap + Not hoppy + >50mi: 50-59
  - No gap + Job hoppy + <30mi: 65-69
  - No gap + Job hoppy + 30-50mi: 55-59
  - No gap + Job hoppy + >50mi: 40-44
  - Small gap + Not hoppy + <30mi: 75-79
  - Small gap + Not hoppy + 30-50mi: 65-69
  - Small gap + Not hoppy + >50mi: 40-49
  - Small gap + Job hoppy + <30mi: 60-69
  - Small gap + Job hoppy + 30-50mi: 50-55
  - Small gap + Job hoppy + >50mi: 40-49
  - Large gap + Not hoppy + <30mi: 70-74
  - Large gap + Not hoppy + 30-50mi: 60-69
  - Large gap + Not hoppy + >50mi: 40-49
  - Large gap + Job hoppy + <30mi: 50-59
  - Large gap + Job hoppy + 30-50mi: 40-49
  - Large gap + Job hoppy + >50mi: 20-39

Poor Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 80-82
  - No gap + Not hoppy + 30-50mi: 70-74
  - No gap + Not hoppy + >50mi: 60-69
  - No gap + Job hoppy + <30mi: 60-69
  - No gap + Job hoppy + 30-50mi: 50-59
  - No gap + Job hoppy + >50mi: 40-49
  - Small gap + Not hoppy + <30mi: 70-75
  - Small gap + Not hoppy + 30-50mi: 60-69
  - Small gap + Not hoppy + >50mi: 41-50
  - Small gap + Job hoppy + <30mi: 55-60
  - Small gap + Job hoppy + 30-50mi: 45-49
  - Small gap + Job hoppy + >50mi: 30-39
  - Large gap + Not hoppy + <30mi: 60-69
  - Large gap + Not hoppy + 30-50mi: 50-55
  - Large gap + Not hoppy + >50mi: 30-39
  - Large gap + Job hoppy + <30mi: 50-55
  - Large gap + Job hoppy + 30-50mi: 40-45
  - Large gap + Job hoppy + >50mi: 20-39

Poor Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 75-79
  - No gap + Not hoppy + 30-50mi: 65-69
  - No gap + Not hoppy + >50mi: 40-49
  - No gap + Job hoppy + <30mi: 60-65
  - No gap + Job hoppy + 30-50mi: 50-55
  - No gap + Job hoppy + >50mi: 30-49
  - Small gap + Not hoppy + <30mi: 70-75
  - Small gap + Not hoppy + 30-50mi: 60-65
  - Small gap + Not hoppy + >50mi: 40-49
  - Small gap + Job hoppy + <30mi: 51-60
  - Small gap + Job hoppy + 30-50mi: 40-49
  - Small gap + Job hoppy + >50mi: 20-39
  - Large gap + Not hoppy + <30mi: 60-69
  - Large gap + Not hoppy + 30-50mi: 50-59
  - Large gap + Not hoppy + >50mi: 30-49
  - Large gap + Job hoppy + <30mi: 50-52
  - Large gap + Job hoppy + 30-50mi: 30-49
  - Large gap + Job hoppy + >50mi: 20-29

CLOSE TO REQUIRED EXPERIENCE (${requiredYears * 0.5} to ${requiredYears * 0.95} years - 50-95% of required):

Good Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 85-90
  - No gap + Not hoppy + 30-50mi: 70-79
  - No gap + Not hoppy + >50mi: 50-59
  - No gap + Job hoppy + <30mi: 70-74
  - No gap + Job hoppy + 30-50mi: 55-59
  - No gap + Job hoppy + >50mi: 40-49
  - Small gap + Not hoppy + <30mi: 80-84
  - Small gap + Not hoppy + 30-50mi: 60-69
  - Small gap + Not hoppy + >50mi: 40-49
  - Small gap + Job hoppy + <30mi: 60-69
  - Small gap + Job hoppy + 30-50mi: 50-55
  - Small gap + Job hoppy + >50mi: 30-49
  - Large gap + Not hoppy + <30mi: 70-79
  - Large gap + Not hoppy + 30-50mi: 60-65
  - Large gap + Not hoppy + >50mi: 40-49
  - Large gap + Job hoppy + <30mi: 55-59
  - Large gap + Job hoppy + 30-50mi: 40-49
  - Large gap + Job hoppy + >50mi: 20-29

Good Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 80-81
  - No gap + Not hoppy + 30-50mi: 60-75
  - No gap + Not hoppy + >50mi: 40-49
  - No gap + Job hoppy + <30mi: 65-69
  - No gap + Job hoppy + 30-50mi: 50-59
  - No gap + Job hoppy + >50mi: 40-49
  - Small gap + Not hoppy + <30mi: 74-79
  - Small gap + Not hoppy + 30-50mi: 60-65
  - Small gap + Not hoppy + >50mi: 45-50
  - Small gap + Job hoppy + <30mi: 60-64
  - Small gap + Job hoppy + 30-50mi: 50-54
  - Small gap + Job hoppy + >50mi: 30-49
  - Large gap + Not hoppy + <30mi: 70-75
  - Large gap + Not hoppy + 30-50mi: 60-64
  - Large gap + Not hoppy + >50mi: 40-49
  - Large gap + Job hoppy + <30mi: 50-55
  - Large gap + Job hoppy + 30-50mi: 40-49
  - Large gap + Job hoppy + >50mi: 20-39

Mid Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 70-79
  - No gap + Not hoppy + 30-50mi: 60-65
  - No gap + Not hoppy + >50mi: 40-49
  - No gap + Job hoppy + <30mi: 60-69
  - No gap + Job hoppy + 30-50mi: 50-59
  - No gap + Job hoppy + >50mi: 30-49
  - Small gap + Not hoppy + <30mi: 70-74
  - Small gap + Not hoppy + 30-50mi: 55-69
  - Small gap + Not hoppy + >50mi: 30-49
  - Small gap + Job hoppy + <30mi: 50-59
  - Small gap + Job hoppy + 30-50mi: 40-49
  - Small gap + Job hoppy + >50mi: 30-39
  - Large gap + Not hoppy + <30mi: 60-69
  - Large gap + Not hoppy + 30-50mi: 50-59
  - Large gap + Not hoppy + >50mi: 40-49
  - Large gap + Job hoppy + <30mi: 50-55
  - Large gap + Job hoppy + 30-50mi: 30-39
  - Large gap + Job hoppy + >50mi: 20-29

Mid Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 70-74
  - No gap + Not hoppy + 30-50mi: 55-69
  - No gap + Not hoppy + >50mi: 40-49
  - No gap + Job hoppy + <30mi: 60-64
  - No gap + Job hoppy + 30-50mi: 50-54
  - No gap + Job hoppy + >50mi: 40-49
  - Small gap + Not hoppy + <30mi: 70-71
  - Small gap + Not hoppy + 30-50mi: 60-64
  - Small gap + Not hoppy + >50mi: 40-49
  - Small gap + Job hoppy + <30mi: 50-55
  - Small gap + Job hoppy + 30-50mi: 40-49
  - Small gap + Job hoppy + >50mi: 30-39
  - Large gap + Not hoppy + <30mi: 60-64
  - Large gap + Not hoppy + 30-50mi: 50-54
  - Large gap + Not hoppy + >50mi: 30-49
  - Large gap + Job hoppy + <30mi: 40-49
  - Large gap + Job hoppy + 30-50mi: 30-39
  - Large gap + Job hoppy + >50mi: 10-29

Poor Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 70-75
  - No gap + Not hoppy + 30-50mi: 60-65
  - No gap + Not hoppy + >50mi: 40-49
  - No gap + Job hoppy + <30mi: 50-59
  - No gap + Job hoppy + 30-50mi: 40-49
  - No gap + Job hoppy + >50mi: 20-39
  - Small gap + Not hoppy + <30mi: 60-65
  - Small gap + Not hoppy + 30-50mi: 50-59
  - Small gap + Not hoppy + >50mi: 30-49
  - Small gap + Job hoppy + <30mi: 50-55
  - Small gap + Job hoppy + 30-50mi: 41-45
  - Small gap + Job hoppy + >50mi: 30-39
  - Large gap + Not hoppy + <30mi: 55-59
  - Large gap + Not hoppy + 30-50mi: 41-50
  - Large gap + Not hoppy + >50mi: 20-35
  - Large gap + Job hoppy + <30mi: 40-49
  - Large gap + Job hoppy + 30-50mi: 30-39
  - Large gap + Job hoppy + >50mi: 20-29

Poor Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 70-71
  - No gap + Not hoppy + 30-50mi: 55-65
  - No gap + Not hoppy + >50mi: 40-49
  - No gap + Job hoppy + <30mi: 50-59
  - No gap + Job hoppy + 30-50mi: 40-49
  - No gap + Job hoppy + >50mi: 30-39
  - Small gap + Not hoppy + <30mi: 60-65
  - Small gap + Not hoppy + 30-50mi: 50-59
  - Small gap + Not hoppy + >50mi: 40-49
  - Small gap + Job hoppy + <30mi: 40-49
  - Small gap + Job hoppy + 30-50mi: 30-39
  - Small gap + Job hoppy + >50mi: 20-29
  - Large gap + Not hoppy + <30mi: 55-65
  - Large gap + Not hoppy + 30-50mi: 50-54
  - Large gap + Not hoppy + >50mi: 30-49
  - Large gap + Job hoppy + <30mi: 40-49
  - Large gap + Job hoppy + 30-50mi: 30-39
  - Large gap + Job hoppy + >50mi: 20-29

NOT CLOSE TO REQUIRED EXPERIENCE (Under ${requiredYears * 0.5} years - less than 50% of required):

Good Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 50-59
  - No gap + Not hoppy + 30-50mi: 40-49
  - No gap + Not hoppy + >50mi: 20-39
  - No gap + Job hoppy + <30mi: 40-49
  - No gap + Job hoppy + 30-50mi: 30-39
  - No gap + Job hoppy + >50mi: 20-29
  - Small gap + Not hoppy + <30mi: 50-54
  - Small gap + Not hoppy + 30-50mi: 40-49
  - Small gap + Not hoppy + >50mi: 30-39
  - Small gap + Job hoppy + <30mi: 40-49
  - Small gap + Job hoppy + 30-50mi: 30-39
  - Small gap + Job hoppy + >50mi: 20-29
  - Large gap + Not hoppy + <30mi: 50-51
  - Large gap + Not hoppy + 30-50mi: 40-45
  - Large gap + Not hoppy + >50mi: 30-39
  - Large gap + Job hoppy + <30mi: 30-39
  - Large gap + Job hoppy + 30-50mi: 20-29
  - Large gap + Job hoppy + >50mi: 10-19

Good Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 50-54
  - No gap + Not hoppy + 30-50mi: 40-49
  - No gap + Not hoppy + >50mi: 30-39
  - No gap + Job hoppy + <30mi: 40-49
  - No gap + Job hoppy + 30-50mi: 30-39
  - No gap + Job hoppy + >50mi: 20-29
  - Small gap + Not hoppy + <30mi: 50-51
  - Small gap + Not hoppy + 30-50mi: 40-45
  - Small gap + Not hoppy + >50mi: 20-35
  - Small gap + Job hoppy + <30mi: 40-49
  - Small gap + Job hoppy + 30-50mi: 30-39
  - Small gap + Job hoppy + >50mi: 20-29
  - Large gap + Not hoppy + <30mi: 40-49
  - Large gap + Not hoppy + 30-50mi: 30-39
  - Large gap + Not hoppy + >50mi: 20-29
  - Large gap + Job hoppy + <30mi: 30-39
  - Large gap + Job hoppy + 30-50mi: 20-29
  - Large gap + Job hoppy + >50mi: 10-19

Mid Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 40-49
  - No gap + Not hoppy + 30-50mi: 30-39
  - No gap + Not hoppy + >50mi: 20-29
  - No gap + Job hoppy + <30mi: 40-45
  - No gap + Job hoppy + 30-50mi: 30-35
  - No gap + Job hoppy + >50mi: 20-25
  - Small gap + Not hoppy + <30mi: 40-49
  - Small gap + Not hoppy + 30-50mi: 30-39
  - Small gap + Not hoppy + >50mi: 20-29
  - Small gap + Job hoppy + <30mi: 30-49
  - Small gap + Job hoppy + 30-50mi: 30-39
  - Small gap + Job hoppy + >50mi: 20-29
  - Large gap + Not hoppy + <30mi: 40-49
  - Large gap + Not hoppy + 30-50mi: 30-39
  - Large gap + Not hoppy + >50mi: 20-29
  - Large gap + Job hoppy + <30mi: 30-39
  - Large gap + Job hoppy + 30-50mi: 20-29
  - Large gap + Job hoppy + >50mi: 10-19

Mid Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 40-49
  - No gap + Not hoppy + 30-50mi: 30-39
  - No gap + Not hoppy + >50mi: 20-29
  - No gap + Job hoppy + <30mi: 40-45
  - No gap + Job hoppy + 30-50mi: 30-39
  - No gap + Job hoppy + >50mi: 20-29
  - Small gap + Not hoppy + <30mi: 40-49
  - Small gap + Not hoppy + 30-50mi: 30-39
  - Small gap + Not hoppy + >50mi: 20-29
  - Small gap + Job hoppy + <30mi: 30-39
  - Small gap + Job hoppy + 30-50mi: 20-29
  - Small gap + Job hoppy + >50mi: 10-19
  - Large gap + Not hoppy + <30mi: 40-45
  - Large gap + Not hoppy + 30-50mi: 30-39
  - Large gap + Not hoppy + >50mi: 20-29
  - Large gap + Job hoppy + <30mi: 30-39
  - Large gap + Job hoppy + 30-50mi: 20-29
  - Large gap + Job hoppy + >50mi: 10-19

Poor Resume + Certs Listed:
  - No gap + Not hoppy + <30mi: 40-45
  - No gap + Not hoppy + 30-50mi: 30-35
  - No gap + Not hoppy + >50mi: 20-25
  - No gap + Job hoppy + <30mi: 30-39
  - No gap + Job hoppy + 30-50mi: 20-29
  - No gap + Job hoppy + >50mi: 10-19
  - Small gap + Not hoppy + <30mi: 40-45
  - Small gap + Not hoppy + 30-50mi: 30-35
  - Small gap + Not hoppy + >50mi: 20-25
  - Small gap + Job hoppy + <30mi: 20-29
  - Small gap + Job hoppy + 30-50mi: 10-19
  - Small gap + Job hoppy + >50mi: 5-10
  - Large gap + Not hoppy + <30mi: 30-39
  - Large gap + Not hoppy + 30-50mi: 20-29
  - Large gap + Not hoppy + >50mi: 10-19
  - Large gap + Job hoppy + <30mi: 20-25
  - Large gap + Job hoppy + 30-50mi: 10-15
  - Large gap + Job hoppy + >50mi: 5-10

Poor Resume + NO Certs Listed:
  - No gap + Not hoppy + <30mi: 40-45
  - No gap + Not hoppy + 30-50mi: 30-35
  - No gap + Not hoppy + >50mi: 20-25
  - No gap + Job hoppy + <30mi: 20-29
  - No gap + Job hoppy + 30-50mi: 10-19
  - No gap + Job hoppy + >50mi: 5-10
  - Small gap + Not hoppy + <30mi: 30-39
  - Small gap + Not hoppy + 30-50mi: 20-29
  - Small gap + Not hoppy + >50mi: 10-19
  - Small gap + Job hoppy + <30mi: 10-19
  - Small gap + Job hoppy + 30-50mi: 5-9
  - Small gap + Job hoppy + >50mi: 4-6
  - Large gap + Not hoppy + <30mi: 20-29
  - Large gap + Not hoppy + 30-50mi: 10-19
  - Large gap + Not hoppy + >50mi: 5-10
  - Large gap + Job hoppy + <30mi: 10-15
  - Large gap + Job hoppy + 30-50mi: 5-10
  - Large gap + Job hoppy + >50mi: 1-5
`;
}

/**
 * Get HVAC Service Technician tiered evaluation criteria
 */
function getServiceTechnicianCriteria(requiredYears) {
   return {
      framework: `
HVAC SERVICE TECHNICIAN RESUME EVALUATION FRAMEWORK
Job Requirement: ${requiredYears} years of Service Technician experience

This scoring system evaluates candidates even if their title isn't exactly "HVAC Service Technician" by using transferable-skills logic, equivalent roles, and binary requirements.

=== HARD REQUIREMENTS (BINARY FILTERS) ===

If the job post defines hard requirements (ex: EPA Certification, ${requiredYears}+ years experience, ability to work on residential systems), the candidate must satisfy these through:
- Direct HVAC Service Technician experience, OR
- Equivalent HVAC field roles that perform similar service/diagnostic duties (see Equivalent Titles below)

If the candidate does NOT meet binary minimums, they FAIL the hard filter and should score in the RED tier (0-49).

=== CORE COMPETENCY CATEGORIES ===

Score candidates using these FOUR service-focused competency groups.
Strong candidates show 3-4 categories. Mid-level show 2-3. Entry-level/weak show 0-1.

A. HVAC DIAGNOSTICS & PROBLEM SOLVING
Look for:
- Diagnosing common HVAC failures (capacitors, contactors, boards, motors)
- Troubleshooting cooling/heating issues
- Electrical diagnostic skills
- Experience with minisplits, heat pumps, gas furnaces
- Ability to run performance tests
- Basic refrigeration cycle understanding
- Handling service calls independently
This category should trigger even if job title doesn't mention "service"

B. INSTALLATION, REPAIR & MAINTENANCE SKILLS
Evidence of hands-on technical abilities:
- Performing maintenance: cleaning coils, checking pressures, inspecting systems
- Completing component-level repairs
- Changing motors, compressors, or control boards
- Brazing, soldering, line set work
- Performing partial or full installations
- Knowledge of local code and safety standards

C. CUSTOMER INTERACTION & FIELD INDEPENDENCE
Higher scores if candidate shows:
- Experience interacting with customers on-site
- Ability to explain repairs or system issues
- Working independently in the field
- Providing repair recommendations
- Writing accurate service notes or invoices
- Coordinating with dispatch or supervisors
This distinguishes true field-ready techs from shop-based or helper roles

D. RELIABILITY, PROFESSIONALISM & JOB MANAGEMENT
Indicators like:
- Managing daily service routes
- Consistency in completing assigned calls
- On-time arrival and reliable scheduling
- Maintaining service records
- Strong communication and accountability
- Following company procedures

=== EQUIVALENT JOB TITLES ===

STRONG EQUIVALENTS (Automatically count as Service Tech experience):
- HVAC Maintenance Technician
- HVAC Installer (Level II or higher)
- HVAC Technician (generic)
- HVAC Field Technician
- HVAC Repair Technician
- Refrigeration Technician (with HVAC crossover)
- Building Engineer (HVAC-heavy roles)
- Facilities Technician (HVAC-heavy)
- Residential or Light Commercial HVAC Technician
- Apprentice HVAC Technician (only for early-career roles)

MODERATE EQUIVALENTS (Context-dependent - verify competencies):
- Lead Installer (if job allows installation-heavy backgrounds)
- General Maintenance Technician (must show real HVAC experience)
- Handyman roles (only if they explicitly include HVAC systems)
- Property Maintenance Techs (with HVAC servicing duties)

Use semantic reasoning to decide if a role functions like service work even if wording is indirect.

=== EXPERIENCE CATEGORIES ===

- REQUIRED EXPERIENCE: Candidate has ${requiredYears}+ years as Service Technician or Strong Equivalent
- CLOSE TO REQUIRED: Candidate has ${requiredYears * 0.5} to ${requiredYears * 0.95} years (50-95% of required)
- NOT CLOSE TO REQUIRED: Candidate has less than ${requiredYears * 0.5} years (<50% of required)

=== RESUME QUALITY DEFINITIONS ===

- GOOD RESUME: Proper formatting, no typos, proper punctuation/grammar, at least 2 substantive bullets per experience
- MID RESUME: Professional formatting with few grammatical errors, but missing key elements like bullets under experiences, or has limited bullets, or has small formatting issues
- POOR RESUME: Multiple punctuation errors + multiple typos, numerous formatting issues, AND lacks substantive content

=== CERTIFICATIONS ===

- Look for EPA 608, NATE, state licenses, etc.
- Having certifications listed ALWAYS scores higher than not having them listed
- For very experienced candidates, missing certifications won't kill their score UNLESS they also have a bad resume

=== WORK GAPS ===

- NO WORK GAP: Under 6 months of unemployment (continuous employment OR overlapping jobs OR gaps less than 6 months)
- SMALL WORK GAP: 6 months to 1 year of unemployment with no job listed
- LARGE WORK GAP: Over 1 year of unemployment with no job listed
- IMPORTANT: Overlapping jobs (multiple jobs at once) is NOT a work gap - it's POSITIVE
- Career transitions FROM other industries INTO HVAC should NOT be penalized
- Work gaps are a LESSER factor compared to job hoppiness, experience, and resume quality

=== JOB HOPPINESS ===

- JOB HOPPY: Frequent job changes (significant negative factor - really hurts score)
- NOT JOB HOPPY: Stable employment history

=== LOCATION/DISTANCE ===

- WITHIN 30 MILES: Minimal impact on score
- 30-50 MILES: Moderate negative impact
- OVER 50 MILES: Major negative impact (most will fall into red tier)
- Be flexible around boundaries (32 miles vs 30 miles shouldn't be drastically different)

${generateServiceTechnicianScoringMatrix(requiredYears)}

=== EVALUATION INSTRUCTIONS ===

1. First check HARD REQUIREMENTS - if candidate fails binary filters, score in RED tier

2. Evaluate against the 4 CORE COMPETENCY CATEGORIES:
   - Strong candidates (3-4 categories): Higher end of score range
   - Mid-level candidates (2-3 categories): Middle of score range
   - Weak candidates (0-1 categories): Lower end of score range

3. Count experience across ALL equivalent titles (not just exact "Service Technician" matches)

4. Carefully analyze the resume to determine:
   - Years of Service Technician/equivalent experience (count years carefully)
   - Resume quality (good/mid/poor)
   - Certifications present (any HVAC certs count)
   - Work gaps (ONLY count periods with NO employment)
   - Job stability (not hoppy vs job hoppy)
   - Location if mentioned

5. Find the matching combination in the scoring matrix

6. Assign a score within the specified range based on:
   - Competency category strength (3-4 = high end, 2-3 = middle, 0-1 = low end)
   - Overall impression of candidate quality
   - Use the FULL range provided

7. CRITICAL: Experience is THE MOST IMPORTANT factor. Competency categories help differentiate within score ranges.
`,
      scoring: {
         greenTier: { min: 80, max: 100 },
         yellowTier: { min: 50, max: 79 },
         redTier: { min: 0, max: 49 }
      }
   };
}

/**
 * Get Apprentice tiered evaluation criteria
 */
function getApprenticeCriteria(requiredYears, flexibleOnTitle = true) {
   const flexibilityPenalty = flexibleOnTitle ? 0 : 9;

   return {
      framework: `
HVAC APPRENTICE RESUME EVALUATION FRAMEWORK
Job Requirement: ${requiredYears} years of Apprentice or equivalent experience (typically 0-1 years)
Flexibility on Role Title: ${flexibleOnTitle ? 'YES - Accept equivalent roles with transferable skills' : 'NO - Strict title matching, equivalent roles score lower'}

=== CRITICAL EVALUATION RULES ===

THIS IS THE MOST ENTRY-LEVEL POSITION - Many candidates in "Give Them a Chance" tier
- Certifications WITHOUT prior experience should NOT be heavily penalized
- Resume presentation matters significantly alongside experience
- Focus on POTENTIAL and TRAINABILITY over extensive experience
- This position should have the HIGHEST percentage of "Give Them a Chance" candidates

=== HARD REQUIREMENTS (BINARY FILTERS) ===

If the job post lists these as REQUIRED, candidates MUST meet them:
1. Minimum years of experience in trade or technical field (if specified)
2. Physical requirements: ability to lift (typically 50+ lbs), work in various conditions
3. Technical requirements: basic tool use, safety awareness
4. Certifications or licenses ONLY if explicitly required (not just "preferred")

IMPORTANT: Experience should be counted across ALL qualifying roles, not just "Apprentice" title

=== EXPERIENCE CATEGORIES ===

DIRECT APPRENTICE EXPERIENCE:
- ${requiredYears}+ years as Trade Apprentice (HVAC, Electrical, Plumbing, Mechanical, etc.)
- ${requiredYears}+ years as Trainee Technician
- ${requiredYears}+ years as Junior Technician
- ${requiredYears}+ years as Helper/Installer Assistant
- ${requiredYears}+ years as Entry-Level Technician

FUNCTIONALLY EQUIVALENT EXPERIENCE:
- General Laborer with hands-on trade exposure
- Construction Helper/Laborer with relevant skills
- Manufacturing or Assembly Line Worker with technical skills
- Service Technician Helper
- Intern in technical/mechanical fields

=== CORE COMPETENCY EVALUATION ===

Evaluate against these FOUR competency categories. Strong candidates show evidence in 1-2 categories (NOT all 4):

A. LEARNING & TECHNICAL DEVELOPMENT (Strong/Moderate/Weak)
   - Hands-on training in trade or technical skills
   - Following instructions from supervisors or mentors
   - Operating basic tools or equipment
   - Applying safety procedures
   - Technical school training or apprenticeship programs

B. PHYSICAL & MANUAL SKILLS (Strong/Moderate/Weak)
   - Lifting, carrying, or moving materials (50+ lbs)
   - Assisting with installations, repairs, or assembly
   - Performing repetitive or detailed manual tasks
   - Working in various environmental conditions
   - Physical stamina and endurance

C. RELIABILITY & WORK ETHIC (Strong/Moderate/Weak)
   - Consistent attendance and punctuality
   - Willingness to learn and follow instructions
   - Ability to work independently or as part of a team
   - Professional attitude and demeanor
   - Positive references or recommendations

D. ADAPTABILITY & PROGRESSION (Strong/Moderate/Weak)
   - Taking on new tasks quickly
   - Learning new tools or procedures
   - Progressing under mentorship or structured training
   - Moving from helper to more independent roles
   - Demonstrated growth in responsibilities

SCORING: Candidates with Strong evidence in 1-2 categories should score well, even without all 4.

=== EQUIVALENT JOB TITLES ===

STRONG EQUIVALENTS (Automatically count as relevant apprentice experience):
- Trade Apprentice (HVAC, Electrical, Plumbing, Mechanical, Construction, etc.)
- Trainee Technician (any trade)
- Junior Technician
- Helper / Installer Assistant
- Entry-Level Technician
- HVAC Helper
- Field Service Assistant

CONDITIONAL EQUIVALENTS (Count IF resume shows 1-2 core competencies):
- General Laborer (if shows hands-on trade exposure)
- Construction Helper / Laborer
- Manufacturing Worker / Assembly Line Worker
- Warehouse Associate (if shows equipment operation, physical work)
- Service Technician Helper
- Maintenance Helper
- Technical Intern

${flexibleOnTitle ?
            `FLEXIBILITY MODE: ON
- Strong Equivalents count as FULL apprentice experience
- Conditional Equivalents count as FULL experience IF resume demonstrates 1-2 core competencies
- Focus on transferable skills and potential, not just job titles` :
            `FLEXIBILITY MODE: OFF
- Strong Equivalents count as "Close to Required" experience (apply -${flexibilityPenalty} point penalty)
- Conditional Equivalents drop to lower end of "Close to Required" with -${flexibilityPenalty} point penalty
- Example: A candidate scoring 79 would drop to 70 with flexibility OFF`}

=== CERTIFICATION-FRIENDLY SCORING ===

For this entry-level position, certifications are HIGHLY VALUED:
- OSHA 10 or OSHA 30
- EPA 608 (Universal, Type I, II, or III)
- Trade school diploma or certificate
- Technical certifications (electrical, mechanical, etc.)
- First Aid/CPR
- Forklift certification
- Any relevant safety or trade certifications

IMPORTANT: Candidates with certifications but limited experience should score in "Give Them a Chance" tier
- NO prior experience + Certifications = 60-75 range (Yellow tier, high chance)
- Some experience + Certifications = 75-85 range (Green tier)

=== RESUME QUALITY DEFINITIONS ===

- GOOD RESUME: Proper formatting, no typos, proper punctuation/grammar, clear job descriptions with 2+ bullets per experience
- MID RESUME: Professional formatting with few errors, may lack detailed bullets or have minor formatting issues
- POOR RESUME: Multiple typos/grammar errors, poor formatting, lacks substantive content

=== WORK GAPS ===

- NO WORK GAP: Under 6 months of unemployment
- SMALL WORK GAP: 6 months to 1 year of unemployment
- LARGE WORK GAP: Over 1 year of unemployment
- IMPORTANT: Recent graduates or those transitioning into trades should NOT be heavily penalized for gaps
- Overlapping jobs = POSITIVE (shows strong work ethic)

=== JOB STABILITY ===

- NOT JOB HOPPY: Stable employment (1+ years per job) or limited job history (entry-level)
- JOB HOPPY: Multiple jobs under 6 months each
- NOTE: Entry-level workers may have shorter tenures - be lenient

=== LOCATION/DISTANCE ===

- WITHIN 30 MILES: Minimal impact
- 30-50 MILES: Moderate negative impact
- OVER 50 MILES: Major negative impact

${generateUnifiedScoringRubric(requiredYears, false)}

`,
      scoring: {
         greenTier: { min: 80, max: 100 },
         yellowTier: { min: 50, max: 79 },
         redTier: { min: 0, max: 49 }
      }
   };
}

/**
 * Get Bookkeeper tiered evaluation criteria
 */
function getBookkeeperCriteria(requiredYears, flexibleOnTitle = true) {
   const flexibilityPenalty = flexibleOnTitle ? 0 : 9;

   return {
      framework: `
BOOKKEEPER RESUME EVALUATION FRAMEWORK
Job Requirement: ${requiredYears} years of Bookkeeper or equivalent experience
Flexibility on Role Title: ${flexibleOnTitle ? 'YES - Accept equivalent roles with transferable skills' : 'NO - Strict title matching, equivalent roles score lower'}

=== CRITICAL EVALUATION RULES ===

THIS IS A RIGID EVALUATION - EXPERIENCE REIGNS SUPREME
- Accounting/Bookkeeping/Financial experience is REQUIRED
- For entry-level: Accounting degree can substitute for minimal experience
- Focus on ACCURACY, SOFTWARE PROFICIENCY, and PROVEN EXPERIENCE
- This position requires demonstrated competency with financial records

=== HARD REQUIREMENTS (BINARY FILTERS) ===

If the job post lists these as REQUIRED, candidates MUST meet them:
1. Minimum years of bookkeeping or relevant accounting experience (across all qualifying roles)
2. Familiarity with accounting software (QuickBooks, Xero, Sage, etc.)
3. Basic accounting knowledge: journal entries, AP/AR, reconciliations
4. Certifications ONLY if explicitly required (CPA, Certified Bookkeeper)

IMPORTANT: Count experience across ALL qualifying roles, not just "Bookkeeper" title

=== EXPERIENCE CATEGORIES ===

DIRECT BOOKKEEPING EXPERIENCE:
- ${requiredYears}+ years as Bookkeeper
- ${requiredYears}+ years as Bookkeeping Clerk
- ${requiredYears}+ years as Accounting Clerk
- ${requiredYears}+ years as Accounts Payable/Receivable Clerk
- ${requiredYears}+ years as Financial Clerk

STRONG EQUIVALENT EXPERIENCE:
- Staff Accountant (entry-level)
- Payroll Clerk with full-cycle payroll experience
- Finance Assistant with bookkeeping duties
- Junior Accountant
- Accounting Specialist

CONDITIONAL EQUIVALENTS (Require verification of core competencies):
- Administrative roles with significant bookkeeping responsibilities
- Office Manager with financial duties
- Accounting graduate (for entry-level positions only)

=== CORE COMPETENCY EVALUATION ===

Evaluate against these FOUR competency categories. Strong candidates must show evidence in 2+ categories:

A. FINANCIAL RECORDKEEPING (Strong/Moderate/Weak)
   - Recording transactions (debits/credits)
   - Reconciling bank statements
   - Accounts payable and accounts receivable
   - Payroll entry and tracking
   - General ledger maintenance
   - Journal entries

B. ACCOUNTING SOFTWARE & TOOLS (Strong/Moderate/Weak)
   - QuickBooks, Xero, Sage, or similar platforms
   - Advanced Excel/Google Sheets (formulas, pivot tables)
   - Generating financial reports (P&L, Balance Sheet)
   - Billing/invoicing systems
   - Financial management software

C. COMPLIANCE & ACCURACY (Strong/Moderate/Weak)
   - Ensuring accurate recordkeeping
   - Following accounting policies and procedures
   - Supporting audits and audit preparation
   - Maintaining proper documentation
   - Understanding of GAAP principles
   - Tax preparation support

D. ORGANIZATION & MULTI-TASKING (Strong/Moderate/Weak)
   - Managing multiple accounts or clients
   - Tracking deadlines (bills, payroll, reporting)
   - Attention to detail in numeric data entry
   - Month-end/year-end close procedures
   - Working independently or in small teams

SCORING: Candidates MUST show Strong evidence in 2+ categories. This is NOT flexible like other positions.

=== EQUIVALENT JOB TITLES ===

STRONG EQUIVALENTS (Automatically count as relevant bookkeeping experience):
- Bookkeeper
- Bookkeeping Clerk
- Accounting Clerk
- Accounts Payable Clerk
- Accounts Receivable Clerk
- Financial Clerk
- Staff Accountant (entry-level)
- Payroll Clerk (full-cycle)
- Finance Assistant (with bookkeeping)
- Junior Accountant

CONDITIONAL EQUIVALENTS (Count ONLY if resume shows 2+ core competencies):
- Office Manager (if shows AP/AR, payroll, or reconciliation duties)
- Administrative roles with financial recordkeeping
- Accounting Graduate (for entry-level roles with 0-1 years experience only)

${flexibleOnTitle ?
            `FLEXIBILITY MODE: ON
- Strong Equivalents count as FULL bookkeeping experience
- Conditional Equivalents count as FULL experience IF resume demonstrates 2+ core competencies
- Focus on transferable financial skills, not just job titles` :
            `FLEXIBILITY MODE: OFF
- Strong Equivalents count as "Close to Required" experience (apply -${flexibilityPenalty} point penalty)
- Conditional Equivalents score significantly lower
- Example: A candidate scoring 79 would drop to 70 with flexibility OFF
- Only exact "Bookkeeper" title gets full credit`}

=== SOFTWARE REQUIREMENTS ===

CRITICAL: Accounting software experience is ESSENTIAL for this role
- QuickBooks (most common in HVAC companies)
- Xero
- Sage
- FreshBooks
- Other professional accounting software

Candidates without accounting software experience should be heavily penalized:
- Has software experience: No penalty
- No software but shows willingness to learn: -15 to -20 points
- No software and no indication of learning: Likely Red tier

=== EDUCATION & CERTIFICATIONS ===

Valuable Credentials:
- Accounting Degree (Associate's or Bachelor's)
- Certified Bookkeeper (CB)
- CPA (Certified Public Accountant)
- Enrolled Agent (EA)
- QuickBooks Certification
- Accounting coursework or certificates

Entry-Level Exception:
- Recent accounting graduate (within 2 years) with 0-1 years experience can qualify if:
  - Strong academic performance mentioned
  - Relevant coursework (financial accounting, cost accounting)
  - Internship or part-time bookkeeping experience (even if brief)
  - Should score in Yellow tier (60-79) minimum

=== RESUME QUALITY DEFINITIONS ===

- GOOD RESUME: Proper formatting, no typos, clear financial accomplishments, quantified results (e.g., "managed $500K in AP/AR"), professional presentation
- MID RESUME: Professional formatting with few errors, lists duties but lacks quantification or detail
- POOR RESUME: Multiple typos/grammar errors, poor formatting, vague descriptions of financial duties

=== WORK GAPS ===

- NO WORK GAP: Under 6 months of unemployment
- SMALL WORK GAP: 6 months to 1 year of unemployment
- LARGE WORK GAP: Over 1 year of unemployment
- NOTE: Gaps in financial roles can be concerning - requires explanation
- Continuous employment in bookkeeping/accounting is strongly preferred

=== JOB STABILITY ===

- NOT JOB HOPPY: Stable employment (2+ years per employer)
- JOB HOPPY: Multiple jobs under 1.5 years each
- NOTE: Bookkeepers need time to learn systems and build trust - stability is valued

=== LOCATION/DISTANCE ===

- WITHIN 30 MILES: Minimal impact
- 30-50 MILES: Moderate negative impact
- OVER 50 MILES: Major negative impact (bookkeepers typically work on-site)

${generateUnifiedScoringRubric(requiredYears, false)}

`,
      scoring: {
         greenTier: { min: 80, max: 100 },
         yellowTier: { min: 50, max: 79 },
         redTier: { min: 0, max: 49 }
      }
   };
}

/**
 * Get HVAC Sales Representative tiered evaluation criteria
 */
function getSalesRepCriteria(requiredYears, flexibleOnTitle = true) {
   const flexibilityPenalty = flexibleOnTitle ? 0 : 9;

   return {
      framework: `
HVAC SALES REPRESENTATIVE RESUME EVALUATION FRAMEWORK
Job Requirement: ${requiredYears} years of HVAC Sales or equivalent sales experience
Flexibility on Role Title: ${flexibleOnTitle ? 'YES - Accept equivalent sales roles with transferable skills' : 'NO - Strict HVAC sales experience required, equivalent roles score lower'}

=== CRITICAL EVALUATION RULES ===

SALES IS BROADER THAN OTHER ROLES - BE MORE LENIENT WITH "GIVE THEM A CHANCE" 70-79 TIER
- Strong sales skills are highly transferable
- Technical product knowledge can be taught
- Focus on PROVEN SALES SUCCESS and customer-facing experience

EXPERIENCE CATEGORIES:
- REQUIRED EXPERIENCE: Candidate has ${requiredYears}+ years in HVAC Sales OR equivalent sales role (see below)
- CLOSE TO REQUIRED: Candidate has ${requiredYears * 0.5} to ${requiredYears * 0.95} years (50-95% of required)
- NOT CLOSE TO REQUIRED: Candidate has less than ${requiredYears * 0.5} years (<50% of required)

=== TRANSFERABLE SKILLS EVALUATION ===

Evaluate the candidate's experience against these FOUR core competency categories:

A. SALES PROCESS MASTERY
   - In-home or field sales experience
   - Consultative selling approach
   - Running sales appointments independently
   - Presenting quotes and closing deals
   - Meeting or exceeding sales quotas/targets
   - Pipeline or lead management
   - Proposal/estimate creation

B. TECHNICAL OR PRODUCT KNOWLEDGE
   (Candidate does NOT need to be a technician, but should show):
   - Selling HVAC systems, home services, or technical products
   - Understanding equipment options (SEER ratings, system types, IAQ, ductwork basics)
   - Ability to explain technical solutions to customers
   - Experience in construction, electrical, plumbing, energy services, or mechanical trades
   - Comfort with technical product specifications
   - Reading blueprints, estimates, or technical documentation

C. CUSTOMER INTERACTION & COMMUNICATION
   - Strong customer-facing experience
   - Explaining options and pricing to homeowners/property managers
   - Handling objections professionally
   - Home walkthroughs or on-site inspections
   - Creating proposals or estimates
   - Building long-term customer relationships
   - Post-sale follow-up and customer service

D. SELF-MANAGEMENT & LEAD HANDLING
   - Managing own schedule and territory
   - Running multiple appointments per day
   - Handling inbound and outbound leads
   - Coordinating with technicians, installers, or dispatch
   - CRM or sales software use (Salesforce, HubSpot, ServiceTitan)
   - Working independently without constant supervision
   - Self-motivated and goal-oriented

IMPORTANT: A candidate does NOT need all four categories to qualify. Having strong experience in 2-3 categories can still result in a high score.

=== EQUIVALENT JOB TITLES ===

STRONG EQUIVALENTS (Count as direct HVAC sales experience):
- Comfort Advisor
- Home Services Sales Consultant
- In-Home Sales Representative
- Residential Sales Consultant
- Field Sales Representative (home services)
- Construction Sales Representative
- Electrical or Plumbing Sales Representative
- Roofing Sales Consultant
- Solar Sales Consultant
- Energy Consultant / Energy Advisor
- Mechanical Sales Representative
- Building Systems Sales
- HVAC Account Executive
- Home Improvement Sales

CONDITIONAL EQUIVALENTS (Require skill confirmation - must show 1-2+ core competencies):
- Retail Sales (requires strong indicators of consultative selling, quotas, or technical products)
- Customer Service Representative (only if tied to upselling, service agreements, or account management)
- Appointment Setter / Inside Sales (qualifies only if connected to home services or technical sales)
- Property Management roles (must show technical vendor interaction or estimate handling)
- Office roles in HVAC companies (must show sales support, proposals, or customer quotes)
- Marketing or Lead Generation roles (only if HVAC/home service specific with sales responsibilities)
- Real Estate Sales (if shows consultative selling and negotiation)
- B2B Sales (if technical products or services)

${flexibleOnTitle ?
            `FLEXIBILITY MODE: ON
- Strong Equivalents count as FULL HVAC sales experience
- Conditional Equivalents count as FULL experience IF resume demonstrates 1-2+ core competencies from Section A-D
- Focus on transferable sales skills, proven results, and customer-facing success
- Sales is highly transferable - prioritize track record over exact job title` :
            `FLEXIBILITY MODE: OFF
- Only direct HVAC sales experience counts as "Required Experience"
- Strong Equivalents count as "Close to Required" experience (apply -${flexibilityPenalty} point penalty)
- Conditional Equivalents count as "Not Close to Required" (placed in lower tier)
- Candidates without exact "HVAC Sales" title will score 9 points lower than they would with flexibility ON`}

=== HARD REQUIREMENTS (BINARY FILTERS) ===

Most candidates should PASS unless explicitly lacking required items.

Check if job posting requires:
- Valid driver's license (required for most field sales roles)
- Minimum years of experience (check against HVAC sales + equivalents)
- Knowledge of HVAC products (if explicitly required, candidate must show some technical understanding)
- Ability to read estimates, proposals, or basic mechanical concepts

If a hard requirement is explicitly listed and the candidate does NOT meet it → fail the hard requirement filter.

=== RESUME QUALITY DEFINITIONS ===

- GOOD RESUME: Professional formatting, no typos, proper grammar/punctuation, at least 2 substantive bullets per experience showing sales achievements (quotas met, revenue generated, deals closed, etc.)
- MID RESUME: Professional formatting with few grammatical errors, but missing quantified achievements OR has limited bullets OR small formatting issues
- POOR RESUME: Multiple punctuation errors + multiple typos, numerous formatting issues, AND lacks substantive sales achievements

=== KEY INDICATORS OF SUCCESS ===

Sales Achievements to Look For:
- Exceeded sales quotas by X%
- Closed $X in revenue
- Maintained X% close rate
- Generated X leads per month
- Built book of business worth $X
- Ranked top X% of sales team
- Won sales awards or recognition

Technical/Software Skills:
- CRM systems (Salesforce, HubSpot, Zoho, ServiceTitan)
- Proposal/quoting software
- Microsoft Office (especially Excel for tracking)
- HVAC-specific software (a plus but not required)
- Lead tracking systems

Certifications (bonus, not required):
- HVAC industry certifications
- Sales training certifications
- Manufacturer product certifications (Carrier, Trane, Lennox, etc.)

=== WORK GAPS ===

- NO WORK GAP: Under 6 months of unemployment
- SMALL WORK GAP: 6 months to 1 year of unemployment
- LARGE WORK GAP: Over 1 year of unemployment
- IMPORTANT: Overlapping jobs = POSITIVE (shows ambition)
- Career transitions INTO sales should NOT be heavily penalized if they show results

=== JOB STABILITY ===

- NOT JOB HOPPY: Stable employment (2+ years per employer)
- JOB HOPPY: Multiple jobs under 1.5 years each
- NOTE: Dispatcher roles require familiarity with company operations, service areas, and technician teams - stability is critical
- NOTE: Sales roles often involve commission changes or better opportunities - moderate job movement is acceptable

=== LOCATION/DISTANCE ===

- WITHIN 30 MILES: Minimal impact
- 30-50 MILES: Moderate negative impact
- OVER 50 MILES: Major negative impact

${generateUnifiedScoringRubric(requiredYears, true)}

`,
      scoring: {
         greenTier: { min: 80, max: 100 },
         yellowTier: { min: 50, max: 79 },
         redTier: { min: 0, max: 49 }
      }
   };
}

/**
 * Get Lead HVAC Technician tiered evaluation criteria with transferable skills
 */
function getLeadHVACTechnicianCriteria(requiredYears, flexibleOnTitle = true) {
   const flexibilityPenalty = flexibleOnTitle ? 0 : 9;

   return {
      framework: `
LEAD HVAC TECHNICIAN RESUME EVALUATION FRAMEWORK
Job Requirement: ${requiredYears} years of Lead HVAC Technician or equivalent senior HVAC experience
Flexibility on Role Title: ${flexibleOnTitle ? 'YES - Accept equivalent senior HVAC roles with transferable skills' : 'NO - Strict title matching, equivalent roles score 9 points lower'}

=== CRITICAL EVALUATION PHILOSOPHY ===

This is a NUANCED position that recognizes Lead HVAC Technician experience can come from various senior-level HVAC roles.
Evaluate candidates based on COMPETENCIES and RESPONSIBILITIES, not just job title.

The scoring system should:
✓ Recognize direct Lead HVAC Technician experience
✓ Recognize functionally equivalent senior HVAC roles
✓ Use binary hard requirements and semantic reasoning about transferable skills
✓ Properly evaluate candidates even if their title is not "Lead HVAC Technician"
✓ Prioritize leadership, advanced diagnostics, and mentorship responsibilities

=== HARD REQUIREMENTS (BINARY FILTERS) ===

If the job post requires minimum years of experience, the candidate must meet the requirement with either:
1. Direct Lead HVAC Technician experience, OR
2. Senior-level HVAC service/maintenance/installer experience with leadership duties, OR
3. Equivalent advanced HVAC roles demonstrating parallel responsibilities

Most candidates should PASS unless clearly missing hard requirements.

Check if job posting requires:
- Minimum years of HVAC experience (check against Lead/Senior HVAC + equivalents)
- EPA 608 certification (if explicitly required)
- Valid driver's license (usually required for field work)
- State/local HVAC license (if applicable)

If a hard requirement is explicitly listed and the candidate does NOT meet it → fail the hard requirement filter.

=== TRANSFERABLE SKILLS & ROLE EQUIVALENCY ===

ACCEPTABLE EQUIVALENT JOB TITLES (Strong Equivalents):
- Lead HVAC Technician (direct match)
- Senior HVAC Technician
- HVAC Service Technician (Level II or III)
- HVAC Field Technician (Senior)
- HVAC Installer (Lead or Senior Installer)
- HVAC Maintenance Technician (Senior)
- HVAC Foreman / HVAC Crew Lead
- HVAC Team Lead
- HVAC Service Specialist / Master Technician
- Building Engineer (with HVAC-heavy workload)
- Refrigeration Technician (senior roles)
- HVAC Service Technician (with ${requiredYears}+ years demonstrating leadership)
- HVAC Project Manager (with hands-on technical work)
- Commercial HVAC Technician (senior level)

CORE COMPETENCY CATEGORIES:
Evaluate the candidate's experience across these four categories. Strong Lead Tech candidates generally exhibit 3-4 categories.

A. Advanced HVAC Diagnostics & Technical Mastery
   - Troubleshooting complex HVAC systems (RTUs, chillers, boilers, VRF/VRV)
   - Advanced electrical diagnostics and controls
   - Experience with heat pumps, minisplits, gas furnaces
   - Refrigeration knowledge and EPA 608 certification
   - Commissioning, system testing, and verification
   - Knowledge of building automation systems (BAS)
   - Experience with specialized equipment (chillers, boilers, VRF if listed)

B. Leadership, Mentorship & Oversight
   - Leading teams or job sites
   - Training or mentoring junior technicians
   - Quality control and final inspections
   - Assigning tasks or overseeing work orders
   - Acting as senior point of contact on jobs
   - Managing crew schedules or coordinating multiple techs
   - Decision-making authority on technical matters

C. Customer Interaction & Job Management
   - Interacting with customers at a senior/lead level
   - Quoting repairs or explaining complex technical issues
   - Coordinating with dispatch/office/project managers
   - Handling escalations and difficult customer situations
   - Documenting work with high accuracy
   - Managing service agreements or maintenance contracts
   - Building long-term customer relationships

D. Installation, Service & Maintenance Command
   - Performing advanced service AND installation tasks
   - Knowledge of code compliance (local, state, federal)
   - Skilled in brazing, electrical work, line set work
   - Experience completing full system changeouts
   - Ability to handle both residential & light commercial
   - Ductwork design and modification
   - Startup and commissioning of new systems

=== HOW TO EVALUATE COMPETENCIES ===

Strong Lead Tech candidates generally exhibit 3-4 competency categories.

Scoring Approach:
- 4 Strong Competencies = Excellent fit, score at upper end of tier
- 3 Strong Competencies = Good fit, score at mid-to-upper tier
- 2 Strong Competencies = Borderline, score at lower end of tier (may need other strong factors)
- 1 or fewer Strong Competencies = Not qualified for Lead role

IMPORTANT: Claude should score candidates HIGHER when these competencies appear anywhere in the resume, even if the job title is not explicitly "Lead HVAC Technician."

Example: An "HVAC Service Technician" with 5+ years who demonstrates:
- Advanced diagnostics (Category A)
- Mentoring junior techs (Category B)
- Customer interaction at senior level (Category C)
- Full system installations (Category D)
→ This candidate has 4/4 competencies and should score in the REQUIRED EXPERIENCE tier (with flexibility ON)

EXPERIENCE TIER DEFINITIONS:

=== REQUIRED EXPERIENCE TIER ===

${flexibleOnTitle ?
            `FLEXIBILITY MODE: ON (flexibleOnTitle = true)

Accept candidates with ${requiredYears}+ years in ANY of the following:
✓ Lead HVAC Technician (direct match)
✓ Senior HVAC Technician
✓ HVAC Service Technician (${requiredYears}+ years) IF demonstrates leadership competencies
✓ HVAC Installer (Lead or Senior level)
✓ HVAC Maintenance Technician (senior level with HVAC focus)
✓ HVAC Foreman, Crew Lead, Team Lead
✓ Any equivalent senior HVAC role demonstrating 3-4 core competency categories

KEY POINT: Evaluate based on COMPETENCIES and RESPONSIBILITIES, not strict title matching.
Examples that QUALIFY for Required tier:
- Service Tech with 5+ years who trains junior techs and handles complex diagnostics
- Lead Installer with 5+ years who manages install crews and does service work
- Maintenance Tech with 5+ years doing commercial HVAC with supervisory duties
- General Manager with 5+ years of hands-on HVAC work and team leadership` :
            `FLEXIBILITY MODE: OFF (flexibleOnTitle = false)

Only these titles qualify for Required Experience tier:
✓ Lead HVAC Technician (direct match)
✓ Senior HVAC Technician
✓ HVAC Foreman, Crew Lead, Team Lead (with explicit leadership title)

The following roles will DROP to "Close to Required" tier AND receive -${flexibilityPenalty} point penalty:
- HVAC Service Technician (${requiredYears}+ years) → Drops to Close tier, -9 points
- HVAC Installer (without "Lead" in title) → Drops to Close tier, -9 points
- HVAC Maintenance Technician (without "Senior" in title) → Drops to Close tier, -9 points
- General Manager with HVAC background → Drops to Close tier, -9 points

Example: A Service Tech with 5 years who would normally score 79 (high Close tier) will drop to 70 (low Yellow tier).`}

=== CLOSE TO REQUIRED EXPERIENCE (50-95% of required) ===

- ${requiredYears * 0.5} to ${requiredYears * 0.95} years in lead/senior HVAC roles, OR
- ${requiredYears}+ years as Service Technician WITHOUT leadership responsibilities (when flexibility is OFF), OR
- Candidates with strong competencies (3-4 categories) but slightly less than required experience

${!flexibleOnTitle ? `\nIMPORTANT: When flexibility is OFF, Service Technicians and other non-Lead titles with ${requiredYears}+ years fall into this tier with -${flexibilityPenalty} point penalty.` : ''}

=== NOT CLOSE TO REQUIRED (Less than 50% of required) ===

- Less than ${requiredYears * 0.5} years of relevant lead/senior HVAC experience
- May have general HVAC experience but lacks leadership/advanced technical competencies
- Entry-level or junior HVAC technicians without demonstrated senior responsibilities

=== CRITICAL EVALUATION RULES ===

RESUME QUALITY DEFINITIONS:
- GOOD RESUME: Proper formatting, no typos, proper punctuation/grammar, substantive bullets describing accomplishments and responsibilities
- MID RESUME: Professional formatting with few grammatical errors, but missing key elements or has limited detail
- POOR RESUME: Multiple punctuation errors + typos, numerous formatting issues, AND lacks substantive content

CERTIFICATIONS:
- EPA 608 Universal (critical for lead roles)
- NATE certifications
- State/local licenses
- Manufacturer certifications (Carrier, Trane, Lennox, etc.)
- OSHA safety certifications
- Having certifications listed ALWAYS scores higher than not having them listed

WORK GAPS:
- NO WORK GAP: Under 6 months of unemployment (continuous employment OR overlapping jobs OR gaps less than 6 months)
- SMALL WORK GAP: 6 months to 1 year of unemployment with no job listed
- LARGE WORK GAP: Over 1 year of unemployment with no job listed
- IMPORTANT: Overlapping jobs (multiple jobs at once) is NOT a work gap - it's actually POSITIVE and shows work ethic
- Career transitions FROM other industries INTO HVAC should NOT be penalized
- Only count actual unemployment periods (gaps between all jobs) as work gaps

JOB STABILITY (JOB HOPPINESS):
- JOB HOPPY: Frequent job changes in HVAC career (significant negative factor)
- NOT JOB HOPPY: Stable employment history with reasonable tenure at companies
- IMPORTANT: Do NOT penalize for pre-HVAC job changes or career transitions into HVAC

LOCATION/DISTANCE:
- WITHIN 30 MILES: Minimal impact on score
- 30-50 MILES: Moderate negative impact
- OVER 50 MILES: Major negative impact (99% will fall into red tier)
- IMPORTANT: Use reasoning - don't severely punish 33 miles vs 30 miles. Be flexible around boundaries.

${generateUnifiedScoringRubric(requiredYears, true)}

`,
      scoring: {
         greenTier: { min: 80, max: 100 },
         yellowTier: { min: 50, max: 79 },
         redTier: { min: 0, max: 49 }
      }
   };
}

/**
 * Get Administrative Assistant tiered evaluation criteria
 */
function getAdminAssistantCriteria(requiredYears, flexibleOnTitle = true) {
   const flexibilityPenalty = flexibleOnTitle ? 0 : 9;

   return {
      framework: `
ADMIN ASSISTANT RESUME EVALUATION FRAMEWORK
Job Requirement: ${requiredYears} years of Administrative Assistant or equivalent experience
Flexibility on Role Title: ${flexibleOnTitle ? 'YES - Accept equivalent roles with transferable skills' : 'NO - Strict title matching, equivalent roles score lower'}

=== CRITICAL EVALUATION RULES ===

EXPERIENCE CATEGORIES:
- REQUIRED EXPERIENCE: Candidate has ${requiredYears}+ years as Administrative Assistant OR equivalent role
- CLOSE TO REQUIRED: Candidate has ${requiredYears * 0.5} to ${requiredYears * 0.95} years (50-95% of required)
- NOT CLOSE TO REQUIRED: Candidate has less than ${requiredYears * 0.5} years (<50% of required)

=== TRANSFERABLE SKILLS EVALUATION ===

Evaluate the candidate's experience against these FOUR core competency categories:

A. ADMINISTRATIVE OPERATIONS
   - Scheduling meetings and calendar management
   - Filing and organizing (digital and physical)
   - Data entry and database management
   - Front desk duties or office reception
   - Office supply management and inventory

B. COMMUNICATION & CUSTOMER INTERACTION
   - Answering phones and handling inquiries
   - Responding to emails professionally
   - Assisting customers or clients
   - Acting as first point of contact
   - Greeting visitors

C. DOCUMENTATION & OFFICE TOOLS
   - Preparing documents and reports
   - Using spreadsheets (Excel) and word processing (Word)
   - CRM or database experience
   - Drafting correspondence
   - Managing digital records and files
   - Microsoft Office Suite proficiency

D. MULTI-TASKING IN FAST-PACED ENVIRONMENT
   - Handling multiple responsibilities simultaneously
   - Supporting several team members or departments
   - Working in busy office or customer-facing settings
   - Prioritizing tasks autonomously
   - Managing competing deadlines

IMPORTANT: A candidate does NOT need all four categories to qualify. Having strong experience in 2+ categories can result in a high score.

=== EQUIVALENT JOB TITLES ===

STRONG EQUIVALENTS (Count as direct Administrative Assistant experience):
- Office Administrator
- Office Assistant
- Receptionist
- Secretary
- Executive Assistant
- Front Desk Coordinator
- Customer Service Representative
- Scheduling Coordinator
- Operations Assistant

CONDITIONAL EQUIVALENTS (Require skill confirmation in resume):
- Retail Sales Associate (if shows administrative tasks)
- Inside Sales (if shows office coordination)
- Hospitality roles (hotel front desk, concierge - if shows admin duties)
- Call Center Representative (if shows data entry, scheduling)
- Medical Office roles (patient coordinator, records clerk)
- Warehouse Office roles (inventory clerk, shipping/receiving desk)

${flexibleOnTitle ?
            `FLEXIBILITY MODE: ON
- Strong Equivalents count as FULL Administrative Assistant experience
- Conditional Equivalents count as FULL experience IF resume demonstrates relevant skills from sections A-D above
- Focus on transferable skills, not just job titles` :
            `FLEXIBILITY MODE: OFF
- Strong Equivalents count as "Close to Required" experience (apply -${flexibilityPenalty} point penalty)
- Conditional Equivalents count as "Not Close to Required"
- Candidates without exact "Administrative Assistant" title will score lower`}

=== RESUME QUALITY DEFINITIONS ===

- GOOD RESUME: Proper formatting, no typos, proper punctuation/grammar, at least 2 substantive bullets per experience demonstrating admin-relevant skills
- MID RESUME: Professional formatting with few grammatical errors, but missing key elements like bullets under experiences, or has limited bullets, or has small formatting issues
- POOR RESUME: Multiple punctuation errors + multiple typos, numerous formatting issues, AND lacks substantive content

=== KEY SKILLS TO LOOK FOR ===

Technical/Software Skills:
- Microsoft Office Suite (Word, Excel, PowerPoint, Outlook)
- Google Workspace (Docs, Sheets, Gmail, Calendar)
- CRM systems (Salesforce, HubSpot, etc.)
- Database management
- Scheduling software
- Data entry and record keeping
- Filing systems (digital and physical)

Soft Skills:
- Organization and time management
- Attention to detail and accuracy
- Communication (written and verbal)
- Problem-solving
- Customer service orientation
- Ability to work independently
- Team collaboration
- Professionalism

Certifications (bonus, not required):
- Microsoft Office Specialist (MOS)
- Administrative Professional Certification
- Project Management certifications
- Industry-specific admin certifications

=== WORK GAPS ===

- NO WORK GAP: Under 6 months of unemployment
- SMALL WORK GAP: 6 months to 1 year of unemployment
- LARGE WORK GAP: Over 1 year of unemployment
- IMPORTANT: Overlapping jobs = POSITIVE, not a gap
- Career transitions INTO administrative work should NOT be penalized
- Only count actual unemployment periods (gaps between all jobs) as work gaps

=== JOB STABILITY ===

- NOT JOB HOPPY: Stable employment (2+ years per employer)
- JOB HOPPY: Multiple jobs under 1.5 years each
- NOTE: Dispatcher roles require familiarity with company operations, service areas, and technician teams - stability is critical

=== LOCATION/DISTANCE ===

- WITHIN 30 MILES: Minimal impact
- 30-50 MILES: Moderate negative impact
- OVER 50 MILES: Major negative impact

=== CERTIFICATIONS ===

- CERTIFICATIONS LISTED: Resume explicitly mentions relevant certifications (MOS, CAP, etc.)
- CERTIFICATIONS NOT LISTED: No certifications mentioned or not applicable

${generateUnifiedScoringRubric(requiredYears, false)}

`,
      scoring: {
         greenTier: { min: 80, max: 100 },
         yellowTier: { min: 50, max: 79 },
         redTier: { min: 0, max: 49 }
      }
   };
}

/**
 * Get Customer Service Representative tiered evaluation criteria
 */
function getCustomerServiceRepCriteria(requiredYears, flexibleOnTitle = true) {
   const flexibilityPenalty = flexibleOnTitle ? 0 : 9;

   return {
      framework: `
CUSTOMER SERVICE REPRESENTATIVE RESUME EVALUATION FRAMEWORK
Job Requirement: ${requiredYears} years of Customer Service Representative or equivalent experience
Flexibility on Role Title: ${flexibleOnTitle ? 'YES - Accept equivalent roles with transferable skills' : 'NO - Strict title matching, equivalent roles score lower'}

=== CRITICAL EVALUATION RULES ===

EXPERIENCE CATEGORIES:
- REQUIRED EXPERIENCE: Candidate has ${requiredYears}+ years as Customer Service Representative OR equivalent role
- CLOSE TO REQUIRED: Candidate has ${requiredYears * 0.5} to ${requiredYears * 0.95} years (50-95% of required)
- NOT CLOSE TO REQUIRED: Candidate has less than ${requiredYears * 0.5} years (<50% of required)

=== TRANSFERABLE SKILLS EVALUATION ===

Evaluate the candidate's experience against these FOUR core competency categories:

A. CUSTOMER INTERACTION & COMMUNICATION
   - Handling incoming calls, chats, or emails
   - Assisting customers with questions or problems
   - Maintaining a professional, friendly tone
   - Acting as first point of contact
   - Providing product/service information

B. PROBLEM SOLVING & ISSUE RESOLUTION
   - De-escalating complaints and conflicts
   - Troubleshooting customer issues
   - Processing returns, refunds, or adjustments
   - Resolving disputes or dissatisfaction
   - Making decisions to satisfy customers

C. SYSTEMS, TOOLS & DOCUMENTATION
   - Using CRM systems (Salesforce, Zendesk, etc.)
   - Logging interactions and maintaining records
   - Following scripts or ticketing systems
   - Documenting customer information accurately
   - Data entry and record keeping

D. HIGH-VOLUME / FAST-PACED WORK
   - Call center experience
   - Retail or hospitality during peak hours
   - Handling multiple customers simultaneously
   - Managing queues and multitasking across channels
   - Working under pressure with high call/ticket volumes

IMPORTANT: A candidate does NOT need all four categories to qualify. Having strong experience in 2+ categories can result in a high score.

=== EQUIVALENT JOB TITLES ===

STRONG EQUIVALENTS (Count as direct Customer Service Representative experience):
- Customer Service Representative
- Call Center Representative
- Front Desk Associate
- Receptionist (customer-facing)
- Retail Associate
- Server / Waitstaff
- Hospitality Staff (hotel front desk, concierge)
- Sales Associate
- Support Specialist
- Help Desk Agent (non-technical or hybrid)

CONDITIONAL EQUIVALENTS (Require skill confirmation in resume):
- Administrative Assistant (if shows customer interaction)
- Office Assistant (if shows customer-facing duties)
- Dispatcher (if shows customer communication)
- Scheduler (if shows customer interaction)
- Inside Sales (if shows support/service focus)
- Warehouse Associate (if customer pickup/service counter)
- Cashier (if shows customer service beyond transactions)
- Medical Office Coordinator (if patient-facing)
- Appointment Coordinator (if customer interaction)

${flexibleOnTitle ?
            `FLEXIBILITY MODE: ON
- Strong Equivalents count as FULL Customer Service Representative experience
- Conditional Equivalents count as FULL experience IF resume demonstrates relevant skills from sections A-D above
- Focus on transferable skills and customer-facing activities, not just job titles` :
            `FLEXIBILITY MODE: OFF
- Strong Equivalents count as "Close to Required" experience (apply -${flexibilityPenalty} point penalty)
- Conditional Equivalents count as "Not Close to Required"
- Candidates without exact "Customer Service Representative" title will score lower`}

=== RESUME QUALITY DEFINITIONS ===

- GOOD RESUME: Proper formatting, no typos, proper punctuation/grammar, at least 2 substantive bullets per experience demonstrating customer service skills
- MID RESUME: Professional formatting with few grammatical errors, but missing key elements like bullets under experiences, or has limited bullets, or has small formatting issues
- POOR RESUME: Multiple punctuation errors + multiple typos, numerous formatting issues, AND lacks substantive content

=== KEY SKILLS TO LOOK FOR ===

Technical/Software Skills:
- CRM systems (Salesforce, Zendesk, HubSpot, ServiceNow, etc.)
- Call center software and phone systems
- Ticketing systems
- Live chat platforms
- Microsoft Office Suite
- Email management
- Database/record keeping systems

Soft Skills:
- Communication (written and verbal)
- Active listening
- Empathy and patience
- Problem-solving under pressure
- Conflict resolution and de-escalation
- Multitasking and time management
- Professionalism and positive attitude
- Adaptability and flexibility

Certifications (bonus, not required):
- Customer Service certifications
- Call center certifications
- Industry-specific service training
- Conflict resolution training

=== WORK GAPS ===

- NO WORK GAP: Under 6 months of unemployment
- SMALL WORK GAP: 6 months to 1 year of unemployment
- LARGE WORK GAP: Over 1 year of unemployment
- IMPORTANT: Overlapping jobs = POSITIVE, not a gap
- Career transitions INTO customer service should NOT be penalized
- Only count actual unemployment periods (gaps between all jobs) as work gaps

=== JOB STABILITY ===

- NOT JOB HOPPY: Stable employment (2+ years per employer)
- JOB HOPPY: Multiple jobs under 1.5 years each
- NOTE: Office/customer service roles need time to learn systems, build relationships, and demonstrate value - stability is highly valued

=== LOCATION/DISTANCE ===

- WITHIN 30 MILES: Minimal impact
- 30-50 MILES: Moderate negative impact
- OVER 50 MILES: Major negative impact

=== CERTIFICATIONS ===

- CERTIFICATIONS LISTED: Resume explicitly mentions relevant certifications (customer service, call center, etc.)
- CERTIFICATIONS NOT LISTED: No certifications mentioned or not applicable

${generateUnifiedScoringRubric(requiredYears, false)}

`,
      scoring: {
         greenTier: { min: 80, max: 100 },
         yellowTier: { min: 50, max: 79 },
         redTier: { min: 0, max: 49 }
      }
   };
}

/**
 * Analyze resume using Claude AI with HVAC-specific criteria
 */
async function analyzeResume(filePath, position = 'HVAC Technician', requiredYearsExperience = 2, flexibleOnTitle = true) {
   try {
      // Extract text from resume
      let resumeText;
      const ext = path.extname(filePath).toLowerCase();

      if (ext === '.pdf') {
         resumeText = await extractTextFromPDF(filePath);
      } else {
         // For DOC/DOCX, you'd need additional library like mammoth
         // For now, we'll handle PDF only
         throw new Error('Only PDF files are currently supported');
      }

      // Check if we're using the tiered framework for HVAC Service Technician, Lead HVAC Technician, Dispatcher, Administrative Assistant, Customer Service Rep, Apprentice, Bookkeeper, Warehouse Associate, or Sales Rep
      const useServiceTechFramework = position === 'HVAC Service Technician';
      const useLeadHVACTechFramework = position === 'Lead HVAC Technician';
      const useDispatcherFramework = position === 'HVAC Dispatcher';
      const useAdminAssistantFramework = position === 'Administrative Assistant';
      const useCustomerServiceRepFramework = position === 'Customer Service Representative';
      const useApprenticeFramework = position === 'Apprentice' || position === 'HVAC Apprentice';
      const useBookkeeperFramework = position === 'Bookkeeper';
      const useWarehouseAssociateFramework = position === 'Warehouse Associate';
      const useSalesRepFramework = position === 'HVAC Sales Representative';

      let prompt;

      if (useSalesRepFramework) {
         // Use the detailed HVAC Sales Representative evaluation framework
         const salesRepCriteria = getSalesRepCriteria(requiredYearsExperience, flexibleOnTitle);

         prompt = `You are an expert recruiter specializing in HVAC Sales Representative evaluation. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${salesRepCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: CHECK HARD REQUIREMENTS (BINARY FILTER)
   a) Check if resume mentions valid driver's license (if job requires it)
   b) Check for minimum years of sales experience (HVAC + equivalents)
   c) Check for HVAC product knowledge (only if explicitly required)
   d) Most candidates should PASS unless clearly missing required items

STEP 2: IDENTIFY ALL RELEVANT SALES EXPERIENCE
   a) List EVERY sales position with start/end dates
   b) Include Direct HVAC Sales: HVAC Sales Rep, Comfort Advisor, HVAC Account Executive
   c) Include Strong Equivalents: Home Services Sales, Construction Sales, Electrical/Plumbing Sales, Roofing/Solar Sales, Energy Consultant, Building Systems Sales, Field Sales (home services)
   d) Include Conditional Equivalents IF they show 1-2+ core competencies: Retail Sales (consultative), Customer Service (upselling), Inside Sales, Property Management, B2B Sales, Real Estate Sales
   e) Calculate duration of EACH position in years and months
   f) SUM all durations to get TOTAL relevant sales experience

STEP 3: CLASSIFY EXPERIENCE TIER
   a) If TOTAL sales years >= ${requiredYearsExperience}: This is "REQUIRED EXPERIENCE" tier
   b) If TOTAL sales years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: This is "CLOSE TO REQUIRED" tier
   c) If TOTAL sales years < ${requiredYearsExperience * 0.5}: This is "NOT CLOSE TO REQUIRED" tier

STEP 4: EVALUATE THE 4 CORE COMPETENCIES
   For each category, rate as Strong/Moderate/Weak based on resume evidence:

   A. SALES PROCESS MASTERY: Look for in-home sales, consultative selling, running appointments, closing deals, quotas, pipeline management
   B. TECHNICAL/PRODUCT KNOWLEDGE: Look for HVAC systems, technical products, equipment options, construction/trades background
   C. CUSTOMER INTERACTION: Look for customer-facing experience, explaining pricing, handling objections, proposals, relationship building
   D. SELF-MANAGEMENT: Look for territory management, independent work, multiple appointments/day, CRM usage, lead handling

STEP 5: ASSESS RESUME QUALITY (BE OBJECTIVE)
   a) GOOD RESUME = Professional formatting + No major typos + No grammar errors + 2+ substantive bullets with sales achievements (quotas, revenue, close rates)
   b) MID RESUME = Professional formatting BUT missing quantified achievements OR few errors OR limited content
   c) POOR RESUME = Multiple errors AND poor formatting AND lacks substantive sales achievements

STEP 6: CHECK FOR WORK GAPS
   a) List ALL employment periods
   b) Calculate gaps between jobs
   c) NO WORK GAP = Gaps under 6 months
   d) SMALL WORK GAP = 6 months to 1 year
   e) LARGE WORK GAP = Over 1 year
   f) NOTE: Overlapping jobs = POSITIVE for sales roles

STEP 7: ASSESS JOB STABILITY
   a) NOT JOB HOPPY = Long tenures (2+ years per employer) OR few employers
   b) JOB HOPPY = Many employers with short tenures (under 1 year each)
   c) NOTE: Sales roles often have moderate movement - be lenient

STEP 8: CHECK FOR OVERQUALIFICATION
   a) Look for candidates applying from senior sales management positions (Sales Director, VP Sales, Regional Sales Manager) to individual contributor sales roles
   b) OVERQUALIFIED if applying DOWN from leadership roles with 10+ years managing sales teams
   c) NOT OVERQUALIFIED if: Moving from similar level, career change, location preference, or reasonable step
   d) If OVERQUALIFIED: Score becomes 70-75 REGARDLESS of other factors, skip to Step 10

STEP 9: APPLY THE RUBRIC (if not overqualified)
   a) Match the candidate's profile to the scoring matrix
   b) Use Experience Tier + Resume Quality + Work Gap + Job Hopping + Distance
   c) Select appropriate score range
   d) Be LENIENT with 70-79 "give them a chance" tier for sales - transferable skills matter

STEP 10: CALCULATE FINAL SCORE
   a) If overqualified, score must be 70-75
   b) If not overqualified, use rubric score
   c) ${flexibleOnTitle ? 'NO PENALTY for equivalent sales roles' : 'SUBTRACT 9 points if using Strong Equivalents (non-HVAC sales)'}
   d) Ensure final score is within appropriate range
   e) If candidate has 4X the required sales experience, they should score 85+ (unless major red flags or overqualified)

${flexibleOnTitle ? '' : `
CRITICAL: If flexibility is OFF and candidate has Strong Equivalent experience (not direct HVAC sales):
- After calculating score from rubric, SUBTRACT 9 points
- Conditional Equivalents automatically fall into lower tiers
- Minimum score after penalty is 1`}

Return your analysis in this EXACT JSON format:
{
  "overallScore": <number 0-100 based on the tiered framework${flexibleOnTitle ? '' : ', with -9 penalty applied if using Strong Equivalents'}>,
  "isOverqualified": <true if candidate is overqualified per Step 8, false otherwise>,
  "overqualificationReason": "<if overqualified, explain which senior sales position is applying to individual contributor role, otherwise null>",
  "summary": "<brief 3-sentence summary explaining the score, highlighting sales achievements, core competencies demonstrated, and transferable skills. If overqualified, mention this in the summary.>",
  "salesExperience": {
    "score": <0-100>,
    "yearsOfExperience": <number>,
    "relevantExperience": ["<sales role 1>", "<sales role 2>"],
    "salesAchievements": ["<achievement 1>", "<achievement 2>"],
    "coreCompetencies": {
      "salesProcessMastery": "<Strong/Moderate/Weak>",
      "technicalProductKnowledge": "<Strong/Moderate/Weak>",
      "customerInteraction": "<Strong/Moderate/Weak>",
      "selfManagement": "<Strong/Moderate/Weak>"
    },
    "feedback": "<detailed feedback on sales experience and achievements>"
  },
  "technicalSkills": {
    "score": <0-100>,
    "found": ["<skill 1>", "<skill 2>"],
    "missing": ["<skill 1 if any>"],
    "feedback": "<feedback on CRM, software, HVAC knowledge>"
  },
  "presentationQuality": {
    "score": <0-100 based on resume quality>,
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1 if any>"],
    "feedback": "<feedback on resume formatting and presentation>"
  },
  "strengths": ["<overall strength 1>", "<overall strength 2>", "<overall strength 3>"],
  "weaknesses": ["<weakness 1 if any>", "<weakness 2 if any>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "hiringRecommendation": "<STRONG_YES (90+) | YES (80-89) | MAYBE (70-79) | PROBABLY_NOT (50-69) | NO (<50)>"
}`;
      } else if (useWarehouseAssociateFramework) {
         // Use the detailed Warehouse Associate evaluation framework
         const warehouseCriteria = getWarehouseAssociateCriteria(requiredYearsExperience, flexibleOnTitle);

         prompt = `You are an expert recruiter specializing in Warehouse Associate evaluation. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${warehouseCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: CHECK HARD REQUIREMENTS (BINARY FILTER)
   a) Check if resume mentions physical limitations preventing lifting 40-50 lbs
   b) Check for driver's license or reliable transportation (only if job post requires it)
   c) Check for high school diploma/GED (only if job post explicitly requires it)
   d) Most candidates should PASS unless clear physical limitations or missing required items

STEP 2: IDENTIFY ALL RELEVANT EXPERIENCE
   a) List EVERY warehouse, labor-intensive, or physical role with start/end dates
   b) Include Direct Experience: Warehouse Associate, Material Handler, Order Picker, Picker/Packer, Stocker, Shipping & Receiving, Inventory Associate, Distribution Associate
   c) Include Strong Equivalents: Retail Stocker, Manufacturing Worker, Construction Laborer, Landscaping, General Laborer, Movers, Custodian (heavy tasks), Loading Dock Worker, Fulfillment Associate
   d) Include Conditional Equivalents IF they show 1-2 core competencies: Retail Sales (with backroom), Restaurant Server/Cook (physical labor), Maintenance Worker (material handling), Delivery Driver (loading/unloading), Farm Worker
   e) Calculate duration of EACH position in years and months
   f) SUM all durations to get TOTAL relevant experience

STEP 3: CLASSIFY EXPERIENCE TIER
   a) If TOTAL years >= ${requiredYearsExperience}: This is "REQUIRED EXPERIENCE" tier
   b) If TOTAL years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: This is "CLOSE TO REQUIRED" tier
   c) If TOTAL years < ${requiredYearsExperience * 0.5} BUT has labor experience: This is "NOT CLOSE BUT HAS LABOR" tier
   d) If NO labor-intensive experience (only office/professional/creative roles): This is "NO TRANSFERABLE SKILLS" tier

STEP 4: EVALUATE THE 4 CORE COMPETENCY CATEGORIES (NEED 1-2)
   For each category, rate as Strong/Moderate/Weak based on resume evidence:

   A. PHYSICAL LABOR & MATERIAL HANDLING: Loading/unloading, lifting/carrying (40-50+ lbs), pulling orders, stocking, pallet jack/forklift, moving equipment
   B. WAREHOUSE & INVENTORY TASKS: Picking/packing, shipping & receiving, cycle counts, organizing stockrooms, labeling, barcode scanners, WMS
   C. RELIABILITY & WORK ETHIC: Attendance, working independently, safety procedures, time management, team collaboration, varied shifts
   D. FAST-PACED OR REPETITIVE WORK: Manufacturing lines, distribution centers, retail backroom, labor-intensive high volume, quotas, time pressure

   Remember: Candidates need strong evidence in 1-2 categories, NOT all 4

STEP 5: CHECK FOR NON-TRANSFERABLE ROLES
   a) Identify if candidate has ONLY office/administrative, professional, creative, medical/scientific, or technology roles
   b) Examples: Director, Manager, Accountant, Engineer, Hairdresser, Artist, Doctor, Biologist, Developer
   c) These should score low (Red tier) UNLESS they have additional warehouse/labor experience

STEP 6: EVALUATE CERTIFICATIONS & SKILLS (BONUS)
   a) Look for: Forklift certification, Pallet jack, OSHA safety, Hazmat, WMS, RF scanner, CDL
   b) These are valuable but NOT required - give bonus points

STEP 7: EVALUATE RESUME QUALITY
   a) Check for clear job descriptions showing physical duties
   b) Check for proper formatting and no major errors
   c) Classify as: GOOD / MID / POOR

STEP 8: EVALUATE WORK GAPS
   a) Calculate gaps BETWEEN jobs
   b) Be lenient - entry-level roles should focus on overall work ethic
   c) Classify as: NO WORK GAP / SMALL WORK GAP / LARGE WORK GAP

STEP 9: EVALUATE JOB STABILITY
   a) Count number of employers and tenure length
   b) Be somewhat lenient - entry-level workers may have shorter tenures
   c) Classify as: NOT JOB HOPPY (1+ years per job) / JOB HOPPY (multiple jobs under 6 months each)

STEP 10: CALCULATE DISTANCE
   a) Use candidate location and job location
   b) Classify as: WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES

STEP 11: APPLY SCORING MATRIX
   a) Find the exact matching row in the scoring matrix based on:
      - Experience tier (Required / Close / Not Close with Labor / No Transferable Skills)
      - Resume quality (Good / Mid / Poor)
      - Work gap (No / Small / Large)
      - Job stability (Not hoppy / Job hoppy)
      - Distance (<30mi / 30-50mi / >50mi)
   b) Select a score within the specified range
   c) If flexibility is OFF and candidate has equivalent (not exact "Warehouse Associate") title, subtract ${flexibleOnTitle ? 0 : 9} points

STEP 12: VERIFY ENTRY-LEVEL OPENNESS
   a) This is ENTRY-LEVEL and OPEN to large talent pool
   b) Accept retail AND labor-intensive roles
   c) Only heavily penalize those with NO transferable skills
   d) Focus on RELIABILITY, PHYSICAL CAPABILITY, and WORK ETHIC

Now, analyze the resume and provide a JSON response EXACTLY matching this structure:

{
  "overallScore": <integer 0-100>,
  "summary": "<concise 2-3 sentence summary>",
  "technicalSkills": {
    "score": <integer 0-100>,
    "found": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"],
    "feedback": "<feedback>"
  },
  "certifications": {
    "score": <integer 0-100>,
    "found": ["cert1", "cert2"],
    "recommended": ["cert1", "cert2"],
    "feedback": "<feedback>"
  },
  "experience": {
    "score": <integer 0-100>,
    "yearsOfExperience": <number>,
    "relevantExperience": ["exp1", "exp2"],
    "feedback": "<feedback>"
  },
  "presentationQuality": {
    "score": <integer 0-100>,
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "feedback": "<feedback>"
  },
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "recommendationSummary": "<2-3 sentence recommendation>",
  "hiringRecommendation": "<STRONG_YES|YES|MAYBE|NO|STRONG_NO>"
}`;

      } else if (useBookkeeperFramework) {
         // Use the detailed Bookkeeper evaluation framework
         const bookkeeperCriteria = getBookkeeperCriteria(requiredYearsExperience, flexibleOnTitle);

         prompt = `You are an expert recruiter specializing in Bookkeeper evaluation. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${bookkeeperCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: CHECK HARD REQUIREMENTS (BINARY FILTER)
   a) Review job post requirements
   b) Verify minimum years of bookkeeping/accounting experience
   c) Check for accounting software familiarity (QuickBooks, Xero, Sage, etc.)
   d) Verify basic accounting knowledge (journal entries, AP/AR, reconciliations)
   e) Check for any explicitly REQUIRED certifications
   f) If ANY hard requirement is missing, note it in evaluation

STEP 2: IDENTIFY ALL RELEVANT EXPERIENCE
   a) List EVERY bookkeeping, accounting clerk, or equivalent role with start/end dates
   b) Include Direct Experience: Bookkeeper, Bookkeeping Clerk, Accounting Clerk, AP/AR Clerk, Financial Clerk
   c) Include Strong Equivalents: Staff Accountant (entry-level), Payroll Clerk, Finance Assistant, Junior Accountant
   d) Include Conditional Equivalents ONLY if they show 2+ core competencies: Office Manager with financial duties, Administrative roles with bookkeeping
   e) For entry-level (0-1 years required): Accounting graduates qualify if recent (within 2 years)
   f) Calculate duration of EACH position in years and months
   g) SUM all durations to get TOTAL relevant experience

STEP 3: CLASSIFY EXPERIENCE TIER
   a) If TOTAL years >= ${requiredYearsExperience}: This is "REQUIRED EXPERIENCE" tier
   b) If TOTAL years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: This is "CLOSE TO REQUIRED" tier
   c) If TOTAL years < ${requiredYearsExperience * 0.5}: This is "NOT CLOSE TO REQUIRED" tier

STEP 4: EVALUATE THE 4 CORE COMPETENCY CATEGORIES (MUST HAVE 2+)
   For each category, rate as Strong/Moderate/Weak based on resume evidence:

   A. FINANCIAL RECORDKEEPING: Recording transactions (debits/credits), reconciling bank statements, AP/AR, payroll entry, general ledger, journal entries
   B. ACCOUNTING SOFTWARE & TOOLS: QuickBooks/Xero/Sage, advanced Excel, financial reports (P&L, Balance Sheet), billing/invoicing
   C. COMPLIANCE & ACCURACY: Accurate recordkeeping, accounting policies, audit support, documentation, GAAP, tax prep support
   D. ORGANIZATION & MULTI-TASKING: Managing multiple accounts, tracking deadlines, attention to detail, month/year-end close, independent work

   CRITICAL: Candidates MUST show Strong evidence in 2+ categories (NOT flexible like other positions)

STEP 5: EVALUATE ACCOUNTING SOFTWARE EXPERIENCE
   a) Look for: QuickBooks, Xero, Sage, FreshBooks, or other professional accounting software
   b) Classify as: SOFTWARE EXPERIENCE / NO SOFTWARE EXPERIENCE
   c) IMPORTANT: This is CRITICAL - heavy penalty without software experience
   d) Check for willingness to learn if no experience listed

STEP 6: EVALUATE EDUCATION & CERTIFICATIONS
   a) Look for: Accounting Degree, Certified Bookkeeper (CB), CPA, EA, QuickBooks Certification
   b) For entry-level: Recent accounting graduate (within 2 years) can qualify with 0-1 years experience
   c) Check for relevant coursework, internships, or part-time bookkeeping experience

STEP 7: EVALUATE RESUME QUALITY
   a) Look for financial accomplishments and quantified results (e.g., "managed $500K in AP/AR")
   b) Check for proper formatting, no typos, clear presentation
   c) Assess professionalism
   d) Classify as: GOOD / MID / POOR (use exact words from framework definitions)

STEP 8: EVALUATE WORK GAPS
   a) Calculate gaps BETWEEN jobs
   b) Overlapping jobs = NO GAP
   c) NOTE: Gaps in financial roles can be concerning
   d) Classify as: NO WORK GAP / SMALL WORK GAP / LARGE WORK GAP

STEP 9: EVALUATE JOB STABILITY
   a) Count number of employers and tenure length
   b) Bookkeepers need 2+ years per employer (time to learn systems and build trust)
   c) Classify as: NOT JOB HOPPY / JOB HOPPY (multiple jobs under 1.5 years each)

STEP 10: CALCULATE DISTANCE
   a) Use candidate location and job location
   b) Classify as: WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES
   c) NOTE: Bookkeepers typically work on-site

STEP 11: APPLY SCORING MATRIX
   a) Find the exact matching row in the scoring matrix based on:
      - Experience tier (Required / Close to Required / Not Close)
      - Resume quality (Good / Mid / Poor)
      - Software experience (Has software / No software)
      - Work gap (No / Small / Large)
      - Job stability (Not hoppy / Job hoppy)
      - Distance (<30mi / 30-50mi / >50mi)
   b) Select a score within the specified range
   c) If flexibility is OFF and candidate has equivalent (not exact "Bookkeeper") title, subtract ${flexibleOnTitle ? 0 : 9} points

STEP 12: VERIFY RIGID EVALUATION
   a) Experience reigns supreme - this is a RIGID evaluation
   b) Candidates MUST show 2+ core competencies
   c) Software experience is CRITICAL
   d) Accounting/Bookkeeping/Financial experience is REQUIRED

Now, analyze the resume and provide a JSON response EXACTLY matching this structure:

{
  "overallScore": <integer 0-100>,
  "summary": "<concise 2-3 sentence summary>",
  "technicalSkills": {
    "score": <integer 0-100>,
    "found": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"],
    "feedback": "<feedback>"
  },
  "certifications": {
    "score": <integer 0-100>,
    "found": ["cert1", "cert2"],
    "recommended": ["cert1", "cert2"],
    "feedback": "<feedback>"
  },
  "experience": {
    "score": <integer 0-100>,
    "yearsOfExperience": <number>,
    "relevantExperience": ["exp1", "exp2"],
    "feedback": "<feedback>"
  },
  "presentationQuality": {
    "score": <integer 0-100>,
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "feedback": "<feedback>"
  },
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "recommendationSummary": "<2-3 sentence recommendation>",
  "hiringRecommendation": "<STRONG_YES|YES|MAYBE|NO|STRONG_NO>"
}`;

      } else if (useApprenticeFramework) {
         // Use the detailed Apprentice evaluation framework
         const apprenticeCriteria = getApprenticeCriteria(requiredYearsExperience, flexibleOnTitle);

         prompt = `You are an expert recruiter specializing in Apprentice evaluation for trade positions. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${apprenticeCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: CHECK HARD REQUIREMENTS (BINARY FILTER)
   a) Review job post requirements
   b) Verify physical requirements: Can lift 50+ lbs, work in various conditions
   c) Verify any explicitly REQUIRED certifications (not just "preferred")
   d) If ANY hard requirement is missing, flag the candidate as "DOES NOT MEET REQUIREMENTS"

STEP 2: IDENTIFY ALL RELEVANT EXPERIENCE
   a) List EVERY apprentice, trainee, helper, or equivalent role with start/end dates
   b) Include Strong Equivalents: Trade Apprentice (any trade), Trainee Technician, Junior Technician, Helper, Entry-Level Technician, Field Service Assistant
   c) Include Conditional Equivalents IF they show evidence of 1-2 core competencies: General Laborer, Construction Helper, Manufacturing Worker, Warehouse Associate, Service Helper, Maintenance Helper, Technical Intern
   d) Calculate duration of EACH position in years and months
   e) SUM all durations to get TOTAL relevant experience

STEP 3: CLASSIFY EXPERIENCE TIER
   a) If TOTAL years >= ${requiredYearsExperience}: This is "REQUIRED EXPERIENCE" tier
   b) If TOTAL years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: This is "CLOSE TO REQUIRED" tier
   c) If TOTAL years < ${requiredYearsExperience * 0.5}: This is "NOT CLOSE TO REQUIRED" tier

STEP 4: EVALUATE THE 4 CORE COMPETENCY CATEGORIES
   For each category, rate as Strong/Moderate/Weak based on resume evidence:

   A. LEARNING & TECHNICAL DEVELOPMENT: Look for hands-on training, following instructions, operating tools, safety procedures, technical school
   B. PHYSICAL & MANUAL SKILLS: Look for lifting/carrying, installations/repairs, repetitive tasks, working in various conditions, physical stamina
   C. RELIABILITY & WORK ETHIC: Look for attendance, willingness to learn, teamwork, professional attitude, positive references
   D. ADAPTABILITY & PROGRESSION: Look for taking on new tasks, learning tools/procedures, progression under mentorship, growth in responsibilities

   Remember: Candidates need strong evidence in 1-2 categories, NOT all 4

STEP 5: EVALUATE CERTIFICATIONS
   a) Look for: OSHA 10/30, EPA 608, trade school diploma, technical certifications, First Aid/CPR, Forklift, safety certifications
   b) Classify as: CERTIFICATIONS LISTED / CERTIFICATIONS NOT LISTED
   c) IMPORTANT: Certifications are HIGHLY VALUED for this entry-level position
   d) Candidates with NO experience but certifications should score 60-75 (Yellow tier, "Give Them a Chance")

STEP 6: EVALUATE RESUME QUALITY
   a) Count typos, grammar errors, formatting issues
   b) Check for proper bullets under each job experience (2+ bullets = good)
   c) Assess overall professionalism
   d) Classify as: GOOD / MID / POOR (use exact words from framework definitions)

STEP 7: EVALUATE WORK GAPS
   a) Calculate gaps BETWEEN jobs
   b) Overlapping jobs = NO GAP (positive)
   c) Recent graduates should NOT be heavily penalized for gaps
   d) Classify as: NO WORK GAP / SMALL WORK GAP / LARGE WORK GAP

STEP 8: EVALUATE JOB STABILITY
   a) Count number of employers and tenure length
   b) Entry-level workers may have shorter tenures - be lenient
   c) Classify as: NOT JOB HOPPY / JOB HOPPY

STEP 9: CALCULATE DISTANCE
   a) Use candidate location and job location
   b) Classify as: WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES

STEP 10: APPLY SCORING MATRIX
   a) Find the exact matching row in the scoring matrix based on:
      - Experience tier (Required / Close to Required / Not Close)
      - Resume quality (Good / Mid / Poor)
      - Certifications (Listed / Not Listed)
      - Work gap (No / Small / Large)
      - Job stability (Not hoppy / Job hoppy)
      - Distance (<30mi / 30-50mi / >50mi)
   b) Select a score within the specified range
   c) If flexibility is OFF and candidate has equivalent (not exact "Apprentice") title, subtract ${flexibleOnTitle ? 0 : 9} points

STEP 11: VERIFY "GIVE THEM A CHANCE" CANDIDATES
   a) This is the most entry-level position - many candidates should be in "Give Them a Chance" tier
   b) Score range 60-79 = Yellow tier = "Give Them a Chance"
   c) Focus on POTENTIAL and TRAINABILITY

Now, analyze the resume and provide a JSON response EXACTLY matching this structure:

{
  "overallScore": <integer 0-100>,
  "summary": "<concise 2-3 sentence summary>",
  "technicalSkills": {
    "score": <integer 0-100>,
    "found": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"],
    "feedback": "<feedback>"
  },
  "certifications": {
    "score": <integer 0-100>,
    "found": ["cert1", "cert2"],
    "recommended": ["cert1", "cert2"],
    "feedback": "<feedback>"
  },
  "experience": {
    "score": <integer 0-100>,
    "yearsOfExperience": <number>,
    "relevantExperience": ["exp1", "exp2"],
    "feedback": "<feedback>"
  },
  "presentationQuality": {
    "score": <integer 0-100>,
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "feedback": "<feedback>"
  },
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "recommendationSummary": "<2-3 sentence recommendation>",
  "hiringRecommendation": "<STRONG_YES|YES|MAYBE|NO|STRONG_NO>"
}`;

      } else if (useCustomerServiceRepFramework) {
         // Use the detailed Customer Service Representative evaluation framework
         const csrCriteria = getCustomerServiceRepCriteria(requiredYearsExperience, flexibleOnTitle);

         prompt = `You are an expert recruiter specializing in Customer Service Representative evaluation. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${csrCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: IDENTIFY ALL RELEVANT EXPERIENCE
   a) List EVERY Customer Service Representative or equivalent role with start/end dates
   b) Include: CSR, Call Center Rep, Front Desk Associate, Receptionist, Retail Associate, Server/Waitstaff, Hospitality Staff, Sales Associate, Support Specialist, Help Desk Agent
   c) For Conditional Equivalents (Administrative Assistant, Office Assistant, Dispatcher, Scheduler, Inside Sales, Warehouse, Cashier, Medical Office, Appointment Coordinator), verify transferable skills in resume using the 4 core competencies
   d) Calculate duration of EACH position in years and months
   e) SUM all durations to get TOTAL relevant experience

STEP 2: CLASSIFY EXPERIENCE TIER
   a) If TOTAL years >= ${requiredYearsExperience}: This is "REQUIRED EXPERIENCE" tier
   b) If TOTAL years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: This is "CLOSE TO REQUIRED" tier
   c) If TOTAL years < ${requiredYearsExperience * 0.5}: This is "NOT CLOSE TO REQUIRED" tier

STEP 3: EVALUATE THE 4 CORE COMPETENCY CATEGORIES
   For each category, rate as Strong/Moderate/Weak based on resume evidence:

   A. CUSTOMER INTERACTION & COMMUNICATION: Look for call handling, assisting customers, professional communication, first point of contact
   B. PROBLEM SOLVING & ISSUE RESOLUTION: Look for de-escalation, troubleshooting, returns/refunds, dispute resolution
   C. SYSTEMS, TOOLS & DOCUMENTATION: Look for CRM systems, logging interactions, ticketing, accurate documentation
   D. HIGH-VOLUME / FAST-PACED WORK: Look for call center, retail/hospitality peak hours, handling multiple customers, queue management

   Remember: Candidates need strong evidence in 2+ categories, NOT all 4

STEP 4: EVALUATE RESUME QUALITY
   a) Count typos, grammar errors, formatting issues
   b) Check for proper bullets under each job experience
   c) Assess overall professionalism
   d) Classify as: GOOD / MID / POOR (use exact words from framework definitions)

STEP 5: CHECK FOR CERTIFICATIONS
   a) Look for: Customer Service certifications, call center certifications, industry training, conflict resolution training
   b) Classify as: CERTIFICATIONS LISTED / CERTIFICATIONS NOT LISTED

STEP 6: EVALUATE WORK GAPS
   a) Calculate gaps BETWEEN jobs (not career transitions)
   b) Overlapping jobs = NO GAP
   c) Classify as: NO WORK GAP / SMALL WORK GAP / LARGE WORK GAP

STEP 7: EVALUATE JOB STABILITY (CRITICAL - BE STRICT FOR OFFICE ROLES)
   a) List EACH job with exact tenure in months
   b) Count how many jobs lasted UNDER 1 YEAR (12 months)
   c) JOB HOPPY if ANY of these apply:
      - 2+ jobs lasted less than 1 year (12 months) - AUTOMATIC job hoppy
      - Pattern of leaving jobs quickly
      - Multiple short tenures showing instability
   d) NOT JOB HOPPY if:
      - Only 0-1 jobs under 1 year
      - Most jobs are 1.5+ years each
      - Stable employment pattern overall
   e) REMEMBER: Office/customer service roles need time to learn systems and build value - 2 jobs under 1 year is a red flag
   f) Classify as: NOT JOB HOPPY / JOB HOPPY

STEP 8: CALCULATE DISTANCE
   a) Use candidate location and job location
   b) Classify as: WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES

STEP 9: APPLY SCORING MATRIX (MUST USE EXACT MATRIX ROW)
   a) Find the EXACT matching row in the scoring matrix based on ALL factors:
      - Experience Tier (REQUIRED / CLOSE TO REQUIRED / NOT CLOSE TO REQUIRED)
      - Resume Quality (GOOD / MID / POOR)
      - Certifications (LISTED / NOT LISTED)
      - Work Gap (NO / SMALL / LARGE)
      - Job Stability (NOT JOB HOPPY / JOB HOPPY)
      - Distance (WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES)
   b) Use the MIDDLE of the score range for that exact row
   c) Adjust ONLY slightly (+/- 2 points max) within the range based on strong positives/negatives
   d) NEVER score outside the range for your matrix row
   e) Document which exact matrix row you used in "scoringMatrixRow" field

REQUIRED JSON OUTPUT FORMAT:
{
  "overallScore": <number 1-100>,
  "tier": "<green|yellow|red>",
  "experienceTier": "<REQUIRED EXPERIENCE|CLOSE TO REQUIRED|NOT CLOSE TO REQUIRED>",
  "totalRelevantYears": <number>,
  "resumeQuality": "<GOOD RESUME|MID RESUME|POOR RESUME>",
  "certificationsListed": <boolean>,
  "workGap": "<NO WORK GAP|SMALL WORK GAP|LARGE WORK GAP>",
  "jobStability": "<NOT JOB HOPPY|JOB HOPPY>",
  "distance": "<WITHIN 30 MILES|30-50 MILES|OVER 50 MILES>",
  "coreCompetencies": {
    "customerInteractionCommunication": "<Strong|Moderate|Weak>",
    "problemSolvingIssueResolution": "<Strong|Moderate|Weak>",
    "systemsToolsDocumentation": "<Strong|Moderate|Weak>",
    "highVolumeFastPaced": "<Strong|Moderate|Weak>"
  },
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendationSummary": "<2-3 sentence summary>",
  "matchingExperience": ["<job title 1 - duration>", "<job title 2 - duration>"],
  "scoringMatrixRow": "<exact row from matrix that was used>",
  "scoringReasoning": "<brief explanation of why this score was chosen>"
}

CRITICAL RULES:
- ALWAYS use the scoring matrix - never guess scores
- The score MUST fall within the range specified by the matching matrix row
- Be consistent: same candidate profile = same score
- Count ALL relevant experience across different job titles
- Focus on transferable skills and customer-facing activities, not just job titles (unless flexibility is OFF)
- ALWAYS provide complete JSON response`;

      } else if (useAdminAssistantFramework) {
         // Use the detailed Administrative Assistant evaluation framework
         const adminCriteria = getAdminAssistantCriteria(requiredYearsExperience, flexibleOnTitle);

         prompt = `You are an expert recruiter specializing in Administrative Assistant evaluation. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${adminCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: IDENTIFY ALL RELEVANT EXPERIENCE
   a) List EVERY Administrative Assistant or equivalent role with start/end dates
   b) Include: Office Administrator, Office Assistant, Receptionist, Secretary, Executive Assistant, Front Desk Coordinator, CSR, Scheduling Coordinator, Operations Assistant
   c) For Conditional Equivalents (Retail, Inside Sales, Hospitality, Call Center, Medical Office, Warehouse Office), verify transferable skills in resume using the 4 core competencies
   d) Calculate duration of EACH position in years and months
   e) SUM all durations to get TOTAL relevant experience

STEP 2: CLASSIFY EXPERIENCE TIER
   a) If TOTAL years >= ${requiredYearsExperience}: This is "REQUIRED EXPERIENCE" tier
   b) If TOTAL years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: This is "CLOSE TO REQUIRED" tier
   c) If TOTAL years < ${requiredYearsExperience * 0.5}: This is "NOT CLOSE TO REQUIRED" tier

STEP 3: EVALUATE THE 4 CORE COMPETENCY CATEGORIES
   For each category, rate as Strong/Moderate/Weak based on resume evidence:

   A. ADMINISTRATIVE OPERATIONS: Look for scheduling, calendar management, filing, data entry, front desk duties, office supply management
   B. COMMUNICATION & CUSTOMER INTERACTION: Look for phone handling, email communication, customer assistance, greeting visitors
   C. DOCUMENTATION & OFFICE TOOLS: Look for document prep, spreadsheets, CRM/database experience, Microsoft Office proficiency
   D. MULTI-TASKING: Look for supporting multiple team members, busy office environment, prioritizing tasks, managing deadlines

   Remember: Candidates need strong evidence in 2+ categories, NOT all 4

STEP 4: EVALUATE RESUME QUALITY
   a) Count typos, grammar errors, formatting issues
   b) Check for proper bullets under each job experience
   c) Assess overall professionalism
   d) Classify as: GOOD / MID / POOR (use exact words from framework definitions)

STEP 5: CHECK FOR CERTIFICATIONS
   a) Look for: Microsoft Office Specialist (MOS), Administrative Professional Certification, project management certs
   b) Classify as: CERTIFICATIONS LISTED / CERTIFICATIONS NOT LISTED

STEP 6: EVALUATE WORK GAPS
   a) Calculate gaps BETWEEN jobs (not career transitions)
   b) Overlapping jobs = NO GAP
   c) Classify as: NO WORK GAP / SMALL WORK GAP / LARGE WORK GAP

STEP 7: EVALUATE JOB STABILITY (CRITICAL - BE STRICT FOR OFFICE ROLES)
   a) List EACH job with exact tenure in months
   b) Count how many jobs lasted UNDER 1 YEAR (12 months)
   c) JOB HOPPY if ANY of these apply:
      - 2+ jobs lasted less than 1 year (12 months) - AUTOMATIC job hoppy
      - Pattern of leaving jobs quickly
      - Multiple short tenures showing instability
   d) NOT JOB HOPPY if:
      - Only 0-1 jobs under 1 year
      - Most jobs are 1.5+ years each
      - Stable employment pattern overall
   e) REMEMBER: Administrative roles need time to learn company systems and procedures - 2 jobs under 1 year is a red flag
   f) Classify as: NOT JOB HOPPY / JOB HOPPY

STEP 8: CALCULATE DISTANCE
   a) Use candidate location and job location
   b) Classify as: WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES

STEP 9: APPLY SCORING MATRIX (MUST USE EXACT MATRIX ROW)
   a) Find the EXACT matching row in the scoring matrix based on ALL factors:
      - Experience Tier (REQUIRED / CLOSE TO REQUIRED / NOT CLOSE TO REQUIRED)
      - Resume Quality (GOOD / MID / POOR)
      - Certifications (LISTED / NOT LISTED)
      - Work Gap (NO / SMALL / LARGE)
      - Job Stability (NOT JOB HOPPY / JOB HOPPY)
      - Distance (WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES)
   b) Use the MIDDLE of the score range for that exact row
   c) Adjust ONLY slightly (+/- 2 points max) within the range based on strong positives/negatives
   d) NEVER score outside the range for your matrix row
   e) Document which exact matrix row you used in "scoringMatrixRow" field

REQUIRED JSON OUTPUT FORMAT:
{
  "overallScore": <number 1-100>,
  "tier": "<green|yellow|red>",
  "experienceTier": "<REQUIRED EXPERIENCE|CLOSE TO REQUIRED|NOT CLOSE TO REQUIRED>",
  "totalRelevantYears": <number>,
  "resumeQuality": "<GOOD RESUME|MID RESUME|POOR RESUME>",
  "certificationsListed": <boolean>,
  "workGap": "<NO WORK GAP|SMALL WORK GAP|LARGE WORK GAP>",
  "jobStability": "<NOT JOB HOPPY|JOB HOPPY>",
  "distance": "<WITHIN 30 MILES|30-50 MILES|OVER 50 MILES>",
  "coreCompetencies": {
    "administrativeOperations": "<Strong|Moderate|Weak>",
    "communicationCustomerInteraction": "<Strong|Moderate|Weak>",
    "documentationOfficeTools": "<Strong|Moderate|Weak>",
    "multiTasking": "<Strong|Moderate|Weak>"
  },
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendationSummary": "<2-3 sentence summary>",
  "matchingExperience": ["<job title 1 - duration>", "<job title 2 - duration>"],
  "scoringMatrixRow": "<exact row from matrix that was used>",
  "scoringReasoning": "<brief explanation of why this score was chosen>"
}

CRITICAL RULES:
- ALWAYS use the scoring matrix - never guess scores
- The score MUST fall within the range specified by the matching matrix row
- Be consistent: same candidate profile = same score
- Count ALL relevant experience across different job titles
- Focus on transferable skills, not just job titles (unless flexibility is OFF)
- ALWAYS provide complete JSON response`;

      } else if (useDispatcherFramework) {
         // Use the detailed dispatcher evaluation framework
         const dispatcherCriteria = getDispatcherCriteria(requiredYearsExperience, flexibleOnTitle);

         prompt = `You are an expert HVAC industry recruiter specializing in Dispatcher evaluation. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${dispatcherCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: IDENTIFY ALL RELEVANT EXPERIENCE
   a) List EVERY dispatcher or equivalent role with start/end dates
   b) Include: Dispatcher, Service Coordinator, Scheduler, Office Administrator, Administrative Assistant, CSR with scheduling, Receptionist with scheduling, Call Center Rep
   c) For Conditional Equivalents (Retail, Inside Sales, Front Desk, Hospitality), verify transferable skills in resume
   d) Calculate duration of EACH position in years and months
   e) SUM all durations to get TOTAL relevant experience

STEP 2: CLASSIFY EXPERIENCE TIER
   a) If TOTAL years >= ${requiredYearsExperience}: This is "REQUIRED EXPERIENCE" tier
   b) If TOTAL years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: This is "CLOSE TO REQUIRED" tier
   c) If TOTAL years < ${requiredYearsExperience * 0.5}: This is "NOT CLOSE TO REQUIRED" tier

STEP 3: EVALUATE THE 4 SKILL CATEGORIES
   For each category, rate as Strong/Moderate/Weak based on resume evidence:

   A. SCHEDULING & COORDINATION: Look for dispatching, appointment coordination, calendar management, route optimization
   B. CUSTOMER INTERACTION: Look for call handling, complaint management, customer service
   C. HIGH-VOLUME ENVIRONMENT: Look for call center, busy office, multitasking evidence
   D. ADMINISTRATIVE COMPETENCY: Look for data entry, CRM usage, documentation, billing

STEP 4: ASSESS RESUME QUALITY (BE OBJECTIVE)
   a) GOOD RESUME = Professional formatting + No major typos + No grammar errors + 2+ substantive bullets per position
   b) MID RESUME = Professional formatting BUT missing bullets OR few errors OR limited content
   c) POOR RESUME = Multiple errors AND poor formatting AND lacks substantive content

STEP 5: CHECK FOR WORK GAPS
   a) List ALL employment periods
   b) Calculate gaps between jobs
   c) NO WORK GAP = Gaps under 6 months
   d) SMALL WORK GAP = 6 months to 1 year
   e) LARGE WORK GAP = Over 1 year

STEP 6: ASSESS JOB STABILITY (CRITICAL - BE STRICT FOR DISPATCHER ROLES)
   a) List EACH job with exact tenure in months
   b) Count how many jobs lasted UNDER 1 YEAR (12 months)
   c) JOB HOPPY if ANY of these apply:
      - 2+ jobs lasted less than 1 year (12 months) - AUTOMATIC job hoppy
      - Pattern of leaving jobs quickly
      - Multiple short tenures showing instability
   d) NOT JOB HOPPY if:
      - Only 0-1 jobs under 1 year
      - Most jobs are 1.5+ years each
      - Stable employment pattern overall
   e) REMEMBER: Dispatchers need time to learn service areas, technician teams, and company operations - 2 jobs under 1 year is a red flag
   f) Classify as: NOT JOB HOPPY / JOB HOPPY

STEP 7: CHECK FOR OVERQUALIFICATION
   a) Compare candidate's most recent or highest job title to the Dispatcher position
   b) OVERQUALIFIED if applying DOWN from senior roles:
      - HVAC: General Manager/Operations Director/Service Manager → Dispatcher
      - Director/VP/Manager (any field) → Dispatcher/CSR/Administrative roles
      - Department Head/Senior Management → Entry-level positions
   c) NOT OVERQUALIFIED if:
      - Same level position (Admin → Dispatcher, CSR → Dispatcher)
      - Technician → Dispatcher (career change, not demotion)
      - Lateral administrative moves
   d) If OVERQUALIFIED: Score becomes 70-75 REGARDLESS of other factors, skip to Step 10

STEP 8: APPLY THE RUBRIC (if not overqualified)
   a) Use experience tier from Step 2
   b) Use resume quality from Step 4
   c) Use work gap from Step 5
   d) Use job stability from Step 6
   e) Find the EXACT matching line in the rubric
   f) Assign score within that range

STEP 9: APPLY FLEXIBILITY PENALTY (IF APPLICABLE)
   ${flexibleOnTitle ?
               'Flexibility is ON - No penalty applies. Equivalent roles score the same as direct dispatcher experience.' :
               `Flexibility is OFF - If candidate's experience is from equivalent roles (not exact "Dispatcher" title), SUBTRACT 9 points from the final score. Minimum score is 1.`}

STEP 10: VALIDATE YOUR ANSWER
   a) If overqualified, score must be 70-75
   b) Double-check experience tier matches total years
   c) Verify score matches rubric for the combination of factors
   d) Ensure penalty was applied correctly if flexibility is OFF

Provide your evaluation in the following JSON format:

{
  "overallScore": <number 0-100 based on the tiered framework${flexibleOnTitle ? '' : ', with -9 penalty applied if using equivalent roles'}>,
  "isOverqualified": <true if candidate is overqualified per Step 7, false otherwise>,
  "overqualificationReason": "<if overqualified, explain which senior title is applying to which lower position, otherwise null>",
  "summary": "<brief 3-sentence summary explaining the score, highlighting dispatcher-relevant experience and transferable skills. If overqualified, mention this in the summary.>",
  "technicalSkills": {
    "score": <number 0-100>,
    "found": ["<list of dispatcher-relevant skills found: software, phone systems, scheduling tools>"],
    "missing": ["<important dispatcher skills missing>"],
    "feedback": "<specific feedback on technical competencies for dispatcher role>"
  },
  "transferableSkills": {
    "schedulingCoordination": "<Strong/Moderate/Weak - with evidence>",
    "customerInteraction": "<Strong/Moderate/Weak - with evidence>",
    "highVolumeEnvironment": "<Strong/Moderate/Weak - with evidence>",
    "administrativeCompetency": "<Strong/Moderate/Weak - with evidence>",
    "feedback": "<overall assessment of transferable skills>"
  },
  "experience": {
    "score": <number 0-100>,
    "yearsOfExperience": <number>,
    "directDispatcherYears": <number - years with exact dispatcher title>,
    "equivalentRoleYears": <number - years in equivalent roles>,
    "relevantExperience": ["<list relevant dispatcher/equivalent experience with years at each role>"],
    "feedback": "<specific feedback on experience level, work gaps, job stability>"
  },
  "presentationQuality": {
    "score": <number 0-100>,
    "strengths": ["<formatting, clarity, professionalism strengths>"],
    "improvements": ["<areas to improve>"],
    "feedback": "<specific feedback on resume quality>"
  },
  "strengths": ["<top 3-5 strengths relevant to Dispatcher role>"],
  "weaknesses": ["<top 3-5 weaknesses or gaps for this position>"],
  "recommendations": ["<3-5 specific recommendations for improvement>"],
  "hiringRecommendation": "<STRONG_YES (90-100)|YES (80-89)|MAYBE (50-79)|NO (20-49)|STRONG_NO (0-19)>"
}

IMPORTANT: Your overallScore MUST align with the tier ranges (Green: 80-100, Yellow: 50-79, Red: 0-49). Be consistent and fair.`;
      } else if (useServiceTechFramework) {
         // Use the detailed tiered evaluation framework
         const serviceTechCriteria = getServiceTechnicianCriteria(requiredYearsExperience);

         prompt = `You are an expert HVAC industry recruiter specializing in Service Technician evaluation. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${serviceTechCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: CALCULATE TOTAL HVAC EXPERIENCE
   a) List EVERY HVAC-related job position with start/end dates
   b) Calculate the duration of EACH position in years and months
   c) SUM all durations to get TOTAL HVAC experience
   d) IMPORTANT: Count ALL HVAC roles including: Service Technician, Maintenance Tech, Install Tech, HVAC Technician, Self-employed HVAC, etc.
   e) Example: If someone has "Sept 2021-Present (4 years)" + "Oct 2017-Sept 2021 (4 years)" = 8 years TOTAL
   f) Do NOT count non-HVAC jobs (electrician, delivery, etc.) unless they have significant HVAC components

STEP 2: CLASSIFY EXPERIENCE TIER (CRITICAL - DO NOT SKIP)
   a) If TOTAL years >= ${requiredYearsExperience}: This is "REQUIRED EXPERIENCE" tier
   b) If TOTAL years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: This is "CLOSE TO REQUIRED" tier
   c) If TOTAL years < ${requiredYearsExperience * 0.5}: This is "NOT CLOSE TO REQUIRED" tier
   d) ALWAYS use TOTAL years from Step 1, not just the most recent position

STEP 3: FIND ALL CERTIFICATIONS
   a) Search the ENTIRE resume including: header, summary, certifications section, AND within job descriptions
   b) Look for: EPA 608, 410A, NATE, state licenses, manufacturer certifications, HVAC Excellence, etc.
   c) Create a complete list of ALL certifications found
   d) Mark as "Certifications Listed" if ANY HVAC certifications are found
   e) Mark as "Certifications NOT Listed" ONLY if zero certifications are mentioned

STEP 4: ASSESS RESUME QUALITY (BE OBJECTIVE)
   a) GOOD RESUME = Professional formatting + No major typos + No grammar errors + 2+ substantive bullets per position
   b) MID RESUME = Professional formatting BUT missing bullets OR few grammatical errors OR small formatting issues
   c) POOR RESUME = Multiple typos AND multiple grammar errors AND poor formatting AND no substantive content
   d) When in doubt between Good and Mid, choose Good if the resume is professionally presented

STEP 5: CHECK FOR WORK GAPS
   a) List ALL employment periods (HVAC and non-HVAC)
   b) Calculate gaps between jobs (unemployment periods with NO job listed)
   c) NO WORK GAP = Gaps under 6 months OR overlapping jobs OR currently employed with no prior gaps
   d) SMALL WORK GAP = 6 months to 1 year of unemployment
   e) LARGE WORK GAP = Over 1 year of unemployment

STEP 6: ASSESS JOB STABILITY
   a) Count number of HVAC employers (not positions, but different companies)
   b) Calculate average tenure at each employer
   c) NOT JOB HOPPY = Long tenures (2+ years per employer) OR few employers relative to career length
   d) JOB HOPPY = Many employers with short tenures (under 1 year each) OR 5+ employers in 5 years

STEP 7: CHECK FOR OVERQUALIFICATION
   a) Compare candidate's most recent or highest job title to the position being applied for
   b) OVERQUALIFIED if applying DOWN from senior roles:
      - HVAC: General Manager/Director/Service Manager → Dispatcher/Technician/Entry-level
      - Lead/Senior Technician → Maintenance Technician/Helper
      - Director/VP/Manager (any field) → Administrative/Clerical/CSR/Entry-level
   c) NOT OVERQUALIFIED if:
      - Same level position (Technician → Technician, even with 10+ years)
      - Lateral move (Office Admin → Dispatcher)
      - Step up (Helper → Technician)
   d) If OVERQUALIFIED: Score becomes 70-75 REGARDLESS of other factors

STEP 8: APPLY THE RUBRIC (if not overqualified)
   a) Use the experience tier from Step 2
   b) Use resume quality from Step 4
   c) Use certifications status from Step 3
   d) Use work gap status from Step 5
   e) Use job stability from Step 6
   f) Find the EXACT matching line in the rubric above
   g) Assign a score within that specific range

STEP 9: VALIDATE YOUR ANSWER
   a) If overqualified, score must be 70-75
   b) Double-check that your experience tier matches the total years calculated
   c) Verify the score matches the rubric line for the combination of factors
   d) If the candidate has 4X the required experience, they should score 80+ (unless major red flags or overqualified)

4. Provide your evaluation in the following JSON format:

{
  "overallScore": <number 0-100 based on the tiered framework>,
  "isOverqualified": <true if candidate is overqualified per Step 7, false otherwise>,
  "overqualificationReason": "<if overqualified, explain which senior title is applying to which lower position, otherwise null>",
  "summary": "<brief 3-sentence summary explaining why the candidate received their score, which resume highlights influenced it, and any stand-out positives or negatives. If overqualified, mention this in the summary.>",
  "technicalSkills": {
    "score": <number 0-100>,
    "found": ["<list of HVAC-related skills found>"],
    "missing": ["<important HVAC skills missing>"],
    "feedback": "<specific feedback on technical competencies>"
  },
  "certifications": {
    "score": <number 0-100>,
    "found": ["<certifications found (EPA 608, NATE, etc.)>"],
    "recommended": ["<certifications they should pursue>"],
    "feedback": "<specific feedback on certifications>"
  },
  "experience": {
    "score": <number 0-100>,
    "yearsOfExperience": <number>,
    "relevantExperience": ["<list relevant HVAC experience with years at each role>"],
    "feedback": "<specific feedback on experience level, work gaps, job stability>"
  },
  "presentationQuality": {
    "score": <number 0-100>,
    "strengths": ["<formatting, clarity, professionalism strengths>"],
    "improvements": ["<areas to improve>"],
    "feedback": "<specific feedback on resume quality - typos, formatting, organization>"
  },
  "strengths": ["<top 3-5 strengths relevant to Service Technician role>"],
  "weaknesses": ["<top 3-5 weaknesses or gaps for this position>"],
  "recommendations": ["<3-5 specific recommendations for improvement>"],
  "hiringRecommendation": "<STRONG_YES (90-100)|YES (80-89)|MAYBE (50-79)|NO (20-49)|STRONG_NO (0-19)>"
}

IMPORTANT: Your overallScore MUST align with the tier ranges specified in the framework (Green: 80-100, Yellow: 50-79, Red: 0-49). Be consistent and fair in your evaluation.`;

      } else if (useLeadHVACTechFramework) {
         // Use the detailed Lead HVAC Technician evaluation framework with transferable skills
         const leadTechCriteria = getLeadHVACTechnicianCriteria(requiredYearsExperience, flexibleOnTitle);

         prompt = `You are an expert HVAC industry recruiter specializing in Lead HVAC Technician evaluation. You will use the detailed tiered evaluation framework below to analyze resumes with precision and consistency.

${leadTechCriteria.framework}

Resume Content:
${resumeText}

CRITICAL STEP-BY-STEP PARSING INSTRUCTIONS (FOLLOW EXACTLY):

STEP 1: IDENTIFY ALL RELEVANT LEAD/SENIOR HVAC EXPERIENCE
   a) List EVERY lead, senior, or equivalent HVAC role with start/end dates
   b) Include these STRONG EQUIVALENTS automatically:
      - Lead HVAC Technician (direct match)
      - Senior HVAC Technician
      - HVAC Service Technician (Level II or III)
      - HVAC Field Technician (Senior)
      - HVAC Installer (Lead or Senior Installer)
      - HVAC Maintenance Technician (Senior)
      - HVAC Foreman / HVAC Crew Lead
      - HVAC Team Lead
      - HVAC Service Specialist / Master Technician
      - Building Engineer (with HVAC-heavy workload)
      - Refrigeration Technician (senior roles)
      - HVAC Project Manager (with hands-on technical work)
      - Commercial HVAC Technician (senior level)
   c) ${flexibleOnTitle ?
               'FLEXIBILITY IS ON: Also accept HVAC Service Technician, HVAC Installer, or Maintenance Technician (without Lead/Senior in title) IF they demonstrate 3-4 core competency categories.' :
               'FLEXIBILITY IS OFF: Only accept titles with "Lead" or "Senior" in the title. Service Technicians/Installers/Maintenance Techs without Lead/Senior drop to Close tier and get -9 point penalty.'}
   d) Calculate duration of EACH position in years and months
   e) SUM all durations to get TOTAL relevant lead/senior experience

STEP 2: EVALUATE THE 4 CORE COMPETENCY CATEGORIES
   Analyze the resume for evidence in these categories (strong candidates show 3-4):

   A. ADVANCED HVAC DIAGNOSTICS & TECHNICAL MASTERY
      - Troubleshooting complex systems (RTUs, chillers, boilers, VRF/VRV)
      - Advanced electrical diagnostics and controls
      - Heat pumps, minisplits, gas furnaces, refrigeration
      - Commissioning, system testing, verification
      - Building automation systems (BAS)

   B. LEADERSHIP, MENTORSHIP & OVERSIGHT
      - Leading teams or job sites
      - Training/mentoring junior techs
      - Quality control and final inspections
      - Assigning tasks, overseeing work orders
      - Acting as senior point of contact
      - Managing schedules, coordinating crews

   C. CUSTOMER INTERACTION & JOB MANAGEMENT
      - Senior-level customer interaction
      - Quoting repairs, explaining technical issues
      - Coordinating with dispatch/office/managers
      - Handling escalations
      - High-accuracy documentation
      - Managing service agreements

   D. INSTALLATION, SERVICE & MAINTENANCE COMMAND
      - Advanced service AND installation tasks
      - Code compliance knowledge
      - Brazing, electrical work, line set work
      - Full system changeouts
      - Residential & light commercial experience
      - Ductwork design and modification

   Rate each category as: STRONG / MODERATE / WEAK

STEP 3: CLASSIFY EXPERIENCE TIER
   a) If TOTAL years >= ${requiredYearsExperience} in lead/senior role (or equivalent with 3-4 competencies): "REQUIRED EXPERIENCE" tier
   b) ${!flexibleOnTitle ?
               `If flexibility is OFF and candidate has ${requiredYearsExperience}+ years as Service Tech/Installer/Maintenance (without Lead/Senior title): "CLOSE TO REQUIRED" tier with -9 penalty` :
               ''}
   c) If TOTAL years is ${requiredYearsExperience * 0.5} to ${requiredYearsExperience * 0.95}: "CLOSE TO REQUIRED" tier
   d) If TOTAL years < ${requiredYearsExperience * 0.5}: "NOT CLOSE TO REQUIRED" tier

STEP 4: ASSESS RESUME QUALITY
   a) GOOD RESUME = Professional formatting + No major typos + No grammar errors + Substantive bullets describing accomplishments
   b) MID RESUME = Professional formatting BUT missing key elements or limited detail
   c) POOR RESUME = Multiple errors AND poor formatting AND lacks substantive content

STEP 5: CHECK FOR CERTIFICATIONS
   a) Search entire resume for: EPA 608 Universal, NATE, state/local licenses, manufacturer certs (Carrier, Trane, Lennox), OSHA
   b) EPA 608 Universal is CRITICAL for lead roles
   c) Mark as "Certifications Listed" if ANY relevant certs found
   d) Mark as "Certifications NOT Listed" if zero found

STEP 6: CHECK FOR WORK GAPS
   a) List ALL employment periods
   b) Calculate gaps between jobs (unemployment periods with NO job listed)
   c) NO WORK GAP = Gaps under 6 months OR overlapping jobs
   d) SMALL WORK GAP = 6 months to 1 year
   e) LARGE WORK GAP = Over 1 year
   f) Do NOT penalize career transitions INTO HVAC

STEP 7: ASSESS JOB STABILITY
   a) Count number of HVAC employers
   b) Calculate average tenure
   c) NOT JOB HOPPY = Long tenures (2+ years per employer)
   d) JOB HOPPY = Many employers with short tenures (under 1 year each)
   e) Do NOT penalize pre-HVAC job changes

STEP 8: CALCULATE DISTANCE
   a) Use candidate location if provided
   b) Classify as: WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES
   c) Be flexible around boundaries (32 miles ≈ 30 miles)

STEP 9: APPLY SCORING MATRIX
   a) Find the exact matching row based on:
      - Experience Tier (REQUIRED / CLOSE TO REQUIRED / NOT CLOSE TO REQUIRED)
      - Resume Quality (GOOD / MID / POOR)
      - Certifications (LISTED / NOT LISTED)
      - Work Gap (NO / SMALL / LARGE)
      - Job Stability (NOT JOB HOPPY / JOB HOPPY)
      - Distance (WITHIN 30 MILES / 30-50 MILES / OVER 50 MILES)
   b) ${!flexibleOnTitle ?
               'Apply -9 point penalty if candidate lacks "Lead" or "Senior" in title but would otherwise qualify for Required tier' :
               'No flexibility penalty - evaluate based on competencies'}
   c) Use the MIDDLE of the score range for that row
   d) Adjust slightly within range based on other factors

STEP 10: VALIDATE YOUR ANSWER
   a) Double-check experience tier matches total lead/senior years
   b) Verify score matches rubric for the combination of factors
   c) Ensure penalty was applied correctly if flexibility is OFF
   d) Verify competency evaluation is accurate

REQUIRED JSON OUTPUT FORMAT:
{
  "overallScore": <number 1-100>,
  "tier": "<green|yellow|red>",
  "experienceTier": "<REQUIRED EXPERIENCE|CLOSE TO REQUIRED|NOT CLOSE TO REQUIRED>",
  "totalRelevantYears": <number>,
  "resumeQuality": "<GOOD RESUME|MID RESUME|POOR RESUME>",
  "certificationsListed": <boolean>,
  "workGap": "<NO WORK GAP|SMALL WORK GAP|LARGE WORK GAP>",
  "jobStability": "<NOT JOB HOPPY|JOB HOPPY>",
  "distance": "<WITHIN 30 MILES|30-50 MILES|OVER 50 MILES|UNKNOWN>",
  "flexibilityPenaltyApplied": <boolean>,
  "coreCompetencies": {
    "advancedDiagnostics": "<Strong|Moderate|Weak>",
    "leadership": "<Strong|Moderate|Weak>",
    "customerManagement": "<Strong|Moderate|Weak>",
    "installationServiceCommand": "<Strong|Moderate|Weak>"
  },
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendationSummary": "<2-3 sentence summary>",
  "matchingExperience": ["<job title 1 - duration>", "<job title 2 - duration>"],
  "scoringMatrixRow": "<exact row from matrix that was used>",
  "scoringReasoning": "<brief explanation of why this score was chosen, including competency evaluation>"
}

CRITICAL RULES:
- ALWAYS use the scoring matrix - never guess scores
- The score MUST fall within the range specified by the matching matrix row
- Be consistent: same candidate profile = same score
- Evaluate based on COMPETENCIES and TRANSFERABLE SKILLS, not just exact job title
- Apply flexibility penalty correctly (-9 points when flexibility is OFF and candidate lacks Lead/Senior title)
- ALWAYS provide complete JSON response`;

      } else {
         // Use the original criteria for other positions
         const positionCriteria = getPositionCriteria(position);

         prompt = `You are an expert HVAC industry recruiter. Analyze the following resume for a ${positionCriteria.title} position and provide a detailed evaluation.

Resume Content:
${resumeText}

Please analyze this resume for the ${positionCriteria.title} position and provide your evaluation in the following JSON format:

{
  "overallScore": <number 0-100>,
  "summary": "<brief 2-3 sentence summary highlighting fit for ${positionCriteria.title} role>",
  "technicalSkills": {
    "score": <number 0-100>,
    "found": ["<list of relevant skills found for this position>"],
    "missing": ["<important skills missing for this position>"],
    "feedback": "<specific feedback for ${positionCriteria.title} role>"
  },
  "certifications": {
    "score": <number 0-100>,
    "found": ["<certifications found>"],
    "recommended": ["<certifications they should pursue for this role>"],
    "feedback": "<specific feedback>"
  },
  "experience": {
    "score": <number 0-100>,
    "yearsOfExperience": <number>,
    "relevantExperience": ["<list relevant experience for ${positionCriteria.title}>"],
    "feedback": "<specific feedback>"
  },
  "presentationQuality": {
    "score": <number 0-100>,
    "strengths": ["<formatting, clarity, professionalism strengths>"],
    "improvements": ["<areas to improve>"],
    "feedback": "<specific feedback>"
  },
  "strengths": ["<top 3-5 strengths relevant to ${positionCriteria.title}>"],
  "weaknesses": ["<top 3-5 weaknesses or gaps for this position>"],
  "recommendations": ["<3-5 specific recommendations for improvement>"],
  "hiringRecommendation": "<STRONG_YES|YES|MAYBE|NO|STRONG_NO>"
}

Key skills and qualifications to look for in a ${positionCriteria.title}:
${positionCriteria.keySkills.join('\n')}

Experience Guidelines:
${positionCriteria.experienceGuidelines}

Additional Evaluation Notes:
${positionCriteria.additionalNotes}

Provide thorough, honest, and actionable feedback specifically tailored to the ${positionCriteria.title} position requirements.`;
      }

      // Call Claude API
      const message = await anthropic.messages.create({
         model: "claude-3-sonnet-20240229",  // Using Claude 3 Sonnet for analysis
         max_tokens: 4096,
         temperature: 0,  // Set to 0 for deterministic, consistent grading
         messages: [{
            role: "user",
            content: prompt
         }]
      });

      // Parse the response
      const responseText = message.content[0].text;

      // Extract JSON from response (Claude might wrap it in markdown)
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         throw new Error('Failed to parse AI response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Convert overallScore (0-100) to scoreOutOf10
      analysis.scoreOutOf10 = Math.round(analysis.overallScore / 10);

      // Clean up the uploaded file after analysis
      await fs.unlink(filePath).catch(err => console.error('Error deleting file:', err));

      return analysis;

   } catch (error) {
      console.error('============ RESUME ANALYSIS ERROR ============');
      console.error('Error message:', error.message);
      console.error('Error type:', error.constructor.name);
      if (error.status) {
         console.error('API Status:', error.status);
      }
      if (error.error) {
         console.error('API Error details:', JSON.stringify(error.error, null, 2));
      }
      console.error('Stack trace:', error.stack);
      console.error('==============================================');
      throw error;
   }
}

module.exports = {
   analyzeResume
};
