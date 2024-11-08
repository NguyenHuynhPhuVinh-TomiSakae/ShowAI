export const modelGroups = [
    {
        provider: 'Google',
        models: [
            { name: 'Gemma 2 9B', icon: '💎', modal: 'google/gemma-2-9b-it:free' },
        ]
    },
    {
        provider: 'Meta',
        models: [
            { name: 'Llama 3.1 405B', icon: '🦙', modal: 'meta-llama/llama-3.1-405b-instruct:free' },
            { name: 'Llama 3.1 70B', icon: '🦙', modal: 'meta-llama/llama-3.1-70b-instruct:free' },
            { name: 'Llama 3.2 3B', icon: '🦙', modal: 'meta-llama/llama-3.2-3b-instruct:free' },
            { name: 'Llama 3.2 1B', icon: '🦙', modal: 'meta-llama/llama-3.2-1b-instruct:free' },
            { name: 'Llama 3.1 8B', icon: '🦙', modal: 'meta-llama/llama-3.1-8b-instruct:free' },
            { name: 'Llama 3 8B', icon: '🦙', modal: 'meta-llama/llama-3-8b-instruct:free' },
            { name: 'Llama 3.2 11B Vision', icon: '👁️', modal: 'meta-llama/llama-3.2-11b-vision-instruct:free' },
        ]
    },
    {
        provider: 'Nous',
        models: [
            { name: 'Hermes 3 405B', icon: '🧠', modal: 'nousresearch/hermes-3-llama-3.1-405b:free' },
        ]
    },
    {
        provider: 'Mistral AI',
        models: [
            { name: 'Mistral 7B', icon: '🌪️', modal: 'mistralai/mistral-7b-instruct:free' },
            { name: 'Codestral Mamba', icon: '🐍', modal: 'mistralai/codestral-mamba' },
        ]
    },
    {
        provider: 'Microsoft',
        models: [
            { name: 'Phi-3 Medium', icon: '🔬', modal: 'microsoft/phi-3-medium-128k-instruct:free' },
            { name: 'Phi-3 Mini', icon: '🔬', modal: 'microsoft/phi-3-mini-128k-instruct:free' },
        ]
    },
    {
        provider: 'Hugging Face',
        models: [
            { name: 'Zephyr 7B', icon: '🌬️', modal: 'huggingfaceh4/zephyr-7b-beta:free' },
        ]
    },
    {
        provider: 'Liquid',
        models: [
            { name: 'LFM 40B', icon: '💧', modal: 'liquid/lfm-40b:free' },
        ]
    },
    {
        provider: 'Qwen',
        models: [
            { name: 'Qwen 2 7B', icon: '🐼', modal: 'qwen/qwen-2-7b-instruct:free' },
        ]
    },
    {
        provider: 'OpenChat',
        models: [
            { name: 'OpenChat 7B', icon: '💬', modal: 'openchat/openchat-7b:free' },
        ]
    },
    {
        provider: 'Gryphe',
        models: [
            { name: 'Mythomist 7B', icon: '🧙', modal: 'gryphe/mythomist-7b:free' },
            { name: 'Mythomax L2 13B', icon: '🧙', modal: 'gryphe/mythomax-l2-13b:free' },
        ]
    },
    {
        provider: 'Undi95',
        models: [
            { name: 'Toppy M 7B', icon: '🔝', modal: 'undi95/toppy-m-7b:free' },
        ]
    }
];

export type ModelGroup = {
    provider: string;
    models: {
        name: string;
        icon: string;
        modal: string;
    }[];
};

export type Model = {
    name: string;
    icon: string;
    modal: string;
};
