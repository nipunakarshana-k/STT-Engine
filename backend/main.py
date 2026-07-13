import os
import json
import uuid
import shutil
import tempfile
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai

app = FastAPI(title="STT Engine AI Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini API if key is present in environment
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Gemini API configured successfully from env.")
else:
    print("WARNING: GEMINI_API_KEY environment variable not set. Running in mock/fallback mode unless client key provided.")

# Helper to clean JSON string returned from LLM
def clean_llm_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...), 
    language: Optional[str] = Form("English"),
    x_gemini_key: Optional[str] = Header(None)
):
    # Save uploaded file to a temporary location
    temp_dir = tempfile.gettempdir()
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1] or ".mp3"
    temp_path = os.path.join(temp_dir, f"{file_id}{ext}")
    
    active_key = x_gemini_key or GEMINI_API_KEY
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        duration = 60.0 # Default fallback duration estimation
        
        # If API key is present, upload file to Gemini and request transcription
        if active_key:
            try:
                genai.configure(api_key=active_key)
                
                # Upload file to Gemini Files API (supports audio/video formats)
                print(f"Uploading {temp_path} to Gemini...")
                g_file = genai.upload_file(path=temp_path)
                print(f"File uploaded. Name: {g_file.name}. Polling status...")
                
                # Wait for video/audio file processing to complete
                retries = 0
                while g_file.state.name == "PROCESSING" and retries < 30:
                    time.sleep(2)
                    g_file = genai.get_file(g_file.name)
                    retries += 1
                    print(f"File status: {g_file.state.name}")
                
                if g_file.state.name != "ACTIVE":
                    raise Exception(f"File processing failed on Gemini. State: {g_file.state.name}")
                
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    "Please analyze this video/audio file. If it contains audio speech, transcribe it word-for-word. "
                    "If the video is silent or has no audio (e.g. screen recording or silent animation), analyze the video frames scene-by-scene: "
                    "describe what is happening in detail, and use OCR to read all text, labels, and names shown on the screen. "
                    "Output the result ONLY as a valid JSON list of objects, where each object has exactly these keys:\n"
                    "- 'time': string formatted as HH:MM:SS representing the starting timestamp of the segment\n"
                    "- 'text': string representing the spoken transcript or the visual description of that segment\n"
                    "- 'startMs': integer representing the start milliseconds\n\n"
                    "Keep segments short (around 5-15 seconds each). "
                    "Do not wrap the response in markdown blocks or include any extra text. Just output raw JSON."
                )
                
                print("Requesting transcription/description from Gemini...")
                response = model.generate_content([g_file, prompt])
                
                # Delete file from Gemini storage
                try:
                    genai.delete_file(g_file.name)
                except Exception as e:
                    print(f"Failed to delete Gemini file: {e}")
                    
                cleaned_response = clean_llm_json(response.text)
                segments = json.loads(cleaned_response)
                
                return {
                    "status": "ready",
                    "durationSeconds": duration,
                    "segments": segments
                }
            except Exception as e:
                print(f"Gemini transcription failed, falling back to mock: {e}")
                
        # Mock/simulated transcription fallback when API key is missing or fails
        print("Using mock transcription fallback...")
        mock_segments = [
            {
                "time": "00:00:05",
                "text": f"Welcome to the session. Today, we are discussing the STT Engine platform and its ability to process {file.filename}.",
                "startMs": 5000
            },
            {
                "time": "00:00:25",
                "text": "Using modern AI technologies, we can automatically extract speech, generate summaries, and translate them to other languages.",
                "startMs": 25000
            },
            {
                "time": "00:00:50",
                "text": "Finally, we can chat with this content in real time and export the transcript as a PDF, Word Document, or TXT file.",
                "startMs": 50000
            }
        ]
        return {
            "status": "ready",
            "durationSeconds": 65.0,
            "segments": mock_segments
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

class SummarizeRequest(BaseModel):
    text: str

@app.post("/summarize")
async def summarize(req: SummarizeRequest, x_gemini_key: Optional[str] = Header(None)):
    active_key = x_gemini_key or GEMINI_API_KEY
    if active_key:
        try:
            genai.configure(api_key=active_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                "Based on the following transcript text or scene description, generate three levels of summaries in JSON format. "
                "The JSON must have three keys: 'short', 'medium', and 'detailed'.\n"
                "- 'short': a 1-2 sentence quick summary.\n"
                "- 'medium': a 1-2 paragraph summary.\n"
                "- 'detailed': a thorough bulleted summary of all main sections.\n\n"
                "Do not include markdown or wrappers. Output raw JSON only.\n\n"
                f"Content:\n{req.text}"
            )
            response = model.generate_content(prompt)
            cleaned = clean_llm_json(response.text)
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini summarization failed: {e}")
            
    # Mock fallback
    return {
        "short": "This content introduces the STT Engine and its capability to convert speech into structured knowledge.",
        "medium": "The STT Engine is an AI-powered speech-to-text platform that allows users to upload audio and video, transcribe it, translate it into several languages, chat with the transcript content, and export the resulting data to PDF, Word, and text formats.",
        "detailed": "• Introduction to STT Engine: Highlights the mission of transforming speech to actionable knowledge.\n• Key Capabilities: Discusses speech recognition, translation (including Sinhala, Tamil, French), and smart exports.\n• Future Roadmap: Outlines enhancements such as live meeting transcription, quiz generation, and enterprise features."
    }

class KeypointsRequest(BaseModel):
    text: str

@app.post("/extract-keypoints")
async def extract_keypoints(req: KeypointsRequest, x_gemini_key: Optional[str] = Header(None)):
    active_key = x_gemini_key or GEMINI_API_KEY
    if active_key:
        try:
            genai.configure(api_key=active_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                "Analyze the following transcript text or video description and extract key information in JSON format. "
                "The JSON must have six list keys: 'topics', 'facts', 'names', 'dates', 'actions', 'quotes'.\n"
                "- 'topics': Important high level themes/subjects.\n"
                "- 'facts': Core facts or claims made.\n"
                "- 'names': Names of organizations, technologies, people or screens shown.\n"
                "- 'dates': Specific timeframes, deadlines, or dates mentioned.\n"
                "- 'actions': Takeaways, next steps, or todo items.\n"
                "- 'quotes': Direct, notable quotes or visible texts.\n\n"
                "Do not include markdown. Output raw JSON only.\n\n"
                f"Content:\n{req.text}"
            )
            response = model.generate_content(prompt)
            cleaned = clean_llm_json(response.text)
            return json.loads(cleaned)
        except Exception as e:
            print(f"Gemini keypoints extraction failed: {e}")
            
    # Mock fallback
    return {
        "topics": ["AI Transcription", "Knowledge Extraction", "File Exporting"],
        "facts": ["STT Engine supports PDF, DOCX, TXT, SRT, and VTT exports.", "Audio files can be transcribed in multiple languages."],
        "names": ["STT Engine", "Gemini AI", "Whisper model"],
        "dates": ["July 2026", "Future releases"],
        "actions": ["Upload your first media file", "Review the generated transcript", "Translate or summarize for export"],
        "quotes": ["Transcription alone is not the final value. The transcript allows search, summary, and chat."]
    }

class TranslateRequest(BaseModel):
    text: str
    target_language: str

@app.post("/translate")
async def translate(req: TranslateRequest, x_gemini_key: Optional[str] = Header(None)):
    active_key = x_gemini_key or GEMINI_API_KEY
    if active_key:
        try:
            genai.configure(api_key=active_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"Translate the following transcript or description text into {req.target_language}. "
                "Maintain the flow and tone of the original spoken or written content. "
                "Output only the translated text.\n\n"
                f"Text:\n{req.text}"
            )
            response = model.generate_content(prompt)
            return {"translatedText": response.text.strip()}
        except Exception as e:
            print(f"Gemini translation failed: {e}")
            
    # Mock fallback
    translations = {
        "Sinhala": "මෙය STT එන්ජිම පිළිබඳ හැඳින්වීමක් වන අතර කථනය ව්‍යුහගත දැනුමක් බවට පරිවර්තනය කිරීමේ හැකියාව ඇත.",
        "Tamil": "இது எஸ்டිடி இன்ஜின் பற்றிய அறிமுகமாகும், மேலும் பேச்சை கட்டமைக்கப்பட்ட அறிவாக மாற்றும் திறනைக் கொண்டுள்ளது.",
        "French": "Ceci est une introduction à STT Engine et à sa capacité à convertir la parole en connaissances structurées.",
        "Spanish": "Esta es una introducción a STT Engine y su capacidad para convertir el habla en conocimiento estructurado.",
        "German": "Dies ist eine Einführung in die STT Engine und ihre Fähigkeit, Sprache in strukturiertes Wissen umzuwandeln.",
        "Japanese": "これはSTT Engineと、音声を構造化された知識に変換する機能の紹介です。",
        "Chinese": "这是STT引擎及其将语音转化为结构化知识的能力的介绍。"
    }
    translated = translations.get(req.target_language, f"[Translated to {req.target_language}]: " + req.text[:100] + "...")
    return {"translatedText": translated}

class ChatMessageModel(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    transcript: str
    chat_history: List[ChatMessageModel]
    new_message: str

@app.post("/chat")
async def chat(req: ChatRequest, x_gemini_key: Optional[str] = Header(None)):
    active_key = x_gemini_key or GEMINI_API_KEY
    if active_key:
        try:
            genai.configure(api_key=active_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            history_prompt = ""
            for msg in req.chat_history:
                history_prompt += f"{msg.role.capitalize()}: {msg.content}\n"
                
            prompt = (
                "You are the STT Engine AI Chat Assistant. You help users understand the uploaded audio/video. "
                "Answer the user's questions using ONLY the transcript/video description provided below. "
                "If the answer cannot be found in the content, explain that clearly.\n\n"
                f"Content Context:\n{req.transcript}\n\n"
                f"Conversation History:\n{history_prompt}"
                f"User: {req.new_message}\n"
                "Assistant:"
            )
            response = model.generate_content(prompt)
            return {"response": response.text.strip()}
        except Exception as e:
            print(f"Gemini chat failed: {e}")
            
    # Mock fallback
    return {"response": f"Based on the transcript, you asked: '{req.new_message}'. This is a mock response from the AI assistant because the Gemini API key is not configured. Once connected, I will search the transcript for you!"}
