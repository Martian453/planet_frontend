import { useState } from "react"
import { Activity, Droplets, Zap, AlertTriangle, ArrowUpRight, TrendingDown, Power, Clock } from "lucide-react"

interface BorewellMonitorProps {
  isMotorOn?: boolean
  onMotorToggle?: () => void
  data?: {
    flowRate: number | string
    efficiency: number | string
    voltage: number | string
    current: number | string
    runTime: string
    liters: string
  }
}

export function BorewellMonitorCard({ isMotorOn = true, onMotorToggle, data }: BorewellMonitorProps) {
  const displayData = data || {
    flowRate: 42.5,
    efficiency: 72,
    voltage: 232,
    current: 8.4,
    runTime: "4.5",
    liters: "850"
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl p-4 bg-[rgba(6,10,30,0.4)] backdrop-blur-[32px] border border-white/5 shadow-[0_6px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(124,255,154,0.05),0_0_40px_rgba(15,23,42,0.6)] transition-all duration-200">
      {/* Background Glow */}
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full blur-[80px] bg-cyan-500/10 pointer-events-none transition-colors duration-700" />

      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-[#00e5ff] flex items-center gap-2">
          <Activity className="h-4 w-4" strokeWidth={2.5} />
          Aquifer Monitor
        </h3>

        {/* Toggle Switch */}
        <button
          onClick={onMotorToggle}
          className={`relative w-14 h-6 flex items-center rounded-full transition-all duration-300 border ${isMotorOn ? "bg-[#022c22] border-[#059669]" : "bg-slate-800 border-slate-600"
            }`}
        >
          <span className={`absolute text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${isMotorOn ? "left-2 text-[#10b981]" : "right-1.5 text-slate-400"
            }`}>
            {isMotorOn ? "ON" : "OFF"}
          </span>
          <div className={`absolute h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 transform ${isMotorOn ? "translate-x-8 bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "translate-x-0.5 bg-slate-600"
            }`}>
            <Power className={`h-3 w-3 ${isMotorOn ? "text-[#022c22]" : "text-slate-300"}`} strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative mt-[9px]">
        {isMotorOn ? (
          <div className="min-h-[105px] grid grid-cols-4 gap-2">
            {/* BOX 1: FLOW */}
            <div className="flex flex-col justify-between rounded-[20px] bg-[#0f1522] border border-white/5 p-3 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 fill-mode-both">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mt-1">Flow</span>
                <div className="rounded-lg border border-[#00e5ff]/20 p-1 bg-[#00e5ff]/5">
                  <Droplets className="h-3.5 w-3.5 text-[#00e5ff]" strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[20px] font-black text-white tracking-tighter leading-none">{isMotorOn ? displayData.flowRate : "0.0"}</span>
                <span className="text-[9px] font-black text-[#64748b] uppercase tracking-widest">LPM</span>
              </div>
            </div>

            {/* BOX 2: EFF. */}
            <div className="flex flex-col justify-between rounded-[20px] bg-[#0f1522] border border-white/5 p-3 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 fill-mode-both delay-[50ms]">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#00e5ff] mt-1">Eff.</span>
                <ArrowUpRight className="h-4 w-4 text-[#00e5ff]" strokeWidth={2.5} />
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[20px] font-black text-[#00e5ff] tracking-tighter leading-none">{isMotorOn ? displayData.efficiency : "0"}%</span>
                {isMotorOn && <span className="text-[9px] font-black text-[#00e5ff]/50">(85)</span>}
              </div>
            </div>

            {/* BOX 3: POWER */}
            <div className="flex flex-col justify-between rounded-[20px] bg-[#0f1522] border border-white/5 p-3 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 fill-mode-both delay-[100ms]">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#94a3b8] mt-1">Power</span>
                <div className="rounded-lg border border-[#fbbf24]/20 p-1 bg-[#fbbf24]/5 shadow-[0_0_8px_rgba(251,191,36,0.1)]">
                  <Zap className="h-3.5 w-3.5 text-[#fbbf24]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[20px] font-black text-[#fbbf24] tracking-tighter leading-none">{displayData.voltage}V</span>
                <span className="text-[9px] font-black text-[#fbbf24]/70">{isMotorOn ? `${displayData.current}A` : "0.0A"}</span>
              </div>
            </div>

            {/* BOX 4: RUN TIME */}
            <div className="flex flex-col justify-between rounded-[20px] bg-[#0f1522] border border-white/5 p-3 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 fill-mode-both delay-[150ms]">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mt-1">Run Time</span>
                <div className="rounded-lg border border-[#3b82f6]/20 p-1 bg-[#3b82f6]/5">
                  <Clock className="h-3.5 w-3.5 text-[#3b82f6]" strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[20px] font-black text-[#3b82f6] tracking-tighter leading-none">{isMotorOn ? displayData.runTime : "0.0"}</span>
                <span className="text-[8px] font-black text-[#64748b] uppercase tracking-widest">HRS</span>
              </div>
            </div>
          </div>
        ) : (
          /* STANDBY STATE */
          <div className="h-full w-full flex flex-col items-center justify-center rounded-[20px] border border-white/5 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500">
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-slate-700/20 blur-xl rounded-full" />
              <Activity className="h-6 w-6 text-slate-600 relative animate-pulse" />
            </div>
            <div className="text-center group">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1 transition-colors group-hover:text-slate-400">Motor in off state</h4>
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-none">Command Awaited</p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ALERT STRIP */}
      <div className={`mt-4 rounded-full px-4 py-2 flex items-center justify-between border ${isMotorOn
        ? "bg-[#022c22] border-[#059669]"
        : "bg-slate-900 border-slate-700"
        }`}>
        <div className="flex-1 flex justify-center items-center gap-2">
          <AlertTriangle className={`h-3.5 w-3.5 ${isMotorOn ? "text-[#10b981]" : "text-slate-500"}`} strokeWidth={2.5} />
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isMotorOn ? "text-[#10b981]" : "text-slate-500"}`}>
            {isMotorOn ? "No Leaks" : "Standby Mode"}
          </span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${isMotorOn ? "text-slate-400" : "text-slate-600"}`}>
          {isMotorOn ? "Nominal" : "Offline"}
        </span>
      </div>
    </div>
  )
}


