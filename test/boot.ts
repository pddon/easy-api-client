import {ApiClient, newApiClientInstance} from "../src/index";
let client: ApiClient = newApiClientInstance({
    baseUrl: "http://localhost:8989/payment/",
    channelId: "local_test",
    appId: "pddon-payment-demo",
    secret: "NKVNcuwwEF3sc22A",
    locale: "zh_CN",
    apiSuffix: ".do"
});

export const TestApiClient: ApiClient = client;
//使用原生console输出日志，看起来更简洁清晰
const jestConsole = console;
beforeEach(() => {
    (global as any).console = require('console');
});
afterEach(() => {
    (global as any).console = jestConsole;
});