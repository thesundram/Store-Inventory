"use client"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BotIcon, UserIcon, SendIcon } from "lucide-react"

interface ChatbotScreenProps {
  onBack: () => void
}

export default function ChatbotScreen({ onBack }: ChatbotScreenProps) {
  // useChat handles streaming, errors, state, etc.
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: "/api/chat", // our route above
  })

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BotIcon className="h-6 w-6 text-blue-500" /> AI Chatbot
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 italic">
                Start a conversation! Ask me anything about the Procure-to-Pay cycle.
              </div>
            )}
            {messages.map(({ id, role, content }) => (
              <div key={id} className={`flex gap-3 ${role === "user" ? "justify-end" : "justify-start"}`}>
                {role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <BotIcon className="h-4 w-4 text-blue-600" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] p-3 rounded-lg text-sm ${
                    role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {content}
                </div>

                {role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-gray-700" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <BotIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                  <span className="animate-pulse">Typing&hellip;</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t flex items-center gap-2">
        {error && (
          <div className="text-red-600 text-sm flex-grow">
            Error: {error.message}{" "}
            <button className="underline" onClick={reload}>
              retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-grow flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow h-10"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || input.trim() === ""}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>

        <Button onClick={onBack} className="bg-green-100 text-green-800 hover:bg-green-200 h-10">
          Back
        </Button>
      </CardFooter>
    </Card>
  )
}
