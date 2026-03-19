import { Fragment } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { COMMUNITY_AREAS, getSeverityLabel } from '../utils'
import LinkAnalysis from './LinkAnalysis'

export default function MapTab({
  mapViewMode, setMapViewMode,
  mapSeverityFilter, setMapSeverityFilter,
  mapMarkerLimit, setMapMarkerLimit,
  mapCustomLimit, setMapCustomLimit,
  filtered, riskForecast, linkClusters, neighborhoodFilter,
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { id: "live",     label: "LIVE INCIDENTS", activeColor: "#5c7cfa" },
            { id: "forecast", label: "RISK FORECAST",  activeColor: "#ff2d2d" },
            { id: "link",     label: "LINK ANALYSIS",  activeColor: "#c77dff" },
          ].map(({ id, label, activeColor }) => (
            <button key={id} onClick={() => setMapViewMode(id)} style={{
              background: mapViewMode === id ? activeColor + "22" : "transparent",
              border: `1px solid ${mapViewMode === id ? activeColor : "#1a1a2e"}`,
              color: mapViewMode === id ? activeColor : "#3a3a5c",
              padding: "4px 14px", fontFamily: "DM Mono, monospace", fontSize: "10px", cursor: "pointer", letterSpacing: "1px",
            }}>{label}</button>
          ))}
        </div>
        <div style={{ width: "1px", height: "20px", background: "#1a1a2e" }} />
        {mapViewMode === "forecast" && (
          <div style={{ color: "#8888aa", fontSize: "10px" }}>
            Historical risk · <span style={{ color: "#c0c8d8" }}>{riskForecast.dowLabel}s at {riskForecast.hourLabel}</span> · last 6 months
          </div>
        )}
        {mapViewMode === "link" && (
          <div style={{ color: "#8888aa", fontSize: "10px" }}>
            <span style={{ color: "#c77dff" }}>{linkClusters.length} clusters</span> found · same crime within 0.5mi & 3hrs · top 5000 incidents
          </div>
        )}
        {mapViewMode === "live" && <>
          {[
            { key: "CRITICAL", color: "#ff2d2d" },
            { key: "HIGH",     color: "#ff6b00" },
            { key: "MEDIUM",   color: "#f5c400" },
            { key: "LOW",      color: "#4caf50" },
          ].map(({ key, color }) => {
            const active = mapSeverityFilter.includes(key)
            return (
              <button key={key} onClick={() => setMapSeverityFilter(prev =>
                prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
              )} style={{
                background: active ? color + "22" : "transparent",
                border: `1px solid ${active ? color : "#1a1a2e"}`,
                color: active ? color : "#3a3a5c",
                padding: "4px 14px", fontFamily: "DM Mono, monospace",
                fontSize: "10px", cursor: "pointer", letterSpacing: "1px",
              }}>{key}</button>
            )
          })}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px" }}>SHOW</div>
            {[100, 500, 1000, 5000, 10000].map(n => (
              <button key={n} onClick={() => { setMapMarkerLimit(n); setMapCustomLimit("") }} style={{
                background: mapMarkerLimit === n && mapCustomLimit === "" ? "#5c7cfa22" : "transparent",
                border: `1px solid ${mapMarkerLimit === n && mapCustomLimit === "" ? "#5c7cfa" : "#1a1a2e"}`,
                color: mapMarkerLimit === n && mapCustomLimit === "" ? "#5c7cfa" : "#3a3a5c",
                padding: "4px 10px", fontFamily: "DM Mono, monospace", fontSize: "10px", cursor: "pointer",
              }}>{n >= 1000 ? `${n/1000}k` : n}</button>
            ))}
            <input
              placeholder="custom"
              value={mapCustomLimit}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "")
                setMapCustomLimit(v)
                if (v) setMapMarkerLimit(Math.max(1, parseInt(v)))
              }}
              style={{ background: "#0a0a12", border: `1px solid ${mapCustomLimit ? "#5c7cfa" : "#1a1a2e"}`, color: "#c0c8d8", padding: "4px 8px", fontFamily: "DM Mono, monospace", fontSize: "10px", width: "70px" }}
            />
          </div>
          <div style={{ marginLeft: "auto", color: "#3a3a5c", fontSize: "10px" }}>
            {filtered.filter(i => !isNaN(parseFloat(i.latitude)) && !isNaN(parseFloat(i.longitude)) && mapSeverityFilter.includes(getSeverityLabel(i.primary_type).label)).length} incidents plotted
          </div>
        </>}
      </div>

      <div style={{ border: "1px solid #1a1a2e", overflow: "hidden", position: "relative" }}>
        {mapViewMode === "forecast" && riskForecast.noData && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ background: "#0a0a12dd", border: "1px solid #3a3a5c", padding: "20px 32px", fontFamily: "DM Mono, monospace", textAlign: "center" }}>
              <div style={{ color: "#3a3a5c", fontSize: "9px", letterSpacing: "2px", marginBottom: "8px" }}>NOT ENOUGH DATA</div>
              <div style={{ color: "#8888aa", fontSize: "12px" }}>No incidents found for <span style={{ color: "#c0c8d8" }}>{COMMUNITY_AREAS[neighborhoodFilter]}</span></div>
              <div style={{ color: "#3a3a5c", fontSize: "11px", marginTop: "4px" }}>on {riskForecast.dowLabel}s at {riskForecast.hourLabel} in the last 6 months</div>
            </div>
          </div>
        )}
        <MapContainer
          center={[41.8375, -87.6866]}
          zoom={11}
          style={{ height: "70vh", width: "100%", background: "#050508" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {mapViewMode === "live" && filtered
            .filter(i => !isNaN(parseFloat(i.latitude)) && !isNaN(parseFloat(i.longitude)) && mapSeverityFilter.includes(getSeverityLabel(i.primary_type).label))
            .slice(0, mapMarkerLimit)
            .map((inc, idx) => {
              const sev = getSeverityLabel(inc.primary_type)
              const date = inc.date ? new Date(inc.date) : null
              const radius = sev.label === "CRITICAL" ? 10 : sev.label === "HIGH" ? 8 : 6
              return (
                <CircleMarker
                  key={idx}
                  center={[parseFloat(inc.latitude), parseFloat(inc.longitude)]}
                  radius={radius}
                  pathOptions={{ color: sev.color, fillColor: sev.color, fillOpacity: 0.8, weight: 2, opacity: 1 }}
                  eventHandlers={{
                    mouseover: (e) => { e.target.setStyle({ fillOpacity: 1, weight: 3 }); e.target.setRadius(radius + 3); e.target.openPopup() },
                    mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.8, weight: 2 }); e.target.setRadius(radius); e.target.closePopup() },
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: "DM Mono, monospace", fontSize: "11px", lineHeight: "1.8", minWidth: "180px" }}>
                      <div style={{ color: sev.color, fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>{sev.label} — {inc.primary_type}</div>
                      <div><span style={{ color: "#888" }}>Block:</span> {inc.block || "—"}</div>
                      <div><span style={{ color: "#888" }}>Area:</span> {COMMUNITY_AREAS[inc.community_area] || inc.community_area || "—"}</div>
                      <div><span style={{ color: "#888" }}>Date:</span> {date ? date.toLocaleDateString() : "—"}</div>
                      <div><span style={{ color: "#888" }}>Time:</span> {date ? date.toLocaleTimeString() : "—"}</div>
                      <div><span style={{ color: "#888" }}>Arrest:</span> {inc.arrest === "true" || inc.arrest === true ? "YES" : "NO"}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          {mapViewMode === "forecast" && riskForecast.areas.map((area, idx) => (
            <CircleMarker
              key={area.area}
              center={[area.lat, area.lng]}
              radius={52 - idx * 2}
              pathOptions={{
                color: area.color,
                fillColor: area.color,
                fillOpacity: 0.18 - idx * 0.005,
                weight: 2,
                opacity: 0.7,
              }}
              eventHandlers={{
                mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.35, weight: 3 }); e.target.openPopup() },
                mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.18 - idx * 0.005, weight: 2 }); e.target.closePopup() },
              }}
            >
              <Popup>
                <div style={{ fontFamily: "DM Mono, monospace", fontSize: "11px", lineHeight: "1.8", minWidth: "180px" }}>
                  <div style={{ color: area.color, fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>{area.tier} — {area.name}</div>
                  <div><span style={{ color: "#888" }}>Incidents:</span> {area.count} on {riskForecast.dowLabel}s at {riskForecast.hourLabel} (YTD)</div>
                  <div><span style={{ color: "#888" }}>Rank:</span> #{idx + 1} of {riskForecast.areas.length} at-risk areas</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {mapViewMode === "link" && linkClusters.map((cluster, ci) => (
            <Fragment key={ci}>
              {cluster.incidents.map((inc, ii) => (
                <CircleMarker key={`lc-${ci}-${ii}`} center={[inc._lat, inc._lng]} radius={7}
                  pathOptions={{ color: cluster.color, fillColor: cluster.color, fillOpacity: 0.9, weight: 2 }}
                  eventHandlers={{
                    mouseover: (e) => { e.target.setStyle({ fillOpacity: 1, weight: 3 }); e.target.setRadius(10); e.target.openPopup() },
                    mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.9, weight: 2 }); e.target.setRadius(7) },
                    click: (e) => { e.target.openPopup() },
                  }}>
                  <Popup>
                    <div style={{ fontFamily: "DM Mono, monospace", fontSize: "11px", lineHeight: "1.8", minWidth: "200px" }}>
                      <div style={{ color: cluster.color, fontWeight: "700", letterSpacing: "1px", marginBottom: "6px" }}>CLUSTER {ci + 1} — {cluster.type}</div>
                      <div><span style={{ color: "#888" }}>Block:</span> {inc.block || "—"}</div>
                      <div><span style={{ color: "#888" }}>Area:</span> {COMMUNITY_AREAS[inc.community_area] || inc.community_area || "—"}</div>
                      <div><span style={{ color: "#888" }}>Date:</span> {new Date(inc._ts).toLocaleDateString()}</div>
                      <div><span style={{ color: "#888" }}>Time:</span> {new Date(inc._ts).toLocaleTimeString()}</div>
                      <div><span style={{ color: "#888" }}>Arrest:</span> {inc.arrest === "true" || inc.arrest === true ? "YES" : "NO"}</div>
                      <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: `1px solid ${cluster.color}44`, color: "#3a3a5c", fontSize: "9px" }}>{cluster.incidents.length} incidents in this cluster · {cluster.areas.slice(0,2).join(", ")}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              {cluster.incidents.slice(0, -1).map((inc, ii) => (
                <Polyline key={`ll-${ci}-${ii}`}
                  positions={[[inc._lat, inc._lng], [cluster.incidents[ii+1]._lat, cluster.incidents[ii+1]._lng]]}
                  pathOptions={{ color: cluster.color, weight: 1.5, opacity: 0.6, dashArray: "4 4" }} />
              ))}
            </Fragment>
          ))}
        </MapContainer>
      </div>

      <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
        {mapViewMode === "live" ? <>
          {[
            { label: "CRITICAL", color: "#ff2d2d", desc: "Homicide, Sexual Assault" },
            { label: "HIGH",     color: "#ff6b00", desc: "Robbery, Agg. Assault" },
            { label: "MEDIUM",   color: "#f5c400", desc: "Burglary, Vehicle Theft" },
            { label: "LOW",      color: "#4caf50", desc: "Theft, Battery, Narcotics" },
          ].map(({ label, color, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ color, fontSize: "9px", letterSpacing: "1px" }}>{label}</span>
              <span style={{ color: "#3a3a5c", fontSize: "9px" }}>{desc}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", color: "#3a3a5c", fontSize: "9px", alignSelf: "center" }}>
            Most recent {mapMarkerLimit.toLocaleString()} markers shown
          </div>
        </> : mapViewMode === "forecast" ? <>
          {[
            { label: "HIGH RISK", color: "#ff2d2d", desc: "Top 5 areas" },
            { label: "ELEVATED",  color: "#ff6b00", desc: "Areas 6–10" },
            { label: "MODERATE",  color: "#f5c400", desc: "Areas 11–15" },
          ].map(({ label, color, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ color, fontSize: "9px", letterSpacing: "1px" }}>{label}</span>
              <span style={{ color: "#3a3a5c", fontSize: "9px" }}>{desc}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", color: "#3a3a5c", fontSize: "9px", alignSelf: "center" }}>
            Based on {riskForecast.areas.reduce((s, a) => s + a.count, 0)} historical incidents · hover for details
          </div>
        </> : <>
          {linkClusters.slice(0, 5).map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "10px", height: "3px", background: c.color, flexShrink: 0 }} />
              <span style={{ color: c.color, fontSize: "9px" }}>CLUSTER {i + 1}</span>
              <span style={{ color: "#3a3a5c", fontSize: "9px" }}>{c.type} · {c.incidents.length} incidents</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", color: "#3a3a5c", fontSize: "9px", alignSelf: "center" }}>
            {linkClusters.reduce((s, c) => s + c.incidents.length, 0)} linked incidents across {linkClusters.length} clusters
          </div>
        </>}
      </div>

      {mapViewMode === "link" && <LinkAnalysis linkClusters={linkClusters} />}
    </div>
  )
}
