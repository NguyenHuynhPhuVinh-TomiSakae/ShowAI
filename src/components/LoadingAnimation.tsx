export default function LoadingAnimation() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1A1A2E] -z-10">
            <div className="relative w-32 h-32">
                <div className="absolute inset-0 border border-[#4ECCA3] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                <div className="absolute inset-2 bg-[#4ECCA3] bg-opacity-5 rounded-full"></div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#4ECCA3" strokeWidth="0.3">
                        <animate attributeName="r" values="35;45;35" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#4ECCA3" strokeWidth="0.3">
                        <animate attributeName="r" values="25;35;25" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <line x1="50" y1="50" x2="50" y2="100" stroke="#4ECCA3" strokeWidth="0.5">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
                    </line>
                </svg>
            </div>
        </div>
    );
}
