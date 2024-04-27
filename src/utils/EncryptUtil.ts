import {CurrentLoginUserInfo} from "../api/ApiClient";

export class EncryptUtil {
    static AES = require('crypto-js/aes');
    static EncodeUtf8 = require('crypto-js/enc-utf8');
    static EncodeHex = require('crypto-js/enc-hex');
    static EncodeBase64 = require('crypto-js/enc-base64');
    static Ecb = require('crypto-js/mode-ecb');
    static Pkcs7 = require('crypto-js/pad-pkcs7');
    static Sha1 = require('crypto-js/sha1');
    static MD5 = require('crypto-js/md5');

    public static sortAndMontage (data: any): string{
        let result = '';
        let keys = Object.keys(data);
        let params:any = {};

        //转换字段
        keys.forEach(key => {
            if (data[key] === undefined || data[key] === null || data[key] instanceof Array){
                return;
            }
            params[key] = data[key];
        });
        keys = Object.keys(params);
        keys = keys.sort();
        //对键值对进行拼接
        keys.forEach(key => {
            result += key;
            let content = String(params[key]);

            result += content;
        });
        //console.log(result);
        return result;
    }

    public static signSHA1Hex (data: any, timestamp: number, secret: string): string{
        let str = this.sortAndMontage(data);
        if(CurrentLoginUserInfo.enableLog){
            console.log(`sortedParamsResult:${str}`);
        }
        let salt = String(timestamp);
        let txt = secret + salt + str + salt + secret;

        //console.log(`content: ${txt}`);
        try {
            return this.Sha1(txt).toString(this.EncodeHex).toUpperCase();
        } catch (e) {
            console.error(e);
        }
        return '';
    }

    public static signMD5Hex (value: string, secret: string): string{
        try {
            return this.MD5(value + secret).toString(this.EncodeHex).toUpperCase();
        } catch (e) {
            console.error(e);
        }
        return '';
    }

    public static encrypt (data:string, secret:string): string{
        const formatedKey = this.EncodeUtf8.parse(secret); // 将 key 转为 128bit 格式
        const formatedData = this.EncodeUtf8.parse(data); // 将 data 转为 utf8 编码格式
        const encrypted = this.AES.encrypt(formatedData, formatedKey, {

            'mode': this.Ecb,

            'padding': this.Pkcs7

        }); // 加密

        return encrypted.toString(); // AES 加密生成的密文是一个对象，直接将其转为字符串是一个 Base64 编码串
    }

    public static decrypt (encryptData:string, secret:string): string{
        const formatedKey = this.EncodeUtf8.parse(secret); // 将 key 转为 128bit 格式
        const decryptedData = this.AES.decrypt(encryptData, formatedKey, {

            'mode': this.Ecb,

            'padding': this.Pkcs7

        }); // 解密

        return decryptedData.toString(this.EncodeUtf8) || encryptData; // 经过 AES 解密后，依然是一个对象，将其变成明文就需要按照 Utf8 格式转为字符串
    }

    public static maskData (content: string): string{
        if (!content){
            return content;
        }
        let start = content.length / 4;
        let end = content.length * 3 / 4;
        let head = content.substring(0, start);
        let tail = content.substring(end);
        let m = end - start;
        let middle = '';

        for (let i = 0; i < m; i++){
            middle += '*';
        }
        return head + middle + tail;
    }
}
