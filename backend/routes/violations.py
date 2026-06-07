from flask import Blueprint, jsonify, request
from db.database import get_connection

violations_bp = Blueprint("violations", __name__)

@violations_bp.route("/api/violations", methods=["GET"])
def get_violations():
    session_id = request.args.get("session_id")

    conn = get_connection()
    rows = conn.execute("""
        SELECT
            v.id,
            v.violation_type,
            v.detected_at,
            v.resolved,
            v.snapshot_path,
            o.name as operator_name
        FROM ppe_violations v
        JOIN sessions s ON v.session_id = s.id
        JOIN operators o ON s.operator_id = o.id
        WHERE v.session_id = ?
        ORDER BY v.detected_at DESC
    """, (session_id,)).fetchall()
    conn.close()

    return jsonify([{
        "id":             r["id"],
        "violation_type": r["violation_type"],
        "detected_at":    r["detected_at"],
        "resolved":       bool(r["resolved"]),
        "snapshot_path":  r["snapshot_path"],
        "operator_name":  r["operator_name"]
    } for r in rows])


@violations_bp.route("/api/violations", methods=["POST"])
def add_violation():
    data = request.get_json()

    conn = get_connection()
    cursor = conn.execute("""
        INSERT INTO ppe_violations (session_id, violation_type, snapshot_path)
        VALUES (?, ?, ?)
    """, (
        data.get("session_id"),
        data.get("violation_type"),
        data.get("snapshot_path")
    ))
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Violation recorded",
        "id": cursor.lastrowid
    }), 201


@violations_bp.route("/api/violations/<int:violation_id>/resolve", methods=["PATCH"])
def resolve_violation(violation_id):
    conn = get_connection()
    conn.execute(
        "UPDATE ppe_violations SET resolved = 1 WHERE id = ?",
        (violation_id,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Violation resolved"})

@violations_bp.route("/api/violations/all", methods=["GET"])
def get_all_violations():
    conn = get_connection()
    rows = conn.execute("""
        SELECT
            v.id,
            v.violation_type,
            v.detected_at,
            v.resolved,
            o.name as operator_name,
            s.id as session_id
        FROM ppe_violations v
        JOIN sessions s ON v.session_id = s.id
        JOIN operators o ON s.operator_id = o.id
        ORDER BY v.detected_at DESC
    """).fetchall()
    conn.close()
    return jsonify([{
        "id":             r["id"],
        "violation_type": r["violation_type"],
        "detected_at":    r["detected_at"],
        "resolved":       bool(r["resolved"]),
        "operator_name":  r["operator_name"],
        "session_id":     r["session_id"]
    } for r in rows])

