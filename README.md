# Security Check

This is a project made to check logs, text files, chat messages, and SQL snippets for sensitive information.

The main idea is simple: sometimes people share logs or debug output without realizing that passwords, tokens, emails, or secrets are visible inside them. This project scans the content and shows the risk level along with some suggestions.

## What it does

- scans text, logs, chats, and SQL content
- detects common risky patterns like passwords, API keys, tokens, emails, and stack traces
- gives a risk score and risk level
- shows findings line by line in the UI

## Tech used

- React for frontend
- Express / Node.js for backend
- Vite for frontend build

## Project structure

- `frontend/` for the React app
- `backend/` for the API and scanning logic

## How to run

Install dependencies:

```bash
npm install
npm --prefix frontend install
```

Start the project:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`  
Backend will run on `http://localhost:3001`

## Build for production

```bash
npm run build
npm start
```

Then open:

`http://localhost:3001`

## Why I made this

I wanted to build something related to security and practical debugging problems. In many teams, logs and copied error data are shared very casually, and that can expose sensitive information. This project tries to solve that in a simple way.


