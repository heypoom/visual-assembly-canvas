import { createTheme } from "@uiw/codemirror-themes"
import { tags as t } from "@lezer/highlight"
import { slateDark } from "@radix-ui/colors"

const BG_DARK = slateDark.slate1
const FG_TEXT = "#ffffff"
const BG_HIGHLIGHT = slateDark.slate2
const BG_SELECT = slateDark.slate3
const FG_CARET = "#ffffff"
const FG_COMMENT = "#6272a4"

const PINK = "#ff79c6"
const PURPLE = "#bd93f9"
const WHITE = "#f8f8f2"
const YELLOW = "#f1fa8c"
const CYAN = "#8be9fd"
const GREEN = "#50fa7b"

export const cmTheme = createTheme({
  theme: "dark",

  settings: {
    background: BG_DARK,
    backgroundImage: "",
    foreground: FG_TEXT,
    caret: FG_CARET,
    selection: BG_SELECT,
    selectionMatch: BG_SELECT,
    lineHighlight: BG_HIGHLIGHT,
    gutterBackground: BG_DARK,
    gutterForeground: BG_DARK,
    fontFamily: "IBM Plex Mono, monospace",
  },

  styles: [
    { tag: t.keyword, color: PINK },
    { tag: t.number, color: PURPLE },
    { tag: t.variableName, color: WHITE },
    { tag: t.labelName, color: CYAN },
    { tag: t.string, color: YELLOW },
    { tag: t.definitionKeyword, color: GREEN },

    { tag: t.comment, color: FG_COMMENT },
    { tag: t.lineComment, color: FG_COMMENT },
  ],
})
