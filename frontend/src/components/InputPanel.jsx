function InputPanel({
  textInput,
  setTextInput,
  selectedFile,
  setSelectedFile,
  maskValues,
  setMaskValues,
  logAnalysis,
  setLogAnalysis,
  loading,
  onAnalyze,
  onReset,
}) {
  return (
    <section className="card">
      <h2>Input</h2>

      <label className="label">Paste text or logs</label>
      <textarea
        className="textarea"
        placeholder="Paste logs or suspicious text here..."
        value={textInput}
        onChange={(event) => setTextInput(event.target.value)}
      />

      <label className="label">Or upload a file (.txt, .log)</label>
      <input
        className="fileInput"
        type="file"
        accept=".txt,.log,text/plain"
        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
      />

      {selectedFile ? (
        <p className="fileName">Selected file: {selectedFile.name}</p>
      ) : null}

      <div className="options">
        <label>
          <input
            type="checkbox"
            checked={maskValues}
            onChange={(event) => setMaskValues(event.target.checked)}
          />
          Mask sensitive values
        </label>

        <label>
          <input
            type="checkbox"
            checked={logAnalysis}
            onChange={(event) => setLogAnalysis(event.target.checked)}
          />
          Enable log analysis
        </label>
      </div>

      <div className="buttonRow">
        <button className="primaryButton" onClick={onAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        <button className="secondaryButton" onClick={onReset} disabled={loading}>
          Reset
        </button>
      </div>
    </section>
  );
}

export default InputPanel;
