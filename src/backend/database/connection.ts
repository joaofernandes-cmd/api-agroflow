import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL nao definida no .env')
}

type Database = ReturnType<typeof postgres>

const sql: Database = postgres(connectionString)

export default sql 
