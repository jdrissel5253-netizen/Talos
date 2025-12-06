# Lead HVAC Technician - Nuanced Resume Evaluation

**Date Implemented:** December 5, 2024
**Status:** ✅ COMPLETED

---

## Overview

Enhanced the Lead HVAC Technician resume evaluation with a sophisticated, nuanced scoring system that:
- Recognizes direct Lead HVAC Technician experience
- Recognizes functionally equivalent senior HVAC roles
- Uses binary hard requirements and semantic reasoning about transferable skills
- Properly evaluates candidates even if their title is not "Lead HVAC Technician"
- Prioritizes leadership, advanced diagnostics, and mentorship responsibilities
- Implements flexibility checkbox with -9 point penalty system

---

## Key Features

### 1. **Hard Requirements (Binary Filters)**

Candidates must meet minimum requirements with **ANY** of the following:
- Direct Lead HVAC Technician experience
- Senior-level HVAC service/maintenance/installer experience with leadership duties
- Equivalent advanced HVAC roles demonstrating parallel responsibilities

**What's Checked:**
- Minimum years of HVAC experience
- EPA 608 certification (if explicitly required)
- Valid driver's license (usually required)
- State/local HVAC license (if applicable)

### 2. **Four Core Competency Categories**

Strong Lead Tech candidates generally exhibit **3-4 categories:**

#### A. Advanced HVAC Diagnostics & Technical Mastery
- Troubleshooting complex systems (RTUs, chillers, boilers, VRF/VRV)
- Advanced electrical diagnostics and controls
- Heat pumps, minisplits, gas furnaces
- Refrigeration knowledge, EPA 608
- Commissioning, system testing, verification
- Building automation systems (BAS)

#### B. Leadership, Mentorship & Oversight
- Leading teams or job sites
- Training or mentoring junior technicians
- Quality control and final inspections
- Assigning tasks or overseeing work orders
- Acting as senior point of contact
- Decision-making authority on technical matters

#### C. Customer Interaction & Job Management
- Senior-level customer interaction
- Quoting repairs, explaining complex issues
- Coordinating with dispatch/office/project managers
- Handling escalations
- High-accuracy documentation
- Managing service agreements or maintenance contracts

#### D. Installation, Service & Maintenance Command
- Advanced service AND installation tasks
- Code compliance knowledge
- Skilled in brazing, electrical work, line set work
- Full system changeouts
- Residential & light commercial
- Ductwork design and modification
- System startup and commissioning

### 3. **Competency-Based Scoring**

**Scoring Approach:**
- **4 Strong Competencies** = Excellent fit, score at upper end of tier
- **3 Strong Competencies** = Good fit, score at mid-to-upper tier
- **2 Strong Competencies** = Borderline, score at lower end of tier
- **1 or fewer** = Not qualified for Lead role

**CRITICAL:** Claude scores candidates HIGHER when competencies appear anywhere in the resume, even without "Lead" title.

---

## Flexibility Checkbox System

### When FLEXIBILITY is ON (Default)

**Accept candidates with required years+ in ANY of the following:**
✓ Lead HVAC Technician (direct match)
✓ Senior HVAC Technician
✓ HVAC Service Technician (if demonstrates leadership competencies)
✓ HVAC Installer (Lead or Senior level)
✓ HVAC Maintenance Technician (senior level)
✓ HVAC Foreman, Crew Lead, Team Lead
✓ General Manager (with hands-on HVAC work)
✓ Any equivalent role demonstrating 3-4 competency categories

**Evaluation:** Based on COMPETENCIES and RESPONSIBILITIES, not strict title matching

**Examples that QUALIFY for Required Tier:**
- Service Tech with 5+ years who trains junior techs and handles complex diagnostics
- Lead Installer with 5+ years who manages install crews and does service work
- Maintenance Tech with 5+ years doing commercial HVAC with supervisory duties
- General Manager with 5+ years of hands-on HVAC work and team leadership

### When FLEXIBILITY is OFF

**Only these titles qualify for Required Experience tier:**
✓ Lead HVAC Technician (direct match)
✓ Senior HVAC Technician
✓ HVAC Foreman, Crew Lead, Team Lead (with explicit leadership title)

**The following roles DROP to "Close to Required" tier AND receive -9 point penalty:**
- HVAC Service Technician (required years+) → Close tier, -9 points
- HVAC Installer (without "Lead" in title) → Close tier, -9 points
- HVAC Maintenance Technician (without "Senior") → Close tier, -9 points
- General Manager with HVAC background → Close tier, -9 points

**Example:**
A Service Tech with 5 years who would normally score **79** (high Close tier) will drop to **70** (low Yellow tier).

---

## Acceptable Equivalent Job Titles

### Strong Equivalents (Automatically Relevant)
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
- HVAC Project Manager (with hands-on work)
- Commercial HVAC Technician (senior level)

**These roles should be treated as relevant unless job content contradicts it.**

---

## Nuanced Scenarios Explained

### Scenario 1: Service Tech with Leadership
**Job Requirement:** 5+ years Lead HVAC Technician
**Candidate:** "HVAC Service Technician" with 6 years

**With Flexibility ON:**
- If resume shows: training juniors, complex diagnostics, senior customer interaction, installations
- Competencies: 4/4 categories demonstrated
- **Result:** REQUIRED EXPERIENCE tier (90-100 potential score)

**With Flexibility OFF:**
- Same resume, same competencies
- **Result:** CLOSE TO REQUIRED tier, -9 points (71-84 potential score after penalty)

### Scenario 2: Lead Installer
**Job Requirement:** 5+ years Lead HVAC Technician
**Candidate:** "Lead Installer" with 7 years

**With Flexibility ON:**
- If resume shows: managing crews, service work, customer interaction, full system installs
- Competencies: 4/4 categories
- **Result:** REQUIRED EXPERIENCE tier (90-100 potential score)

**With Flexibility OFF:**
- Same resume
- **Result:** CLOSE TO REQUIRED tier, -9 points (71-84 potential score)

### Scenario 3: Maintenance Tech (Senior)
**Job Requirement:** 5+ years Lead HVAC Technician
**Candidate:** "Senior Maintenance Technician" with 8 years commercial HVAC

**With Flexibility ON:**
- Title includes "Senior" + demonstrates leadership + technical mastery
- **Result:** REQUIRED EXPERIENCE tier (90-100 potential score)

**With Flexibility OFF:**
- Title is "Senior Maintenance Technician" (not explicitly "Lead HVAC")
- **Result:** CLOSE TO REQUIRED tier, -9 points (71-84 potential score)

### Scenario 4: General Manager with HVAC Background
**Job Requirement:** 5+ years Lead HVAC Technician
**Candidate:** "General Manager" with 10 years, started as HVAC tech

**With Flexibility ON:**
- If resume shows hands-on HVAC work, team leadership, technical expertise
- Competencies: 3-4 categories
- **Result:** REQUIRED EXPERIENCE tier (90-100 potential score)

**With Flexibility OFF:**
- Title is "General Manager" (not explicitly HVAC-focused)
- **Result:** CLOSE TO REQUIRED tier, -9 points (71-84 potential score)

---

## How It Works in Practice

### Step 1: Check Hard Requirements
- Does candidate have minimum years with relevant HVAC experience?
- Does candidate have required certifications (if specified)?
- Does candidate have driver's license (if required)?

### Step 2: Evaluate Competencies
Count how many of the 4 competency categories the candidate demonstrates:
- A. Advanced Diagnostics
- B. Leadership & Mentorship
- C. Customer Interaction
- D. Installation & Service Command

### Step 3: Determine Experience Tier

**If Flexibility ON:**
- Required years+ with 3-4 competencies → REQUIRED tier
- 50-95% years with 3-4 competencies → CLOSE tier
- <50% years → NOT CLOSE tier

**If Flexibility OFF:**
- Check if title is explicitly "Lead," "Senior," or "Foreman"
  - YES → REQUIRED tier (if has required years)
  - NO → DROP to CLOSE tier, apply -9 point penalty

### Step 4: Apply Scoring Rubric
Use the unified scoring rubric with all other factors:
- Resume quality (Good/Mid/Poor)
- Certifications listed (Yes/No)
- Work gaps (None/Small/Large)
- Job stability (Not hoppy/Hoppy)
- Distance (<30mi / 30-50mi / >50mi)

### Step 5: Calculate Final Score
- Base score from rubric
- Subtract 9 points if flexibility OFF and candidate dropped a tier
- Apply any other adjustments

---

## Benefits of This System

### 1. **Captures Qualified Candidates**
Doesn't miss great candidates just because their title isn't exactly "Lead HVAC Technician"

### 2. **Competency-Based**
Evaluates what candidates can actually DO, not just their job title

### 3. **Flexible for Hiring Managers**
- Checkbox ON = Cast wider net, accept equivalent roles
- Checkbox OFF = Stricter requirements, penalize non-exact titles

### 4. **Fair and Transparent**
- Clear rules about what qualifies for each tier
- Consistent -9 point penalty when flexibility is off
- Examples provided for common scenarios

### 5. **Semantic Reasoning**
Claude evaluates transferable skills and parallel responsibilities, not just keyword matching

---

## Example Evaluations

### Example 1: Perfect Lead Tech Candidate

**Resume:**
- Title: "Lead HVAC Technician"
- Experience: 8 years
- Competencies: All 4 categories demonstrated
- Certifications: EPA 608 Universal, NATE
- Resume: Professional, quantified achievements
- Gaps: None
- Stability: 8 years at same company
- Distance: 15 miles

**With Flexibility ON or OFF:**
- Tier: REQUIRED EXPERIENCE
- Base Score: 90-100 range
- Final Score: 95-100 (top of green tier)

### Example 2: Service Tech with Leadership

**Resume:**
- Title: "HVAC Service Technician"
- Experience: 6 years
- Competencies: Trains juniors, complex diagnostics, senior customer contact, installations
- Certifications: EPA 608
- Resume: Good quality
- Gaps: None
- Stability: Stable
- Distance: 20 miles

**With Flexibility ON:**
- Tier: REQUIRED EXPERIENCE (competencies qualify them)
- Base Score: 85-89 range (no NATE cert)
- Final Score: 85-89

**With Flexibility OFF:**
- Tier: CLOSE TO REQUIRED (title not "Lead")
- Base Score: 75-79 range
- Penalty: -9 points
- Final Score: 66-70 (low yellow tier)

### Example 3: Installer Without Leadership

**Resume:**
- Title: "HVAC Installer"
- Experience: 5 years
- Competencies: Installation skills only (1 category)
- Certifications: EPA 608
- Resume: Good
- Gaps: Small gap (9 months)
- Distance: 25 miles

**With Flexibility ON or OFF:**
- Tier: NOT CLOSE (lacks leadership competencies)
- Base Score: 45-49 range
- Final Score: 45-49 (red tier)

---

## Implementation Details

**File:** `backend-node/services/resumeAnalyzer.js`
**Function:** `getLeadHVACTechnicianCriteria(requiredYears, flexibleOnTitle)`
**Line:** ~1489

**Key Parameters:**
- `requiredYears` - Years of experience required
- `flexibleOnTitle` - Boolean for flexibility checkbox
- `flexibilityPenalty` - Set to 9 points when flexibility is OFF

**Uses Unified Rubric:**
- `generateUnifiedScoringRubric(requiredYears, true)` - TRUE for certifications

---

## Testing Recommendations

Test with various scenarios:
1. Lead HVAC Tech with 5+ years (should score 80+)
2. Service Tech with 5+ years + leadership (flexibility ON = 80+, OFF = 70+)
3. Installer with 5+ years no leadership (should score <50 regardless)
4. Senior Tech with 3 years (close to required, 50-79 range)
5. General Manager with HVAC background (nuanced, depends on competencies)

---

**Last Updated:** December 5, 2024
**Implemented By:** Claude Code
