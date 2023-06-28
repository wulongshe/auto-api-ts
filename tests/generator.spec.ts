import { expect, test } from 'vitest'
import { generateApi, generateModel, generateService } from '../src/generator'
import { TransformedApi, TransformedModel } from '../src/transformer'

test('generateModel', () => {
  const model: TransformedModel = {
    name: 'SupplyItemSkuRes',
    description: undefined,
    props: [
      {
        key: 'attribute',
        required: false,
        value: 'string',
        description: '属性',
      },
      {
        key: 'auditAtStamp',
        required: false,
        value: 'number',
        description: '审核时间时间戳',
      },
      {
        key: 'imageList',
        required: false,
        value: 'Image[]',
        description: '图片列表',
      },
      {
        key: 'pass',
        required: false,
        value: 'boolean',
        description: '是否通过审核',
      },
    ],
  }

  const modelType = generateModel(model)

  expect(modelType).toBe(`export interface SupplyItemSkuRes {
  attribute?: string /* 属性 */
  auditAtStamp?: number /* 审核时间时间戳 */
  imageList?: Image[] /* 图片列表 */
  pass?: boolean /* 是否通过审核 */
}`)
})

test('generateApi', () => {
  const basePath = '/api/v1/scm/'
  const api: TransformedApi = {
    id: 'updateSupplyStatusUsingPOST',
    modelNames: ['UpdateSupplyStatusRequest', 'SupplyItemSkuRes'],
    models: [],
    tag: '供应商我的商品',
    name: 'MyItemNoSupplyIdPost',
    description: '不再供货接口',
    method: 'post',
    path: '/myItem/noSupply/${id}',
    body: 'UpdateSupplyStatusRequest',
    query: undefined,
    paths: [
      {
        key: 'id',
        required: true,
        value: 'number',
        description: '商品id',
      },
    ],
    response: 'SupplyItemSkuRes[]',
  }
  const apiCode = generateApi(api, basePath)

  expect(apiCode).toBe(`/* 不再供货接口 */
export const MyItemNoSupplyIdPost = (data: UpdateSupplyStatusRequest, id: number /* 商品id */): Promise<SupplyItemSkuRes[]> => request.post(\`/api/v1/scm/myItem/noSupply/\${id}\`, data)`)
})

test('generateServices', () => {
  const basePath = '/api/v1/scm/'
  const impReqPath = '@/request'
  const apis: TransformedApi[] = [
    {
      id: 'updateSupplyStatusUsingPOST',
      modelNames: ['UpdateSupplyStatusRequest'],
      models: undefined,
      tag: '供应商我的商品',
      name: 'MyItemNoSupplyIdPost',
      description: '不再供货接口',
      method: 'post',
      path: '/myItem/noSupply/${id}',
      body: 'UpdateSupplyStatusRequest',
      query: undefined,
      paths: [
        {
          key: 'id',
          required: true,
          value: 'number',
          description: '商品id',
        },
      ],
      response: 'SupplyItemSkuRes[]',
    },
  ]
  const serviceCode = generateService(apis, basePath, impReqPath)

  expect(serviceCode).toBe(`import { request } from '@/request'
import { UpdateSupplyStatusRequest } from './models'

/* 不再供货接口 */
export const MyItemNoSupplyIdPost = (data: UpdateSupplyStatusRequest, id: number /* 商品id */): Promise<SupplyItemSkuRes[]> => request.post(\`/api/v1/scm/myItem/noSupply/\${id}\`, data)`)
})
