const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const logger = require('../config/logger');

async function migrate() {
  const client = await pool.connect();
  
  try {
    logger.info('Starting database migration...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    
    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
