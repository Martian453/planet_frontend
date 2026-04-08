"use client"

import { PollutantDonutChart } from "./charts/pollutant-donut-chart"
import { X, Maximize2, Minimize2, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    ReferenceLine,
    Tooltip,
    ComposedChart,
    Bar,
    Legend,
    Cell,
} from "recharts"

interface ChartModalProps {
    isOpen: boolean
    onClose: () => void
    chartType: "aqi" | "water" | null
    data: Record<string, any>[]
    selectedPollutant: string | null
    onPollutantSelect: (pollutant: string | null) => void
    selectedWaterMetric: string | null
    onWaterMetricSelect: (metric: string | null) => void
}

const pollutantConfig: Record<string, { color: string; label: string }> = {
    pm25: { color: "#10b981", label: "PM2.5" }, // Emerald 500
    pm10: { color: "#f59e0b", label: "PM10" },  // Amber 500
    co: { color: "#06b6d4", label: "CO" },      // Cyan 500
    no2: { color: "#8b5cf6", label: "NO2" },    // Violet 500
    o3: { color: "#3b82f6", label: "O3" },      // Blue 500
    so2: { color: "#ef4444", label: "SO2" },    // Red 500
}

const waterMetricConfig: Record<string, { color: string; label: string }> = {
    level: { color: "#06b6d4", label: "Water Level" }, // Cyan 500
    ph: { color: "#10b981", label: "pH Level" },       // Emerald 500
    tds: { color: "#f59e0b", label: "TDS" },// Amber 500
}

export function ChartModal({
    isOpen,
    onClose,
    chartType,
    data,
    selectedPollutant,
    onPollutantSelect,
    selectedWaterMetric,
    onWaterMetricSelect,
}: ChartModalProps) {
    if (!isOpen) return null

    const visiblePollutants = selectedPollutant
        ? [selectedPollutant]
        : Object.keys(pollutantConfig)

    // Filter water data based on selected metric
    const waterMetrics = ["level", "ph", "tds"];
    const visibleWaterMetrics = selectedWaterMetric ? [selectedWaterMetric] : waterMetrics;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-[95vw] h-[90vh] bg-[#020617] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-20 bg-white/5 p-2 rounded-full hover:bg-white/10"
                >
                    <X className="w-6 h-6" />
                </button>

                {chartType === "aqi" && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                                        Atmospheric Analysis
                                    </span>
                                    <span className="text-sm font-normal text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
                                        Vantage Diagnostic Suite
                                    </span>
                                </h2>
                                <p className="text-slate-400 mt-1">Total environmental audit for the selected location.</p>
                            </div>
                        </div>

                        {/* Interactive Legend and Global Control */}
                        <div className="flex flex-wrap items-center gap-3 mb-4 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Filters:</span>
                            {Object.entries(pollutantConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => onPollutantSelect(selectedPollutant === key ? null : key)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium border ${selectedPollutant === key
                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                        : selectedPollutant && selectedPollutant !== key
                                            ? "opacity-40 bg-transparent border-transparent text-slate-500"
                                            : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/10"
                                        }`}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                                    <span>{config.label}</span>
                                </button>
                            ))}
                            {selectedPollutant && (
                                <button
                                    onClick={() => onPollutantSelect(null)}
                                    className="ml-auto text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-2"
                                >
                                    <Minimize2 className="h-4 w-4" /> Reset Filters
                                </button>
                            )}
                        </div>

                        {/* Main Interaction Area */}
                        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
                            {/* Left/Main Column: Time History */}
                            <div className="flex-[7] min-h-0 bg-slate-950/60 rounded-2xl border border-white/10 p-4 relative overflow-hidden group">
                                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pollutant Drift</span>
                                </div>
                                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />
                                
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data} margin={{ top: 40, right: 30, left: 0, bottom: 20 }}>
                                        <XAxis
                                            dataKey="time"
                                            tick={{ fill: "#64748b", fontSize: 10 }}
                                            axisLine={{ stroke: "#1e293b" }}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fill: "#64748b", fontSize: 10 }}
                                            axisLine={{ stroke: "#1e293b" }}
                                            tickLine={false}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0f172a",
                                                border: "1px solid #1e293b",
                                                borderRadius: "12px",
                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                                                color: "#f1f5f9"
                                            }}
                                            itemStyle={{ padding: "2px 0", fontSize: "11px" }}
                                            labelStyle={{ fontSize: "10px", color: "#64748b", fontWeight: "bold", marginBottom: "4px" }}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />

                                        {visiblePollutants.map((key) => (
                                            <Line
                                                key={key}
                                                type="monotone"
                                                dataKey={key}
                                                stroke={pollutantConfig[key].color}
                                                strokeWidth={2}
                                                dot={{ r: 2, strokeWidth: 1, fill: "#0f172a" }}
                                                activeDot={{ r: 5, strokeWidth: 0 }}
                                                name={pollutantConfig[key].label}
                                                animationDuration={1500}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Right Column: Instant Contribution (Donut) */}
                            <div className="flex-[3] min-h-0 flex flex-col gap-4">
                                <div className="flex-1 bg-slate-950/60 rounded-2xl border border-white/10 p-1 flex flex-col relative overflow-hidden group">
                                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                                      <PieChartIcon className="h-4 w-4 text-cyan-400" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contribution</span>
                                    </div>
                                    <PollutantDonutChart 
                                        airData={data.length > 0 ? {
                                            pm25: data[data.length - 1].pm25,
                                            pm10: data[data.length - 1].pm10,
                                            co: data[data.length - 1].co,
                                            no2: data[data.length - 1].no2,
                                            so2: data[data.length - 1].so2,
                                            o3: data[data.length - 1].o3
                                        } : undefined} 
                                        transparent 
                                    />
                                </div>
                                
                                {/* Info Strip */}
                                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-emerald-400" />
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Health Verdict</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                        The system has detected stable concentrations. Particulate matter contributes to approx. <span className="text-white font-bold">42%</span> of total index.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {chartType === "water" && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                                        Groundwater Analysis
                                    </span>
                                    <span className="text-sm font-normal text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
                                        Historical Data
                                    </span>
                                </h2>
                                <p className="text-slate-400 mt-1">Detailed trends for Level, pH, and TDS.</p>
                            </div>
                        </div>

                        {/* Current Summary Tiles */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {Object.entries(waterMetricConfig).map(([key, config]) => {
                                const latestVal = data.length > 0 ? (data[data.length - 1] as any)[key] : 0;
                                const unit = key === "level" ? "ft" : key === "tds" ? "ppm" : "";
                                return (
                                    <div 
                                        key={key}
                                        className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-xl group hover:border-cyan-500/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{config.label}</span>
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]" style={{ backgroundColor: config.color }} />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-mono font-bold text-white tracking-tighter">
                                                {typeof latestVal === 'number' ? latestVal.toFixed(1) : latestVal}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Interactive Legend for Water Metrics */}
                        <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Filters:</span>
                            {Object.entries(waterMetricConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => onWaterMetricSelect(selectedWaterMetric === key ? null : key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium border ${selectedWaterMetric === key
                                        ? "bg-slate-800 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                        : selectedWaterMetric && selectedWaterMetric !== key
                                            ? "opacity-40 bg-transparent border-transparent text-slate-500"
                                            : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/10"
                                        }`}
                                >
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: config.color }} />
                                    <span>{config.label}</span>
                                </button>
                            ))}
                            {selectedWaterMetric && (
                                <button
                                    onClick={() => onWaterMetricSelect(null)}
                                    className="ml-auto text-cyan-400 hover:text-cyan-300 text-sm font-bold flex items-center gap-2"
                                >
                                    <Minimize2 className="h-4 w-4" /> Reset View
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-h-0 bg-slate-900/30 rounded-2xl border border-white/5 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                        axisLine={{ stroke: "#1e293b" }}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                        axisLine={{ stroke: "#1e293b" }}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            border: "1px solid #1e293b",
                                            borderRadius: "12px",
                                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                                            color: "#f1f5f9"
                                        }}
                                        itemStyle={{ padding: "2px 0" }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />

                                    {visibleWaterMetrics.map(key => (
                                        <Line
                                            key={key}
                                            type="monotone"
                                            dataKey={key}
                                            stroke={waterMetricConfig[key].color}
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                            name={waterMetricConfig[key].label}
                                            animationDuration={1500}
                                        />
                                    ))}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
