# FocusForm – Sit Better. Focus Smarter. 🧠

**An AI-powered posture monitoring and productivity application that helps users maintain healthy sitting habits and improve focus.**

<p align="center">
  <a href="https://focusform-frontend.onrender.com">🌐 Live Demo</a> ·
  <a href="https://github.com/rohith23-10/FocusForm">💻 GitHub Repository</a>
</p>

---
## 🎥 Project Demo

Watch the FocusForm demo:

[![FocusForm Demo](https://img.youtube.com/vi/RL3ZpXVaOfM/0.jpg)](https://youtu.be/RL3ZpXVaOfM)

[▶ Watch Full Demo on YouTube](https://youtu.be/RL3ZpXVaOfM)
## 📌 Project Overview

FocusForm is a web-based productivity and posture monitoring application that combines real-time AI-powered posture detection with focus management tools.

It uses MediaPipe Pose Landmarker to detect body landmarks through a webcam and analyse sitting posture. Users receive real-time feedback when they slouch, lean sideways or move away from the recommended sitting position.

Along with posture monitoring, FocusForm provides a Pomodoro focus timer, posture scoring, and productivity analytics to encourage healthier and more productive working habits.

## ✨ Key Features

### 🧍 AI-Powered Posture Monitoring
- Real-time body landmark detection using MediaPipe Pose Landmarker.
- Detects slouching and improper sitting posture.
- Identifies leaning and shoulder alignment issues.
- Provides posture scores and corrective feedback.
- Calibration support for personalised posture monitoring.

### ⏱️ Focus Management
- Pomodoro-style focus timer.
- Focus session tracking.
- Session completion tracking.
- Helps users maintain consistent study and work sessions.

### 📊 Analytics Dashboard
- Posture score tracking.
- Weekly posture and productivity analytics.
- Automatic saving of posture statistics.
- Focus session history.

### 🔔 Smart Notifications
- Voice-based posture alerts.
- Browser notifications.
- Real-time corrective feedback.

### 🔒 Privacy
- Webcam frames are processed directly in the browser.
- Raw webcam video is not uploaded to the backend.
- Only posture-related statistics and focus-session information are sent to the backend for storage.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive interface |
| JavaScript | Frontend functionality and posture analysis |
| MediaPipe Pose Landmarker | AI-powered body landmark detection |
| Python | Backend development |
| Flask | REST API |
| Flask-CORS | Cross-origin communication |
| SQLite | Data storage |
| Render | Application deployment |

---

## 🏗️ System Architecture

```text
             USER
              |
              v
       FRONTEND WEBSITE
         HTML / CSS / JS
              |
              v
        WEBCAM INPUT
              |
              v
    MEDIAPIPE POSE LANDMARKER
              |
              v
      POSTURE ANALYSIS
              |
              v
    POSTURE SCORE & FEEDBACK
              |
              v
       FLASK REST API
              |
              v
         SQLITE DATABASE
              |
              v
       POSTURE & FOCUS
           ANALYTICS
```

**Processing approach:** Webcam frames are analysed in the browser using MediaPipe. The backend receives posture statistics and focus-session records rather than raw webcam footage.

---

## 📂 Project Structure

```text
FocusForm/
│
├── index.html
├── style.css
├── app.js
│
├── app.py
├── database.py
├── requirements.txt
│
├── instance/
│   └── focusform.db
│
├── README.md
└── .gitignore
```

**Note:** The SQLite database is created automatically when the backend initializes. The `instance/` folder and database file are excluded from Git.

---

## ⚙️ Installation and Setup

Follow these steps to run FocusForm locally.

### 1. Clone the Repository

```bash
git clone https://github.com/rohith23-10/FocusForm.git
```

### 2. Navigate to the Project Folder

```bash
cd FocusForm
```

### 3. Install Python Dependencies

Make sure Python is installed.

```bash
pip install -r requirements.txt
```

### 4. Start the Backend Server

```bash
python app.py
```

The Flask backend will run at:

```text
http://127.0.0.1:5000
```

### 5. Start the Frontend

Open the project folder in Visual Studio Code.

Use the **Live Server** extension to open `index.html`.

Alternatively, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000
```

### 6. Allow Camera Access

- Open the website in your browser.
- Allow webcam permission.
- Complete posture calibration.
- Start monitoring your posture.

---

## 🔌 Backend API Documentation

The Flask backend provides REST API endpoints for storing and retrieving focus-session and posture data.

**Backend URL:**

https://focusform-ar89.onrender.com

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check backend status |
| POST | `/api/focus-sessions` | Save a completed focus session |
| GET | `/api/focus-sessions` | Retrieve focus-session records |
| POST | `/api/posture-stats` | Save posture statistics |
| GET | `/api/posture-stats` | Retrieve posture statistics |

### Example: Check Backend Status

```http
GET /
```

### Example: Retrieve Posture Statistics

```http
GET /api/posture-stats
```

### Example: Retrieve Focus Sessions

```http
GET /api/focus-sessions
```

---

## 🗄️ Database Structure

FocusForm uses SQLite to store application data.

### 1. Focus Sessions

| Column | Description |
|---|---|
| id | Unique session ID |
| duration | Session duration |
| session_type | Type of session |
| completed_at | Completion timestamp |

### 2. Posture Statistics

| Column | Description |
|---|---|
| id | Unique record ID |
| posture_score | Calculated posture score |
| status | Posture status |
| recorded_at | Record timestamp |

---

## ☁️ Deployment

FocusForm is deployed using Render.

| Component | Deployment |
|---|---|
| Frontend | https://focusform-frontend.onrender.com |
| Backend | https://focusform-ar89.onrender.com |
| Source Code | https://github.com/rohith23-10/FocusForm |

The frontend is hosted as a static site, while the Flask backend runs as a web service.

---

## 🚀 Future Improvements

- Long-term posture history and analytics.
- More personalised posture recommendations.
- Improved posture detection and calibration.
- Persistent cloud database storage.
- Additional productivity insights and reports.
- User accounts and personalised settings.

---

## 🎯 Project Objective

The objective of FocusForm is to combine artificial intelligence and productivity tools to encourage healthier sitting habits and improve focus during study and work sessions.

**Sit Better. Focus Smarter.**

---

## 👨‍💻 Project

**FocusForm – AI-Powered Posture Monitoring & Productivity Application**

Built using MediaPipe, JavaScript, Python, Flask and SQLite.

**Live Demo:** https://focusform-frontend.onrender.com

**GitHub:** https://github.com/rohith23-10/FocusForm
