import { useEffect, useRef } from "react";

export default function NoiseBar({
    opacity = 0.1,
    scale = 3,
    fps = 20,
    minDuration = 3000,
    maxDuration = 6000,
    minDelay = 1000,
    maxDelay = 5000,
    minWidth = 50,
    maxWidth = 200,
    height = 25
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
        barWidth: 0
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const state = barStateRef.current;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
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

        function drawNoise(time) {
            if (time - state.lastFrameTime > 1000 / fps) {
                state.lastFrameTime = time;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // If no active bar, decide if one should start
                if (!state.isActive) {
                    if (!state.nextStartTime) {
                        state.nextStartTime = time + getRandomDelay();
                    }

                    if (time >= state.nextStartTime) {
                        state.isActive = true;
                        state.startTime = time;
                        state.duration = getRandomDuration();
                        state.fromLeft = Math.random() > 0.5;
                        state.yPos = Math.random() * (canvas.height - height);
                        state.barWidth = getRandomWidth();
                        state.nextStartTime = null;
                    }
                }

                // Draw active bar
                if (state.isActive) {
                    const elapsed = time - state.startTime;
                    const progress = Math.min(elapsed / state.duration, 1);

                    if (progress >= 1) {
                        state.isActive = false;
                    } else {
                        const xPos = state.fromLeft
                            ? progress * (canvas.width + state.barWidth) - state.barWidth
                            : canvas.width - progress * (canvas.width + state.barWidth);

                        // Draw noise rectangles
                        for (let y = state.yPos; y < state.yPos + height; y += scale) {
                            for (let x = Math.max(0, xPos); x < Math.min(canvas.width, xPos + state.barWidth); x += scale) {
                                const shade = (Math.random() * 255) | 0;
                                ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
                                ctx.fillRect(x, y, scale, scale);
                            }
                        }

                        // Apply horizontal fade gradient (left and right)
                        ctx.globalCompositeOperation = "destination-in";
                        const horizontalGradient = ctx.createLinearGradient(xPos, 0, xPos + state.barWidth, 0);
                        horizontalGradient.addColorStop(0, "rgba(0,0,0,0)");
                        horizontalGradient.addColorStop(0.2, "rgba(0,0,0,1)");
                        horizontalGradient.addColorStop(0.8, "rgba(0,0,0,1)");
                        horizontalGradient.addColorStop(1, "rgba(0,0,0,0)");

                        ctx.fillStyle = horizontalGradient;
                        ctx.fillRect(xPos, state.yPos, state.barWidth, height);

                        // Apply vertical fade gradient (top and bottom)
                        const verticalGradient = ctx.createLinearGradient(0, state.yPos, 0, state.yPos + height);
                        verticalGradient.addColorStop(0.2, "rgba(0,0,0,0)");
                        verticalGradient.addColorStop(0.5, "rgba(0,0,0,1)");
                        verticalGradient.addColorStop(0.8, "rgba(0,0,0,1)");
                        verticalGradient.addColorStop(1, "rgba(0,0,0,0)");

                        ctx.fillStyle = verticalGradient;
                        ctx.fillRect(xPos, state.yPos, state.barWidth, height);

                        ctx.globalCompositeOperation = "source-over";
                    }
                }

                animationRef.current = requestAnimationFrame(drawNoise);
            } else {
                animationRef.current = requestAnimationFrame(drawNoise);
            }
        }

        animationRef.current = requestAnimationFrame(drawNoise);

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