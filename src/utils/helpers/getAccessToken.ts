import UserFields from "../types/UserFields.js";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";

const getAccessToken = (user: UserFields) => {
  const accesToken = jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "2m" });

  return accesToken;
};

export default getAccessToken;
