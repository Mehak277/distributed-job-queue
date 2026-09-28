require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { Worker } = require("bullmq");
const Redis = require("ioredis");
const pool = require("./db");
const nodemailer = require("nodemailer");

const connection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : new Redis({
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email connection failed:", error.message);
  } else {
    console.log("Email service is ready!");
  }
});

const worker = new Worker(
  "job-queue",

  async (job) => {
    const databaseJobId = job.data.databaseJobId;

    try {
      console.log("Processing job:", job.id);
      console.log("Job data:", job.data);

      const attemptNumber = job.attemptsMade + 1;

      console.log("Attempt:", attemptNumber);

      await pool.query(
        `UPDATE jobs
         SET attempts = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [attemptNumber, databaseJobId]
      );

      console.log("Database Job ID:", databaseJobId);

      await pool.query(
        `UPDATE jobs
         SET status = 'processing',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [databaseJobId]
      );

      console.log("Job status: processing");

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: job.data.to,
        subject: job.data.subject,
        text: job.data.message,
      });

      console.log("Email sent successfully!");

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
      };

    } catch (error) {
      console.error("Job failed:", error.message);

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

  { connection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed: ${err.message}`);
});