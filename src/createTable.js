const pool = require("./db");

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                type VARCHAR(100) NOT NULL,
                status VARCHAR(50) NOT NULL,
                payload JSONB,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Jobs table created successfully!");
    } catch (error) {
        console.error("Error creating table:", error.message);
    } finally {
        await pool.end();
    }
};

createTable();