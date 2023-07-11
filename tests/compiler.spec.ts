import { expect, test } from 'vitest'
import { compiler } from '../src/compiler'
import { ApiDocs } from '../src/io'

test('compiler', () => {
  const apiDocs: ApiDocs = {
    basePath: '/api/v1/scm/',
    info: {
      title: 'supplier',
    },
    tags: [
      {
        name: '供应商我的商品',
        description: 'Supply Item Controller',
      },
      {
        name: '供应商订单',
        description: 'Supply Order Controller',
      },
      {
        name: '供应商包裹',
        description: 'Supply Package Controller',
      },
    ],
    paths: {
      '/myItem/noSupply/{id}': {
        post: {
          tags: ['供应商我的商品'],
          summary: '不再供货接口',
          operationId: 'updateSupplyStatusUsingPOST',
          consumes: ['application/json'],
          produces: ['*/*'],
          parameters: [
            {
              in: 'body',
              name: 'noSupplyRequest',
              description: 'noSupplyRequest',
              required: true,
              schema: {
                $ref: '#/definitions/UpdateSupplyStatusRequest',
              },
            },
            {
              in: 'path',
              name: 'id',
              description: '商品id',
              required: true,
              type: 'integer',
            },
          ],
          responses: {
            '200': {
              description: 'OK',
              schema: {
                type: 'boolean',
              },
            },
          },
        },
      },
      '/myItem/sku': {
        get: {
          tags: ['供应商订单'],
          summary: '我的供货-sku列表',
          operationId: 'skuListUsingGET_1',
          consumes: ['application/json'],
          produces: ['*/*'],
          parameters: [
            {
              name: 'supplierSpu',
              in: 'query',
              description: '商家spu',
              required: false,
              type: 'string',
            },
            {
              name: 'status',
              in: 'query',
              description: '认领状态',
              required: false,
              type: 'integer',
              format: 'int32',
            },
          ],
          responses: {
            '200': {
              description: 'OK',
              schema: {
                type: 'array',
                items: {
                  $ref: '#/definitions/SupplyItemSkuRes',
                },
              },
            },
          },
        },
      },
    },
    definitions: {
      UpdateSupplyStatusRequest: {
        type: 'object',
        properties: {
          supplyItemId: {
            type: 'integer',
            format: 'int64',
          },
        },
      },
      SupplyItemSkuRes: {
        type: 'object',
        properties: {
          attribute: {
            type: 'string',
            description: '属性',
          },
          auditAtStamp: {
            type: 'integer',
            format: 'int64',
            description: '审核时间时间戳',
          },
          imageList: {
            type: 'array',
            description: '图片列表',
            items: {
              $ref: '#/definitions/Image',
            },
          },
          pass: {
            type: 'boolean',
            description: '是否通过审核',
          },
        },
      },
    },
  }
  const importRequest = `import { request } from '@/request'`
  const prefix = '/${prefix}'

  const codes = compiler(apiDocs, importRequest, prefix)

  expect(codes).toEqual([
    'SupplierScmV1Api',
    {
      models: `export interface MyItemSkuGetParams {
  supplierSpu?: string /* 商家spu */
  status?: number /* 认领状态 */
}

export interface UpdateSupplyStatusRequest {
  supplyItemId?: number
}

export interface SupplyItemSkuRes {
  attribute?: string /* 属性 */
  auditAtStamp?: number /* 审核时间时间戳 */
  imageList?: Image[] /* 图片列表 */
  pass?: boolean /* 是否通过审核 */
}`,
      index: `/* 供应商我的商品 */
export * from './SupplyItemController'

/* 供应商订单 */
export * from './SupplyOrderController'

/* 供应商包裹 */
export * from './SupplyPackageController'`,
      SupplyItemController: `import { UpdateSupplyStatusRequest } from './models'
import { request } from '@/request'

/* 不再供货接口 */
export const MyItemNoSupplyIdPost = (data: UpdateSupplyStatusRequest, id: number /* 商品id */): Promise<boolean> => request.post(\`/\${prefix}/api/v1/scm/myItem/noSupply/\${id}\`, data)`,
      SupplyOrderController: `import { MyItemSkuGetParams, SupplyItemSkuRes } from './models'
import { request } from '@/request'

/* 我的供货-sku列表 */
export const MyItemSkuGet = (params: MyItemSkuGetParams): Promise<SupplyItemSkuRes[]> => request.get(\`/\${prefix}/api/v1/scm/myItem/sku\`, { params })`,
      SupplyPackageController: `import {  } from './models'
import { request } from '@/request'`,
    },
  ])
})
