import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText } from "ai"
import type { UIMessage } from "ai"

/**
 * Allow streaming for up to 30 seconds (optional)
 */
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToModelMessages(messages),
  })

  // 👇 Convert the stream to the UI-friendly format
  return result.toUIMessageStreamResponse()
}
