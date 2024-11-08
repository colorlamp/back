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
  static #tokens = new Map<string | undefined, TokenInfo>();

  static async getAccessToken(channelId?: string) {
    const tokenInfo = this.#tokens.get(channelId);

    // 새로운 채널
    if (!tokenInfo) {
      const tokenInfo = await issueTokens(channelId);

      this.#tokens.set(channelId, tokenInfo);
      await this.#saveTokens();

      return tokenInfo.accessToken;
    }

    // 만료된 토큰
    if (Date.now() >= tokenInfo.expireAt) {
      const newTokenInfo = await refershAccessToken(tokenInfo.refreshToken);

      this.#tokens.set(channelId, {
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

  return {
    accessToken,
    expireAt: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
  };
}
