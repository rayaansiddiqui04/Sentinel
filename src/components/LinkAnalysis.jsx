export default function LinkAnalysis({ linkClusters }) {
  if (linkClusters.length === 0) {
    return (
      <div style={{ marginTop: "16px", background: "#0a0a12", border: "1px solid #1a1a2e", padding: "32px", textAlign: "center" }}>
        <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "8px" }}>NO CLUSTERS FOUND</div>
        <div style={{ color: "#8888aa", fontSize: "11px" }}>No crime clusters detected with current filters — try selecting all neighborhoods or broadening the date range</div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: "16px", background: "#0a0a12", border: "1px solid #1a1a2e", padding: "20px" }}>
      <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "16px" }}>CLUSTER ANALYSIS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {linkClusters.map((c, i) => (
          <div key={i} style={{ border: `1px solid ${c.color}33`, borderLeft: `3px solid ${c.color}`, padding: "12px 16px", display: "grid", gridTemplateColumns: "24px 1fr 1fr 1fr 1fr 1fr", gap: "12px", alignItems: "center" }}>
            <div style={{ color: c.color, fontSize: "11px", fontWeight: "700" }}>#{i+1}</div>
            <div>
              <div style={{ color: "#3a3a5c", fontSize: "8px", letterSpacing: "1px", marginBottom: "2px" }}>CRIME TYPE</div>
              <div style={{ color: "#c0c8d8", fontSize: "11px" }}>{c.type}</div>
            </div>
            <div>
              <div style={{ color: "#3a3a5c", fontSize: "8px", letterSpacing: "1px", marginBottom: "2px" }}>INCIDENTS</div>
              <div style={{ color: c.color, fontSize: "18px", fontWeight: "700" }}>{c.incidents.length}</div>
            </div>
            <div>
              <div style={{ color: "#3a3a5c", fontSize: "8px", letterSpacing: "1px", marginBottom: "2px" }}>NEIGHBORHOOD(S)</div>
              <div style={{ color: "#c0c8d8", fontSize: "10px" }}>{c.areas.slice(0, 2).join(", ")}{c.areas.length > 2 ? ` +${c.areas.length - 2}` : ""}</div>
            </div>
            <div>
              <div style={{ color: "#3a3a5c", fontSize: "8px", letterSpacing: "1px", marginBottom: "2px" }}>TIME SPAN</div>
              <div style={{ color: "#c0c8d8", fontSize: "11px" }}>{c.spanLabel}</div>
              <div style={{ color: "#3a3a5c", fontSize: "9px" }}>{c.minTime.toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ color: "#3a3a5c", fontSize: "8px", letterSpacing: "1px", marginBottom: "2px" }}>GEO RADIUS</div>
              <div style={{ color: "#c0c8d8", fontSize: "11px" }}>{c.radiusMi} mi</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
