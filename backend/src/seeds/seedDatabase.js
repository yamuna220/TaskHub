const pool = require('../config/database');
const axios = require('axios');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // 1. Create organizations
    const orgs = [
      { id: '550e8400-e29b-41d4-a716-446655440000', name: 'ACME Corp' },
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'TechStart Inc' },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Innovate Labs' }
    ];
    
    for (const org of orgs) {
      await pool.query(
        'INSERT INTO organizations (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description',
        [org.id, org.name, `${org.name} organization`]
      );
    }
    console.log('✓ Organizations created');
    
    // 2. Fetch users from RandomUser API
    console.log('📥 Fetching users from RandomUser API...');
    const response = await axios.get('https://randomuser.me/api?results=20');
    
    for (let i = 0; i < response.data.results.length; i++) {
      const user = response.data.results[i];
      const orgIndex = i % 3;
      
      await pool.query(
        'INSERT INTO users (organization_id, email, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (organization_id, email) DO NOTHING',
        [
          orgs[orgIndex].id,
          user.email,
          user.name.first,
          user.name.last,
          i % 5 === 0 ? 'admin' : (i % 3 === 0 ? 'viewer' : 'member')
        ]
      );
    }
    console.log('✓ Users created from RandomUser API');
    
    // 3. Fetch tasks from JSONPlaceholder
    console.log('📥 Fetching tasks from JSONPlaceholder API...');
    const todosResponse = await axios.get('https://jsonplaceholder.typicode.com/todos?_limit=30');
    
    for (let i = 0; i < todosResponse.data.length; i++) {
      const todo = todosResponse.data[i];
      const orgIndex = i % 3;
      
      // Get a random user from this org
      const userResult = await pool.query(
        'SELECT id FROM users WHERE organization_id = $1 ORDER BY RANDOM() LIMIT 1',
        [orgs[orgIndex].id]
      );
      
      if (userResult.rows.length === 0) continue;
      const userId = userResult.rows[0].id;
      
      const status = todo.completed ? 'completed' : (Math.random() > 0.6 ? 'in_progress' : 'pending');
      
      await pool.query(
        'INSERT INTO tasks (organization_id, title, description, status, priority, assigned_to, created_by, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING',
        [
          orgs[orgIndex].id,
          todo.title,
          `Task from JSONPlaceholder - ${todo.title}`,
          status,
          ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          userId,
          userId,
          new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ]
      );
    }
    console.log('✓ Tasks created from JSONPlaceholder API');
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
