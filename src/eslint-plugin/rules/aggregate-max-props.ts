import { createRule } from '../utils/createRule'
import { isInLayer } from '../utils/pathClassifier'
import { classHasMethod, countInstanceProperties, getExportedClasses } from '../utils/astHelpers'

const DEFAULT_MAX = 4

export const aggregateMaxProps = createRule({
  name: 'aggregate-max-props',
  meta: {
    type: 'problem',
    docs: { description: 'Aggregates must have at most N instance properties (default 4).' },
    schema: [
      {
        type: 'object',
        properties: {
          max: { type: 'number', minimum: 1 },
          marker: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooMany: 'Aggregate "{{name}}" has {{count}} properties (max {{max}}). Extract a value object or split.',
    },
  },
  defaultOptions: [{ max: DEFAULT_MAX, marker: 'toPrimitives' }],
  create(context, [options]) {
    if (!isInLayer(context.filename, 'domain')) return {}
    const max = options.max ?? DEFAULT_MAX
    const marker = options.marker ?? 'toPrimitives'
    return {
      Program(program) {
        for (const cls of getExportedClasses(program)) {
          if (cls.id === null) continue
          if (!classHasMethod(cls, marker)) continue
          const count = countInstanceProperties(cls)
          if (count > max) {
            context.report({
              node: cls,
              messageId: 'tooMany',
              data: { name: cls.id.name, count, max },
            })
          }
        }
      },
    }
  },
})
