'use server'

import { listChats, deleteChat } from '@/lib/chat-store'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function SidebarServer() {
  // Server Action para eliminar chat
  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('chat_id') as string
    await deleteChat(id)
    revalidatePath('/') // refresca la página principal
  }

  const chats = await listChats()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-100 dark:bg-gray-900 p-4 shadow z-20">
      <h2 className="mb-4 font-bold text-lg text-gray-800 dark:text-gray-100">Tus chats</h2>
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
        <form action={handleDelete}>
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