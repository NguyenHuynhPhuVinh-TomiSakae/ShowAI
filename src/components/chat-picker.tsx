import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LLMModel, LLMModelConfig } from '@/lib/models'
import { TemplateId, Templates } from '@/lib/templates'
import 'core-js/features/object/group-by.js'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

export function ChatPicker({
  templates,
  selectedTemplate,
  onSelectedTemplateChange,
  models,
  languageModel,
  onLanguageModelChange,
}: {
  templates: Templates
  selectedTemplate: TemplateId
  onSelectedTemplateChange: (template: TemplateId) => void
  models: LLMModel[]
  languageModel: LLMModelConfig
  onLanguageModelChange: (config: LLMModelConfig) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-[#0F172A] text-white p-2 rounded-lg">
      <div className="flex flex-col w-full sm:w-auto">
        <Select
          name="template"
          defaultValue={selectedTemplate}
          onValueChange={onSelectedTemplateChange}
        >
          <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-2 py-1 h-8 text-xs bg-[#1A1A2E] text-gray-200 hover:bg-[#4B5EFF] transition-colors w-full sm:w-auto">
            <SelectValue placeholder="Chọn một yêu cầu" />
          </SelectTrigger>
          <SelectContent side="top" className="bg-[#1A1A2E] border-[#4B5EFF]">
            <SelectGroup>
              <SelectLabel className="text-gray-400">Yêu cầu</SelectLabel>
              {Object.entries(templates).map(([templateId, template]) => (
                <SelectItem key={templateId} value={templateId} className="text-gray-200 hover:bg-[#4B5EFF] hover:text-white">
                  {templateId === 'auto-developer' ? (
                    <div className="flex items-center space-x-2">
                      <Sparkles
                        className="flex text-[#a1a1aa]"
                        width={14}
                        height={14}
                      />
                      <span>{template.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Image
                        className="flex"
                        src={`/thirdparty/templates/${templateId}.svg`}
                        alt={templateId}
                        width={14}
                        height={14}
                      />
                      <span>{template.name}</span>
                    </div>
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col w-full sm:w-auto">
        <Select
          name="languageModel"
          defaultValue={languageModel.model}
          onValueChange={(e) => onLanguageModelChange({ model: e })}
        >
          <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-2 py-1 h-8 text-xs bg-[#1A1A2E] text-gray-200 hover:bg-[#4B5EFF] transition-colors w-full sm:w-auto">
            <SelectValue placeholder="Mô hình ngôn ngữ" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A2E] border-[#4B5EFF]">
            {Object.entries(
              Object.groupBy(models, ({ provider }) => provider),
            ).map(([provider, models]) => (
              <SelectGroup key={provider}>
                <SelectLabel className="text-gray-400">{provider}</SelectLabel>
                {models?.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="text-gray-200 hover:bg-[#4B5EFF] hover:text-white">
                    <div className="flex items-center space-x-2">
                      <Image
                        className="flex"
                        src={`/thirdparty/logos/${model.providerId}.svg`}
                        alt={model.provider}
                        width={14}
                        height={14}
                      />
                      <span>{model.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
