import path from 'path'
import { generator } from './generator'
import { ApiDocs, clearCache, loadApiDocs, writeFile } from './io'
import { transformer } from './transformer'

export interface Config {
  BASE_URL: string
  API_VERSION: string
  COOKIE: string
  OUTPUT: string
  IMPORT: string
}

export function compiler(input: ApiDocs, impReqPath: string): Record<string, string> {
  const transformedApiDocs = transformer(input)
  const codes = generator(transformedApiDocs, impReqPath)
  return codes
}

export async function build(config: Config) {
  const apiDocs = await loadApiDocs(config)
  const codes = compiler(apiDocs.data, config.IMPORT)
  await clearCache(config.OUTPUT)
  await Promise.all(
    Object.entries(codes).map(([name, code]) => writeFile(path.posix.join(config.OUTPUT, name + '.ts'), code + '\n')),
  )
  console.log('> build success🎉')
}
