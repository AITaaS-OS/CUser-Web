import { getServerSideConfig } from "@/app/config/server";
import axios, { AxiosRequestConfig } from "axios";
import { AITaaS_BaseUrl } from "@/app/config/env";
import { useUserState } from "../store/user";
import { Result } from "../types";
import { SysCode } from "../config/secret";
import { sys } from "../utils/sys";
import { AITaaSHeader } from "../constant";
const serverConfig = getServerSideConfig();

const axiosInstance = axios.create({
  baseURL: serverConfig.AITaaS_BaseUrl || AITaaS_BaseUrl,
  timeout: 180000,
});

// 请求拦截器，不包含chat部分，chat的请求：
// \app\client\api.ts
axiosInstance.interceptors.request.use(
  (config) => {
    // 在发送请求之前统一添加请求头信息
    //sys.log.info(">>>添加请求头:", useUserState.getState());
    if (useUserState.getState().accessToken && useUserState.getState().userId) {
      config.headers.set(AITaaSHeader.Token, "Bearer " + useUserState.getState().accessToken);
      config.headers.set(AITaaSHeader.SysCode, SysCode);
    }
    
    return config;
  },
  (error) => {
    sys.log.error("http>>>request error:", error);
    return Promise.reject(error);
  },
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // 直接返回数据
  },

  (error) => {
    sys.log.error("http>>>response error:", error);
    return Promise.reject(error);
  },
);

/**
 * @description: 封装的请求方法（优先使用get/post）
 */
const request = async <T>(
  method: string,
  url: string,
  data?: object,
  config?: AxiosRequestConfig,
): Promise<Result<T>> => {
  if (!url.startsWith("http://") && !url.startsWith("https://"))
    url = AITaaS_BaseUrl + url

  config = {
    method: method,
    url,
    ...config,
  };

  if (data) {
    config.data = data;
  }

  try {
    return await axiosInstance.request(config);
  } catch (error: any) {
    sys.log.error("http>>>request error:", error);
    //sys.msg.error(error.message || Locale.Error.CommonError);
    return Promise.reject(error);
  }
};

/**
 * @description: 封装get请求方法
 * @param {string} url 请求地址
 * @param {string | object} params 请求参数
 * @param {AxiosRequestConfig} config 请求配置
 * @return {Promise<Result<T>>} 返回的接口数据
 */
const get = async <T>(
  url: string,
  params?: string | object,
  config?: AxiosRequestConfig,
): Promise<Result<T>> => {
  config = {
    method: "get",
    url,
    ...config,
  };

  if (params) {
    config.params = params;
  }

  try {
    return await axiosInstance.request(config);
  } catch (error: any) {
    sys.log.error("http>>>get error:", error);
    //sys.msg.error(error.message || Locale.Error.CommonError);
    return Promise.reject(error);
  }
};

/**
 * @description: 封装post请求方法
 * @param {string} url url 请求地址
 * @param {string | object} data 请求参数
 * @param {AxiosRequestConfig} config 请求配置
 * @return {Promise<Result<T>>} 返回的接口数据
 */
const post = async <T>(
  url: string,
  data?: string | object,
  config?: AxiosRequestConfig,
): Promise<Result<T>> => {
  config = {
    method: "post", // `method` 是创建请求时使用的方法
    url, // `url` 是用于请求的服务器 URL
    ...config,
  };

  if (data) {
    config.data = data;
  }

  try {
    return await axiosInstance.request(config);
  } catch (error: any) {
    sys.log.error("http>>>post error:", error);
    //sys.msg.error(error.message || Locale.Error.CommonError);
    return Promise.reject(error);
  }
};



// 包裹请求方法的容器,使用 http 统一调用
const http = {
  get,
  post,
  request
};

export default http;
