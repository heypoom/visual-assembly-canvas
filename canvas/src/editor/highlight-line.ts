import {
  EditorView,
  StateField,
  StateEffect,
  Decoration,
} from "@uiw/react-codemirror"

export const addLineHighlight = StateEffect.define<number>()

const lineHighlightMark = Decoration.line({
  attributes: { style: "background-color: #d2ffff" },
})

export const lineHighlighter = StateField.define({
  create() {
    return Decoration.none
  },
  update(lines, transaction) {
    lines = lines.map(transaction.changes)
    for (const effect of transaction.effects) {
      if (effect.is(addLineHighlight)) {
        lines = Decoration.none
        lines = lines.update({ add: [lineHighlightMark.range(effect.value)] })
      }
    }
    return lines
  },

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  provide: (field) => EditorView.decorations.from(field),
})
