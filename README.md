<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
</div>

<br/>

<div align="center">
  <h1>MockMind AI</h1>
  <p><strong>AI-Powered Mock Interview Platform</strong></p>
  <p>A fully interactive, voice-enabled mock interview platform powered by Google Gemini AI. Practice interviews with realistic AI recruiters, get scored in real time, and receive detailed performance reports.</p>
</div>

---

## Features

- **Realistic AI Interviews** – Practice with AI interviewers that adapt to your responses in real time
- **Multiple Interview Types** – Technical, behavioral, system design, and more
- **Customizable Roles** – Choose from preset roles or define your own custom position
- **Experience Levels** – Adjust difficulty from Junior to Principal/Architect
- **Live Scoring** – Get scored across Clarity, Correctness, Depth, and Structure after each answer
- **Detailed Reports** – Receive comprehensive feedback with strengths, weaknesses, and improvement tips
- **Session History** – All past interviews are saved locally for review
- **Modern UI** – Beautiful, responsive interface built with React + Tailwind CSS

## Tech Stack

| Tech | Purpose |
|------|---------|
| **React 19** | Frontend UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool and dev server |
| **Express** | Backend API server |
| **Tailwind CSS v4** | Utility-first styling |
| **Google Gemini API** | AI-powered interview generation and scoring |
| **Motion** | Animation library |
| **Lucide React** | Icon library |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/rajeevreddy23/Ai-Interview.git
cd Ai-Interview

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── SetupScreen.tsx       # Interview configuration
│   │   ├── InterviewScreen.tsx   # Live interview session
│   │   ├── ReportScreen.tsx      # Performance report
│   │   └── HistoryScreen.tsx     # Past sessions
│   ├── App.tsx                   # Main app with state management
│   ├── main.tsx                  # Entry point
│   ├── types.ts                  # TypeScript types
│   ├── index.css                 # Global styles (Tailwind)
│   └── assets/                   # Static assets
├── server.ts                     # Express backend + Gemini API routes
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/start` | Start a new interview session |
| POST | `/api/interview/answer` | Submit an answer and get scoring + follow-up |
| POST | `/api/interview/report` | Generate final performance report |

## Deployment

This app is a full-stack Node.js application. You can deploy it to any platform that supports Node.js:

### Deploy on Render

1. Push the repo to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repository
4. Set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/server.cjs`
   - **Environment Variables:** Add `GEMINI_API_KEY`
5. Deploy!

### Deploy on Railway

1. Push the repo to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repository
4. Add `GEMINI_API_KEY` environment variable
5. Railway will auto-detect the Node.js project and deploy

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `APP_URL` | No | Public URL (auto-set by deployment platforms) |
| `PORT` | No | Server port (default: 3000) |

## License

MIT
