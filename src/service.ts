import fs from 'fs-extra'
import { convertType, templateDesc, templateImport, templateService, getParamsStr, getPathParams } from './convert'
import { Paths, TagInfoMap, Tags, convertTypeEnum } from './types'
import { capitalizedWord, lowerWord } from './utils'

// /alert/detail/{id}   /alert/list
const getServiceName = (path: string, fetchMethod: string = '') => {
  const plist = path.split(/[\/\.]/).filter((item) => item)
  plist.push('by')
  plist.push(fetchMethod)

  return plist
    .map((item, index) => {
      if (item.indexOf('{') >= 0) {
        // 去掉{}
        item = item.slice(1, item.length - 1)
      }
      if (index === 0) {
        return item
      } else {
        return capitalizedWord(item)
      }
    })
    .join('')
}

export async function generateService(basePath: string, paths: Paths, tags: Tags[]) {
  const tagInfoMap = tags.reduce(
    (acc, cur) => ((acc[cur.name] = { ...cur, services: [], importType: [] }), acc),
    {} as TagInfoMap,
  )

  const paramsTypes: string[] = []

  for (let prop in paths) {
    const content = paths[prop]
    const methodsArr = Object.keys(content)

    for (let fetchMethod of methodsArr) {
      const serviceName = getServiceName(prop, fetchMethod)

      const methodValueObj = content[fetchMethod!]

      const curTag = methodValueObj?.tags?.pop() || ''
      const tagInfo = tagInfoMap[curTag!]

      let services = tagInfo?.services
      services?.push(templateDesc(methodValueObj.description || methodValueObj.summary))

      const importType = tagInfo?.importType

      // 返回值类型
      const normalResponse = methodValueObj.responses['200'] ? methodValueObj.responses['200'].schema : undefined
      const resType = convertType(normalResponse)
      const convertTmp = resType?.replace('[', '').replace(']', '')
      if ((normalResponse?.$ref || normalResponse?.items?.$ref) && convertTmp && !importType?.includes(convertTmp)) {
        // 预设类型没有
        if (!Object.values(convertTypeEnum).includes(convertTmp as any)) {
          importType?.push(convertTmp)
        }
      }

      const queryParams = []
      const pathParams = []
      const parameters = content[fetchMethod!].parameters || []

      let bodyName = ''
      for (let paramsItem of parameters) {
        const inValue = paramsItem.in

        const convertItem = {
          name: paramsItem.name,
          description: paramsItem.description,
          type: convertType(paramsItem),
          required: paramsItem.required,
        }
        // 收集需要导入的类型
        if (inValue === 'body') {
          // 只会有一个 body
          bodyName = convertType(paramsItem.schema)!
          if (paramsItem.schema?.$ref) {
            if (bodyName && !importType?.includes(bodyName)) {
              importType?.push(bodyName)
            }
          }
        } else if (inValue === 'query') {
          // such as /users?role=admin
          queryParams.push(convertItem)
        } else if (inValue === 'path') {
          // such as /users/{id}
          pathParams.push(convertItem)
        }
      }

      const queryName = queryParams.length > 0 ? serviceName + 'Params' : undefined
      if (queryName) {
        importType?.push(queryName)
        paramsTypes.push(getParamsStr(queryParams, queryName))
      }

      const pathStr = getPathParams(pathParams)

      services?.push(templateService(serviceName, fetchMethod, basePath, prop, resType, queryName, bodyName, pathStr))
      tagInfo!.importType = importType!
    }
  }

  Object.values(tagInfoMap).forEach(async (tagFile) => {
    const fileName = lowerWord(tagFile.description.replace(/\s*/g, '')) + '.ts'
    const dftStr = templateImport(tagFile.importType) + tagFile.services.join('')
    await fs.writeFile(process.env.TYPE_PATH! + '/' + fileName, dftStr)
    console.log(`${fileName} is created successfully`)
  })

  return paramsTypes
}
