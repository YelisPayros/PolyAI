import { Chat } from '@/components/custom/chat'
import { loadChat } from '@/lib/chat-store'
import { ActionBar } from '@/components/action-bar'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const messages = await loadChat(id)

  return (
    <div className="h-screen flex flex-col ">
      <ActionBar />
      <Chat key={id} id={id} initialMessages={messages} />
    </div>
  )
}
