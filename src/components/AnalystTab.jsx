import { SEVERITY, DOW_LABELS } from '../constants'
import { COMMUNITY_AREAS, getSeverityLabel } from '../utils'

export default function AnalystTab({
  total, criticalCount, arrestRate, topNeighborhood,
  weekTrend, maxWeek, weekChange,
  dowCounts, maxDow, neighborhoodCounts, filtered,
}) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Incidents", value: total, color: "#5c7cfa" },
          { label: "Critical / High", value: criticalCount, color: "#ff2d2d" },
          { label: "Arrest Rate", value: `${arrestRate}%`, color: arrestRate > 20 ? "#4caf50" : "#ff6b00" },
          { label: "Busiest Neighborhood", value: topNeighborhood ? (COMMUNITY_AREAS[topNeighborhood] || topNeighborhood) : "—", color: "#f5c400" },
        ].map((card, i) => (
          <div key={i} style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "16px" }}>
            <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>{card.label.toUpperCase()}</div>
            <div style={{ color: card.color, fontSize: "28px", fontWeight: "700" }}>{card.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px" }}>WEEK-OVER-WEEK TREND</div>
            <div style={{ fontSize: "10px", color: weekChange > 0 ? "#ff2d2d" : weekChange < 0 ? "#4caf50" : "#8888aa" }}>
              {weekChange > 0 ? `▲ ${weekChange}%` : weekChange < 0 ? `▼ ${Math.abs(weekChange)}%` : "—"} vs last week
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "140px" }}>
            {weekTrend.map((w, i) => {
              const isLast = i === weekTrend.length - 1
              const isPrev = i === weekTrend.length - 2
              const color = isLast ? "#5c7cfa" : isPrev ? "#5c7cfa66" : "#1a1a2e"
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                    <div style={{ width: "100%", height: maxWeek > 0 ? `${(w.count / maxWeek) * 100}%` : "0%", background: color, minHeight: w.count > 0 ? "2px" : "0", transition: "height 0.3s" }} />
                  </div>
                  <div style={{ color: "#3a3a5c", fontSize: "7px", marginTop: "4px", whiteSpace: "nowrap" }}>{w.label}</div>
                  {(isLast || isPrev) && <div style={{ color: isLast ? "#5c7cfa" : "#5c7cfa66", fontSize: "8px" }}>{w.count}</div>}
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "20px" }}>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "16px" }}>INCIDENTS BY DAY OF WEEK</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "140px" }}>
            {dowCounts.map((count, day) => {
              const isWeekend = day === 0 || day === 6
              const isMax = count === maxDow
              return (
                <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                    <div style={{ width: "100%", height: maxDow > 0 ? `${(count / maxDow) * 100}%` : "0%", background: isMax ? "#ff6b00" : isWeekend ? "#5c7cfa88" : "#5c7cfa", minHeight: count > 0 ? "2px" : "0" }} />
                  </div>
                  <div style={{ color: "#3a3a5c", fontSize: "8px", marginTop: "4px" }}>{DOW_LABELS[day]}</div>
                </div>
              )
            })}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", background: "#ff6b00" }} /><span style={{ color: "#3a3a5c", fontSize: "9px" }}>Peak day</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", background: "#5c7cfa88" }} /><span style={{ color: "#3a3a5c", fontSize: "9px" }}>Weekend</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "20px" }}>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "16px" }}>NEIGHBORHOOD BREAKDOWN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
            {Object.entries(neighborhoodCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([area, count]) => (
              <div key={area}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <div style={{ fontSize: "10px", color: "#c0c8d8" }}>{COMMUNITY_AREAS[area] || area}</div>
                  <div style={{ fontSize: "10px", color: "#5c7cfa" }}>{count}</div>
                </div>
                <div style={{ background: "#1a1a2e", height: "3px" }}>
                  <div style={{ background: "#5c7cfa", height: "100%", width: `${(count / Math.max(...Object.values(neighborhoodCounts))) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "20px" }}>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "16px" }}>SEVERITY DISTRIBUTION</div>
          {[5, 4, 3, 2, 1].map(level => {
            const levelIncidents = filtered.filter(i => (SEVERITY[i.primary_type] || 1) === level)
            const labels = { 5: "CRITICAL", 4: "HIGH", 3: "MEDIUM", 2: "LOW", 1: "MINIMAL" }
            const colors = { 5: "#ff2d2d", 4: "#ff6b00", 3: "#f5c400", 2: "#4caf50", 1: "#3a3a5c" }
            return (
              <div key={level} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: colors[level] }}>{labels[level]}</span>
                  <span style={{ fontSize: "10px", color: "#5c7cfa" }}>{levelIncidents.length} ({total > 0 ? Math.round(levelIncidents.length / total * 100) : 0}%)</span>
                </div>
                <div style={{ background: "#1a1a2e", height: "6px" }}>
                  <div style={{ background: colors[level], height: "100%", width: `${total > 0 ? (levelIncidents.length / total) * 100 : 0}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
