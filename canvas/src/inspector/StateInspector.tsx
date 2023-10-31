import { useStore } from "@nanostores/react"
import { $output } from "../store/results"

export const StateInspector = () => {
  const output = useStore($output)

  return (
    <div>
      <code>{JSON.stringify(output, null, 2)}</code>
    </div>
  )
}
