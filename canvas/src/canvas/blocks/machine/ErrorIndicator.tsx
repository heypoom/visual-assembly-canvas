import { MachineError, errors } from "../../../types/MachineState"

const EMPTY_PROGRAM = "EmptyProgram"

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
        <strong>
          <code>{JSON.stringify(error.ExecutionFailed.error, null, 2)}</code>
        </strong>
      </pre>
    )
  }

  if (errors.cannotParse(error)) {
    const reason = error.CannotParse.error

    // The user has not written any program yet.
    if (reason === EMPTY_PROGRAM) return null

    return (
      <pre>
        Syntax is incorrect:{" "}
        <strong>
          <code>{JSON.stringify(error.CannotParse.error, null, 2)}</code>
        </strong>
      </pre>
    )
  }

  return <pre>{JSON.stringify(error, null, 2)}</pre>
}
