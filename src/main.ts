import * as core from '@actions/core'
import {unlinkSync, writeFileSync, readFileSync} from 'fs'
import {execSync} from 'child_process'
import {exec} from '@actions/exec'

export async function execWithOutput(
  command: string,
  args?: string[],
  options?: {ignoreReturnCode?: boolean; cwd?: string}
) {
  let myOutput = ''
  let myError = ''

  return {
    code: await exec(command, args, {
      listeners: {
        stdout: (data: Buffer) => {
          myOutput += data.toString()
        },
        stderr: (data: Buffer) => {
          myError += data.toString()
        }
      },

      ...options
    }),
    stdout: myOutput,
    stderr: myError
  }
}

async function run(): Promise<void> {
  try {
    core.debug('Running "Release Canary Version" action...')
    const token = core.getInput('npm-token')
    const script = core.getInput('npm-script')
    const changesets = core.getInput('changesets')

    if (!token) {
      core.info('Skipping... Missing npm-token input')
      return
    }

    if (!script) {
      throw new Error('npm-script input is missing')
    }

    if (changesets === 'true') {
      let releasedPackages: {name: string; version: string}[] = []
      let [publishCommand, ...publishArgs] = script.split(/\s+/)
      let changesetPublishOutput = await execWithOutput(
        publishCommand,
        publishArgs,
        {cwd: process.cwd()}
      )

      let newTagRegex = /New tag:\s+(@[^/]+\/[^@]+|[^/]+)@([^\s]+)/

      for (let line of changesetPublishOutput.stdout.split('\n')) {
        let match = line.match(newTagRegex)
        if (match === null) {
          continue
        }

        releasedPackages.push({
          name: match[1],
          version: match[2]
        })
      }

      core.setOutput('released', 'true')
      core.setOutput(
        'changesetsPublishedPackages',
        releasedPackages.map(t => `${t.name}@${t.version}`).join('\n')
      )
    } else {
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
    }
  } catch (error) {
    core.setFailed(`Failed to release canary version: ${error.message}`)
  }
}

run()
