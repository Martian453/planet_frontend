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
    <div className="card-vibrant relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#0b101a] p-3 backdrop-blur-xl border border-white/[0.03] transition-all duration-500">
      <div className="mb-2 flex items-center justify-between border-b border-white/[0.06] pb-3 pt-1 px-1">
        <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-[#00e5ff] flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#00e5ff]" strokeWidth={2} />
          Borewell Monitor
        </h3>

        {/* Sleek Motor Toggle Switch */}
        <button
          onClick={() => setIsMotorOn(!isMotorOn)}
          className={`relative group flex items-center gap-2 rounded-full px-2 py-1 transition-all duration-300 ${isMotorOn ? "bg-[#042f22] border border-[#059669]" : "bg-slate-800 border border-slate-600"
            }`}
        >
          <span className={`text-[11px] font-black uppercase tracking-widest ml-1 ${isMotorOn ? "text-[#10b981]" : "text-slate-400"
            }`}>
            {isMotorOn ? "ON" : "OFF"}
          </span>
          <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isMotorOn
            ? "bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            : "bg-slate-600"
            }`}>
            <Power className={`h-3 w-3 ${isMotorOn ? "text-[#022c22]" : "text-slate-300"}`} strokeWidth={3} />
          </div>
        </button>
      </div>

      <div className="flex-1 relative">
        {isMotorOn ? (
          <div className="grid grid-cols-2 gap-2.5 h-full py-1 animate-in fade-in zoom-in duration-700">
            {/* Row 1: Flow & Efficiency */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/[0.05] bg-[#111827] p-3.5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">Flow</span>
                <div className="p-1 rounded border border-[#00e5ff]/20 shadow-[0_0_10px_rgba(0,229,255,0.15)] bg-[#00e5ff]/[0.02]">
                  <Droplets className="h-4 w-4 text-[#00e5ff]" strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-bold text-white tracking-tight">{mockData.flowRate}</span>
                <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest">LPM</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-[#00e5ff]/20 bg-[#00e5ff]/[0.03] p-3.5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#00e5ff]">Eff.</span>
                <ArrowUpRight className="h-5 w-5 text-[#00e5ff]" strokeWidth={2.5} />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-bold text-[#00e5ff] tracking-tight">{mockData.efficiency}%</span>
                <span className="text-[11px] text-[#00e5ff]/60 font-bold uppercase tracking-widest">({mockData.litersAdded}L)</span>
              </div>
            </div>

            {/* Row 2: Power Metrics */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/[0.05] bg-[#111827] p-3.5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">Power</span>
                <div className="p-1 rounded border border-[#fbbf24]/20 shadow-[0_0_10px_rgba(251,191,36,0.1)] bg-[#fbbf24]/[0.02]">
                  <Zap className="h-4 w-4 text-[#fbbf24]" strokeWidth={2} fill="currentColor" fillOpacity={0.2} />
                </div>
              </div>
              <div className="flex items-end justify-between mt-2">
                <span className="text-[26px] font-bold text-[#fbbf24] tracking-tight leading-none">{mockData.voltage}V</span>
                <span className="text-[11px] text-[#d97706] font-bold tracking-widest">{mockData.current}A</span>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl border border-white/[0.05] bg-[#111827] p-3.5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">Table</span>
                <TrendingDown className="h-5 w-5 text-[#3b82f6]" strokeWidth={2.5} />
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-3xl font-bold text-[#3b82f6] tracking-tight">{mockData.depletionRate < 0 ? '' : '-'}{mockData.depletionRate}</span>
                <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest">FT/D</span>
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
      <div className={`mt-3 rounded-full px-4 py-3 flex items-center justify-between border transition-all duration-300 ${mockData.leakDetected
        ? "bg-[#3f1616] border-red-500/40 animate-pulse-slow"
        : "bg-[#042016] border-[#047857]"
        }`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${mockData.leakDetected ? "text-red-500" : "text-[#10b981]"}`} strokeWidth={2.5} />
          <span className={`text-[12px] font-black uppercase tracking-widest ${mockData.leakDetected ? "text-red-400" : "text-[#10b981]"}`}>
            {mockData.leakDetected ? "Leak Detected" : "No Leaks"}
          </span>
        </div>
        <span className="text-[11px] text-[#64748b] font-bold uppercase tracking-widest">Nominal</span>
      </div>
    </div>
  )
}
