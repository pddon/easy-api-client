import {
    ApiAfterHandler,
    ApiClient,
    ApiDesc,
    ApiOptions,
    ApiPreHandler, ApiResponseInterceptor,
    RequestType
} from "../ApiClient";
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {ApiEncryptPreHandler, ApiSignPreHandler, ApiSysParamSetPreHandler} from "./ApiPreHandlerInstances";
import {ApiCheckSignAfterHandler, ApiDecryptAfterHandler} from "./ApiAfterHandlerInstances";
import {DefaultApiResponseInterceptor} from "./ApiResponseInterceptor";

export function newApiClientInstance(options: ApiOptions): ApiClient{
    let client = ApiClientInstance.newInstance(options);

    client.addAfterHandler(ApiCheckSignAfterHandler.newInstance());
    client.addAfterHandler(ApiDecryptAfterHandler.newInstance());
    client.addPreHandler(ApiSignPreHandler.newInstance());
    client.addPreHandler(ApiEncryptPreHandler.newInstance());
    client.addPreHandler(ApiSysParamSetPreHandler.newInstance());
    client.addResponseInterceptor(new DefaultApiResponseInterceptor());
    return client;
}

export class ApiClientInstance implements ApiClient{
    api?: AxiosInstance;
    options: ApiOptions;
    preHandlers: ApiPreHandler[] = [];
    afterHandlers: ApiAfterHandler[] = [];
    interceptors: ApiResponseInterceptor[] = [];

    private apiMethodMappings?: {
        "head": (url: string, data?: any, config?: AxiosRequestConfig<any>) => Promise<AxiosResponse<any>>;
        "patch": (url: string, data?: any, config?: AxiosRequestConfig<any>) => Promise<AxiosResponse<any>>;
        "post": (url: string, data?: any, config?: AxiosRequestConfig<any>) => Promise<AxiosResponse<any>>;
        "get": (url: string, data?: any, config?: AxiosRequestConfig<any>) => Promise<AxiosResponse<any>>;
        "delete": (url: string, data?: any, config?: AxiosRequestConfig<any>) => Promise<AxiosResponse<any>>;
        "put": (url: string, data?: any, config?: AxiosRequestConfig<any>) => Promise<AxiosResponse<any>>;
    };

    static newInstance(options: ApiOptions): ApiClient{
        let instance = new ApiClientInstance();
        instance.init(options);
        return instance;
    }

    constructor() {
        this.options = {
            baseUrl: "http://localhost:8080",
            appId: "",
            secret: ""
        };
    }

    init(options: ApiOptions): void {
        let axiosConfig = options.config;
        if(!axiosConfig){
            axiosConfig = {};
        }
        axiosConfig.baseURL = options.baseUrl || axiosConfig.baseURL;
        axiosConfig.timeout = options.timeout || axiosConfig.timeout;
        if(!axiosConfig.headers){
            axiosConfig.headers = {};
        }
        axiosConfig.headers['Content-Type'] = options.contentType || axiosConfig.headers['Content-Type'] || 'application/json';
        this.api = axios.create(axiosConfig);
        options.config = axiosConfig;
        this.options = options;
        this.initMethodMapping();
        this.initResponseInterceptors();
    }

    private initMethodMapping(){
        if(!this.api){
            return;
        }
        let api = this.api;
        this.apiMethodMappings = {
            [RequestType.get]: (url: string, data?: any, config?: AxiosRequestConfig<any>) => {
                config = config || {};
                config.params = data;
                return api.get(url, config);
            },
            [RequestType.post]: (url: string, data?: any, config?: AxiosRequestConfig<any>) => {
                if (data.parameters){
                    config = config || {};
                    config.params = data.parameters;
                }
                return api.post(url, data, config);
            },
            [RequestType.delete]: (url: string, data?: any, config?: AxiosRequestConfig<any>) => {
                config = config || {};
                config.params = data;
                return api.delete(url, config);
            },
            [RequestType.head]: (url: string, data?: any, config?: AxiosRequestConfig<any>) => {
                config = config || {};
                config.params = data;
                return api.head(url, config);
            },
            [RequestType.put]: (url: string, data?: any, config?: AxiosRequestConfig<any>) => {
                return api.put(url, data, config);
            },
            [RequestType.patch]: (url: string, data?: any, config?: AxiosRequestConfig<any>) => {
                return api.patch(url, data, config);
            }
        };
    }

    private errorHandle (status: number, other: any) {
        this.interceptors.forEach(intercetor => {
            if(intercetor.support(status)){
                intercetor.failedHandle(status, other && JSON.stringify(other));
            }
        });
    }

    private initResponseInterceptors() {
        // 添加响应拦截器
        this.api && this.api.interceptors.response.use((response: AxiosResponse) => {
            // 对响应数据做点什么
            if(!response){
                return  response;
            }
            if(response.headers["Content-Type"] == "application/octet-stream"
                || (response.headers["content-disposition"] && (response.headers["Content-Type"] != "application/json"))){
                return response;
            }
            if (response.data.code !== 0){
                this.interceptors.forEach(intercetor => {
                    if(intercetor.support(response.status)){
                        intercetor.failedHandle(response.status, response.data.msg, response.data.code);
                    }
                });
                return Promise.reject(response);
            }else{
                //成功
                this.interceptors.forEach(intercetor => {
                    if(intercetor.support(200, 0)){
                        intercetor.successHandle(response.data);
                    }
                });
            }
            return response;
        }, (error: any) => {
            // 对响应错误做点什么
            const response = error.response;

            if (response) {
                // 请求已发出，但是不在2xx的范围
                this.errorHandle(response.status, response.data.message || error.message);
                return Promise.reject(response);
            }
            return Promise.reject(error);
        });
    }

    request(api: ApiDesc, data?: any, contentType?: string, config?: AxiosRequestConfig<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                if(!data){
                    data = {};
                }
                for(let h of this.preHandlers){
                    data = h.handle(api, this.options, data);
                }
                let url = this.options.baseUrl + api.apiName;
                if(api.apiSuffix !== undefined){
                    url += api.apiSuffix;
                }else{
                    url += (this.options.apiSuffix || '');
                }
                this.apiMethodMappings && this.apiMethodMappings[api.type](url, data, config).then((response: AxiosResponse) => {
                    //执行拦截器方法
                    for(let h of this.afterHandlers){
                        response = h.handle(api, this.options, response);
                    }
                    resolve(response);
                }, function (reason) {
                    reject(reason);
                }).catch((reason :any) => {
                    console.log(reason);
                });
            } catch (e:any) {
                console.warn(e.message);
                console.warn(e);
            }
        });
    }

    addAfterHandler(handler: ApiAfterHandler): void {
        this.afterHandlers.push(handler);
        //排序
        this.afterHandlers.sort((h1, h2) => h1.order() - h2.order());
    }

    addPreHandler(handler: ApiPreHandler): void {
        this.preHandlers.push(handler);
        //排序
        this.preHandlers.sort((h1, h2) => h1.order() - h2.order());
    }

    addResponseInterceptor(interceptor: ApiResponseInterceptor): void {
        this.interceptors.push(interceptor);
    }
}