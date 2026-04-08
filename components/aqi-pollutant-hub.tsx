"use client"

import { useState } from "react"
import { AirQualityCard } from "./air-quality-card"
import { MetricHistoryChart } from "./charts/aqi-forecast-chart"
import { PollutantDonutChart } from "./charts/pollutant-donut-chart"
import { calculateAQI } from "@/utils/aqi-calculator"
import { Maximize2, X, Activity, BarChart3, PieChart as PieChartIcon, ArrowDownCircle } from "lucide-react"

interface AQIPollutantHubProps {
  data: any
  activeMetric: string | null
  onMetricSelect: (metric: string | null) => void
  isOffline: boolean
  mode?: 'full' | 'compact'
  onExpand?: () => void
}

export function AQIPollutantHub({ data, activeMetric, onMetricSelect, isOffline, mode = 'full', onExpand }: AQIPollutantHubProps) {
  const [isInternalExpanded, setIsInternalExpanded] = useState(false)

  // Calculate Real AQI for the big header
  const aqi = calculateAQI({
    pm25: data.pm25,
    pm10: data.pm10,
    co: data.co / 1000,
    no2: data.no2,
    o3: data.o3,
    so2: data.so2,
  })

  const getAqiStatus = (val: number) => {
    if (val <= 50) return { text: "GOOD", color: "text-emerald-400", bg: "bg-emerald-500/20" }
    if (val <= 100) return { text: "MODERATE", color: "text-amber-400", bg: "bg-amber-500/20" }
    if (val <= 150) return { text: "UNHEALTHY FOR SENSITIVE", color: "text-orange-400", bg: "bg-orange-500/20" }
    if (val <= 200) return { text: "UNHEALTHY", color: "text-red-400", bg: "bg-red-500/20" }
    if (val <= 300) return { text: "VERY UNHEALTHY", color: "text-purple-400", bg: "bg-purple-500/20" }
    return { text: "HAZARDOUS", color: "text-rose-900", bg: "bg-rose-900/20" }
  }

  const status = getAqiStatus(aqi)

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsInternalExpanded(true)
    onExpand?.()
  }

  return (
    <>
      <div 
        className={`card-vibrant relative flex h-auto lg:h-full flex-col overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-md lg:backdrop-blur-xl border border-white/5 cursor-pointer group transition-all duration-300 hover:border-emerald-500/30 active:scale-[0.98] ${mode === 'compact' ? 'h-full' : ''}`}
        onClick={mode === 'compact' ? handleExpand : undefined}
      >
        {/* Header Section */}
        <div className="flex-none px-3 pt-3 pb-2 flex items-start justify-between">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <img src="/LOGOS/AQI.png" alt="AQI Logo" className="h-5 w-5 object-contain" />
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-400 opacity-90">
                AQI POLLUTANT LEVEL
              </h3>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`text-4xl font-extrabold tracking-tighter ${status.color} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                {aqi}
              </span>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-current ${status.bg} ${status.color}`}>
                {status.text}
              </div>
            </div>
          </div>

          {/* Expand Trigger */}
          <button 
            onClick={handleExpand}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Values & Tiles */}
        <div className="flex-1 px-1 py-1">
          <AirQualityCard
            data={data}
            activeMetric={activeMetric}
            onMetricSelect={onMetricSelect}
            isOffline={isOffline}
            compact
            transparent
          />
        </div>

        {/* Embedded Chart (Hidden if compact mode) */}
        {mode === 'full' && (
          <div className="h-[240px] lg:flex-1 bg-white/[0.01] mt-4">
            <MetricHistoryChart
              data={data.chartData.labels.map((l: string, i: number) => ({
                label: l,
                pm25: data.chartData.pm25[i],
                pm10: data.chartData.pm10[i],
                co: data.chartData.co[i],
                no2: data.chartData.no2[i],
                o3: data.chartData.o3?.[i] ?? 0,
                so2: data.chartData.so2?.[i] ?? 0
              }))}
              activeMetric={activeMetric}
              onMetricSelect={onMetricSelect}
              timeRange="1h"
              onTimeRangeChange={() => { }}
              compact
            />
          </div>
        )}
      </div>

      {/* EXPANDED DIAGNOSTIC OVERLAY */}
      {isInternalExpanded && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
           <div className="relative w-full h-full lg:w-[90vw] lg:h-[90vh] bg-slate-950/50 lg:border lg:border-white/10 lg:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
              
              {/* Header Overlay */}
              <div className="flex-none p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <Activity className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase">Atmospheric Diagnostics</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Vantage V2 Performance Mode</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInternalExpanded(false)}
                  className="p-3 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Scrollable Clinical Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-12 clinical-scroll">
                
                {/* Section 1: Interaction Line Graph */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Drift Analysis (Live)</span>
                  </div>
                  <div className="h-[400px] w-full bg-slate-900/30 rounded-2xl border border-white/5 p-4 relative">
                    <MetricHistoryChart
                      data={data.chartData.labels.map((l: string, i: number) => ({
                        label: l,
                        pm25: data.chartData.pm25[i],
                        pm10: data.chartData.pm10[i],
                        co: data.chartData.co[i],
                        no2: data.chartData.no2[i],
                        o3: data.chartData.o3?.[i] ?? 0,
                        so2: data.chartData.so2?.[i] ?? 0
                      }))}
                      activeMetric={activeMetric}
                      onMetricSelect={onMetricSelect}
                      timeRange="1h"
                      onTimeRangeChange={() => { }}
                    />
                    <div className="absolute bottom-4 right-4 animate-bounce">
                      <ArrowDownCircle className="h-6 w-6 text-emerald-400/50" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Cause Analysis (Pie Chart) - Reached via Scroll */}
                <div className="space-y-4 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-2 px-2">
                    <PieChartIcon className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Source Contribution Protocol</span>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-8 items-center bg-slate-900/20 rounded-2xl p-8 border border-white/5">
                    <div className="h-[350px] flex items-center justify-center">
                       <PollutantDonutChart data={data} transparent />
                    </div>
                    <div className="space-y-6">
                       <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <h4 className="text-emerald-400 text-sm font-black uppercase mb-2">Automated Verdict</h4>
                          <p className="text-slate-300 text-xs leading-relaxed font-medium">
                            Based on real-time data ingestion, <span className="text-white font-bold">PM2.5</span> represents the primary atmospheric particulate load. Mechanical filtration is advised if the safety score drifts below 65%. 
                          </p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                             <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Stability</span>
                             <span className="text-emerald-400 font-mono font-bold">NOMINAL</span>
                          </div>
                          <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                             <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Source</span>
                             <span className="text-cyan-400 font-mono font-bold">ATMOSPHERIC</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Buffer */}
                <div className="h-20" />
              </div>
           </div>
        </div>
      )}
    </>
  )
}
