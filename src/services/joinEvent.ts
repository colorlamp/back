import type { Command, FuncReqParams, FuncReqContext } from "@/types";
import { channeltalk } from "../loadenv";

export default async function manageEvent(params: FuncReqParams, context: FuncReqContext) {
  console.log("INFO::joinEvent::Request received");
  const rtn = {
    type: "wam",
    attributes: {
      appId: channeltalk.appId,
      name: "manageEvent",
      wamArgs: {
        managerId: context.caller.id,
        channelId: context.channel.id,
        events: [],
      },
    },
  };

  console.log("INFO::manageEvent::Request processed");

  return rtn;
}
