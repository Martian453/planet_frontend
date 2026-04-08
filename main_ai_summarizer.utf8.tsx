"use client"

import { Bot, Terminal, Bell, AlertCircle, ChevronRight, Zap, TrendingDown } from "lucide-react"

interface Alert {
  id: string
  time: string
  message: string
  priority: "high" | "low"
}

const pinnedAlerts: Alert[] = [
  { id: "1", time: "10:32", message: "Borewell Level Critical: 0.12ft drop observed", priority: "high" },
  { id: "2", time: "10:35", message: "High Turbidity Detected in Main Pipe", priority: "high" },
]

const liveFeed: Alert[] = [
  { id: "3", time: "10:40", message: "Pump turned ON - System normal", priority: "low" },
  { id: "4", time: "10:42", message: "Water level stabilized at 11.2ft", priority: "low" },
  { id: "5", time: "10:45", message: "Power usage efficiency optimized: 8.4A", priority: "low" },
  { id: "6", time: "10:50", message: "Daily usage predicted: 1.2k Liters", priority: "low" },
  { id: "7", time: "10:52", message: "Leak Detection scan complete: All clear", priority: "low" },
]

export function AiSummarizerCard() {
  return (
    <div className="card-vibrant relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-900/40 p-3 backdrop-blur-xl border border-emerald-500/10">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Summarizer & Predictions
        </h3>
        <div className="flex items-center gap-2">
          <Terminal className="h-3 w-3 text-slate-500" />
          <span className="text-[9px] font-mono text-slate-500">SYSTEM_LOG: V2.1</span>
        </div>
      </div>

      {/* Pinned Alerts (High Priority) */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-3 w-3 text-red-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">Pinned Critical Alerts</span>
        </div>
        {pinnedAlerts.map(alert => (
          <div key={alert.id} className="rounded-lg bg-red-500/10 border border-red-500/20 p-0.5 flex gap-3 items-start group hover:bg-red-500/20 transition-all cursor-pointer">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-white leading-tight mb-0.5">{alert.message}</div>
              <div className="text-[9px] font-mono text-red-400/70">{alert.time} - PRIORITY_HIGH</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Scrolling Feed */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <ChevronRight className="h-3 w-3 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Live System Feed</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/40 pointer-events-none z-10" />
          <div className="space-y-3 pr-2 overflow-y-auto max-h-[160px] scrollbar-thin scrollbar-thumb-emerald-500/20">
            {liveFeed.map(item => (
              <div key={item.id} className="flex gap-3 items-start border-l-2 border-emerald-500/30 pl-3 py-0.5">
                <span className="text-[9px] font-mono text-emerald-500/50 mt-1">[{item.time}]</span>
                <p className="text-[10px] text-slate-300 leading-normal">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Prediction Chip */}
      <div className="mt-3 rounded-lg bg-white/5 p-2 flex items-center justify-between border border-white/10 group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-amber-400" />
          <span className="text-[11px] font-bold text-slate-400 uppercase">Power Predict</span>
        </div>
        <span className="text-[11px] font-mono font-bold text-amber-300">-12% Usage Target Met</span>
      </div>
    </div>
  )
}
