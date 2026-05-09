import { ModelProvider } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { requestOpenai } from "./common";
import { sys } from "@/app/utils/sys";

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  sys.log.info("[Azure Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  const authResult = auth(req, ModelProvider.Azure);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    return await requestOpenai(req);
  } catch (e) {
    sys.log.error("[Azure] ", e);
    return NextResponse.json(prettyObject(e));
  }
}
