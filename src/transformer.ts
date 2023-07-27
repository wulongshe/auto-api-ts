import { ApiDocs, DefinitionItem, Definitions, MethodType, Parameter, PathItem, Paths, Property, Tag } from './io'

export interface TransformedApiDocs {
  name: string
  models: TransformedModel[]
  basePath: string
  tags: TransformedTag[]
}

export interface TransformedModel {
  name: string
  props: TransformedProp[]
  description?: string
}

export interface TransformedTag {
  name: string
  description: string
  apis: TransformedApi[]
}

export interface TransformedApi {
  tag: string
  id: string
  name: string
  path: string
  description?: string
  method: MethodType
  modelNames: string[]
  models?: TransformedModel[]
  body?: string
  query?: string
  paths?: TransformedProp[]
  response?: string
}

export interface TransformedProp {
  key: string
  required: boolean
  value: string
  description?: string
}

export const convertTypeMap: Record<string, string> = {
  number: 'number',
  integer: 'number',
  string: 'string',
  object: 'object',
  boolean: 'boolean',
}

export function capitalizedWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function trim(str: string, ch: string): string {
  return str.replace(new RegExp(`^${ch}+|${ch}+$`, 'g'), '')
}

export function transformModelName(name: string): string {
  return trim(name.replace(/[«»\?\~\!\@\#\$\%\^\&\*\-\+\(\)\.\{\}\[\]\<\>\;\/\\\s,（）【】，！；]+/g, '_'), '_')
}

export function transformRefType(ref: string): string {
  return transformModelName(ref.split('/').pop() || '')
}

export function transformArrayType(prop: Property) {
  return prop.items ? `${transformType(prop.items)}[]` : '[]'
}

export function transformType(prop: Property): string {
  return prop.type
    ? prop.type === 'array'
      ? transformArrayType(prop)
      : convertTypeMap[prop.type]
    : prop.$ref
    ? transformRefType(prop.$ref)
    : ''
}

export function transformProperty(key: string, prop: Property): TransformedProp {
  return {
    key,
    required: false,
    value: transformType(prop),
    description: prop.description,
  }
}

export function transformModel(name: string, definition: DefinitionItem): TransformedModel {
  return {
    name: transformModelName(name),
    description: definition.title,
    props: Object.entries(definition.properties || {}).map(([name, prop]) => transformProperty(name, prop)),
  }
}

export function transformModels(definitions: Definitions): TransformedModel[] {
  return Object.entries(definitions).map(([name, definition]) => transformModel(name, definition))
}

export function transformParameter(param: Parameter): TransformedProp {
  return {
    key: param.name,
    required: param.required,
    value: param.type ? transformType(param) : param.schema ? transformType(param.schema) : '',
    description: param.description,
  }
}

export interface TransformedParams {
  body?: string
  query?: TransformedModel
  paths?: TransformedProp[]
}

export function transformParams(name: string, parameters: Parameter[]): TransformedParams {
  let body: string | undefined = undefined
  const query: TransformedModel = { name: `${name}Params`, props: [] }
  const paths: TransformedProp[] = []
  parameters.forEach((param) => {
    const paramType = transformParameter(param)
    switch (param.in) {
      case 'body':
        body = paramType.value
        break
      case 'query':
        query.props.push(paramType)
        break
      case 'path':
        paths.push(paramType)
        break
    }
  })
  return {
    query: query.props.length ? query : void 0,
    body,
    paths: paths.length ? paths : void 0,
  }
}

export function transformDocumentName({ basePath = '', info: { title } }: ApiDocs): string {
  const plist = basePath.replace(/[\{\}]/g, '').split(/[\/\.]/)
  return [title, ...plist.reverse()].filter(Boolean).map(capitalizedWord).join('')
}

export function transformApiName(path: string, method: string): string {
  const plist = path.replace(/[\{\}]/g, '').split(/[\/\.\-]/)
  plist.push(method)
  return plist.filter(Boolean).map(capitalizedWord).join('')
}

export function transformApiPath(path: string) {
  return path.replace(/\{(.*)\}/g, '$$$&')
}

export function transformApi(path: string, pathItem: PathItem): TransformedApi {
  const modelNames: string[] = []

  const [method, methodItem] = Object.entries(pathItem)[0]
  const { tags, description, operationId, summary, parameters, responses } = methodItem

  const name = transformApiName(path, method)
  const { body, query, paths } = transformParams(name, parameters || [])

  // 请求type
  const bodyType = body?.replace(/[\[\]]/g, '')
  if (bodyType && !Object.values(convertTypeMap).includes(bodyType)) {
    modelNames.push(bodyType)
  }
  if (query) {
    modelNames.push(query.name)
  }

  // 响应type
  const response = transformType(responses['200'].schema || {})
  const resType = response.replace(/[\[\]]/g, '')
  if (resType && !Object.values(convertTypeMap).includes(resType)) {
    modelNames.push(resType)
  }

  return {
    id: operationId,
    tag: tags[0],
    name,
    path: transformApiPath(path),
    description: description || summary,
    method: method as MethodType,
    modelNames,
    models: query ? [query] : [],
    body,
    query: query?.name,
    paths,
    response,
  }
}

export function transformApis(paths: Paths): [Record<string, TransformedApi[]>, TransformedModel[]] {
  const models: TransformedModel[] = []
  const apis = Object.entries(paths)
    .map(([path, pathItem]) => transformApi(path, pathItem || {}))
    .reduce((acc, api) => {
      api.models && models.push(...api.models)
      ;(acc[api.tag] ??= []).push({ ...api, models: void 0 })
      return acc
    }, {} as Record<string, TransformedApi[]>)
  return [apis, models]
}

export function transformTags(tags: Tag[], apis: Record<string, TransformedApi[]>): TransformedTag[] {
  const newApis = { ...apis }
  const newTags: TransformedTag[] = []
  tags.forEach((tag) => {
    const desc = tag.description.replace(/[\s*]/g, '')
    newTags.push({ name: desc, description: tag.name, apis: newApis[tag.name] || [] })
    delete newApis[tag.name]
  })
  newTags.push(...Object.entries(newApis).map(([name, apis]) => ({ name, description: name, apis })))
  return newTags
}

export function transformer(apiDocs: ApiDocs): TransformedApiDocs {
  const { basePath = '', tags = [], paths = {}, definitions = {} } = apiDocs
  const [apis, models] = transformApis(paths)
  return {
    name: transformDocumentName(apiDocs),
    models: [...models, ...transformModels(definitions)],
    tags: transformTags(tags, apis),
    basePath,
  }
}
