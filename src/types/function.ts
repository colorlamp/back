import z from "zod";

export const funcReqSchema = z.object({
  method: z.string(),
  params: z.object({}).passthrough(),
  context: z.object({
    channel: z.object({
      id: z.string(),
    }),
    caller: z.object({
      type: z.enum(["app", "user", "manager"]),
      id: z.string().optional(),
    }),
  }),
});

export type FuncReq = z.infer<typeof funcReqSchema>;
export type FuncReqParams = FuncReq["params"];
export type FuncReqContext = FuncReq["context"];

export type FuncRes =
  | {
      result: object | any[];
    }
  | {
      error: {
        type: string;
        message: string;
      };
    };
