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
  enabledByDefaul?: boolean;
}
