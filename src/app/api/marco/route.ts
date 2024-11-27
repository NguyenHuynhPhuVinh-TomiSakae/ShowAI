import OpenAI from "openai";
import { NextResponse } from 'next/server';
import { AI_MODELS } from '@/components/ModelList';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const selectedModel = AI_MODELS.find(model => model.id === body.modelId);

        if (!selectedModel) {
            throw new Error('Không tìm thấy mô hình');
        }

        const client = new OpenAI({
            apiKey: process.env.GLHF_API_KEY,
            baseURL: "https://glhf.chat/api/openai/v1",
        });

        const completion = await client.chat.completions.create({
            model: selectedModel.apiModel,
            messages: [
                {
                    role: "system",
                    content: selectedModel.systemPrompt
                },
                {
                    role: "user",
                    content: body.message
                }
            ],
            stream: true,
        });

        // Trả về response stream
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        if (chunk.choices[0].delta.content) {
                            controller.enqueue(new TextEncoder().encode(chunk.choices[0].delta.content));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: 'Đã xảy ra lỗi khi xử lý yêu cầu' },
            { status: 500 }
        );
    }
} 