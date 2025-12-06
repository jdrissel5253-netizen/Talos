const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../talos.db');
const db = new Database(dbPath);

// Dummy candidate data
const dummyCandidates = [
    // Green Tier - HVAC Service Technicians
    {
        first_name: 'Michael',
        last_name: 'Rodriguez',
        email: 'michael.rodriguez@email.com',
        phone: '555-0101',
        location: 'Phoenix, AZ',
        distance_miles: 12,
        position: 'HVAC Service Technician',
        overall_score: 95,
        tier: 'green',
        years_experience: 7.5,
        experience_tier: 'required',
        resume_quality: 'good',
        has_certifications: 1,
        certifications_list: 'EPA 608 Universal, NATE Certified',
        work_gap: 'none',
        is_job_hoppy: 0,
        ai_summary: 'Highly qualified HVAC technician with 7+ years experience. EPA 608 Universal and NATE certified. Excellent track record in residential and commercial service.',
        strengths: 'Strong technical skills, multiple certifications, stable employment history, local candidate',
        concerns: 'None identified',
        recommendation: 'Strong hire - Schedule interview immediately'
    },
    {
        first_name: 'Jennifer',
        last_name: 'Thompson',
        email: 'jennifer.thompson@email.com',
        phone: '555-0102',
        location: 'Scottsdale, AZ',
        distance_miles: 18,
        position: 'HVAC Service Technician',
        overall_score: 88,
        tier: 'green',
        years_experience: 5.0,
        experience_tier: 'required',
        resume_quality: 'good',
        has_certifications: 1,
        certifications_list: 'EPA 608 Type II, OSHA 10',
        work_gap: 'small',
        is_job_hoppy: 0,
        ai_summary: 'Solid HVAC service technician with 5 years experience. EPA certified with residential focus. Small employment gap explained (maternity leave).',
        strengths: 'EPA certified, good resume quality, stable work history, strong customer service skills',
        concerns: '8-month gap in 2023 (maternity leave - not a concern)',
        recommendation: 'Good candidate - Recommend interview'
    },
    {
        first_name: 'David',
        last_name: 'Chen',
        email: 'david.chen@email.com',
        phone: '555-0103',
        location: 'Mesa, AZ',
        distance_miles: 22,
        position: 'HVAC Service Technician',
        overall_score: 92,
        tier: 'green',
        years_experience: 9.0,
        experience_tier: 'required',
        resume_quality: 'good',
        has_certifications: 1,
        certifications_list: 'EPA 608 Universal, NATE Certified, State License AZ-12345',
        work_gap: 'none',
        is_job_hoppy: 0,
        ai_summary: 'Experienced HVAC technician with 9 years in the field. Multiple certifications including state license. Commercial and residential experience.',
        strengths: 'Extensive experience, all major certifications, commercial experience, excellent troubleshooting skills',
        concerns: 'None',
        recommendation: 'Top candidate - Priority interview'
    },

    // Green Tier - Lead HVAC Technicians
    {
        first_name: 'Robert',
        last_name: 'Martinez',
        email: 'robert.martinez@email.com',
        phone: '555-0104',
        location: 'Tempe, AZ',
        distance_miles: 15,
        position: 'Lead HVAC Technician',
        overall_score: 93,
        tier: 'green',
        years_experience: 10.0,
        experience_tier: 'required',
        resume_quality: 'good',
        has_certifications: 1,
        certifications_list: 'EPA 608 Universal, NATE Senior Certified, State Master License',
        work_gap: 'none',
        is_job_hoppy: 0,
        competency_a_score: 'Strong',
        competency_b_score: 'Strong',
        competency_c_score: 'Strong',
        competency_d_score: 'Strong',
        ai_summary: 'Senior HVAC technician with 10 years experience. Demonstrates all 4 leadership competencies. Currently supervises team of 3 technicians.',
        strengths: 'Leadership experience, mentors junior techs, advanced diagnostics, all certifications, stable career',
        concerns: 'None',
        recommendation: 'Excellent lead candidate - Fast-track interview'
    },

    // Yellow Tier - HVAC Service Technicians
    {
        first_name: 'Sarah',
        last_name: 'Williams',
        email: 'sarah.williams@email.com',
        phone: '555-0105',
        location: 'Chandler, AZ',
        distance_miles: 28,
        position: 'HVAC Service Technician',
        overall_score: 75,
        tier: 'yellow',
        years_experience: 3.5,
        experience_tier: 'close',
        resume_quality: 'good',
        has_certifications: 1,
        certifications_list: 'EPA 608 Type I',
        work_gap: 'none',
        is_job_hoppy: 0,
        ai_summary: 'Promising HVAC technician with 3.5 years experience. Slightly below 5-year requirement but shows strong potential. EPA Type I certified.',
        strengths: 'Good resume, no gaps, stable employment, shows initiative',
        concerns: 'Below required 5 years experience (has 70% of requirement), only Type I EPA (not Universal)',
        recommendation: 'Give them a chance - Consider for interview'
    },
    {
        first_name: 'James',
        last_name: 'Anderson',
        email: 'james.anderson@email.com',
        phone: '555-0106',
        location: 'Gilbert, AZ',
        distance_miles: 35,
        position: 'HVAC Service Technician',
        overall_score: 68,
        tier: 'yellow',
        years_experience: 6.0,
        experience_tier: 'required',
        resume_quality: 'mid',
        has_certifications: 0,
        certifications_list: null,
        work_gap: 'none',
        is_job_hoppy: 1,
        ai_summary: 'Experienced technician with 6 years but frequent job changes. No certifications listed. Lives 35 miles away.',
        strengths: 'Meets experience requirement, diverse company experience',
        concerns: 'Job hopping (4 jobs in 6 years), no EPA certification listed, distance 35 miles, mid-quality resume',
        recommendation: 'Borderline - Review carefully before interview'
    },
    {
        first_name: 'Lisa',
        last_name: 'Johnson',
        email: 'lisa.johnson@email.com',
        phone: '555-0107',
        location: 'Peoria, AZ',
        distance_miles: 42,
        position: 'HVAC Service Technician',
        overall_score: 72,
        tier: 'yellow',
        years_experience: 5.0,
        experience_tier: 'required',
        resume_quality: 'good',
        has_certifications: 1,
        certifications_list: 'EPA 608 Type II',
        work_gap: 'large',
        is_job_hoppy: 0,
        ai_summary: 'HVAC technician with 5 years experience. 15-month employment gap from 2022-2023. EPA Type II certified.',
        strengths: 'Meets experience requirement, EPA certified, good resume quality when employed',
        concerns: 'Large work gap (15 months unemployed), distance 42 miles',
        recommendation: 'Worth considering - Ask about employment gap in interview'
    },

    // Yellow Tier - Sales Representatives
    {
        first_name: 'Kevin',
        last_name: 'Brown',
        email: 'kevin.brown@email.com',
        phone: '555-0108',
        location: 'Phoenix, AZ',
        distance_miles: 8,
        position: 'HVAC Sales Representative',
        overall_score: 78,
        tier: 'yellow',
        years_experience: 2.5,
        experience_tier: 'close',
        resume_quality: 'good',
        has_certifications: 0,
        certifications_list: null,
        work_gap: 'none',
        is_job_hoppy: 0,
        competency_a_score: 'Strong',
        competency_b_score: 'Moderate',
        competency_c_score: 'Strong',
        competency_d_score: 'Weak',
        ai_summary: 'Sales professional with 2.5 years in home improvement sales. Strong sales process and customer interaction. Limited HVAC-specific knowledge.',
        strengths: 'Strong sales track record (exceeded quota by 35%), excellent customer interaction, local, no gaps',
        concerns: 'Below 3-year requirement, limited HVAC product knowledge, no technical background',
        recommendation: 'Trainable candidate - Consider if willing to provide HVAC training'
    },

    // Green Tier - Dispatcher
    {
        first_name: 'Amanda',
        last_name: 'Davis',
        email: 'amanda.davis@email.com',
        phone: '555-0109',
        location: 'Scottsdale, AZ',
        distance_miles: 14,
        position: 'HVAC Dispatcher',
        overall_score: 87,
        tier: 'green',
        years_experience: 4.0,
        experience_tier: 'required',
        resume_quality: 'good',
        has_certifications: 0,
        certifications_list: null,
        work_gap: 'none',
        is_job_hoppy: 0,
        competency_a_score: 'Strong',
        competency_b_score: 'Strong',
        competency_c_score: 'Strong',
        competency_d_score: 'Moderate',
        ai_summary: 'Experienced dispatcher with 4 years coordinating field service teams. Proficient in ServiceTitan and scheduling software.',
        strengths: 'HVAC dispatch experience, ServiceTitan proficiency, excellent organizational skills, strong communication',
        concerns: 'None',
        recommendation: 'Strong candidate - Schedule interview'
    },

    // Green Tier - Bookkeeper
    {
        first_name: 'Patricia',
        last_name: 'Garcia',
        email: 'patricia.garcia@email.com',
        phone: '555-0110',
        location: 'Mesa, AZ',
        distance_miles: 19,
        position: 'Bookkeeper',
        overall_score: 91,
        tier: 'green',
        years_experience: 6.0,
        experience_tier: 'required',
        resume_quality: 'good',
        has_certifications: 1,
        certifications_list: 'QuickBooks Certified, Certified Bookkeeper (CB)',
        work_gap: 'none',
        is_job_hoppy: 0,
        competency_a_score: 'Strong',
        competency_b_score: 'Strong',
        competency_c_score: 'Strong',
        competency_d_score: 'Strong',
        ai_summary: 'Highly qualified bookkeeper with 6 years experience. QuickBooks certified. Experience in construction/trades industry.',
        strengths: 'QuickBooks certified, trades industry experience, excellent accuracy, stable work history',
        concerns: 'None',
        recommendation: 'Excellent candidate - Priority interview'
    },

    // Yellow Tier - Administrative Assistant
    {
        first_name: 'Michelle',
        last_name: 'Wilson',
        email: 'michelle.wilson@email.com',
        phone: '555-0111',
        location: 'Tempe, AZ',
        distance_miles: 16,
        position: 'Administrative Assistant',
        overall_score: 74,
        tier: 'yellow',
        years_experience: 2.8,
        experience_tier: 'close',
        resume_quality: 'good',
        has_certifications: 1,
        certifications_list: 'Microsoft Office Specialist',
        work_gap: 'small',
        is_job_hoppy: 0,
        competency_a_score: 'Strong',
        competency_b_score: 'Strong',
        competency_c_score: 'Moderate',
        competency_d_score: 'Moderate',
        ai_summary: 'Administrative professional with 2.8 years experience. MOS certified. Small gap due to family relocation.',
        strengths: 'MOS certified, strong organizational skills, professional resume, good references',
        concerns: 'Slightly below 3-year requirement, 7-month gap (relocation - explained)',
        recommendation: 'Good potential - Consider for interview'
    },

    // Red Tier - HVAC Service Technicians
    {
        first_name: 'Christopher',
        last_name: 'Taylor',
        email: 'christopher.taylor@email.com',
        phone: '555-0112',
        location: 'Casa Grande, AZ',
        distance_miles: 58,
        position: 'HVAC Service Technician',
        overall_score: 45,
        tier: 'red',
        years_experience: 1.5,
        experience_tier: 'not_close',
        resume_quality: 'mid',
        has_certifications: 0,
        certifications_list: null,
        work_gap: 'large',
        is_job_hoppy: 1,
        ai_summary: 'Entry-level technician with 1.5 years experience. No certifications. Multiple red flags.',
        strengths: 'Some HVAC exposure',
        concerns: 'Well below 5-year requirement (only 30%), no EPA certification, 18-month gap, job hopping, 58 miles away',
        recommendation: 'Not a good fit - Pass'
    },
    {
        first_name: 'Daniel',
        last_name: 'Moore',
        email: 'daniel.moore@email.com',
        phone: '555-0113',
        location: 'Tucson, AZ',
        distance_miles: 112,
        position: 'HVAC Service Technician',
        overall_score: 38,
        tier: 'red',
        years_experience: 4.0,
        experience_tier: 'close',
        resume_quality: 'poor',
        has_certifications: 0,
        certifications_list: null,
        work_gap: 'none',
        is_job_hoppy: 1,
        ai_summary: 'Technician with 4 years experience but poor resume quality and major distance issue. Multiple typos and formatting problems.',
        strengths: 'Some relevant experience',
        concerns: 'Very far (112 miles - over 1.5 hours), poor resume quality, no certifications, job hopping',
        recommendation: 'Not a fit - Reject due to distance and quality concerns'
    },

    // Green Tier - Customer Service Representative
    {
        first_name: 'Rebecca',
        last_name: 'Martinez',
        email: 'rebecca.martinez@email.com',
        phone: '555-0114',
        location: 'Phoenix, AZ',
        distance_miles: 11,
        position: 'Customer Service Representative',
        overall_score: 85,
        tier: 'green',
        years_experience: 5.0,
        experience_tier: 'required',
        resume_quality: 'good',
        has_certifications: 0,
        certifications_list: null,
        work_gap: 'none',
        is_job_hoppy: 0,
        competency_a_score: 'Strong',
        competency_b_score: 'Strong',
        competency_c_score: 'Strong',
        competency_d_score: 'Moderate',
        ai_summary: 'Experienced CSR with 5 years in service-based industries. Excellent phone skills and CRM proficiency.',
        strengths: 'Strong customer service background, CRM experience (Salesforce), conflict resolution skills, local',
        concerns: 'None',
        recommendation: 'Strong candidate - Schedule interview'
    },

    // Yellow Tier - Apprentice
    {
        first_name: 'Tyler',
        last_name: 'Jackson',
        email: 'tyler.jackson@email.com',
        phone: '555-0115',
        location: 'Mesa, AZ',
        distance_miles: 20,
        position: 'HVAC Apprentice',
        overall_score: 65,
        tier: 'yellow',
        years_experience: 0.5,
        experience_tier: 'required',
        resume_quality: 'mid',
        has_certifications: 1,
        certifications_list: 'OSHA 10, Trade School Diploma',
        work_gap: 'none',
        is_job_hoppy: 0,
        competency_a_score: 'Moderate',
        competency_b_score: 'Strong',
        competency_c_score: 'Moderate',
        competency_d_score: 'Moderate',
        ai_summary: 'Recent trade school graduate with 6 months helper experience. OSHA 10 certified. Eager to learn.',
        strengths: 'Trade school graduate, OSHA certified, strong work ethic, no gaps, local',
        concerns: 'Limited hands-on experience, mid-quality resume (minimal work history)',
        recommendation: 'Good entry-level candidate - Consider for apprentice role'
    }
];

// Insert dummy candidates
console.log('🌱 Seeding talent pool with dummy candidates...\n');

const insert = db.prepare(`INSERT INTO candidates (
    first_name, last_name, email, phone, location, distance_miles,
    position, overall_score, tier, years_experience, experience_tier,
    resume_quality, has_certifications, certifications_list, work_gap,
    is_job_hoppy, competency_a_score, competency_b_score, competency_c_score,
    competency_d_score, ai_summary, strengths, concerns, recommendation
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

for (const candidate of dummyCandidates) {
    try {
        insert.run(
            candidate.first_name, candidate.last_name, candidate.email, candidate.phone,
            candidate.location, candidate.distance_miles, candidate.position,
            candidate.overall_score, candidate.tier, candidate.years_experience,
            candidate.experience_tier, candidate.resume_quality, candidate.has_certifications,
            candidate.certifications_list, candidate.work_gap, candidate.is_job_hoppy,
            candidate.competency_a_score, candidate.competency_b_score,
            candidate.competency_c_score, candidate.competency_d_score,
            candidate.ai_summary, candidate.strengths, candidate.concerns,
            candidate.recommendation
        );
        console.log(`✅ Added ${candidate.first_name} ${candidate.last_name} - ${candidate.position} (${candidate.tier.toUpperCase()} tier, score: ${candidate.overall_score})`);
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            console.log(`⚠️  ${candidate.first_name} ${candidate.last_name} already exists - skipping`);
        } else {
            console.error(`❌ Error adding ${candidate.first_name} ${candidate.last_name}:`, err.message);
        }
    }
}

console.log('\n📊 Talent Pool Summary:');

const total = db.prepare('SELECT COUNT(*) as total FROM candidates').get();
console.log(`   Total Candidates: ${total.total}`);

const green = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE tier = "green"').get();
console.log(`   🟢 Green Tier: ${green.count}`);

const yellow = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE tier = "yellow"').get();
console.log(`   🟡 Yellow Tier: ${yellow.count}`);

const red = db.prepare('SELECT COUNT(*) as count FROM candidates WHERE tier = "red"').get();
console.log(`   🔴 Red Tier: ${red.count}`);

console.log('\n🎉 Talent pool seeded successfully!');

db.close();
