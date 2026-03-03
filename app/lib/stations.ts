export type StationLocation = {
  river: string
  barangay: string
  latitude: number
  longitude: number
  elevation: number | null
}

export const STATION_COORDINATES: Record<string, StationLocation> = {
  // Pintatagan River
  'PTG 1': { river: 'Pintatagan', barangay: 'Brgy Pintatagan', latitude: 7.085845,  longitude: 126.023306, elevation: 320  },
  'PTG 2': { river: 'Pintatagan', barangay: 'Pintatagan',      latitude: 7.091582,  longitude: 125.979600, elevation: 72.7 },
  'PTG 3': { river: 'Pintatagan', barangay: 'Pintatagan',      latitude: 7.096349,  longitude: 125.959723, elevation: 39.7 },
  'PTG 4': { river: 'Pintatagan', barangay: 'Pintatagan',      latitude: 7.072994,  longitude: 125.944324, elevation: 14.9 },

  // Mapagba River
  'MPB 1': { river: 'Mapagba',    barangay: 'Maputi',          latitude: null,      longitude: null,       elevation: null }, // No data
  'MPB 2': { river: 'Mapagba',    barangay: 'Maputi',          latitude: 7.040726,  longitude: 126.004623, elevation: 76.3 },
  'MPB 3': { river: 'Mapagba',    barangay: 'Maputi',          latitude: 7.021255,  longitude: 125.996574, elevation: 17.4 },
  'MPB 4': { river: 'Mapagba',    barangay: 'Maputi',          latitude: 7.016468,  longitude: 125.988092, elevation: 15.2 },

  // Maputi River
  'MPT 1': { river: 'Maputi',     barangay: 'Causwagan',       latitude: 7.017820,  longitude: 126.015610, elevation: 59.4 },
  'MPT 2': { river: 'Maputi',     barangay: 'Maputi',          latitude: 7.030018,  longitude: 126.007441, elevation: 48.1 },
  'MPT 3': { river: 'Maputi',     barangay: 'Maputi',          latitude: 7.017411,  longitude: 126.005051, elevation: 17.9 },
  'MPT 4': { river: 'Maputi',     barangay: 'Maputi',          latitude: 7.013746,  longitude: 125.989783, elevation: 12.7 },
}