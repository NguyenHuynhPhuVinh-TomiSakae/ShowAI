'use client'

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMediaQuery } from 'react-responsive';
import { ReactNode } from 'react';

interface ClientPageTransitionProps {
    children: ReactNode;
}

const animations = [
    // Slide Up
    (element: HTMLElement) => {
        gsap.set(element, {
            y: 50,
            opacity: 0
        });
        return gsap.to(element, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        });
    },
    // Scale
    (element: HTMLElement) => {
        gsap.set(element, {
            scale: 0.9,
            opacity: 0
        });
        return gsap.to(element, {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        });
    },
    // Fade
    (element: HTMLElement) => {
        gsap.set(element, {
            opacity: 0
        });
        return gsap.to(element, {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        });
    },
    // Rotate Y
    (element: HTMLElement) => {
        gsap.set(element, {
            rotationY: -90,
            opacity: 0
        });
        return gsap.to(element, {
            rotationY: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        });
    }
];

const ClientPageTransition = ({ children }: ClientPageTransitionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const currentAnimation = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Kill previous animation if exists
        if (currentAnimation.current) {
            currentAnimation.current.kill();
        }

        // Reset styles
        gsap.set(containerRef.current, { clearProps: "all" });

        // Chọn animation và thực thi
        const animationIndex = isMobile ? 2 : Math.floor(Math.random() * animations.length);
        currentAnimation.current = animations[animationIndex](containerRef.current);

        return () => {
            if (currentAnimation.current) {
                currentAnimation.current.kill();
            }
        };
    }, [isMobile, children]);

    return (
        <div
            ref={containerRef}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {children}
        </div>
    );
};

export default ClientPageTransition;
