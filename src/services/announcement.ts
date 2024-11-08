import type { Command, FuncReqParams, FuncReqContext } from "@/types";
import { channeltalk } from "../loadenv";

export default async function announcement(params: FuncReqParams, context: FuncReqContext) {
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
