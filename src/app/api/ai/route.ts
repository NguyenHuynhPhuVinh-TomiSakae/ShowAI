import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(req: Request) {
    const { messages } = await req.json();

    const { text } = await generateText({
        model: google("models/gemini-1.5-flash-latest") as any,
        prompt: messages[0].content
    })

    return new Response(text)
}