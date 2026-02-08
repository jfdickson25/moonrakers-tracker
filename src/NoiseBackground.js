import {
    useEffect,
    useRef
} from "react";

export default function NoiseBackground({
    opacity = 0.07, // strength of static
    scale = 2, // chunkiness (bigger = chunkier pixels)
    fps = 20, // how fast the static updates
    size = 800 // size (px) of the centered noise canvas
}) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let lastTime = 0;
        const interval = 1000 / fps;

        function resize() {
            // Use the canvas element's display size so the gradient
            // and noise are centered within this element.
            const rect = canvas.getBoundingClientRect();
            const displayWidth = rect.width || size;
            const displayHeight = rect.height || size;

            // Use a 1:1 internal resolution to keep coordinates simple
            canvas.width = Math.max(1, Math.round(displayWidth));
            canvas.height = Math.max(1, Math.round(displayHeight));

            // Ensure CSS display size matches the desired element size
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;
        }

        resize();
        window.addEventListener("resize", resize);

        function drawNoise(time) {
            if (time - lastTime > interval) {
                lastTime = time;

                const { width, height } = canvas;

                // --- Generate chunky noise by filling rects of size `scale` ---
                ctx.clearRect(0, 0, width, height);
                for (let y = 0; y < height; y += scale) {
                    for (let x = 0; x < width; x += scale) {
                        const shade = (Math.random() * 255) | 0;
                        ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
                        ctx.fillRect(x, y, scale, scale);
                    }
                }

                // --- Circular radial fade mask (perfectly centered) ---
                ctx.globalCompositeOperation = "destination-in";

                const gradient = ctx.createRadialGradient(
                    width / 2,
                    height / 2,
                    0,
                    width / 2,
                    height / 2,
                    Math.min(width, height) / 2
                );

                gradient.addColorStop(0, "rgba(0,0,0,1)");
                gradient.addColorStop(0.6, "rgba(0,0,0,0.7)");
                gradient.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();

                ctx.globalCompositeOperation = "source-over";
            }

            animationRef.current = requestAnimationFrame(drawNoise);
        }

        animationRef.current = requestAnimationFrame(drawNoise);

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