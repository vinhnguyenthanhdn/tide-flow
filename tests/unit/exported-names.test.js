import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { exportedNames } from '../../scripts/exported-names.mjs'

describe('exportedNames', () => {
  test('reads every export form the codebase uses', () => {
    const source = [
      "export { computeTideLevel } from './tide-math.js'",
      'export function findLocalMaxima() {}',
      'export async function loadStation() {}',
      'export class Station {}',
      'export const LOCATIONS = []',
      'export let cursor = 0',
      'export var legacy = 1',
      'export {',
      '  findLocalMinima,',
      '  toLocalISODate,',
      '}',
      'export default function () {}',
    ].join('\n')

    const { names } = exportedNames(source)
    expect([...names].sort()).toEqual([
      'LOCATIONS',
      'Station',
      'computeTideLevel',
      'cursor',
      'default',
      'findLocalMaxima',
      'findLocalMinima',
      'legacy',
      'loadStation',
      'toLocalISODate',
    ])
  })

  test('records the exported alias rather than the local name', () => {
    const { names } = exportedNames("export { internal as computeTideLevel } from './x.js'")
    expect([...names]).toEqual(['computeTideLevel'])
  })

  test('does not treat a default re-export as a named export', () => {
    const { names } = exportedNames("export { default } from './x.js'")
    expect(names.size).toBe(0)
  })

  test('ignores names that are only imported or only local', () => {
    const source = [
      "import { TIDAL_CONSTITUENTS } from './tide-constituents.js'",
      'function helper() {}',
      'const local = 1',
      'export function visible() {}',
    ].join('\n')

    expect([...exportedNames(source).names]).toEqual(['visible'])
  })

  test('reports a star re-export instead of guessing its names', () => {
    const { names, opaque } = exportedNames("export * from './tide-math.js'")
    expect(names.size).toBe(0)
    expect(opaque).toEqual(["export * from './tide-math.js'"])
  })

  // The guard is only as good as the set it produces, so pin it against the
  // real modules. Dropping an export without updating this list fails here as
  // well as in CI, which is the point: two independent things have to be
  // edited before a public name can disappear quietly.
  test('pins the exported surface of src/', () => {
    const read = name => readFileSync(resolve(process.cwd(), 'src', name), 'utf8')

    expect([...exportedNames(read('tide-math.js')).names].sort()).toEqual([
      'computeHighTideTimes',
      'computeTideLevel',
      'findLocalMaxima',
      'findLocalMinima',
      'generateHourlyData',
      'hoursFromEpoch',
      'toLocalISODate',
    ])
    expect([...exportedNames(read('tide-constituents.js')).names]).toEqual(['TIDAL_CONSTITUENTS'])
    expect([...exportedNames(read('locations.js')).names]).toEqual(['LOCATIONS'])
  })
})
