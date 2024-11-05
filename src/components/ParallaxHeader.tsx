import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

interface ParallaxHeaderProps {
    onTagClick: (tag: string) => void;
    allTags: string[];
}

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ onTagClick, allTags }) => {
    return (
        <div className="relative">
            <div className="relative bg-[#2A3284]">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-[#2A3284]" />

                <div className="relative z-[5] text-center py-8 px-4">
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
                            className="relative"
                        >
                            <SearchBar onTagClick={onTagClick} allTags={allTags} />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParallaxHeader;
