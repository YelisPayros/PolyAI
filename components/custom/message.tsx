'use client'

import { Attachment, ToolInvocation } from 'ai'
import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { PolyAIIcon, UserIcon } from './icons'
import { PreviewAttachment } from './preview-attachment'
import { Markdown } from './markdown'
import { AudioPlayer } from './audio-player'

export const Message = ({
  // Eliminé 'chatId' porque no se estaba usando y ESLint daba warning por eso
  role,
  content,
  toolInvocations,
  attachments
}: {
  // Quité 'chatId' del tipo también para mantener consistencia y evitar warnings
  role: string
  content: string | ReactNode
  toolInvocations: Array<ToolInvocation> | undefined
  attachments?: Array<Attachment>
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileInView={{ y: 0, opacity: 1 }}
    >
      <div
        className={`size-[24px] border rounded-sm self-start p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500 ${
          role === 'assistant' ? 'bg-white text-zinc-700' : ''
        }`}
      >
        {/* Cambié PolyAIIcon por BotIcon si existe, o mantuve PolyAIIcon según lo que quieras */}
        {role === 'assistant' ? <PolyAIIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === 'string' && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map(toolInvocation => {
              const { toolName, toolCallId, state } = toolInvocation

              if (state === 'result') {
                const { result } = toolInvocation

                if (toolName === 'use_tts') {
                  // Extract the audio URL from the result
                  let audioUrl = ''
                  if (result?.structuredContent?.result) {
                    audioUrl = result.structuredContent.result.trim()
                  } else if (result?.content?.[0]?.text) {
                    audioUrl = result.content[0].text.trim()
                  }

                  return (
                    <div key={toolCallId}>
                      <AudioPlayer audioUrl={audioUrl} />
                    </div>
                  )
                }

                return (
                  <div key={toolCallId}>
                    <div>{JSON.stringify(result, null, 2)}</div>
                  </div>
                )
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    <AudioPlayer isLoading={true} />
                  </div>
                )
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map(attachment => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
