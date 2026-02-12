import { useEffect, useRef } from "react";

export default function NoiseBar({
  opacity = 0.12,
  fps = 24,
  minDuration = 3000,
  maxDuration = 6000,
  minDelay = 1000,
  maxDelay = 5000,
  minWidth = 80,
  maxWidth = 240,
  height = 30
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const stateRef = useRef({
    isActive: false,
    startTime: 0,
    duration: 0,
    fromLeft: true,
    lastFrameTime: 0,
    yPos: 0,
    barWidth: 0,
    nextStartTime: null
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const state = stateRef.current;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const rand = (min, max) => Math.random() * (max - min) + min;

    function drawFrame(time) {
      if (time - state.lastFrameTime < 1000 / fps) {
        animationRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      state.lastFrameTime = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Handle activation timing
      if (!state.isActive) {
        if (!state.nextStartTime) {
          state.nextStartTime = time + rand(minDelay, maxDelay);
        }

        if (time >= state.nextStartTime) {
          state.isActive = true;
          state.startTime = time;
          state.duration = rand(minDuration, maxDuration);
          state.fromLeft = Math.random() > 0.5;
          state.yPos = Math.random() * (canvas.height - height);
          state.barWidth = rand(minWidth, maxWidth);
          state.nextStartTime = null;
        }
      }

      if (state.isActive) {
        const elapsed = time - state.startTime;
        let progress = Math.min(elapsed / state.duration, 1);

        // Smooth ease in/out
        progress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        if (elapsed >= state.duration) {
          state.isActive = false;
        } else {
          const xPos = state.fromLeft
            ? progress * (canvas.width + state.barWidth) - state.barWidth
            : canvas.width - progress * (canvas.width + state.barWidth);

          ctx.save();

          // Clip drawing to bar region
          ctx.beginPath();
          ctx.rect(xPos, state.yPos, state.barWidth, height);
          ctx.clip();

          ctx.globalCompositeOperation = "lighter";

          // More transparency
          ctx.globalAlpha = 0.35;

          // Softer glow
          ctx.shadowColor = "rgba(80,180,255,0.4)";
          ctx.shadowBlur = 18;

          // Higher density noise
          for (let y = state.yPos; y < state.yPos + height; y += 2) {
            for (
              let x = Math.max(0, xPos);
              x < Math.min(canvas.width, xPos + state.barWidth);
              x += 2
            ) {
              const intensity = Math.random();

              const r = 30 + intensity * 50;
              const g = 130 + intensity * 90;
              const b = 210 + intensity * 60;

              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, y, 2, 2);
            }
          }

          ctx.shadowBlur = 0;

          // --- Horizontal Fade ---
          ctx.globalCompositeOperation = "destination-in";

          const horizontalFade = ctx.createLinearGradient(
            xPos,
            0,
            xPos + state.barWidth,
            0
          );

          horizontalFade.addColorStop(0, "rgba(0,0,0,0)");
          horizontalFade.addColorStop(0.15, "rgba(0,0,0,1)");
          horizontalFade.addColorStop(0.85, "rgba(0,0,0,1)");
          horizontalFade.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = horizontalFade;
          ctx.fillRect(xPos, state.yPos, state.barWidth, height);

          // --- Vertical Fade ---
          const verticalFade = ctx.createLinearGradient(
            0,
            state.yPos,
            0,
            state.yPos + height
          );

          verticalFade.addColorStop(0, "rgba(0,0,0,0)");
          verticalFade.addColorStop(0.2, "rgba(0,0,0,1)");
          verticalFade.addColorStop(0.8, "rgba(0,0,0,1)");
          verticalFade.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = verticalFade;
          ctx.fillRect(xPos, state.yPos, state.barWidth, height);

          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    }

    animationRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [
    fps,
    minDuration,
    maxDuration,
    minDelay,
    maxDelay,
    minWidth,
    maxWidth,
    height
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "screen"
      }}
    />
  );
}
