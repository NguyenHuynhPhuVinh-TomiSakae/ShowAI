import { useState, useCallback, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const useInputValidation = () => {
    const [isValidating, setIsValidating] = useState(false);
    const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);

    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                const response = await fetch('/api/Gemini11');
                const data = await response.json();
                if (data.success && data.apiKey) {
                    setGenAI(new GoogleGenerativeAI(data.apiKey));
                } else {
                    console.error('Failed to fetch API key');
                }
            } catch (error) {
                console.error('Error fetching API key:', error);
            }
        };

        fetchApiKey();
    }, []);

    const validateInput = useCallback(async (
        input: string,
        options?: {
            instruction: string;
            validResponse: string;
            invalidResponse: string;
        }
    ): Promise<boolean> => {
        if (!genAI) {
            console.error('GoogleGenerativeAI not initialized');
            return false;
        }

        setIsValidating(true);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            };

            const chatSession = model.startChat({
                generationConfig,
                history: [
                    {
                        role: "user",
                        parts: [{ text: options?.instruction || "Hãy kiểm tra dữ liệu nhập vào có phù hợp với cộng đồng hay không! Chỉ trả lời là true hoặc false" }],
                    },
                    {
                        role: "model",
                        parts: [{ text: `{"isValid": ${options?.validResponse || "true"}}` }],
                    },
                ],
            });

            const result = await chatSession.sendMessage(input);
            const response = result.response.text().trim();
            const jsonResponse = JSON.parse(response.replace(/```json\n|\n```/g, ''));
            return jsonResponse.isValid;
        } catch (error) {
            console.error('Error validating input:', error);
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [genAI]);

    return { validateInput, isValidating };
};

export default useInputValidation;
