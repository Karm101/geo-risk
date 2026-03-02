import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const start = Date.now()
    
    const recordQuery = await pool.query('SELECT COUNT(*) FROM sampling_stations WHERE is_archived = FALSE')
    const batchQuery = await pool.query('SELECT COUNT(DISTINCT batch_id) FROM sampling_stations WHERE is_archived = FALSE')
    
   const latestBatchQuery = await pool.query(`
      SELECT batch_id, created_at FROM sampling_stations 
      WHERE is_archived = FALSE ORDER BY created_at DESC LIMIT 1
    `)
    const latestBatchId = latestBatchQuery.rows.length > 0 ? latestBatchQuery.rows[0].batch_id : 'No Data'
    const lastUpdate = latestBatchQuery.rows.length > 0 ? latestBatchQuery.rows[0].created_at : null

    // NEW: Grab every single unique batch ID
    const allBatchesQuery = await pool.query(`
      SELECT DISTINCT batch_id FROM sampling_stations 
      WHERE is_archived = FALSE ORDER BY batch_id DESC
    `)
    const allBatches = allBatchesQuery.rows.map(row => row.batch_id)

    const latency = Date.now() - start

    return NextResponse.json({
      success: true,
      totalRecords: parseInt(recordQuery.rows[0].count),
      totalBatches: parseInt(batchQuery.rows[0].count),
      latestBatch: latestBatchId,
      allBatches: allBatches,
      lastUpdate: lastUpdate, // NEW: Sending the timestamp to the frontend
      latency: latency,
      status: 'Connected'
    })

  } catch (error) {
    console.error("DB STATUS CRASH:", error)
    return NextResponse.json(
      { success: false, status: 'Disconnected', totalRecords: 0, totalBatches: 0, latestBatch: 'Error', allBatches: [], latency: 0 }, 
      { status: 500 }
    )
  }
}