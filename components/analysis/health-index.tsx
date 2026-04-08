"use client"

import { ShieldCheck, Wrench, Timer, Droplets, Zap, FlaskConical } from 'lucide-react'
import { useMemo } from 'react'

// ── Health Pillars ──────────────────────────────────────────────
interface HealthPillar {
  label: string
  score: number        // 0-100
  icon: React.ReactNode
  color: string
  glowColor: string
  status: string       // "NOMINAL" | "CAUTION" | "CRITICAL"
}

// ── Maintenance Prediction ──────────────────────────────────────
interface MaintenanceItem {
  label: string
  daysLeft: number
  icon: React.ReactNode
  urgency: 'low' | 'medium' | 'high'
}

export function BorewellHealthIndex() {
  // ── BSHI Calculation ──────────────────────────────────────
  // In production, these values would come from sensor data props.
  // Weights: Mechanical (35%), Hydrological (35%), Bio-Chemical (30%)
  const pillars: HealthPillar[] = useMemo(() => [
    {
      label: "Mechanical",
      score: 92,
      icon: <Zap className="h-3 w-3" />,
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.4)",
      status: "NOMINAL",
    },
    {
      label: "Hydrological",
      score: 78,
      icon: <Droplets className="h-3 w-3" />,
      color: "#f59e0b",
      glowColor: "rgba(245, 158, 11, 0.4)",
      status: "CAUTION",
    },
    {
      label: "Bio-Chemical",
      score: 88,
      icon: <FlaskConical className="h-3 w-3" />,
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.4)",
      status: "NOMINAL",
    },
  ], [])

  const overallScore = useMemo(() => {
    return Math.round(pillars[0].score * 0.35 + pillars[1].score * 0.35 + pillars[2].score * 0.30)
  }, [pillars])

  const verdictLabel = overallScore >= 85 ? "OPTIMAL" : overallScore >= 65 ? "CAUTION" : "CRITICAL"
  const verdictColor = overallScore >= 85 ? "text-emerald-400" : overallScore >= 65 ? "text-amber-400" : "text-red-400"
  const verdictBg = overallScore >= 85 ? "bg-emerald-500/10 border-emerald-500/20" : overallScore >= 65 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"

  // ── Maintenance Predictions ───────────────────────────────
  const maintenance: MaintenanceItem[] = useMemo(() => [
    {
      label: "Pump Service",
      daysLeft: 45,
      icon: <Wrench className="h-3 w-3 text-slate-400" />,
      urgency: 'low' as const,
    },
    {
      label: "Filter Change",
      daysLeft: 12,
      icon: <Timer className="h-3 w-3 text-amber-400" />,
      urgency: 'medium' as const,
    },
  ], [])

  // ── Helper: Get bar color based on score ──────────────────
  const getBarGradient = (score: number) => {
    if (score >= 85) return "from-emerald-500 to-emerald-400"
    if (score >= 65) return "from-amber-500 to-amber-400"
    return "from-red-500 to-red-400"
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-[rgba(6,10,30,0.5)] backdrop-blur-xl border border-white/5 p-3 group shadow-[0_6px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]">
      {/* Background Glow */}
      <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full blur-[80px] bg-blue-500/10 pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-3 relative z-10 border-b border-white/[0.06] pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-blue-400">System Health</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-mono font-black text-white leading-none">{overallScore}%</span>
          <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 border rounded-full ${verdictColor} ${verdictBg}`}>
            {verdictLabel}
          </span>
        </div>
      </div>

      {/* ── HEALTH PILLARS (Vertical Bars) ────────────────── */}
      <div className="flex-1 flex flex-row gap-2 relative z-10 min-h-0">
        {pillars.map((pillar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
            {/* Bar Container */}
            <div className="flex-1 w-full max-w-[28px] mx-auto relative rounded-lg bg-slate-800/60 border border-white/[0.04] overflow-hidden">
              {/* Fill Bar (animates from bottom) */}
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-lg bg-gradient-to-t ${getBarGradient(pillar.score)} transition-all duration-1000 ease-out`}
                style={{
                  height: `${pillar.score}%`,
                  boxShadow: `0 0 12px ${pillar.glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
              />
              {/* Score overlay */}
              <div className="absolute inset-0 flex items-start justify-center pt-1.5">
                <span className="text-[9px] font-mono font-black text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                  {pillar.score}
                </span>
              </div>
            </div>

            {/* Label + Icon */}
            <div className="flex flex-col items-center gap-0.5">
              <div style={{ color: pillar.color }}>{pillar.icon}</div>
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 text-center leading-tight">
                {pillar.label}
              </span>
              <span
                className="text-[6px] font-black uppercase tracking-wider px-1 py-px rounded-full border"
                style={{
                  color: pillar.color,
                  borderColor: `${pillar.color}33`,
                  backgroundColor: `${pillar.color}10`,
                }}
              >
                {pillar.status}
              </span>
            </div>
          </div>
        ))}

        {/* ── MAINTENANCE ROADMAP (Right Column) ─────────── */}
        <div className="w-[38%] flex flex-col justify-center gap-2 pl-2 border-l border-white/[0.06]">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-0.5">Maintenance</span>
          {maintenance.map((item, i) => {
            const urgencyColor = item.urgency === 'high' ? 'text-red-400' : item.urgency === 'medium' ? 'text-amber-400' : 'text-emerald-400'
            const urgencyBg = item.urgency === 'high' ? 'bg-red-500/5' : item.urgency === 'medium' ? 'bg-amber-500/5' : 'bg-emerald-500/5'
            return (
              <div key={i} className={`flex items-center gap-2 rounded-lg p-1.5 ${urgencyBg} border border-white/[0.03] transition-all hover:border-white/10`}>
                {item.icon}
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-slate-300 leading-tight">{item.label}</span>
                  <span className={`text-[10px] font-mono font-black leading-tight ${urgencyColor}`}>
                    ~{item.daysLeft} days
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── DIAGNOSIS FOOTER ─────────────────────────────── */}
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5 relative z-10 border border-white/[0.04]">
        <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <p className="text-[9px] font-medium text-slate-400 leading-tight flex-1">
          <span className="text-white font-bold">Hydraulic stable.</span> Aquifer recharge within ±5%. Chemical draw nominal.
        </p>
        <span className="text-[9px] text-blue-400 font-mono font-bold uppercase flex-shrink-0">Live</span>
      </div>
    </div>
  )
}
