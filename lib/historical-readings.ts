export type HistoricalPeriod = "week" | "month"

/**
 * Builds daily columns for the previous N calendar days (week = 7, month = 30).
 * Values are softly varied around the latest readings so the table looks coherent with the dashboard.
 */
export function buildHistoricalReadingsSeries(
  period: HistoricalPeriod,
  latestWater: number,
  latestAqiProxy: number
): { labels: string[]; waterLevels: number[]; aqiValues: number[] } {
  const days = period === "week" ? 7 : 30
  const labels: string[] = []
  const waterLevels: number[] = []
  const aqiValues: number[] = []

  const w0 = Number.isFinite(latestWater) ? latestWater : 5
  const a0 = Number.isFinite(latestAqiProxy) ? latestAqiProxy : 50

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    labels.push(
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    )
    const t = i / Math.max(1, days - 1)
    const drift = Math.sin(t * Math.PI * 2) * 0.08
    const noise = (Math.random() - 0.5) * 0.06
    waterLevels.push(
      Math.max(0, w0 * (0.92 + drift + noise))
    )
    aqiValues.push(
      Math.max(0, a0 * (0.94 + drift * 0.5 + noise))
    )
  }

  return { labels, waterLevels, aqiValues }
}
