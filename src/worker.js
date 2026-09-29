require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const { Worker } = require("bullmq");
const Redis = require("ioredis");
const pool = require("./db");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Redis connection
const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : new Redis({
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    });

// BullMQ Worker
const worker = new Worker(
  "job-queue",

  async (job) => {
    const databaseJobId = job.data.databaseJobId;

    try {
      console.log("Processing job:", job.id);
      console.log("Job data:", job.data);

      // Current attempt number
      const attemptNumber = job.attemptsMade + 1;

      console.log("Attempt:", attemptNumber);

      // Update attempts in PostgreSQL
      await pool.query(
        `UPDATE jobs
         SET attempts = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [attemptNumber, databaseJobId]
      );

      console.log("Database Job ID:", databaseJobId);

      // Mark job as processing
      await pool.query(
        `UPDATE jobs
         SET status = 'processing',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [databaseJobId]
      );

      console.log("Job status: processing");

      // Send email using Resend API
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: [job.data.to],
        subject: job.data.subject,
        text: job.data.message,
      });

      // Handle Resend error
      if (error) {
        throw new Error(error.message);
      }

      console.log("Email sent successfully via Resend!");
      console.log("Resend Email ID:", data.id);

      // Mark job as completed
      await pool.query(
        `UPDATE jobs
         SET status = 'completed',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [databaseJobId]
      );

      console.log("Job status: completed");

      return {
        success: true,
        emailId: data.id,
      };

    } catch (error) {
      console.error("Job failed:", error.message);

      // Mark job as failed
      await pool.query(
        `UPDATE jobs
         SET status = 'failed',
             error_message = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [error.message, databaseJobId]
      );

      throw error;
    }
  },

  {
    connection,
  }
);

// Worker completed event
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

// Worker failed event
worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed: ${err.message}`);
});