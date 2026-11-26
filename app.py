
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import initialize_database, get_db_connection


app = Flask(__name__)
CORS(app)

initialize_database()


@app.route("/")
def home():
    return jsonify({
        "message": "FocusForm Backend is running!",
        "database": "Connected",
        "status": "success"
    })


# API: Save a focus session
@app.route("/api/focus-sessions", methods=["POST"])
def save_focus_session():

    data = request.get_json(silent=True) or {}

    duration = data.get("duration")
    session_type = data.get("session_type")

    if type(duration) is not int or duration <= 0:
        return jsonify({"error": "Enter a valid duration"}), 400

    if session_type not in ["focus", "break"]:
        return jsonify({"error": "Session type must be focus or break"}), 400

    connection = get_db_connection()

    connection.execute(
        "INSERT INTO focus_sessions (duration, session_type) VALUES (?, ?)",
        (duration, session_type)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Focus session saved successfully!",
        "status": "success"
    }), 201


# API: Get all saved focus sessions
@app.route("/api/focus-sessions", methods=["GET"])
def get_focus_sessions():

    connection = get_db_connection()

    sessions = connection.execute(
        "SELECT * FROM focus_sessions ORDER BY id DESC"
    ).fetchall()

    connection.close()

    return jsonify([dict(session) for session in sessions])

@app.route("/api/posture-stats", methods=["POST"])
def save_posture_stats():

    data = request.get_json(silent=True) or {}

    score = data.get("posture_score")
    status = data.get("status")

    if not isinstance(score, (int, float)) or isinstance(score, bool) or not 0 <= score <= 100:
        return jsonify({"error": "Score must be between 0 and 100"}), 400

    if not isinstance(status, str) or not status.strip():
        return jsonify({"error": "Status is required"}), 400

    connection = get_db_connection()

    connection.execute(
        "INSERT INTO posture_stats (posture_score, status) VALUES (?, ?)",
        (score, status)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Posture statistics saved successfully!",
        "status": "success"
    }), 201

@app.route("/api/posture-stats", methods=["GET"])
def get_posture_stats():

    connection = get_db_connection()

    stats = connection.execute(
        "SELECT * FROM posture_stats ORDER BY id DESC"
    ).fetchall()

    connection.close()

    return jsonify([dict(stat) for stat in stats])


if __name__ == "__main__":
    app.run(debug=True)
