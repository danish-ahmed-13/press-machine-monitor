const BASE = "http://127.0.0.1:5000";

export async function fetchMetrics(sessionId) {
    const res = await fetch(`${BASE}/api/metrics?session_id=${sessionId}`);
    return res.json();
}

export async function fetchViolations(sessionId) {
    const res = await fetch(`${BASE}/api/violations?session_id=${sessionId}`);
    return res.json();
}

export async function startSession(operatorName, machineLine) {
    const res = await fetch(`${BASE}/api/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operator_name: operatorName, machine_line: machineLine })
    });
    return res.json();
}

export async function stopSession(sessionId) {
    const res = await fetch(`${BASE}/api/session/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
    });
    return res.json();
}

export async function recordPress(sessionId) {
    const res = await fetch(`${BASE}/api/press`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
    });
    return res.json();
}