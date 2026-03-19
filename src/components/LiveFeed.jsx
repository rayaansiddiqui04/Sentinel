import { COMMUNITY_AREAS, getSeverityLabel } from '../utils'

export default function LiveFeed({ filtered, total, feedLimit, setFeedLimit }) {
  return (
    <div style={{ padding: "0 28px 28px 28px" }}>
      <div style={{ background: "#0a0a12", border: "1px solid #1a1a2e", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ color: "#8888aa", fontSize: "9px", letterSpacing: "2px" }}>LIVE INCIDENT FEED</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: "#8888aa", fontSize: "10px" }}>{total} incidents in view</div>
            <select value={feedLimit} onChange={e => setFeedLimit(Number(e.target.value))}
              style={{ background: "#0a0a12", border: "1px solid #1a1a2e", color: "#c0c8d8", padding: "4px 8px", fontFamily: "monospace", fontSize: "10px" }}>
              <option value={50}>Show 50</option>
              <option value={100}>Show 100</option>
              <option value={500}>Show 500</option>
              <option value={1000}>Show 1000</option>
            </select>
          </div>
        </div>
        <div style={{ overflowY: "auto", maxHeight: "400px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
            <thead style={{ position: "sticky", top: 0, background: "#0a0a12" }}>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["DATE", "TIME", "TYPE", "NEIGHBORHOOD", "BLOCK", "SEVERITY", "ARREST"].map(h => (
                  <th key={h} style={{ color: "#8888aa", padding: "8px", textAlign: "left", letterSpacing: "1px", fontWeight: "400", fontSize: "9px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, feedLimit).map((inc, i) => {
                const sev = getSeverityLabel(inc.primary_type)
                const date = inc.date ? new Date(inc.date) : null
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #1a1a2e" }}>
                    <td style={{ padding: "8px", color: "#8888aa" }}>{date ? date.toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "8px", color: "#8888aa" }}>{date ? date.toLocaleTimeString() : "—"}</td>
                    <td style={{ padding: "8px", color: "#c0c8d8" }}>{inc.primary_type || "—"}</td>
                    <td style={{ padding: "8px", color: "#8888aa" }}>{COMMUNITY_AREAS[inc.community_area] || inc.community_area || "—"}</td>
                    <td style={{ padding: "8px", color: "#8888aa", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.block || "—"}</td>
                    <td style={{ padding: "8px" }}>
                      <span style={{ background: sev.color + "22", color: sev.color, padding: "2px 8px", fontSize: "9px", letterSpacing: "1px" }}>{sev.label}</span>
                    </td>
                    <td style={{ padding: "8px", color: inc.arrest === "true" || inc.arrest === true ? "#4caf50" : "#3a3a5c" }}>
                      {inc.arrest === "true" || inc.arrest === true ? "YES" : "NO"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
