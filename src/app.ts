import express from "express";
import z from "zod";

import { port, trustProxy } from "./loadenv";
import TokenStore from "./modules/tokenStore";

startServer();

async function startServer() {
  await TokenStore.loadTokens(); // tokens.json 파일이 존재하면 불러옴
  await TokenStore.getAccessToken(); // 기본 토큰 자동 발급

  await registerCommands(); // 커맨드 등록

  const app = express();

  app.set("trust proxy", trustProxy);

  // 미들웨어
  app.use(express.json());

  // 라우터
  app.put("/api/callback", async function (req, res) {
    const { method, params, context } = z
      .object({
        method: z.string(),
        params: z.object({}), // TODO
        context: z.object({
          channel: z.object({
            id: z.string(),
          }),
          caller: z.object({
            type: z.string(),
            id: z.string(),
          }),
        }),
      })
      .parse(req.body);

    // TODO
  });

  app.listen(port, () => {
    console.log(`서버가 ${port}번 포트에 실행되었습니다.`);
  });
}

async function registerCommands() {
  // TODO
}
