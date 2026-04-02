"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { AirQualityCard } from "@/components/air-quality-card"
import { SpeedometerGauge } from "@/components/environmental-core"
import { WaterQualityCard } from "@/components/water-quality-card"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { PollutantDonutChart } from "@/components/charts/pollutant-donut-chart"
import { MetricHistoryChart } from "@/components/charts/aqi-forecast-chart"
import { RecentReadingsTable, RecentReadingsExpandModal } from "@/components/recent-readings-table"
import { ChartModal } from "@/components/chart-modal"
import dynamic from "next/dynamic"
import { useRealtimeData } from "@/hooks/useRealtimeData"
import { useAuth } from "@/components/auth-provider"
import { getApiUrl } from "@/lib/api-url"
import { buildHistoricalReadingsSeries, type HistoricalPeriod } from "@/lib/historical-readings"
import { Wifi, WifiOff, Cpu, MapPin, Trash2 } from "lucide-react"

type AirState = {
    pm25: number; pm10: number; co: number; no2: number; o3: number; so2: number;
    chartData: { labels: string[], pm25: number[], pm10: number[], co: number[], no2: number[], o3: number[], so2: number[] }
};

type WaterState = {
    level: number; ph: number; tds: number; irms: number; pump_status: string;
    chartData: { labels: string[], level: number[], ph: number[], tds: number[] }
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function rand(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function nextRandomWalk(prev: number, delta: number, min: number, max: number) {
    return clamp(prev + rand(-delta, delta), min, max);
}

function timeLabelNow() {
    return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

// Dynamically import Leaflet map
const LeafletMapCard = dynamic(
    () => import("@/components/leaflet-map-card").then((mod) => mod.LeafletMapCard),
    { ssr: false }
)

export function PrivateDashboard() {
    const { token, user } = useAuth();
    const demoMode = (!token) || (process.env.NEXT_PUBLIC_DEMO_MODE === "true");
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [maxWaterLevel, setMaxWaterLevel] = useState(0)
    const hasAutoSelected = useRef(false); // Track smart auto-selection
    const [waterStatus, setWaterStatus] = useState<string | null>(null)
    // PRODUCTIZATION STATE
    const [activeMetric, setActiveMetric] = useState("pm25");
    const [activeWaterMetric, setActiveWaterMetric] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'aqi' | 'water' | null }>({ isOpen: false, type: null });
    const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("1h");
    const [readingsPeriod, setReadingsPeriod] = useState<HistoricalPeriod>("week")
    const [readingsModalOpen, setReadingsModalOpen] = useState(false)

    // HYDRATION GUARD INITIALIZATION
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Navigation State
    const [activeView, setActiveView] = useState("dashboard")

    // Location Management
    const [locations, setLocations] = useState<any[]>([])
    const [currentLocation, setCurrentLocation] = useState("")
    const [capabilities, setCapabilities] = useState({ has_aqi: true, has_water: true })

    // Devices State
    const [myDevices, setMyDevices] = useState<any[]>([])

    // Real-Time Data Hook (Pass Token!)
    const { data: wsData, isConnected: wsConnected, isLive, lastMessageTime, isOffline: wsOffline } = useRealtimeData(currentLocation, token);

    // --- DATA STATES (Granular) ---
    const [lastAirTime, setLastAirTime] = useState(0);
    const [lastWaterTime, setLastWaterTime] = useState(0);
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update 'currentTime' every second for offline calc
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const isAirOffline = currentTime - lastAirTime > 30000;
    const isWaterOffline = currentTime - lastWaterTime > 30000;

    // Status Logic
    let locationStatus: "ONLINE" | "PARTIAL" | "OFFLINE" = "OFFLINE";
    if (!isAirOffline && !isWaterOffline) locationStatus = "ONLINE";
    else if (!isAirOffline || !isWaterOffline) locationStatus = "PARTIAL";

    const [airData, setAirData] = useState<AirState | null>(null);

    const [waterData, setWaterData] = useState<WaterState | null>(null);

    // --- ONLINE DETECTION (POLLING /api/locations/status) ---
    const [isSystemOnline, setIsSystemOnline] = useState(false);
    const [locationsStatus, setLocationsStatus] = useState<Record<string, { location_id: string; online: boolean; last_seen: string | null; latitude: number | null; longitude: number | null; name: string }>>({});

    // API URL helper from shared utility

    useEffect(() => {
        if (demoMode) return;
        if (!token) return;

        const checkStatus = async () => {
            try {
                const res = await fetch(getApiUrl("/api/locations/status"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data: Array<{ location_id: string; online: boolean; last_seen: string | null; latitude: number | null; longitude: number | null; name: string }> = await res.json();
                    // Map for easy lookup
                    const statusMap: Record<string, { location_id: string; online: boolean; last_seen: string | null; latitude: number | null; longitude: number | null; name: string }> = {};
                    let anyOnline = false;
                    let currentLocOnline = false;

                    data.forEach(loc => {
                        statusMap[loc.location_id] = loc;
                        if (loc.online) {
                            anyOnline = true;
                        }
                        if (loc.location_id === currentLocation && loc.online) currentLocOnline = true;
                    });

                    // SMART AUTO-SWITCH LOGIC
                    // If current location is OFFLINE, but we found another one ONLINE, switch to it!
                    if (!currentLocOnline && anyOnline) {
                        const onlineLoc = data.find(l => l.online);
                        if (onlineLoc) {
                            console.log(`🚀 Auto-switching from offline ${currentLocation} to online ${onlineLoc.location_id}`);
                            setCurrentLocation(onlineLoc.location_id);

                            // Reset data states
                            setAirData(null);
                            setWaterData(null);
                            setMaxWaterLevel(0);

                            // Assume new location is online immediately for UI snappiness
                            currentLocOnline = true;
                        }
                    } else if (!hasAutoSelected.current && data.length > 0) {
                        // Initial Load Fallback
                        const firstOnline = data.find(l => l.online);
                        if (firstOnline && (!currentLocation || firstOnline.location_id !== currentLocation)) {
                            console.log("🚀 Initial Auto-select:", firstOnline.location_id);
                            setCurrentLocation(firstOnline.location_id);
                            currentLocOnline = true;
                        }
                        hasAutoSelected.current = true;
                    }

                    setLocationsStatus(statusMap);

                    // Force update if we just auto-switched
                    setIsSystemOnline(currentLocOnline);
                }
            } catch (err) {
                console.warn("Location status poll failed", err);
                setIsSystemOnline(false);
            }
        };

        // Poll every 5 seconds
        const interval = setInterval(checkStatus, 5000);
        checkStatus();

        return () => clearInterval(interval);
    }, [token, currentLocation, demoMode]);

    // SYSTEM STATUS: Driven by CLIENT SIDE HOOK (Priority) + Polling fallback
    useEffect(() => {
        if (demoMode) {
            setIsSystemOnline(true);
            return;
        }
        // If WebSocket hook says we are LIVE, we are definitely online.
        if (isLive && !wsOffline) {
            setIsSystemOnline(true);
        } else {
            // Fallback: If Hook is offline (maybe socket closed), check Polling status
            const locStatus = locationsStatus[currentLocation];
            // If polling says online, we trust it (maybe using HTTP ingest)
            setIsSystemOnline(locStatus?.online || false);
        }
    }, [isLive, wsOffline, locationsStatus, currentLocation, demoMode]);


    // 1. Fetch Locations on Mount (Auth)
    useEffect(() => {
        if (demoMode) return;
        if (!token) return;

        fetch(getApiUrl("/api/locations"), {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setLocations(data);
                    // Set default only if not set
                    if (!currentLocation) setCurrentLocation(data[0].name);
                }
            })
            .catch(err => console.error("Failed to fetch locations:", err));
    }, [token, demoMode]);

    // 2. Clear State on Location Switch
    const handleLocationSelect = (locName: string) => {
        setCurrentLocation(locName);
        setAirData(null);
        setWaterData(null);
        setMaxWaterLevel(0);
        setActiveView("dashboard");

        // Immediate status check for new location from cache
        if (locationsStatus[locName]?.online) {
            setIsSystemOnline(true);
        } else {
            setIsSystemOnline(false);
        }

        // Fetch Capabilities... (existing code)
        if (token) {
            fetch(getApiUrl(`/api/location/${locName}/capabilities`), {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data && typeof data.has_aqi === 'boolean') {
                        setCapabilities({ has_aqi: data.has_aqi, has_water: data.has_water });
                    } else {
                        // Default to showing everything if endpoint is missing or data is invalid
                        console.warn("Capabilities endpoint missing or invalid, defaulting to FULL DASHBOARD");
                        setCapabilities({ has_aqi: true, has_water: true });
                    }
                })
                .catch((err) => {
                    console.error("Capabilities fetch error:", err);
                    setCapabilities({ has_aqi: true, has_water: true });
                });
        }
    }

    // 3. Fetch Devices... (Existing)
    const fetchDevices = () => {
        if (demoMode) return;
        if (token) {
            fetch(getApiUrl("/api/devices"), {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setMyDevices(data))
                .catch(err => console.error("Failed devices:", err));
        }
    }

    useEffect(() => {
        fetchDevices(); // Always fetch on mount for sensor status display
    }, [token, demoMode]);

    useEffect(() => {
        if (activeView === "devices") {
            fetchDevices();
        }
    }, [activeView, token, demoMode]);

    const handleDeleteDevice = async (deviceId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (demoMode) {
            setMyDevices(prev => prev.filter(d => d.device_id !== deviceId));
            return;
        }
        if (!confirm(`Are you sure you want to delete device ${deviceId}? This action cannot be undone.`)) return;

        try {
            const res = await fetch(getApiUrl(`/api/devices/${deviceId}`), {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                // Optimistic UI Update: Remove immediately
                setMyDevices(prev => prev.filter(d => d.device_id !== deviceId));
                // Optional: Background re-fetch to be safe
                fetchDevices();
            } else {
                alert("Failed to delete device");
            }
        } catch (err) {
            console.error(err);
        }
    }

    // 4. Update State... (Existing)
    useEffect(() => {
        if (demoMode) return;
        if (wsData && (wsData.type === 'aqi' || wsData.type === 'aqi_camera')) {
            setAirData(prev => {
                const currentChart = prev?.chartData || { labels: [], pm25: [], pm10: [], co: [], no2: [], o3: [], so2: [] };
                // Use lastMessageTime from hook if available, or current time
                const timeLabel = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                const newLabels = [...currentChart.labels, timeLabel].slice(-100);

                setLastAirTime(Date.now()); // Update last seen for Air

                return {
                    pm25: wsData.data.pm25,
                    pm10: wsData.data.pm10,
                    co: wsData.data.co,
                    no2: wsData.data.no2,
                    o3: wsData.data.o3,
                    so2: wsData.data.so2,
                    chartData: {
                        labels: newLabels,
                        pm25: [...currentChart.pm25, wsData.data.pm25].slice(-100),
                        pm10: [...currentChart.pm10, wsData.data.pm10].slice(-100),
                        co: [...currentChart.co, wsData.data.co].slice(-100),
                        no2: [...currentChart.no2, wsData.data.no2].slice(-100),
                        o3: [...(currentChart.o3 || []), wsData.data.o3].slice(-100),
                        so2: [...(currentChart.so2 || []), wsData.data.so2].slice(-100)
                    }
                };
            });
        } else if (wsData && (wsData.type === 'water' || wsData.type === 'water_sensor')) {
            setWaterData(prev => {
                const incoming = wsData.data;
                const hasTankData = 'level' in incoming;
                // We check for either 'irms' or the explicit 'status' field sent by the pump monitor
                const hasPumpData = 'irms' in incoming || 'status' in incoming;

                const currentChart = prev?.chartData || { labels: [], level: [], ph: [], tds: [] };

                let newLabels = currentChart.labels;
                let newLevelArr = currentChart.level;
                let newPhArr = currentChart.ph;
                let newTdsArr = currentChart.tds;

                // Only append to the chart history if this was a water tank reading
                if (hasTankData) {
                    const timeLabel = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                    newLabels = [...currentChart.labels, timeLabel].slice(-100);
                    newLevelArr = [...currentChart.level, incoming.level].slice(-100);
                    newPhArr = [...currentChart.ph, incoming.ph ?? prev?.ph ?? 0].slice(-100);
                    newTdsArr = [...currentChart.tds, incoming.tds ?? prev?.tds ?? 0].slice(-100);

                    // Offline heartbeat update ONLY if it's a valid tank reading
                    const isZeroWater = incoming.level === 0 && incoming.ph === 0 && incoming.tds === 0;
                    if (!isZeroWater) {
                        setLastWaterTime(Date.now());
                    }
                }

                // If it's a pump reading, update the heartbeat regardless
                if (hasPumpData) {
                    setLastWaterTime(Date.now());
                }

                // Derive pump/water status band for gauges
                let derivedStatus: string | null = waterStatus; // keep old status by default

                if (hasPumpData) {
                    // Pump monitor sends exact status string
                    if (incoming.status && typeof incoming.status === "string") {
                        derivedStatus = (incoming as any).status.toUpperCase();
                    } else {
                        // Fallback logic if needed
                        const irms = incoming.irms ?? 0;
                        if (irms < 2) derivedStatus = "OFF";
                        else if (irms < 4) derivedStatus = "LOW";
                        else if (irms < 7) derivedStatus = "MID";
                        else if (irms < 12) derivedStatus = "HIGH";
                        else derivedStatus = "CRITICAL";
                    }
                } else if (!prev?.pump_status || prev.pump_status === 'N/A') {
                    // Fallback to deriving from level ONLY if no pump data exists yet
                    const level = incoming.level ?? prev?.level ?? 0;
                    if (level < 2) derivedStatus = "OFF";
                    else if (level < 4) derivedStatus = "LOW";
                    else if (level < 7) derivedStatus = "MID";
                    else if (level < 12) derivedStatus = "HIGH";
                    else derivedStatus = "CRITICAL";
                }

                setWaterStatus(derivedStatus);

                return {
                    level: hasTankData ? incoming.level : (prev?.level ?? 0),
                    ph: hasTankData ? (incoming.ph ?? prev?.ph ?? 0) : (prev?.ph ?? 0),
                    tds: hasTankData ? (incoming.tds ?? prev?.tds ?? 0) : (prev?.tds ?? 0),
                    irms: hasPumpData ? (incoming.irms ?? prev?.irms ?? 0) : (prev?.irms ?? 0),
                    pump_status: hasPumpData ? (derivedStatus ?? 'N/A') : (prev?.pump_status ?? 'N/A'),
                    chartData: {
                        labels: newLabels,
                        level: newLevelArr,
                        ph: newPhArr,
                        tds: newTdsArr
                    }
                }
            });
        }
    }, [wsData, demoMode]);

    // 5. DEMO MODE: generate realistic random data so UI is functional without backend
    useEffect(() => {
        if (!demoMode) return;

        // Seed locations/devices once
        const demoLocs = [
            { location_id: "BLR-01", name: "BLR-01", latitude: 12.9716, longitude: 77.5946, online: true, last_seen: new Date().toISOString() },
            { location_id: "BLR-02", name: "BLR-02", latitude: 12.9352, longitude: 77.6245, online: true, last_seen: new Date().toISOString() },
            { location_id: "BLR-03", name: "BLR-03", latitude: 13.0358, longitude: 77.5970, online: true, last_seen: new Date().toISOString() },
        ];

        setCapabilities({ has_aqi: true, has_water: true });
        setIsSystemOnline(true);

        setLocationsStatus(() => {
            const m: Record<string, any> = {};
            for (const l of demoLocs) m[l.location_id] = l;
            return m;
        });

        setMyDevices([
            { device_id: "AQI-CAM-01", type: "aqi_camera", status: "ONLINE", location_id: "BLR-01", location_name: "BLR-01", last_seen: new Date().toISOString() },
            { device_id: "AIR-SENS-02", type: "aqi", status: "ONLINE", location_id: "BLR-02", location_name: "BLR-02", last_seen: new Date().toISOString() },
            { device_id: "WATER-01", type: "water_sensor", status: "ONLINE", location_id: "BLR-01", location_name: "BLR-01", last_seen: new Date().toISOString() },
            { device_id: "PUMP-01", type: "pump_monitor", status: "ONLINE", location_id: "BLR-03", location_name: "BLR-03", last_seen: new Date().toISOString() },
        ]);

        if (!currentLocation) {
            setCurrentLocation("BLR-01");
        }

        // Initialize baseline values if missing
        setAirData(prev => prev ?? ({
            pm25: rand(8, 65),
            pm10: rand(15, 120),
            co: rand(150, 1100),   // ppb-ish in your UI
            no2: rand(5, 55),
            o3: rand(5, 60),
            so2: rand(1, 25),
            chartData: { labels: [], pm25: [], pm10: [], co: [], no2: [], o3: [], so2: [] }
        }));

        setWaterData(prev => prev ?? ({
            level: rand(2, 12),
            ph: rand(6.8, 8.2),
            tds: rand(180, 800),
            irms: rand(0.5, 9),
            pump_status: "MID",
            chartData: { labels: [], level: [], ph: [], tds: [] }
        }));

        const tick = () => {
            const label = timeLabelNow();

            setAirData(prev => {
                const p = prev ?? ({
                    pm25: 25, pm10: 55, co: 450, no2: 18, o3: 22, so2: 8,
                    chartData: { labels: [], pm25: [], pm10: [], co: [], no2: [], o3: [], so2: [] }
                });

                // Smooth random walk + occasional spikes
                const spike = Math.random() < 0.08;
                const pm25 = clamp(nextRandomWalk(p.pm25, spike ? 18 : 6, 0, 250), 0, 250);
                const pm10 = clamp(nextRandomWalk(p.pm10, spike ? 30 : 10, 0, 400), 0, 400);
                const co = clamp(nextRandomWalk(p.co, spike ? 220 : 90, 50, 5000), 50, 5000);
                const no2 = clamp(nextRandomWalk(p.no2, spike ? 18 : 6, 0, 200), 0, 200);
                const o3 = clamp(nextRandomWalk(p.o3, 6, 0, 200), 0, 200);
                const so2 = clamp(nextRandomWalk(p.so2, 3, 0, 100), 0, 100);

                const c = p.chartData ?? { labels: [], pm25: [], pm10: [], co: [], no2: [], o3: [], so2: [] };
                const newLabels = [...c.labels, label].slice(-100);

                setLastAirTime(Date.now());

                return {
                    pm25, pm10, co, no2, o3, so2,
                    chartData: {
                        labels: newLabels,
                        pm25: [...c.pm25, pm25].slice(-100),
                        pm10: [...c.pm10, pm10].slice(-100),
                        co: [...c.co, co].slice(-100),
                        no2: [...c.no2, no2].slice(-100),
                        o3: [...(c.o3 || []), o3].slice(-100),
                        so2: [...(c.so2 || []), so2].slice(-100),
                    }
                };
            });

            setWaterData(prev => {
                const p = prev ?? ({
                    level: 6.5, ph: 7.4, tds: 420, irms: 3.2, pump_status: "MID",
                    chartData: { labels: [], level: [], ph: [], tds: [] }
                });

                // Level wiggle (ft), ph small drift, tds moderate drift, irms tied to pump activity
                const level = clamp(nextRandomWalk(p.level, 0.35, 0, 16), 0, 16);
                const ph = clamp(nextRandomWalk(p.ph, 0.06, 6.2, 8.8), 6.2, 8.8);
                const tds = clamp(nextRandomWalk(p.tds, 25, 50, 1800), 50, 1800);

                // Pump current follows level bands a bit
                const baseIrms = level < 2 ? rand(0.2, 1.0) : level < 4 ? rand(1.0, 2.5) : level < 7 ? rand(2.5, 4.5) : rand(4.0, 8.5);
                const irms = clamp(nextRandomWalk(baseIrms, 0.6, 0, 15), 0, 15);

                let pump_status: string;
                if (irms < 2) pump_status = "OFF";
                else if (irms < 4) pump_status = "LOW";
                else if (irms < 7) pump_status = "MID";
                else if (irms < 12) pump_status = "HIGH";
                else pump_status = "CRITICAL";

                setWaterStatus(pump_status);
                setLastWaterTime(Date.now());

                const c = p.chartData ?? { labels: [], level: [], ph: [], tds: [] };
                const newLabels = [...c.labels, label].slice(-100);

                return {
                    level, ph, tds, irms, pump_status,
                    chartData: {
                        labels: newLabels,
                        level: [...c.level, level].slice(-100),
                        ph: [...c.ph, ph].slice(-100),
                        tds: [...c.tds, tds].slice(-100),
                    }
                };
            });

            // Update location last_seen so map popups look alive
            setLocationsStatus(prev => {
                const updated: Record<string, any> = { ...prev };
                for (const [k, v] of Object.entries(updated)) {
                    updated[k] = { ...v, online: true, last_seen: new Date().toISOString() };
                }
                return updated;
            });
        };

        // Faster than real-time, but looks great for demos
        const interval = setInterval(tick, 2000);
        // Prime a few points quickly so charts are not empty
        tick();
        tick();

        return () => clearInterval(interval);
    }, [demoMode, currentLocation]);

    // Visual Effects... (Existing)
    const [stars, setStars] = useState<Array<{ left: string; top: string; delay: string; duration: string }>>([])
    useEffect(() => {
        if (waterData) setMaxWaterLevel((prev) => Math.max(prev, waterData.level))
    }, [waterData])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    useEffect(() => {
        setStars(Array.from({ length: 100 }).map(() => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 3}s`,
            duration: `${2 + Math.random() * 2}s`,
        })))
    }, [])

    const safeAirData = airData || {
        pm25: 0, pm10: 0, co: 0, no2: 0, o3: 0, so2: 0,
        chartData: { labels: [], pm25: [], pm10: [], co: [], no2: [], o3: [], so2: [] }
    };
    const safeWaterData = waterData || { level: 0, ph: 0, tds: 0, irms: 0, pump_status: 'N/A', chartData: { labels: [], level: [], ph: [], tds: [] } };
    const maxPm25Recorded = airData ? Math.max(airData.pm25, ...(airData.chartData?.pm25 || [])) : 0;
    const maxWaterLevelRecorded = waterData ? Math.max(waterData.level, ...(waterData.chartData?.level || [])) : 0;

    const historicalReadings = useMemo(
        () =>
            buildHistoricalReadingsSeries(
                readingsPeriod,
                safeWaterData.level,
                safeAirData.pm25
            ),
        [readingsPeriod, safeWaterData.level, safeAirData.pm25]
    )

    // --- INTERACTION HANDLERS ---
    const handlePollutantSelect = (pollutant: string | null) => {
        // Toggle logic: If clicking already active, deselect. Else select.
        setActiveMetric(prev => prev === pollutant ? "pm25" : (pollutant || "pm25")); // Default back to pm25 or null? User asked for "Show All" implies null support.
        // Actually, the card might expect a string. Let's adjust state to allow null if we want "Show All" on the graph.
        // But existing charts might expect a string activeMetric.
        // Let's stick to the requested behavior: "If the clicked tile IS currently selected: Set state to null".
        // We'll need to update state type:
    }

    // STATE LIFTING: "selectedPollutant" (null = Show All)
    const [selectedPollutant, setSelectedPollutant] = useState<string | null>(null);
    const [selectedWaterMetric, setSelectedWaterMetric] = useState<string | null>(null);

    const handleTileClick = (metric: string | null) => {
        if (!metric) {
            setSelectedPollutant(null);
            return;
        }
        setSelectedPollutant(prev => prev === metric ? null : metric);
    }

    const handleWaterTileClick = (metric: string | null) => {
        if (!metric) {
            setSelectedWaterMetric(null);
            return;
        }
        setSelectedWaterMetric(prev => prev === metric ? null : metric);
    }

    // Fullscreen Modal Data Mapping
    const getModalData = () => {
        if (modalConfig.type === 'aqi' && safeAirData.chartData.labels.length > 0) {
            return safeAirData.chartData.labels.map((l, i) => ({
                time: l,
                pm25: safeAirData.chartData.pm25[i],
                pm10: safeAirData.chartData.pm10[i],
                co: safeAirData.chartData.co[i],
                no2: safeAirData.chartData.no2[i],
                o3: safeAirData.chartData.o3?.[i] || 0,
                so2: safeAirData.chartData.so2?.[i] || 0,
            }));
        }
        if (modalConfig.type === 'water' && safeWaterData.chartData.labels.length > 0) {
            return safeWaterData.chartData.labels.map((l, i) => ({
                time: l,
                level: safeWaterData.chartData.level[i],
                ph: safeWaterData.chartData.ph[i],
                tds: safeWaterData.chartData.tds[i],
            }));
        }
        return [];
    }

    if (!mounted) return null;

    return (
        <div className={`relative min-h-screen overflow-hidden transition-all duration-1000 ${isSystemOnline ? 'bg-[#050511]' : 'bg-[radial-gradient(circle_at_center,_#0b2a44,_#061a2b)]'}`}>
            {/* Offline Banner */}
            {activeView === "dashboard" && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-pulse transition-all duration-500">
                    <div className={`px-4 py-1 rounded-full text-xs font-bold tracking-widest backdrop-blur-md shadow-lg border ${locationStatus === "ONLINE" ? "bg-emerald-500/90 text-white border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.5)]" :
                        locationStatus === "PARTIAL" ? "bg-amber-500/90 text-white border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.5)]" :
                            "bg-red-500/90 text-white border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        }`}>
                        {locationStatus === "ONLINE" ? "LOCATION ONLINE" :
                            locationStatus === "PARTIAL" ? "PARTIAL SYSTEMS OFFLINE" :
                                "LOCATION OFFLINE"} • {new Date().toLocaleTimeString()}
                    </div>
                </div>
            )}

            <SidebarNavigation
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen((v) => !v)}
                activeView={activeView}
                onNavigate={setActiveView}
            />

            <div className="transition-all duration-700">

                {/* Animated Background */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0520] via-[#050511] to-[#000208]" />
                    {isSystemOnline && (
                        <>
                            <div className="absolute h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-600/20 via-cyan-600/10 to-transparent blur-[100px]" style={{ left: `calc(15% + ${mousePosition.x}px)`, top: `calc(15% + ${mousePosition.y}px)`, transition: "left 0.3s ease-out, top 0.3s ease-out" }} />
                            <div className="animation-delay-2000 absolute h-[500px] w-[500px] rounded-full bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent blur-[100px]" style={{ right: `calc(10% + ${-mousePosition.x}px)`, top: `calc(20% + ${-mousePosition.y}px)`, transition: "right 0.3s ease-out, top 0.3s ease-out" }} />
                        </>
                    )}
                    <div className="absolute inset-0 opacity-70">
                        {stars.map((star, i) => (
                            <div key={i} className={`absolute h-[2px] w-[2px] rounded-full bg-white ${isSystemOnline ? 'animate-twinkle' : ''}`} style={{ left: star.left, top: star.top, animationDelay: star.delay, animationDuration: star.duration }} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex h-screen flex-col overflow-hidden">
                    {/* Header - Compact */}
                    <header className="flex items-center justify-between border-b border-white/5 px-4 py-2 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className={`relative h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/5`}>
                                    <div className="h-3 w-3 rounded-full bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    <span className="bg-gradient-to-r from-cyan-400 to-[#7CFF9A] bg-clip-text text-transparent">
                                        Air & Groundwater Intelligence
                                    </span>
                                </h1>
                            </div>
                            {currentLocation && (
                                <div className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                                    LOC: {currentLocation}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${locationStatus === 'ONLINE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {locationStatus === 'ONLINE' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                {locationStatus}
                            </div>
                            {lastMessageTime && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {new Date(lastMessageTime).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </header>

                    {/* View Switcher */}
                    <main className="flex-1 p-2 overflow-hidden">
                        {activeView === "dashboard" ? (
                            <div className="grid h-full grid-rows-[33%_34%_28%] gap-1.5">

                                {/* ═══ TOP ROW: Cause analysis | Tiles | Map (equal columns) ═══ */}
                                <div className="grid min-h-0 grid-cols-3 gap-2">
                                    {/* Top-Left: Cause analysis (pollutant breakdown) */}
                                    <div className="min-h-0 h-full overflow-hidden">
                                        <PollutantDonutChart airData={safeAirData} />
                                    </div>

                                    {/* Top-Middle: Combined Metrics Panel — ONE cohesive glassmorphism box */}
                                    <div className="relative rounded-xl overflow-hidden flex min-h-0" style={{ background: 'rgba(6,10,30,0.35)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                                        {capabilities.has_aqi && (
                                            <div className={`flex-1 min-h-0 overflow-hidden transition-opacity duration-500 ${!airData ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}>
                                                <AirQualityCard
                                                    data={safeAirData}
                                                    activeMetric={selectedPollutant}
                                                    onMetricSelect={handleTileClick}
                                                    onExpand={() => setModalConfig({ isOpen: true, type: 'aqi' })}
                                                    isOffline={isAirOffline}
                                                    compact
                                                />
                                            </div>
                                        )}
                                        {/* Vertical Dashed Divider */}
                                        {capabilities.has_aqi && capabilities.has_water && (
                                            <div className="shrink-0 self-stretch my-3" style={{ width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.15)' }} />
                                        )}
                                        {capabilities.has_water && (
                                            <div className="flex-1 min-h-0 overflow-hidden">
                                                <WaterQualityCard
                                                    data={safeWaterData}
                                                    activeMetric={selectedWaterMetric}
                                                    onMetricSelect={handleWaterTileClick}
                                                    onExpand={() => setModalConfig({ isOpen: true, type: 'water' })}
                                                    isOffline={isWaterOffline}
                                                    compact
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Top-Right: Interactive Device Map */}
                                    <div className="min-h-0 overflow-hidden rounded-xl">
                                        <LeafletMapCard locations={Object.values(locationsStatus)} />
                                    </div>
                                </div>

                                {/* ═══ MID ROW: AQI history | Water trend | Pump (equal columns) ═══ */}
                                <div className="grid min-h-0 grid-cols-3 gap-2">
                                    {/* Mid-Left: AQI Pollutant Level chart */}
                                    <div className="min-h-0 overflow-hidden">
                                        <MetricHistoryChart
                                            data={safeAirData.chartData.labels.map((l: string, i: number) => ({
                                                label: l,
                                                pm25: safeAirData.chartData.pm25[i],
                                                pm10: safeAirData.chartData.pm10[i],
                                                co: safeAirData.chartData.co[i],
                                                no2: safeAirData.chartData.no2[i],
                                                o3: safeAirData.chartData.o3?.[i] ?? 0,
                                                so2: safeAirData.chartData.so2?.[i] ?? 0
                                            }))}
                                            activeMetric={selectedPollutant}
                                            onMetricSelect={handleTileClick}
                                            timeRange="1h"
                                            onTimeRangeChange={() => { }}
                                            compact
                                            onExpand={() => setModalConfig({ isOpen: true, type: 'aqi' })}
                                        />
                                    </div>
                                    {/* Mid-Middle: Water Level Trend — live time-series chart */}
                                    <div className="card-vibrant flex min-h-0 flex-col overflow-hidden rounded-xl p-3">
                                        <WaterQualityCard
                                            data={safeWaterData}
                                            activeMetric={selectedWaterMetric}
                                            onMetricSelect={handleWaterTileClick}
                                            onExpand={() => setModalConfig({ isOpen: true, type: 'water' })}
                                            isOffline={isWaterOffline}
                                            mode="line-only"
                                        />
                                    </div>
                                    {/* Mid-Right: Speedometer */}
                                    <div className="card-vibrant flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-xl p-2">
                                        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-1">Pump Monitor</h3>
                                        <SpeedometerGauge
                                            value={Number.isFinite(waterData?.level ?? 0) ? Number((waterData?.level ?? 0).toFixed(2)) : 0}
                                            maxValue={Number.isFinite(maxWaterLevelRecorded) ? Number(maxWaterLevelRecorded.toFixed(2)) : 0}
                                            status={waterStatus ?? undefined}
                                            irms={waterData?.irms ?? 0}
                                            pumpStatus={waterData?.pump_status ?? 'N/A'}
                                        />
                                    </div>
                                </div>

                                {/* ═══ BOT ROW: Historical readings | Sensor status | Water quality (equal columns) ═══ */}
                                <div className="grid min-h-0 grid-cols-3 gap-2">
                                    {/* Bot-Left: Historical readings (week / month) */}
                                    <div className="min-h-0 overflow-hidden">
                                        <RecentReadingsTable
                                            waterLevels={historicalReadings.waterLevels}
                                            aqiValues={historicalReadings.aqiValues}
                                            labels={historicalReadings.labels}
                                            period={readingsPeriod}
                                            onPeriodChange={setReadingsPeriod}
                                            onExpand={() => setReadingsModalOpen(true)}
                                        />
                                    </div>

                                    {/* Bot-Center: Sensor Status */}
                                    <div className="card-vibrant min-h-0 overflow-auto rounded-xl p-3">
                                        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Sensor Status</h3>
                                        <div className="space-y-2">
                                            {myDevices.map((dev) => (
                                                <div
                                                    key={dev.device_id}
                                                    className="flex cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
                                                    onClick={() => dev.location_id && handleLocationSelect(dev.location_id)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Cpu className="h-3 w-3 text-emerald-400" />
                                                        <div>
                                                            <div className="text-[11px] font-bold text-white">{dev.device_id}</div>
                                                            <div className="text-[9px] uppercase text-slate-500">{dev.type}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${dev.status?.toUpperCase() === 'ONLINE'
                                                        ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                                                        : 'border-slate-500/30 bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {dev.status?.toUpperCase() === 'ONLINE' ? '● ONLINE' : '○ OFFLINE'}
                                                    </div>
                                                </div>
                                            ))}
                                            {myDevices.length === 0 && (
                                                <div className="py-4 text-center text-xs text-slate-500">No devices registered</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bot-Right: Water Quality — bar chart only */}
                                    <div className="min-h-0 overflow-hidden">
                                        <WaterQualityCard
                                            data={safeWaterData}
                                            activeMetric={selectedWaterMetric}
                                            onMetricSelect={handleWaterTileClick}
                                            onExpand={() => setModalConfig({ isOpen: true, type: 'water' })}
                                            isOffline={isWaterOffline}
                                            mode="bar-only"
                                        />
                                    </div>
                                </div>

                            </div>
                        ) : (
                            /* DEVICES VIEW */
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-2xl font-bold text-white mb-6">My Hardware Devices</h2>
                                <div className="grid gap-4">
                                    {myDevices.map((dev) => (
                                        <div
                                            key={dev.device_id}
                                            onClick={() => dev.location_id && handleLocationSelect(dev.location_id)}
                                            className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                                                    <Cpu className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-white">{dev.device_id}</div>
                                                    <div className="text-sm text-slate-400 uppercase tracking-widest">{dev.type}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <MapPin className="h-4 w-4 text-blue-400" />
                                                    {dev.location_name}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${dev.status?.toUpperCase() === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                                                        {dev.status?.toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE'}
                                                    </div>
                                                    {dev.last_seen && (
                                                        <div className="text-[10px] text-slate-500 font-mono">
                                                            Seen: {new Date(dev.last_seen).toLocaleTimeString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteDevice(dev.device_id, e)}
                                                    className="p-2 ml-4 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                                                    title="Remove Device"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {myDevices.length === 0 && (
                                        <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                                            <p className="text-slate-400">No devices registered. Run the registration script!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* MODAL */}
                <ChartModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                    chartType={modalConfig.type}
                    data={getModalData()}
                    selectedPollutant={selectedPollutant}
                    onPollutantSelect={handleTileClick}
                    selectedWaterMetric={selectedWaterMetric}
                    onWaterMetricSelect={handleWaterTileClick}
                />

                <RecentReadingsExpandModal
                    open={readingsModalOpen}
                    onClose={() => setReadingsModalOpen(false)}
                    waterLevels={historicalReadings.waterLevels}
                    aqiValues={historicalReadings.aqiValues}
                    labels={historicalReadings.labels}
                    period={readingsPeriod}
                    onPeriodChange={setReadingsPeriod}
                />
            </div>
        </div>
    )
}
