/* eslint-disable @typescript-eslint/no-unused-vars */
import { Message } from '@/lib/messages'
import { FragmentSchema } from '@/lib/schema'
import { ExecutionResult } from '@/lib/types'
import { DeepPartial } from 'ai'
import { Loader2Icon, LoaderIcon, Terminal } from 'lucide-react'
import { useEffect } from 'react'

export function Chat({
  messages,
  isLoading,
  setCurrentPreview,
}: {
  messages: Message[]
  isLoading: boolean
  setCurrentPreview: (preview: {
    fragment: DeepPartial<FragmentSchema> | undefined
    result: ExecutionResult | undefined
  }) => void
}) {
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }, [JSON.stringify(messages)])

  return (
    <div
      id="chat-container"
      className="flex flex-col pb-4 gap-2 overflow-y-auto max-h-full bg-[#0F172A] text-white"
    >
      {messages.map((message: Message, index: number) => (
        <div
          className={`flex flex-col px-4 shadow-sm whitespace-pre-wrap ${message.role !== 'user'
            ? 'bg-[#1A1A2E] border border-[#3E52E8] text-gray-200 py-4 rounded-2xl gap-4 w-full'
            : 'bg-gradient-to-b from-[#3E52E8]/10 to-[#3E52E8]/20 py-2 rounded-xl gap-2 w-fit'
            } font-serif`}
          key={index}
        >
          {message.content.map((content, id) => {
            if (content.type === 'text') {
              return content.text
            }
            if (content.type === 'image') {
              return (
                <img
                  key={id}
                  src={content.image}
                  alt="đoạn"
                  className="mr-2 inline-block w-12 h-12 object-cover rounded-lg bg-white mb-2"
                />
              )
            }
          })}
          {message.object && (
            <div
              onClick={() =>
                setCurrentPreview({
                  fragment: message.object,
                  result: message.result,
                })
              }
              className="py-2 pl-2 w-full md:w-max flex items-center border border-[#4ECCA3] rounded-xl select-none hover:bg-[#4ECCA3]/10 hover:cursor-pointer"
            >
              <div className="rounded-[0.5rem] w-10 h-10 bg-[#4ECCA3]/20 self-stretch flex items-center justify-center">
                <Terminal strokeWidth={2} className="text-[#4ECCA3]" />
              </div>
              <div className="pl-2 pr-4 flex flex-col">
                <span className="font-bold font-sans text-sm text-[#4ECCA3]">
                  {message.object.title}
                </span>
                <span className="font-sans text-sm text-gray-400">
                  Nhấp để xem code
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <LoaderIcon strokeWidth={2} className="animate-spin w-4 h-4" />
          <span>Đang tạo...</span>
        </div>
      )}
    </div>
  )
}
