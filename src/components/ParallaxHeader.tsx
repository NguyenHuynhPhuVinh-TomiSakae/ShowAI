import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SearchBar from './SearchBar';

interface ParallaxHeaderProps {
    onTagClick: (tag: string) => void;
    allTags: string[];
}

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ onTagClick, allTags }) => {
    const titleRef = useRef(null);
    const descRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            autoRemoveChildren: true
        });

        gsap.set([titleRef.current, descRef.current, searchRef.current], {
            y: 20,
            opacity: 0
        });

        tl.to(titleRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.8
        })
            .to(descRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.8
            }, "-=0.5")
            .to(searchRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.8
            }, "-=0.5");

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className="relative">
            <div className="relative bg-[#0F172A]">
                <div className="absolute inset-0" />

                <div className="relative z-[5] text-center py-8 px-4">
                    <div className='py-4 sm:py-8'>
                        <h1
                            ref={titleRef}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4"
                        >
                            Khám Phá Thế Giới AI
                        </h1>

                        <p
                            ref={descRef}
                            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
                        >
                            Khám phá các công cụ AI miễn phí sử dụng được ở việt nam.
                            Các AI hỗ trợ giúp công việc của bạn trở nên đơn giản hơn bao giờ hết.
                        </p>

                        <div
                            ref={searchRef}
                            className="relative"
                        >
                            <SearchBar onTagClick={onTagClick} allTags={allTags} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParallaxHeader;
