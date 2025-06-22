'use client'

import { Attachment, Message, createIdGenerator } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { Message as PreviewMessage } from './message'
import { useScrollToBottom } from './use-scroll-to-bottom'
import { Overview } from './overview'
import { MultimodalInput } from './multimodal-input'

export function Chat({ id, initialMessages }: { id: string; initialMessages: Array<Message> }) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } = useChat({
    id,
    body: { id },
    initialMessages,
    maxSteps: 10,
    generateId: createIdGenerator({
      prefix: 'msgc',
      size: 16
    }),
    experimental_prepareRequestBody({ messages, id }) {
      return { message: messages[messages.length - 1], id }
    }
  })

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()

  const [attachments, setAttachments] = useState<Array<Attachment>>([])

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 bg-background h-full">
      <div className="flex flex-col justify-between items-center gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-screen items-center overflow-y-scroll scrollbar-none"
        >
          {messages.length === 0 && <Overview />}

          {messages.map(message => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
            />
          ))}

          <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
        </div>

        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px) px-4 md:px-0">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
      </div>
    </div>
  )
}
