import {ApiResponseInterceptor} from "../ApiClient";

export class DefaultApiResponseInterceptor implements ApiResponseInterceptor{

    support(status: number, code?: number) {
        return true;
    }

    failedHandle(status: number, msg: string, code?: number): void {
        // 状态码判断
        switch (status) {
            // 401: 未登录状态，跳转登录页
            case 401:
                console.warn(`status:[${status}],请先登录后再执行此操作!`);
                break;
            // 403 token过期
            // 清除token并跳转登录页
            case 403:
                console.warn(`status:[${status}],登录过期，请重新登录!`);
                break;
            // 404请求不存在
            case 404:
                console.warn(`status:[${status}],请求的资源不存在`);
                break;
            default:
                if (code === 130002){
                    console.warn(`code:[${code}],登录过期，请重新登录!`);
                } else if (code === 120003){
                    if (msg && (`${msg}`.indexOf('sessionId') >= 0)){
                        console.warn(`code:[${code}],请先登录后再执行此操作!`);
                    } else {
                        console.warn(`[${code}]${msg}`);
                    }
                } else{
                    console.warn(`status:[${status}],code:[${code}], ${msg}`);
                }
        }

    }

    successHandle(data: any): void {
        
    }
}