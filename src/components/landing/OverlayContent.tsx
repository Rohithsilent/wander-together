import { useTransform, motion, MotionValue } from 'framer-motion';

interface OverlayItem {
    text: string;
    showAt: number;  // scroll progress 0-1
    hideAt: number;  // scroll progress 0-1
    className?: string;
}

interface OverlayContentProps {
    scrollProgress: MotionValue<number>;
    items: OverlayItem[];
}

const OverlayTextItem = ({ text, showAt, hideAt, scrollProgress, className = '' }: OverlayItem & { scrollProgress: MotionValue<number> }) => {
    const fadeIn = showAt;
    const fullVisible = showAt + 0.03;
    const fadeOutStart = hideAt - 0.03;
    const fadeOut = hideAt;

    const opacity = useTransform(
        scrollProgress,
        [fadeIn, fullVisible, fadeOutStart, fadeOut],
        [0, 1, 1, 0]
    );

    const y = useTransform(
        scrollProgress,
        [fadeIn, fullVisible, fadeOutStart, fadeOut],
        [40, 0, 0, -40]
    );

    return (
        <motion.div
            style={{ opacity, y }}
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
        >
            <h2 className="hero-text text-center px-4 max-w-5xl">
                {text}
            </h2>
        </motion.div>
    );
};

const OverlayContent = ({ scrollProgress, items }: OverlayContentProps) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            {items.map((item, i) => (
                <OverlayTextItem
                    key={i}
                    {...item}
                    scrollProgress={scrollProgress}
                />
            ))}
        </div>
    );
};

export default OverlayContent;
