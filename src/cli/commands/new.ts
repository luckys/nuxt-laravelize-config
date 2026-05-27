import { defineCommand } from 'citty'

import { newAggregateCommand } from './new-aggregate'
import { newContextCommand } from './new-context'
import { newControllerCommand } from './new-controller'
import { newFactoryCommand } from './new-factory'
import { newListenerCommand } from './new-listener'
import { newPolicyCommand } from './new-policy'
import { newRepositoryCommand } from './new-repository'
import { newResourceCommand } from './new-resource'
import { newSeederCommand } from './new-seeder'
import { newUseCaseCommand } from './new-use-case'
import { newValueObjectCommand } from './new-value-object'

export const newCommand = defineCommand({
  meta: { name: 'new', description: 'Scaffold DDD artefacts (context, aggregate, use case, controller, ...).' },
  subCommands: {
    context: newContextCommand,
    aggregate: newAggregateCommand,
    'value-object': newValueObjectCommand,
    repository: newRepositoryCommand,
    'use-case': newUseCaseCommand,
    controller: newControllerCommand,
    resource: newResourceCommand,
    listener: newListenerCommand,
    policy: newPolicyCommand,
    seeder: newSeederCommand,
    factory: newFactoryCommand,
  },
})
