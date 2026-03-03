import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

function igeoClassification(igeo: number): string {
  if (igeo < 0) return 'Practically Unpolluted'
  if (igeo < 1) return 'Unpolluted to Moderate'
  if (igeo < 2) return 'Moderately Polluted'
  if (igeo < 3) return 'Moderate to Strongly Polluted'
  if (igeo < 4) return 'Strongly Polluted'
  if (igeo < 5) return 'Strongly to Extremely Polluted'
  return 'Extremely Polluted'
}

const COVERAGE_THRESHOLD = 0.5 // metal must have data in at least 50% of stations

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const batch = searchParams.get('batch')

    if (!batch) {
      return NextResponse.json({ success: false, error: 'No batch specified' }, { status: 400 })
    }

    const [statsResult, riskResult] = await Promise.all([
      pool.query(`
        SELECT
          AVG(pli)          AS average_pli,
          COUNT(*)          AS station_count,
          AVG(igeo_cr)      AS igeo_cr,  COUNT(igeo_cr)  AS count_cr,
          AVG(igeo_mn)      AS igeo_mn,  COUNT(igeo_mn)  AS count_mn,
          AVG(igeo_fe)      AS igeo_fe,  COUNT(igeo_fe)  AS count_fe,
          AVG(igeo_co)      AS igeo_co,  COUNT(igeo_co)  AS count_co,
          AVG(igeo_ni)      AS igeo_ni,  COUNT(igeo_ni)  AS count_ni,
          AVG(igeo_cu)      AS igeo_cu,  COUNT(igeo_cu)  AS count_cu,
          AVG(igeo_zn)      AS igeo_zn,  COUNT(igeo_zn)  AS count_zn,
          AVG(igeo_as)      AS igeo_as,  COUNT(igeo_as)  AS count_as,
          AVG(igeo_cd)      AS igeo_cd,  COUNT(igeo_cd)  AS count_cd,
          AVG(igeo_hg)      AS igeo_hg,  COUNT(igeo_hg)  AS count_hg,
          AVG(igeo_pb)      AS igeo_pb,  COUNT(igeo_pb)  AS count_pb
        FROM sampling_stations
        WHERE batch_id = $1 AND is_archived = FALSE
      `, [batch]),
      pool.query(`
        SELECT risk_level, COUNT(*) AS count
        FROM sampling_stations
        WHERE batch_id = $1 AND is_archived = FALSE
        GROUP BY risk_level
      `, [batch])
    ])

    const result = statsResult

    const row = result.rows[0]

    if (!row || row.average_pli === null) {
      return NextResponse.json({ success: false, error: 'No data found for this batch' }, { status: 404 })
    }

    const total = parseInt(row.station_count)

    const metals = [
      { metal: 'Chromium',  symbol: 'Cr', value: parseFloat(row.igeo_cr), count: parseInt(row.count_cr) },
      { metal: 'Manganese', symbol: 'Mn', value: parseFloat(row.igeo_mn), count: parseInt(row.count_mn) },
      { metal: 'Iron',      symbol: 'Fe', value: parseFloat(row.igeo_fe), count: parseInt(row.count_fe) },
      { metal: 'Cobalt',    symbol: 'Co', value: parseFloat(row.igeo_co), count: parseInt(row.count_co) },
      { metal: 'Nickel',    symbol: 'Ni', value: parseFloat(row.igeo_ni), count: parseInt(row.count_ni) },
      { metal: 'Copper',    symbol: 'Cu', value: parseFloat(row.igeo_cu), count: parseInt(row.count_cu) },
      { metal: 'Zinc',      symbol: 'Zn', value: parseFloat(row.igeo_zn), count: parseInt(row.count_zn) },
      { metal: 'Arsenic',   symbol: 'As', value: parseFloat(row.igeo_as), count: parseInt(row.count_as) },
      { metal: 'Cadmium',   symbol: 'Cd', value: parseFloat(row.igeo_cd), count: parseInt(row.count_cd) },
      { metal: 'Mercury',   symbol: 'Hg', value: parseFloat(row.igeo_hg), count: parseInt(row.count_hg) },
      { metal: 'Lead',      symbol: 'Pb', value: parseFloat(row.igeo_pb), count: parseInt(row.count_pb) },
    ].filter(m => !isNaN(m.value) && m.count / total >= COVERAGE_THRESHOLD)

    if (metals.length === 0) {
      return NextResponse.json({ success: false, error: 'No metals with sufficient data coverage' }, { status: 404 })
    }

    const dominant = metals.reduce((max, m) => m.value > max.value ? m : max)

    // Build risk distribution
    const riskDistribution: Record<string, number> = { LOW: 0, MODERATE: 0, HIGH: 0, 'VERY HIGH': 0 }
    for (const r of riskResult.rows) {
      riskDistribution[r.risk_level] = parseInt(r.count)
    }

    return NextResponse.json({
      success: true,
      averagePli: parseFloat(parseFloat(row.average_pli).toFixed(4)),
      stationCount: total,
      riskDistribution,
      dominantPollutant: {
        metal: dominant.metal,
        symbol: dominant.symbol,
        igeo: parseFloat(dominant.value.toFixed(4)),
        classification: igeoClassification(dominant.value),
      }
    })
  } catch (error) {
    console.error('BATCH STATS CRASH:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch batch stats' }, { status: 500 })
  }
}