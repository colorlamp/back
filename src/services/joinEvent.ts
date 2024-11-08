import { channeltalk } from "@/loadenv";
import EventStore from "@/modules/stores/event";
import type { FuncReqParams, FuncReqContext } from "@/types";

export async function sendWAM(params: FuncReqParams, context: FuncReqContext) {
  console.log("INFO::joinEvent::Request received");
  const rtn = {
    type: "wam" as const,
    attributes: {
      appId: channeltalk.appId,
      name: "joinEvent",
      wamArgs: {
        userId: context.caller.id,
        channelId: context.channel.id,
        events: EventStore.getEvents(),
      },
    },
  };

  console.log("INFO::joinEvent::Request processed");

  return rtn;
}
