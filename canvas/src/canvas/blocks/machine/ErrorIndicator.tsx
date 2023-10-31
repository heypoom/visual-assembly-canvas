import { MachineError } from "../../../types/MachineState"

export const ErrorIndicator = ({ error }: { error: MachineError }) => {
  if ("ExecutionCycleExceeded" in error) {
    return <pre>Execution cycle exceeded.</pre>
  }

  if ("HangingAwaits" in error) {
    return <pre>Machine is expecting a message which never arrives.</pre>
  }

  if ("ExecutionFailed" in error) {
    return (
      <pre>
        Your program produced an error:{" "}
        {JSON.stringify(error.ExecutionFailed.error, null, 2)}
      </pre>
    )
  }

  if ("CannotParse" in error) {
    return (
      <pre>
        Syntax is incorrect: {JSON.stringify(error.CannotParse.error, null, 2)}
      </pre>
    )
  }

  return <pre>{JSON.stringify(error, null, 2)}</pre>
}
