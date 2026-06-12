import 'dotenv/config';
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

  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nome VARCHAR(255) PRIMARY KEY,
      aplicada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  for (const file of files) {
    const [registro] = await sql`
      SELECT nome
      FROM schema_migrations
      WHERE nome = ${file}
    `;

    if (registro) {
      console.log(`Skipping migration: ${file}`);
      continue;
    }

    const migration = fs.readFileSync(path.join(dir, file), 'utf-8');
    console.log(`Running migration: ${file}`);

    await sql.begin(async transaction => {
      await transaction.unsafe(migration);
      await transaction`
        INSERT INTO schema_migrations (nome)
        VALUES (${file})
      `;
    });
  }

  await sql.end();
  console.log('Migrations completed successfully');
}

migrate().catch(err => {
  console.error('Error running migrations:', err);
  process.exit(1);
});
