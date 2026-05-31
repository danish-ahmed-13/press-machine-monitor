from flask import Blueprint, jsonify, request
from db.database import get_connection

metrics_bp = Blueprint("metrics", __name__)

@metrics_bp.route("/api/metrics", methods=["GET"])
def get_metrics():
    session_id = request.args.get("session_id")

    conn = get_connection()

    # total press cycles
    cycles = conn.execute(
        "SELECT COUNT(*) as total FROM press_events WHERE session_id = ?",
        (session_id,)
    ).fetchone()["total"]

    # violations count
    violations = conn.execute(
        "SELECT COUNT(*) as total FROM ppe_violations WHERE session_id = ? AND resolved = 0",
        (session_id,)
    ).fetchone()["total"]

    # session start time
    session = conn.execute(
        "SELECT started_at, operator_id, machine_line FROM sessions WHERE id = ?",
        (session_id,)
    ).fetchone()

    # cycles per hour breakdown
    hourly = conn.execute("""
        SELECT 
            strftime('%H:00', pressed_at) as hour,
            COUNT(*) as cycles
        FROM press_events
        WHERE session_id = ?
        GROUP BY hour
        ORDER BY hour
    """, (session_id,)).fetchall()

    conn.close()

    return jsonify({
        "session_id":    int(session_id),
        "machine_line":  session["machine_line"],
        "started_at":    session["started_at"],
        "total_cycles":  cycles,
        "violations":    violations,
        "hourly_cycles": [{"hour": r["hour"], "cycles": r["cycles"]} for r in hourly]
    })


@metrics_bp.route("/api/press", methods=["POST"])
def record_press():
    data = request.get_json()
    session_id = data.get("session_id")

    conn = get_connection()
    conn.execute(
        "INSERT INTO press_events (session_id) VALUES (?)",
        (session_id,)
    )
    conn.commit()

    total = conn.execute(
        "SELECT COUNT(*) as total FROM press_events WHERE session_id = ?",
        (session_id,)
    ).fetchone()["total"]
    conn.close()

    return jsonify({
        "message": "Press recorded",
        "total_cycles": total
    }), 201