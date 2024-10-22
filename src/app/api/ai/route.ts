import { mistral } from "@ai-sdk/mistral"
import { generateText } from "ai"

export async function POST(req: Request) {
    const { messages } = await req.json();

    const { text } = await generateText({
        model: mistral("open-mistral-nemo"),
        prompt: messages[0].content
    })

    return new Response(text)
}