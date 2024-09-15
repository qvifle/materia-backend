import { hash } from "bcrypt";
const hashPassword = async (password) => {
    return hash(password, 10);
};
export default hashPassword;
//# sourceMappingURL=hashPassword.js.map