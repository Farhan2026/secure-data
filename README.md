# AI Secure Data Intelligence Platform

## Project Overview

This project is a simple secure data scanning platform made for academic use. It checks text input and uploaded log files to find risky information like passwords, API keys, emails, tokens, phone numbers, and stack traces.

The main goal of the project is to help detect sensitive data before logs or text content are shared with other people.

## Features

- Text input analysis
- File upload support for `.txt` and `.log`
- Regex based detection engine
- Risk score and overall risk level
- Highlighted risky lines with line numbers
- Simple AI style insights based on findings
- Clean frontend and backend separation

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- File Upload: Multer
- Detection: Regex patterns

## Folder Structure

```text
project-root/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## How to Run

### 1. Open backend folder

```bash
cd backend
npm install
npm start
```

Backend will run on:

`http://localhost:3001`

### 2. Open frontend folder in another terminal

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

`http://localhost:5173`

## API

### POST `/analyze`

Sample JSON request:

```json
{
  "input_type": "text",
  "content": "email=test@example.com\npassword=admin123",
  "options": {
    "mask": true,
    "log_analysis": true
  }
}
```

Sample response:

```json
{
  "summary": "Sensitive credentials found. Immediate review is recommended.",
  "findings": [
    {
      "label": "Email Address",
      "risk": "low",
      "line": 1
    },
    {
      "label": "Password",
      "risk": "critical",
      "line": 2
    }
  ],
  "risk_score": 11,
  "risk_level": "high",
  "insights": [
    "Sensitive credentials found",
    "Overall risk is high enough to block public sharing until cleanup is done"
  ]
}
```

## Sample Test Input

```text
2026-03-24 10:20:00 INFO User login started
email=student@example.com
password=project123
token=abcde12345xyz
TypeError: Cannot read property of undefined
```

## Notes

- This is a student level project, so the AI insight part is kept simple.
- The current version uses regex rules and generated summary logic instead of a paid AI API.
- File upload is limited to safe text based files only.
