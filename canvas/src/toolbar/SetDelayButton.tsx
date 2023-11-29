import { useStore } from "@nanostores/react"
import { LapTimerIcon } from "@radix-ui/react-icons"
import { Dialog, Button, Flex, TextField } from "@radix-ui/themes"
import { useState } from "react"

import { $clock } from "../store/clock"

export const SetDelayButton = () => {
  const clock = useStore($clock)
  const [delay, setDelay] = useState(clock.delay.toString())

  const update = () => {
    const delayMs = parseInt(delay)
    if (isNaN(delayMs)) return

    $clock.setKey("delay", delayMs)
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button color="gray" variant="soft" className="font-semibold">
          <LapTimerIcon />
          {clock.delay === 0 ? "Delay" : `${clock.delay}ms`}
        </Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Set the delay duration</Dialog.Title>

        <Flex direction="column" gap="3">
          <TextField.Input
            value={delay}
            placeholder="40"
            min="0"
            max="2"
            onChange={(e) => setDelay(e.target.value)}
          />
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button
              variant="soft"
              color="green"
              onClick={() => $clock.setKey("delay", 0)}
            >
              Remove Delay
            </Button>
          </Dialog.Close>

          <Dialog.Close>
            <Button onClick={update}>Set Delay</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
