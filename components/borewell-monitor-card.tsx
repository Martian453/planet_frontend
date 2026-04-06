"use client"

import { Activity, Droplets, Zap, AlertTriangle, ArrowUpRight, TrendingDown } from "lucide-react"

interface BorewellData {
  flowRate: number
  pumpStatus: "ON" | "OFF" | "DRY RUN"
  voltage: number
  current: number
  efficiency: number
  litersAdded: number
  depletionRate: number
  leakDetected: boolean
}

const mockData: BorewellData = {
  flowRate: 42.5,
  pumpStatus: "ON",
  voltage: 232,
  current: 8.4,
  efficiency: 72,
  litersAdded: 850,
  depletionRate: 0.12,
  leakDetected: false,
}

export function BorewellMonitorCard() {
  return (
    <div className="card-vibrant relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-900/40 p-2 backdrop-blur-xl border border-white/5">
      <div className="mb-1.5 flex items-center justify-between border-b border-white/5 pb-1">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5">
          <Activity className="h-4 w-4" />
          Borewell Monitor
        </h3>
        <div className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${mockData.pumpStatus === "ON" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          }`}>
          {mockData.pumpStatus}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-1.5">
        {/* Row 1: Flow & Efficiency */}
        <div className="group relative overflow-hidden rounded-lg border border-white/5 bg-slate-900/40 p-2 transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/50">
          <div className="flex items-start justify-between mb-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Flow</span>
            <Droplets className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-slate-200 leading-none">{mockData.flowRate}</span>
            <span className="text-[10px] text-slate-500 font-bold">LPM</span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2 transition-all duration-300">
          <div className="flex items-start justify-between mb-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-cyan-400">Eff.</span>
            <ArrowUpRight className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-cyan-400 leading-none">{mockData.efficiency}%</span>
            <span className="text-[10px] text-cyan-600/70 font-bold uppercase">({mockData.litersAdded}L)</span>
          </div>
        </div>

        {/* Row 2: Power Metrics */}
        <div className="group relative overflow-hidden rounded-lg border border-white/5 bg-slate-900/40 p-2 transition-all duration-300">
          <div className="flex items-start justify-between mb-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Power</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-base font-mono font-bold text-amber-400">{mockData.voltage}V</span>
            <span className="text-[10px] font-mono text-amber-400/60 font-bold">{mockData.current}A</span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-lg border border-white/5 bg-slate-900/40 p-2 transition-all duration-300">
          <div className="flex items-start justify-between mb-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Table</span>
            <TrendingDown className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-mono font-bold text-blue-400 leading-none">-{mockData.depletionRate}</span>
            <span className="text-[10px] text-slate-500 uppercase">ft/d</span>
          </div>
        </div>

        {/* Leak & Alerts - Super Compact */}
        <div className={`col-span-2 relative overflow-hidden rounded-lg p-1.5 flex items-center justify-between border transition-all duration-300 ${mockData.leakDetected
          ? "bg-red-500/10 border-red-500/30 animate-pulse-slow"
          : "bg-emerald-500/5 border-emerald-500/20"
          }`}>
          <div className="flex items-center gap-2 relative z-10">
            <AlertTriangle className={`h-4 w-4 ${mockData.leakDetected ? "text-red-500" : "text-emerald-500"}`} />
            <div>
              <span className={`text-[12px] font-black uppercase tracking-widest ${mockData.leakDetected ? "text-red-400" : "text-emerald-400"}`}>
                {mockData.leakDetected ? "Leak Detected" : "No Leaks"}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nominal</span>

          <div className={`absolute right-0 top-0 h-full w-12 blur-xl opacity-20 pointer-events-none ${mockData.leakDetected ? "bg-red-500" : "bg-emerald-500"
            }`} />
        </div>
      </div>
    </div>
  );
}
