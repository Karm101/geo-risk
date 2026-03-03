'use client'

import dynamic from 'next/dynamic'

// We dynamically import the actual map and explicitly tell Next.js to disable Server-Side Rendering (SSR)
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400 font-mono text-sm animate-pulse">INITIALIZING POSTGIS MAP ENGINE...</p>
    </div>
  )
})

export default function MapWrapper(props: any) {
  return <MapComponent {...props} />
}