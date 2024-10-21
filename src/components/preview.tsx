import { FragmentCode } from './fragment-code'
import { FragmentPreview } from './fragment-preview'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FragmentSchema } from '@/lib/schema'
import { ExecutionResult } from '@/lib/types'
import { DeepPartial } from 'ai'
import { ChevronsRight, LoaderCircle } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'

export function Preview({
  selectedTab,
  onSelectedTabChange,
  isChatLoading,
  isPreviewLoading,
  fragment,
  result,
  onClose,
}: {
  selectedTab: 'code' | 'fragment'
  onSelectedTabChange: Dispatch<SetStateAction<'code' | 'fragment'>>
  isChatLoading: boolean
  isPreviewLoading: boolean
  fragment?: DeepPartial<FragmentSchema>
  result?: ExecutionResult
  onClose: () => void
}) {
  if (!fragment) {
    return null
  }

  return (
    <div className="absolute md:relative top-0 left-0 shadow-2xl md:rounded-tl-3xl md:rounded-bl-3xl md:border-l md:border-y bg-popover h-full w-full overflow-auto">
      <Tabs
        value={selectedTab}
        onValueChange={(value) =>
          onSelectedTabChange(value as 'code' | 'fragment')
        }
        className="h-full flex flex-col items-start justify-start"
      >
        <div className="w-full p-2 grid grid-cols-3 items-center border-b border-gray-700">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-[#1A1A2E]"
                  onClick={onClose}
                >
                  <ChevronsRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Đóng thanh bên</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex justify-center">
            <TabsList className="px-1 py-0 border border-gray-700 h-8 bg-[#1A1A2E]">
              <TabsTrigger
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center text-gray-300 data-[state=active]:bg-[#3E52E8] data-[state=active]:text-white"
                value="code"
              >
                {isChatLoading && (
                  <LoaderCircle
                    strokeWidth={3}
                    className="h-3 w-3 animate-spin"
                  />
                )}
                Mã
              </TabsTrigger>
              <TabsTrigger
                disabled={!result}
                className="font-normal text-xs py-1 px-2 gap-1 flex items-center text-gray-300 data-[state=active]:bg-[#3E52E8] data-[state=active]:text-white"
                value="fragment"
              >
                Xem trước
                {isPreviewLoading && (
                  <LoaderCircle
                    strokeWidth={3}
                    className="h-3 w-3 animate-spin"
                  />
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex items-center justify-end gap-2">
          </div>
        </div>
        {fragment && (
          <div className="overflow-y-auto w-full h-full bg-white text-black">
            <TabsContent value="code" className="h-full">
              {fragment.code && fragment.file_path && (
                <FragmentCode
                  files={[
                    {
                      name: fragment.file_path,
                      content: fragment.code,
                    },
                  ]}
                />
              )}
            </TabsContent>
            <TabsContent value="fragment" className="h-full">
              {result && <FragmentPreview result={result as ExecutionResult} />}
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  )
}
