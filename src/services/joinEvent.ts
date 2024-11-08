import z from "zod";
import { channeltalk } from "@/loadenv";
import EventStore from "@/modules/stores/event";
import FormStore from "@/modules/stores/form";
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

export async function receiveFormAnswer(params: FuncReqParams, context: FuncReqContext) {
  const { userId, eventId, answer } = z
    .object({
      userId: z.string(),
      eventId: z.number(),
      answer: z.string(),
    })
    .parse(params.input);

  const event = EventStore.getEvent(eventId);
  if (!event) {
    throw new Error("Invalid eventId argument"); // Bad Request
  }

  const form = FormStore.getForm(event.formId);
  if (!form) {
    throw new Error("Invalid formId field in event"); // Internal Server Error
  }

  await FormStore.addAnswer(form.id, {
    userId,
    content: answer,
  });

  return {};
}
