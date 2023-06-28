import path from 'path'
import { TransformedModel, TransformedApiDocs, TransformedApi, TransformedProp } from './transformer'

export const UNKNOWN = 'unknown'

export function generateImportRequest(impReqPath: string): string {
  return `import { request } from '${impReqPath}'`
}

export function generateImports(modelNames: string[]): string {
  return `import { ${modelNames.join(', ')} } from './models'`
}

export function generateDescription(description?: string): string {
  return description ? `/* ${description} */` : ''
}

export function generateIndent(indent: number): string {
  return ' '.repeat(indent)
}

export function generateProperty({ key, required, value, description }: TransformedProp): string {
  return `${key}${required ? ':' : '?:'} ${value || UNKNOWN} ${generateDescription(description)}`.trim()
}

export function generateModel(model: TransformedModel): string {
  const start = `export interface ${model.name} {`
  const end = `}`
  const props = model.props.map((prop) => generateIndent(2) + generateProperty(prop))
  return [start, ...props, end].join('\n')
}

export function generateModels(models: TransformedModel[]): string {
  return models.map(generateModel).join('\n\n')
}

export function generateApi(api: TransformedApi, basePath: string): string {
  const { name, description, response, method, body, query, paths = [] } = api
  const pathProps = paths.map(generateProperty)
  const properties = [body && `data: ${body}`, query && `params: ${query}`, ...pathProps].filter(Boolean).join(', ')
  const parameters = [body && 'data', query && '{ params }'].filter(Boolean).join(', ')
  const apiPath = `\`${path.posix.join(basePath, api.path)}\``
  return `${generateDescription(description)}
export const ${name} = (${properties}): Promise<${response || UNKNOWN}> => request.${method}(${apiPath}, ${parameters})`
}

export function generateService(apis: TransformedApi[], basePath: string, requestPath: string): string {
  const imports = [
    generateImportRequest(requestPath),
    generateImports([...new Set(apis.flatMap((api) => api.modelNames))]),
  ]
  const services = apis.map((api) => generateApi(api, basePath))
  return [imports.join('\n'), ...services].join('\n\n')
}

export function generator(ast: TransformedApiDocs, impReqPath: string): Record<string, string> {
  const output: Record<string, string> = { models: generateModels(ast.models) }
  return Object.entries(ast.tags).reduce(
    (acc, [tag, apis]) => ((acc[tag] = generateService(apis, ast.basePath, impReqPath)), acc),
    output,
  )
}
