const { RISK_PATTERNS, RISK_SCORES } = require("./riskPatterns");

function maskSensitiveValue(value, shouldMask) {
  if (!shouldMask) {
    return value;
  }

  if (value.length <= 6) {
    return "*".repeat(value.length);
  }

  return `${value.slice(0, 3)}${"*".repeat(value.length - 6)}${value.slice(-3)}`;
}

function detectFindings(content, options) {
  const findings = [];
  const lines = content.split("\n");
  const seen = new Set();

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    RISK_PATTERNS.forEach((pattern) => {
      const matches = [...line.matchAll(pattern.regex)];

      matches.forEach((match) => {
        const uniqueKey = `${pattern.type}-${lineNumber}-${match[0]}`;

        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          findings.push({
            type: pattern.type,
            label: pattern.label,
            risk: pattern.risk,
            line: lineNumber,
            raw_value: match[0],
            value: maskSensitiveValue(match[0], options.mask),
            message: `${pattern.label} found on line ${lineNumber}`,
          });
        }
      });

      pattern.regex.lastIndex = 0;
    });
  });

  return findings;
}

function getRiskLevel(score) {
  if (score >= 15) return "critical";
  if (score >= 8) return "high";
  if (score >= 3) return "medium";
  if (score >= 1) return "low";
  return "none";
}

function buildSummary(findings, riskLevel) {
  if (!findings.length) {
    return "No major sensitive data was found in the provided content.";
  }

  if (riskLevel === "critical") {
    return "Sensitive credentials found. Immediate review is recommended.";
  }

  if (riskLevel === "high") {
    return "Important risky data was found in the content.";
  }

  if (riskLevel === "medium") {
    return "Multiple warnings were detected during analysis.";
  }

  return "Some low-risk sensitive patterns were found.";
}

function buildInsights(findings, riskLevel, inputType) {
  const insights = [];

  if (!findings.length) {
    return [
      "No risky pattern matched the current regex rules.",
      "You can still manually review the content for project-specific secrets.",
    ];
  }

  if (findings.some((item) => item.type === "password")) {
    insights.push("Sensitive credentials found");
  }

  if (findings.some((item) => item.type === "api_key" || item.type === "token")) {
    insights.push("Access-related secrets were detected");
  }

  if (findings.some((item) => item.type === "stack_trace")) {
    insights.push("Multiple errors detected in log style content");
  }

  if (inputType === "log" || inputType === "file") {
    insights.push("Uploaded content looks like log data and should not be shared publicly without review");
  }

  if (riskLevel === "critical" || riskLevel === "high") {
    insights.push("Overall risk is high enough to block public sharing until cleanup is done");
  }

  return insights.slice(0, 5);
}

function buildHighlightedLines(content, findings) {
  const findingsByLine = new Map();

  findings.forEach((item) => {
    if (!findingsByLine.has(item.line)) {
      findingsByLine.set(item.line, []);
    }

    findingsByLine.get(item.line).push(item);
  });

  return content.split("\n").map((line, index) => {
    const lineNumber = index + 1;
    const lineFindings = findingsByLine.get(lineNumber) || [];

    return {
      line_number: lineNumber,
      text: line,
      is_risky: lineFindings.length > 0,
      risks: lineFindings.map((item) => item.risk),
    };
  });
}

function buildAnalysisResponse({ inputType, content, options }) {
  const findings = detectFindings(content, options);
  const riskScore = findings.reduce((total, item) => total + RISK_SCORES[item.risk], 0);
  const riskLevel = getRiskLevel(riskScore);

  return {
    input_type: inputType,
    summary: buildSummary(findings, riskLevel),
    findings,
    risk_score: riskScore,
    risk_level: riskLevel,
    insights: buildInsights(findings, riskLevel, inputType),
    highlighted_lines: buildHighlightedLines(content, findings),
    options,
  };
}

module.exports = {
  buildAnalysisResponse,
};
