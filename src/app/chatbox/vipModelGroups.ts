export type Model = {
    name: string;
    icon: string;
    modal: string;
};

export type ModelGroup = {
    provider: string;
    models: Model[];
};

export const modelGroups: ModelGroup[] = [
    {
        provider: 'Google',
        models: [
            { name: 'Gemma 7B', icon: '💎', modal: 'gemma-7b-it' },
            { name: 'Gemma 2 9B', icon: '💎', modal: 'gemma2-9b-it' },
        ]
    },
    {
        provider: 'Groq',
        models: [
            { name: 'Llama 3 70B', icon: '⚡', modal: 'llama3-groq-70b-8192-tool-use-preview' },
            { name: 'Llama 3 8B', icon: '⚡', modal: 'llama3-groq-8b-8192-tool-use-preview' },
        ]
    },
    {
        provider: 'Meta',
        models: [
            { name: 'Llama 3.1 70B Versatile', icon: '🦙', modal: 'llama-3.1-70b-versatile' },
            { name: 'Llama 3.1 8B Instant', icon: '🦙', modal: 'llama-3.1-8b-instant' },
            { name: 'Llama 3.2 11B Text', icon: '🦙', modal: 'llama-3.2-11b-text-preview' },
            { name: 'Llama 3.2 11B Vision', icon: '👁️', modal: 'llama-3.2-11b-vision-preview' },
            { name: 'Llama 3.2 1B', icon: '🦙', modal: 'llama-3.2-1b-preview' },
            { name: 'Llama 3.2 3B', icon: '🦙', modal: 'llama-3.2-3b-preview' },
            { name: 'Llama 3.2 90B Text', icon: '🦙', modal: 'llama-3.2-90b-text-preview' },
            { name: 'Llama 3.2 90B Vision', icon: '👁️', modal: 'llama-3.2-90b-vision-preview' },
            { name: 'Llama Guard 3 8B', icon: '🛡️', modal: 'llama-guard-3-8b' },
            { name: 'Llama 3 70B', icon: '🦙', modal: 'llama3-70b-8192' },
            { name: 'Llama 3 8B', icon: '🦙', modal: 'llama3-8b-8192' },
        ]
    },
    {
        provider: 'Mistral AI',
        models: [
            { name: 'Mixtral 8x7B', icon: '🌪️', modal: 'mixtral-8x7b-32768' },
        ]
    }
];