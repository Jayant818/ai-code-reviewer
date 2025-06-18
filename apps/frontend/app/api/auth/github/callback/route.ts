import { AUTH_TOKENS } from "@/lib/constants";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("request url", req.url);
  const { searchParams } = new URL(req.url);

  const accessToken = searchParams.get(AUTH_TOKENS.ACCESS_TOKEN);
  const refreshToken = searchParams.get(AUTH_TOKENS.REFRESH_TOKEN);
  const userId = searchParams.get(AUTH_TOKENS.USER_ID);
  const name = searchParams.get(AUTH_TOKENS.NAME);

  if (!accessToken || !refreshToken || !userId || !name)
    throw new Error("Github OAuth Failed");

  await createSession({
    accessToken,
    refreshToken,
    user: {
      id: userId,
      name,
    },
  });

  redirect("/");
}
