import { useCallback, useEffect, useState, useRef } from "react";

/**
 * MobileSwiper component for handling touch swipe gestures on mobile devices.
 *
 * @component
 * @param {Object} props - React component props
 * @param {ReactNode} props.children - The content to be wrapped by the swiper
 * @param {function} props.onSwipe - Callback function triggered on swipe with an object containing deltaX and deltaY
 * @returns {JSX.Element} - React component
 * 
 * @author  Matéush
 * @github  https://github.com/mateuszsokola
 * @twitter https://twitter.com/msokola
 */
export default function MobileSwiper({ children, onSwipe, passThrough = true }) {
    const wrapperRef = useRef(null);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);

    const handleTouchStart = useCallback((e) => {
        if (!wrapperRef.current.contains(e.target)) {
            return;
        }
        if (!passThrough) {
            e.preventDefault();
        }
        setStartX(e.touches[0].clientX);
        setStartY(e.touches[0].clientY);
    }, []);

    const handleTouchEnd = useCallback(
        (e) => {
            if (!wrapperRef.current.contains(e.target)) {
                return;
            }
            if (!passThrough) {
                e.preventDefault();
            }
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;

            onSwipe({ deltaX, deltaY });
        },
        [startX, startY, onSwipe],
    );

    useEffect(() => {
        window.addEventListener("touchstart", handleTouchStart, { passive: false });
        window.addEventListener("touchend", handleTouchEnd, { passive: false });

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd]);

    return <div ref={wrapperRef}>{children}</div>;
}