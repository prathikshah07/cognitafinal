"use client"
import { useEffect, useState } from "react"
import { useUser } from "@supabase/auth-helpers-react"
import { supabase } from "../lib/supabase"

interface Chat {
  id: number
  prompt: string
  response: string
  created_at: string
}

export default function ChatHistory() {
  const [chats, setChats] = useState<Chat[]>([])
  const user = useUser()

  async function fetchChats() {
    if (!user?.id) return
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (error) console.error("Error fetching chats:", error)
    else setChats(data || [])
  }

  useEffect(() => {
    fetchChats()
    // Optional: realtime updates
    const channel = supabase
      .channel('chat_history_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_history' },
        () => fetchChats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [user?.id])

  if (!chats.length) return <p className="text-gray-500">No chats yet.</p>

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      {chats.map((chat) => (
        <div key={chat.id} className="border rounded-lg p-3 bg-gray-50">
          <p className="font-semibold">You:</p>
          <p>{chat.prompt}</p>
          <p className="font-semibold mt-2">Cognita:</p>
          <p>{chat.response}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(chat.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
} 
