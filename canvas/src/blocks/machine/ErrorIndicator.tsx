import { CanvasError, canvasErrors, runErrors } from "../../types/MachineState"

const EMPTY_PROGRAM = "EmptyProgram"

export const ErrorIndicator = ({ error }: { error: CanvasError }) => {
  if (canvasErrors.disconnectedPort(error)) {
    const port = error.DisconnectedPort.port?.port

    return (
      <pre>
        Port {port} is disconnected. Make sure port {port} is wired to another
        block.
      </pre>
    )
  }

  if (canvasErrors.machineError(error)) {
    const cause = error.MachineError.cause

    if (runErrors.executionCycleExceeded(cause)) {
      return <pre>Your program exceeds the execution cycle quota.</pre>
    }

    if (runErrors.executionTimeExceeded(cause)) {
      return <pre>Your program exceeds the runtime quota.</pre>
    }

    if (runErrors.messageNeverReceived(cause)) {
      return (
        <pre className="text-purple-11">
          Machine is waiting for a message which never arrives.
        </pre>
      )
    }

    if (runErrors.executionFailed(cause)) {
      return (
        <pre>
          Your program produced an error:{" "}
          <strong>
            <code>{JSON.stringify(cause.ExecutionFailed.error, null, 2)}</code>
          </strong>
        </pre>
      )
    }

    if (runErrors.cannotParse(cause)) {
      const reason = cause.CannotParse.error

      // The user has not written any program yet.
      if (reason === EMPTY_PROGRAM) return null

      return (
        <pre>
          Syntax is incorrect:{" "}
          <strong>
            <code>{JSON.stringify(cause.CannotParse.error, null, 2)}</code>
          </strong>
        </pre>
      )
    }
  }

  return <pre>{JSON.stringify(error, null, 2)}</pre>
}
