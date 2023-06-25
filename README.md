# AUTO API TS

## Description

This is a simple tool to generate typescript interfaces from a json schema.

## Installation

```bash
npm install -g auto-api-ts
```

## Usage

### 复制`template.env`到`.env`并修改

```bash
# swagger地址
BASE_URL="https://ofsapi-v2.cloudmall-test.cloudmall.dev"
# swagger版本
API_VERSION="/api/v1/scm/v2/api-docs"
# swagger请求头
COOKIE="session-oss=MTY4NzY1OTc0MnxOd3dBTkVGSlFrZzBWVU5FV0V4WlZWcFlTbGhQV1UxR1JETlNVRlZNV2pkTVYwMU9SVlZEUkVvM05sSk5RVWRQUjBRME5WWlFXRUU9fKyBxcYbqZ58PvwXSNShGD0Qehn7KfnbKICjXto64g-n; session-oss=MTY4NzY2MDc3NXxOd3dBTkVGSlFrZzBWVU5FV0V4WlZWcFlTbGhQV1UxR1JETlNVRlZNV2pkTVYwMU9SVlZEUkVvM05sSk5RVWRQUjBRME5WWlFXRUU9fD8QfOnkGXTAPx0Ab8JfYGQcLunVqUmjzCNkomZiQHpq; JSESSIONID=52B9BFD24DF9A25ED5B9D38F1D82D4BE"
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
