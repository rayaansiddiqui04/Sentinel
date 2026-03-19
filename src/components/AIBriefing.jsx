export default function AIBriefing({
  setBriefingOpen, briefingArea, setBriefingArea,
  briefingLoading, briefingStats, briefingError,
  briefingResponse, briefingNeighborhoods, generateBriefing,
}) {
  return (
    <div onClick={() => setBriefingOpen(false)} style={{
      position: "fixed",
      inset: 0,
      background: "rgba(3, 5, 10, 0.8)",
      zIndex: 1400,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(720px, 100%)",
        maxHeight: "85vh",
        overflowY: "auto",
        background: "#090d15",
        border: "1px solid #1f2a40",
        boxShadow: "0 24px 80px rgba(0,0,0,0.55)"
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div>
            <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: "700", letterSpacing: "1px" }}>INTEL BRIEFING</div>
            <div style={{ color: "#60708c", fontSize: "10px", marginTop: "4px" }}>AI-generated tactical summary from current dashboard data</div>
          </div>
          <button onClick={() => setBriefingOpen(false)} style={{ background: "none", border: "none", color: "#7f8aa3", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "24px", display: "grid", gap: "18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <div style={{ color: "#4f5c76", fontSize: "9px", letterSpacing: "2px", marginBottom: "6px" }}>COMMUNITY AREA</div>
              <select
                value={briefingArea}
                onChange={e => setBriefingArea(e.target.value)}
                style={{ width: "100%", background: "#0a0f19", border: "1px solid #26324a", color: "#d3dbeb", padding: "11px 12px", fontFamily: "DM Mono, monospace", fontSize: "11px" }}
              >
                <option value="">Select neighborhood...</option>
                {briefingNeighborhoods.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateBriefing}
              disabled={!briefingArea || briefingLoading}
              style={{
                background: !briefingArea || briefingLoading ? "#1a2233" : "#5c7cfa",
                border: "1px solid " + (!briefingArea || briefingLoading ? "#26324a" : "#5c7cfa"),
                color: !briefingArea || briefingLoading ? "#5f6c86" : "#ffffff",
                padding: "11px 18px",
                fontFamily: "DM Mono, monospace",
                fontSize: "11px",
                letterSpacing: "1px",
                cursor: !briefingArea || briefingLoading ? "not-allowed" : "pointer"
              }}
            >
              {briefingLoading ? "GENERATING..." : "GENERATE"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", color: "#5f6c86", fontSize: "10px" }}>
            <div style={{ padding: "6px 10px", border: "1px solid #1f2a40", background: "#0a0f19" }}>Respects current type, date, and block search filters</div>
            <div style={{ padding: "6px 10px", border: "1px solid #1f2a40", background: "#0a0f19" }}>Uses selected neighborhood for the briefing scope</div>
          </div>

          {briefingStats && briefingStats.totalIncidents > 0 && (
            <div style={{ background: "#0a0f19", border: "1px solid #1f2a40", padding: "16px", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
              <div>
                <div style={{ color: "#4f5c76", fontSize: "8px", letterSpacing: "2px", marginBottom: "4px" }}>TOTAL</div>
                <div style={{ color: "#dce4f7", fontSize: "20px", fontWeight: "700" }}>{briefingStats.totalIncidents}</div>
              </div>
              <div>
                <div style={{ color: "#4f5c76", fontSize: "8px", letterSpacing: "2px", marginBottom: "4px" }}>ARREST RATE</div>
                <div style={{ color: "#8bd39d", fontSize: "20px", fontWeight: "700" }}>{briefingStats.arrestRatePct}%</div>
              </div>
              <div>
                <div style={{ color: "#4f5c76", fontSize: "8px", letterSpacing: "2px", marginBottom: "4px" }}>TOP CRIME</div>
                <div style={{ color: "#dce4f7", fontSize: "12px", fontWeight: "700" }}>{briefingStats.crimeTypeBreakdown[0]?.type || "—"}</div>
              </div>
              <div>
                <div style={{ color: "#4f5c76", fontSize: "8px", letterSpacing: "2px", marginBottom: "4px" }}>HOT HOUR</div>
                <div style={{ color: "#ffb25c", fontSize: "16px", fontWeight: "700" }}>{briefingStats.busiestHours[0]?.hour || "—"}</div>
              </div>
            </div>
          )}

          {briefingError && (
            <div style={{ background: "#2a1216", border: "1px solid #5d2830", color: "#ff9fa8", padding: "14px 16px", fontSize: "11px" }}>
              {briefingError}
            </div>
          )}

          <div style={{ background: "#060910", border: "1px solid #1a2233", minHeight: "240px", padding: "18px", whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: "12px", color: briefingResponse ? "#d3dbeb" : "#63718d" }}>
            {briefingLoading
              ? "Crunching incidents, building area stats, and generating tactical briefing..."
              : briefingResponse || "Select a community area and generate a briefing."}
          </div>
        </div>
      </div>
    </div>
  )
}
