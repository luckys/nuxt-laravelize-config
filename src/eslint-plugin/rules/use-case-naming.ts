import { createRule } from '../utils/createRule'
import { isInLayer } from '../utils/pathClassifier'
import { getExportedClasses } from '../utils/astHelpers'

const USE_CASE_PATTERN = /^[A-Z][A-Za-z0-9]+(?:er|or)$/

export const useCaseNaming = createRule({
  name: 'use-case-naming',
  meta: {
    type: 'problem',
    docs: { description: 'Use cases follow {Aggregate}{Action}er naming (e.g., InvoiceCreator, UserFinder).' },
    schema: [],
    messages: {
      badName: 'Use case class "{{name}}" must match {Aggregate}{Action}er (e.g., InvoiceCreator, UserFinder).',
    },
  },
  defaultOptions: [],
  create(context) {
    if (!isInLayer(context.filename, 'application')) return {}
    return {
      Program(program) {
        for (const cls of getExportedClasses(program)) {
          const name = cls.id?.name
          if (name === undefined) continue
          if (!USE_CASE_PATTERN.test(name)) {
            context.report({ node: cls, messageId: 'badName', data: { name } })
          }
        }
      },
    }
  },
})
