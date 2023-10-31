import { MachineError, errors } from "../../../types/MachineState"

export const ErrorIndicator = ({ error }: { error: MachineError }) => {
  if (errors.executionCycleExceeded(error)) {
    return <pre>Execution cycle exceeded.</pre>
  }

  if (errors.messageNeverReceived(error)) {
    return <pre>Machine is expecting a message which never arrives.</pre>
  }

  if (errors.executionFailed(error)) {
    return (
      <pre>
        Your program produced an error:{" "}
        {JSON.stringify(error.ExecutionFailed.error, null, 2)}
      </pre>
    )
  }

  if (errors.cannotParse(error)) {
    return (
      <pre>
        Syntax is incorrect: {JSON.stringify(error.CannotParse.error, null, 2)}
      </pre>
    )
  }

  return <pre>{JSON.stringify(error, null, 2)}</pre>
}
