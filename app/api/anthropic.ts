import { getServerSideConfig } from "@/app/config/server";
import {
  Anthropic,
  ServerAPIPath,
  ModelProvider
} from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { isModelAvailableInServer } from "@/app/utils/model";
import { cloudflareAIGatewayUrl } from "@/app/utils/cloudflare";
import { sys } from "@/app/utils/sys";

const ALLOWD_PATH = new Set([Anthropic.ChatPath, Anthropic.ChatPath1]);

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  sys.log.info("[Anthropic Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  if (!ALLOWD_PATH.has(subpath)) {
    sys.log.info("[Anthropic Route] forbidden path ", subpath);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + subpath,
      },
      {
        status: 403,
      },
    );
  }

  const authResult = auth(req, ModelProvider.Anthropic);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const response = await request(req);
    return response;
  } catch (e) {
    sys.log.error("[Anthropic] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

const serverConfig = getServerSideConfig();

async function request(req: NextRequest) {
  const controller = new AbortController();

  let authHeaderName = "x-api-key";
  let authValue =
    req.headers.get(authHeaderName) ||
    req.headers.get("Authorization")?.replaceAll("Bearer ", "").trim() ||
    serverConfig.anthropicApiKey ||
    "";

  let path = `${req.nextUrl.pathname}`.replaceAll(ServerAPIPath.Anthropic, "");

  let baseUrl =
    serverConfig.anthropicBaseUrl || Anthropic.BaseUrl;

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

  // try rebuild url, when using cloudflare ai gateway in server
  const fetchUrl = cloudflareAIGatewayUrl(`${baseUrl}${path}`);

  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "anthropic-dangerous-direct-browser-access": "true",
      [authHeaderName]: authValue,
      "anthropic-version":
        req.headers.get("anthropic-version") ||
        serverConfig.anthropicApiVersion ||
        Anthropic.Vision,
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
          ModelProvider.Anthropic as string,
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
      sys.log.error(`[Anthropic] filter`, e);
    }
  }
  // sys.log.info("[Anthropic request]", fetchOptions.headers, req.method);
  try {
    const res = await fetch(fetchUrl, fetchOptions);

    // sys.log.info(
    //   "[Anthropic response]",
    //   res.status,
    //   "   ",
    //   res.headers,
    //   res.url,
    // );
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
