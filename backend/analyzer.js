const riskPatterns = [
  {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    type: "email",
    risk: "low",
    label: "Email Address",
  },
  {
    regex: /\b(?:password|passwd|pwd)\s*[:=]\s*\S+/gi,
    type: "password",
    risk: "critical",
    label: "Password",
  },
  {
    regex: /\b(?:api[_-]?key|apikey)\s*[:=]\s*\S+/gi,
    type: "api_key",
    risk: "high",
    label: "API Key",
  },
  {
    regex: /\bsk-[a-zA-Z0-9\-_]{20,}\b/g,
    type: "api_key",
    risk: "high",
    label: "OpenAI Style Key",
  },
  {
    regex: /\b(?:token|auth[_-]?token|access[_-]?token)\s*[:=]\s*\S+/gi,
    type: "token",
    risk: "high",
    label: "Auth Token",
  },
  {
    regex: /\b(?:secret|client[_-]?secret)\s*[:=]\s*\S+/gi,
    type: "secret",
    risk: "critical",
    label: "Secret Value",
  },
  {
    regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    type: "phone",
    risk: "low",
    label: "Phone Number",
  },
  {
    regex: /(?:NullPointerException|StackOverflow|SQLException|RuntimeException|Traceback|Error at line)/gi,
    type: "stack_trace",
    risk: "medium",
    label: "Stack Trace",
  },
  {
    regex: /(?:failed login|login failed|authentication failed|invalid credentials)/gi,
    type: "auth_failure",
    risk: "medium",
    label: "Authentication Failure",
  },
];

const riskScores = { none: 0, low: 1, medium: 2, high: 5, critical: 10 };

function scanContent(content) {
  const findings = [];
  const seenLines = new Set();

  for (const pattern of riskPatterns) {
    const matches = [...content.matchAll(pattern.regex)];
    for (const match of matches) {
      const line = content.slice(0, match.index).split("\n").length;
      const key = `${pattern.type}-${line}`;

      if (!seenLines.has(key)) {
        seenLines.add(key);
        findings.push({
          type: pattern.type,
          label: pattern.label,
          risk: pattern.risk,
          value: match[0].slice(0, 60) + (match[0].length > 60 ? "..." : ""),
          line,
        });
      }
    }
  }

  const riskScore = findings.reduce((total, item) => total + riskScores[item.risk], 0);
  let riskLevel = "none";

  if (riskScore >= 15) {
    riskLevel = "critical";
  } else if (riskScore >= 8) {
    riskLevel = "high";
  } else if (riskScore >= 3) {
    riskLevel = "medium";
  } else if (riskScore > 0) {
    riskLevel = "low";
  }

  return { findings, riskScore, riskLevel };
}

function buildSummary(inputType, findings, riskLevel) {
  if (!findings.length) {
    return `The submitted ${inputType} content looks fairly clean. No common exposed secrets or obvious risky patterns were found in the current scan.`;
  }

  const labels = [...new Set(findings.slice(0, 3).map((item) => item.label.toLowerCase()))];
  const detectedText = labels.join(", ");

  return `The submitted ${inputType} content contains ${findings.length} flagged item${findings.length === 1 ? "" : "s"}, including ${detectedText}. Overall risk is marked as ${riskLevel}, so this data should be reviewed before it is shared or stored.`;
}

function buildInsights(findings, riskLevel) {
  if (!findings.length) {
    return [
      "No matching secret or credential patterns were found in this scan.",
      "The input can still be reviewed manually for business-specific sensitive data.",
    ];
  }

  const insights = [];
  const firstCritical = findings.find((item) => item.risk === "critical");
  const firstHigh = findings.find((item) => item.risk === "high");
  const firstMedium = findings.find((item) => item.risk === "medium");

  if (firstCritical) {
    insights.push(`${firstCritical.label} is present near line ${firstCritical.line}, which is a major leak risk if this file is uploaded or logged externally.`);
  }

  if (firstHigh) {
    insights.push(`${firstHigh.label} was detected near line ${firstHigh.line}, so access tokens or integrations may already be exposed.`);
  }

  if (firstMedium) {
    insights.push(`${firstMedium.label} patterns appear in the content, which can help attackers understand failure paths or internal code structure.`);
  }

  if (riskLevel === "critical" || riskLevel === "high") {
    insights.push("The current content should not be forwarded to external systems until secrets are removed or masked.");
  }

  if (insights.length < 2) {
    insights.push("Multiple findings appear close together, which suggests the file may have been copied from a live environment or debug output.");
  }

  return insights.slice(0, 4);
}

function buildRecommendations(findings) {
  const recommendations = ["Mask or remove flagged credentials before sharing logs or screenshots."];

  if (findings.some((item) => item.type === "password" || item.type === "secret")) {
    recommendations.push("Rotate any passwords or secret values that may have been exposed.");
  }

  if (findings.some((item) => item.type === "api_key" || item.type === "token")) {
    recommendations.push("Replace exposed API keys or tokens and move them to environment variables or a secrets manager.");
  }

  if (findings.some((item) => item.type === "stack_trace")) {
    recommendations.push("Reduce verbose production error logs and avoid returning internal traces to users.");
  }

  if (recommendations.length < 3) {
    recommendations.push("Add a pre-commit or CI scan so similar leaks are caught automatically in the future.");
  }

  return recommendations.slice(0, 4);
}

function analyzeContent(content, inputType = "text") {
  const { findings, riskScore, riskLevel } = scanContent(content);
  const summary = buildSummary(inputType, findings, riskLevel);
  const insights = buildInsights(findings, riskLevel);
  const recommendations = buildRecommendations(findings);
  const action = riskLevel === "critical" || riskLevel === "high" ? "block" : "review";

  return {
    summary,
    contentType: inputType,
    findings,
    riskScore,
    riskLevel,
    insights,
    recommendations,
    action,
    lines: content.split("\n"),
  };
}

module.exports = {
  analyzeContent,
  riskPatterns,
  riskScores,
};
