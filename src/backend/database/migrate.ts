import fs from 'fs';
import path from 'path';
import sql from './connection';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida no .env');
  process.exit(1);
}

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.sql')).sort();

  for (const file of files) {
    const migration = fs.readFileSync(path.join(dir, file), 'utf-8');
    console.log(`Running migration: ${file}`);
    await sql.unsafe(migration);
  }
  await sql.end();
  console.log('Migrations completed successfully');
}

migrate().catch(err => {
  console.error('Error running migrations:', err);
  process.exit(1);
});
