# AUTO API TS

## Description

### 自动将swagger接口转换为ts类型

### This is a simple tool to generate typescript interfaces from a json schema

## Installation

```bash
npm install -g auto-api-ts
```

## Use in Scripts

### 项目根目录下新建`.env`文件

```bash
# swagger地址
BASE_URL="https://api.xxx.dev"
# swagger版本（可选）
API_VERSION="/api/v1/xxx/api-docs"
# swagger请求头
COOKIE="xxx"
# 生成的文件夹路径
OUTPUT="./apis"
# 请求方法的导入路径
IMPORT="import { request } from '@/request'"
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
```

## Use in typescript

```ts
import { build } 'auto-api-ts';

build({
  BASE_URL: `https://api.xxx.dev`,
  COOKIE: `xxx`,
  OUTPUT: `./apis`,
  IMPORT: `import { request } from '@/request'`
});
```
