from flask import Blueprint, jsonify, request
from db.database import get_connection

session_bp = Blueprint("session", __name__)

@session_bp.route("/api/session/start", methods=["POST"])
def start_session():
    data = request.get_json()
    operator_name = data.get("operator_name", "Unknown")
    machine_line  = data.get("machine_line", "Line A")

    conn = get_connection()

    # insert operator if not exists, else reuse
    existing = conn.execute(
        "SELECT id FROM operators WHERE name = ?", (operator_name,)
    ).fetchone()

    if existing:
        operator_id = existing["id"]
    else:
        cursor = conn.execute(
            "INSERT INTO operators (name) VALUES (?)", (operator_name,)
        )
        conn.commit()
        operator_id = cursor.lastrowid

    # create a new session
    cursor = conn.execute(
        "INSERT INTO sessions (operator_id, machine_line) VALUES (?, ?)",
        (operator_id, machine_line)
    )
    conn.commit()
    session_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Session started",
        "session_id": session_id,
        "operator_id": operator_id
    }), 201


@session_bp.route("/api/session/stop", methods=["POST"])
def stop_session():
    data = request.get_json()
    session_id = data.get("session_id")

    conn = get_connection()

    # count total press cycles for this session
    result = conn.execute(
        "SELECT COUNT(*) as total FROM press_events WHERE session_id = ?",
        (session_id,)
    ).fetchone()

    conn.execute("""
        UPDATE sessions
        SET ended_at = CURRENT_TIMESTAMP, total_cycles = ?
        WHERE id = ?
    """, (result["total"], session_id))
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Session stopped",
        "total_cycles": result["total"]
    })