import { neon } from "@neondatabase/serverless"
import 'dotenv/config'

// Create a SQL client with the connection string from environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment.");
}
export const sql = neon(process.env.DATABASE_URL)

