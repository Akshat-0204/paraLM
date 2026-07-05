import { Router } from "express";
import * as authController from "./authController"
import { validate } from "../../middlewares/validateMiddleware";
import { loginSchema, registerSchema, updateProfileSchema } from "./authSchema";

const router = Router();

//unprotected
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

//protected 
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/profile', validate(updateProfileSchema), authController.updateProfile)

router.patch('/change-password', validate(updateProfileSchema), authController.changePassword)

export default router
