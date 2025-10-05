import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(req: Request) {
  try {
    const { userPrompt, userId } = await req.json()

    if (!userPrompt || !userId) {
      return new Response(JSON.stringify({ error: "Missing userPrompt or userId" }), { status: 400 })
    }

    const aiResponse = "This is a dummy AI response."

    const { data, error } = await supabaseServer.from("chat_history").insert([
      { user_id: userId, prompt: userPrompt, response: aiResponse }
    ])

    if (error) {
      return new Response(JSON.stringify({ error: "Supabase insert failed", details: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ aiResponse, supData: data }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Server error", details: err.message || err }), { status: 500 })
  }
}
