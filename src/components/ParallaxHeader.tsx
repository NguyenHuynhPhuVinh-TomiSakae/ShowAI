import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

interface ParallaxHeaderProps {
    onTagClick: (tag: string) => void;
    allTags: string[];
}

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ onTagClick, allTags }) => {
    return (
        <div className="relative">
            <div className="relative bg-[#0F172A]">
                <div className="absolute inset-0" />

                <div className="relative z-[5] text-center py-8 px-4">
                    <div className='py-4 sm:py-8'>
                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            Khám Phá Thế Giới AI
                        </motion.h1>

                        <motion.p
                            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
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