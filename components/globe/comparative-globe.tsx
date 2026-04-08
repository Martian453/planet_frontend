"use client"

import { useEffect, useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { fetchGlobalAQData, type GlobalAQPoint } from '@/utils/aqi-comparison'
import { Activity, Globe as GlobeIcon, TrendingUp } from 'lucide-react'

// Dynamics import for Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="animate-pulse flex items-center justify-center h-full w-full bg-slate-900/20 rounded-xl">
    <GlobeIcon className="h-10 w-10 text-emerald-400" />
  </div>
})

export function GlobalComparativeGlobe() {
  const [data, setData] = useState<GlobalAQPoint[]>([])
  const [loading, setLoading] = useState(true)
  const globeEl = useRef<any>()

  useEffect(() => {
    async function loadData() {
      const globalData = await fetchGlobalAQData()
      setData(globalData)
      setLoading(false)
    }
    loadData()
  }, [])

  // Aesthetic configuration for the "Vantage" dark globe
  const globeConfig = {
    backgroundColor: 'rgba(0,0,0,0)',
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-night.jpg',
    bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    ringColor: (d: any) => (d.aqi > 100 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(52, 211, 153, 0.6)'),
    ringMaxRadius: 5,
    ringPropagationSpeed: 2,
    ringRepeatPeriod: 800,
  }

  // Calculate local vs global stats
  const globalAvg = useMemo(() => {
    if (data.length === 0) return 0
    return Math.round(data.reduce((acc, curr) => acc + curr.aqi, 0) / data.length)
  }, [data])

  return (
    <div className="card-vibrant relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-md lg:backdrop-blur-xl border border-white/5 p-0 group">
      {/* Header Overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            <GlobeIcon className="h-3 w-3 text-emerald-400" />
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Global AQI Pulse</h3>
        </div>
        <div className="space-y-0.5">
          <div className="text-[14px] font-mono font-bold text-white leading-tight">VANTAGE RANK</div>
          <div className="text-[10px] text-slate-500 font-medium">AVG: {globalAvg} AQI</div>
        </div>
      </div>

      {/* Comparison Badge */}
      <div className="absolute top-3 right-3 z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1 flex items-center gap-1.5 hover:bg-white/10 transition-colors pointer-events-none">
        <TrendingUp className="h-3 w-3 text-emerald-400" />
        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">Live Sync</span>
      </div>

      {/* 3D Globe Container */}
      <div className="flex-1 min-h-0 w-full relative">
        <Globe
          ref={globeEl}
          {...globeConfig}
          width={400} // Parent will constrain with CSS
          height={300}
          ringsData={data}
          ringColor={globeConfig.ringColor}
          ringMaxRadius={5}
          ringPropagationSpeed={2}
          ringRepeatPeriod={800}
          labelsData={data}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => d.city}
          labelSize={0.5}
          labelDotRadius={0.3}
          labelColor={() => 'rgba(255, 255, 255, 0.8)'}
          labelResolution={2}
        />
        
        {/* CSS Mask to ensure the globe fits within card and handles sizing */}
        <style jsx global>{`
          .card-vibrant > div > div {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          canvas {
            width: 100% !important;
            height: 100% !important;
            outline: none;
          }
        `}</style>
      </div>

      {/* Bottom Data Strip */}
      <div className="mt-auto border-t border-white/5 bg-slate-900/60 p-2 flex items-center justify-between text-[8px] uppercase tracking-widest text-slate-500">
        <div className="flex items-center gap-1.5">
          <Activity className="h-2.5 w-2.5 text-blue-400" />
          <span>Real-time Comparative Index</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></span>
            <span>Stable</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span>
            <span>Alert</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500"></div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">Syncing Globe...</span>
          </div>
        </div>
      )}
    </div>
  )
}
