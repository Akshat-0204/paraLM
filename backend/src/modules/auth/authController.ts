import { Request, Response, NextFunction } from "express";
import * as authService from "./authServices"
import { ChangePasswordInput, LoginInput, RegisterInput, UpdateProfileInput } from "./authSchema";
import { success } from "zod";

export async function register(req: Request, res: Response , next : NextFunction): Promise<void>{
    try {
        const input = req.body as RegisterInput;
        const {user, token} = await authService.registerUser(input)

        res.status(201).json({
            success : true,
            message : 'Account created successfully',
            data : {user, token} 
        })
    } catch (error) {
        next(error)
    }
}

//login
export async function login(req: Request, res: Response , next : NextFunction): Promise<void>{
    try {
        const input = req.body as LoginInput;
        const {user, token} = await authService.loginUser(input)

        res.status(201).json({
            success : true,
            message : 'login successfully',
            data : {user, token} 
        })
    } catch (error) {
        next(error)
    }
}

//logout 
export async function logout(
    _req : Request,
    res: Response , 
    next: NextFunction
): Promise<void>{
    try {
            res.status(200).json({
        success : true,
        message : 'Logged out successfully',
    })
    } catch (error) {
        next(error)
    }

}

//get current user 
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

//update profile 
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const input = req.body as UpdateProfileInput;

    const user = await authService.updateUserProfile(userId, input);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;

    await authService.changeUserPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
}