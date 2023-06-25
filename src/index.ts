import { clearCache, loadApiDocs } from './file'
import dotenv from 'dotenv'
import { generateService } from './service'
import { generateType } from './convert'
import fs from 'fs-extra'

async function main() {
  dotenv.config()
  const { data } = await loadApiDocs()
  const { definitions, paths, tags, basePath } = data

  await clearCache(process.env.TYPE_PATH!)
  const types = generateType(definitions)

  const paramsTypes = await generateService(basePath, paths, tags)
  await fs.writeFile(process.env.TYPE_PATH! + '/typing.ts', paramsTypes.join('\n\n') + types.join('\n\n'))
}

main()
