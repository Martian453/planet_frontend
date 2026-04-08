"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { ShieldCheck, Info, Zap, Droplets, Gauge } from 'lucide-react'
import { useMemo } from 'react'

const mockData = [
  { subject: 'Mechanical', A: 95, fullMark: 100, icon: <Zap /> },
  { subject: 'Hydrological', A: 78, fullMark: 100, icon: <Droplets /> },
  { subject: 'Chemical', A: 85, fullMark: 100, icon: <Gauge /> },
  { subject: 'Yield', A: 92, fullMark: 100, icon: <ActivityIcon /> },
  { subject: 'Power', A: 88, fullMark: 100, icon: <Zap /> },
]

function ActivityIcon() {
  return <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
}

export function BorewellHealthIndex() {
  const healthScore = useMemo(() => {
    return Math.round(mockData.reduce((acc, curr) => acc + curr.A, 0) / mockData.length)
  }, [])

  return (
    <div className="card-vibrant relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-md lg:backdrop-blur-xl border border-white/5 p-3 group">
      {/* Background Glow */}
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full blur-[80px] bg-blue-500/10 pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <ShieldCheck className="h-3 w-3 text-blue-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">System Health Index</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">BSHI Operational Verdict</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-mono font-bold text-white leading-tight">{healthScore}%</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">Optimal</span>
        </div>
      </div>

      {/* Radar Chart Container */}
      <div className="flex-1 min-h-0 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={mockData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Health"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.4}
              dot={{ r: 2, fill: '#60a5fa' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Diagnosis */}
      <div className="mt-2 flex items-start gap-2 rounded-lg bg-white/5 p-2 relative z-10 border border-white/5 transition-all hover:bg-white/10">
        <Info className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[9px] font-medium leading-tight text-slate-300">
            Diagnosis: <span className="text-white">Hydrological pressure stabilized.</span> Mechanical draw is within ±2% of nominal. No filtration alerts detected.
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Next Analysis: 2h</span>
            <div className="flex items-center gap-1 text-[8px] text-blue-400 font-mono font-bold">
              <span>SCANNING</span>
              <span className="flex h-1 w-1 rounded-full bg-blue-400 animate-ping"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
