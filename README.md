### easy-api-client 简介
> 此项目用于快速接入服务端api框架easy-spring-boot-api，基于axios，可用于web或者node环境。提供了ApiClient工具，自动对api加签、验签、加解密等等功能，在保障服务器api安全的前提下，能做到业务无感知，简化前后端开发人员的联调工作。
* 安装依赖
  `npm install easy-api-client`或者`yarn add easy-api-client`
  
* 功能使用示例
```ts
import {ApiClient, newApiClientInstance, RequestType} from "easy-api-client";
let client: ApiClient = newApiClientInstance({
    baseUrl: "http://localhost:8080/server/",
    channelId: "web",
    appId: "test-demo",
    secret: "NKVNcuwwEF56c22A",
    locale: "zh_CN",
    apiSuffix: ".do"
});
client.request({
    apiName: "/demo/pay",
    type: RequestType.post,
    needSignResult: true,
    needSign: true
}, {
    appId: client.options.appId,
    orderId: "easy_api_client001",
    description: "just a test!",
    currency: "CNY",
    totalAmount: 1,
    originalAmount: 5,
    userId: "U008958",
    userNickname: "小明"
}).then((response: any) => {
    console.log(response.data);
}, (reason: any) => {
    console.log(reason);
});
```
### npm包的发布流程
1. 构建项目
  > `npm run build`
2. 登录账号
  > `npm login --registry https://registry.npmjs.org/`
3. 发布包
  > `npm publish --registry https://registry.npmjs.org/`
