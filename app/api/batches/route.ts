import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { createClient } from '@/app/lib/supabase/server'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// GET: Fetch the summary of all active batches
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const query = `
      SELECT
        batch_id,
        river,
        collection_start,
        collection_end,
        record_count,
        uploaded_by,
        uploaded_at,
        uploaded_at as created_at
      FROM upload_batches
      WHERE is_archived = FALSE
      ORDER BY uploaded_at DESC
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { batchId } = await request.json()

    if (!batchId) {
      return NextResponse.json({ success: false, error: "No batch ID provided" }, { status: 400 })
    }

    await pool.query(`UPDATE sampling_stations SET is_archived = TRUE WHERE batch_id = $1`, [batchId])
    await pool.query(
      `UPDATE upload_batches SET is_archived = TRUE, archived_by = $2, archived_at = now() WHERE batch_id = $1`,
      [batchId, user.email ?? null]
    )

    return NextResponse.json({ success: true, message: "Batch archived successfully" })
  } catch (error) {
    console.error("BATCH ARCHIVE ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to archive batch" }, { status: 500 })
  }
}