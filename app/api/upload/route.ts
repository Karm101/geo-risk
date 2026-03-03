import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const bg = {
  Cr: 90, Mn: 850, Fe: 47200, Co: 20, Ni: 68, 
  Cu: 45, Zn: 95, As: 13, Cd: 0.3, Hg: 0.4, Pb: 20
}

function scrubData(val: any): number | null {
  if (val === null || val === undefined || val === '') return null
  if (typeof val === 'number') return val
  const cleanedString = String(val).replace(/[^0-9.]/g, '')
  const parsedNumber = parseFloat(cleanedString)
  return isNaN(parsedNumber) ? null : parsedNumber
}

function calcIgeo(cleanVal: number | null, bgVal: number): number | null {
  if (cleanVal === null || cleanVal === 0) return null
  return Math.log2(cleanVal / (1.5 * bgVal))
}

export async function POST(request: Request) {
  try {
    const rawData = await request.json()
    const processedRecords = []
    
    // Generate one unique ID for this entire CSV upload
    const currentBatchId = `batch_${Date.now()}`

    for (const row of rawData) {
      if (!row.sampleName) continue

      const cleanCr = scrubData(row.Cr)
      const cleanMn = scrubData(row.Mn)
      const cleanFe = scrubData(row.Fe)
      const cleanCo = scrubData(row.Co)
      const cleanNi = scrubData(row.Ni)
      const cleanCu = scrubData(row.Cu)
      const cleanZn = scrubData(row.Zn)
      const cleanAs = scrubData(row.As)
      const cleanCd = scrubData(row.Cd)
      const cleanHg = scrubData(row.Hg)
      const cleanPb = scrubData(row.Pb)

      const cfs = []
      
      if (cleanCr) cfs.push(cleanCr / bg.Cr)
      if (cleanMn) cfs.push(cleanMn / bg.Mn)
      if (cleanFe) cfs.push(cleanFe / bg.Fe)
      if (cleanCo) cfs.push(cleanCo / bg.Co)
      if (cleanNi) cfs.push(cleanNi / bg.Ni)
      if (cleanCu) cfs.push(cleanCu / bg.Cu)
      if (cleanZn) cfs.push(cleanZn / bg.Zn)
      if (cleanAs) cfs.push(cleanAs / bg.As)
      if (cleanCd) cfs.push(cleanCd / bg.Cd)
      if (cleanHg) cfs.push(cleanHg / bg.Hg)
      if (cleanPb) cfs.push(cleanPb / bg.Pb)

      if (cfs.length === 0) continue

      const n = cfs.length
      const productOfCFs = cfs.reduce((total, current) => total * current, 1)
      const computedPLI = Math.pow(productOfCFs, 1 / n)

      const igeoCr = calcIgeo(cleanCr, bg.Cr)
      const igeoMn = calcIgeo(cleanMn, bg.Mn)
      const igeoFe = calcIgeo(cleanFe, bg.Fe)
      const igeoCo = calcIgeo(cleanCo, bg.Co)
      const igeoNi = calcIgeo(cleanNi, bg.Ni)
      const igeoCu = calcIgeo(cleanCu, bg.Cu)
      const igeoZn = calcIgeo(cleanZn, bg.Zn)
      const igeoAs = calcIgeo(cleanAs, bg.As)
      const igeoCd = calcIgeo(cleanCd, bg.Cd)
      const igeoHg = calcIgeo(cleanHg, bg.Hg)
      const igeoPb = calcIgeo(cleanPb, bg.Pb)

      let computedRiskLevel = 'LOW'
      if (computedPLI > 3.0) {
        computedRiskLevel = 'VERY HIGH'
      } else if (computedPLI > 2.0) {
        computedRiskLevel = 'HIGH'
      } else if (computedPLI > 1.0) {
        computedRiskLevel = 'MODERATE'
      }

      // Added batch_id to the database insert command
      const query = `
        INSERT INTO sampling_stations (
          batch_id, station_id, cr_mg_kg, mn_mg_kg, fe_mg_kg, co_mg_kg, ni_mg_kg, cu_mg_kg, zn_mg_kg, as_mg_kg, cd_mg_kg, hg_mg_kg, pb_mg_kg, 
          igeo_cr, igeo_mn, igeo_fe, igeo_co, igeo_ni, igeo_cu, igeo_zn, igeo_as, igeo_cd, igeo_hg, igeo_pb,
          pli, risk_level
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, 
          $25, $26
        )
        RETURNING *
      `
      
      const values = [
        currentBatchId, row.sampleName, cleanCr, cleanMn, cleanFe, cleanCo, cleanNi, cleanCu, cleanZn, cleanAs, cleanCd, cleanHg, cleanPb, 
        igeoCr, igeoMn, igeoFe, igeoCo, igeoNi, igeoCu, igeoZn, igeoAs, igeoCd, igeoHg, igeoPb,
        computedPLI, computedRiskLevel
      ]
      
      const dbResult = await pool.query(query, values)
      processedRecords.push(dbResult.rows[0])
    }

    return NextResponse.json({ success: true, inserted: processedRecords.length })

  } catch (error) {
    console.error("DATABASE CRASH REPORT:", error)
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 })
  }
}