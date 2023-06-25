import { DefinitionsItem, IntegratedType, Vo, VoProp, convertTypeEnum } from './types'
import { joinFilter } from './utils'
import { ConvertItem } from './types'

export function convertPath(path: string) {
  return path
    .split('/')
    .map((item) => {
      if (item.indexOf('{') >= 0) {
        return '$' + item
      }
      return item
    })
    .join('/')
}

export function convertRefType(str: string): string | undefined {
  return str.split('/')?.pop()?.replace('«', '')?.replace('»', '')
}

export function convertType(typeObj?: IntegratedType | VoProp): string | undefined {
  if (typeObj?.type) {
    const typeTmp = convertTypeEnum[typeObj.type as keyof typeof convertTypeEnum]
    if (typeTmp === undefined && typeObj.type === 'array') {
      return convertArrayType(typeObj)
    } else {
      return typeTmp
    }
  } else if (typeObj?.$ref) {
    return convertRefType(typeObj?.$ref)
  }
  return undefined
}

export function convertArrayType(detail: IntegratedType | VoProp) {
  const typeRes = convertType(detail.items)
  if (typeRes) {
    return `${typeRes}[]`
  } else {
    return undefined
  }
}

export function convertDefinitionType(prop: string, definition: Vo) {
  const cleanProp = prop.replace('«', '').replace('»', '')
  const propTypes = [`export interface ${cleanProp} {`]
  const properties = definition.properties
  for (const key in properties) {
    const detail = properties[key]
    const value = convertType(detail)
    propTypes.push(`  ${key}?: ${value};${generateDesc(detail.description)}`)
  }
  propTypes.push('}')
  return propTypes.join('\n')
}

export function generateType(definitions: DefinitionsItem): string[] {
  // 处理类型定义
  const types = []
  for (let prop in definitions) {
    const curValue = definitions[prop]
    if (curValue.type === 'object') {
      types.push(convertDefinitionType(prop, definitions[prop]))
    }
  }
  return types
}

export function getParamsStr(queryParams: ConvertItem[], paramsName: string) {
  if (!queryParams?.length) return ''
  const paramsItems = [`export interface ${paramsName} {`]
  queryParams.forEach((item) => {
    paramsItems.push(`  ${item.name}${item.required ? '' : '?'}: ${item.type};${generateDesc(item.description)}`)
  })
  paramsItems.push('}')
  return paramsItems.join('\n')
}

export function getPathParams(queryParams: ConvertItem[]) {
  const paramsItems: string[] = []
  queryParams.forEach((item) => {
    paramsItems.push(`${item.name}${item.required ? '' : '?'}: ${item.type}`)
  })
  return paramsItems.join(', ')
}

// 注释
export function generateDesc(desc: string | undefined) {
  return desc ? '//' + desc : ''
}

export const templateDesc = (description: string, tags: string, method: string, prop: string) => `
/**
 * @description ${description || ''}
 * @tags ${tags}
 */
`
// * @request ${method}:${prop}

export const templateService = (
  name: string,
  method: string,
  basePath: string,
  prop: string,
  resType: string | undefined,
  queryName: string | undefined,
  bodyName: string | undefined,
  pathStr: string | undefined,
) => {
  const params = queryName ? 'params: ' + queryName : ''
  const data = bodyName ? 'data: ' + bodyName : ''
  return (
    `export const ${name} = ` +
    `(${joinFilter([params, data, pathStr])})` +
    `=> axios.${method}<${resType || 'void'}>` +
    `(\`${basePath}${convertPath(prop)}\`, { ${joinFilter([queryName ? 'params' : '', bodyName ? 'data' : ''])} })\n\n`
  )
}

export const templateImport = (importType: string[]) => `
import axios from 'axios'
import { ${importType.join(', ')} } from './typing'
`