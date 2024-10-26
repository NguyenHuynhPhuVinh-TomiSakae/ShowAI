import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import SearchBar from './SearchBar';

interface ParallaxHeaderProps {
    onTagClick: (tag: string) => void;
    allTags: string[];
}

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ onTagClick, allTags }) => {
    const ref = useRef(null);
    const { scrollY } = useScroll();

    // Thêm các transform mới
    const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
    const textY = useTransform(scrollY, [0, 500], [0, -50]);
    const opacityText = useTransform(scrollY, [0, 200], [1, 0.5]);
    const rotateX = useTransform(scrollY, [0, 500], [0, 10]); // Thêm rotation theo trục X

    return (
        <div ref={ref} className="relative overflow-hidden bg-[#2A3284] perspective-1000">
            <motion.div
                style={{
                    y: backgroundY,
                    rotateX: rotateX, // Thêm rotation
                    transformStyle: "preserve-3d" // Thêm 3D transform
                }}
                className="absolute inset-0 bg-gradient-to-b from-blue-900 to-[#2A3284]"
            />

            <motion.div
                className="relative z-10 text-center py-8 px-4"
                style={{
                    y: textY,
                    opacity: opacityText,
                    rotateX: rotateX, // Thêm rotation cho text
                    transformStyle: "preserve-3d"  // Thêm 3D transform
                }}
            >
                <div className='py-4 sm:py-8'>
                    <motion.h1
                        className="text-2xl sm:text-3xl font-bold mb-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        Tìm các công cụ và ứng dụng AI tốt nhất
                    </motion.h1>

                    <motion.p
                        className="text-base sm:text-lg max-w-3xl mx-auto mb-6"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Khám phá các công cụ AI miễn phí sử dụng được ở việt nam.
                        Các AI hỗ trợ giúp công việc của bạn trở nên đơn giản hơn bao giờ hết.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <SearchBar onTagClick={onTagClick} allTags={allTags} />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default ParallaxHeader;
