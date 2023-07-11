import path from 'path'
import { generator } from './generator'
import fs from 'fs-extra'
import { ApiDocs, clearCache, loadApiDocs, loadSwaggerResources, writeFile } from './io'
import { transformer } from './transformer'

export interface Config {
  BASE_URL: string
  API_VERSION?: string
  COOKIE: string
  OUTPUT: string
  IMPORT: string
  PREFIX?: string
}

export function compiler(input: ApiDocs, impReqPath: string, prefix?: string): [string, Record<string, string>] {
  const transformedApiDocs = transformer(input)
  const codes = generator(transformedApiDocs, impReqPath, prefix)
  return [transformedApiDocs.name, codes]
}

export async function build(config: Config) {
  const locations: string[] = []
  if (config.API_VERSION) {
    locations.push(config.API_VERSION)
  } else {
    const swaggerResources = await loadSwaggerResources(config)
    locations.push(...swaggerResources.data.map((item) => item.location))
  }
  await clearCache(config.OUTPUT)
  await Promise.all(
    locations.map(async (location) => {
      const apiDocs = await loadApiDocs(config, location)
      const [docName, codes] = compiler(apiDocs.data, config.IMPORT, config.PREFIX)
      const filePath = path.posix.join(config.OUTPUT, docName)
      await fs.mkdir(filePath)
      await Promise.all(
        Object.entries(codes).map(async ([name, code]) => {
          const fileName = path.posix.join(filePath, name + '.ts')
          await writeFile(fileName, code + '\n')
          console.log('> write file: ' + fileName)
        }),
      )
      console.log('> generate api document ' + docName + ' success🎉')
    }),
  )
  console.log('> all build success🎉')
}
