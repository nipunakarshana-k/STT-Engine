# STT Engine

**AI-powered speech-to-text and knowledge extraction platform**

STT Engine is a modern AI web application that transforms spoken content from uploaded audio and video files into structured, searchable, and actionable knowledge. It is designed as more than a simple transcription tool: the transcript becomes the foundation for translation, summarization, key point extraction, AI question answering, transcript search, and exportable documents.

The platform is intended for students, researchers, educators, journalists, businesses, meeting participants, content creators, and professionals who need to understand long audio or video content quickly.

## Product Vision

The long-term vision for STT Engine is to become an **AI Knowledge Extraction Platform**. Instead of only converting speech into plain text, the system should help users understand, organize, translate, search, summarize, and interact with spoken information.

## Problem Statement

People often spend too much time watching or listening to long videos, lectures, interviews, meetings, podcasts, and recordings just to find specific information. Many existing tools focus only on transcription and do not provide a complete workflow for turning spoken content into useful knowledge.

STT Engine solves this by combining:

- AI speech recognition
- Automatic transcript generation
- Translation
- AI-powered summaries
- Key point extraction
- Transcript search
- AI chat over transcript content
- Export to useful document formats

## Core Features

### Authentication

- User registration
- Secure login
- Password recovery
- Profile management

### Project Management

- Create transcription projects
- View all projects in a dashboard
- Search projects
- Delete or archive projects
- View recent activity
- Access previous transcripts, translations, summaries, and chat history

### Media Upload

- Upload audio files
- Upload video files
- Drag-and-drop upload
- Upload progress indicator
- Local storage during development
- Cloud object storage for production

Supported file types:

- MP3
- MP4
- WAV
- M4A

Future versions may support importing media from platforms such as YouTube, Facebook, or Instagram where technically and legally permitted.

### AI Speech-to-Text

- Automatic speech recognition
- Accurate transcript generation
- Timestamped transcript output
- Automatic language detection
- Original transcript storage
- Future speaker identification support

### Translation

Translate transcripts into multiple languages, including:

- English
- Sinhala
- Tamil
- French
- German
- Japanese
- Chinese
- Spanish

### AI Summarization

Generate different summary levels:

- Short summary
- Medium summary
- Detailed summary

### Key Point Extraction

Automatically extract:

- Main topics
- Important facts
- Names
- Dates
- Action items
- Main ideas
- Important quotes

### AI Chat Assistant

Users can ask natural language questions about the transcript, such as:

- What is this video about?
- Summarize the discussion.
- Explain this section.
- What are the key takeaways?
- What tasks were mentioned?
- What technologies are discussed?

### Transcript Search

- Search for any keyword in the transcript
- Highlight every occurrence
- Jump to relevant transcript sections

### Export Options

Download generated content as:

- PDF
- DOCX
- TXT

Future export options:

- SRT subtitles
- VTT subtitles

## Technology Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion

### Backend

- Next.js API Routes
- Python FastAPI AI microservice

### Database

- PostgreSQL
- Prisma ORM

### Authentication

- Auth.js / NextAuth

### Storage

- Local storage during development
- Cloud object storage for uploaded media in production

### AI Services

- Speech recognition: Whisper-compatible speech-to-text model
- Translation: Large language model
- Summarization: Large language model
- AI chat: Large language model

## Main Data Models

The database should include these core entities:

- Users
- Projects
- Media Files
- Transcripts
- Translations
- Summaries
- AI Chat Messages
- Export Records
- Activity Logs

Each project belongs to a user and may contain uploaded media, generated transcripts, translations, summaries, AI conversations, and exported documents.

## System Workflow

1. User signs in.
2. User creates a new project.
3. User uploads an audio or video file.
4. The backend stores the uploaded media.
5. The AI service extracts speech from the media.
6. Speech is converted into text.
7. The transcript is stored in PostgreSQL.
8. Users can translate the transcript.
9. AI generates summaries and key points.
10. Users interact with the transcript through an AI chat interface.
11. Results can be exported as PDF, DOCX, or TXT.
12. Project history is saved for future access.

## Pages

- Landing page
- Login
- Register
- Dashboard
- Create project
- Project details
- Transcript
- Summary
- AI chat
- History
- Profile
- Settings

## UI Direction

The user interface should feel like a professional AI SaaS product:

- Minimal layout
- Responsive design
- Dark and light themes
- Clean dashboard experience
- Accessible navigation
- Smooth animations
- Modern typography using Geist or Inter
- Color palette based on off-white surfaces and calm green accents
- Suggested colors: off-white background, deep charcoal text, soft green primary actions, muted sage borders, and subtle green highlights

The first screen after login should prioritize the actual user workflow: creating projects, uploading media, and viewing recent activity.

## Development Roadmap

### Phase 1: Foundation

- Project setup
- Next.js app structure
- Authentication
- PostgreSQL setup
- Prisma schema
- Dashboard shell

### Phase 2: Media and Transcription

- Project creation
- File upload
- Media storage
- FastAPI AI service setup
- Speech-to-text processing
- Transcript display
- Timestamp support

### Phase 3: Knowledge Extraction

- Translation
- Short, medium, and detailed summaries
- Key point extraction
- Transcript search

### Phase 4: Interaction and Export

- AI chat over transcripts
- Chat history
- Export to PDF
- Export to DOCX
- Export to TXT
- Activity history

### Phase 5: Polish and Delivery

- UI refinement
- Loading states
- Error handling
- Testing
- Deployment
- Documentation

## Future Enhancements

- Live meeting transcription
- Real-time translation
- Speaker identification
- Emotion and sentiment analysis
- Automatic chapter generation
- Subtitle generation
- Quiz generation from transcripts
- Flashcard generation
- Meeting minutes
- Browser extension
- Mobile application
- Team collaboration
- Public API
- Enterprise dashboard

## Final-Year Project Value

STT Engine is a strong final-year project because it combines full-stack software engineering with practical AI integration. It demonstrates:

- AI-powered speech recognition
- Natural language processing
- Machine translation
- Intelligent summarization
- Conversational AI
- Relational database design
- Secure authentication
- File processing
- Document generation
- Modern web application development

The project has a clear real-world use case and enough depth to grow beyond a university submission into a serious portfolio product.
