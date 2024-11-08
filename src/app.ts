import express from "express";

import { port, trustProxy } from "./loadenv";

const app = express();

app.set("trust proxy", trustProxy);

// 미들웨어
app.use(express.json());

// 라우터
// TODO

app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에 실행되었습니다.`);
});
