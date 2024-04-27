import {ApiAfterHandler, ApiDesc, ApiOptions} from "../ApiClient";
import {AxiosResponse} from "axios";
import {EncryptUtil} from "../../utils/EncryptUtil";

export class ApiCheckSignAfterHandler implements ApiAfterHandler{
    static newInstance(): ApiAfterHandler{
        return new ApiCheckSignAfterHandler();
    }
    handle(api: ApiDesc, options: ApiOptions, response: AxiosResponse<any, any>): AxiosResponse<any, any> {
        if(!api.needSignResult){
            return response;
        }
        let data = response.data.data;
        if(!data){
            return response;
        }
        let signParams:any = {};
        Object.keys(data).forEach(key => {
            let value = data[key];

            if(typeof value === 'object' && value != null){
                Object.keys(value).forEach(subKey => {
                    signParams[`${key}.${subKey}`] = value[subKey];
                });
            }else if (value instanceof Array){
                //数组
                const arr = value as Array<any>;
                arr.forEach((v, i) => {
                    signParams[`${key}[${i}]`] = v;
                })
            }else{
                signParams[key] = value;
            }
        });
        let timestamp = response.data.timestamp;
        let sign = EncryptUtil.signSHA1Hex(signParams, timestamp, options.secret);

        if(response.data.sign != sign){
            //验签失败
            console.warn("验签失败, 服务器响应信息非法！");
            throw new Error("验签失败, 服务器响应信息非法！");
        }
        return response;
    }

    order(): number {
        return -2;//验签处理器最先执行
    }

}

export class ApiDecryptAfterHandler implements ApiAfterHandler{
    static newInstance(): ApiAfterHandler{
        return new ApiDecryptAfterHandler();
    }
    handle(api: ApiDesc, options: ApiOptions, response: AxiosResponse<any, any>): AxiosResponse<any, any> {
        if(!api.decryptResponse || !api.decryptParams || !response.data?.data){
            return response;
        }
        let data = response.data.data;

        api.decryptParams.forEach(paramKey => {
            let value = data[paramKey];
            if(typeof value === "string"){
                //字符串类型才可以加密
                try {
                    let content = EncryptUtil.decrypt(value, options.secret);
                    data[paramKey] = content;
                } catch (e) {
                    console.warn(`参数[${value}]加密失败!`);
                }
            }
        });
        return response;
    }

    order(): number {
        return 999;//解密处理器最后执行
    }

}