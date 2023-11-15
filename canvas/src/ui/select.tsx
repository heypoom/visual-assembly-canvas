import { Select } from "@radix-ui/themes"
import React from "react"

interface Props {
  options: { value: string; label: string }[]

  value: string
  onChange: (value: string) => void
  onBlur: () => void

  name?: string
  disabled?: boolean | undefined
}

export const RadixSelect = React.forwardRef((props: Props, ref) => {
  const { options } = props

  return (
    <Select.Root size="1" onValueChange={props.onChange} value={props.value}>
      <Select.Trigger ref={ref as any} />

      <Select.Content>
        {options.map((option) => (
          <Select.Item value={option.value} key={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
})
