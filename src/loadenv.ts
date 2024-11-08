import dotenv from "dotenv";

dotenv.config();

export const port = parseInt(process.env.PORT || "3000", 10);
export const trustProxy = parseInt(process.env.TRUST_PROXY || "0", 10);

export const channeltalk = {
  appId: process.env.CT_APP_ID!, // Required
  appSecret: process.env.CT_APP_SECRET!, // Required
  signingKey: process.env.CT_SIGNING_KEY!, // Required
  appStoreUrl: process.env.CT_APPSTORE_URL!, // Required
};

export const chatgpt = {
  secret: process.env.GPT_SECRET!, // Required
};
