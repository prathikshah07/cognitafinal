import { supabaseServer as supabase } from '../../../lib/supabaseServer'

export async function POST(req: Request) {
  try {
    // Parse JSON body
    const { userPrompt, userId } = await req.json()

    // Validate input
    if (!userPrompt || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userPrompt or userId' }),
        { status: 400 }
      )
    }

    // TODO: Replace dummy AI response with actual Cerebras API call
    const aiResponse = 'This is a dummy AI response.'

    // Insert chat history into Supabase
    const { data, error } = await supabase
      .from('chat_history')
      .insert([{ user_id: userId, prompt: userPrompt, response: aiResponse }])

    if (error) {
      console.error('Supabase insert failed:', error)
      return new Response(
        JSON.stringify({ error: 'Supabase insert failed', details: error.message }),
        { status: 500 }
      )
    }

    // Successful response
    return new Response(
      JSON.stringify({ aiResponse, supData: data }),
      { status: 200 }
    )
  } catch (err: any) {
    console.error('POST handler error:', err)
    return new Response(
      JSON.stringify({ error: 'Server error', details: err.message || err }),
      { status: 500 }
    )
  }
}
