import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Trash,
  Undo,
} from 'lucide-react'

export function NavBar({
  onClear,
  canClear,
  onUndo,
  canUndo,
}: {
  onClear: () => void
  canClear: boolean
  onUndo: () => void
  canUndo: boolean
}) {
  return (
    <nav className="w-full flex bg-[#0F172A] py-4 text-white">
      <div className="flex flex-1 items-center">
        <h1 className="whitespace-pre">Tạo mã với </h1>
        <span className="text-[#4ECCA3] text-lg font-bold">ShowAI</span>
      </div>
      <div className="flex items-center gap-1 md:gap-4">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo}
                className="text-white hover:bg-[#1A1A2E] hover:text-[#4B5EFF]"
              >
                <Undo className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1A1A2E] text-white">Hoàn tác</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClear}
                disabled={!canClear}
                className="text-white hover:bg-[#1A1A2E] hover:text-[#4B5EFF]"
              >
                <Trash className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1A1A2E] text-white">Xóa cuộc trò chuyện</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  )
}
