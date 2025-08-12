import { Chat } from '@/components/custom/chat'
import { Navbar } from '@/components/custom/navbar'
import { loadChat } from '@/lib/chat-store'
import Head from 'next/head'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const messages = await loadChat(id)

  return (
    <div className="h-screen flex flex-col ">
      <Head>
        <link href="https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.css" rel="stylesheet" />
      </Head>
      <Navbar />
      <Chat key={id} id={id} initialMessages={messages} />
    </div>
  )
}
