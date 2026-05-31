# Press Machine Monitor

AI-powered computer vision system that monitors press machine operations using CCTV footage.

## What it does
- Detects and counts press cycles in real-time
- Tracks operator activity
- Verifies PPE compliance (helmet, vest, gloves)
- Generates productivity metrics (utilization, production count)

## Stack
- **Frontend**: React + Tailwind + Recharts
- **Backend**: Flask + SQLite
- **ML**: YOLOv8 (custom trained)

## Project structure
```
press-monitor/
├── frontend/     ← React dashboard (this phase)
├── backend/      ← Flask APIs (phase 2)
├── ml/           ← YOLOv8 weights + training notebook
└── data/         ← raw videos, frames, annotations
```

## Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Backend (phase 2)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Screenshots
[Add demo GIF here after recording a demo]
