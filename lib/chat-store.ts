import { generateId, Message } from 'ai'
import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'
import { Chat } from './utils'

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
  // First delete all empty chats for this user
  await supabase.from('chats').delete().eq('user_uuid', user_uuid).eq('messages', '[]')

  const id = generateId() // Generate a new chat ID
  // Insert the new chat into the database with empty messages
  const { error: insertError } = await supabase
    .from('chats')
    .insert({ chat_id: id, user_uuid, messages: [] })

  if (insertError) {
    console.error('Error inserting new chat:', insertError)
    throw insertError
  }

  return id
}

// Delete a chat from Supabase
export async function deleteChat(id: string): Promise<void> {
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

// Load all chats for a user from Supabase
export async function loadChatsByUserId(userId: string): Promise<Chat[]> {
  const supabase = await createClient()

  // Then get remaining chats
  const { data, error } = await supabase
    .from('chats')
    .select('chat_id, user_uuid, messages, created_at')
    .eq('user_uuid', userId)
    .not('messages', 'eq', '[]') // Filter out empty message arrays
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading chats for user:', error)
    throw error
  }

  return data as Chat[]
}
