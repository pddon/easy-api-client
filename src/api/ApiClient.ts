import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";

export enum RequestType {
    'get'= 'get',
    'post'= 'post',
    'put'= 'put',
    'delete'= 'delete',
    'head'= 'head',
    'patch'= 'patch'
}

export type ApiDesc = {
    apiName: string;
    type: RequestType;
    /**
     * 是否需要验签
     */
    needSign?: boolean;
    /**
     * 是否需要对服务器返回结果验签
     */
    needSignResult?: boolean;
    /**
     * 是否需要会话
     */
    needSession?: boolean;
    /**
     * 是否加密请求参数
     */
    encryptRequest?: boolean;
    /**
     * 是否解密响应
     */
    decryptResponse?: boolean;
    /**
     * 需要加密的参数列表
     */
    encryptParams?: string[];
    /**
     * 需要解密的参数列表
     */
    decryptParams?: string[];
    /**
     * 需要忽略验签的参数列表
     */
    ignoreSignParams?: string[];
    /**
     * 接口后缀，优先级高于ApiOptions配置中的apiSuffix
     */
    apiSuffix?: string;
};

export type ApiOptions = {
    baseUrl: string;
    mockBaseUrl?: string;
    apiSuffix?: string;
    channelId?: string;
    appId: string;
    locale?: string;
    secret: string;
    privateSecret?: string;
    publicSecret?: string;
    timeout?: number;
    contentType?: string;
    versionCode?: string;
    config?: AxiosRequestConfig<any>;
};
/**
 * 当前登录用户信息
 */
export class LoginUserInfo {
    sessionId?: string;
    deviceId?: string;
    userId?: string;
    nickname?: string;
    countryCode?: string;
    online: boolean = false;
    enableLog: boolean = false;
};
const currentLoginUserInfo = new LoginUserInfo();
export const CurrentLoginUserInfo = currentLoginUserInfo;
export interface ApiClient{

    readonly api?: AxiosInstance;

    readonly options: ApiOptions;

    readonly preHandlers: ApiPreHandler[];

    readonly afterHandlers: ApiAfterHandler[];

    readonly interceptors: ApiResponseInterceptor[];

    addPreHandler(handler: ApiPreHandler): void;

    addAfterHandler(handler: ApiAfterHandler): void;

    addResponseInterceptor(interceptor: ApiResponseInterceptor): void;

    init(options: ApiOptions): void;

    request(api: ApiDesc, data?: any, contentType?: string, config?: AxiosRequestConfig<any>): Promise<any>;
}
export interface ApiPreHandler{
    order(): number;
    handle(api: ApiDesc, options: ApiOptions, data?: any): any;
}

export interface ApiAfterHandler{
    order(): number;
    handle(api: ApiDesc, options: ApiOptions, response: AxiosResponse<any, any>): AxiosResponse<any, any>;
}

export interface ApiResponseInterceptor{
    support(status: number, code?: number): boolean;
    successHandle(data: any): void;
    failedHandle(status: number, msg: string, code?: number): void;
}