import { Chat } from '@/components/custom/chat'
import { Navbar } from '@/components/custom/navbar'
import { loadChat } from '@/lib/chat-store'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const messages = await loadChat(id)

  return (
    <div className="h-screen flex flex-col ">
      <Navbar />
      <Chat key={id} id={id} initialMessages={messages} />
    </div>
  )
}
