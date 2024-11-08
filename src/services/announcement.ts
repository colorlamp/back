import type { Command, FuncReqParams, FuncReqContext } from "@/types";
import { channeltalk } from "../loadenv";

export async function sendWAM(params: FuncReqParams, context: FuncReqContext) {
  console.log("INFO::Announcement::Request received");
  const rtn = {
    type: "wam",
    attributes: {
      appId: channeltalk.appId,
      name: "announcement",
      wamArgs: {
        managerId: context.caller.id,
        channelId: context.channel.id,
        events: [],
      },
    },
  };

  console.log("INFO::Announcement::Request processed");

  return rtn;
}

export async function sendMsg(params: FuncReqParams, context: FuncReqContext) {
  console.log("INFO::sendMsg::Request received");
  const rtn = {
    type: "wam",
    attributes: {
      appId: channeltalk.appId,
      name: "sendMsg",
      wamArgs: {
        managerId: context.caller.id,
        channelId: context.channel.id,
        events: [],
      },
    },
  };

  console.log("INFO::sendMsg::Request processed");

  return rtn;
}