export default function RankingsTab({ rankingsData, lastUpdated, setNeighborhoodFilter, setActiveTab }) {
  return (
    <div>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ color: "#8888aa", fontSize: "11px" }}>All Chicago neighborhoods ranked by safety score — click any to filter the dashboard</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "2px" }}>LAST UPDATED</div>
          <div style={{ color: "#5c7cfa", fontSize: "11px" }}>{lastUpdated ? lastUpdated.toLocaleTimeString() : "..."}</div>
          <div style={{ color: "#3a3a5c", fontSize: "9px" }}>auto-refreshes every 60s</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {rankingsData.map((n, i) => (
          <div key={n.id} onClick={() => { setNeighborhoodFilter(n.id); setActiveTab("overview") }}
            style={{ background: "#0a0a12", border: `1px solid ${n.color}33`, padding: "16px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }}>
            <div style={{ color: "#3a3a5c", fontSize: "18px", fontWeight: "700", minWidth: "32px" }}>#{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#c0c8d8", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>{n.name}</div>
              <div style={{ color: "#3a3a5c", fontSize: "10px" }}>{n.total} incidents · {n.homicides} homicides</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: n.color, fontSize: "22px", fontWeight: "700" }}>{n.score}</div>
              <div style={{ color: n.color, fontSize: "9px", letterSpacing: "1px" }}>{n.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
