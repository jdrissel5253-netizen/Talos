# Quick Reference: Unified Scoring Rubric

## Score Ranges by Tier

| Tier | Score Range | Meaning |
|------|-------------|---------|
| 🟢 **Green** | 80-100 | **Strong Candidates** - Schedule interview immediately |
| 🟡 **Yellow** | 50-79 | **Give Them a Chance** - Review carefully, consider interview |
| 🔴 **Red** | 0-49 | **Not a Good Fit** - Pass unless exceptional circumstances |

---

## All Jobs Now Use Same Scoring Structure

### Office Positions (No Certs Required)
- ✅ Dispatcher
- ✅ Apprentice
- ✅ Bookkeeper
- ✅ Admin Assistant
- ✅ Customer Service Rep

### Technical/Sales Positions (Certs Required)
- ✅ Service Technician
- ✅ Sales Rep
- ✅ Lead HVAC Technician

---

## Best Possible Scores by Experience Level

| Experience Level | Best Score | Scenario |
|-----------------|------------|----------|
| **Has Required Years** | 90-100 | Good resume + Certs/Skills + No gaps + Stable + <30mi |
| **Close to Required (50-95%)** | 80-84 | Good resume + Certs/Skills + No gaps + Stable + <30mi |
| **Not Close (<50%)** | 50-54 | Good resume + Certs/Skills + No gaps + Stable + <30mi |

---

## Key Scoring Factors (In Order of Importance)

1. **Experience Level** 👑 MOST IMPORTANT
   - Required: Full years needed
   - Close: 50-95% of required
   - Not Close: <50% of required

2. **Resume Quality**
   - Good: Professional, quantified achievements, no errors
   - Mid: Professional but lacking detail/minor errors
   - Poor: Multiple errors, poor formatting, vague

3. **Certifications/Skills Listed**
   - Technical: EPA 608, NATE, OSHA, licenses
   - Office: MS Office, CRM, QuickBooks, Google Workspace

4. **Work Gaps**
   - None: <6 months
   - Small: 6-12 months
   - Large: >12 months

5. **Job Stability**
   - Stable: 2+ year tenures
   - Job Hoppy: Many jobs <1 year each

6. **Distance**
   - <30 miles: Minimal impact
   - 30-50 miles: Moderate penalty
   - >50 miles: Major penalty

---

## Example Scores

### Green Tier (80-100) ✅
- **95:** Service Tech, 5 years experience, EPA & NATE certs, excellent resume, stable, 10 miles
- **88:** Bookkeeper, 3 years required/has 4, QuickBooks certified, good resume, 25 miles
- **82:** Sales Rep, 2 years required/has 2.5, strong resume, small gap (8 months), 15 miles

### Yellow Tier (50-79) ⚠️
- **75:** Admin Assistant, required 2 years/has 1.5 (close), good resume, 20 miles
- **68:** Dispatcher, required 3 years/has 3, mid resume, job hoppy, 35 miles
- **55:** Service Tech, required 5 years/has 5, poor resume, no certs, large gap, 45 miles

### Red Tier (0-49) ❌
- **45:** CSR, required 2 years/has 0.5 (not close), good resume, 55 miles
- **32:** Service Tech, required 5 years/has 1.5, no certs, job hoppy, 60 miles
- **18:** Bookkeeper, required 3 years/has 0.8, poor resume, gaps, 70 miles

---

## Special Rules

### Overqualification
- Candidate applying DOWN from senior role (e.g., Manager → Tech)
- **Score:** Fixed 70-75 (low yellow tier)
- **Rationale:** Flight risk, may leave quickly

### Flexibility Mode (ON vs OFF)
- **ON:** Equivalent job titles count as full experience
- **OFF:** Only exact title matches, -9 point penalty for equivalents

### Distance Boundaries
- Be reasonable: 32 miles ≠ drastically different from 30 miles
- Use judgment around boundaries

---

## Files Reference

- **Implementation:** `backend-node/services/resumeAnalyzer.js`
- **Unified Function:** Line 320 - `generateUnifiedScoringRubric()`
- **Backup:** `backend-node/services/resumeAnalyzer_UNIFIED_RUBRIC_BACKUP.js`
- **Full Documentation:** `UNIFIED_SCORING_RUBRIC_IMPLEMENTATION.md`

---

**Last Updated:** December 5, 2024
