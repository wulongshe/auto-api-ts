import { generator } from './generator'
import { ApiDocs, clearCache, loadApiDocs, writeTsFile } from './io'
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
  Object.entries(codes).forEach(([name, code]) => writeTsFile(config.OUTPUT, name, code))
}
