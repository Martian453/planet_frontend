"use client"

import { WaterDonutChart } from "../charts/water-donut-chart"
import { SpeedometerGauge } from "../environmental-core"
import { Droplets, Gauge } from "lucide-react"

interface WaterAnalysisSplitProps {
  waterData: any
  maxWaterLevel: number
  waterStatus: any
}

export function WaterAnalysisSplit({ waterData, maxWaterLevel, waterStatus }: WaterAnalysisSplitProps) {
  return (
    <div className="card-vibrant relative flex h-auto lg:h-full flex-row overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-md lg:backdrop-blur-xl border border-white/5 group">
      {/* Background Glow */}
      <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full blur-[80px] bg-cyan-500/10 pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700" />

      {/* Left: Water Composition Analysis */}
      <div className="flex-1 min-w-0 border-r border-white/5 pt-1 px-3 pb-3 flex flex-col">
        <div className="flex items-center justify-center gap-1.5 mb-1.5 border-b border-white/10 pb-1">
          <Droplets className="h-3.5 w-3.5 text-cyan-400" />
          <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-cyan-400">
            WQI Analysis
          </h3>
        </div>
        <div className="flex-1 min-h-0">
          <WaterDonutChart waterData={waterData} transparent={true} sideBySide={true} />
        </div>
      </div>

      {/* Right: Pump Performance Monitor */}
      <div className="flex-1 min-w-0 pt-1 px-3 pb-3 flex flex-col items-center">
        <div className="flex items-center justify-center gap-1.5 mb-1.5 border-b border-white/10 pb-1 w-full text-center">
          <Gauge className="h-3.5 w-3.5 text-cyan-400" />
          <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-cyan-400">
            Pump Monitor
          </h3>
        </div>
        <div className="flex-1 w-full flex items-center justify-center">
          <SpeedometerGauge
            value={Number.isFinite(waterData?.level ?? 0) ? Number((waterData?.level ?? 0).toFixed(2)) : 0}
            maxValue={Number.isFinite(maxWaterLevel) ? Number(maxWaterLevel.toFixed(2)) : 0}
            status={waterStatus ?? undefined}
            irms={waterData?.irms ?? 0}
            pumpStatus={waterData?.pump_status ?? 'N/A'}
          />
        </div>
      </div>
    </div >
  )
}
