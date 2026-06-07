from flask import Blueprint, jsonify, request
from db.database import get_connection
from models.inference import analyze_video
import os

analyze_bp = Blueprint("analyze", __name__)

@analyze_bp.route("/api/analyze", methods=["POST"])
def analyze():
    data       = request.get_json()
    session_id = data.get("session_id")
    video_path = data.get("video_path")

    # check video file exists
    if not os.path.exists(video_path):
        return jsonify({"error": "Video file not found"}), 404

    # run YOLO inference
    result = analyze_video(video_path)

    conn = get_connection()

    # save each press event to DB
    for _ in range(result["press_count"]):
        conn.execute(
            "INSERT INTO press_events (session_id) VALUES (?)",
            (session_id,)
        )

    # save each PPE violation to DB
    for v in result["violations"]:
        conn.execute(
            "INSERT INTO ppe_violations (session_id, violation_type) VALUES (?, ?)",
            (session_id, v)
        )

    conn.commit()
    conn.close()

    return jsonify({
        "message":     "Analysis complete",
        "press_count": result["press_count"],
        "ppe":         result["ppe"],
        "violations":  result["violations"]
    })