import { TextField } from "@radix-ui/themes"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

import { FieldGroup } from "@/blocks/components/Settings"
import { RadixSelect } from "@/ui"

interface Form {
  port: string
  channels: string
}

interface Data {
  port: number
  channels: number[]
}

interface Props extends Data {
  ports: string[]
  mode: "in" | "out"
  onChange: (data: Partial<Data>) => void
}

export function MidiTransportForm(props: Props) {
  const { onChange } = props

  const form = useForm<Form>({
    defaultValues: {
      port: props.port.toString(),
      channels: props.channels?.join(" "),
    },
    mode: "all",
  })

  const { register, control } = form

  useEffect(() => {
    form.setValue("port", props.port.toString())
  }, [form, props.port])

  const trigger = (e: { target: { name: string; value: string } }) => {
    switch (e.target.name) {
      case "port": {
        let port = parseInt(e.target.value)
        if (isNaN(port)) return

        if (port > 127) port = 127

        return onChange({ port })
      }

      case "channels": {
        const channels = e.target.value
          .split(" ")
          .map(Number)
          .filter((x: number) => !isNaN(x) && x > 0 && x < 128)

        return onChange({ channels })
      }
    }
  }

  const portOptions = props.ports.map((port, id) => ({
    label: port,
    value: id.toString(),
  }))

  const isOut = props.mode === "out"

  return (
    <>
      <FieldGroup name="Port">
        <Controller
          name="port"
          control={control}
          rules={{ onChange: trigger }}
          render={({ field }) => (
            <RadixSelect options={portOptions} {...field} />
          )}
        />
      </FieldGroup>

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
    </>
  )
}
