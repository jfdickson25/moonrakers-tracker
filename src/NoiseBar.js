import { useEffect, useRef } from "react";

export default function NoiseBar({
    opacity = 0.15,
    scale = 3,
    fps = 20,
    minDuration = 2000,
    maxDuration = 6000,
    minDelay = 1000,
    maxDelay = 5000,
    minWidth = 100,
    maxWidth = 200,
    height = 20
}) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const barStateRef = useRef({
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
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const state = barStateRef.current;

        const isMobile =
            typeof navigator !== "undefined" &&
            /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        const effectiveFps = fps;
        const interval = 1000 / effectiveFps;

        const capDpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

        // offscreen canvas for compact noise texture per bar
        const offCanvas = document.createElement("canvas");
        const offCtx = offCanvas.getContext("2d");

        function resize() {
            canvas.width = Math.max(1, Math.round(window.innerWidth * capDpr));
            canvas.height = Math.max(1, Math.round(window.innerHeight * capDpr));
            canvas.style.width = "100vw";
            canvas.style.height = "100vh";
            // draw in CSS pixels by scaling context
            ctx.setTransform(capDpr, 0, 0, capDpr, 0, 0);
        }

        resize();
        window.addEventListener("resize", resize);

        function getRandomDuration() {
            return Math.random() * (maxDuration - minDuration) + minDuration;
        }

        function getRandomDelay() {
            return Math.random() * (maxDelay - minDelay) + minDelay;
        }

        function getRandomWidth() {
            return Math.random() * (maxWidth - minWidth) + minWidth;
        }

        function ensureOffCanvas(barW, barH) {
            const downscale = isMobile ? 3 : 2;
            const w = Math.max(1, Math.round(barW / downscale));
            const h = Math.max(1, Math.round(barH / downscale));
            if (offCanvas.width !== w || offCanvas.height !== h) {
                offCanvas.width = w;
                offCanvas.height = h;
            }
            return { w, h, downscale };
        }

        function drawOffscreenNoise(w, h) {
            offCtx.clearRect(0, 0, w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const shade = (Math.random() * 255) | 0;
                    offCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
                    offCtx.fillRect(x, y, 1, 1);
                }
            }
        }

        function draw(time) {
            if (time - state.lastFrameTime > interval) {
                state.lastFrameTime = time;

                // clear using CSS pixels
                ctx.clearRect(0, 0, canvas.width / capDpr, canvas.height / capDpr);

                if (!state.isActive) {
                    if (!state.nextStartTime) state.nextStartTime = time + getRandomDelay();
                    if (time >= state.nextStartTime) {
                        state.isActive = true;
                        state.startTime = time;
                        state.duration = getRandomDuration();
                        state.fromLeft = Math.random() > 0.5;
                        state.yPos = Math.random() * (window.innerHeight - height);
                        state.barWidth = getRandomWidth();
                        state.nextStartTime = null;
                    }
                }

                if (state.isActive) {
                    const elapsed = time - state.startTime;
                    const progress = Math.min(elapsed / state.duration, 1);

                    if (progress >= 1) {
                        state.isActive = false;
                    } else {
                        const xPos = state.fromLeft
                            ? progress * (window.innerWidth + state.barWidth) - state.barWidth
                            : window.innerWidth - progress * (window.innerWidth + state.barWidth);

                        const { w, h } = ensureOffCanvas(state.barWidth, height);
                        drawOffscreenNoise(w, h);

                        ctx.imageSmoothingEnabled = false;
                        ctx.drawImage(offCanvas, 0, 0, w, h, Math.max(-state.barWidth, xPos), state.yPos, state.barWidth, height);

                        ctx.globalCompositeOperation = "destination-in";

                        // horizontal fade
                        const horizGrad = ctx.createLinearGradient(xPos, 0, xPos + state.barWidth, 0);
                        horizGrad.addColorStop(0, "rgba(0,0,0,0)");
                        horizGrad.addColorStop(0.15, "rgba(0,0,0,0.7)");
                        horizGrad.addColorStop(0.85, "rgba(0,0,0,0.7)");
                        horizGrad.addColorStop(1, "rgba(0,0,0,0)");
                        ctx.fillStyle = horizGrad;
                        ctx.fillRect(xPos, state.yPos, state.barWidth, height);

                        // vertical fade
                        const vertGrad = ctx.createLinearGradient(0, state.yPos, 0, state.yPos + height);
                        vertGrad.addColorStop(0, "rgba(0,0,0,0)");
                        vertGrad.addColorStop(0.12, "rgba(0,0,0,0.7)");
                        vertGrad.addColorStop(0.88, "rgba(0,0,0,0.7)");
                        vertGrad.addColorStop(1, "rgba(0,0,0,0)");
                        ctx.fillStyle = vertGrad;
                        ctx.fillRect(xPos, state.yPos, state.barWidth, height);

                        ctx.globalCompositeOperation = "source-over";
                    }
                }
            }

            animationRef.current = requestAnimationFrame(draw);
        }

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [scale, fps, minDuration, maxDuration, minDelay, maxDelay, minWidth, maxWidth, height]);

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
