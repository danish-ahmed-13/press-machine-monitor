from flask import Blueprint, jsonify, request
from db.database import get_connection
from models.inference import analyze_video
import os

analyze_bp = Blueprint("analyze", __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@analyze_bp.route("/api/analyze", methods=["POST"])
def analyze():
    data       = request.get_json()
    session_id = data.get("session_id")
    video_path = data.get("video_path")

    if not os.path.exists(video_path):
        return jsonify({"error": "Video file not found"}), 404

    result = analyze_video(video_path)

    conn = get_connection()
    for _ in range(result["press_count"]):
        conn.execute("INSERT INTO press_events (session_id) VALUES (?)", (session_id,))
    for v in result["violations"]:
        conn.execute("INSERT INTO ppe_violations (session_id, violation_type) VALUES (?, ?)", (session_id, v))
    conn.commit()
    conn.close()

    return jsonify({
        "message":     "Analysis complete",
        "press_count": result["press_count"],
        "ppe":         result["ppe"],
        "violations":  result["violations"]
    })


@analyze_bp.route("/api/upload", methods=["POST"])
def upload_and_analyze():
    session_id = request.form.get("session_id")

    if "video" not in request.files:
        return jsonify({"error": "No video file"}), 400

    file = request.files["video"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    video_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(video_path)

    result = analyze_video(video_path)

    conn = get_connection()
    for _ in range(result["press_count"]):
        conn.execute("INSERT INTO press_events (session_id) VALUES (?)", (session_id,))
    for v in result["violations"]:
        conn.execute("INSERT INTO ppe_violations (session_id, violation_type) VALUES (?, ?)", (session_id, v))
    conn.commit()
    conn.close()

    os.remove(video_path)

    return jsonify({
        "message":     "Analysis complete",
        "press_count": result["press_count"],
        "ppe":         result["ppe"],
        "violations":  result["violations"]
    })