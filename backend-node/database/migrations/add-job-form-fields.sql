-- Migration to add comprehensive job posting fields
-- Date: 2025-12-10

-- Add new fields to jobs table
ALTER TABLE jobs ADD COLUMN company_name TEXT;
ALTER TABLE jobs ADD COLUMN job_location_type TEXT; -- remote, on-site, hybrid
ALTER TABLE jobs ADD COLUMN city TEXT;
ALTER TABLE jobs ADD COLUMN zip_code TEXT;
ALTER TABLE jobs ADD COLUMN job_type TEXT; -- full_time, part_time, contract, temporary, temp_to_hire
ALTER TABLE jobs ADD COLUMN pay_range_min REAL;
ALTER TABLE jobs ADD COLUMN pay_range_max REAL;
ALTER TABLE jobs ADD COLUMN pay_type TEXT; -- hourly, yearly
ALTER TABLE jobs ADD COLUMN expected_hours TEXT;
ALTER TABLE jobs ADD COLUMN work_schedule TEXT;
ALTER TABLE jobs ADD COLUMN benefits TEXT; -- JSON array
ALTER TABLE jobs ADD COLUMN key_responsibilities TEXT; -- JSON array (3 items from user)
ALTER TABLE jobs ADD COLUMN qualifications_years REAL;
ALTER TABLE jobs ADD COLUMN qualifications_certifications TEXT; -- JSON array
ALTER TABLE jobs ADD COLUMN qualifications_other TEXT;
ALTER TABLE jobs ADD COLUMN education_requirements TEXT; -- no_degree, college_degree, technical_school
ALTER TABLE jobs ADD COLUMN other_relevant_titles TEXT; -- JSON array
ALTER TABLE jobs ADD COLUMN advancement_opportunities BOOLEAN DEFAULT 0;
ALTER TABLE jobs ADD COLUMN advancement_timeline TEXT;
ALTER TABLE jobs ADD COLUMN company_culture TEXT;
ALTER TABLE jobs ADD COLUMN ai_generated_description TEXT; -- AI-generated full job description
