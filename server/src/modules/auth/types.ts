import { User } from "../user";

export type LoginRequestBody = {
  username: User["username"];
  password: User["password"];
};

export type LoginResponseBody = {
  username: User["username"];
  role: User["role"];
  accessToken: string;
};

export type RegisterRequestBody = User;

export type RegisterResponseBody = {
  user: Pick<User, "username" | "name">;
};
