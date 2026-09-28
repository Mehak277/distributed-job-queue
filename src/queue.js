const { Queue } = require("bullmq");

const connection = process.env.REDIS_URL
    ? {
        url: process.env.REDIS_URL
    }
    : {
        host: "localhost",
        port: 6379
    };

const jobQueue = new Queue("job-queue", {
    connection
});

module.exports = jobQueue;