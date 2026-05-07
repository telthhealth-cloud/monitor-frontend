import { useState } from "react";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function fmtTime(ms) {
  if (!ms && ms !== 0) return "—";
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}
function daysLeft(date) {
  if (!date) return null;
  return Math.floor((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}
function issueLevel(issue) {
  const crits = ["DNS FAILED","HTTP DOWN","DOMAIN EXPIRED","DOMAIN PARKED","REDIRECTED TO PARKING","CONTENT MISMATCH"];
  return crits.includes(issue) ? "crit" : "warn"; 
}

// ─── ICONS (inline SVG, no deps) ─────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    refresh: <path d="M4 4a8 8 0 1 1 0 16A8 8 0 0 1 4 4zm8 0v4l3-3" strokeLinecap="round" strokeLinejoin="round"/>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/></>,
    x: <><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round"/></>,
    warn: <><path d="M12 2 2 20h20L12 2z"/><path d="M12 9v5M12 17h.01" strokeLinecap="round"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    dns: <><rect x="3" y="4" width="18" height="5" rx="1"/><rect x="3" y="11" width="18" height="5" rx="1"/><circle cx="7.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="7.5" cy="13.5" r=".5" fill="currentColor"/></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v3M16 2v3M3 9h18"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></>,
    chevron: <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>,
    dot: <circle cx="12" cy="12" r="4" fill="currentColor"/>,
    server: <><rect x="3" y="3" width="18" height="6" rx="1"/><rect x="3" y="12" width="18" height="6" rx="1"/><circle cx="7" cy="6" r="1" fill="currentColor"/><circle cx="7" cy="15" r="1" fill="currentColor"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75"
      style={{ display:"inline-block", verticalAlign:"middle", flexShrink:0 }}>
      {icons[name]}
    </svg>
  );
};

// ─── STYLES (JS-in-CSS object helpers) ───────────────────────────────────────
const s = {
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "1.25rem",
  },
  row: { display:"flex", alignItems:"center", gap:8 },
  mono: { fontFamily:"var(--mono)", fontSize:13 },
  label: { color:"var(--text-muted)", fontSize:12, marginBottom:4 },
  val: { fontWeight:500, fontSize:14 },
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const up = status === "UP";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 10px", borderRadius:99, fontSize:12, fontWeight:600,
      background: up ? "var(--green-bg)" : "var(--red-bg)",
      color: up ? "var(--green)" : "var(--red)",
      border: `1px solid ${up ? "var(--green-border)" : "var(--red-border)"}`,
    }}>
      <Icon name={up ? "check" : "x"} size={12} /> {status}
    </span>
  );
}

// ─── ISSUE PILL ───────────────────────────────────────────────────────────────
function IssuePill({ issue }) {
  const level = issueLevel(issue);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"3px 9px", borderRadius:99, fontSize:11, fontWeight:500,
      background: level === "crit" ? "var(--red-bg)" : "var(--yellow-bg)",
      color: level === "crit" ? "var(--red)" : "var(--yellow)",
      border: `1px solid ${level === "crit" ? "var(--red-border)" : "var(--yellow-border)"}`,
    }}>
      {level === "crit" ? <Icon name="x" size={10}/> : <Icon name="warn" size={10}/>}
      {issue}
    </span>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function Metric({ label, value, color, icon }) {
  return (
    <div style={{ ...s.card, background:"var(--bg-card2)", padding:"1rem" }}>
      <div style={{ ...s.row, marginBottom:8 }}>
        <span style={{ color: color || "var(--text-muted)", opacity:0.8 }}>
          <Icon name={icon} size={14} />
        </span>
        <span style={s.label}>{label}</span>
      </div>
      <div style={{ fontSize:22, fontWeight:600, color: color || "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}

// ─── CHECK ROW ────────────────────────────────────────────────────────────────
function CheckRow({ icon, label, value, status }) {
  const color = status === "ok" ? "var(--green)" : status === "warn" ? "var(--yellow)" : status === "err" ? "var(--red)" : "var(--text)";
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"9px 0", borderBottom:"1px solid var(--border)",
    }}>
      <div style={{ ...s.row, color:"var(--text-muted)" }}>
        <Icon name={icon} size={14} />
        <span style={{ fontSize:13 }}>{label}</span>
      </div>
      <span style={{ ...s.mono, color, textAlign:"right", maxWidth:260, wordBreak:"break-all" }}>
        {value}
      </span>
    </div>
  );
}

// ─── DOMAIN DETAIL PANEL ──────────────────────────────────────────────────────
function DomainDetail({ site }) {
  const { dns, ssl, whois: w, http, issues, status } = site;
  const domainDays = daysLeft(w?.expiry);
  const sslDays = ssl?.daysLeft;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Header */}
      <div style={{ ...s.card, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:18, fontWeight:600, marginBottom:4 }}>{site.name}</div>
          <div style={{ ...s.mono, color:"var(--text-muted)", fontSize:13 }}>{site.domain}</div>
          <div style={{ fontSize:11, color:"var(--text-dim)", marginTop:6 }}>
            Checked {new Date(site.checkedAt).toLocaleString()}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div style={s.card}>
          <div style={{ ...s.label, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="warn" size={13}/> Issues detected
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {issues.map(i => <IssuePill key={i} issue={i} />)}
          </div>
        </div>
      )}

      {/* DNS */}
      <div style={s.card}>
        <div style={{ ...s.label, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
          <Icon name="server" size={13}/> DNS
        </div>
        <CheckRow icon="dot" label="Status" value={dns.failed ? "FAILED" : "Resolved"} status={dns.failed ? "err" : "ok"}/>
        {!dns.failed && dns.records && (
          <CheckRow icon="dot" label="IP records" value={dns.records.join(", ")} status="ok"/>
        )}
        {dns.failed && <CheckRow icon="dot" label="Error" value={dns.error || "Unknown"} status="err"/>}
      </div>

      {/* SSL */}
      <div style={s.card}>
        <div style={{ ...s.label, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
          <Icon name="lock" size={13}/> SSL Certificate
        </div>
        {ssl.failed ? (
          <CheckRow icon="dot" label="Status" value={`FAILED: ${ssl.error}`} status="err"/>
        ) : <>
          <CheckRow icon="dot" label="Trusted" value={ssl.authorized ? "Yes" : "No (self-signed / mismatch)"} status={ssl.authorized ? "ok" : "err"}/>
          <CheckRow icon="dot" label="Expires" value={`${ssl.expiry} (${sslDays}d left)`}
            status={sslDays < 7 ? "err" : sslDays < 30 ? "warn" : "ok"}/>
          {ssl.issuer && <CheckRow icon="dot" label="Issuer" value={ssl.issuer} status="ok"/>}
          {ssl.subject && <CheckRow icon="dot" label="Subject" value={ssl.subject} status="ok"/>}
        </>}
      </div>

      {/* Domain Expiry */}
      <div style={s.card}>
        <div style={{ ...s.label, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
          <Icon name="calendar" size={13}/> Domain Expiry (WHOIS)
        </div>
        {w.failed ? (
          <CheckRow icon="dot" label="WHOIS" value={`FAILED: ${w.error}`} status="err"/>
        ) : w.expiry ? <>
          <CheckRow icon="dot" label="Expiry date" value={`${fmt(w.expiry)} (${domainDays}d left)`}
            status={domainDays < 0 ? "err" : domainDays < 7 ? "err" : domainDays < 30 ? "warn" : "ok"}/>
          {w.registrar && <CheckRow icon="dot" label="Registrar" value={w.registrar} status="ok"/>}
        </> : <>
          <CheckRow icon="dot" label="Expiry" value="Could not parse from WHOIS" status="warn"/>
          {w.unknownKeys && (
            <div style={{ marginTop:8, padding:"8px 10px", background:"var(--bg)", borderRadius:"var(--radius-sm)", fontSize:11, color:"var(--text-dim)", fontFamily:"var(--mono)" }}>
              Available WHOIS keys: {w.unknownKeys.slice(0,8).join(", ")}{w.unknownKeys.length > 8 ? "…" : ""}
            </div>
          )}
        </>}
      </div>

      {/* HTTP */}
      <div style={s.card}>
        <div style={{ ...s.label, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
          <Icon name="globe" size={13}/> HTTP Response
        </div>
        {http.failed ? (
          <CheckRow icon="dot" label="Status" value={`DOWN: ${http.error}`} status="err"/>
        ) : <>
          <CheckRow icon="dot" label="HTTP status" value={String(http.status)}
            status={http.status >= 200 && http.status < 400 ? "ok" : "err"}/>
          <CheckRow icon="dot" label="Response time" value={fmtTime(http.time)}
            status={http.time > 3000 ? "warn" : "ok"}/>
          <CheckRow icon="link" label="Final URL" value={http.finalURL} status="ok"/>
          <CheckRow icon="dot" label="Parked / lander" value={http.isParked ? "Yes — parking page detected" : "No"} status={http.isParked ? "err" : "ok"}/>
          <CheckRow icon="dot" label="Content valid" value={http.contentValid ? "Yes" : "No (expected text not found)"} status={http.contentValid ? "ok" : "err"}/>
        </>}
      </div>
    </div>
  );
}

// ─── OVERVIEW SUMMARY CARD ────────────────────────────────────────────────────
function SiteCard({ site, selected, onSelect }) {
  const up = site.status === "UP";
  const hasCrit = site.issues.some(i => issueLevel(i) === "crit");

  return (
    <div onClick={onSelect} style={{
      ...s.card,
      cursor:"pointer",
      borderColor: selected ? "var(--blue)" : hasCrit ? "var(--red-border)" : up ? "var(--border)" : "var(--red-border)",
      transition:"border-color 0.15s, background 0.15s",
      background: selected ? "rgba(59,130,246,0.05)" : "var(--bg-card)",
    }}>
      <div style={{ ...s.row, justifyContent:"space-between", marginBottom:10 }}>
        <div>
          <div style={{ fontWeight:600, fontSize:15 }}>{site.name}</div>
          <div style={{ ...s.mono, fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{site.domain}</div>
        </div>
        <StatusBadge status={site.status} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom: site.issues.length ? 12 : 0 }}>
        <div style={{ fontSize:12, color:"var(--text-muted)" }}>
          HTTP <span style={{ color: site.http?.status >= 200 && site.http?.status < 400 ? "var(--green)" : "var(--red)" }}>
            {site.http?.failed ? "DOWN" : site.http?.status}
          </span>
          {site.http?.time ? <span style={{ color:"var(--text-dim)" }}> · {fmtTime(site.http.time)}</span> : null}
        </div>
        <div style={{ fontSize:12, color:"var(--text-muted)" }}>
          SSL <span style={{ color: site.ssl?.failed ? "var(--red)" : site.ssl?.daysLeft < 30 ? "var(--yellow)" : "var(--green)" }}>
            {site.ssl?.failed ? "FAILED" : `${site.ssl?.daysLeft}d`}
          </span>
        </div>
        <div style={{ fontSize:12, color:"var(--text-muted)" }}>
          DNS <span style={{ color: site.dns?.failed ? "var(--red)" : "var(--green)" }}>
            {site.dns?.failed ? "FAILED" : "OK"}
          </span>
        </div>
        <div style={{ fontSize:12, color:"var(--text-muted)" }}>
          Domain exp <span style={{ color: site.whois?.expiry ? (daysLeft(site.whois.expiry) < 30 ? "var(--yellow)" : "var(--green)") : "var(--text-dim)" }}>
            {site.whois?.expiry ? `${daysLeft(site.whois.expiry)}d` : "N/A"}
          </span>
        </div>
      </div>

      {site.issues.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {site.issues.map(i => <IssuePill key={i} issue={i}/>)}
        </div>
      )}

      <div style={{ marginTop:10, fontSize:11, color:"var(--text-dim)" }}>
        Click to view full details →
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);  // domain string of selected site
  const [lastRun, setLastRun] = useState(null);

  async function runCheck() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastRun(new Date());
      // Auto-select first site
      if (json.results?.length) setSelected(json.results[0].domain);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const results = data?.results || [];
  const upCount = results.filter(r => r.status === "UP").length;
  const downCount = results.filter(r => r.status === "DOWN").length;
  const critIssues = results.flatMap(r => r.issues.filter(i => issueLevel(i) === "crit")).length;
  const selectedSite = results.find(r => r.domain === selected);

  return (
    <div style={{ minHeight:"100vh", padding:"2rem", maxWidth:1200, margin:"0 auto" }}>

      {/* ── Top bar ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem" }}>
        <div>
          <div style={{ fontSize:22, fontWeight:600, letterSpacing:"-0.3px" }}>
            Telth Domain Monitor
          </div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4 }}>
            {lastRun ? `Last checked ${lastRun.toLocaleTimeString()}` : "Not checked yet"}
          </div>
        </div>

        <button onClick={runCheck} disabled={loading} style={{
          display:"flex", alignItems:"center", gap:8,
          background: loading ? "var(--bg-card2)" : "var(--blue)",
          color: loading ? "var(--text-muted)" : "#fff",
          border:"none", borderRadius:"var(--radius-sm)",
          padding:"10px 20px", fontSize:14, fontWeight:500,
          cursor: loading ? "not-allowed" : "pointer",
          transition:"background 0.15s",
        }}>
          <Icon name="refresh" size={15}/>
          {loading ? "Checking all domains…" : "Check all domains"}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          ...s.card, marginBottom:16,
          borderColor:"var(--red-border)", background:"var(--red-bg)",
          color:"var(--red)", fontSize:13,
        }}>
          <Icon name="x" size={14}/> Error: {error}
          <span style={{ color:"var(--text-muted)", marginLeft:12 }}>
            Make sure the backend is running on port 3001 (cd backend && node server.js)
          </span>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ ...s.card, textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
          <div style={{ fontSize:14, marginBottom:8 }}>Running checks across all domains…</div>
          <div style={{ fontSize:12, color:"var(--text-dim)" }}>DNS · SSL · WHOIS · HTTP — this takes ~5–10s</div>
        </div>
      )}

      {/* ── Results ── */}
      {!loading && data && (
        <>
          {/* Summary metrics */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
            <Metric label="Sites up" value={`${upCount} / ${results.length}`}
              color={upCount === results.length ? "var(--green)" : "var(--yellow)"}
              icon="check"/>
            <Metric label="Sites down" value={downCount}
              color={downCount > 0 ? "var(--red)" : "var(--green)"}
              icon="x"/>
            <Metric label="Critical issues" value={critIssues}
              color={critIssues > 0 ? "var(--red)" : "var(--green)"}
              icon="warn"/>
          </div>

          {/* Two-column: site cards left, detail right */}
          <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:16, alignItems:"start" }}>

            {/* Left: site overview cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {results.map(site => (
                <SiteCard
                  key={site.domain}
                  site={site}
                  selected={selected === site.domain}
                  onSelect={() => setSelected(site.domain)}
                />
              ))}
            </div>

            {/* Right: detail panel */}
            <div>
              {selectedSite ? (
                <DomainDetail site={selectedSite} />
              ) : (
                <div style={{ ...s.card, textAlign:"center", padding:"3rem", color:"var(--text-muted)" }}>
                  Select a site on the left to see full details
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty state ── */}
      {!loading && !data && !error && (
        <div style={{ ...s.card, textAlign:"center", padding:"4rem", color:"var(--text-muted)" }}>
          <div style={{ fontSize:32, marginBottom:16 }}>🔍</div>
          <div style={{ fontSize:16, fontWeight:500, marginBottom:8, color:"var(--text)" }}>
            Press "Check all domains" to start
          </div>
          <div style={{ fontSize:13 }}>
            Runs DNS · SSL · WHOIS · HTTP checks for all 3 Telth domains in parallel
          </div>
        </div>
      )}
    </div>
  );
}
