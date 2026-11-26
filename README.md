# FocusForm – Sit Better. Focus Smarter.

FocusForm is a smart productivity and posture-monitoring web application designed to help users maintain healthy sitting habits while improving focus and productivity.

It combines real-time AI-powered posture detection, a Pomodoro focus timer, productivity analytics and database-backed activity tracking.

## Features

### 1. AI-Powered Posture Monitoring
- Real-time body posture detection using MediaPipe Pose Landmarker.
- Detects slouching, sideways leaning, uneven shoulders and sitting too close to the screen.
- Personalized posture calibration.
- Posture score from 0–100.
- Visual feedback and posture correction alerts.

### 2. Pomodoro Focus Timer
- Customizable focus and break durations.
- Start, pause and reset controls.
- Automatic transition between focus and break sessions.
- Desktop notifications and audio alerts.

### 3. Productivity Analytics
- Daily focus time tracking.
- Completed focus sessions.
- Posture score tracking.
- Weekly productivity charts.
- Personalized productivity insights.

### 4. Database Integration
- Python Flask backend.
- SQLite database for storing focus sessions and posture statistics.
- REST API endpoints for saving and retrieving records.
- Automatic posture score storage every 60 seconds.

## Technology Stack

| Technology | Purpose |
|---|---|
| HTML | Application structure |
| CSS | User interface and styling |
| JavaScript | Frontend functionality |
| MediaPipe | AI-powered pose detection |
| Python | Backend development |
| Flask | REST API |
| SQLite | Database |
| Flask-CORS | Frontend-backend communication |

## Project Structure

```text
FocusForm/
│
├── index.html
├── style.css
├── app.js
├── app.py
├── database.py
├── README.md
├── _headers
│
└── instance/
    └── focusform.db
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd focusform
```

### 2. Install Python dependencies

```bash
pip install flask flask-cors
```

### 3. Start the Flask backend

```bash
python app.py
```

Backend runs at:

`http://127.0.0.1:5000`

### 4. Start the frontend

Open a second terminal in the project folder:

```bash
python -m http.server 8000
```

Open your browser:

`http://127.0.0.1:8000`

Allow camera access and calibrate your posture.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check backend status |
| POST | `/api/focus-sessions` | Save focus sessions |
| GET | `/api/focus-sessions` | Retrieve focus sessions |
| POST | `/api/posture-stats` | Save posture statistics |
| GET | `/api/posture-stats` | Retrieve posture statistics |

## Privacy

- Webcam frames are processed locally in the browser using MediaPipe.
- Raw webcam video is not uploaded to the Flask backend.
- Focus sessions and posture statistics are stored in the local SQLite database.
- Frontend productivity data is also maintained using browser localStorage.

## Future Improvements

- User authentication and personalized accounts.
- Cloud database integration.
- Long-term productivity analytics.
- Improved posture recommendations.
- Cross-device data synchronization.

## Project Goal

FocusForm aims to make healthy posture and productive working habits easier through AI-powered monitoring and intelligent productivity tools.

**FocusForm – Sit Better. Focus Smarter.**