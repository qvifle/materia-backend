import UserFields from "../types/UserFields";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES as string;
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES as string;

const generateTokens = (user: UserFields) => {
  const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });
  const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
