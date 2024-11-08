import z from "zod";
import { channeltalk } from "@/loadenv";
import EventStore from "@/modules/stores/event";
import FormStore from "@/modules/stores/form";
import type { FuncReqParams, FuncReqContext, CmdReqParams, CmdReqContext } from "@/types";

export async function sendWAM(params: CmdReqParams, context: CmdReqContext) {
  console.log("INFO::joinEvent::Request received");
  const rtn = {
    type: "wam" as const,
    attributes: {
      appId: channeltalk.appId,
      name: "joinEvent",
      wamArgs: {
        userId: context.caller.id,
        channelId: context.channel.id,
        chatId: params.chat.id,
        events: EventStore.getEvents(),
      },
    },
  };

  console.log("INFO::joinEvent::Request processed");

  return rtn;
}

export async function receiveFormAnswer(params: FuncReqParams, context: FuncReqContext) {
  console.log("INFO::joinEvent::receiveFormAnswer::Request received");
  // console.log(JSON.stringify(params));
  // console.log(JSON.stringify(context));

  const { userId, eventId, answer } = z
    .object({
      userId: z.string(),
      eventId: z.number(),
      answer: z.string(),
    })
    .parse(params);

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

export async function sendFormData(params: FuncReqParams, context: FuncReqContext) {
  console.log("INFO::joinEvent::sendFormData::Request received");
  const { eventId } = z
    .object({
      eventId: z.number(),
    })
    .parse(params);

  const event = EventStore.getEvent(eventId);
  console.log("INFO::joinEvent::sendFormData::event", event);
  if (!event) {
    throw new Error("Invalid eventId argument"); // Bad Request
  }

  const form = FormStore.getForm(event.formId);
  console.log("INFO::joinEvent::sendFormData::form", form);
  if (!form) {
    throw new Error("Invalid formId field in event"); // Internal Server Error
  }

  return { form };
}