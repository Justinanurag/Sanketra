import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sanketra',
});

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Ensure pgvector extension exists
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');

    // Create Reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        report_type VARCHAR(50) NOT NULL,
        site_location VARCHAR(255),
        incident_date TIMESTAMP,
        hazard_name VARCHAR(255),
        energy_source VARCHAR(255),
        human_exposure TEXT,
        barrier_name VARCHAR(255),
        barrier_status VARCHAR(50),
        consequence TEXT,
        notes TEXT,
        sif_potential VARCHAR(50),
        analysis JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Report Embeddings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_embeddings (
        id SERIAL PRIMARY KEY,
        report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
        embedding vector(768),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
        reviewer VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        decision VARCHAR(50) NOT NULL,
        comments TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Safety Events (Final validated events) table
    await client.query(`
      CREATE TABLE IF NOT EXISTS safety_events (
        id SERIAL PRIMARY KEY,
        report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        sif_potential VARCHAR(50) NOT NULL,
        decision VARCHAR(50) NOT NULL,
        reviewer VARCHAR(255) NOT NULL,
        hazard_name VARCHAR(255),
        barrier_status VARCHAR(50),
        summary TEXT,
        decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Audit Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        entity VARCHAR(255) NOT NULL,
        entity_id VARCHAR(255),
        previous_value TEXT,
        new_value TEXT,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully with pgvector and all tables.');
  } finally {
    client.release();
  }
};

export const query = (text: string, params?: any[]) => pool.query(text, params);
