#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'

import { newCommand } from './commands/new'
import { skillsCommand } from './commands/skills'

const main = defineCommand({
  meta: {
    name: 'laravelize',
    description: 'Tooling CLI for nuxt-laravelize projects: scaffolding and skills management.',
  },
  subCommands: {
    new: newCommand,
    skills: skillsCommand,
  },
})

runMain(main)
