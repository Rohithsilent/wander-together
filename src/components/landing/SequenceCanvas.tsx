import { useRef, useEffect, useCallback } from 'react';
import { useScroll, useTransform, useMotionValueEvent, MotionValue } from 'framer-motion';

interface SequenceCanvasProps {
    images: HTMLImageElement[];
    sectionHeight?: string;
    children?: React.ReactNode | ((scrollProgress: MotionValue<number>) => React.ReactNode);
}

const SequenceCanvas = ({ images, sectionHeight = 'h-[400vh]', children }: SequenceCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, images.length - 1]);

    // Resize canvas to match display size
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Draw the first frame once images are available
    useEffect(() => {
        if (images.length > 0 && images[0]?.complete) {
            drawFrame(0);
        }
    }, [images]);

    const drawFrame = (index: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = images[Math.round(index)];
        if (!img || !img.complete) return;

        const dpr = window.devicePixelRatio || 1;
        const displayWidth = canvas.width / dpr;
        const displayHeight = canvas.height / dpr;

        ctx.clearRect(0, 0, displayWidth, displayHeight);

        // Cover-fit the image
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = displayWidth / displayHeight;
        let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

        if (canvasRatio > imgRatio) {
            drawWidth = displayWidth;
            drawHeight = displayWidth / imgRatio;
            offsetX = 0;
            offsetY = (displayHeight - drawHeight) / 2;
        } else {
            drawHeight = displayHeight;
            drawWidth = displayHeight * imgRatio;
            offsetX = (displayWidth - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    useMotionValueEvent(frameIndex, 'change', (latest) => {
        drawFrame(latest);
    });

    // Support render prop pattern: pass scrollYProgress to children
    const renderedChildren = typeof children === 'function'
        ? children(scrollYProgress)
        : children;

    return (
        <div ref={containerRef} className={`relative ${sectionHeight}`}>
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 h-full w-full"
                    style={{ imageRendering: 'auto' }}
                />
                {/* Overlay content above the canvas */}
                <div className="absolute inset-0 z-10">
                    {renderedChildren}
                </div>
            </div>
        </div>
    );
};

export default SequenceCanvas;
