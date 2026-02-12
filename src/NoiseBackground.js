import {
    useEffect,
    useRef
} from "react";

export default function NoiseBackground({
    opacity = 0.07, // strength of static
    scale = 2, // chunkiness (bigger = chunkier pixels)
    fps = 20, // how fast the static updates
    size = 700 // size (px) of the centered noise canvas
}) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let lastTime = 0;
        const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        const effectiveFps = fps;
        const interval = 1000 / effectiveFps;

        // Offscreen small noise canvas to reduce random calls and pixel ops
        let noiseCanvas = document.createElement("canvas");
        let noiseCtx = noiseCanvas.getContext("2d");

        // Cached mask canvas
        let maskCanvas = document.createElement("canvas");
        let maskCtx = maskCanvas.getContext("2d");

        function resize() {
            const rect = canvas.getBoundingClientRect();
            const displayWidth = rect.width || size;
            const displayHeight = rect.height || size;

            canvas.width = Math.max(1, Math.round(displayWidth));
            canvas.height = Math.max(1, Math.round(displayHeight));

            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;

            // Choose downscale factor: larger on mobile
            const downscale = isMobile ? 3 : 2;

            noiseCanvas.width = Math.max(1, Math.round(canvas.width / downscale));
            noiseCanvas.height = Math.max(1, Math.round(canvas.height / downscale));

            // prepare mask (radial gradient) once per resize
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;

            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            const gradient = maskCtx.createRadialGradient(
                maskCanvas.width / 2,
                maskCanvas.height / 2,
                0,
                maskCanvas.width / 2,
                maskCanvas.height / 2,
                Math.min(maskCanvas.width, maskCanvas.height) / 2
            );
            gradient.addColorStop(0, "rgba(0,0,0,0.9)");
            gradient.addColorStop(0.6, "rgba(0,0,0,0.6)");
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            maskCtx.fillStyle = gradient;
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        }

        resize();
        window.addEventListener("resize", resize);

        function drawNoiseSmall() {
            // draw 1px random noise into noiseCanvas (cheap)
            const w = noiseCanvas.width;
            const h = noiseCanvas.height;
            noiseCtx.clearRect(0, 0, w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const shade = (Math.random() * 255) | 0;
                    noiseCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
                    noiseCtx.fillRect(x, y, 1, 1);
                }
            }
        }

        function draw(time) {
            if (time - lastTime > interval) {
                lastTime = time;

                // generate small noise and scale up
                drawNoiseSmall();

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(noiseCanvas, 0, 0, canvas.width, canvas.height);

                // apply cached radial mask
                ctx.globalCompositeOperation = "destination-in";
                ctx.drawImage(maskCanvas, 0, 0);
                ctx.globalCompositeOperation = "source-over";
            }

            animationRef.current = requestAnimationFrame(draw);
        }

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [scale, fps]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: `${size}px`,
                height: `${size}px`,
                zIndex: -1,
                pointerEvents: "none",
                opacity,
                mixBlendMode: "screen"
            }}
        />
    );
}