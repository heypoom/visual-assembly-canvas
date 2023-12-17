import { TextField } from "@radix-ui/themes"
import { useForm } from "react-hook-form"

import { FieldGroup } from "@/blocks/components/Settings"

interface Form {
  channels: string
}

interface Data {
  channels: number[]
}

interface Props extends Data {
  mode: "in" | "out"
  onChange: (data: Partial<Data>) => void
}

export function MidiTransportForm(props: Props) {
  const { onChange } = props

  const form = useForm<Form>({
    defaultValues: {
      channels: props.channels?.join(" "),
    },
    mode: "all",
  })

  const { register } = form

  const trigger = (e: { target: { name: string; value: string } }) => {
    switch (e.target.name) {
      case "channels": {
        const channels = e.target.value
          .split(" ")
          .map(Number)
          .filter((x: number) => !isNaN(x) && x > 0 && x < 128)

        return onChange({ channels })
      }
    }
  }

  const isOut = props.mode === "out"

  return (
    <FieldGroup name="Channels">
      <TextField.Input
        size="1"
        placeholder="0 1 2"
        {...register("channels", {
          onChange: trigger,
          ...(isOut && { min: 0, max: 127 }),
        })}
        {...(isOut && { type: "number" })}
      />
    </FieldGroup>
  )
}
