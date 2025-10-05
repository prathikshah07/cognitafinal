"use client"
import { useState } from "react"
import { useUser } from "@supabase/auth-helpers-react"

export default function ChatInput() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const user = useUser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !user?.id) return

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt: input, userId: user.id }),
    })

    const data = await res.json()
    setResponse(data.choices?.[0]?.message?.content || "No response from AI")
    setInput("")
  }

  return (
    <div className="p-4 flex flex-col gap-4 w-full max-w-lg">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Ask Cognita..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Send
        </button>
      </form>
      {response && (
        <div className="border rounded-lg p-3 bg-gray-50 text-gray-800">
          {response}
        </div>
      )}
    </div>
  )
}
