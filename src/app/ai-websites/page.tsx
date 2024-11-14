interface AITool {
    name: string;
    description: string;
    tags: string[];
    link_ai_tool: string;
}

interface AIToolResponse {
    aiTools: AITool[];
}

async function getAITools() {
    const res = await fetch('https://showaisb.onrender.com/api/newly-launched');
    if (!res.ok) {
        throw new Error('Không thể tải dữ liệu');
    }
    return res.json();
}

export default async function AIWebsites() {
    const data: AIToolResponse[] = await getAITools();

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Website AI Mới
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Khám phá những công cụ AI mới nhất và hữu ích nhất
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item, index) => (
                        item.aiTools.map((tool, toolIndex) => (
                            <a
                                href={tool.link_ai_tool}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={`${index}-${toolIndex}`}
                                className="block bg-[#1E293B] border border-[#2A3284] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow hover:bg-[#243351]"
                            >
                                <h2 className="text-xl font-semibold mb-3 text-white">{tool.name}</h2>
                                <p className="text-gray-300 mb-4 line-clamp-2">{tool.description}</p>
                                <div className="flex flex-wrap gap-2 overflow-hidden h-8">
                                    {tool.tags.map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="bg-[#2A3284] text-gray-200 text-sm px-3 py-1 rounded-full whitespace-nowrap"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </a>
                        ))
                    ))}
                </div>

                {data.length === 0 && (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-lg font-medium">Chưa có công cụ AI nào</p>
                        <p className="text-sm mt-2">Vui lòng quay lại sau!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
