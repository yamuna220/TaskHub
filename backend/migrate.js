const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Neon Database');

    const sqlPath = path.join(__dirname, 'database', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Inspecting organizations table schema...');
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'organizations'");
    console.log('Organizations Schema:', res.rows);

    console.log('Applying migrations from init.sql...');
    await client.query(sql);
    
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
