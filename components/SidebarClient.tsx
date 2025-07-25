'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { listChatsClient, deleteChatClient, createChatClient } from '@/lib/chat-store-client'

interface Chat {
  chat_id: string
  messages_count: number
}

export default function SidebarClient({ initialChats = [] }: { initialChats?: Chat[] }) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [canCreateChat, setCanCreateChat] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  async function fetchChats() {
    try {
      console.log('Fetching chats in SidebarClient:', new Date().toISOString())
      const data = await listChatsClient()

      // Ordenar los chats por ID descendente (los nuevos arriba)
      const sortedChats = [...data].sort((a, b) => b.chat_id.localeCompare(a.chat_id))

      setChats(sortedChats)

      const hasEmptyChat = data.some(chat => chat.messages_count === 0)
      setCanCreateChat(!hasEmptyChat)
    } catch (error) {
      console.error('Error fetching chats:', JSON.stringify(error, null, 2))
    }
  }

  useEffect(() => {
    let active = true
    let channel: any = null

    fetchChats()

    const setupSubscription = (user_uuid: string) => {
      channel = supabase
        .channel('chats-channel')
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'chats',
          filter: `user_uuid=eq.${user_uuid}`
        }, (payload) => {
          if (active) fetchChats()
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `user_uuid=eq.${user_uuid}`
        }, (payload) => {
          if (active) fetchChats()
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats'
        }, (payload) => {
          if (active) fetchChats()
        })
        .subscribe((status: string, err: any) => {
          if (err) {
            console.error('Subscription error:', JSON.stringify(err, null, 2))
          }
        })
    }

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) return
      setupSubscription(user.id)
    })

    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase])

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const id = formData.get('chat_id') as string
    try {
      await deleteChatClient(id)
      await fetchChats()
    } catch (error) {
      console.error('Error deleting chat:', JSON.stringify(error, null, 2))
    }
  }

  async function handleCreateChat() {
    try {
      const id = await createChatClient()
      await fetchChats()
      router.push(`/${id}`)
    } catch (error) {
      console.error('Error creating chat:', JSON.stringify(error, null, 2))
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-100 dark:bg-gray-900 p-4 shadow z-20">
      <h2 className="mb-4 font-bold text-lg text-gray-800 dark:text-gray-100">Tus chats</h2>
      <button
        onClick={handleCreateChat}
        disabled={!canCreateChat}
        className={`mb-4 px-4 py-2 rounded text-white ${
          canCreateChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Nuevo Chat
      </button>
      <ul className="space-y-2">
        {chats.length === 0 && (
          <li className="text-gray-500 dark:text-gray-400 text-sm">No tienes chats aún.</li>
        )}
        {chats.map(chat => (
          <li key={chat.chat_id} className="flex items-center justify-between">
            <Link
              href={`/${chat.chat_id}`}
              className="text-left flex-1 truncate px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              {chat.chat_id.slice(0, 8)}
            </Link>
            {chat.messages_count > 0 && (
              <form onSubmit={handleDelete}>
                <input type="hidden" name="chat_id" value={chat.chat_id} />
                <button
                  type="submit"
                  className="ml-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Eliminar
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
