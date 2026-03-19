import { COMMUNITY_AREAS, getSeverityLabel } from '../utils'

export default function OverviewTab({
  neighborhoodFilter, safety, selectedNeighborhoodName,
  total, criticalCount, arrestRate, peakHourLabel, topNeighborhood,
  hourCounts, peakHour, maxHour,
  topTypes, maxType, trendAlerts, chartTitle,
}) {
  return (
    <div>
      {neighborhoodFilter !== "ALL" && (
        <div style={{ background: "#0a0a12", border: `1px solid ${safety.color}40`, borderLeft: `4px solid ${safety.color}`, padding: "20px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#3a3a5c", letterSpacing: "2px", marginBottom: "6px" }}>SAFETY ASSESSMENT — {selectedNeighborhoodName.toUpperCase()}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: safety.color, marginBottom: "6px" }}>{safety.label}</div>
            <div style={{ color: "#8888aa", fontSize: "12px", maxWidth: "600px" }}>{safety.advice}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#3a3a5c", letterSpacing: "2px", marginBottom: "4px" }}>SAFETY SCORE</div>
            <div style={{ fontSize: "52px", fontWeight: "700", color: safety.color, lineHeight: 1 }}>{safety.score}</div>
            <div style={{ fontSize: "10px", color: "#3a3a5c" }}>out of 100</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Incidents", value: total, color: "#5c7cfa", sub: "in current view" },
          { label: "Critical / High", value: criticalCount, color: "#ff2d2d", sub: "serious crimes" },
          { label: "Arrest Rate", value: `${arrestRate}%`, color: arrestRate > 20 ? "#4caf50" : "#ff6b00", sub: arrestRate > 20 ? "above baseline" : "below baseline" },
          { label: "Peak Hour", value: peakHourLabel, color: "#f5c400", sub: "most incidents" },
          { label: "Busiest Area", value: topNeighborhood ? (COMMUNITY_AREAS[topNeighborhood] || topNeighborhood) : "—", color: "#c0c8d8", sub: "most incidents" },
        ].map((card, i) => (
          <div key={i} style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "16px" }}>
            <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>{card.label.toUpperCase()}</div>
            <div style={{ color: card.color, fontSize: "22px", fontWeight: "700", marginBottom: "4px" }}>{card.value}</div>
            <div style={{ color: "#3a3a5c", fontSize: "9px" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "20px" }}>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "4px" }}>INCIDENTS BY HOUR OF DAY</div>
          <div style={{ color: "#8888aa", fontSize: "10px", marginBottom: "16px" }}>{chartTitle}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "160px" }}>
            {hourCounts.map((count, hour) => (
              <div key={hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                  <div style={{ width: "100%", height: maxHour > 0 ? `${(count / maxHour) * 100}%` : "0%", background: hour === peakHour ? "#ff6b00" : hour >= 22 || hour <= 4 ? "#ff2d2d55" : "#5c7cfa", minHeight: count > 0 ? "2px" : "0" }} />
                </div>
                {hour % 4 === 0 && <div style={{ color: "#3a3a5c", fontSize: "7px", marginTop: "4px" }}>{hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}</div>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", background: "#ff6b00" }} /><span style={{ color: "#3a3a5c", fontSize: "9px" }}>Peak hour</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", background: "#ff2d2d55" }} /><span style={{ color: "#3a3a5c", fontSize: "9px" }}>Late night (10pm–4am)</span></div>
          </div>
        </div>

        <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "20px" }}>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "16px" }}>TOP CRIME TYPES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {topTypes.map(([type, count]) => {
              const sev = getSeverityLabel(type)
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", alignItems: "center" }}>
                    <div style={{ fontSize: "10px", color: "#c0c8d8" }}>{type}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "9px", color: sev.color, background: sev.color + "22", padding: "1px 6px" }}>{sev.label}</span>
                      <span style={{ fontSize: "10px", color: "#5c7cfa" }}>{count}</span>
                    </div>
                  </div>
                  <div style={{ background: "#1a1a2e", height: "3px", width: "100%" }}>
                    <div style={{ background: sev.color, height: "100%", width: `${(count / maxType) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {trendAlerts.length > 0 && (
        <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "16px 20px" }}>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "12px" }}>WEEKLY TREND ALERTS</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {trendAlerts.map((alert, i) => (
              <div key={i} style={{ background: alert.color + "11", border: `1px solid ${alert.color}33`, borderLeft: `3px solid ${alert.color}`, padding: "8px 14px", fontSize: "11px", color: alert.color }}>
                {alert.icon} {alert.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
