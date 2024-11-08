import z from "zod";
import type { CmdReqParams, CmdReqContext } from "@/types";
import { searchSimilarQuestions, maskPrivacyInfo } from "@/modules/chatgpt";
import { writeUserChatMessage } from "@/modules/channeltalk";
import QuestionStore from "@/modules/stores/question";

let lastQuestions = new Map<string, string>();

export async function handleAskCommand(params: CmdReqParams, context: CmdReqContext) {
  const { question } = z
    .object({
      question: z.string(),
    })
    .parse(params.input);

  const response = await searchSimilarQuestions(question);
  if (response) {
    await writeUserChatMessage(
      context.channel.id,
      params.chat.id,
      `기존 답변을 바탕으로 AI가 재구성한 답변이에요:\n\n${question}`
    );
  } else {
    console.log("질문등록");
    lastQuestions.set(params.chat.id, question);
  }

  return {};
}

export async function handleAnswerCommand(params: CmdReqParams, context: CmdReqContext) {
  const { answer } = z
    .object({
      answer: z.string(),
    })
    .parse(params.input);

  const lastQuestion = lastQuestions.get(params.chat.id);
  if (!lastQuestion) {
    console.log("질문없어ㅠ");
    return {};
  }

  const maskedQuestion = await maskPrivacyInfo(lastQuestion);
  const maskedAnswer = await maskPrivacyInfo(answer);
  if (!maskedQuestion || !maskedAnswer) {
    console.log("마스킹 실패");
    return {};
  }

  await QuestionStore.addQuestion({ question: maskedQuestion, answer: maskedAnswer });
  return {};
}
