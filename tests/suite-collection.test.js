import { describe, test, expect } from 'vitest'
import { readdirSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import config from '../vitest.config.js'

// This file sits at tests/, not tests/unit/. That is deliberate: under the old
// include list it would never have been collected, so the guard against
// uncollected test files was itself uncollectable. If this suite ever stops
// running, the config has regressed to naming directories.

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')

/** Every *.test.js under tests/, as repo-relative POSIX paths. */
function testFilesOnDisk() {
  const found = []

  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = resolve(directory, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.test.js')) {
        found.push(relative(repoRoot, full).split(sep).join('/'))
      }
    }
  }

  walk(here)
  return found.sort()
}

/**
 * A glob pattern as a RegExp, covering the two wildcards these patterns use.
 *
 * Deliberately hand-rolled rather than reaching for picomatch: it is present
 * in node_modules only as a transitive dependency of vitest, and a test that
 * guards the config should not itself depend on something nothing declares.
 */
function globToRegExp(pattern) {
  const source = pattern
    .split('**/')
    .map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))
    .join('(?:.*/)?')
  return new RegExp(`^${source}$`)
}

const matchesAny = (patterns, file) => patterns.some((p) => globToRegExp(p).test(file))

describe('suite collection', () => {
  const include = config.test.include
  const exclude = config.test.exclude
  const onDisk = testFilesOnDisk()

  test('the glob translation itself is right', () => {
    // A control: without this, a globToRegExp that matched everything would
    // make every assertion below pass for the wrong reason.
    expect(globToRegExp('tests/**/*.test.js').test('tests/unit/a.test.js')).toBe(true)
    expect(globToRegExp('tests/**/*.test.js').test('tests/a.test.js')).toBe(true)
    expect(globToRegExp('tests/**/*.test.js').test('tests/unit/a.spec.js')).toBe(false)
    expect(globToRegExp('tests/**/*.test.js').test('src/a.test.js')).toBe(false)
    expect(globToRegExp('tests/e2e/**').test('tests/e2e/tide-chart.spec.js')).toBe(true)
    expect(globToRegExp('tests/e2e/**').test('tests/unit/a.test.js')).toBe(false)
  })

  test('every test file on disk is collected', () => {
    // The property the old config broke. A file under tests/ that include does
    // not match is not a passing test -- it is a test nobody ran, and the run
    // reports success either way.
    const uncollected = onDisk.filter(
      (file) => !matchesAny(include, file) || matchesAny(exclude, file),
    )
    expect(uncollected).toEqual([])
  })

  test('collecting zero test files is impossible here, and would be a failure anyway', () => {
    // Two separate guarantees. This one is the floor: the walk must find
    // something, or an include typo turns the suite into a green no-op.
    expect(onDisk.length).toBeGreaterThan(0)
    // And vitest must not be configured to shrug at an empty collection. This
    // is vitest's default, pinned here because the whole point of the issue is
    // that a silent zero is indistinguishable from success.
    expect(config.test.passWithNoTests).toBe(false)
  })

  test('tests/e2e stays with Playwright', () => {
    // npm run test:e2e is the only thing that should run those, and they are
    // .spec.js rather than .test.js -- so assert the exclude directly rather
    // than relying on the extension to keep them out by accident.
    expect(matchesAny(exclude, 'tests/e2e/tide-chart.spec.js')).toBe(true)
    expect(matchesAny(exclude, 'tests/e2e/anything.test.js')).toBe(true)
  })

  test('include names no directory that is not there', () => {
    // tests/integration was in include and did not exist. A pattern that
    // matches nothing is the same drift as a file that matches nothing.
    const literalDirectories = include
      .map((pattern) => pattern.split('/**')[0])
      .filter((prefix) => !prefix.includes('*'))

    for (const directory of literalDirectories) {
      expect(() => readdirSync(resolve(repoRoot, directory))).not.toThrow()
    }
  })
})
