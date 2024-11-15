'use client'

import React from 'react';
import { Construction } from 'lucide-react';

export default function StudyPage() {
    return (
        <>
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Học tập</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Học tập cùng ShowAI.
                </p>
            </div>

            <main className="flex min-h-screen bg-[#0F172A] text-white">
                <div className="w-full max-w-4xl mx-auto px-4 py-20">
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <Construction className="h-16 w-16 text-[#4ECCA3] animate-bounce" />
                        <h2 className="text-3xl font-bold">Đang Phát Triển</h2>
                        <p className="text-gray-400 max-w-md">
                            Chúng tôi đang nỗ lực phát triển tính năng học tập.
                            Vui lòng quay lại sau để trải nghiệm!
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
}
