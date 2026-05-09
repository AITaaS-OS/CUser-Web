import { getServerSideConfig } from "@/app/config/server";
import {
  ServerAPIPath,
  ModelProvider,
} from "@/app/constant";
import {AITaaS_BaseUrl} from "@/app/config/env";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { sys } from "@/app/utils/sys";

const serverConfig = getServerSideConfig();

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const data = await req.text();

  sys.log.info("AITaaS>>>API收到数据：", data);

  const authResult = auth(req, ModelProvider.AITaaS);

  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const response = await request(req,data);
    return response;
  } catch (e) {
    sys.log.error("AITaaS>>>错误： ", e);
    return NextResponse.json(prettyObject(e));
  }
}

async function request(req: NextRequest,data:string) {
  const controller = new AbortController();

  // alibaba use base url or just remove the path
  let path = `${req.nextUrl.pathname}`.replaceAll(ServerAPIPath.AITaaS, "");

  let baseUrl = serverConfig.AITaaS_BaseUrl || AITaaS_BaseUrl;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  const fetchUrl = `${baseUrl}${path}`;

  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": req.headers.get("Authorization") ?? "",
      "Access-SSE": req.headers.get("Access-SSE") ?? "disable",
    },
    method: req.method,
    body: data,
    signal: controller.signal,
  };

  sys.log.info("AITaaS>>>服务端转发请求地址：", fetchUrl);

  try {
    const res = await fetch(fetchUrl, fetchOptions);

    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    sys.log.info("AITaaS>>>返回结果：", res.status);

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
