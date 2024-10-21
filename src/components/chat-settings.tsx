import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'
import { LLMModelConfig } from '@/lib/models'
import { Settings2 } from 'lucide-react'

export function ChatSettings({
  apiKeyConfigurable,
  baseURLConfigurable,
  languageModel,
  onLanguageModelChange,
}: {
  apiKeyConfigurable: boolean
  baseURLConfigurable: boolean
  languageModel: LLMModelConfig
  onLanguageModelChange: (model: LLMModelConfig) => void
}) {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white h-6 w-6 rounded-sm bg-[#1A1A2E] border-[#3E52E8] hover:bg-[#0F172A] hover:border-[#4ECCA3]">
                <Settings2 className="h-4 w-4 text-[#4ECCA3]" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1A1A2E] text-white border-[#3E52E8]">Cài đặt LLM</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="start" className="bg-[#0F172A] text-white border-[#3E52E8]">
        {apiKeyConfigurable && (
          <>
            <div className="flex flex-col gap-2 px-2 py-2">
              <Label htmlFor="apiKey" className="text-gray-300">Khóa API</Label>
              <Input
                name="apiKey"
                type="password"
                placeholder="Tự động"
                required={true}
                defaultValue={languageModel.apiKey}
                onChange={(e) =>
                  onLanguageModelChange({
                    apiKey:
                      e.target.value.length > 0 ? e.target.value : undefined,
                  })
                }
                className="text-sm bg-[#1A1A2E] text-white border-[#3E52E8] focus:border-[#4ECCA3]"
              />
            </div>
            <DropdownMenuSeparator className="bg-[#3E52E8]" />
          </>
        )}
        {baseURLConfigurable && (
          <>
            <div className="flex flex-col gap-2 px-2 py-2">
              <Label htmlFor="baseURL" className="text-gray-300">URL Cơ sở</Label>
              <Input
                name="baseURL"
                type="text"
                placeholder="Tự động"
                required={true}
                defaultValue={languageModel.baseURL}
                onChange={(e) =>
                  onLanguageModelChange({
                    baseURL:
                      e.target.value.length > 0 ? e.target.value : undefined,
                  })
                }
                className="text-sm bg-[#1A1A2E] text-white border-[#3E52E8] focus:border-[#4ECCA3]"
              />
            </div>
            <DropdownMenuSeparator className="bg-[#3E52E8]" />
          </>
        )}
        <div className="flex flex-col gap-1.5 px-2 py-2">
          <span className="text-sm font-medium text-[#4ECCA3]">Tham số</span>
          <div className="flex space-x-4 items-center">
            <span className="text-sm flex-1 text-gray-300">
              Token đầu ra
            </span>
            <Input
              type="number"
              defaultValue={languageModel.maxTokens}
              min={50}
              max={10000}
              step={1}
              className="h-6 rounded-sm w-[88px] text-xs text-center tabular-nums bg-[#1A1A2E] text-white border-[#3E52E8] focus:border-[#4ECCA3]"
              placeholder="Tự động"
              onChange={(e) =>
                onLanguageModelChange({
                  maxTokens: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>
          <div className="flex space-x-4 items-center">
            <span className="text-sm flex-1 text-gray-300">
              Nhiệt độ
            </span>
            <Input
              type="number"
              defaultValue={languageModel.temperature}
              min={0}
              max={5}
              step={0.01}
              className="h-6 rounded-sm w-[88px] text-xs text-center tabular-nums bg-[#1A1A2E] text-white border-[#3E52E8] focus:border-[#4ECCA3]"
              placeholder="Tự động"
              onChange={(e) =>
                onLanguageModelChange({
                  temperature: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>
          <div className="flex space-x-4 items-center">
            <span className="text-sm flex-1 text-gray-300">Top P</span>
            <Input
              type="number"
              defaultValue={languageModel.topP}
              min={0}
              max={1}
              step={0.01}
              className="h-6 rounded-sm w-[88px] text-xs text-center tabular-nums bg-[#1A1A2E] text-white border-[#3E52E8] focus:border-[#4ECCA3]"
              placeholder="Tự động"
              onChange={(e) =>
                onLanguageModelChange({
                  topP: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>
          <div className="flex space-x-4 items-center">
            <span className="text-sm flex-1 text-gray-300">Top K</span>
            <Input
              type="number"
              defaultValue={languageModel.topK}
              min={0}
              max={500}
              step={1}
              className="h-6 rounded-sm w-[88px] text-xs text-center tabular-nums bg-[#1A1A2E] text-white border-[#3E52E8] focus:border-[#4ECCA3]"
              placeholder="Tự động"
              onChange={(e) =>
                onLanguageModelChange({
                  topK: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>
          <div className="flex space-x-4 items-center">
            <span className="text-sm flex-1 text-gray-300">
              Phạt tần suất
            </span>
            <Input
              type="number"
              defaultValue={languageModel.frequencyPenalty}
              min={0}
              max={2}
              step={0.01}
              className="h-6 rounded-sm w-[88px] text-xs text-center tabular-nums bg-[#1A1A2E] text-white border-[#3E52E8] focus:border-[#4ECCA3]"
              placeholder="Tự động"
              onChange={(e) =>
                onLanguageModelChange({
                  frequencyPenalty: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>
          <div className="flex space-x-4 items-center">
            <span className="text-sm flex-1 text-gray-300">
              Phạt hiện diện
            </span>
            <Input
              type="number"
              defaultValue={languageModel.presencePenalty}
              min={0}
              max={2}
              step={0.01}
              className="h-6 rounded-sm w-[88px] text-xs text-center tabular-nums bg-[#1A1A2E] text-white border-[#3E52E8] focus:border-[#4ECCA3]"
              placeholder="Tự động"
              onChange={(e) =>
                onLanguageModelChange({
                  presencePenalty: parseFloat(e.target.value) || undefined,
                })
              }
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
