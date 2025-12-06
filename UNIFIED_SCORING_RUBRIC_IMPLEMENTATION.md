# Unified Scoring Rubric Implementation
**Date Implemented:** December 5, 2024
**Status:** ✅ COMPLETED

---

## Overview

Successfully implemented a **unified scoring rubric** across all job positions in the Talos HVAC resume evaluation system. All positions now use the exact same detailed 3-tier scoring matrix structure from the Service Technician rubric, ensuring consistent and fair candidate evaluation.

---

## What Was Changed

### Created New Function: `generateUnifiedScoringRubric()`
**Location:** `backend-node/services/resumeAnalyzer.js` (line 320)

This function generates the complete Service Technician-style scoring rubric with:
- **3 Experience Tiers:** Required / Close to Required / Not Close to Required
- **3 Resume Quality Levels:** Good / Mid / Poor
- **Certifications/Skills Factor:** Configurable based on position type
- **3 Work Gap Levels:** No gap / Small gap / Large gap
- **2 Job Stability Levels:** Not hoppy / Job hoppy
- **3 Distance Ranges:** <30mi / 30-50mi / >50mi

**Parameters:**
- `requiredYears` - Years of experience required for the position
- `includeCerts` (boolean) - Whether to evaluate certifications (true) or skills (false)

---

## Positions Updated

### Office Positions (No Certifications Required)
These positions use `includeCerts = false` and evaluate "Skills Listed" instead of certifications:

1. **HVAC Dispatcher** (line 825)
   - Evaluates: Scheduling & Coordination, Customer Interaction, Multi-tasking & Technology, Communication Skills

2. **Apprentice** (line 1112)
   - Evaluates: Learning & Technical Development, Hands-On Mechanical Skills, Work Ethic & Reliability, Safety Awareness

3. **Bookkeeper** (line 1297)
   - Evaluates: Financial Recordkeeping, Accounting Software Proficiency, Accuracy & Attention to Detail, Organizational Skills

4. **Administrative Assistant** (line 1775)
   - Evaluates: Administrative Operations, Communication & Customer Interaction, Documentation & Office Tools, Multi-Tasking

5. **Customer Service Representative** (line 1932)
   - Evaluates: Customer Interaction & Communication, Problem-Solving & Service Recovery, Technology & CRM Systems, Multi-Tasking Under Pressure

### Technical/Sales Positions (With Certifications)
These positions use `includeCerts = true` and evaluate certifications:

6. **HVAC Service Technician** (line 920)
   - Evaluates: HVAC experience, EPA 608, NATE certifications, technical competency

7. **HVAC Sales Representative** (line 1475)
   - Evaluates: Sales Process Mastery, Technical/Product Knowledge, Customer Interaction, Self-Management

8. **Lead HVAC Technician** (line 1621)
   - Evaluates: Advanced HVAC Diagnostics, Leadership & Team Management, Customer Relations, Business Operations

---

## Scoring Matrix Structure

All positions now use this exact scoring structure:

### Required Experience Tier
**Best Case:** Good Resume + Certs/Skills Listed + No gap + Not job hoppy + <30mi = **90-100**

**Scoring Ranges by Combination:**
- Good Resume + Certs Listed scenarios: 90-100 down to 55-64 (based on gaps/distance/stability)
- Good Resume + NO Certs: 85-89 down to 50-54
- Mid Resume + Certs Listed: 80-84 down to 50-54
- Mid Resume + NO Certs: 75-79 down to 45-49
- Poor Resume + Certs Listed: 75-79 down to 45-49
- Poor Resume + NO Certs: 70-74 down to 40-44

### Close to Required Experience (50-95% of required years)
**Best Case:** Good Resume + Certs/Skills Listed + No gap + Not job hoppy + <30mi = **80-84**

**Scoring Ranges:** Same structure as Required tier, but 10 points lower across the board

### Not Close to Required Experience (<50% of required years)
**Best Case:** Good Resume + Certs/Skills Listed + No gap + Not job hoppy + <30mi = **50-54**

**Scoring Ranges:** Same structure, but significantly lower to reflect lack of experience

---

## Scoring Factors Explained

### 1. **Experience Tier** (MOST IMPORTANT)
- **Required:** Candidate has required years or more
- **Close:** 50-95% of required years
- **Not Close:** Less than 50% of required years

### 2. **Resume Quality**
- **Good:** Proper formatting, no typos, 2+ substantive bullets per experience, quantified achievements
- **Mid:** Professional but missing quantification or has minor errors
- **Poor:** Multiple errors, poor formatting, vague descriptions

### 3. **Certifications/Skills**
- **For Technical Positions:** EPA 608, NATE, OSHA, trade licenses, etc.
- **For Office Positions:** Microsoft Office Suite, CRM systems, QuickBooks, Google Workspace, etc.

### 4. **Work Gaps**
- **No gap:** Under 6 months unemployment
- **Small gap:** 6 months to 1 year
- **Large gap:** Over 1 year
- NOTE: Overlapping jobs = POSITIVE, not a gap

### 5. **Job Stability**
- **Not job hoppy:** Long tenures (2+ years) or few employers
- **Job hoppy:** Many employers with short tenures (<1 year each)

### 6. **Distance from Job Location**
- **<30 miles:** Minimal impact
- **30-50 miles:** Moderate negative impact
- **>50 miles:** Major negative impact

---

## Color Tier Thresholds

All positions use the same tier thresholds:

- **Green Tier (Strong Candidates):** 80-100
- **Yellow Tier (Give Them a Chance):** 50-79
- **Red Tier (Not a Good Fit):** 0-49

---

## Unique Competency Analysis Retained

While the scoring rubric is now uniform, **each position still maintains its unique competency evaluation:**

- **Dispatcher:** Scheduling expertise, customer service, multi-tasking in fast-paced environment
- **Service Technician:** Technical HVAC knowledge, diagnostic skills, customer interaction
- **Sales Rep:** Consultative selling, closing skills, technical product knowledge, pipeline management
- **Bookkeeper:** Financial recordkeeping, accounting software, accuracy, reconciliation
- **Admin Assistant:** Office operations, documentation, calendar management, front desk duties
- **Customer Service Rep:** Call handling, problem resolution, empathy, CRM proficiency
- **Lead HVAC Tech:** Leadership, advanced diagnostics, team mentoring, complex problem-solving
- **Apprentice:** Learning aptitude, mechanical skills, safety awareness, work ethic

This ensures candidates are still evaluated on role-specific competencies while being scored consistently.

---

## Benefits of Unified Rubric

### 1. **Consistency**
   - All candidates evaluated using the same scoring logic
   - No more discrepancies between different job evaluations

### 2. **Fairness**
   - Equivalent candidates get equivalent scores regardless of position
   - Same factors (experience, resume quality, gaps, stability, distance) weighted consistently

### 3. **Transparency**
   - Hiring managers can easily understand and compare scores across positions
   - Clear documentation of why a candidate received their score

### 4. **Maintainability**
   - Single source of truth for scoring logic
   - Updates to scoring ranges only need to be made in one place

### 5. **Flexibility**
   - Office positions correctly don't penalize for missing certifications
   - Technical positions still value relevant certifications appropriately

---

## Files Modified

1. **resumeAnalyzer.js** - Main implementation file
   - Added `generateUnifiedScoringRubric()` function (line 320)
   - Updated all 8 position criteria functions to use unified rubric

2. **Backup Created:**
   - `resumeAnalyzer_UNIFIED_RUBRIC_BACKUP.js` - Backup of updated implementation

3. **Documentation:**
   - `UNIFIED_SCORING_RUBRIC_IMPLEMENTATION.md` - This file

---

## Testing Recommendations

Before deploying to production, test with sample resumes for each position:

1. **Test Green Tier Candidates** (should score 80+)
   - Required experience
   - Good resume
   - Relevant certs/skills
   - No gaps, stable history
   - Within 30 miles

2. **Test Yellow Tier Candidates** (should score 50-79)
   - Close to required experience OR
   - Required experience with some red flags (gaps, job hopping, distance)

3. **Test Red Tier Candidates** (should score below 50)
   - Insufficient experience
   - Poor resume quality
   - Multiple negative factors

4. **Test Edge Cases**
   - Overqualified candidates (should score 70-75)
   - Career changers with transferable skills
   - Recent graduates for entry-level positions
   - Candidates at distance boundaries (30mi, 50mi)

---

## Future Enhancements

Potential improvements to consider:

1. **Industry-Specific Bonuses**
   - Add bonus points for candidates from HVAC industry (for all positions)
   - Add bonus for union experience for technician roles

2. **Education Weighting**
   - Consider formal HVAC training/degrees
   - Weight technical school completion for apprentices

3. **Reference Check Integration**
   - Adjust scores based on reference quality
   - Add bonus for stellar references

4. **Performance Tracking**
   - Track which score ranges correlate with successful hires
   - Adjust tier thresholds based on hiring outcomes

---

## Maintenance Notes

### To Update Scoring Ranges:
Edit the `generateUnifiedScoringRubric()` function at line 320 in `resumeAnalyzer.js`

### To Add a New Position:
1. Create a new `get[PositionName]Criteria()` function
2. Define the competency evaluation criteria
3. Call `${generateUnifiedScoringRubric(requiredYears, includeCerts)}`
4. Set `includeCerts` to `false` for office positions, `true` for technical positions

### To Modify Tier Thresholds:
Update the `scoring` object in each criteria function:
```javascript
scoring: {
    greenTier: { min: 80, max: 100 },
    yellowTier: { min: 50, max: 79 },
    redTier: { min: 0, max: 49 }
}
```

---

## Contact & Support

For questions or issues with the unified scoring rubric implementation, contact your development team.

**Implementation Date:** December 5, 2024
**Implemented By:** Claude Code
**Version:** 1.0
