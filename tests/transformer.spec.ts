import { expect, test } from 'vitest'
import {
  transformApi,
  transformModel,
  transformParameter,
  transformParams,
  transformType,
  transformer,
} from '../src/transformer'
import { ApiDocs, DefinitionItem, Parameter, PathItem, Property } from '../src/io'

test('transformType', () => {
  const prop: Property = {
    type: 'array',
    description: '图片列表',
    items: {
      $ref: '#/definitions/Image',
    },
  }
  const newType = transformType(prop)

  expect(newType).toBe('Image[]')
})

test('transformModel', () => {
  const name = 'UpdateSupplyStatusRequest'
  const definition: DefinitionItem = {
    type: 'object',
    properties: {
      supplyItemId: {
        type: 'integer',
        description: '供应商编号',
        format: 'int64',
      },
    },
  }
  const newModel = transformModel(name, definition)

  expect(newModel).toEqual({
    name: 'UpdateSupplyStatusRequest',
    description: undefined,
    props: [
      {
        key: 'supplyItemId',
        required: false,
        value: 'number',
        description: '供应商编号',
      },
    ],
  })
})

test('transformParameter', () => {
  const param: Parameter = {
    in: 'body',
    name: 'noSupplyRequest',
    description: 'noSupplyRequest',
    required: true,
    schema: {
      $ref: '#/definitions/UpdateSupplyStatusRequest',
    },
  }
  const newParam = transformParameter(param)
  expect(newParam).toEqual({
    key: 'noSupplyRequest',
    required: true,
    value: 'UpdateSupplyStatusRequest',
    description: 'noSupplyRequest',
  })
})

test('transformParams', () => {
  const name = 'MyItemNoSupply'
  const parameters: Parameter[] = [
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
      name: 'supplierSpu',
      in: 'query',
      description: '商家spu',
      required: false,
      type: 'string',
    },
    {
      name: 'status',
      in: 'path',
      description: '认领状态',
      required: false,
      type: 'integer',
      format: 'int32',
    },
  ]
  const newParams = transformParams(name, parameters)

  expect(newParams).toEqual({
    body: 'UpdateSupplyStatusRequest',
    query: {
      name: 'MyItemNoSupplyParams',
      props: [
        {
          key: 'supplierSpu',
          required: false,
          value: 'string',
          description: '商家spu',
        },
      ],
    },
    paths: [
      {
        key: 'status',
        required: false,
        value: 'number',
        description: '认领状态',
      },
    ],
  })
})

test('transformApi', () => {
  const path = '/myItem/noSupply/{id}'
  const pathItem: PathItem = {
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
            type: 'array',
            items: {
              $ref: '#/definitions/SupplyItemSkuRes',
            },
          },
        },
      },
    },
  }

  const newApi = transformApi(path, pathItem)

  expect(newApi).toEqual({
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
  })
})

test('transformer', () => {
  const apiDocs: ApiDocs = {
    info: {
      title: 'supplier',
    },
    basePath: '/api/v1/scm/',
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

  const newApiDocs = transformer(apiDocs)

  expect(newApiDocs).toEqual({
    name: 'SupplierScmV1Api',
    basePath: '/api/v1/scm/',
    tags: [
      {
        name: 'SupplyItemController',
        description: '供应商我的商品',
        apis: [
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
            response: 'boolean',
          },
        ],
      },
      {
        name: 'SupplyOrderController',
        description: '供应商订单',
        apis: [
          {
            id: 'skuListUsingGET_1',
            modelNames: ['MyItemSkuGetParams', 'SupplyItemSkuRes'],
            models: undefined,
            tag: '供应商订单',
            name: 'MyItemSkuGet',
            description: '我的供货-sku列表',
            method: 'get',
            path: '/myItem/sku',
            body: undefined,
            query: 'MyItemSkuGetParams',
            paths: undefined,
            response: 'SupplyItemSkuRes[]',
          },
        ],
      },
      {
        name: 'SupplyPackageController',
        description: '供应商包裹',
        apis: [],
      },
    ],
    models: [
      {
        name: 'MyItemSkuGetParams',
        props: [
          {
            key: 'supplierSpu',
            required: false,
            value: 'string',
            description: '商家spu',
          },
          {
            key: 'status',
            required: false,
            value: 'number',
            description: '认领状态',
          },
        ],
      },
      {
        name: 'UpdateSupplyStatusRequest',
        description: undefined,
        props: [
          {
            key: 'supplyItemId',
            required: false,
            value: 'number',
            description: undefined,
          },
        ],
      },
      {
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
      },
    ],
  })
})
