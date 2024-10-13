// components/Live2DModel.tsx
'use client'
import Script from 'next/script';
import { useEffect, useState, useRef, useCallback } from 'react';
import * as PIXI from 'pixi.js';

declare global {
    interface Window {
        PIXI: typeof PIXI;
    }
}

const Live2DModelComponent = () => {
    const [isLive2DScriptLoaded, setIsLive2DScriptLoaded] = useState(() => {
        if (typeof sessionStorage !== 'undefined') {
            return sessionStorage.getItem('isLive2DScriptLoaded') === 'true';
        }
        return false;
    });
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const appRef = useRef<PIXI.Application | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typewriterRef = useRef<NodeJS.Timeout | null>(null);
    const [showScrollPrompt, setShowScrollPrompt] = useState(false);
    const [isScrollPromptActive, setIsScrollPromptActive] = useState(false);
    const [defaultMessage] = useState('Hãy dí chuột vào các thành phần trên web và mình sẽ nói cho bạn thông tin về chức năng của nó!');

    const notifyModelLoaded = useCallback(() => {
        const event = new CustomEvent('live2dModelLoaded');
        window.dispatchEvent(event);
    }, []);

    useEffect(() => {
        window.PIXI = PIXI;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const scaleFactor = 1.0;
        PIXI.GRAPHICS_CURVES.adaptive = false;
        PIXI.settings.ANISOTROPIC_LEVEL = 0;
        PIXI.settings.RESOLUTION = devicePixelRatio;
        PIXI.settings.ROUND_PIXELS = true;
        const app = new PIXI.Application({
            view: document.getElementById('canvas') as HTMLCanvasElement,
            width: window.innerWidth * scaleFactor,
            height: window.innerHeight * scaleFactor,
            autoStart: true,
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            resolution: devicePixelRatio,
            powerPreference: 'high-performance',
            backgroundAlpha: 0,
        });
        appRef.current = app;

        const loadLive2DModel = async () => {
            const { Live2DModel, MotionPreloadStrategy } = await import('pixi-live2d-display');
            const model = await Live2DModel.from(window.localStorage.getItem('model') || '/live2d/live2d.model3.json', { motionPreload: MotionPreloadStrategy.IDLE });
            const pixiModel = model as unknown as PIXI.Container;
            app.stage.addChild(pixiModel);
            pixiModel.position.set(-110, -125);
            pixiModel.scale.set(0.6);
            pixiModel.interactive = true;
            pixiModel.buttonMode = true;
            pixiModel.trackedPointers = {};

            // Thêm sự kiện cho pixiModel
            pixiModel.on('mouseover', handleModelHover);
            pixiModel.on('mouseout', handleModelLeave);
            pixiModel.on('click', handleModelClick);

            setIsModelLoaded(true);
            notifyModelLoaded();
            typeText('Hãy dí chuột vào các thành phần trên web và mình sẽ nói cho bạn thông tin về chức năng của nó!');
        };

        if (isLive2DScriptLoaded) {
            loadLive2DModel();
        }

        // Adjust canvas position and size
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if (canvas) {
            const screenWidth = window.innerWidth;
            const baseWidth = 1600;
            const baseRightPercentage = -24;
            const adjustmentFactor = Math.max(1, 80 - (baseWidth - screenWidth) / 15);
            const rightPercentage = baseRightPercentage + (baseWidth - screenWidth) / (adjustmentFactor * 1.2);

            canvas.style.position = 'fixed';
            canvas.style.right = `${rightPercentage}%`;
            canvas.style.bottom = '0';
            canvas.style.width = '40%';
            canvas.style.height = 'auto';
            canvas.style.zIndex = '1000';
        }

        // Add event listeners for logo hover
        const handleLogoHover = (event: CustomEvent) => {
            typeText(event.detail);
        };

        const handleLogoLeave = () => {
            if (!isScrollPromptActive) {
                typeText('Hãy dí chuột vào các thành phần trên web và mình sẽ nói cho bạn thông tin về chức năng của nó!');
            }
        };

        window.addEventListener('logoHover', handleLogoHover as EventListener);
        window.addEventListener('logoLeave', handleLogoLeave);

        // Di chuyển các hàm xử lý sự kiện vào trong useEffect
        const handleModelHover = () => {
            if (window.scrollY > 300) {
                setShowScrollPrompt(true);
                setIsScrollPromptActive(true);
                typeText('Bạn có muốn mình cuộn tới đầu trang không?');
            } else {
                setIsScrollPromptActive(false);
                typeText('Bạn đang cần gì ở mình à?');
            }
        };

        const handleModelLeave = () => {
            if (!isScrollPromptActive) {
                typeText(defaultMessage);
            }
        };

        const handleModelClick = () => {
            if (showScrollPrompt) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setShowScrollPrompt(false);
                typeText('Đã cuộn lên đầu trang cho bạn!');
            } else {
                typeText('H-huh? Bạn vừa chạm vào mình à?');
            }
        };

        return () => {
            window.removeEventListener('logoHover', handleLogoHover as EventListener);
            window.removeEventListener('logoLeave', handleLogoLeave);
            if (appRef.current) {
                const pixiModel = appRef.current.stage.children[0] as PIXI.Container;
                if (pixiModel) {
                    pixiModel.off('mouseover', handleModelHover);
                    pixiModel.off('mouseout', handleModelLeave);
                    pixiModel.off('click', handleModelClick);
                }
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLive2DScriptLoaded, notifyModelLoaded, showScrollPrompt, isScrollPromptActive, defaultMessage]);

    const typeWriter = (text: string, index: number = 0) => {
        if (index < text.length) {
            setChatMessage((prev) => prev + text.charAt(index));
            typewriterRef.current = setTimeout(() => typeWriter(text, index + 1), 50);
        } else {
            setIsTyping(false);
        }
    };

    const typeText = (message: string) => {
        setIsTyping(true);
        setChatMessage('');
        if (typewriterRef.current) {
            clearTimeout(typewriterRef.current);
        }
        typeWriter(message);
    };

    const handleScriptLoad = () => {
        setIsLive2DScriptLoaded(true);
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('isLive2DScriptLoaded', 'true');
        }
    };

    return (
        <>
            {!isLive2DScriptLoaded && (
                <>
                    <Script
                        src="/live2d/core/live2dcubismcore.min.js"
                        onLoad={handleScriptLoad}
                    />
                    <Script
                        src="/live2d/core/live2d.min.js"
                        onLoad={handleScriptLoad}
                    />
                </>
            )}
            <canvas id="canvas" />
            {!isModelLoaded && (
                <div className="fixed right-[1%] bottom-[2%] bg-white p-2.5 rounded-lg z-[1001] flex items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-2"></div>
                    <p className="text-sm text-gray-700">Đang tải mô hình...</p>
                </div>
            )}
            {isModelLoaded && (
                <div className="fixed right-[1%] bottom-[40%] bg-white p-2.5 rounded-lg max-w-[200px] z-[1001]">
                    <div className="absolute bottom-[-8px] right-[10px] w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
                    <p className="m-0 text-sm text-black">
                        {chatMessage}
                        {isTyping && <span className="animate-pulse">|</span>}
                    </p>
                </div>
            )}
        </>
    );
};

export default Live2DModelComponent;
