"use client"

import { AirQualityCard } from "./air-quality-card"
import { MetricHistoryChart } from "./charts/aqi-forecast-chart"
import { calculateAQI } from "@/utils/aqi-calculator"

interface AQIPollutantHubProps {
  data: any
  activeMetric: string | null
  onMetricSelect: (metric: string | null) => void
  isOffline: boolean
}

export function AQIPollutantHub({ data, activeMetric, onMetricSelect, isOffline }: AQIPollutantHubProps) {
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

  return (
    <div className="card-vibrant relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/5">
      {/* Symmetrical Vertical Header (Top-Left) */}
      <div className="flex-none px-3 pt-1 pb-2">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1 mb-1">
            <img src="/LOGOS/AQI.png" alt="AQI Logo" className="h-6 w-6 object-contain shadow-sm" />
            <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-emerald-400 opacity-90">
              AQI Pollutant Level
            </h3>
          </div>
          <div className="flex items-center gap-3 ">
            <span className={`text-4xl font-extrabold tracking-tighter ${status.color} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
              {aqi}
            </span>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-current shadow-[0_0_10px_rgba(0,0,0,0.2)] ${status.bg} ${status.color}`}>
              {status.text}
            </div>
          </div>
        </div>
      </div>

      {/* Top Section: Values & Tiles (Freely Placed 3x2 Grid) */}
      <div className="flex-none px-1 py-1">
        <AirQualityCard
          data={data}
          activeMetric={activeMetric}
          onMetricSelect={onMetricSelect}
          isOffline={isOffline}
          compact
          transparent
        />
      </div>

      {/* Filter Hint */}
      {/* Bottom Section: History Chart - Expanded to fill space */}
      <div className="flex-1 min-h-[220px] bg-white/[0.01] mt-4">
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
    </div>
  )
}
