import {TestApiClient} from "./boot";
import {RequestType} from "../src";

test('signBoth',(done) => {
    console.info("signBoth request");
    const logger = console;
    TestApiClient.request({
        apiName: "/trade/prepay",
        type: RequestType.post,
        needSignResult: true,
        needSign: true
    }, {
        appId: TestApiClient.options.appId,
        orderId: "easy_api_client001",
        description: "just a test!",
        currency: "CNY",
        totalAmount: 1,
        originalAmount: 5,
        userId: "U008958",
        userNickname: "小明"
    }).then((response: any) => {
        console.debug(JSON.stringify(response.data));
        expect(response.data.code).toBe(0);
    }, (reason: any) => {
        console.debug(JSON.stringify(reason));
    }).catch((reason: any) => {
        console.debug(JSON.stringify(reason));
    }).finally(() => done());

});

test('testEncryptAndDecrypt',(done) => {
    console.info("signBoth request");
    TestApiClient.request({
        apiName: "/trade/query",
        type: RequestType.post,
        needSignResult: true,
        needSign: true,
        decryptResponse: true,
        encryptRequest: true,
        encryptParams: ["orderId"],
        decryptParams: ["outTradeNo", "tradeStatus", "payerId"]
    }, {
        appId: TestApiClient.options.appId,
        orderId: "easy_api_client001"
    }).then((response: any) => {
        console.debug(JSON.stringify(response.data));
        expect(response.data.code).toBe(0);
    }, (reason: any) => {
        console.debug(JSON.stringify(reason));
    }).catch((reason: any) => {
        console.debug(JSON.stringify(reason));
    }).finally(() => done());

});