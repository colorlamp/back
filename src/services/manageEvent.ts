import z from "zod";
import { channeltalk } from "@/loadenv";
import EventStore from "@/modules/stores/event";
import FormStore from "@/modules/stores/form";
import type { FuncReqParams, FuncReqContext, CmdReqParams, CmdReqContext } from "@/types";

export async function sendWAM(params: CmdReqParams, context: CmdReqContext) {
  console.log("INFO::manageEvent::Request received");
  const rtn = {
    type: "wam" as const,
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
  console.log("INFO::manageEvent::sendFormAnswers::Request received");
  const { eventId } = z
    .object({
      eventId: z.number(),
    })
    .parse(params);

  const event = EventStore.getEvent(eventId);
  console.log("INFO::manageEvent::sendFormAnswers::event", event);
  if (!event) {
    throw new Error("Invalid eventId argument"); // Bad Request
  }

  const form = FormStore.getForm(event.formId);
  console.log("INFO::manageEvent::sendFormAnswers::form", form);
  if (!form) {
    throw new Error("Invalid formId field in event"); // Internal Server Error
  }

  console.log("INFO::manageEvent::sendFormAnswers::Request processed");
  return { answers: form.answers };
}

export function sendEventChatIds(params: FuncReqParams, context: FuncReqContext) {
  const { eventId } = z
    .object({
      eventId: z.number(),
    })
    .parse(params);

  const chatIds = EventStore.getChatIdsbyEventId(eventId);
  if (!chatIds) {
    throw new Error("Invalid eventId argument"); // Bad Request
  }

  return { chatIds };
}