import { getServerSideConfig } from "@/app/config/server";
import {
  ServerAPIPath,
  ModelProvider,
  Baidu
} from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { isModelAvailableInServer } from "@/app/utils/model";
import { getAccessToken } from "@/app/utils/baidu";
import { sys } from "@/app/utils/sys";

const serverConfig = getServerSideConfig();

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  sys.log.info("[Baidu Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const authResult = auth(req, ModelProvider.Baidu);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  if (!serverConfig.baiduApiKey || !serverConfig.baiduSecretKey) {
    return NextResponse.json(
      {
        error: true,
        message: `missing BAIDU_API_KEY or BAIDU_SECRET_KEY in server env vars`,
      },
      {
        status: 401,
      },
    );
  }

  try {
    const response = await request(req);
    return response;
  } catch (e) {
    sys.log.error("[Baidu] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

async function request(req: NextRequest) {
  const controller = new AbortController();

  let path = `${req.nextUrl.pathname}`.replaceAll(ServerAPIPath.Baidu, "");

  let baseUrl = serverConfig.baiduBaseUrl || Baidu.BaseUrl;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  sys.log.info("[Proxy] ", path);
  sys.log.info("[Base Url]", baseUrl);

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  const { access_token } = await getAccessToken(
    serverConfig.baiduApiKey as string,
    serverConfig.baiduSecretKey as string,
  );
  const fetchUrl = `${baseUrl}${path}?access_token=${access_token}`;

  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    method: req.method,
    body: req.body,
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  // #1815 try to refuse some request to some models
  if (serverConfig.customModels && req.body) {
    try {
      const clonedBody = await req.text();
      fetchOptions.body = clonedBody;

      const jsonBody = JSON.parse(clonedBody) as { model?: string };

      // not undefined and is false
      if (
        isModelAvailableInServer(
          serverConfig.customModels,
          jsonBody?.model as string,
          ModelProvider.Baidu as string,
        )
      ) {
        return NextResponse.json(
          {
            error: true,
            message: `you are not allowed to use ${jsonBody?.model} model`,
          },
          {
            status: 403,
          },
        );
      }
    } catch (e) {
      sys.log.error(`[Baidu] filter`, e);
    }
  }
  try {
    const res = await fetch(fetchUrl, fetchOptions);

    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
