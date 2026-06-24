import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { STATION_COORDINATES } from '../../lib/stations'
import { createClient } from '@/app/lib/supabase/server'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// ─── GET /api/stations ────────────────────────────────────────────────────────
// Returns all non-deleted stations. DB primary, falls back to stations.ts.

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const result = await pool.query(
      `SELECT * FROM stations WHERE is_deleted = FALSE ORDER BY station_id ASC`
    )

    // Fallback: if DB table is empty, seed response from stations.ts
    if (result.rows.length === 0) {
      const fallback = Object.entries(STATION_COORDINATES).map(([id, loc]) => ({
        station_id: id,
        river:      loc.river,
        barangay:   loc.barangay,
        latitude:   loc.latitude,
        longitude:  loc.longitude,
        elevation:  loc.elevation,
        is_hidden:  false,
        is_deleted: false,
        created_at: null,
        source:     'fallback',
      }))
      return NextResponse.json({ success: true, data: fallback })
    }

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('GET /api/stations error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stations' }, { status: 500 })
  }
}

// ─── POST /api/stations ───────────────────────────────────────────────────────
// Add a new station.

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const { station_id, river, barangay, latitude, longitude, elevation } = body

    if (!station_id?.trim()) {
      return NextResponse.json({ success: false, error: 'station_id is required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO stations (station_id, river, barangay, latitude, longitude, elevation)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [station_id.trim(), river ?? null, barangay ?? null, latitude ?? null, longitude ?? null, elevation ?? null]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: 'Station ID already exists' }, { status: 409 })
    }
    console.error('POST /api/stations error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create station' }, { status: 500 })
  }
}

// ─── PATCH /api/stations ──────────────────────────────────────────────────────
// Edit station fields OR toggle is_hidden.
// Body: { station_id, ...fields } or { station_id, is_hidden: true/false }

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const { station_id, ...fields } = body

    if (!station_id) {
      return NextResponse.json({ success: false, error: 'station_id is required' }, { status: 400 })
    }

    const allowed = ['river', 'barangay', 'latitude', 'longitude', 'elevation', 'is_hidden']
    const updates = Object.entries(fields).filter(([k]) => allowed.includes(k))

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 })
    }

    const setClauses = updates.map(([k], i) => `${k} = $${i + 1}`).join(', ')
    const values     = updates.map(([, v]) => v)
    values.push(station_id)

    const result = await pool.query(
      `UPDATE stations SET ${setClauses} WHERE station_id = $${values.length} RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Station not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('PATCH /api/stations error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update station' }, { status: 500 })
  }
}

// ─── DELETE /api/stations ─────────────────────────────────────────────────────
// Soft delete — sets is_deleted = TRUE.
// Body: { station_id }

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const { station_id } = body

    if (!station_id) {
      return NextResponse.json({ success: false, error: 'station_id is required' }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE stations SET is_deleted = TRUE WHERE station_id = $1 RETURNING station_id`,
      [station_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Station not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: station_id })
  } catch (error) {
    console.error('DELETE /api/stations error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete station' }, { status: 500 })
  }
}