import { useMemo, useRef, useState } from "react";

const riskColors = {
  none: { text: "#c8d5f0", badge: "#415a99", bg: "#1b2440" },
  low: { text: "#59d37b", badge: "#228b4e", bg: "#13261c" },
  medium: { text: "#ffd166", badge: "#b8860b", bg: "#2d2611" },
  high: { text: "#ff9f43", badge: "#c96b11", bg: "#341f11" },
  critical: { text: "#ff6b6b", badge: "#b23a48", bg: "#38171c" },
};

const starterSamples = {
  text: `Customer support ticket from user raj@example.com\nTemporary password=demo123\nThe user reported repeated login failures on the admin panel.`,
  log: `2026-03-20 14:31:11 INFO login email=demo@company.com
2026-03-20 14:31:14 ERROR failed login for user admin
2026-03-20 14:31:20 WARN api_key=sk-demo-example-key-1234567890`,
  sql: `INSERT INTO audit_logs(message) VALUES ('invalid credentials for user test@example.com');
SELECT * FROM secrets WHERE client_secret='abc123-demo';`,
  chat: `Team chat:
Please do not paste production tokens here.
access_token=demo-token-98231
Need help fixing RuntimeException in payment service.`,
};

function App() {
  const [inputType, setInputType] = useState("text");
  const [content, setContent] = useState(starterSamples.text);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("findings");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const summaryTone = useMemo(() => {
    if (!result) return riskColors.none;
    return riskColors[result.riskLevel] || riskColors.none;
  }, [result]);

  async function runAnalysis() {
    if (!content.trim()) return;

    setError("");
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, inputType }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);
      setActiveTab("findings");
    } catch (err) {
      setError("Could not reach the analyzer server. Start the backend and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function applySample(type) {
    setInputType(type);
    setContent(starterSamples[type]);
    setFileName("");
    setResult(null);
    setError("");
  }

  function handleFile(file) {
    const reader = new FileReader();
    setFileName(file.name);

    reader.onload = (event) => {
      const value = String(event.target?.result || "");
      setContent(value);
      setResult(null);
      setError("");
    };

    reader.readAsText(file);
  }

  function onDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Project</p>
          <h1>Security Check </h1>
          <p className="subtext">Scan logs, SQL dumps, chats, and text for risky leaks before they spread.</p>
        </div>
        <div className="badge-row">
          <span>Secret Scan</span>
          <span>Risk Score</span>
          <span>Live Report</span>
        </div>
      </header>

      <main className="grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Input</p>
              <h2>Source Data</h2>
            </div>
            <div className="type-row">
              {Object.keys(starterSamples).map((type) => (
                <button
                  key={type}
                  className={inputType === type ? "type-btn active" : "type-btn"}
                  onClick={() => applySample(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button
            className={isDragging ? "upload-box dragging" : "upload-box"}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <strong>{fileName || "Drop a .log, .txt, or .sql file here"}</strong>
            <span>or click to upload a sample file from your machine</span>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".log,.txt,.sql"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleFile(file);
              }
            }}
          />

          <textarea
            className="editor"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste logs or text here..."
          />

          <div className="action-row">
            <button className="primary-btn" disabled={isAnalyzing || !content.trim()} onClick={runAnalysis}>
              {isAnalyzing ? "Analyzing..." : "Run Analysis"}
            </button>
            <button
              className="secondary-btn"
              onClick={() => {
                setContent("");
                setFileName("");
                setResult(null);
                setError("");
              }}
            >
              Clear
            </button>
            <span className="meta-text">{content.split("\n").length} lines</span>
          </div>

          {error ? <p className="error-text">{error}</p> : null}
        </section>

        <section className="panel results-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Output</p>
              <h2>Security Report</h2>
            </div>
          </div>

          {!result && !isAnalyzing ? (
            <div className="empty-state">
              <h3>No analysis yet</h3>
              <p>Run the scanner to see detected findings, risk level, and suggested fixes.</p>
            </div>
          ) : null}

          {isAnalyzing ? (
            <div className="empty-state">
              <h3>Scanning content</h3>
              <p>Checking for exposed credentials, stack traces, authentication failures, and related signals.</p>
            </div>
          ) : null}

          {result ? (
            <>
              <div className="summary-card" style={{ backgroundColor: summaryTone.bg }}>
                <div>
                  <p className="eyebrow">Risk Level</p>
                  <div className="score-row">
                    <span className="pill" style={{ backgroundColor: summaryTone.badge }}>
                      {result.riskLevel.toUpperCase()}
                    </span>
                    <strong style={{ color: summaryTone.text }}>Score: {result.riskScore}</strong>
                  </div>
                  <p className="summary-text">{result.summary}</p>
                </div>
                <div className="summary-side">
                  <span>{result.findings.length} findings</span>
                  <span>Action: {result.action}</span>
                </div>
              </div>

              <div className="tabs">
                {["findings", "insights", "lines"].map((tab) => (
                  <button
                    key={tab}
                    className={activeTab === tab ? "tab-btn active" : "tab-btn"}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === "findings" &&
                  (result.findings.length ? (
                    result.findings.map((item, index) => (
                      <article key={`${item.type}-${index}`} className="finding-card">
                        <span className={`risk-label risk-${item.risk}`}>{item.risk}</span>
                        <div>
                          <h3>{item.label}</h3>
                          <p>{item.value}</p>
                        </div>
                        <span className="line-tag">Line {item.line}</span>
                      </article>
                    ))
                  ) : (
                    <p className="soft-text">No sensitive patterns were detected in this content.</p>
                  ))}

                {activeTab === "insights" && (
                  <div className="insight-grid">
                    <div>
                      <p className="eyebrow">Insights</p>
                      {result.insights.map((item, index) => (
                        <div key={index} className="bullet-card">
                          {item}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="eyebrow">Recommendations</p>
                      {result.recommendations.map((item, index) => (
                        <div key={index} className="bullet-card success">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "lines" && (
                  <div className="line-view">
                    {result.lines.map((line, index) => {
                      const finding = result.findings.find((item) => item.line === index + 1);
                      return (
                        <div key={index} className={finding ? "line-row flagged" : "line-row"}>
                          <span className="line-number">{index + 1}</span>
                          <code>{line || " "}</code>
                          {finding ? <span className={`risk-label risk-${finding.risk}`}>{finding.risk}</span> : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
