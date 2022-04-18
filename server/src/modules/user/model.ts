import { model, Schema } from "mongoose";
import { compare, genSalt, hash } from "bcrypt";
import { User, UserRole } from "./types";

type InstanceMethods = {
  validatePassword: (
    passwordCandidate: string,
    storedPassword: string
  ) => Promise<boolean>;
};

type IUser = InstanceMethods & User;

export const userSchema = new Schema<IUser, {}, InstanceMethods>({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: [UserRole.USER, UserRole.ADMIN],
    required: true,
    default: UserRole.USER,
  },
  password: {
    type: String,
    required: true,
  },
});
userSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await genSalt(10);
    const savedPassword = this.get("password");
    const password = await hash(savedPassword, salt);
    this.set("password", password);
    return next();
  } catch (err) {
    // @ts-ignore
    return next(err);
  }
});

userSchema.methods.validatePassword = async (
  passwordCandidate: string,
  storedPassword: string
) => {
  return await compare(passwordCandidate, storedPassword);
};

export const UserModel = model<IUser>("user", userSchema);

export const updateUser = async (
  filter: object,
  update: object,
  options: object
) => await UserModel.updateOne(filter, update, options);

export const createUser = async (userBody: User) => {
  const newUser = new UserModel(userBody);
  return await newUser.save();
};

export const findOneUser = async (props: Partial<User>) =>
  await UserModel.findOne(props);
export const updateUserById = async (id: string, newUser: User) =>
  await UserModel.findByIdAndUpdate(id, newUser, {
    useFindAndModify: true,
    new: true,
  });
export const findUserById = async (id: string) => await UserModel.findById(id);
export const findUserByIdWithoutSensitiveInfo = async (id: string) =>
  await UserModel.findById(id).select({
    _id: 1,
    name: 1,
    username: 1,
  });
export const findUsersWithoutSensitiveInfo = async () =>
  await UserModel.find().select({ _id: 1, name: 1, username: 1 });
export const deleteUserById = async (id: string) =>
  await UserModel.findByIdAndDelete(id);
