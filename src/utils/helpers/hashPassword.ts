import { hash } from "bcrypt";


const hashPassword = async (password: string) => {
  return hash(password, 10);
};

export default hashPassword;
