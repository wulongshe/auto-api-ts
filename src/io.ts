import axios, { AxiosResponse } from 'axios'
import fs from 'fs-extra'
import { Config } from './compiler'

export interface SwaggerResource {
  name: string
  location: string
  swaggerVersion?: string
}
export interface ApiDocs {
  basePath?: string
  tags?: Tag[]
  paths?: Paths
  definitions?: Definitions
  info: Info
  swagger?: string
  host?: string
  consumes?: string[]
  produces?: string[]
}

export interface Info {
  description?: string
  version?: string
  title: string
  license?: License
}

export interface License {
  name: string
  url: string
}

export interface Tag {
  name: string
  description: string
}

export type Paths = {
  [path in string]?: PathItem
}

export type MethodType = 'get' | 'post' | 'put' | 'delete'

export type PathItem = {
  [method in MethodType]?: MethodItem
}

export interface MethodItem {
  tags: string[]
  description?: string
  operationId: string
  summary: string
  parameters?: Parameter[]
  responses: Responses
  schemes?: string[]
  produces?: string[]
  consumes?: string[]
}

export interface Parameter {
  name: string
  in: 'query' | 'path' | 'body'
  required: boolean
  description?: string
  type?: string
  schema?: Property
  items?: Property
  collectionFormat?: string
  format?: string
}

export interface Responses {
  [code: string]: ResponseItem
}

export interface ResponseItem {
  description?: string
  schema?: Property
}

export interface Definitions {
  [name: string]: DefinitionItem
}

export interface DefinitionItem {
  type: string
  properties?: Properties
  title?: string
}

export interface Properties {
  [prop: string]: Property
}

export interface Property {
  type?: string
  description?: string
  items?: Property
  $ref?: string
  format?: string
}

export function joinUrlPath(url: string, path: string) {
  const urlObj = new URL(url)
  urlObj.pathname = path
  return urlObj.toString()
}

export function loadSwaggerResources(config: Config): Promise<AxiosResponse<SwaggerResource[]>> {
  const url = joinUrlPath(config.BASE_URL, '/swagger-resources')
  const referer = joinUrlPath(config.BASE_URL, '/swagger-ui.html')
  return axios(url, {
    headers: {
      cookie: config.COOKIE,
      accept: 'application/json, text/plain, */*',
      referer,
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    method: 'GET',
  })
}

export async function loadApiDocs(config: Config, apiVersion: string): Promise<AxiosResponse<ApiDocs>> {
  const url = joinUrlPath(config.BASE_URL, apiVersion)
  const referer = joinUrlPath(config.BASE_URL, '/swagger-ui.html')
  return axios(url, {
    headers: {
      cookie: config.COOKIE,
      referer,
      accept: 'application/json;charset=utf-8,*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    method: 'GET',
  })
}

export async function clearCache(path: string) {
  await fs.remove(path)
  await fs.mkdir(path)
}

export async function writeFile(fileName: string, content: string) {
  await fs.writeFile(fileName, content)
}
