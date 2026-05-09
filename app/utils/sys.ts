import { error, info } from "@tauri-apps/plugin-log";
import { LogLevel } from "../config/env";
import { message } from "antd";

const log =
{
    // 使用方式：
    // const test = { name: "123", age: "456" };
    // sys.log.info("log1:", test);
    // sys.log.info("log2:{name},{age}", test);
    // sys.log.info("log3:", test,test);
    // sys.log.info("log4:{0},{1}", test.name,test.age);

    info: (msg: any, ...vars: any[]) => {

        if (LogLevel != "info")
            return;

        msg = utils.format(msg, ...vars);

        console.log(msg);

        info(msg).catch((e) => { });
    },

    error: (msg: any, ...vars: any[]) => {
        if (LogLevel == "none")
            return;

        msg = utils.format(msg, ...vars);

        console.error(msg);

        error(msg).catch((e) => { });
    },


}

const utils = {
    format: (text: any, ...params: any[]) => {
        if (!text)
            text = "";

        if (params && params.length > 0) {
            if (RegExp(/{(.*?)}/).test(text)) {
                let index = 0;
                text = text.replace(/{(.*?)}/g, (match: any, key: any) => {

                    if (params.length > 1)
                        return utils.jsonToString(params[key] || params[index++]);
                    else
                        return utils.jsonToString(params[0][key] || params[0]);
                });
            }
            else {
                for (const param of params) {
                    text += utils.jsonToString(param)+",";
                }

                if (text.endsWith(",")) {
                    text = text.slice(0, -1);
                }
            }
        }

        return text;
    },

    jsonToString: (obj: any) => {
        const str = JSON.stringify(obj,
            (key, val) => {
                // 处理函数丢失问题
                if (typeof val === 'function') {
                    return `${val}`;
                }
                // 处理undefined丢失问题
                if (typeof val === 'undefined') {
                    return 'undefined';
                }

                return val;
            },
            2
        );

        return str || obj;
    }
}

export const sys = { utils, log, msg: message };