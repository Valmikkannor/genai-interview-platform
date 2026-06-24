# Interview with AI

An AI-powered interview preparation platform that analyzes your resume/profile against a target role, generates tailored interview questions, scores your job match, identifies skill gaps, and builds a personalized prep roadmap.

## Features

- **AI-Generated Interview Questions** — Role-specific questions with the interviewer's intention behind each one and guidance on how to answer well.
- **Match Score** — A visual score ring showing how well your profile matches the target job, color-coded by strength (high / medium / low).
- **Skill Gap Analysis** — Tags highlighting missing or weak skills relative to the role, prioritized by severity.
- **Prep Roadmap** — A day-by-day timeline of tasks and focus areas to close skill gaps before the interview.
- **Responsive UI** — Three-panel layout (navigation, content, insights sidebar) that adapts down to mobile.

## Tech Stack

- **Frontend:** React 
- **Styling:** SCSS (Dart Sass)
- **AI/LLM:** Google Gemini, Groq 
- **State Management:** *(e.g. useState, useEffect, React Context)*
- **Backend:** *(e.g. Node.js + Express js)*
- **Database:** *(MongoDB)*

## Project Structure

```
src/
├── features/
│   └── interview/
│       ├── components/        # UI components (question cards, roadmap, sidebar, etc.)
│       ├── style/
│       │   └── interview.scss # Page styling
│       ├── hooks/              # Custom hooks for interview logic
│       └── services/           # API calls to AI backend
├── shared/                     # Shared components, utils, theme variables
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
git clone https://github.com/your-username/interview-with-ai.git
cd interview-with-ai
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
AI_API_KEY=your_api_key_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:8000`.

### Build for Production

```bash
npm run build
npm start
```

## How It Works

1. **Upload/Connect Profile** — User provides their resume or profile data along with the target job description.
2. **AI Analysis** — The AI model analyzes the profile against the role to generate:
   - A list of likely interview questions with ideal answer strategies
   - A match score
   - A ranked list of skill gaps
3. **Roadmap Generation** — Based on identified gaps and time until interview, the AI builds a day-by-day prep plan.
4. **Practice** — User reviews questions, expands cards to see intent/answer guidance, and works through the roadmap.

## Scripts

| Command           | Description                          |
|--------------------|---------------------------------------|
| `npm run dev`       | Start development server              |
| `npm run build`     | Build for production                  |
| `npm run start`     | Run production build                  |
| `npm run lint`      | Run linter                            |

## Roadmap / Future Improvements

- [ ] Mock interview mode with voice/video AI feedback
- [ ] Progress tracking across multiple interview sessions
- [ ] Export prep plan as PDF
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

