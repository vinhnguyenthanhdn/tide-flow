#!/usr/bin/env node
/**
 * Fail a pull request that removes an exported name from `src/` without naming
 * it in the pull request description.
 *
 * `src/tide-math.js` is the harmonic engine and `src/tide-constituents.js` is
 * the data it runs on. Both are imported by the page, by the unit tests and by
 * anyone who vendored this repository, so an export that quietly disappears
 * breaks callers that never see this pull request. Removing one is allowed —
 * saying nothing about it is not.
 *
 * Usage:
 *
 *     PR_BODY="<pull request description>" node scripts/scope-guard.mjs <base-sha> <head-sha>
 *
 * Exit code 0 when every removed export is mentioned in PR_BODY, 1 otherwise.
 */

import { execFileSync } from 'node:child_process'
import { exportedNames } from './exported-names.mjs'

const WATCHED_PREFIX = 'src/'

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' })
}

/** File content at `ref`, or null when the file does not exist there. */
function blob(ref, path) {
  try {
    return git('show', `${ref}:${path}`)
  } catch {
    return null
  }
}

function changedSourceFiles(base, head) {
  const out = git('diff', '--name-only', `${base}...${head}`, '--', `${WATCHED_PREFIX}*.js`)
  return out.split('\n').filter(line => line.trim() !== '')
}

function main(argv) {
  const [base, head] = argv
  if (!base || !head) {
    console.log('usage: PR_BODY=... node scripts/scope-guard.mjs <base-sha> <head-sha>')
    return 1
  }
  const body = process.env.PR_BODY || ''

  const removals = []
  for (const path of changedSourceFiles(base, head)) {
    const before = blob(base, path)
    if (before === null) continue // new file; nothing can have been removed from it
    const after = blob(head, path)

    const beforeScan = exportedNames(before)
    for (const line of beforeScan.opaque) {
      console.log(`scope-guard: ${path} has \`${line}\` — its names are not enumerated.`)
    }

    const gone = new Set(beforeScan.names)
    if (after !== null) for (const name of exportedNames(after).names) gone.delete(name)
    for (const name of [...gone].sort()) removals.push({ path, name })
  }

  if (removals.length === 0) {
    console.log('scope-guard: no export removed from src/.')
    return 0
  }

  const unexplained = removals.filter(({ name }) => !body.includes(name))
  for (const { path, name } of removals) {
    const state = unexplained.some(r => r.path === path && r.name === name)
      ? 'NOT MENTIONED'
      : 'mentioned'
    console.log(`scope-guard: ${path} removes ${name} -- ${state} in the PR description.`)
  }

  if (unexplained.length === 0) {
    console.log(`scope-guard: all ${removals.length} removal(s) are named in the PR description.`)
    return 0
  }

  console.log()
  console.log('A pull request may remove an export, but the description has to say so.')
  console.log('Either restore the exports listed as NOT MENTIONED, or name each of them in')
  console.log('the pull request description together with the reason it is going away.')
  return 1
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)))
}
