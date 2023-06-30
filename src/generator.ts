import path from 'path'
import { TransformedModel, TransformedApiDocs, TransformedApi, TransformedProp, TransformedTag } from './transformer'

export const UNKNOWN = 'unknown'

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
  const apiPath = `\`${path.posix.join(basePath, api.path)}\``
  const parameters = [apiPath, body && 'data', query && '{ params }'].filter(Boolean).join(', ')
  return `${generateDescription(description)}
export const ${name} = (${properties}): Promise<${response || UNKNOWN}> => request.${method}(${parameters})`
}

export function generateService(tag: TransformedTag, basePath: string, importRequest: string): string {
  const desc = generateDescription(tag.description)
  const imports = [desc, importRequest, generateImports([...new Set(tag.apis.flatMap((api) => api.modelNames))])]
  const services = tag.apis.map((api) => generateApi(api, basePath))
  return [imports.filter(Boolean).join('\n'), ...services].join('\n\n')
}

export function generator(ast: TransformedApiDocs, importRequest: string): Record<string, string> {
  const output: Record<string, string> = { models: generateModels(ast.models) }
  return ast.tags.reduce(
    (acc, tag) => ((acc[tag.name] = generateService(tag, ast.basePath, importRequest)), acc),
    output,
  )
}
