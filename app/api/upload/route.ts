import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { createClient } from '@/app/lib/supabase/server'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// ─── Background values (Turekian & Wedepohl 1961) ────────────────────────────
// Fixed science — never changes regardless of CSV format

const BACKGROUND: Record<string, number> = {
  Cr: 90, Mn: 850, Fe: 47200, Co: 20,  Ni: 68,
  Cu: 45, Zn: 95,  As: 13,   Cd: 0.3, Hg: 0.4, Pb: 20
}

// Map of CSV column name → DB column name
// Allows flexible casing in the CSV (e.g. "cr", "Cr", "CR" all work)
const METAL_COLUMNS: Record<string, string> = {
  Cr: 'cr_mg_kg', Mn: 'mn_mg_kg', Fe: 'fe_mg_kg',
  Co: 'co_mg_kg', Ni: 'ni_mg_kg', Cu: 'cu_mg_kg',
  Zn: 'zn_mg_kg', As: 'as_mg_kg', Cd: 'cd_mg_kg',
  Hg: 'hg_mg_kg', Pb: 'pb_mg_kg',
}

const IGEO_COLUMNS: Record<string, string> = {
  Cr: 'igeo_cr', Mn: 'igeo_mn', Fe: 'igeo_fe',
  Co: 'igeo_co', Ni: 'igeo_ni', Cu: 'igeo_cu',
  Zn: 'igeo_zn', As: 'igeo_as', Cd: 'igeo_cd',
  Hg: 'igeo_hg', Pb: 'igeo_pb',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scrubData(val: any): number | null {
  if (val === null || val === undefined || val === '') return null
  if (typeof val === 'number') return isNaN(val) ? null : val
  const cleaned = String(val).replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function calcIgeo(val: number | null, bg: number): number | null {
  if (val === null || val === 0) return null
  return Math.log2(val / (1.5 * bg))
}

function calcRiskLevel(pli: number): string {
  if (pli > 3.0) return 'VERY HIGH'
  if (pli > 2.0) return 'HIGH'
  if (pli > 1.0) return 'MODERATE'
  return 'LOW'
}

// Normalize CSV header to canonical metal name (e.g. "cr" → "Cr", "ZN" → "Zn")
function normalizeHeader(header: string): string | null {
  const upper = header.trim().toUpperCase()
  const match = Object.keys(BACKGROUND).find(k => k.toUpperCase() === upper)
  return match ?? null
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rawData = await request.json()

    console.log("SERVER SEES ROW 1 AS:", rawData[0])

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return NextResponse.json({ success: false, error: 'Empty or invalid CSV data' }, { status: 400 })
    }

    // ── Detect which metals are present in this CSV ──────────────────────────
    // Look at the first row's keys, normalize each, keep only known metals
    const firstRowKeys = Object.keys(rawData[0])
    const presentMetals: string[] = [] // canonical names e.g. ['Cr', 'Zn', 'Cu']

    for (const key of firstRowKeys) {
      const canonical = normalizeHeader(key)
      if (canonical) presentMetals.push(canonical)
    }

    if (presentMetals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recognized metal columns found in CSV. Expected columns like: Cr, Zn, Cu, Pb, As, Ni, Cd' },
        { status: 400 }
      )
    }

    // Build a lookup from canonical name → original CSV key (for row access)
    const metalKeyMap: Record<string, string> = {}
    for (const key of firstRowKeys) {
      const canonical = normalizeHeader(key)
      if (canonical) metalKeyMap[canonical] = key
    }

    const batchId = `batch_${Date.now()}`
    const processedRecords = []

    for (const row of rawData) {
      if (!row['Station_ID']) continue

      // ── Compute CF and clean values for present metals only ───────────────
      const cleanValues: Record<string, number | null> = {}
      const cfs: number[] = []

      for (const metal of presentMetals) {
        const rawVal = row[metalKeyMap[metal]]
        const clean = scrubData(rawVal)
        cleanValues[metal] = clean
        if (clean !== null && clean > 0) {
          cfs.push(clean / BACKGROUND[metal])
        }
      }

      if (cfs.length === 0) continue

      // ── PLI: geometric mean of CFs for present metals ─────────────────────
      const product = cfs.reduce((acc, cf) => acc * cf, 1)
      const pli = Math.pow(product, 1 / cfs.length)
      const riskLevel = calcRiskLevel(pli)

      // ── Build dynamic INSERT ───────────────────────────────────────────────
      // Always insert: batch_id, station_id, pli, risk_level
      // Only include metal/igeo columns that are present in this CSV
      const columns: string[] = ['batch_id', 'station_id']
      const values: any[] = [batchId, row['Station_ID']];

      for (const metal of presentMetals) {
        // Concentration column
        columns.push(METAL_COLUMNS[metal])
        values.push(cleanValues[metal])

        // Igeo column
        columns.push(IGEO_COLUMNS[metal])
        values.push(calcIgeo(cleanValues[metal], BACKGROUND[metal]))
      }

      columns.push('pli', 'risk_level')
      values.push(pli, riskLevel)

      // Build $1, $2, ... placeholders
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
      const query = `
        INSERT INTO sampling_stations (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `

      const dbResult = await pool.query(query, values)
      processedRecords.push(dbResult.rows[0])
    }

    return NextResponse.json({
      success: true,
      inserted: processedRecords.length,
      batchId,
      metalsDetected: presentMetals,   // useful for debugging / UI feedback
    })

  } catch (error) {
    console.error('Upload route error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}