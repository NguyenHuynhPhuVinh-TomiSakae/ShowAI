'use client'

import { Chat } from '@/components/chat'
import { ChatInput } from '@/components/chat-input'
import { ChatPicker } from '@/components/chat-picker'
import { ChatSettings } from '@/components/chat-settings'
import { NavBar } from '@/components/navbarchat'
import { Preview } from '@/components/preview'
import { Message, toAISDKMessages, toMessageImage } from '@/lib/messages'
import { LLMModelConfig } from '@/lib/models'
import modelsList from '@/lib/models.json'
import { FragmentSchema, fragmentSchema as schema } from '@/lib/schema'
import templates, { TemplateId } from '@/lib/templates'
import { ExecutionResult } from '@/lib/types'
import { DeepPartial } from 'ai'
import { experimental_useObject as useObject } from 'ai/react'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export default function Home() {
  const [chatInput, setChatInput] = useLocalStorage('chat', '')
  const [files, setFiles] = useState<File[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    'auto-developer',
  )
  const [languageModel, setLanguageModel] = useLocalStorage<LLMModelConfig>(
    'languageModel',
    {
      model: 'mistral-small-latest',
    },
  )

  const [result, setResult] = useState<ExecutionResult>()
  const [messages, setMessages] = useState<Message[]>([])
  const [fragment, setFragment] = useState<DeepPartial<FragmentSchema>>()
  const [currentTab, setCurrentTab] = useState<'code' | 'fragment'>('code')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const currentModel = modelsList.models.find(
    (model) => model.id === languageModel.model,
  )
  const currentTemplate = { [selectedTemplate]: templates[selectedTemplate] }
  const lastMessage = messages[messages.length - 1]

  const { object, submit, isLoading, stop, error } = useObject({
    api: '/api/chat',
    schema,
    onFinish: async ({ object: fragment, error }) => {
      if (!error) {
        console.log('fragment', fragment)
        setIsPreviewLoading(true)

        const response = await fetch('/api/sandbox', {
          method: 'POST',
          body: JSON.stringify({
            fragment,
          }),
        })

        const result = await response.json()
        console.log('result', result)

        if (response.status === 429) {
          setIsRateLimited(true)
        }
        setResult(result)
        setCurrentPreview({ fragment, result })
        setMessage({ result })
        setCurrentTab('fragment')
        setIsPreviewLoading(false)
      }
    },
  })

  useEffect(() => {
    if (object) {
      setFragment(object)
      const content: Message['content'] = [
        { type: 'text', text: object.commentary || '' },
        { type: 'code', text: object.code || '' },
      ]

      if (!lastMessage || lastMessage.role !== 'assistant') {
        addMessage({
          role: 'assistant',
          content,
          object,
        })
      }

      if (lastMessage && lastMessage.role === 'assistant') {
        setMessage({
          content,
          object,
        })
      }
    }
  }, [object])

  useEffect(() => {
    if (error) stop()
  }, [error])

  function setMessage(message: Partial<Message>, index?: number) {
    setMessages((previousMessages) => {
      const updatedMessages = [...previousMessages]
      updatedMessages[index ?? previousMessages.length - 1] = {
        ...previousMessages[index ?? previousMessages.length - 1],
        ...message,
      }

      return updatedMessages
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isLoading) {
      stop()
    }

    const content: Message['content'] = [{ type: 'text', text: chatInput }]
    const images = await toMessageImage(files)

    if (images.length > 0) {
      images.forEach((image) => {
        content.push({ type: 'image', image })
      })
    }

    const updatedMessages = addMessage({
      role: 'user',
      content,
    })

    submit({
      messages: toAISDKMessages(updatedMessages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
    })

    setChatInput('')
    setFiles([])
    setCurrentTab('code')
  }

  function retry() {
    submit({
      messages: toAISDKMessages(messages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
    })
  }

  function addMessage(message: Message) {
    setMessages((previousMessages) => [...previousMessages, message])
    return [...messages, message]
  }

  function handleSaveInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setChatInput(e.target.value)
  }

  function handleFileChange(files: File[]) {
    setFiles(files)
  }

  function handleLanguageModelChange(e: LLMModelConfig) {
    setLanguageModel({ ...languageModel, ...e })
  }

  function handleClearChat() {
    stop()
    setChatInput('')
    setFiles([])
    setMessages([])
    setFragment(undefined)
    setResult(undefined)
    setCurrentTab('code')
    setIsPreviewLoading(false)
  }

  function setCurrentPreview(preview: {
    fragment: DeepPartial<FragmentSchema> | undefined
    result: ExecutionResult | undefined
  }) {
    setFragment(preview.fragment)
    setResult(preview.result)
  }

  function handleUndo() {
    setMessages((previousMessages) => [...previousMessages.slice(0, -2)])
    setCurrentPreview({ fragment: undefined, result: undefined })
  }

  return (
    <>
      <div className="bg-[#2A3284] text-center py-8 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Tạo Mã</h1>
        <p className="text-base sm:text-lg max-w-3xl mx-auto">
          Tạo mã một cách nhanh chóng và hiệu quả.
        </p>
      </div>
      <main className="flex min-h-screen max-h-screen bg-[#0F172A] text-white">
        <div className="grid w-full md:grid-cols-2">
          <div
            className={`flex flex-col w-full max-h-full max-w-[800px] mx-auto px-4 overflow-auto ${fragment ? 'col-span-1' : 'col-span-2'
              }`}
          >
            <NavBar
              onClear={handleClearChat}
              canClear={messages.length > 0}
              canUndo={messages.length > 1 && !isLoading}
              onUndo={handleUndo}
            />
            <Chat
              messages={messages}
              isLoading={isLoading}
              setCurrentPreview={setCurrentPreview}
            />
            <ChatInput
              error={error}
              retry={retry}
              isLoading={isLoading}
              isRateLimited={isRateLimited}
              stop={stop}
              input={chatInput}
              handleInputChange={handleSaveInputChange}
              handleSubmit={handleSubmit}
              isMultiModal={currentModel?.multiModal || false}
              files={files}
              handleFileChange={handleFileChange}
            >
              <ChatPicker
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectedTemplateChange={setSelectedTemplate}
                models={modelsList.models}
                languageModel={languageModel}
                onLanguageModelChange={handleLanguageModelChange}
              />
              <ChatSettings
                languageModel={languageModel}
                onLanguageModelChange={handleLanguageModelChange}
                apiKeyConfigurable={!process.env.NEXT_PUBLIC_NO_API_KEY_INPUT}
                baseURLConfigurable={!process.env.NEXT_PUBLIC_NO_BASE_URL_INPUT}
              />
            </ChatInput>
          </div>
          <Preview
            selectedTab={currentTab}
            onSelectedTabChange={setCurrentTab}
            isChatLoading={isLoading}
            isPreviewLoading={isPreviewLoading}
            fragment={fragment}
            result={result as ExecutionResult}
            onClose={() => setFragment(undefined)}
          />
        </div>
      </main>
    </>
  )
}
