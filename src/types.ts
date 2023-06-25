export interface Tags {
  name: string
  description: string
}

export interface ParamsInfo {
  name: string
  in: 'query' | 'path' | 'body'
  description: string
  required: boolean
  type: string
  schema: IntegratedType
}

export interface IntegratedType {
  $ref?: string
  type?: string
  items?: {
    $ref: string
  }
}

export interface NormalRes {
  description: string
  schema: IntegratedType
}

export interface MethodItem {
  tags: string[]
  summary: string
  description: string
  parameters: ParamsInfo[]
  responses: {
    '200': NormalRes
  }
}

export interface PathItem {
  [method: string]: MethodItem
}

export interface Paths {
  [path: string]: PathItem
}

export interface VoProp {
  type: string
  description: string
  items?: IntegratedType
  $ref?: string
}

export interface Vo {
  type: string
  properties: {
    [prop: string]: VoProp
  }
}

export interface DefinitionsItem {
  [vo: string]: Vo
}

export interface SwaggerDocType {
  swagger: string
  basePath: string
  tags: Tags[]
  paths: Paths
  definitions: DefinitionsItem
}

export interface ConvertItem {
  name: string
  description: string
  type?: string
  required: boolean
}

export interface TagInfo extends Tags {
  services: string[]
  importType: string[]
}

export type TagInfoMap = Record<string, TagInfo>

export const convertTypeEnum = {
  number: 'number',
  integer: 'number',
  string: 'string',
  object: 'object',
  boolean: 'boolean',
} as const