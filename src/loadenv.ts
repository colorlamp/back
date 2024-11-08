import dotenv from "dotenv";

dotenv.config();

export const port = parseInt(process.env.PORT || "3000", 10);
export const trustProxy = parseInt(process.env.TRUST_PROXY || "0", 10);
