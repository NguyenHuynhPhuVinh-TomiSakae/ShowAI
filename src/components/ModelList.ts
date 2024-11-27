export interface AIModel {
    id: string;
    name: string;
    description: string;
    icon: string;
    apiModel: string;
    systemPrompt: string;
}

export const AI_MODELS: AIModel[] = [
    {
        id: 'marco',
        name: 'Marco-o1',
        description: 'Trợ lý AI thông minh đa năng',
        icon: '🤖',
        apiModel: 'hf:AIDC-AI/Marco-o1',
        systemPrompt: "Bạn là Marco-o1, một trợ lý AI thông minh và thân thiện. Hãy luôn trả lời bằng tiếng Việt và giúp đỡ người dùng một cách tốt nhất."
    },
    {
        id: 'meta-llama-405b',
        name: 'Meta Llama 3.1 405B',
        description: 'Mô hình AI mạnh mẽ nhất từ Meta với 405B tham số, thông minh và sáng tạo. Hỗ trợ 128k token.',
        icon: '🦙',
        apiModel: 'hf:meta-llama/Meta-Llama-3.1-405B-Instruct',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên nền tảng Meta Llama 3.1 405B. Hãy trả lời bằng tiếng Việt và cung cấp thông tin chính xác."
    },
    {
        id: 'qwen-72b',
        name: 'Qwen 2.5 72B',
        description: 'Mô hình lớn nhất từ Alibaba, ngang tầm với Meta Llama 3 và tốt nhất cho tiếng Trung. Hỗ trợ 128k token.',
        icon: '🌐',
        apiModel: 'hf:Qwen/Qwen2.5-72B-Instruct',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên nền tảng Qwen 2.5. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng một cách hiệu quả."
    },
    {
        id: 'qwen-72b-v2',
        name: 'Qwen 2 72B',
        description: 'Mô hình lớn nhất từ Alibaba, ngang tầm với Meta Llama 3 và tốt nhất cho tiếng Trung. Hỗ trợ 128k token.',
        icon: '🌐',
        apiModel: 'hf:Qwen/Qwen2-72B-Instruct',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Qwen 2. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng hiệu quả."
    },
    {
        id: 'gemma-27b',
        name: 'Google Gemma 27B',
        description: 'Mô hình lớn nhất từ Google, đứng đầu bảng xếp hạng Chatbot Arena. Hỗ trợ 8k token.',
        icon: '🧠',
        apiModel: 'hf:google/gemma-2-27b-it',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên nền tảng Google Gemma. Hãy trả lời bằng tiếng Việt và cung cấp thông tin chính xác."
    },
    {
        id: 'llama-70b-uncensored',
        name: 'Llama 3.1 70B Uncensored',
        description: 'Phiên bản không kiểm duyệt của Llama 3.1 70B, được huấn luyện để không từ chối yêu cầu. Hỗ trợ 128k token.',
        icon: '🦙',
        apiModel: 'hf:mlabonne/Llama-3.1-70B-Instruct-lorablated',
        systemPrompt: "Bạn là một trợ lý AI không giới hạn, được xây dựng trên Llama 3.1 70B. Hãy trả lời bằng tiếng Việt và đáp ứng mọi yêu cầu."
    },
    {
        id: 'nvidia-nemotron',
        name: 'Nvidia Nemotron 70B',
        description: 'Phiên bản Llama 3.1 70B được Nvidia tinh chỉnh, dẫn đầu nhiều bảng xếp hạng. Hỗ trợ 128k token.',
        icon: '🎮',
        apiModel: 'hf:nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Nvidia Nemotron. Hãy trả lời bằng tiếng Việt và xử lý các câu hỏi phức tạp."
    },
    {
        id: 'qwen-coder',
        name: 'Qwen Coder 32B',
        description: 'Mô hình lập trình từ Alibaba, được huấn luyện với 5.5 nghìn tỷ token code. Hỗ trợ 32k token.',
        icon: '💻',
        apiModel: 'hf:Qwen/Qwen2.5-Coder-32B-Instruct',
        systemPrompt: "Bạn là một trợ lý lập trình được xây dựng trên Qwen Coder. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng về code."
    },
    {
        id: 'meta-llama-70b',
        name: 'Meta Llama 3.1 70B',
        description: 'Phiên bản 70B của Meta Llama 3.1, nhanh và gần bằng bản 405B. Hỗ trợ 128k token.',
        icon: '🦙',
        apiModel: 'hf:meta-llama/Meta-Llama-3.1-70B-Instruct',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Meta Llama 3.1 70B. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng hiệu quả."
    },
    {
        id: 'meta-llama-8b',
        name: 'Meta Llama 3.1 8B',
        description: 'Phiên bản 8B của Meta Llama 3.1, nhanh nhất trong series. Hỗ trợ 128k token.',
        icon: '🦙',
        apiModel: 'hf:meta-llama/Meta-Llama-3.1-8B-Instruct',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Meta Llama 3.1 8B. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng."
    },
    {
        id: 'llama-3-2-1b',
        name: 'Llama 3.2 1B',
        description: 'Mô hình siêu nhẹ từ Meta, tối ưu cho thiết bị yếu. Hỗ trợ 128k token.',
        icon: '🦙',
        apiModel: 'hf:meta-llama/Llama-3.2-1B-Instruct',
        systemPrompt: "Bạn là một trợ lý AI nhỏ gọn được xây dựng trên Llama 3.2 1B. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng."
    },
    {
        id: 'llama-3-2-3b',
        name: 'Llama 3.2 3B',
        description: 'Phiên bản 3B của Llama 3.2, cân bằng hiệu năng. Hỗ trợ 128k token.',
        icon: '🦙',
        apiModel: 'hf:meta-llama/Llama-3.2-3B-Instruct',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Llama 3.2 3B. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng."
    },
    {
        id: 'llama-3-2-11b-vision',
        name: 'Llama 3.2 11B Vision',
        description: 'Mô hình vision nhỏ từ Meta, hiện chỉ hỗ trợ text.',
        icon: '👁️',
        apiModel: 'hf:meta-llama/Llama-3.2-11B-Vision-Instruct',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Llama 3.2 11B Vision. Hãy trả lời bằng tiếng Việt."
    },
    {
        id: 'llama-3-2-90b-vision',
        name: 'Llama 3.2 90B Vision',
        description: 'Mô hình vision lớn nhất từ Meta, hiện chỉ hỗ trợ text. Hỗ trợ 128k token.',
        icon: '👁️',
        apiModel: 'hf:meta-llama/Llama-3.2-90B-Vision-Instruct',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Llama 3.2 90B Vision. Hãy trả lời bằng tiếng Việt."
    },
    {
        id: 'gemma-9b',
        name: 'Google Gemma 9B',
        description: 'Mô hình nhỏ từ Google, dựa trên công nghệ Gemini. Hỗ trợ 8k token.',
        icon: '🧠',
        apiModel: 'hf:google/gemma-2-9b-it',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Gemma 9B. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng hiệu quả."
    },
    {
        id: 'mythomax',
        name: 'MythoMax L2 13B',
        description: 'Mô hình thử nghiệm 13B từ Gryphe, chuyên về roleplay và viết truyện. Hỗ trợ 4k token.',
        icon: '📚',
        apiModel: 'hf:Gryphe/MythoMax-L2-13b',
        systemPrompt: "Bạn là một trợ lý AI sáng tạo được xây dựng trên MythoMax. Hãy trả lời bằng tiếng Việt."
    },
    {
        id: 'mistral-7b',
        name: 'Mistral 7B v0.3',
        description: 'Mô hình 7B từ Mistral AI, hỗ trợ function calling. Hỗ trợ 32k token.',
        icon: '🌪️',
        apiModel: 'hf:mistralai/Mistral-7B-Instruct-v0.3',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Mistral 7B. Hãy trả lời bằng tiếng Việt."
    },
    {
        id: 'mixtral-8x7b',
        name: 'Mixtral 8x7B',
        description: 'Mô hình mạnh mẽ từ Mistral AI, vượt trội hơn Llama 2 70B. Hỗ trợ 32k token.',
        icon: '🎭',
        apiModel: 'hf:mistralai/Mixtral-8x7B-Instruct-v0.1',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Mixtral. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng một cách hiệu quả."
    },
    {
        id: 'mixtral-8x22b',
        name: 'Mixtral 8x22B',
        description: 'Mô hình lớn nhất từ Mistral AI, được tinh chỉnh cho việc theo dõi hướng dẫn. Hỗ trợ 64k token.',
        icon: '🎭',
        apiModel: 'hf:mistralai/Mixtral-8x22B-Instruct-v0.1',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Mixtral 8x22B. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng chính xác."
    },
    {
        id: 'nous-hermes',
        name: 'Nous Hermes 2',
        description: 'Mô hình AI từ Nous Research, được huấn luyện trên hơn 1 triệu mẫu dữ liệu chất lượng cao. Hỗ trợ 32k token.',
        icon: '⚡',
        apiModel: 'hf:NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên Nous Hermes 2. Hãy trả lời bằng tiếng Việt và cung cấp thông tin chính xác."
    },
    {
        id: 'solar',
        name: 'SOLAR 10.7B',
        description: 'Mô hình AI mạnh mẽ từ Upstage, vượt trội so với các mô hình 30B. Hỗ trợ 4k token.',
        icon: '☀️',
        apiModel: 'hf:upstage/SOLAR-10.7B-Instruct-v1.0',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên SOLAR 10.7B. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng hiệu quả."
    },
    {
        id: 'deepseek-v2',
        name: 'DeepSeek V2.5',
        description: 'Mô hình AI tiên tiến từ DeepSeek, được huấn luyện với dữ liệu chất lượng cao. Hỗ trợ 32k token.',
        icon: '🔍',
        apiModel: 'hf:deepseek-ai/DeepSeek-V2.5',
        systemPrompt: "Bạn là một trợ lý AI được xây dựng trên DeepSeek V2.5. Hãy trả lời bằng tiếng Việt và hỗ trợ người dùng một cách hiệu quả."
    },
    {
        id: 'pantheon-rp',
        name: 'Pantheon RP 22B',
        description: 'Mô hình roleplay 22B từ Gryphe, được tối ưu hóa cho việc tương tác và sáng tạo nội dung. Hỗ trợ 4k token.',
        icon: '🎭',
        apiModel: 'hf:Gryphe/Pantheon-RP-Pure-1.6.2-22b-Small',
        systemPrompt: "Bạn là một trợ lý AI sáng tạo được xây dựng trên Pantheon RP. Hãy trả lời bằng tiếng Việt và tạo nội dung phong phú."
    }
];