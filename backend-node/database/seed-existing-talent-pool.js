const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../talos.db');
const db = new Database(dbPath);

console.log('🌱 Seeding talent pool with dummy candidates...\n');

// First, create some dummy jobs if they don't exist
const jobsData = [
    { title: 'HVAC Service Technician', position_type: 'HVAC Service Technician', required_years: 5, user_id: 1 },
    { title: 'Lead HVAC Technician', position_type: 'Lead HVAC Technician', required_years: 7, user_id: 1 },
    { title: 'HVAC Dispatcher', position_type: 'HVAC Dispatcher', required_years: 3, user_id: 1 },
    { title: 'HVAC Sales Representative', position_type: 'HVAC Sales Representative', required_years: 3, user_id: 1 },
    { title: 'Bookkeeper', position_type: 'Bookkeeper', required_years: 3, user_id: 1 },
    { title: 'Administrative Assistant', position_type: 'Administrative Assistant', required_years: 3, user_id: 1 },
    { title: 'Customer Service Representative', position_type: 'Customer Service Representative', required_years: 2, user_id: 1 },
    { title: 'HVAC Apprentice', position_type: 'HVAC Apprentice', required_years: 0, user_id: 1 }
];

const insertJob = db.prepare(`INSERT OR IGNORE INTO jobs (
    user_id, title, position_type, required_years_experience, status, flexible_on_title
) VALUES (?, ?, ?, ?, 'open', 1)`);

console.log('📋 Creating job postings...\n');
for (const job of jobsData) {
    insertJob.run(job.user_id, job.title, job.position_type, job.required_years);
    console.log(`✅ Created job: ${job.title}`);
}

// Get job IDs
const jobs = db.prepare('SELECT id, title, position_type FROM jobs').all();
const jobMap = {};
jobs.forEach(job => {
    jobMap[job.position_type] = job.id;
});

console.log('\n🎯 Seeding candidates...\n');

// Dummy candidate/analysis data structure
const dummyData = [
    // Green Tier - HVAC Service Technicians
    {
        candidate: { filename: 'michael_rodriguez_resume.pdf', file_path: '/uploads/michael_rodriguez_resume.pdf' },
        analysis: {
            overall_score: 95,
            score_out_of_10: 10,
            summary: 'Highly qualified HVAC technician with 7+ years experience. EPA 608 Universal and NATE certified. Excellent track record in residential and commercial service.',
            years_of_experience: 7.5,
            relevant_experience: '7.5 years HVAC service technician experience',
            certifications_found: 'EPA 608 Universal, NATE Certified',
            strengths: 'Strong technical skills, multiple certifications, stable employment history, local candidate',
            weaknesses: 'None identified',
            recommendations: 'Strong hire recommendation',
            hiring_recommendation: 'Strong Hire'
        },
        pipeline: {
            job_id: jobMap['HVAC Service Technician'],
            tier: 'green',
            tier_score: 95,
            star_rating: 5.0,
            give_them_a_chance: 0,
            ai_summary: 'Top candidate - Priority interview',
            tags: 'EPA Certified, NATE, Local'
        }
    },
    {
        candidate: { filename: 'jennifer_thompson_resume.pdf', file_path: '/uploads/jennifer_thompson_resume.pdf' },
        analysis: {
            overall_score: 88,
            score_out_of_10: 9,
            summary: 'Solid HVAC service technician with 5 years experience. EPA certified with residential focus.',
            years_of_experience: 5.0,
            relevant_experience: '5 years residential HVAC service',
            certifications_found: 'EPA 608 Type II, OSHA 10',
            strengths: 'EPA certified, good resume quality, stable work history',
            weaknesses: 'Small employment gap (maternity leave)',
            recommendations: 'Good candidate - Recommend interview',
            hiring_recommendation: 'Hire'
        },
        pipeline: {
            job_id: jobMap['HVAC Service Technician'],
            tier: 'green',
            tier_score: 88,
            star_rating: 4.5,
            give_them_a_chance: 0,
            ai_summary: 'Solid candidate with good credentials',
            tags: 'EPA Certified, Experienced'
        }
    },
    {
        candidate: { filename: 'david_chen_resume.pdf', file_path: '/uploads/david_chen_resume.pdf' },
        analysis: {
            overall_score: 92,
            score_out_of_10: 10,
            summary: 'Experienced HVAC technician with 9 years in the field. Multiple certifications including state license.',
            years_of_experience: 9.0,
            relevant_experience: '9 years commercial and residential HVAC',
            certifications_found: 'EPA 608 Universal, NATE Certified, State License AZ-12345',
            strengths: 'Extensive experience, all major certifications, commercial experience',
            weaknesses: 'None',
            recommendations: 'Top candidate - Priority interview',
            hiring_recommendation: 'Strong Hire'
        },
        pipeline: {
            job_id: jobMap['HVAC Service Technician'],
            tier: 'green',
            tier_score: 92,
            star_rating: 5.0,
            give_them_a_chance: 0,
            ai_summary: 'Highly experienced with all certifications',
            tags: 'EPA Universal, NATE, State Licensed, 9+ Years'
        }
    },

    // Lead HVAC Technician
    {
        candidate: { filename: 'robert_martinez_resume.pdf', file_path: '/uploads/robert_martinez_resume.pdf' },
        analysis: {
            overall_score: 93,
            score_out_of_10: 10,
            summary: 'Senior HVAC technician with 10 years experience. Demonstrates all 4 leadership competencies. Currently supervises team of 3 technicians.',
            years_of_experience: 10.0,
            relevant_experience: '10 years HVAC, 3 years lead/supervisory',
            certifications_found: 'EPA 608 Universal, NATE Senior Certified, State Master License',
            strengths: 'Leadership experience, mentors junior techs, advanced diagnostics',
            weaknesses: 'None',
            recommendations: 'Excellent lead candidate - Fast-track interview',
            hiring_recommendation: 'Strong Hire'
        },
        pipeline: {
            job_id: jobMap['Lead HVAC Technician'],
            tier: 'green',
            tier_score: 93,
            star_rating: 5.0,
            give_them_a_chance: 0,
            ai_summary: 'Perfect lead tech candidate with all competencies',
            tags: 'Leadership, Senior Certified, Mentor'
        }
    },

    // Yellow Tier - HVAC Service Technicians
    {
        candidate: { filename: 'sarah_williams_resume.pdf', file_path: '/uploads/sarah_williams_resume.pdf' },
        analysis: {
            overall_score: 75,
            score_out_of_10: 7,
            summary: 'Promising HVAC technician with 3.5 years experience. Slightly below 5-year requirement but shows strong potential.',
            years_of_experience: 3.5,
            relevant_experience: '3.5 years HVAC service',
            certifications_found: 'EPA 608 Type I',
            strengths: 'Good resume, no gaps, stable employment',
            weaknesses: 'Below required 5 years experience (has 70%), only Type I EPA',
            recommendations: 'Give them a chance - Consider for interview',
            hiring_recommendation: 'Consider'
        },
        pipeline: {
            job_id: jobMap['HVAC Service Technician'],
            tier: 'yellow',
            tier_score: 75,
            star_rating: 3.5,
            give_them_a_chance: 1,
            ai_summary: 'Close to requirements, good potential',
            tags: 'EPA Type I, Promising'
        }
    },
    {
        candidate: { filename: 'james_anderson_resume.pdf', file_path: '/uploads/james_anderson_resume.pdf' },
        analysis: {
            overall_score: 68,
            score_out_of_10: 6,
            summary: 'Experienced technician with 6 years but frequent job changes. No certifications listed.',
            years_of_experience: 6.0,
            relevant_experience: '6 years HVAC across 4 companies',
            certifications_found: 'None listed',
            strengths: 'Meets experience requirement, diverse company experience',
            weaknesses: 'Job hopping (4 jobs in 6 years), no EPA certification, 35 miles away',
            recommendations: 'Borderline - Review carefully',
            hiring_recommendation: 'Consider with caution'
        },
        pipeline: {
            job_id: jobMap['HVAC Service Technician'],
            tier: 'yellow',
            tier_score: 68,
            star_rating: 3.0,
            give_them_a_chance: 1,
            ai_summary: 'Job hopping concerns, no certifications',
            tags: 'Job Hopper, No Certs'
        }
    },
    {
        candidate: { filename: 'lisa_johnson_resume.pdf', file_path: '/uploads/lisa_johnson_resume.pdf' },
        analysis: {
            overall_score: 72,
            score_out_of_10: 7,
            summary: 'HVAC technician with 5 years experience. 15-month employment gap from 2022-2023.',
            years_of_experience: 5.0,
            relevant_experience: '5 years HVAC service',
            certifications_found: 'EPA 608 Type II',
            strengths: 'Meets experience requirement, EPA certified',
            weaknesses: 'Large work gap (15 months), distance 42 miles',
            recommendations: 'Worth considering - Ask about gap',
            hiring_recommendation: 'Consider'
        },
        pipeline: {
            job_id: jobMap['HVAC Service Technician'],
            tier: 'yellow',
            tier_score: 72,
            star_rating: 3.5,
            give_them_a_chance: 1,
            ai_summary: 'Has gap to explain, otherwise qualified',
            tags: 'EPA Type II, Gap Explained'
        }
    },

    // Sales Rep
    {
        candidate: { filename: 'kevin_brown_resume.pdf', file_path: '/uploads/kevin_brown_resume.pdf' },
        analysis: {
            overall_score: 78,
            score_out_of_10: 8,
            summary: 'Sales professional with 2.5 years in home improvement sales. Strong sales process and customer interaction.',
            years_of_experience: 2.5,
            relevant_experience: '2.5 years home improvement sales',
            certifications_found: 'None',
            strengths: 'Strong sales track record (exceeded quota by 35%), excellent customer interaction',
            weaknesses: 'Below 3-year requirement, limited HVAC product knowledge',
            recommendations: 'Trainable candidate - Provide HVAC training',
            hiring_recommendation: 'Consider'
        },
        pipeline: {
            job_id: jobMap['HVAC Sales Representative'],
            tier: 'yellow',
            tier_score: 78,
            star_rating: 4.0,
            give_them_a_chance: 1,
            ai_summary: 'Strong sales skills, needs HVAC training',
            tags: 'Sales Experience, Quota Crusher'
        }
    },

    // Dispatcher
    {
        candidate: { filename: 'amanda_davis_resume.pdf', file_path: '/uploads/amanda_davis_resume.pdf' },
        analysis: {
            overall_score: 87,
            score_out_of_10: 9,
            summary: 'Experienced dispatcher with 4 years coordinating field service teams. Proficient in ServiceTitan.',
            years_of_experience: 4.0,
            relevant_experience: '4 years HVAC/field service dispatch',
            certifications_found: 'ServiceTitan Certified',
            strengths: 'HVAC dispatch experience, ServiceTitan proficiency, excellent organizational skills',
            weaknesses: 'None',
            recommendations: 'Strong candidate - Schedule interview',
            hiring_recommendation: 'Hire'
        },
        pipeline: {
            job_id: jobMap['HVAC Dispatcher'],
            tier: 'green',
            tier_score: 87,
            star_rating: 4.5,
            give_them_a_chance: 0,
            ai_summary: 'Perfect dispatcher with software skills',
            tags: 'ServiceTitan, Experienced'
        }
    },

    // Bookkeeper
    {
        candidate: { filename: 'patricia_garcia_resume.pdf', file_path: '/uploads/patricia_garcia_resume.pdf' },
        analysis: {
            overall_score: 91,
            score_out_of_10: 9,
            summary: 'Highly qualified bookkeeper with 6 years experience. QuickBooks certified. Experience in construction/trades.',
            years_of_experience: 6.0,
            relevant_experience: '6 years bookkeeping in trades industry',
            certifications_found: 'QuickBooks Certified, Certified Bookkeeper (CB)',
            strengths: 'QuickBooks certified, trades industry experience, excellent accuracy',
            weaknesses: 'None',
            recommendations: 'Excellent candidate - Priority interview',
            hiring_recommendation: 'Strong Hire'
        },
        pipeline: {
            job_id: jobMap['Bookkeeper'],
            tier: 'green',
            tier_score: 91,
            star_rating: 5.0,
            give_them_a_chance: 0,
            ai_summary: 'Perfect bookkeeper for trades company',
            tags: 'QuickBooks, CB Certified, Trades Experience'
        }
    },

    // Admin Assistant
    {
        candidate: { filename: 'michelle_wilson_resume.pdf', file_path: '/uploads/michelle_wilson_resume.pdf' },
        analysis: {
            overall_score: 74,
            score_out_of_10: 7,
            summary: 'Administrative professional with 2.8 years experience. MOS certified.',
            years_of_experience: 2.8,
            relevant_experience: '2.8 years administrative work',
            certifications_found: 'Microsoft Office Specialist',
            strengths: 'MOS certified, strong organizational skills',
            weaknesses: 'Slightly below 3-year requirement, 7-month gap (relocation)',
            recommendations: 'Good potential - Consider for interview',
            hiring_recommendation: 'Consider'
        },
        pipeline: {
            job_id: jobMap['Administrative Assistant'],
            tier: 'yellow',
            tier_score: 74,
            star_rating: 3.5,
            give_them_a_chance: 1,
            ai_summary: 'Close to requirements with good skills',
            tags: 'MOS Certified'
        }
    },

    // Red Tier - HVAC Service Technicians
    {
        candidate: { filename: 'christopher_taylor_resume.pdf', file_path: '/uploads/christopher_taylor_resume.pdf' },
        analysis: {
            overall_score: 45,
            score_out_of_10: 4,
            summary: 'Entry-level technician with 1.5 years experience. No certifications. Multiple red flags.',
            years_of_experience: 1.5,
            relevant_experience: '1.5 years HVAC helper/apprentice',
            certifications_found: 'None',
            strengths: 'Some HVAC exposure',
            weaknesses: 'Well below 5-year requirement, no EPA cert, 18-month gap, job hopping, 58 miles away',
            recommendations: 'Not a good fit - Pass',
            hiring_recommendation: 'Do Not Hire'
        },
        pipeline: {
            job_id: jobMap['HVAC Service Technician'],
            tier: 'red',
            tier_score: 45,
            star_rating: 2.0,
            give_them_a_chance: 0,
            ai_summary: 'Multiple concerns - not qualified',
            tags: 'Underqualified'
        }
    },
    {
        candidate: { filename: 'daniel_moore_resume.pdf', file_path: '/uploads/daniel_moore_resume.pdf' },
        analysis: {
            overall_score: 38,
            score_out_of_10: 3,
            summary: 'Technician with 4 years experience but poor resume quality and major distance issue.',
            years_of_experience: 4.0,
            relevant_experience: '4 years HVAC',
            certifications_found: 'None',
            strengths: 'Some relevant experience',
            weaknesses: 'Very far (112 miles), poor resume quality, no certifications, job hopping',
            recommendations: 'Not a fit - Reject due to distance',
            hiring_recommendation: 'Do Not Hire'
        },
        pipeline: {
            job_id: jobMap['HVAC Service Technician'],
            tier: 'red',
            tier_score: 38,
            star_rating: 1.5,
            give_them_a_chance: 0,
            ai_summary: 'Distance and quality concerns',
            tags: 'Too Far, Poor Resume'
        }
    },

    // CSR
    {
        candidate: { filename: 'rebecca_martinez_resume.pdf', file_path: '/uploads/rebecca_martinez_resume.pdf' },
        analysis: {
            overall_score: 85,
            score_out_of_10: 8,
            summary: 'Experienced CSR with 5 years in service-based industries. Excellent phone skills and CRM proficiency.',
            years_of_experience: 5.0,
            relevant_experience: '5 years customer service',
            certifications_found: 'Salesforce Certified',
            strengths: 'Strong customer service background, CRM experience, conflict resolution skills',
            weaknesses: 'None',
            recommendations: 'Strong candidate - Schedule interview',
            hiring_recommendation: 'Hire'
        },
        pipeline: {
            job_id: jobMap['Customer Service Representative'],
            tier: 'green',
            tier_score: 85,
            star_rating: 4.5,
            give_them_a_chance: 0,
            ai_summary: 'Perfect CSR candidate',
            tags: 'Salesforce, Experienced'
        }
    },

    // Apprentice
    {
        candidate: { filename: 'tyler_jackson_resume.pdf', file_path: '/uploads/tyler_jackson_resume.pdf' },
        analysis: {
            overall_score: 65,
            score_out_of_10: 6,
            summary: 'Recent trade school graduate with 6 months helper experience. OSHA 10 certified. Eager to learn.',
            years_of_experience: 0.5,
            relevant_experience: '6 months helper experience, trade school',
            certifications_found: 'OSHA 10, Trade School Diploma',
            strengths: 'Trade school graduate, OSHA certified, strong work ethic',
            weaknesses: 'Limited hands-on experience',
            recommendations: 'Good entry-level candidate',
            hiring_recommendation: 'Consider'
        },
        pipeline: {
            job_id: jobMap['HVAC Apprentice'],
            tier: 'yellow',
            tier_score: 65,
            star_rating: 3.0,
            give_them_a_chance: 1,
            ai_summary: 'Entry-level with good foundation',
            tags: 'OSHA 10, Trade School'
        }
    }
];

// Create a batch for these candidates
const batchInsert = db.prepare('INSERT INTO batches (user_id, name, total_resumes) VALUES (?, ?, ?)');
const batchInfo = batchInsert.run(1, 'Initial Talent Pool', dummyData.length);
const batchId = batchInfo.lastInsertRowid;

console.log(`✅ Created batch: Initial Talent Pool (ID: ${batchId})\n`);

// Prepare insert statements
const candidateInsert = db.prepare('INSERT INTO candidates (batch_id, filename, file_path, status) VALUES (?, ?, ?, ?)');
const analysisInsert = db.prepare(`INSERT INTO analyses (
    candidate_id, overall_score, score_out_of_10, summary, years_of_experience,
    relevant_experience, certifications_found, strengths, weaknesses,
    recommendations, hiring_recommendation
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const pipelineInsert = db.prepare(`INSERT INTO candidate_pipeline (
    candidate_id, job_id, tier, tier_score, star_rating, give_them_a_chance, ai_summary, tags
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// Insert all data
for (const data of dummyData) {
    try {
        // Insert candidate
        const candidateInfo = candidateInsert.run(batchId, data.candidate.filename, data.candidate.file_path, 'analyzed');
        const candidateId = candidateInfo.lastInsertRowid;

        // Insert analysis
        analysisInsert.run(
            candidateId,
            data.analysis.overall_score,
            data.analysis.score_out_of_10,
            data.analysis.summary,
            data.analysis.years_of_experience,
            data.analysis.relevant_experience,
            data.analysis.certifications_found,
            data.analysis.strengths,
            data.analysis.weaknesses,
            data.analysis.recommendations,
            data.analysis.hiring_recommendation
        );

        // Insert pipeline entry
        pipelineInsert.run(
            candidateId,
            data.pipeline.job_id,
            data.pipeline.tier,
            data.pipeline.tier_score,
            data.pipeline.star_rating,
            data.pipeline.give_them_a_chance,
            data.pipeline.ai_summary,
            data.pipeline.tags
        );

        console.log(`✅ Added candidate: ${data.candidate.filename} (${data.pipeline.tier.toUpperCase()} tier, score: ${data.analysis.overall_score})`);
    } catch (err) {
        console.error(`❌ Error adding ${data.candidate.filename}:`, err.message);
    }
}

// Print summary
console.log('\n📊 Talent Pool Summary:');

const total = db.prepare('SELECT COUNT(*) as total FROM candidate_pipeline').get();
console.log(`   Total Candidates: ${total.total}`);

const green = db.prepare("SELECT COUNT(*) as count FROM candidate_pipeline WHERE tier = 'green'").get();
console.log(`   🟢 Green Tier: ${green.count}`);

const yellow = db.prepare("SELECT COUNT(*) as count FROM candidate_pipeline WHERE tier = 'yellow'").get();
console.log(`   🟡 Yellow Tier: ${yellow.count}`);

const red = db.prepare("SELECT COUNT(*) as count FROM candidate_pipeline WHERE tier = 'red'").get();
console.log(`   🔴 Red Tier: ${red.count}`);

console.log('\n🎉 Talent pool seeded successfully!');

db.close();
