import User from './userModel';
import { AppError } from '../../middlewares/errorMiddleware';
import { IUser } from '../../types';



export async function getUserById(userId: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
}



export async function updateUser(
  userId: string,
  updates: { name?: string; avatar?: string }
): Promise<IUser> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) throw new AppError('User not found', 404);
  return user;
}



export async function deleteUser(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  await user.deleteOne();
}