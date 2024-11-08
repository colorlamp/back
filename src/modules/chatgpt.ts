import OpenAI from "openai";
import { chatgpt } from "@/loadenv";
import QuestionStore from "@/modules/stores/question";

const openai = new OpenAI({ apiKey: chatgpt.secret });

// const SIMILAR_QUESTION_PROMOT;

export async function maskPrivacyInfo(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "다음 텍스트에 개인정보가 포함되어 있을 경우, *으로 모두 마스킹해줘. 그 외에는 입력된 텍스트를 그대로 출력해줘. 질문에 답변하지 마. 단순히 마스킹하는 업무만 수행해.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });
  const response = completion.choices[0].message.content;
  if (!response) {
    console.error("Failed to get response from GPT-4o");
    console.info("Completion: ", completion);
    return null;
  }

  console.info("Original Text: ", text);
  console.info("Response: ", response);

  return response;
}

export async function searchSimilarQuestions(orginalQuestion: string) {
  const answeredQuestions = QuestionStore.getQuestions();
  if (answeredQuestions.length === 0) {
    return null;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "너는 CS 응대 봇이야. 사용자의 질문이, 사전에 이미 이루어진 질문&답변과 유사한 경우, 관련된 답변을 기반으로 사용자의 새 질문에 답변해줘. 유사한 질문&답변이 존재하지 않으면, XXX라고 답변해줘.",
      },
      {
        role: "system",
        content:
          "다음은 사전에 이미 이루어진 질문&답변 목록이야: \n\n" +
          answeredQuestions.map(({ question, answer }) => `Q: ${question}\nA: ${answer}`).join("\n\n"),
      },
      {
        role: "user",
        content: orginalQuestion,
      },
    ],
  });
  const response = completion.choices[0].message.content;
  if (!response) {
    console.error("Failed to get response from GPT-4o");
    console.info("Completion: ", completion);
    return null;
  }

  console.info("Original Question: ", orginalQuestion);

  if (response.toLowerCase().includes("xxx")) {
    console.info("No similar question found");
    return null;
  } else {
    console.info("Similar question found");
    console.info("Response: ", response);
    return response;
  }
}
