import type { Command, FuncReqParams, FuncReqContext, CmdReqParams, CmdReqContext } from "@/types";
import { channeltalk } from "../loadenv";

import EventStore from "@/modules/stores/event";

export async function sendWAM(params: CmdReqParams, context: CmdReqContext) {
  console.log("INFO::Announcement::Request received");
  const rtn = {
    type: "wam" as const,
    attributes: {
      appId: channeltalk.appId,
      name: "announcement",
      wamArgs: {
        managerId: context.caller.id,
        channelId: context.channel.id,
        events: EventStore.getEvents(),
      },
    },
  };

  console.log("INFO::Announcement::Request processed");

  return rtn;
}
