import { ContextMenu } from "@radix-ui/themes"

interface Props {
  show: boolean
  toggle: () => void
  children: React.ReactNode
}

export const RightClickMenu = (props: Props) => (
  <ContextMenu.Root>
    <ContextMenu.Trigger>{props.children}</ContextMenu.Trigger>

    <ContextMenu.Content>
      <ContextMenu.Item onClick={props.toggle}>
        {props.show ? "Hide" : "Show"} Settings
      </ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
)
