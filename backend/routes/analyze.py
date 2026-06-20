from flask import Blueprint, jsonify, request, Response
from db.database import get_connection
from models.inference import analyze_video, model, get_overlap, Y_LINE
import os
import cv2

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

@analyze_bp.route("/api/stream", methods=["POST"])
def upload_for_stream():
    session_id = request.form.get("session_id")

    if "video" not in request.files:
        return jsonify({"error": "No video file"}), 400

    file = request.files["video"]
    video_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(video_path)

    return jsonify({"video_path": video_path})


@analyze_bp.route("/api/stream/feed")
def stream_feed():
    video_path = request.args.get("video_path")
    session_id = request.args.get("session_id")

    def generate():
        cap = cv2.VideoCapture(video_path)
        width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))

        press_count = 0
        ppe = {"helmet": False, "vest": False, "gloves": False}
        gloves_inside  = False
        gloves_exited  = False
        press_crossed  = False

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame, verbose=False)[0]
            detections = {}

            for box in results.boxes:
                cls_name = model.names[int(box.cls)]
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

                if cls_name == "helmet": ppe["helmet"] = True
                if cls_name == "vest":   ppe["vest"]   = True
                if cls_name == "gloves": ppe["gloves"]  = True

                detections[cls_name] = [x1, y1, x2, y2]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, cls_name, (x1, y1 - 8),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            ph = detections.get("press_head")
            gl = detections.get("gloves")

            if ph and gl:
                overlap = get_overlap(gl, ph)
                if overlap > 0.5 and not gloves_inside:
                    gloves_inside = True
                    gloves_exited = False
                    press_crossed = False
                if overlap < 0.1 and gloves_inside:
                    gloves_exited = True
                    gloves_inside = False

            if ph and gloves_exited:
                bottom = ph[3]
                if bottom >= Y_LINE and not press_crossed:
                    press_crossed = True
                if press_crossed and bottom < Y_LINE:
                    press_count += 1
                    press_crossed = False
                    gloves_exited = False

                    # save to DB the moment a press happens
                    conn = get_connection()
                    conn.execute("INSERT INTO press_events (session_id) VALUES (?)", (session_id,))
                    conn.commit()
                    conn.close()

            cv2.line(frame, (0, Y_LINE), (width, Y_LINE), (0, 0, 255), 1)
            cv2.putText(frame, f"Presses: {press_count}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

            ret2, buffer = cv2.imencode(".jpg", frame)
            frame_bytes = buffer.tobytes()

            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")

        cap.release()

        # save PPE violations at the end
        violations = []
        if not ppe["helmet"]: violations.append("no_helmet")
        if not ppe["vest"]:   violations.append("no_vest")
        if not ppe["gloves"]: violations.append("no_gloves")

        conn = get_connection()
        for v in violations:
            conn.execute("INSERT INTO ppe_violations (session_id, violation_type) VALUES (?, ?)", (session_id, v))
        conn.commit()
        conn.close()

        os.remove(video_path)

    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")