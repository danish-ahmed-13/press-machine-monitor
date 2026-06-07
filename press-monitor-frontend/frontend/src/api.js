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

export async function fetchAllViolations() {
    const res = await fetch(`${BASE}/api/violations/all`);
    return res.json();
}

export async function fetchAllSessions() {
    const res = await fetch(`${BASE}/api/sessions`);
    return res.json();
}

export async function uploadVideo(sessionId, file) {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("video", file);

    const res = await fetch(`${BASE}/api/upload`, {
        method: "POST",
        body: formData
    });
    return res.json();
}