import axios, { AxiosResponse } from 'axios'
import type { SwaggerDocType } from './types'
import fs from 'fs-extra'

export async function clearCache(path: string) {
  await fs.remove(path)
  await fs.mkdir(path)
}

export async function loadApiDocs(): Promise<AxiosResponse<SwaggerDocType>> {
  return axios(process.env.BASE_URL! + process.env.API_VERSION, {
    headers: {
      accept: 'application/json;charset=utf-8,*/*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      cookie: process.env.COOKIE!,
      Referer: process.env.BASE_URL! + '/swagger-ui.html',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    method: 'GET',
  })
}
