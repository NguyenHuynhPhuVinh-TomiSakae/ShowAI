'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';

interface ClientPageTransitionProps {
    children: ReactNode;
}

const animations = [
    {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 }
    },
    {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    },
    {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },
    {
        initial: { opacity: 0, rotateY: -90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: 90 }
    }
];

const ClientPageTransition = ({ children }: ClientPageTransitionProps) => {
    const [animationIndex, setAnimationIndex] = useState(0);

    useEffect(() => {
        setAnimationIndex(Math.floor(Math.random() * animations.length));
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={Math.random()} // Force re-render on route change
                initial={animations[animationIndex].initial}
                animate={animations[animationIndex].animate}
                exit={animations[animationIndex].exit}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    duration: 0.7
                }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default ClientPageTransition;