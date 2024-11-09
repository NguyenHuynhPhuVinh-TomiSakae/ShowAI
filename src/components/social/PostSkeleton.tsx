import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function PostSkeleton() {
    return (
        <div className="bg-[#1E293B] rounded-lg p-6 mb-4 shadow-lg border border-[#2A3284]">
            <div className="flex items-center mb-4">
                <div className="w-full">
                    <Skeleton
                        height={24}
                        width={150}
                        baseColor="#2A3284"
                        highlightColor="#3E52E8"
                        enableAnimation={true}
                    />
                    <Skeleton
                        height={16}
                        width={120}
                        baseColor="#2A3284"
                        highlightColor="#3E52E8"
                        enableAnimation={true}
                    />
                </div>
            </div>

            <div className="mb-4">
                <Skeleton
                    count={3}
                    height={16}
                    baseColor="#2A3284"
                    highlightColor="#3E52E8"
                    enableAnimation={true}
                />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton
                    height={24}
                    width={60}
                    borderRadius={20}
                    baseColor="#2A3284"
                    highlightColor="#3E52E8"
                    enableAnimation={true}
                />
                <Skeleton
                    height={24}
                    width={80}
                    borderRadius={20}
                    baseColor="#2A3284"
                    highlightColor="#3E52E8"
                    enableAnimation={true}
                />
            </div>

            <div className="flex items-center">
                <Skeleton
                    height={20}
                    width={50}
                    baseColor="#2A3284"
                    highlightColor="#3E52E8"
                    enableAnimation={true}
                />
            </div>
        </div>
    );
}
