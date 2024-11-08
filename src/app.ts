import express from "express";

import { port, trustProxy } from "./loadenv";
import { regesterCommand, verifySignature } from "./modules/channeltalk";
import EventStore from "./modules/stores/event";
import FormStore from "./modules/stores/form";
import TokenStore from "./modules/stores/token";
import { cmdReqSchema, funcReqSchema, type CmdResWAM, type Command, type FuncRes } from "./types";

import * as announcement from "./services/announcement";
import * as manageEvent from "./services/manageEvent";
import * as joinEvent from "./services/joinEvent";

startServer();

async function startServer() {
  await EventStore.loadEvents(); // events.json 파일이 존재하면 불러옴
  await FormStore.loadForms(); // forms.json 파일이 존재하면 불러옴
  await TokenStore.loadTokens(); // tokens.json 파일이 존재하면 불러옴

  await TokenStore.getAccessToken(); // 기본 토큰 자동 발급
  await registerCommands(); // 커맨드 등록

  const app = express();

  app.set("trust proxy", trustProxy);

  // 미들웨어
  app.use(express.json());

  app.get("/", async function (req, res) {
    res.send("<h1>It Works!</h1>");
  });

  // 라우터
  app.put("/callback", async function (req, res) {
    console.log("INFO::Received Callback");
    console.log(req.body);
    if (
      typeof req.headers["x-signature"] !== "string" ||
      !verifySignature(req.headers["x-signature"], JSON.stringify(req.body))
    ) {
      res.status(401).send("Unauthorized");
      return;
    }
    console.log("INFO::Verified Signature");

    const cmdReq = cmdReqSchema.safeParse(req.body);
    if (cmdReq.success) {
      console.log("INFO::Command::Parsed Callback");
      const { method, params, context } = cmdReq.data;
      console.log("INFO::Command::Parsed Callback");

      let cmdRes: CmdResWAM | null = null;

      switch (method) {
        case "announcement":
          cmdRes = await announcement.sendWAM(params, context);
          break;
        case "manageEvent":
          cmdRes = await manageEvent.sendWAM(params, context);
          break;
        case "joinEvent":
          cmdRes = await joinEvent.sendWAM(params, context);
          break;
      }

      if (cmdRes) {
        console.log("DEBUG::Command::Response");
        console.log(JSON.stringify(cmdRes));
        res.json({
          result: cmdRes,
        } satisfies FuncRes); // Command도 Function이다..
      } else {
        res.json({
          error: {
            type: "error",
            message: "Bad Request",
          },
        } satisfies FuncRes);
      }
      return;
    }

    const funcReq = funcReqSchema.safeParse(req.body);
    if (funcReq.success) {
      const { method, params, context } = funcReq.data;
      console.log("INFO::Function::Parsed Callback");
      console.log("DEBUG::Function::Request params");
      // console.log(JSON.stringify(params));

      let funcRes: object | null = null;

      switch (method) {
        case "getFormAnswers":
          funcRes = manageEvent.sendFormAnswers(params, context);
          break;
        case "submitFormAnswer":
          funcRes = joinEvent.receiveFormAnswer(params, context);
          break;
        case "getEventChatIds":
          funcRes = manageEvent.sendEventChatIds(params, context);
          break;
        case "createNewEvent":
          funcRes = manageEvent.createNewEvent(params, context);
          break;
      }

      if (funcRes) {
        console.log("DEBUG::Function::Response");
        console.log(JSON.stringify(funcRes));
        res.json({
          result: funcRes,
        } satisfies FuncRes);
      } else {
        res.json({
          error: {
            type: "error",
            message: "Bad Request",
          },
        } satisfies FuncRes);
      }
      return;
    }

    res.json({
      error: {
        type: "error",
        message: "Bad Request",
      },
    } satisfies FuncRes);
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

async function registerCommands() {
  // TODO
  const command = [
    {
      name: "announcement",
      scope: "desk",
      description: "Make an announcement to the customer",
      nameDescI18nMap: {
        en: {
          description: "Make an announcement to the customer",
          name: "announcement",
        },
        ko: {
          description: "고객에게 공지를 전달합니다.",
          name: "공지",
        },
        ja: {
          description: "顧客にお知らせをします。",
          name: "アナウンス",
        },
      },
      actionFunctionName: "announcement",
      paramDefinitions: [],
      enabledByDefault: true,
      alfMode: "disable",
    },
    {
      name: "manageEvent",
      scope: "desk",
      description: "Manage an event",
      nameDescI18nMap: {
        en: {
          description: "Manage an event",
          name: "manageEvent",
        },
        ko: {
          description: "이벤트를 관리합니다.",
          name: "이벤트관리",
        },
        ja: {
          description: "イベントを管理します。",
          name: "イベント管理",
        },
      },
      actionFunctionName: "manageEvent",
      paramDefinitions: [],
      enabledByDefault: true,
      alfMode: "disable",
    },
    {
      name: "joinEvent",
      scope: "front",
      description: "Join an event",
      nameDescI18nMap: {
        en: {
          description: "Join an event",
          name: "event",
        },
        ko: {
          description: "이벤트에 참여합니다.",
          name: "이벤트",
        },
        ja: {
          description: "イベントに参加します。",
          name: "イベント",
        },
      },
      actionFunctionName: "joinEvent",
      paramDefinitions: [],
      enabledByDefault: true,
      alfMode: "disable",
    },
  ] satisfies Command[];

  await regesterCommand(command);
}
