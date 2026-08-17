/**
 * Names a JavaScript module exports, as far as a line-anchored scan can tell.
 *
 * Kept separate from `scope-guard.mjs` so the part with the judgement in it is
 * unit-tested while the git plumbing around it stays plumbing.
 *
 * Recognises `export` statements written at the start of a line, which is every
 * export in this repository. A name exported from inside a block or a template
 * literal is not seen. `export * from` cannot be enumerated without resolving
 * the target, so it is returned in `opaque` rather than guessed at.
 */
export function exportedNames(source) {
  const names = new Set()
  const opaque = []

  // `export { a, b as c }` and `export { a } from './x.js'`, possibly wrapped
  // across several lines.
  for (const [, inner] of source.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const clause of inner.split(',')) {
      const parts = clause.trim().split(/\s+as\s+/)
      const exported = (parts[parts.length - 1] || '').trim()
      if (exported && exported !== 'default') names.add(exported)
    }
  }

  // `export function f`, `export async function f`, `export class C`,
  // `export const x`, `export let x`, `export var x`.
  const declaration = /^export\s+(?:async\s+)?(?:function\*?|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm
  for (const [, name] of source.matchAll(declaration)) names.add(name)

  if (/^export\s+default\b/m.test(source)) names.add('default')
  for (const [line] of source.matchAll(/^export\s+\*.*$/gm)) opaque.push(line.trim())

  return { names, opaque }
}
