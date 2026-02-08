import {
    useEffect,
    useRef
} from "react";

export default function NoiseBackground({
    opacity = 0.08,
    scale = 3, // bigger = chunkier noise
    fps = 14
}) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        function resize() {
            const {
                innerWidth,
                innerHeight
            } = window;

            canvas.width = innerWidth / scale;
            canvas.height = innerHeight / scale;

            canvas.style.width = `${innerWidth}px`;
            canvas.style.height = `${innerHeight}px`;

            ctx.setTransform(scale, 0, 0, scale, 0, 0);
        }

        resize();
        window.addEventListener("resize", resize);

        let lastTime = 0;
        const interval = 1000 / fps;

        function drawNoise(time) {
            if (time - lastTime > interval) {
                lastTime = time;

                const {
                    width,
                    height
                } = canvas;
                const imageData = ctx.createImageData(width, height);
                const buffer = new Uint32Array(imageData.data.buffer);

                for (let i = 0; i < buffer.length; i++) {
                    const shade = (Math.random() * 255) | 0;
                    buffer[i] =
                        (255 << 24) |
                        (shade << 16) |
                        (shade << 8) |
                        shade;
                }

                ctx.putImageData(imageData, 0, 0);
            }

            animationRef.current = requestAnimationFrame(drawNoise);
        }



        drawNoise();

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);
        };
    }, [scale]);

    return ( <
        canvas ref = {
            canvasRef
        }
        style = {
            {
                position: "fixed",
                inset: 0,
                zIndex: -1,
                pointerEvents: "none",
                opacity,
                mixBlendMode: "screen",
            }
        }
        />
    );
}