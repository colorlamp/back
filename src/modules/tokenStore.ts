import axios from "axios";
import fs from "fs/promises";
import z from "zod";
import { channeltalk } from "@/loadenv";

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expireAt: number;
}

const ACCESS_TOKEN_EXPIRES_IN = (1800 - 5) * 1000; // 30분 - 5초

export default class TokenStore {
  static #tokens = new Map<string | null, TokenInfo>();

  static async getAccessToken(channelId?: string) {
    const tokenInfo = this.#tokens.get(channelId ?? null);

    // 새로운 채널
    if (!tokenInfo) {
      console.log("INFO::Fetching New Token for new Channel");
      const tokenInfo = await issueTokens(channelId);

      this.#tokens.set(channelId ?? null, tokenInfo);
      await this.#saveTokens();

      return tokenInfo.accessToken;
    }

    // 만료된 토큰
    if (Date.now() >= tokenInfo.expireAt) {
      console.log("INFO::Refreshing Token");
      const newTokenInfo = await refershAccessToken(tokenInfo.refreshToken);

      this.#tokens.set(channelId ?? null, {
        ...newTokenInfo,
        refreshToken: tokenInfo.refreshToken,
      });
      await this.#saveTokens();

      return newTokenInfo.accessToken;
    }

    return tokenInfo.accessToken;
  }

  static async loadTokens() {
    try {
      const tokens = JSON.parse(await fs.readFile("tokens.json", "utf-8"));
      this.#tokens = new Map(tokens);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  static async #saveTokens() {
    await fs.writeFile("tokens.json", JSON.stringify([...this.#tokens]));
  }
}

async function issueTokens(channelId?: string) {
  console.log("issueTokens");

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

  console.log(response.data);

  const { accessToken, refreshToken } = z
    .object({
      accessToken: z.string(),
      refreshToken: z.string(),
    })
    .parse(response.data.result);

  return {
    accessToken,
    refreshToken,
    expireAt: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
  };
}

async function refershAccessToken(refreshToken: string) {
  console.log("refershAccessToken");

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

  // const accessToken = response.headers["x-access-token"];
  const accessToken = response.data.result.accessToken;
  if (typeof accessToken !== "string") {
    console.log(response.data);
    throw new Error("x-access-token header is missing");
  }

  return {
    accessToken,
    expireAt: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
  };
}
