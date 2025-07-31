'use client'

import { createClient } from './supabase/client'
import { generateId } from 'ai'

export async function listChatsClient(): Promise<{ chat_id: string; messages_count: number }[]> {
  console.log('listChatsClient called:', new Date().toISOString())
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Auth error:', authError)
    return []
  }
  const user_uuid = user.id
  const { data, error } = await supabase
    .from('chats')
    .select('chat_id, messages')
    .eq('user_uuid', user_uuid)
    .order('chat_id', { ascending: false }) // Order by chat_id to get latest first
  if (error) {
    console.error('Error listing chats:', error)
    return []
  }
  return (data || []).map((chat: any) => ({
    chat_id: chat.chat_id,
    messages_count: Array.isArray(chat.messages) ? chat.messages.length : 0,
  }))
}

export async function deleteChatClient(id: string): Promise<void> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
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
    console.error('Error deleting chat:', error)
    throw error
  }
}

//create new chat
export async function createChatClient(): Promise<string> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error('Authentication error:', authError)
    throw new Error('User not authenticated')
  }
  const user_uuid = user.id

  // Check if there are previous chats
  const { data: chats, error: listError } = await supabase
    .from('chats')
    .select('messages')
    .eq('user_uuid', user_uuid)
    .order('chat_id', { ascending: false })
    .limit(1)
  if (listError) {
    console.error('Error checking last chat:', listError)
    throw listError
  }

  // If there are no chats or the last one has messages, allow creation
  if (chats && chats.length > 0 && (!chats[0].messages || chats[0].messages.length === 0)) {
    throw new Error('Cannot create a new chat: the last chat is empty')
  }

  const id = generateId()
  const { error: insertError } = await supabase
    .from('chats')
    .insert({ chat_id: id, user_uuid, messages: [] })
  if (insertError) {
    console.error('Error inserting new chat:', insertError)
    throw insertError
  }
  return id
}
