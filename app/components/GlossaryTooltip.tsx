'use client'

import { HelpCircle } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'

interface GlossaryTooltipProps {
  term: string
  children: React.ReactNode
}

export default function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help group">
            {children}
            <HelpCircle className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors" />
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="max-w-xs bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-xl px-4 py-3 shadow-2xl z-50 leading-relaxed"
            sideOffset={6}
          >
            {term}
            <Tooltip.Arrow className="fill-gray-700" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
