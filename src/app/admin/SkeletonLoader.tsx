import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonLoader = () => (
    <div className="container mx-auto p-4 bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex py-6">
        <div className="w-1/4 pr-4">
            <Skeleton height={40} width={200} className="mb-6" baseColor="#1F2937" highlightColor="#374151" />
            <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} height={40} baseColor="#1F2937" highlightColor="#374151" />
                ))}
            </div>
        </div>
        <div className="w-3/4">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        <Skeleton height={192} baseColor="#1F2937" highlightColor="#374151" />
                        <div className="p-5">
                            <div className="flex justify-between items-center mb-3">
                                <Skeleton width={150} baseColor="#1F2937" highlightColor="#374151" />
                                <Skeleton circle={true} height={20} width={20} baseColor="#1F2937" highlightColor="#374151" />
                            </div>
                            <Skeleton count={3} baseColor="#1F2937" highlightColor="#374151" />
                            <div className="flex items-center space-x-4 my-4">
                                <Skeleton width={50} baseColor="#1F2937" highlightColor="#374151" />
                                <Skeleton width={50} baseColor="#1F2937" highlightColor="#374151" />
                                <Skeleton width={50} baseColor="#1F2937" highlightColor="#374151" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Skeleton width={60} baseColor="#1F2937" highlightColor="#374151" />
                                <Skeleton width={60} baseColor="#1F2937" highlightColor="#374151" />
                                <Skeleton width={60} baseColor="#1F2937" highlightColor="#374151" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

export default SkeletonLoader
