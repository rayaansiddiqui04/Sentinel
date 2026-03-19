import { getSeverityLabel } from '../utils'

export default function CompareTab({ compareA, setCompareA, compareB, setCompareB, allNeighborhoods, getNeighborhoodStats }) {
  const statsA = getNeighborhoodStats(compareA)
  const statsB = getNeighborhoodStats(compareB)

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
        <div>
          <div style={{ color: "#5c7cfa", fontSize: "9px", letterSpacing: "2px", marginBottom: "4px" }}>NEIGHBORHOOD A</div>
          <select value={compareA} onChange={e => setCompareA(e.target.value)}
            style={{ background: "#0a0a12", border: "1px solid #5c7cfa", color: "#c0c8d8", padding: "8px 12px", fontFamily: "monospace", fontSize: "12px", minWidth: "200px" }}>
            <option value="">Select neighborhood...</option>
            {allNeighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
        <div style={{ color: "#3a3a5c", fontSize: "18px", fontWeight: "700", paddingBottom: "6px" }}>vs</div>
        <div>
          <div style={{ color: "#ff6b00", fontSize: "9px", letterSpacing: "2px", marginBottom: "4px" }}>NEIGHBORHOOD B</div>
          <select value={compareB} onChange={e => setCompareB(e.target.value)}
            style={{ background: "#0a0a12", border: "1px solid #ff6b00", color: "#c0c8d8", padding: "8px 12px", fontFamily: "monospace", fontSize: "12px", minWidth: "200px" }}>
            <option value="">Select neighborhood...</option>
            {allNeighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </div>
      </div>

      {statsA && statsB ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0", marginBottom: "24px" }}>
            {[
              { label: "SAFETY SCORE", a: statsA.safety.score, b: statsB.safety.score, colorA: statsA.safety.color, colorB: statsB.safety.color, subA: statsA.safety.label, subB: statsB.safety.label },
              { label: "TOTAL INCIDENTS", a: statsA.total, b: statsB.total, better: "low" },
              { label: "CRITICAL/HIGH", a: statsA.critical, b: statsB.critical, better: "low" },
              { label: "ARREST RATE", a: `${statsA.arrestRate}%`, b: `${statsB.arrestRate}%`, aVal: statsA.arrestRate, bVal: statsB.arrestRate, better: "high" },
              { label: "PEAK HOUR", a: statsA.peakHour, b: statsB.peakHour },
            ].map((row, i) => {
              const aVal = row.aVal ?? (typeof row.a === "number" ? row.a : 0)
              const bVal = row.bVal ?? (typeof row.b === "number" ? row.b : 0)
              const aWins = row.better === "high" ? aVal > bVal : row.better === "low" ? aVal < bVal : false
              const bWins = row.better === "high" ? bVal > aVal : row.better === "low" ? bVal < aVal : false
              return (
                <div key={i} style={{ display: "contents" }}>
                  <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", borderRight: "none", padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: row.colorA || (aWins ? "#4caf50" : "#c0c8d8") }}>{row.a}</div>
                    {row.subA && <div style={{ fontSize: "9px", color: row.colorA || "#3a3a5c", marginTop: "4px" }}>{row.subA}</div>}
                  </div>
                  <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "140px" }}>
                    <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", textAlign: "center" }}>{row.label}</div>
                  </div>
                  <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", borderLeft: "none", padding: "16px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: row.colorB || (bWins ? "#4caf50" : "#c0c8d8") }}>{row.b}</div>
                    {row.subB && <div style={{ fontSize: "9px", color: row.colorB || "#3a3a5c", marginTop: "4px" }}>{row.subB}</div>}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[{ stats: statsA, color: "#5c7cfa", label: statsA.name }, { stats: statsB, color: "#ff6b00", label: statsB.name }].map(({ stats, color, label }) => (
              <div key={label} style={{ background: "#0a0a12", border: `1px solid ${color}33`, padding: "20px" }}>
                <div style={{ color, fontSize: "9px", letterSpacing: "2px", marginBottom: "16px" }}>TOP CRIMES — {label.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {stats.topTypes.map(([type, count]) => {
                    const sev = getSeverityLabel(type)
                    return (
                      <div key={type}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontSize: "10px", color: "#c0c8d8" }}>{type}</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "9px", color: sev.color, background: sev.color + "22", padding: "1px 6px" }}>{sev.label}</span>
                            <span style={{ fontSize: "10px", color }}>{count}</span>
                          </div>
                        </div>
                        <div style={{ background: "#1a1a2e", height: "3px" }}>
                          <div style={{ background: color, height: "100%", width: `${(count / stats.maxType) * 100}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "60px 20px", textAlign: "center" }}>
          <div style={{ color: "#3a3a5c", fontSize: "13px" }}>Select two neighborhoods above to compare safety scores, crime types, arrest rates, and more</div>
        </div>
      )}
    </div>
  )
}
