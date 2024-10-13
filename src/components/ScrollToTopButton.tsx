'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [imageState, setImageState] = useState('Top1');

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        setImageState('Top3');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        setTimeout(() => setImageState('Top1'), 500); // Reset image after scrolling
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ duration: 0.3 }}
                    onClick={scrollToTop}
                    onMouseEnter={() => setImageState('Top2')}
                    onMouseLeave={() => setImageState('Top1')}
                    className="fixed bottom-5 right-0 bg-transparent p-0 shadow-none"
                    aria-label="Cuộn lên đầu trang"
                >
                    <Image
                        src={`/${imageState}.png`}
                        alt="Cuộn lên đầu trang"
                        width={100}
                        height={100}
                    />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTopButton;