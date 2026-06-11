import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canvas" },
      { name: "description", content: "A blank canvas to draw on." },
    ],
  }),
  component: Index,
});

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState("#111111");
  const [size, setSize] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { devicePixelRatio: dpr = 1 } = window;
      const rect = canvas.getBoundingClientRect();
      const prev = document.createElement("canvas");
      prev.width = canvas.width;
      prev.height = canvas.height;
      prev.getContext("2d")?.drawImage(canvas, 0, 0);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.drawImage(prev, 0, 0, rect.width, rect.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <h1 className="text-sm font-semibold tracking-tight">Canvas</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Color
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-7 w-9 cursor-pointer rounded border bg-transparent"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Size
            <input
              type="range"
              min={1}
              max={40}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
          <button
            onClick={clear}
            className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-accent"
          >
            Clear
          </button>
        </div>
      </header>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="flex-1 touch-none bg-white"
      />
    </div>
  );
}
