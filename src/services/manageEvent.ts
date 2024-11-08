import z from "zod";
import { channeltalk } from "@/loadenv";
import EventStore from "@/modules/stores/event";
import FormStore from "@/modules/stores/form";
import type { FuncReqParams, FuncReqContext } from "@/types";

export async function sendWAM(params: FuncReqParams, context: FuncReqContext) {
  console.log("INFO::manageEvent::Request received");
  const rtn = {
    type: "wam",
    attributes: {
      appId: channeltalk.appId,
      name: "manageEvent",
      wamArgs: {
        managerId: context.caller.id,
        channelId: context.channel.id,
        events: EventStore.getEvents(),
      },
    },
  };

  console.log("INFO::manageEvent::Request processed");

  return rtn;
}

export function sendFormAnswers(params: FuncReqParams, context: FuncReqContext) {
  const { eventId } = z
    .object({
      eventId: z.number(),
    })
    .parse(params.input);

  const event = EventStore.getEvent(eventId);
  if (!event) {
    throw new Error("Invalid eventId argument");
  }

  const form = FormStore.getForm(event.formId);
  if (!form) {
    throw new Error("Invalid formId field in event");
  }

  return { answers: form.answers };
}
