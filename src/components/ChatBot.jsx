export default function ChatBot({ aiOpen, setAiOpen, aiMessages, aiQuestion, setAiQuestion, aiLoading, askAI, aiAutoCloseTimer }) {
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}>
      {aiOpen && (
        <div style={{ width: "360px", height: "480px", background: "#0d1520", border: "1px solid #3a3a5c", borderRadius: "12px", marginBottom: "12px", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a2e", background: "#0d1520", borderRadius: "12px 12px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: "700", letterSpacing: "1px" }}>AI Crime Analyst</div>
              <div style={{ color: "#8888aa", fontSize: "10px", marginTop: "2px" }}>Ask anything about the data</div>
            </div>
            <button onClick={() => { clearTimeout(aiAutoCloseTimer.current); setAiOpen(false) }} style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", fontSize: "18px" }}>×</button>
          </div>
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "#080810" }}>
            {aiMessages.length === 0 && (
              <div style={{ color: "#3a3a5c", fontSize: "11px", textAlign: "center", marginTop: "20px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔍</div>
                <div>Ask me anything about Chicago crime data</div>
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {["Is Austin safe at night?", "What time is most dangerous?", "Which area has most theft?"].map(q => (
                    <div key={q} onClick={() => setAiQuestion(q)} style={{ background: "#050508", border: "1px solid #1a1a2e", padding: "8px 12px", fontSize: "10px", color: "#8888aa", cursor: "pointer", borderRadius: "4px" }}>{q}</div>
                  ))}
                </div>
              </div>
            )}
            {aiMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "80%", padding: "10px 14px", fontSize: "11px", lineHeight: "1.6", borderRadius: "8px", background: msg.role === "user" ? "#5c7cfa" : "#050508", color: msg.role === "user" ? "#ffffff" : "#c0c8d8", border: msg.role === "user" ? "none" : "1px solid #1a1a2e" }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#050508", border: "1px solid #1a1a2e", padding: "10px 14px", borderRadius: "8px", color: "#3a3a5c", fontSize: "11px" }}>
                  Analyzing data...
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #1a1a2e", background: "#0d1520", borderRadius: "0 0 12px 12px", display: "flex", gap: "8px" }}>
            <input
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && askAI()}
              placeholder="Ask about the data..."
              style={{ flex: 1, background: "#0d1520", border: "1px solid #3a3a5c", color: "#c0c8d8", padding: "8px 12px", fontFamily: "monospace", fontSize: "11px", borderRadius: "4px" }}
            />
            <button onClick={askAI} disabled={aiLoading} style={{ background: "#5c7cfa", border: "none", color: "#ffffff", padding: "8px 12px", cursor: "pointer", borderRadius: "4px", fontSize: "16px" }}>
              →
            </button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => { clearTimeout(aiAutoCloseTimer.current); setAiOpen(!aiOpen) }} style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#5c7cfa", border: "none", color: "#ffffff", fontSize: "22px", cursor: "pointer", boxShadow: "0 4px 20px rgba(92, 124, 250, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {aiOpen ? "×" : "→"}
        </button>
      </div>
    </div>
  )
}
