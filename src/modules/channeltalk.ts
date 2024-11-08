import axios from "axios";
import crypto from "crypto";
import z from "zod";
import { channeltalk } from "@/loadenv";
import TokenStore from "./stores/token";

import type { Command, FuncReqParams, FuncReqContext } from "@/types";

export async function verifySignature(signature: string, body: string) {
  const key = crypto.createSecretKey(Buffer.from(channeltalk.signingKey, "hex"));
  const mac = crypto.createHmac("sha256", key);

  mac.update(body, "utf8");

  return mac.digest("base64") === signature;
}

export async function writeUserChatMessage(channelId: string, userChatId: string, message: string) {
  const params = {
    channelId,
    userChatId,
    dto: {
      plainText: message,
      botName: "UMS for U"
    }
  }

  console.log("DEBUG::writeUserChatMessage::params", params);

  return _requestNativeFunction("writeUserChatMessage", params, channelId);
}

export async function regesterCommand(command: Command[]) {
  const params = {
    appId: channeltalk.appId,
    commands: command,
  };

  console.log("hi");

  return _requestNativeFunction("registerCommands", params);
}

export async function getChannel(channelId: string) {
  const params = {
    channelId,
  };

  return _requestNativeFunction("getChannel", params);
}

export async function getUser(userId: string, channelId?: string) {
  const params = {
    userId,
  };

  return _requestNativeFunction("getUser", params, channelId);
}

async function _requestNativeFunction(method: string, params: any, channelId?: string) {
  const baseUrl = channeltalk.appStoreUrl;

  const header = {
    "Content-Type": "application/json",
    "x-access-token": await TokenStore.getAccessToken(channelId),
  };
  const data = {
    method: method,
    params: params,
  };

  if (channelId) {
    data.params.channelId = channelId;
  }

  const rtn = await axios.put(baseUrl, data, { headers: header });

  console.log("DEBUG::requestNativeFunction::response", rtn.status, rtn.data);

  return rtn.data.result;
}
