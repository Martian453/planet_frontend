import { useState } from "react"
import { Activity, Droplets, Zap, AlertTriangle, ArrowUpRight, TrendingDown, Power } from "lucide-react"

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
  const [isMotorOn, setIsMotorOn] = useState(true);

  return (
    <div className="card-vibrant relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-900/40 p-2 backdrop-blur-xl border border-white/5 transition-all duration-500">
      <div className="mb-1.5 flex items-center justify-between border-b border-white/5 pb-1">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-1.5">
          <Activity className="h-4 w-4" />
          Borewell Monitor
        </h3>

        {/* Sleek Motor Toggle Switch */}
        <button
          onClick={() => setIsMotorOn(!isMotorOn)}
          className={`relative group flex items-center h-5 w-10 rounded-full transition-all duration-300 mr-3 ${isMotorOn ? "bg-emerald-500/20 ring-1 ring-emerald-500/40" : "bg-slate-800/80 ring-1 ring-white/10"
            }`}
        >
          <div className={`absolute left-0.5 h-4 w-4 rounded-full transition-all duration-500 flex items-center justify-center ${isMotorOn
            ? "translate-x-5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            : "translate-x-0 bg-slate-500"
            }`}>
            <Power className={`h-3 w-3 ${isMotorOn ? "text-emerald-900" : "text-slate-200"}`} strokeWidth={3} />
          </div>
          <span className={`absolute ${isMotorOn ? "left-1.5" : "right-1.5"} text-[10px] font-black uppercase tracking-tighter ${isMotorOn ? "text-emerald-400" : "text-slate-500"
            }`}>
            {isMotorOn ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      <div className="flex-1 relative">
        {isMotorOn ? (
          <div className="grid grid-cols-2 gap-1.5 animate-in fade-in zoom-in duration-500">
            {/* Row 1: Flow & Efficiency */}
            <div className="group relative overflow-hidden rounded-lg border border-white/5 bg-slate-900/40 p-2 transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/50">
              <div className="flex items-start justify-between mb-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Flow</span>
                <Droplets className="h-4 w-4 text-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.4)]" />
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
                <Zap className="h-4 w-4 text-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.4)]" />
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
          </div>
        ) : (
          /* Standby View: High-Density Empty State */
          <div className="h-full w-full flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-700">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-slate-500/20 blur-xl rounded-full" />
              <Activity className="h-8 w-8 text-slate-600 relative animate-pulse" />
            </div>
            <div className="text-center">
              <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Motor Standby</h4>
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-none">Awaiting Operational Command</p>
            </div>

            {/* Subtle tech background line */}
            <div className="absolute right-2 bottom-2 h-1 w-24 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-slate-700/50 animate-shimmer" />
            </div>
          </div>
        )}
      </div>

      {/* Leak & Alerts - Always Visible */}
      <div className={`mt-2 relative overflow-hidden rounded-lg p-2.5 flex items-center justify-between border transition-all duration-300 ${mockData.leakDetected
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
  );
}
