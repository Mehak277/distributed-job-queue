# Distributed Job Queue

A Node.js job queue for accepting email work through an Express API, processing it asynchronously with BullMQ and Redis, and persisting job state in PostgreSQL. A React dashboard provides visibility into job status, failures, priorities, and retry actions.

[![Frontend Live](https://img.shields.io/badge/Frontend-Live-000?logo=vercel)](https://distributed-job-queue-nine.vercel.app/)

[![Backend Live](https://img.shields.io/badge/Backend-Live-46E3B7?logo=render)](https://distributed-job-queue-bevd.onrender.com/)

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/Mehak277/distributed-job-queue)

## 🚀 Live Demo

- **Frontend:** [Live Frontend](https://distributed-job-queue-nine.vercel.app/)
- **Backend API:** [Live Backend API](https://distributed-job-queue-bevd.onrender.com/)
- **GitHub Repository:** [GitHub Repository](https://github.com/Mehak277/distributed-job-queue)

The backend root route (`/`) returns a small JSON response confirming that the API is running.

## 📸 Dashboard

Explore the [Live Dashboard](https://distributed-job-queue-nine.vercel.app/).

This repository does not currently include dashboard screenshots.

## ✨ Features

- Asynchronous email-job processing with BullMQ and Redis
- PostgreSQL persistence for job payloads, status, attempts, priority, timestamps, and errors
- Job states: `pending`, `processing`, `completed`, and `failed`
- Up to three attempts per queue submission, with exponential backoff starting at 2 seconds
- Priority passed to BullMQ when a job is queued
- Failed-job listing, error inspection, and manual retry from the dashboard
- Job details drawer with payload, status, priority, attempt count, and timestamps
- Status and priority filters, plus client-side text search
- Paginated job listing and job totals by status
- Dashboard views for recent jobs, failed jobs, and statistics
- Browser preferences for dashboard theme and automatic refresh interval

Text search runs in the browser against the jobs currently loaded for the selected view. For the regular jobs list, that means search is limited to the current API page; the failed-jobs view fetches the failed-job list before applying its search and pagination.

## 🧠 Engineering Concepts Demonstrated

- Asynchronous job processing with a queue-based architecture
- Redis-backed queues and persistent, database-backed job state
- Retry policies, exponential backoff, priority queues, and failure handling
- REST API design for creating, listing, inspecting, and retrying jobs
- Environment-based configuration for database, Redis, email, and frontend API connections

## 🏗️ Architecture

```text
User
  ↓
React Dashboard (Vite)
  ↓ HTTP
Express API
  ├── PostgreSQL (job records and status)
  └── BullMQ Queue
          ↓
      Redis (queue state)
          ↓
      BullMQ Worker
          ↓
      Resend Email API