import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for animating number counting from old value to new value
 * @param {number} end - The target number to count to
 * @param {number} duration - Animation duration in milliseconds (default: 1000ms)
 * @returns {number} - The current animated value
 */
export const useCountAnimation = (end, duration = 1000) => {
    const [count, setCount] = useState(end);
    const prevEndRef = useRef(end);

    useEffect(() => {
        // Only animate if the value actually changed
        if (prevEndRef.current === end) return;

        const start = prevEndRef.current;
        const startTime = Date.now();
        const difference = end - start;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation (easeOutCubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + difference * easeOut);

            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
                prevEndRef.current = end;
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
};
