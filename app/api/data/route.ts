import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: Request) {
  try {
    // Look at the URL to see if a specific batch was requested
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batch')

    let query = ''
    let values = []

    if (batchId) {
      // Fetch ONLY the selected batch
      query = `SELECT * FROM sampling_stations WHERE is_archived = FALSE AND batch_id = $1 ORDER BY created_at DESC`
      values = [batchId]
    } else {
      // Default to the most recent batch
      query = `
        SELECT * FROM sampling_stations 
        WHERE is_archived = FALSE 
        AND batch_id = (SELECT batch_id FROM sampling_stations WHERE is_archived = FALSE ORDER BY created_at DESC LIMIT 1)
        ORDER BY created_at DESC
      `
    }
    
    const dbResult = await pool.query(query, values)

    return NextResponse.json({ success: true, data: dbResult.rows })

  } catch (error) {
    console.error("FETCH CRASH REPORT:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch records" }, { status: 500 })
  }
}