require("dotenv").config();
if (process.env.NODE_ENV === "production") {
    require("./worker");
}

const express = require("express");
const cors = require("cors");
const jobQueue = require("./queue");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "Job Queue API is running"
    });
});


// =========================
// CREATE JOB
// =========================

app.post("/jobs", async (req, res) => {
    try {
        const {
            type,
            to,
            subject,
            message,
            priority = 5
        } = req.body;

        // Basic validation
        if (!type) {
            return res.status(400).json({
                message: "Job type is required"
            });
        }

        if (type === "email" && (!to || !subject || !message)) {
            return res.status(400).json({
                message: "Email requires to, subject and message"
            });
        }

        // Payload that will be stored in database
        const payload = {
            to,
            subject,
            message
        };

        // Save job in PostgreSQL
        const result = await pool.query(
            `INSERT INTO jobs
             (type, status, payload, priority)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                type,
                "pending",
                payload,
                priority
            ]
        );

        const databaseJobId = result.rows[0].id;

        // Add job to BullMQ
        const job = await jobQueue.add(
            type,
            {
                databaseJobId,
                to,
                subject,
                message
            },
            {
                attempts: 3,

                backoff: {
                    type: "exponential",
                    delay: 2000
                },

                priority: priority
            }
        );

        res.json({
            message: "Job added successfully",
            jobId: job.id,
            databaseJob: result.rows[0]
        });

    } catch (error) {
        console.error("Create job error:", error);

        res.status(500).json({
            message: "Failed to create job"
        });
    }
});


// =========================
// GET ALL JOBS
// =========================

app.get("/jobs", async (req, res) => {
    try {
        const {
            status,
            priority,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(
            parseInt(page) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(parseInt(limit) || 10, 1),
            100
        );

        const offset =
            (pageNumber - 1) * limitNumber;

        const conditions = [];
        const values = [];

        // Filter by status
        if (status) {
            values.push(status);

            conditions.push(
                `status = $${values.length}`
            );
        }

        // Filter by priority
        if (priority) {
            values.push(parseInt(priority));

            conditions.push(
                `priority = $${values.length}`
            );
        }

        const whereClause =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";

        // Count total jobs
        const countResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM jobs
             ${whereClause}`,
            values
        );

        const total =
            parseInt(countResult.rows[0].total);

        // Pagination values
        values.push(limitNumber);
        values.push(offset);

        // Get jobs
        const result = await pool.query(
            `SELECT
                id,
                type,
                status,
                attempts,
                priority,
                error_message,
                created_at,
                updated_at
             FROM jobs
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $${values.length - 1}
             OFFSET $${values.length}`,
            values
        );

        res.json({
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(
                total / limitNumber
            ),
            jobs: result.rows
        });

    } catch (error) {
        console.error("Get jobs error:", error);

        res.status(500).json({
            message: "Failed to fetch jobs"
        });
    }
});


// =========================
// JOB STATISTICS
// =========================

app.get("/jobs/stats", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                COUNT(*) AS total,

                COUNT(*) FILTER (
                    WHERE status = 'pending'
                ) AS pending,

                COUNT(*) FILTER (
                    WHERE status = 'processing'
                ) AS processing,

                COUNT(*) FILTER (
                    WHERE status = 'completed'
                ) AS completed,

                COUNT(*) FILTER (
                    WHERE status = 'failed'
                ) AS failed

            FROM jobs
        `);

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Stats error:", error);

        res.status(500).json({
            message: "Failed to fetch job statistics"
        });
    }
});


// =========================
// FAILED JOBS
// =========================

app.get("/jobs/failed", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                type,
                status,
                attempts,
                priority,
                error_message,
                created_at,
                updated_at
             FROM jobs
             WHERE status = 'failed'
             ORDER BY created_at DESC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Failed jobs error:", error);

        res.status(500).json({
            message: "Failed to fetch failed jobs"
        });
    }
});


// =========================
// GET SINGLE JOB
// =========================

app.get("/jobs/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM jobs
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Get job error:", error);

        res.status(500).json({
            message: "Failed to fetch job"
        });
    }
});


// =========================
// RETRY FAILED JOB
// =========================

app.post("/jobs/:id/retry", async (req, res) => {
    try {
        const { id } = req.params;

        // Find existing job
        const result = await pool.query(
            `SELECT *
             FROM jobs
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const existingJob = result.rows[0];

        // Only failed jobs can be retried
        if (existingJob.status !== "failed") {
            return res.status(400).json({
                message: "Only failed jobs can be retried"
            });
        }

        // Get saved payload
        const payload = existingJob.payload || {};

        // Add job back to BullMQ
        const newJob = await jobQueue.add(
            existingJob.type,
            {
                databaseJobId: existingJob.id,
                to: payload.to,
                subject: payload.subject,
                message: payload.message
            },
            {
                attempts: 3,

                backoff: {
                    type: "exponential",
                    delay: 2000
                },

                priority: existingJob.priority
            }
        );

        // Reset database status
        await pool.query(
            `UPDATE jobs
             SET
                status = 'pending',
                attempts = 0,
                error_message = NULL,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [id]
        );

        res.json({
            message: "Job retry scheduled",
            bullmqJobId: newJob.id,
            databaseJobId: existingJob.id
        });

    } catch (error) {
        console.error("Retry job error:", error);

        res.status(500).json({
            message: "Failed to retry job"
        });
    }
});


// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Server running on port ${PORT}`
    );
});