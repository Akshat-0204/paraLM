
import { IUser, JwtPayload, UserRole } from "../../types";
import jwt from "jsonwebtoken"
import { LoginInput, RegisterInput } from "./authSchema";
import User from "../user/userModel";
import { AppError } from "../../middlewares/errorMiddleware";

function generateToken(user : IUser) : string {
    const secret = process.env.JWT_SECRET;
    if(!secret) throw new Error('JWT secret is not defined');

    const payLoad : JwtPayload = {
        userId : user._id.toString(),
        email : user.email,
        role : user.role as UserRole
    }

    return jwt.sign(payLoad, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    } as jwt.SignOptions);
}

//sign up 
export async function registerUser(input : RegisterInput): Promise<{
user : IUser;
token : string;
 }
>{
    const {name,  email, password} = input ;

    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new AppError('Account with this username already exisits', 409);
    }

    const user = await User.create({name, email, password});
    const token = generateToken(user);

    return {user, token};

}

//Login
export async function loginUser(input : LoginInput): Promise<{
  user: IUser;
  token: string;
}>{

    const {email, password } = input;
    const user = await User.findOne({email}).select('+password');

    if(!user){
        throw new AppError('Invalid Email or password', 401);
    }

     if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403);
  }

  const isMatch = await user.comparePassword(password);
  if(!isMatch){
    throw new Error('Invalid email or password ');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);

    return {user, token };
}

//get current user 
export async function getCurrentUser(userId : string ) : Promise<IUser>{
    const user = await User.findById(userId);
    if(!user){
        throw new AppError('User not foundd ', 404);
    }
    return user;

}

//update profilee
export async function updateUserProfile(
  userId: string,
  updates: { name?: string | undefined; avatar?: string | undefined }
): Promise<IUser> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

//change passowrd 
export async function changeUserPassword(
    userId : string,
    currentPassword: string ,
    newPassword : string 
) : Promise<void> {
    const user = await User.findById(userId).select('+password');

    if(!user){
        throw new AppError('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if(!isMatch){
        throw new AppError('Current passoword is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();
}