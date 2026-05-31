import { useRef, useEffect } from "react";

const MOCK_DETECTIONS = [
  { label: "press_head", conf: 0.97, x: 0.08, y: 0.06, w: 0.68, h: 0.28, color: "#1D9E75" },
  { label: "person",     conf: 0.94, x: 0.28, y: 0.18, w: 0.40, h: 0.58, color: "#378ADD" },
  { label: "no_helmet",  conf: 0.88, x: 0.33, y: 0.08, w: 0.16, h: 0.20, color: "#E24B4A" },
  { label: "vest",       conf: 0.91, x: 0.30, y: 0.32, w: 0.36, h: 0.28, color: "#1D9E75" },
];

export default function LiveFeed({ detections = MOCK_DETECTIONS, isLive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 640;
    const H = canvas.offsetHeight || 360;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CCTV feed — connect camera or upload video", W / 2, H / 2);

    detections.forEach(({ label, conf, x, y, w, h, color }) => {
      const bx = x * W, by = y * H, bw = w * W, bh = h * H;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);

      const tag = `${label} ${conf}`;
      ctx.font = "bold 10px sans-serif";
      const tw = ctx.measureText(tag).width + 10;
      ctx.fillStyle = color;
      ctx.fillRect(bx, by - 18, tw, 16);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.fillText(tag, bx + 5, by - 6);
    });
  }, [detections]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <span className="text-xs font-medium text-gray-500">Live feed — Camera 1</span>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live
          </span>
        )}
      </div>
      <canvas ref={canvasRef} className="w-full flex-1" style={{ minHeight: 0, display: "block" }} />
    </div>
  );
}
