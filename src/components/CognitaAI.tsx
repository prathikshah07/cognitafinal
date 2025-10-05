import { useState, useEffect } from "react"
import { supabaseClient } from "../lib/supabaseClient" 

interface CognitaAIProps {
  userId: string
}

export default function CognitaAI({ userId }: CognitaAIProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: input, userId }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "user", content: input }, { role: "ai", content: data.aiResponse }])
      setInput("")
    } catch (err) {
      console.error("Chat send error:", err)
    }

    setLoading(false)
  }

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabaseClient
        .from("chat_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })

      if (error) console.error("Failed to load chat history:", error)
      else if (data) setMessages(data.map(d => ({ role: "ai", content: d.response })))
    }

    fetchHistory()
  }, [userId])

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            {m.content}
          </div>
        ))}
      </div>
      <div>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button onClick={sendMessage} disabled={loading}>{loading ? "..." : "Send"}</button>
      </div>
    </div>
  )
}
