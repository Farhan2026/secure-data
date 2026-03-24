function ReportPanel({ result, loading, error }) {
  if (loading) {
    return (
      <section className="card">
        <h2>Analysis Result</h2>
        <p className="muted">Checking the content now...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <h2>Analysis Result</h2>
        <p className="errorText">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="card">
        <h2>Analysis Result</h2>
        <p className="muted">No result yet. Add input and click Analyze.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Analysis Result</h2>

      <div className="resultBox">
        <p>
          <strong>Summary:</strong> {result.summary}
        </p>
        <p>
          <strong>Risk Score:</strong> {result.risk_score}
        </p>
        <p>
          <strong>Risk Level:</strong>{" "}
          <span className={`badge badge-${result.risk_level}`}>{result.risk_level}</span>
        </p>
      </div>

      <div className="sectionBlock">
        <h3>Findings</h3>
        {result.findings.length === 0 ? (
          <p className="muted">No findings found.</p>
        ) : (
          <ul className="list">
            {result.findings.map((item, index) => (
              <li key={`${item.type}-${index}`} className="findingItem">
                <span className={`badge badge-${item.risk}`}>{item.risk}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.value}</p>
                  <small>Line {item.line}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sectionBlock">
        <h3>AI Insights</h3>
        <ul className="list simpleList">
          {result.insights.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="sectionBlock">
        <h3>Highlighted Lines</h3>
        <div className="logBox">
          {result.highlighted_lines.map((line) => (
            <div
              key={line.line_number}
              className={line.is_risky ? "logLine riskyLine" : "logLine"}
            >
              <span className="lineNumber">{line.line_number}</span>
              <span className="lineText">{line.text || " "}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReportPanel;
