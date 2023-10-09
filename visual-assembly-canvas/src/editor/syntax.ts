import {parser} from './syntax.grammar'

import {LRLanguage, LanguageSupport} from '@codemirror/language'

import {styleTags, tags as t} from '@lezer/highlight'

const VasmLR = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Identifier: t.variableName,
        StringDefinition: t.definitionKeyword,
        ValueDefinition: t.definitionKeyword,
        LabelDefinition: t.labelName,
        InstructionExpression: t.atom,
        Instruction: t.keyword,
        String: t.string,
        Value: t.number,
        LineComment: t.lineComment,
      }),
    ],
  }),
  languageData: {
    commentTokens: {line: ';'},
  },
})

export const vasmLanguage = new LanguageSupport(VasmLR)
