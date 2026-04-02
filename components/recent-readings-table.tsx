"use client"

import { useEffect, useRef } from "react"
import { Maximize2, X } from "lucide-react"
import type { HistoricalPeriod } from "@/lib/historical-readings"

interface RecentReadingsTableProps {
  waterLevels: number[]
  aqiValues: number[]
  labels: string[]
  period: HistoricalPeriod
  onPeriodChange: (p: HistoricalPeriod) => void
  onExpand: () => void
  /** When true, table is shown inside the fullscreen overlay (hide expand affordance) */
  embeddedInModal?: boolean
}

export function RecentReadingsTable({
  waterLevels,
  aqiValues,
  labels,
  period,
  onPeriodChange,
  onExpand,
  embeddedInModal = false,
}: RecentReadingsTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [waterLevels, aqiValues, labels])

  const periodLabel =
    period === "week" ? "Previous 7 days" : "Previous 30 days"

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-2 backdrop-blur-xl">
      <div className="mb-1 flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Historical readings
          </h3>
          <p className="text-[10px] text-slate-500">{periodLabel} (daily)</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => onPeriodChange("week")}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                period === "week"
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => onPeriodChange("month")}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                period === "month"
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Month
            </button>
          </div>
          {!embeddedInModal && (
            <button
              type="button"
              onClick={onExpand}
              className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-cyan-400/80 transition-colors hover:bg-white/10 hover:text-cyan-300"
              title="Expand table"
              aria-label="Expand historical readings"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-1">
        <table className="w-max min-w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="sticky left-0 z-[1] w-[72px] bg-slate-900/95 px-1 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Metric
              </th>
              {labels.map((label, idx) => (
                <th
                  key={`${label}-${idx}`}
                  className="w-10 px-0.5 py-1.5 text-center text-[8px] font-medium uppercase tracking-wider text-slate-400 sm:w-11"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="sticky left-0 z-[1] bg-slate-900/95 px-1 py-1 text-[10px] font-semibold text-cyan-400">
                Water Lvl
              </td>
              {waterLevels.map((value, idx) => (
                <td
                  key={idx}
                  className="px-0.5 py-1 text-center text-[10px] font-mono text-white sm:text-[11px]"
                >
                  {value.toFixed(1)}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="sticky left-0 z-[1] bg-slate-900/95 px-1 py-1 text-[10px] font-semibold text-orange-400">
                AQI (PM2.5)
              </td>
              {aqiValues.map((value, idx) => (
                <td
                  key={idx}
                  className="px-0.5 py-1 text-center text-[10px] font-mono text-white sm:text-[11px]"
                >
                  {value.toFixed(0)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-500/10" />
    </div>
  )
}

interface RecentReadingsExpandModalProps {
  open: boolean
  onClose: () => void
  waterLevels: number[]
  aqiValues: number[]
  labels: string[]
  period: HistoricalPeriod
  onPeriodChange: (p: HistoricalPeriod) => void
}

export function RecentReadingsExpandModal({
  open,
  onClose,
  ...tableProps
}: RecentReadingsExpandModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Historical readings expanded"
      onClick={onClose}
    >
      <div
        className="relative flex h-[min(85vh,720px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Historical readings
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 p-3">
          <RecentReadingsTable {...tableProps} embeddedInModal onExpand={() => {}} />
        </div>
      </div>
    </div>
  )
}
