//本机
//export const AITaaS_BaseUrl = "http://localhost:3333/aitaas";
//服务器
export const AITaaS_BaseUrl = "https://www.aitaas.cn";

//socket地址
export const AITaaS_SocketUrl = AITaaS_BaseUrl.replace("http", "ws");
//socket路径配置
export enum AITaaS_SocketPath {
    OpenSocket = "/opensocket",
}

//生产环境调至 none
export const LogLevel: "info" | "error" | "none" = "info";

//配置根路径，同next.config.mjs中的basePath
export const BasePath = "/cuser";