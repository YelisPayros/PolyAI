import { redirect } from 'next/navigation'
import { createChat } from '@/lib/chat-store'

export default async function Page() {
  const id = await createChat() // create a new chat
  redirect(`/${id}`) // redirect to chat page, see below
}
