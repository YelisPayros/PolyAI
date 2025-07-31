import { loadChatsByUserId } from '@/lib/chat-store'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error:', authError)
    throw new Error('User not authenticated')
  }

  const chats = await loadChatsByUserId(user.id)
  return Response.json(chats)
}
