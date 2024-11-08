import dotenv from "dotenv";

dotenv.config();

export const port = parseInt(process.env.PORT || "3000", 10);
export const trustProxy = parseInt(process.env.TRUST_PROXY || "0", 10);

export const channeltalk = {
  appId: process.env.CHANNELTALK_APP_ID!, // Required
  appSecret: process.env.CHANNELTALK_APP_SECRET!, // Required
  signingKey: process.env.CHANNELTALK_SIGNING_KEY, // Optional
  appStoreUrl: process.env.CHANNELTALK_APPSTORE_URL!, // Required
};
