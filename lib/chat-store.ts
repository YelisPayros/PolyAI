import { generateId, Message } from 'ai'
import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

// Save chat messages to Supabase
export async function saveChat({
  id,
  messages
}: {
  id: string
  messages: Message[]
}): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error:', authError)
    throw new Error('User not authenticated')
  }

  const user_uuid = user.id

  // Update the messages in the database for the given chat_id
  const { error } = await supabase
    .from('chats')
    .update({ messages })
    .eq('chat_id', id)
    .eq('user_uuid', user_uuid) // Ensure the chat belongs to the user

  if (error) {
    console.error('Error saving chat messages:', error)
    throw error
  }
}

// Load chat messages from Supabase
export async function loadChat(id: string): Promise<Message[]> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error:', authError)
    throw new Error('User not authenticated')
  }

  const user_uuid = user.id

  // Fetch the chat messages from the database
  const { data, error } = await supabase
    .from('chats')
    .select('messages')
    .eq('chat_id', id)
    .eq('user_uuid', user_uuid) // Ensure the chat belongs to the user
    .single()

  if (error) {
    console.error('Error loading chat messages:', error)
  }

  if (!data) {
    redirect('/')
  }

  return data.messages as Message[]
}

// Create a new chat or retrieve existing chat ID
export async function createChat(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error:', authError)
    throw new Error('User not authenticated')
  }

  const user_uuid = user.id

  // Check if the user already has a chat
  const { data, error } = await supabase
    .from('chats')
    .select('chat_id')
    .eq('user_uuid', user_uuid)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows found
    console.error('Error checking for existing chat:', error)
    throw error
  }

  let id: string
  if (data) {
    id = data.chat_id // Use existing chat ID
  } else {
    id = generateId() // Generate a new chat ID
    // Insert the new chat into the database with empty messages
    const { error: insertError } = await supabase
      .from('chats')
      .insert({ chat_id: id, user_uuid, messages: [] })

    if (insertError) {
      console.error('Error inserting new chat:', insertError)
      throw insertError
    }
  }

  return id
}
// Listar todos los chats del usuario autenticado (solo chat_id)
export async function listChats(): Promise<{ chat_id: string; messages_count: number }[]> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error:', authError)
    throw new Error('User not authenticated')
  }

  const user_uuid = user.id

  // Selecciona también los mensajes para contar
  const { data, error } = await supabase
    .from('chats')
    .select('chat_id, messages')
    .eq('user_uuid', user_uuid)

  if (error) {
    console.error('Error listing chats:', error)
    throw error
  }

  // Devuelve el id y la cantidad de mensajes
  return (data || []).map((chat: any) => ({
    chat_id: chat.chat_id,
    messages_count: Array.isArray(chat.messages) ? chat.messages.length : 0
  }))
}

// Delete a chat from Supabase
export async function  deleteChat(id: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Auth error:', authError)
    throw new Error('User not authenticated')
  }

  const user_uuid = user.id

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('chat_id', id)
    .eq('user_uuid', user_uuid)

  if (error) {
    console.error('Error deleting chat from database:', error)
    throw error
  }
}
