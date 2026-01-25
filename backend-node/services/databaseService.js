const db = require('../config/database');

// Detect environment
// FORCE POSTGRES FOR PRODUCTION
const USE_POSTGRES = true;

console.log('Service Layer DB Mode: POSTGRES (FORCED)');

// Helper function to convert arrays to JSON for SQLite (or TEXT columns in PG)
const toJSON = (value) => {
    if (Array.isArray(value)) {
        return JSON.stringify(value);
    }
    return value;
};

// Helper for native ARRAY columns in Postgres
const toArray = (value) => {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return USE_POSTGRES ? [] : '[]';
    }

    // If it's a string that looks like JSON array, parse it first
    if (typeof value === 'string') {
        if (value.startsWith('[')) {
            try {
                value = JSON.parse(value);
            } catch (e) {
                // If parsing fails, wrap in array
                return USE_POSTGRES ? [value] : JSON.stringify([value]);
            }
        } else {
            // Single string value, wrap in array
            return USE_POSTGRES ? [value] : JSON.stringify([value]);
        }
    }

    if (USE_POSTGRES && Array.isArray(value)) {
        // Ensure all elements are strings for TEXT[] columns
        return value.map(v => v === null || v === undefined ? '' : String(v));
    }
    return toJSON(value); // SQLite needs JSON string
};

// Helper function to parse JSON from SQLite
const fromJSON = (value) => {
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    return value;
};

// Helper function to sanitize numbers (prevent NaN, null, undefined)
const toNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

// Helper function to sanitize decimal numbers
const toDecimal = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : Math.round(num * 10) / 10;
};

/**
 * User operations
 */
const userService = {
    async create(email, passwordHash, companyName = null) {
        const result = await db.query(
            'INSERT INTO users (email, password_hash, company_name) VALUES ($1, $2, $3) RETURNING *',
            [email, passwordHash, companyName]
        );
        return result.rows[0];
    },

    async findByEmail(email) {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    async findById(id) {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }
};

/**
 * Batch operations
 */
const batchService = {
    async create(userId, name, totalResumes) {
        const result = await db.query(
            'INSERT INTO batches (user_id, name, total_resumes) VALUES ($1, $2, $3) RETURNING *',
            [userId, name, totalResumes]
        );
        return result.rows[0];
    },

    async findByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM batches WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    },

    async findById(id) {
        const result = await db.query('SELECT * FROM batches WHERE id = $1', [id]);
        return result.rows[0];
    }
};

/**
 * Candidate operations
 */
const candidateService = {
    async create(batchId, filename, filePath) {
        const result = await db.query(
            'INSERT INTO candidates (batch_id, filename, file_path, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [batchId, filename, filePath, 'analyzing']
        );
        return result.rows[0];
    },

    async updateStatus(id, status) {
        const result = await db.query(
            'UPDATE candidates SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    },

    async findByBatchId(batchId) {
        const result = await db.query(
            `SELECT c.*, a.score_out_of_10, a.summary, a.hiring_recommendation
             FROM candidates c
             LEFT JOIN analyses a ON c.id = a.candidate_id
             WHERE c.batch_id = $1
             ORDER BY a.score_out_of_10 DESC`,
            [batchId]
        );
        return result.rows;
    },

    async findById(id) {
        const result = await db.query('SELECT * FROM candidates WHERE id = $1', [id]);
        return result.rows[0];
    }
};

/**
 * Analysis operations
 */
const analysisService = {
    async create(candidateId, analysisData) {
        const {
            overallScore,
            scoreOutOf10,
            summary,
            technicalSkills,
            certifications,
            experience,
            presentationQuality,
            strengths,
            weaknesses,
            recommendations,
            hiringRecommendation,
            // New format fields
            keyStrengths,
            concerns,
            recommendationSummary,
            totalRelevantYears
        } = analysisData;

        // Handle both old and new formats
        // If new format (keyStrengths exists), use it; otherwise use old format
        const finalStrengths = keyStrengths || strengths || [];
        const finalWeaknesses = concerns || weaknesses || [];
        const finalRecommendations = recommendationSummary ? [recommendationSummary] : (recommendations || []);
        const finalSummary = summary || recommendationSummary || 'Resume analyzed';

        // Provide defaults for old format fields that may not exist in new format
        const tech = technicalSkills || { score: overallScore || 0, found: [], missing: [], feedback: '' };
        const certs = certifications || { score: 0, found: [], recommended: [], feedback: '' };
        const exp = experience || { score: overallScore || 0, yearsOfExperience: totalRelevantYears || 0, relevantExperience: [], feedback: '' };
        const pres = presentationQuality || { score: overallScore || 0, strengths: [], improvements: [], feedback: '' };

        const result = await db.query(
            `INSERT INTO analyses (
                candidate_id, overall_score, score_out_of_10, summary,
                technical_skills_score, technical_skills_found, technical_skills_missing, technical_skills_feedback,
                certifications_score, certifications_found, certifications_recommended, certifications_feedback,
                experience_score, years_of_experience, relevant_experience, experience_feedback,
                presentation_score, presentation_strengths, presentation_improvements, presentation_feedback,
                strengths, weaknesses, recommendations, hiring_recommendation
            ) VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8,
                $9, $10, $11, $12,
                $13, $14, $15, $16,
                $17, $18, $19, $20,
                $21, $22, $23, $24
            ) RETURNING *`,
            [
                candidateId, toNumber(overallScore), toNumber(scoreOutOf10), finalSummary,
                toNumber(tech.score), toArray(tech.found), toArray(tech.missing), tech.feedback || '',
                toNumber(certs.score), toArray(certs.found), toArray(certs.recommended), certs.feedback || '',
                toNumber(exp.score), toDecimal(exp.yearsOfExperience), toArray(exp.relevantExperience), exp.feedback || '',
                toNumber(pres.score), toArray(pres.strengths), toArray(pres.improvements), pres.feedback || '',
                toArray(finalStrengths), toArray(finalWeaknesses), toArray(finalRecommendations), hiringRecommendation || 'MAYBE'
            ]
        );
        return result.rows[0];
    },

    async findByCandidateId(candidateId) {
        const result = await db.query('SELECT * FROM analyses WHERE candidate_id = $1', [candidateId]);
        const analysis = result.rows[0];
        if (analysis) {
            // Parse JSON fields
            analysis.technical_skills_found = fromJSON(analysis.technical_skills_found);
            analysis.technical_skills_missing = fromJSON(analysis.technical_skills_missing);
            analysis.certifications_found = fromJSON(analysis.certifications_found);
            analysis.certifications_recommended = fromJSON(analysis.certifications_recommended);
            analysis.relevant_experience = fromJSON(analysis.relevant_experience);
            analysis.presentation_strengths = fromJSON(analysis.presentation_strengths);
            analysis.presentation_improvements = fromJSON(analysis.presentation_improvements);
            analysis.strengths = fromJSON(analysis.strengths);
            analysis.weaknesses = fromJSON(analysis.weaknesses);
            analysis.recommendations = fromJSON(analysis.recommendations);
        }
        return analysis;
    },

    async getFullAnalysis(candidateId) {
        const result = await db.query(
            `SELECT c.*, a.*
             FROM candidates c
             JOIN analyses a ON c.id = a.candidate_id
             WHERE c.id = $1`,
            [candidateId]
        );
        const analysis = result.rows[0];
        if (analysis) {
            // Parse JSON fields
            analysis.technical_skills_found = fromJSON(analysis.technical_skills_found);
            analysis.technical_skills_missing = fromJSON(analysis.technical_skills_missing);
            analysis.certifications_found = fromJSON(analysis.certifications_found);
            analysis.certifications_recommended = fromJSON(analysis.certifications_recommended);
            analysis.relevant_experience = fromJSON(analysis.relevant_experience);
            analysis.presentation_strengths = fromJSON(analysis.presentation_strengths);
            analysis.presentation_improvements = fromJSON(analysis.presentation_improvements);
            analysis.strengths = fromJSON(analysis.strengths);
            analysis.weaknesses = fromJSON(analysis.weaknesses);
            analysis.recommendations = fromJSON(analysis.recommendations);
        }
        return analysis;
    }
};

/**
 * Jobs operations
 */
const jobService = {
    async create(userId, jobData) {
        const result = await db.query(
            `INSERT INTO jobs (
                user_id, title, company_name, description, location, job_location_type,
                city, zip_code, job_type, required_years_experience, vehicle_required,
                position_type, salary_min, salary_max, pay_range_min, pay_range_max,
                pay_type, expected_hours, work_schedule, benefits, key_responsibilities,
                qualifications_years, qualifications_certifications, qualifications_other,
                education_requirements, other_relevant_titles, advancement_opportunities,
                advancement_timeline, company_culture, ai_generated_description,
                flexible_on_title, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) RETURNING *`,
            [
                userId,
                jobData.title,
                jobData.company_name,
                jobData.description,
                jobData.location,
                jobData.job_location_type,
                jobData.city,
                jobData.zip_code,
                jobData.job_type,
                jobData.required_years_experience || 0,
                jobData.vehicle_required ? 1 : 0,
                jobData.position_type,
                jobData.salary_min,
                jobData.salary_max,
                jobData.pay_range_min,
                jobData.pay_range_max,
                jobData.pay_type,
                jobData.expected_hours,
                jobData.work_schedule,
                jobData.benefits,
                jobData.key_responsibilities,
                jobData.qualifications_years,
                jobData.qualifications_certifications,
                jobData.qualifications_other,
                jobData.education_requirements,
                jobData.other_relevant_titles,
                jobData.advancement_opportunities ? 1 : 0,
                jobData.advancement_timeline,
                jobData.company_culture,
                jobData.ai_generated_description,
                jobData.flexible_on_title !== false ? 1 : 0,
                'active'
            ]
        );
        return result.rows[0];
    },

    async findByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    },

    async findById(id) {
        const result = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
        return result.rows[0];
    },

    async update(id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(updates[key]);
                paramIndex++;
            }
        });

        if (fields.length === 0) return null;

        values.push(id);
        const result = await db.query(
            `UPDATE jobs SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        return result.rows[0];
    },

    async delete(id) {
        await db.query('DELETE FROM jobs WHERE id = $1', [id]);
    }
};

/**
 * Candidate Pipeline operations
 */
const candidatePipelineService = {
    async addToJob(candidateId, jobId, pipelineData) {
        const {
            tier,
            tier_score,
            star_rating,
            give_them_a_chance,
            vehicle_status,
            ai_summary,
            internal_notes,
            tags,
            evaluated_position
        } = pipelineData;

        const result = await db.query(
            `INSERT INTO candidate_pipeline (
                candidate_id, job_id, pipeline_status, tier, tier_score, star_rating,
                give_them_a_chance, vehicle_status, ai_summary, internal_notes, tags, evaluated_position
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT(candidate_id, job_id) DO UPDATE SET
                tier = excluded.tier,
                tier_score = excluded.tier_score,
                star_rating = excluded.star_rating,
                give_them_a_chance = excluded.give_them_a_chance,
                vehicle_status = excluded.vehicle_status,
                ai_summary = excluded.ai_summary,
                evaluated_position = excluded.evaluated_position
            RETURNING *`,
            [candidateId, jobId, 'new', tier, tier_score, star_rating,
                give_them_a_chance ? 1 : 0, vehicle_status, ai_summary,
                internal_notes, toJSON(tags), evaluated_position]
        );
        return result.rows[0];
    },

    async updateStatus(candidatePipelineId, status) {
        const result = await db.query(
            'UPDATE candidate_pipeline SET pipeline_status = $1 WHERE id = $2 RETURNING *',
            [status, candidatePipelineId]
        );
        return result.rows[0];
    },

    async bulkUpdateStatus(candidatePipelineIds, status) {
        const placeholders = candidatePipelineIds.map((_, i) => `$${i + 2}`).join(',');
        const result = await db.query(
            `UPDATE candidate_pipeline SET pipeline_status = $1
             WHERE id IN (${placeholders}) RETURNING *`,
            [status, ...candidatePipelineIds]
        );
        return result.rows;
    },

    async findByJobId(jobId, filters = {}) {
        let query = `
            SELECT cp.*, c.filename, a.overall_score, a.score_out_of_10,
                   a.years_of_experience, a.certifications_found, a.hiring_recommendation
            FROM candidate_pipeline cp
            JOIN candidates c ON cp.candidate_id = c.id
            LEFT JOIN analyses a ON c.id = a.candidate_id
            WHERE cp.job_id = $1
        `;

        const params = [jobId];
        let paramIndex = 2;

        // Apply filters
        if (filters.tier) {
            query += ` AND cp.tier = $${paramIndex}`;
            params.push(filters.tier);
            paramIndex++;
        }
        if (filters.pipeline_status) {
            query += ` AND cp.pipeline_status = $${paramIndex}`;
            params.push(filters.pipeline_status);
            paramIndex++;
        }
        if (filters.min_score) {
            query += ` AND cp.tier_score >= $${paramIndex}`;
            params.push(filters.min_score);
            paramIndex++;
        }
        if (filters.give_them_a_chance) {
            query += ' AND cp.give_them_a_chance = 1';
        }

        // Sorting
        const sortBy = filters.sort_by || 'tier_score';
        const sortOrder = filters.sort_order || 'DESC';
        query += ` ORDER BY ${sortBy} ${sortOrder}`;

        const result = await db.query(query, params);

        // Parse JSON fields
        return result.rows.map(row => ({
            ...row,
            tags: fromJSON(row.tags),
            certifications_found: fromJSON(row.certifications_found)
        }));
    },

    async logCommunication(candidatePipelineId, communicationType, messageContent, metadata = {}) {
        const {
            templateType,
            templateTone,
            isNudge,
            schedulingLink,
            category
        } = metadata;

        const result = await db.query(
            `INSERT INTO communication_log (
                candidate_pipeline_id,
                communication_type,
                message_content,
                template_type,
                template_tone,
                is_nudge,
                scheduling_link
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                candidatePipelineId,
                communicationType,
                messageContent,
                templateType || null,
                templateTone || null,
                isNudge ? 1 : 0,
                schedulingLink || null
            ]
        );

        // Determine new pipeline status based on category
        const newStatus = category === 'rejection' ? 'rejected' : 'contacted';

        // Update candidate_pipeline with contact info and status
        await db.query(
            `UPDATE candidate_pipeline
             SET contacted_via = $1,
                 contacted_at = CURRENT_TIMESTAMP,
                 last_message_sent = $2,
                 pipeline_status = $3
             WHERE id = $4`,
            [communicationType, messageContent, newStatus, candidatePipelineId]
        );

        return result.rows[0];
    },

    async getCommunicationHistory(candidatePipelineId) {
        const result = await db.query(
            `SELECT * FROM communication_log
             WHERE candidate_pipeline_id = $1
             ORDER BY sent_at DESC`,
            [candidatePipelineId]
        );
        return result.rows;
    },

    async getTalentPool(filters = {}) {
        let query = `
            SELECT
                cp.id as pipeline_id,
                cp.candidate_id,
                cp.job_id,
                cp.tier,
                cp.tier_score,
                cp.star_rating,
                cp.pipeline_status,
                cp.give_them_a_chance,
                cp.vehicle_status,
                cp.ai_summary,
                cp.contacted_via,
                cp.contacted_at,
                c.filename,
                c.file_path,
                c.status as candidate_status,
                c.upload_date,
                a.overall_score,
                a.score_out_of_10,
                a.summary,
                a.years_of_experience,
                a.certifications_found,
                a.hiring_recommendation,
                a.strengths,
                a.weaknesses,
                j.title as job_title,
                j.position_type,
                j.location as job_location
            FROM candidate_pipeline cp
            JOIN candidates c ON cp.candidate_id = c.id
            JOIN jobs j ON cp.job_id = j.id
            LEFT JOIN analyses a ON c.id = a.candidate_id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        // Apply filters
        if (filters.tier) {
            query += ` AND cp.tier = $${paramIndex}`;
            params.push(filters.tier);
            paramIndex++;
        }
        if (filters.job_id) {
            query += ` AND cp.job_id = $${paramIndex}`;
            params.push(filters.job_id);
            paramIndex++;
        }
        if (filters.position) {
            query += ` AND j.position_type = $${paramIndex}`;
            params.push(filters.position);
            paramIndex++;
        }
        if (filters.minScore !== undefined) {
            query += ` AND cp.tier_score >= $${paramIndex}`;
            params.push(filters.minScore);
            paramIndex++;
        }
        if (filters.maxScore !== undefined) {
            query += ` AND cp.tier_score <= $${paramIndex}`;
            params.push(filters.maxScore);
            paramIndex++;
        }
        if (filters.status) {
            query += ` AND cp.pipeline_status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        // Sorting
        const validSortFields = {
            'score': 'cp.tier_score',
            'date': 'c.upload_date',
            'name': 'c.filename',
            'position': 'j.position_type'
        };
        const sortField = validSortFields[filters.sortBy] || 'cp.tier_score';
        const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortField} ${sortOrder}`;

        const result = await db.query(query, params);

        // Parse JSON fields
        return result.rows.map(row => ({
            ...row,
            certifications_found: fromJSON(row.certifications_found),
            strengths: fromJSON(row.strengths),
            weaknesses: fromJSON(row.weaknesses)
        }));
    },

    async getTalentPoolStats() {
        // Get tier distribution
        const tierStats = await db.query(`
            SELECT tier, COUNT(*) as count
            FROM candidate_pipeline
            GROUP BY tier
        `);

        // Get position breakdown
        const positionStats = await db.query(`
            SELECT j.position_type, COUNT(DISTINCT cp.candidate_id) as count
            FROM candidate_pipeline cp
            JOIN jobs j ON cp.job_id = j.id
            GROUP BY j.position_type
            ORDER BY count DESC
        `);

        // Get status breakdown
        const statusStats = await db.query(`
            SELECT pipeline_status, COUNT(*) as count
            FROM candidate_pipeline
            GROUP BY pipeline_status
        `);

        // Get average scores by tier
        const avgScoreByTier = await db.query(`
            SELECT tier, AVG(tier_score) as avg_score, COUNT(*) as count
            FROM candidate_pipeline
            GROUP BY tier
        `);

        // Get total candidates
        const totalResult = await db.query(`
            SELECT COUNT(DISTINCT candidate_id) as total
            FROM candidate_pipeline
        `);

        return {
            total: totalResult.rows[0].total,
            tierDistribution: tierStats.rows.reduce((acc, row) => {
                acc[row.tier] = row.count;
                return acc;
            }, {}),
            positionBreakdown: positionStats.rows.reduce((acc, row) => {
                acc[row.position_type] = row.count;
                return acc;
            }, {}),
            statusBreakdown: statusStats.rows.reduce((acc, row) => {
                acc[row.pipeline_status] = row.count;
                return acc;
            }, {}),
            averageScoreByTier: avgScoreByTier.rows.reduce((acc, row) => {
                acc[row.tier] = {
                    avgScore: Math.round(row.avg_score * 10) / 10,
                    count: row.count
                };
                return acc;
            }, {})
        };
    },

    async updateContactStatus(candidatePipelineId, isContacted, contactedVia = null) {
        let query, params;

        if (isContacted) {
            query = `UPDATE candidate_pipeline
                     SET contacted_via = $1, contacted_at = CURRENT_TIMESTAMP
                     WHERE id = $2 RETURNING *`;
            params = [contactedVia || 'manual', candidatePipelineId];
        } else {
            query = `UPDATE candidate_pipeline
                     SET contacted_via = NULL, contacted_at = NULL
                     WHERE id = $1 RETURNING *`;
            params = [candidatePipelineId];
        }

        const result = await db.query(query, params);
        return result.rows[0];
    },

    async evaluateCandidateAcrossAllJobs(candidateId) {
        // Get candidate analysis
        const candidateResult = await db.query(
            `SELECT c.*, a.* FROM candidates c
             LEFT JOIN analyses a ON c.id = a.candidate_id
             WHERE c.id = $1`,
            [candidateId]
        );

        if (candidateResult.rows.length === 0) {
            throw new Error('Candidate not found');
        }

        const candidate = candidateResult.rows[0];

        // Get all active jobs
        const jobsResult = await db.query(
            `SELECT * FROM jobs WHERE status = 'active' ORDER BY title`
        );

        const jobs = jobsResult.rows;

        // Calculate match scores for each job
        const matches = jobs.map(job => {
            const score = candidate.overall_score || 0;
            const yearsExp = candidate.years_of_experience || 0;
            const requiredYears = job.required_years_experience || 0;

            // Calculate tier
            let tier, adjustedScore;
            if (score >= 80) {
                tier = 'green';
                adjustedScore = score;
            } else if (score >= 50) {
                tier = 'yellow';
                adjustedScore = score;
            } else {
                tier = 'red';
                adjustedScore = score;
            }

            // Adjust for experience match
            if (yearsExp >= requiredYears) {
                adjustedScore += 5;
            } else if (yearsExp < requiredYears * 0.5) {
                adjustedScore -= 10;
            }

            // Adjust for vehicle requirement
            if (job.vehicle_required && candidate.vehicle_status === 'no_vehicle') {
                adjustedScore -= 10;
            }

            // Cap at 100
            adjustedScore = Math.min(100, Math.max(0, adjustedScore));

            return {
                job_id: job.id,
                job_title: job.title,
                job_location: job.location,
                position_type: job.position_type,
                required_years_experience: job.required_years_experience,
                match_score: Math.round(adjustedScore),
                tier: tier,
                years_experience_diff: yearsExp - requiredYears,
                vehicle_required: job.vehicle_required
            };
        });

        // Sort by match score descending
        matches.sort((a, b) => b.match_score - a.match_score);

        return matches;
    }
};

/**
 * Initialize database (create tables)
 */
async function initializeDatabase() {
    const fs = require('fs');
    const path = require('path');

    try {
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await db.query(schema);
        console.log('✅ Database schema initialized');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    }
}

module.exports = {
    userService,
    batchService,
    candidateService,
    analysisService,
    jobService,
    candidatePipelineService,
    initializeDatabase
};
