
# Real-Time Animations for Gauges & Charts

## Changes

### 1. GaugeWidget — Add internal live state
- Accept `initialValue` instead of static `value`
- Use `useState` + `useEffect` with a 3-second interval
- Each tick: vary value by ±1-3, clamped to 0-100
- The existing CSS `transition-all duration-1000` already handles smooth arc animation

### 2. StatusDashboard — Live session chart
- Add `useState` for `sessionData`, `useEffect` with 5-second interval
- Each tick: shift array left, append a new data point with slight random variation from the last values
- Pass live data to the AreaChart

### 3. NetworkDashboard — Live bandwidth, sessions, memory charts
- Same pattern: `useState` + `useEffect` intervals for `bandwidthData`, `sessionData`, `memoryData`
- Shift and append new random-varied data points every 4-5 seconds

### 4. StatusDashboard gauges
- Replace static `cpuUsage`/`memoryUsage` props — no changes needed beyond the GaugeWidget itself handling live updates internally via `initialValue`

## Technical approach
- All intervals cleaned up via `useEffect` return
- Random variation: `Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 6))` for gauges
- Chart data: clone last point's values with ±5-10% jitter, increment time label
