# AUTO API TS

## Description

自动将swagger接口转换为ts类型
This is a simple tool to generate typescript interfaces from a json schema.

## Installation

```bash
npm install -g auto-api-ts
```

## Usage

### 复制`template.env`到`.env`并修改

```bash
# swagger地址
BASE_URL="xxx"
# swagger版本
API_VERSION="xxx"
# swagger请求头
COOKIE="xxx"
# 生成的文件夹
TYPE_PATH="./types"
# 请求方式 request | axios，默认axios
REQUEST_METHOD="request"
```

### 在`package.json`中添加脚本

```json
{
  "scripts": {
    "api": "auto-api-ts"
  }
}
```

### 运行脚本

```bash
npm run api
# or yarn
yarn api
# or pnpm
pnpm api
```
