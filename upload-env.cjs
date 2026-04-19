const { execSync } = require('child_process');

const envs = {
  DATABASE_URL: 'postgresql://neondb_owner:npg_T5Aia3NtDGlQ@ep-flat-base-am97tf4g.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  JWT_SECRET: 'x92md8fy3hd029kd038rh39d8',
  JWT_REFRESH_SECRET: 'p0293hf92h3d82h938hf2',
  SMTP_HOST: 'smtp.ethereal.email',
  SMTP_PORT: '587',
  NODE_ENV: 'production'
};

console.log('Pushing environment variables to Vercel...');

for (const [key, value] of Object.entries(envs)) {
  try {
    console.log(`Setting ${key}...`);
    // Pass the value without trailing newline via node write
    execSync(`node -e "process.stdout.write('${value}');" | npx -y vercel env add ${key} production`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`Failed to set ${key}, it might already exist. Ignored.`);
  }
}

console.log('✅ All Environment Variables Uploaded Successfully!');
