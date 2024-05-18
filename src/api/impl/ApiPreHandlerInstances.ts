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

    convertToSignParams(signParams: any, ignoreSignParams: Set<string>, key: string, value: any): void {
        if (value instanceof Array){
            //数组
            if(ignoreSignParams.has(`${key}`)){
                return;
            }
            const arr = value as Array<any>;
            arr.forEach((v, i) => {
                this.convertToSignParams(signParams, ignoreSignParams, `${key}[${i}]`, v);
            });
        }else if(typeof value === 'object' && value != null){
            Object.keys(value).filter(subKey => !ignoreSignParams.has(`${key}.${subKey}`)).forEach(subKey => {
                this.convertToSignParams(signParams, ignoreSignParams, `${key}.${subKey}`, value[subKey]);
            });
        }else{
            signParams[key] = value;
        }
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
            let value = data[key];

            this.convertToSignParams(signParams, ignoreSignParams, key, value);
        });
        data.parameters && Object.keys(data.parameters).filter(key => !ignoreSignParams.has(key)).forEach(key => {
            let value = data.parameters[key];

            this.convertToSignParams(signParams, ignoreSignParams, key, value);
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
        }
        data.clientId = CurrentLoginUserInfo.deviceId;
        data.versionCode = options.versionCode;
        return data;
    }

    order(): number {
        return 999;//最后执行
    }

}