'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { listChatsClient, deleteChatClient, createChatClient } from '@/lib/chat-store-client'

interface Chat {
  chat_id: string
  messages_count: number
  created_at: string
}

interface SidebarClientProps {
  initialChats?: Chat[]
}

export default function SidebarClient({ initialChats = [] }: SidebarClientProps) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [canCreateChat, setCanCreateChat] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  async function fetchChats() {
    try {
      console.log('Fetching chats in SidebarClient:', new Date().toISOString())
      const data = await listChatsClient()
      console.log('Fetched chats:', JSON.stringify(data, null, 2))
      setChats(data) // Confiar en la ordenación del servidor por created_at
      const latestChat = data.length > 0 ? data[0] : null
      const canCreate = latestChat ? latestChat.messages_count > 0 : true
      setCanCreateChat(canCreate)
      console.log('Updated chats state:', JSON.stringify(data, null, 2))
      console.log('canCreateChat set to:', canCreate, 'latestChat:', JSON.stringify(latestChat, null, 2))
    } catch (error) {
      console.error('Error fetching chats:', JSON.stringify(error, null, 2))
    }
  }

  useEffect(() => {
    let active = true
    let channel: any = null

    // Cargar chats iniciales
    fetchChats()

    // Configurar suscripción
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        console.log('No user found for subscription:', error ? JSON.stringify(error, null, 2) : 'No user')
        return
      }
      const user_uuid = user.id
      console.log('Setting up subscription for user:', user_uuid)

      if (channel) {
        console.log('Removing existing Supabase channel before new subscription')
        supabase.removeChannel(channel).then(() => {
          console.log('Previous channel removed')
        })
      }

      channel = supabase
        .channel(`chats-channel-${user_uuid}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chats',
            filter: `user_uuid=eq.${user_uuid}`
          },
          (payload) => {
            console.log('Supabase event received:', JSON.stringify(payload, null, 2), new Date().toISOString())
            if (active) {
              console.log('Fetching chats after event:', payload.eventType)
              fetchChats()
            }
          }
        )
        .subscribe((status: string, err: any) => {
          console.log('Subscription status:', status, new Date().toISOString())
          if (err) {
            console.error('Subscription error:', JSON.stringify(err, null, 2))
          }
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to chats-channel:', `chats-channel-${user_uuid}`)
          }
        })
    })

    return () => {
      active = false
      if (channel) {
        console.log('Removing Supabase channel on cleanup')
        supabase.removeChannel(channel).then(() => {
          console.log('Channel removed on cleanup')
        })
      }
    }
  }, [supabase, router])

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-100 dark:bg-gray-900 p-4 shadow z-20">
      <h2 className="mb-4 font-bold text-lg text-gray-800 dark:text-gray-100">Tus chats</h2>
      <button
        onClick={async () => {
          try {
            console.log('Creating new chat')
            const id = await createChatClient()
            console.log('New chat created:', id)
            console.log('Manually fetching chats after create')
            await fetchChats()
            router.push(`/${id}`)
          } catch (error) {
            console.error('Error creating chat:', JSON.stringify(error, null, 2))
          }
        }}
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
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const id = formData.get('chat_id') as string
                  try {
                    console.log('Deleting chat:', id)
                    await deleteChatClient(id)
                    console.log('Chat deleted successfully:', id)
                    console.log('Manually fetching chats after delete')
                    await fetchChats()
                  } catch (error) {
                    console.error('Error deleting chat:', JSON.stringify(error, null, 2))
                  }
                }}
              >
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