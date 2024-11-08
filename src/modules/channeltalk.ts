import axios from "axios";
import z from "zod";
import { channeltalk } from "@/loadenv";

export async function requestTokens(channelId?: string) {
  const body = {
    method: "issueToken",
    params: {
      secret: channeltalk.appSecret,
      channelId,
    },
  };
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await axios.put(channeltalk.appStoreUrl, body, { headers });

  const { accessToken, refreshToken, expiresIn } = z
    .object({
      accessToken: z.string(),
      refreshToken: z.string(),
      expiresIn: z.number(),
    })
    .parse(response.data.result);
  const expiresAt = new Date().getTime() + expiresIn * 1000 - 5000; // 5초 마진

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const body = {
    method: "refreshToken",
    params: {
      refreshToken,
    },
  };
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await axios.put(channeltalk.appStoreUrl, body, { headers });

  const accessToken = response.headers["x-access-token"];
  if (typeof accessToken !== "string") {
    throw new Error("x-access-token header is missing");
  }

  return accessToken;
}
