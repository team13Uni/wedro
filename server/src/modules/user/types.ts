export type User = {
  id?: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
};

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}
