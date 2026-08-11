import { copyFile, cp, mkdir, rm, writeFile } from 'node:fs/promises'

const projectRoot = new URL('../', import.meta.url)
const siteDir = new URL('../_site/', import.meta.url)

await rm(siteDir, { recursive: true, force: true })
await mkdir(siteDir, { recursive: true })

for (const file of ['index.html', 'app.js', 'THIRD_PARTY_NOTICES.md']) {
  await copyFile(new URL(file, projectRoot), new URL(file, siteDir))
}

await cp(new URL('assets', projectRoot), new URL('assets', siteDir), { recursive: true })

await mkdir(new URL('src/', siteDir), { recursive: true })
for (const file of ['locations.js', 'tide-constituents.js', 'tide-math.js']) {
  await copyFile(new URL(`src/${file}`, projectRoot), new URL(`src/${file}`, siteDir))
}

await mkdir(new URL('docs/assets/', siteDir), { recursive: true })
await cp(new URL('docs/assets/', projectRoot), new URL('docs/assets/', siteDir), { recursive: true })
await writeFile(new URL('.nojekyll', siteDir), '')
