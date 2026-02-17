import { useState, useEffect, useRef } from 'react';

export const useImagePreloader = (basePath: string, frameCount: number) => {
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [progress, setProgress] = useState(0);
    const initiated = useRef(false);

    useEffect(() => {
        if (initiated.current) return;
        initiated.current = true;

        const loadedImages: HTMLImageElement[] = new Array(frameCount);
        let count = 0;

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const padded = i.toString().padStart(3, '0');
            img.src = `${basePath}/ezgif-frame-${padded}.jpg`;
            img.onload = () => {
                count++;
                setProgress(Math.round((count / frameCount) * 100));
                if (count === frameCount) {
                    setImages([...loadedImages]);
                    setLoaded(true);
                }
            };
            img.onerror = () => {
                count++;
                if (count === frameCount) {
                    setImages([...loadedImages]);
                    setLoaded(true);
                }
            };
            loadedImages[i - 1] = img;
        }
    }, [basePath, frameCount]);

    return { images, loaded, progress };
};
