const RISK_SCORES = {
  critical: 10,
  high: 5,
  medium: 2,
  low: 1,
  none: 0,
};

const RISK_PATTERNS = [
  {
    label: "Email Address",
    type: "email",
    risk: "low",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    label: "Phone Number",
    type: "phone",
    risk: "low",
    regex: /\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g,
  },
  {
    label: "Password",
    type: "password",
    risk: "critical",
    regex: /\b(?:password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]+['"]?/gi,
  },
  {
    label: "API Key",
    type: "api_key",
    risk: "high",
    regex: /\b(?:api[_-]?key|secret[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{8,}['"]?/gi,
  },
  {
    label: "Access Token",
    type: "token",
    risk: "high",
    regex: /\b(?:token|access[_-]?token|auth[_-]?token)\s*[:=]\s*['"]?[A-Za-z0-9\-._]{8,}['"]?/gi,
  },
  {
    label: "Stack Trace",
    type: "stack_trace",
    risk: "medium",
    regex: /(?:Exception:|Traceback|at\s+[A-Za-z0-9_$]+\.[A-Za-z0-9_$]+\(|ReferenceError|TypeError|NullPointerException)/g,
  },
  {
    label: "Suspicious Log Entry",
    type: "suspicious_log",
    risk: "medium",
    regex: /(?:failed login|invalid credentials|unauthorized|forbidden|permission denied)/gi,
  },
];

module.exports = {
  RISK_PATTERNS,
  RISK_SCORES,
};
