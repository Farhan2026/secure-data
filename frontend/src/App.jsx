import { useState } from "react";
import InputPanel from "./components/InputPanel.jsx";
import ReportPanel from "./components/ReportPanel.jsx";

const API_URL = "https://secure-data.onrender.com/analyze";

function App() {
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [maskValues, setMaskValues] = useState(true);
  const [logAnalysis, setLogAnalysis] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      let response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append(
          "options",
          JSON.stringify({
            mask: maskValues,
            log_analysis: logAnalysis,
          })
        );

        response = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input_type: logAnalysis ? "log" : "text",
            content: textInput,
            options: {
              mask: maskValues,
              log_analysis: logAnalysis,
            },
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setTextInput("");
    setSelectedFile(null);
    setResult(null);
    setError("");
  }

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <p className="tag">Major Project</p>
          <h1>AI Secure Data Intelligence Platform</h1>
          <p className="subtitle">
            A simple tool to scan logs and text for risky data like passwords,
            API keys, emails, tokens, and stack traces.
          </p>
        </header>

        <div className="layout">
          <InputPanel
            textInput={textInput}
            setTextInput={setTextInput}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            maskValues={maskValues}
            setMaskValues={setMaskValues}
            logAnalysis={logAnalysis}
            setLogAnalysis={setLogAnalysis}
            loading={loading}
            onAnalyze={handleAnalyze}
            onReset={resetAll}
          />

          <ReportPanel result={result} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}

export default App;
