import express from "express";

import { port, trustProxy } from "./loadenv";
import { regesterCommand, verifySignature } from "./modules/channeltalk";
import TokenStore from "./modules/tokenStore";
import { funcReqSchema, type Command } from "./types";

import announcement from "./services/announcement";

startServer();

async function startServer() {
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
    // console.log(req.body);
    if (
      typeof req.headers["x-signature"] !== "string" ||
      !verifySignature(req.headers["x-signature"], JSON.stringify(req.body))
    ) {
      res.status(401).send("Unauthorized");
      return;
    }

    const { method, params, context } = funcReqSchema.parse(req.body);
    console.log("INFO::Parsed Request");

    switch (method) {
      //announcement
      case "announcement":
        res.json({
          result: await announcement(params, context),
        });
    }
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
      actionFunctionName: "makeEvent",
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
