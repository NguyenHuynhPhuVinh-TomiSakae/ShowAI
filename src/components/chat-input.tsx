import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ArrowUp, Paperclip, Square, X } from 'lucide-react'
import { useMemo } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

export function ChatInput({
  error,
  retry,
  isLoading,
  isRateLimited,
  stop,
  input,
  handleInputChange,
  handleSubmit,
  isMultiModal,
  files,
  handleFileChange,
  children,
}: {
  error: undefined | unknown
  retry: () => void
  isLoading: boolean
  isRateLimited: boolean
  stop: () => void
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isMultiModal: boolean
  files: File[]
  handleFileChange: (files: File[]) => void
  children: React.ReactNode
}) {
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileChange(Array.from(e.target.files || []))
  }

  function handleFileRemove(file: File) {
    const newFiles = files ? Array.from(files).filter((f) => f !== file) : []
    handleFileChange(newFiles)
  }

  const filePreview = useMemo(() => {
    if (files.length === 0) return null
    return Array.from(files).map((file) => {
      return (
        <div className="relative" key={file.name}>
          <span
            onClick={() => handleFileRemove(file)}
            className="absolute top-[-8] right-[-8] bg-[#1A1A2E] rounded-full p-1 cursor-pointer"
          >
            <X className="h-3 w-3 text-[#4ECCA3]" />
          </span>
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="rounded-xl w-10 h-10 object-cover border border-[#4ECCA3]"
          />
        </div>
      )
    })
  }, [files])

  function onEnter(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (e.currentTarget.checkValidity()) {
        handleSubmit(e)
      } else {
        e.currentTarget.reportValidity()
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={onEnter}
      className="mb-2 flex flex-col mt-auto bg-[#0F172A]"
    >
      {error !== undefined && (
        <div
          className={`px-3 py-2 text-sm font-medium mb-2 rounded-xl ${isRateLimited
            ? 'bg-orange-400/10 text-orange-400'
            : 'bg-red-400/10 text-red-400'
            }`}
        >
          {isRateLimited
            ? 'Đã vượt quá giới hạn tốc độ.'
            : 'Đã xảy ra lỗi không mong muốn.'}
          {' Vui lòng '}
          <button className="underline" onClick={retry}>
            thử lại
          </button>
          {' sau.'}
        </div>
      )}
      <div className="shadow-md rounded-2xl border border-[#4ECCA3]">
        <div className="flex items-center px-3 py-2 gap-1">{children}</div>
        <TextareaAutosize
          autoFocus={true}
          minRows={1}
          maxRows={5}
          className="text-normal px-3 resize-none ring-0 bg-inherit w-full m-0 outline-none text-white"
          required={true}
          placeholder="Mô tả ứng dụng của bạn..."
          value={input}
          onChange={handleInputChange}
        />
        <div className="flex p-3 gap-2 items-center">
          <input
            type="file"
            id="multimodal"
            name="multimodal"
            accept="image/*"
            multiple={true}
            className="hidden"
            onChange={handleFileInput}
          />
          <div className="flex items-center flex-1 gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    disabled={!isMultiModal}
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-10 w-10 bg-[#1A1A2E] text-white border-[#4ECCA3] hover:bg-[#3E52E8]"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('multimodal')?.click()
                    }}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1A2E] text-white border-[#4ECCA3]">Thêm tệp đính kèm</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {files.length > 0 && filePreview}
          </div>
          <div>
            {!isLoading ? (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      type="submit"
                      className="rounded-xl h-10 w-10 bg-[#3E52E8] hover:bg-[#4B5EFF] text-white"
                    >
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1A1A2E] text-white border-[#4ECCA3]">Gửi tin nhắn</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-xl h-10 w-10 bg-[#4ECCA3] hover:bg-[#3EAC83] text-white"
                      onClick={(e) => {
                        e.preventDefault()
                        stop()
                      }}
                    >
                      <Square className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1A1A2E] text-white border-[#4ECCA3]">Dừng tạo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Tạo mã với ShowAI dựa vào mã nguồn mở của Fragments!
      </p>
    </form>
  )
}
