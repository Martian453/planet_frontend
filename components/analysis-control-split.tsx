"use client"

import { PollutantDonutChart } from "./charts/pollutant-donut-chart"
import { SpeedometerGauge } from "./environmental-core"

interface AnalysisControlSplitProps {
  airData: any
  waterData: any
  maxWaterLevel: number
  waterStatus: any
}

export function AnalysisControlSplit({ airData, waterData, maxWaterLevel, waterStatus }: AnalysisControlSplitProps) {
  return (
    <div className="card-vibrant relative flex h-full flex-row overflow-hidden rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/5">
      {/* Left: Cause Analysis */}
      <div className="flex-1 min-w-0 border-r border-white/5 pt-1 px-3 pb-3 flex flex-col">
        <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-cyan-400 mb-1.5 border-b border-white/10 pb-1 flex items-center justify-center">
          Cause Analysis
        </h3>
        <div className="flex-1 min-h-0">
          <PollutantDonutChart airData={airData} transparent={true} sideBySide={true} />
        </div>
      </div>

      {/* Right: Pump Monitor */}
      <div className="flex-1 min-w-0 pt-1 px-3 pb-3 flex flex-col items-center">
        <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-cyan-400 mb-1.5 border-b border-white/10 pb-1 w-full text-center">
          Pump Monitor
        </h3>
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
