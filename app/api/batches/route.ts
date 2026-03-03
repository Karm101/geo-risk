import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// GET: Fetch the summary of all active batches
export async function GET() {
  try {
    const query = `
      SELECT 
        batch_id, 
        MIN(created_at) as created_at, 
        COUNT(*) as record_count 
      FROM sampling_stations 
      WHERE is_archived = FALSE 
      GROUP BY batch_id 
      ORDER BY created_at DESC
    `
    const result = await pool.query(query)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error("BATCH FETCH ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch batches" }, { status: 500 })
  }
}

// PATCH: Archive a specific batch
export async function PATCH(request: Request) {
  try {
    const { batchId } = await request.json()
    
    if (!batchId) {
      return NextResponse.json({ success: false, error: "No batch ID provided" }, { status: 400 })
    }

    const query = `UPDATE sampling_stations SET is_archived = TRUE WHERE batch_id = $1`
    await pool.query(query, [batchId])

    return NextResponse.json({ success: true, message: "Batch archived successfully" })
  } catch (error) {
    console.error("BATCH ARCHIVE ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to archive batch" }, { status: 500 })
  }
}