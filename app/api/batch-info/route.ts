import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const batch = searchParams.get('batch')

    if (!batch) {
      return NextResponse.json({ success: false, error: 'No batch specified' }, { status: 400 })
    }

    const result = await pool.query(`
      SELECT batch_id, created_at, COUNT(*) as record_count
      FROM sampling_stations
      WHERE batch_id = $1 AND is_archived = FALSE
      GROUP BY batch_id, created_at
      ORDER BY created_at DESC
      LIMIT 1
    `, [batch])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      batchId: result.rows[0].batch_id,
      createdAt: result.rows[0].created_at,
      recordCount: parseInt(result.rows[0].record_count),
    })

  } catch (error) {
    console.error('BATCH INFO CRASH:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch batch info' }, { status: 500 })
  }
}