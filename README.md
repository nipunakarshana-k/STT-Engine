# STT Engine

**AI-powered speech-to-text and knowledge extraction platform**

STT Engine is a personal AI web application that turns spoken content from videos, audio files, podcasts, lectures, interviews, and meetings into structured knowledge. Instead of stopping at transcription, the product helps users summarize, translate, search, chat with, and export the information inside spoken content.

## Product Direction

STT Engine should feel like a calm AI assistant for understanding media. The first screen is a public landing page that explains the product, and the Get Started flow opens a chatbot-style workspace where users can paste a video URL and choose what they want to do next.

## Current Focus

The current milestone is **frontend only**. The app should look and feel complete with mock data, prototype actions, responsive screens, and clean user flows before backend, database, authentication, or real AI processing are added.

## Core User Flow

1. User opens the landing page.
2. User reads the hero, about section, features, and how-it-works section.
3. User clicks **Get Started** in the header or hero.
4. User lands in a chatbot-style workspace.
5. User pastes a video URL and sends it.
6. The assistant shows available options:
   - Generate transcript
   - Summarize video
   - Translate transcript
   - Ask questions
   - Export results

## Main Features

- Landing page with hero, description, about, features, and how-it-works sections
- Chatbot-style workspace for starting media analysis
- Video URL input flow
- AI speech-to-text transcript generation
- Timestamped transcript display
- Transcript search
- AI summaries
- Key point extraction
- Multi-language translation
- AI chat over transcript content
- Export to PDF, DOCX, TXT, SRT, or VTT

## Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React icons
- Framer Motion
- PostgreSQL and Prisma for future persistence
- FastAPI microservice for future AI/media processing
- Whisper-compatible speech-to-text model
- Large language model for summaries, translation, and chat

## Current Folder Structure

```txt
app/
  page.tsx
  workspace/
    page.tsx
components/
features/
  landing/
    landing-page.tsx
  workspace/
    chat-workspace.tsx
lib/
types/
public/
```

## UI Direction

The interface should use a calm, focused product style:

- Off-white backgrounds
- Calm green primary actions
- Muted sage borders
- Deep charcoal text
- Subtle green highlights
- Clean spacing
- Responsive layouts
- Professional but friendly chatbot experience

## Development Roadmap

### Phase 1: Product Shell

- Landing page
- Chatbot workspace
- Video URL input
- Action option cards
- Responsive UI

### Phase 2: Frontend Completion

- Transcript preview UI
- Summary preview UI
- Translation options UI
- AI question suggestions UI
- Export options UI
- Empty, loading, and error states

### Phase 3: Media Processing

- Validate video URLs
- Support direct media uploads
- Extract audio from media
- Send jobs to backend processing queue

### Phase 4: AI Features

- Speech-to-text transcription
- Timestamped transcript generation
- Summaries
- Key points
- Translation

### Phase 5: Workspace Features

- AI chat with transcript context
- Transcript search
- Project history
- Export files
- User accounts

### Phase 6: Production

- Database persistence
- Authentication
- Cloud file storage
- Deployment
- Error handling
- Usage limits
