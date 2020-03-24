import * as core from '@actions/core'
import {unlinkSync, writeFileSync, readFileSync} from 'fs'
import {execSync} from 'child_process'

async function run(): Promise<void> {
  try {
    core.debug('Running "Release Canary Version" action...')
    const token = core.getInput('npm-token')
    const script = core.getInput('npm-script')

    if (!token) {
      core.info('Skipping... Missing npm-token input')
      return
    }

    if (!script) {
      throw new Error('npm-script input is missing')
    }

    try {
      unlinkSync('out.txt')
    } catch (e) {}

    writeFileSync('.npmrc', `//registry.npmjs.org/:_authToken=${token}`, {
      encoding: 'utf-8'
    })

    execSync(`npm run ${script} > out.txt`, {
      encoding: 'utf-8'
    })

    const output = readFileSync('out.txt', {
      encoding: 'utf-8'
    })

    const results = output.match(/=\> ([a-z0-9\.\-\+]+)/)

    if (!results) {
      throw new Error(
        `Failed to find a version number. Are you sure you're using lerna publish?`
      )
    }

    const version = results[1]

    core.setOutput('version', version)
    core.setOutput('released', 'true')
  } catch (error) {
    core.setFailed(`Failed to release canary version: ${error.message}`)
  }
}

run()
