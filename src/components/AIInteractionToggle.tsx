'use client'
import React, { useState, useEffect } from 'react';
import { FaQuestion } from "react-icons/fa"; // Icon AI từ react-icons
import { useMediaQuery } from 'react-responsive';
import { getButtonDescription } from '@/constants/buttonDescriptions';
// import AIInteractionPanel from './AIInteractionPanel'; // Component này bạn sẽ cần tạo riêng

interface NavbarElement {
    text: string;
    description: string;
}

const AIInteractionToggle: React.FC = () => {
    const [isAIEnabled, setIsAIEnabled] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [aiMessage, setAiMessage] = useState("Di chuột vào các nút để tôi giải thích chức năng!");
    const [, setHoveredElement] = useState<NavbarElement | null>(null);
    const isDesktop = useMediaQuery({ minWidth: 768 }); // Kiểm tra màn hình desktop
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');

    // Thêm useEffect để theo dõi vị trí chuột
    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            if (isAIEnabled) {
                const { clientX, clientY } = e;
                setMousePosition({ x: clientX, y: clientY });

                // Kiểm tra khoảng cách đến các mép màn hình
                const threshold = 150;
                const rightEdgeDistance = window.innerWidth - clientX;
                const leftEdgeDistance = clientX;

                let xPosition = clientX;

                // Điều chỉnh vị trí ngang nếu quá gần mép
                if (rightEdgeDistance < threshold) {
                    xPosition = window.innerWidth - threshold;
                } else if (leftEdgeDistance < threshold) {
                    xPosition = threshold;
                }

                setMousePosition({ x: xPosition, y: clientY });
                setTooltipPosition(clientY < threshold ? 'bottom' : 'top');

                // Kiểm tra element đang hover
                const element = e.target as HTMLElement;
                const hoverableElement = element.closest('.ai-hoverable');

                if (hoverableElement) {
                    let buttonText = '';
                    const buttonId = hoverableElement.getAttribute('data-button-id');

                    // Ưu tiên kiểm tra data-button-id trước
                    if (buttonId) {
                        buttonText = buttonId;
                    }
                    // Sau đó mới xử lý trường hợp logo và text content
                    else if (element.tagName === 'IMG' && element.getAttribute('alt') === 'ShowAI Logo') {
                        buttonText = 'ShowAI Logo';
                    }
                    else {
                        buttonText = hoverableElement.textContent?.trim() || '';
                    }

                    const description = getButtonDescription(buttonText);
                    setHoveredElement({ text: buttonText, description });
                    setAiMessage(description);
                } else {
                    setHoveredElement(null);
                    setAiMessage("Di chuột vào các nút để tôi giải thích chức năng!");
                }
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, [isAIEnabled]);

    const toggleAIMode = () => {
        setIsAIEnabled(!isAIEnabled);
    };

    // Nếu không phải desktop thì không render gì cả
    if (!isDesktop) return null;

    return (
        <>
            <button
                onClick={toggleAIMode}
                className="fixed bottom-52 right-4 bg-[#2ECC71] text-white rounded-full p-3 shadow-lg hover:bg-[#27AE60] transition-colors duration-300"
                aria-label="Bật/Tắt chế độ AI"
            >
                <FaQuestion className="h-6 w-6" />
            </button>

            {isAIEnabled && (
                <div
                    className="fixed pointer-events-none z-50"
                    style={{
                        left: `${mousePosition.x}px`,
                        top: `${mousePosition.y}px`,
                        transform: tooltipPosition === 'top'
                            ? 'translate(-50%, calc(-100% - 30px))'
                            : 'translate(-50%, 30px)'
                    }}
                >
                    {tooltipPosition === 'top' && (
                        <>
                            {/* Vùng tin nhắn */}
                            <div className="mb-2">
                                <div className="relative">
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-max max-w-xs">
                                        <p className="text-sm text-gray-700">{aiMessage}</p>
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
                                </div>
                            </div>
                            {/* Icon AI */}
                            <div className="flex justify-center">
                                <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg w-8 h-8 flex items-center justify-center">
                                    <FaQuestion className="h-4 w-4" />
                                </div>
                            </div>
                        </>
                    )}

                    {tooltipPosition === 'bottom' && (
                        <>
                            {/* Icon AI */}
                            <div className="flex justify-center mb-2">
                                <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg w-8 h-8 flex items-center justify-center">
                                    <FaQuestion className="h-4 w-4" />
                                </div>
                            </div>
                            {/* Vùng tin nhắn */}
                            <div className="mt-2">
                                <div className="relative">
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-max max-w-xs">
                                        <p className="text-sm text-gray-700">{aiMessage}</p>
                                    </div>
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-135 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default AIInteractionToggle;
