import {ApiDesc, ApiOptions, ApiPreHandler, CurrentLoginUserInfo} from "../ApiClient";
import {EncryptUtil} from "../../utils/EncryptUtil";

export class ApiEncryptPreHandler implements ApiPreHandler{
    static newInstance(): ApiPreHandler{
        return new ApiEncryptPreHandler();
    }
    handle(api: ApiDesc, options: ApiOptions, data?: any): any {
        if(!api.encryptRequest){
            return data;
        }
        api.encryptParams && api.encryptParams.forEach(paramKey => {
            let value = data[paramKey];
            if(typeof value === "string"){
                //字符串类型才可以加密
                try {
                    let content = EncryptUtil.encrypt(value, options.secret);
                    data[paramKey] = content;
                } catch (e) {
                    console.warn(`参数[${value}]加密失败!`);
                }
            }
        });
        return data;
    }

    order(): number {
        return -1;//在加签处理器执行后执行
    }

}

export class ApiSignPreHandler implements ApiPreHandler{
    static newInstance(): ApiPreHandler{
        return new ApiSignPreHandler();
    }
    handle(api: ApiDesc, options: ApiOptions, data?: any): any {
        if(!api.needSign){
            return data;
        }
        data = data || {};
        if(!api.ignoreSignParams){
            api.ignoreSignParams = [];
        }
        api.ignoreSignParams.push('parameters');
        let ignoreSignParams = new Set(api.ignoreSignParams);
        let signParams:any = {};
        Object.keys(data).filter(key => !ignoreSignParams.has(key)).forEach(key => {
            signParams[key] = data[key];
        });
        data.parameters && Object.keys(data.parameters).filter(key => !ignoreSignParams.has(key)).forEach(key => {
            signParams[key] = data.parameters[key];
        });
        let timestamp = Date.now();

        data.sign = EncryptUtil.signSHA1Hex(signParams, timestamp, options.secret);
        data.timestamp = timestamp;

        return data;
    }

    order(): number {
        //最先执行加签
        return -2;
    }

}

export class ApiSysParamSetPreHandler implements ApiPreHandler{
    static newInstance(): ApiPreHandler{
        return new ApiSysParamSetPreHandler();
    }
    handle(api: ApiDesc, options: ApiOptions, data?: any): any {
        data.appId = options.appId;
        data.locale = options.locale;
        if (CurrentLoginUserInfo.online){
            data.sessionId = CurrentLoginUserInfo.sessionId;
            data.userId = CurrentLoginUserInfo.userId;
        }
        data.clientId = CurrentLoginUserInfo.deviceId;
        data.versionCode = options.versionCode;
        return data;
    }

    order(): number {
        return 999;//最后执行
    }

}