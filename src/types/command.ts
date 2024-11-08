import z from "zod";

type DescI18nMap = Record<string, { name: string; description: string }>;

interface ParamDefinition {
  name: string;
  type: "string" | "float" | "int" | "bool";
  required: boolean;
  description?: string;
  choices?: {
    name: string;
    value: string;
    nameDescI18nMap: DescI18nMap;
  }[];
  nameDescI18nMap?: DescI18nMap;
  autoComplete?: boolean;
}

export interface Command {
  name: string;
  scope: "desk" | "front";
  description?: string;
  nameDescI18nMap: DescI18nMap;
  actionFunctionName: string;
  autoCompleteFunctionName?: string;
  paramDefinitions: ParamDefinition[];
  enabledByDefault?: boolean;
  alfMode: "disable";
}

export const cmdReqSchema = z.object({
  method: z.string(),
  params: z.object({
    chat: z.object({
      type: z.enum(["group", "userChat", "directChat"]),
      id: z.string(),
    }),
    input: z.record(z.any()),
    language: z.string().optional(),
  }),
  context: z.object({
    channel: z.object({
      id: z.string(),
    }),
    caller: z.object({
      type: z.string(),
      id: z.string().optional(),
    }),
  }),
});

export type CmdReq = z.infer<typeof cmdReqSchema>;
export type CmdReqParams = CmdReq["params"];
export type CmdReqContext = CmdReq["context"];

export interface CmdResWAM {
  type: "wam";
  attributes: {
    appId: string;
    name: string;
    wamArgs: object;
  };
}
