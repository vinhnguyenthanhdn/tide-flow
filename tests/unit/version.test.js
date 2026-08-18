// The version in package.json and the newest released heading in CHANGELOG.md
// are both read as "the shipped version" — one by tooling, one by anyone reading
// the changelog — and nothing compared them, so a release could move one and
// leave the other behind with the suite still green. A declared value that no
// test reads is a claim nobody checked.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Resolved from the vitest root, not from import.meta.url: the jsdom
// environment hands the test module an http URL, and fileURLToPath rejects it.
const read = (name) => readFileSync(resolve(process.cwd(), name), 'utf8')

const pkgVersion = JSON.parse(read('package.json')).version
const releasedVersions = () =>
  [...read('CHANGELOG.md').matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((match) => match[1])

describe('version', () => {
  it('CHANGELOG.md has at least one released heading', () => {
    expect(releasedVersions().length).toBeGreaterThan(0)
  })

  it('package.json matches the newest released heading', () => {
    expect(pkgVersion).toBe(releasedVersions()[0])
  })
})
