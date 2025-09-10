import express from "express";
import { userController } from "@/controllers/users-controller";
import { authHandler } from "@/middlewares/auth-handler";

const router = express.Router();

router.get("/get-user", authHandler, userController.getUserInformation);

router.delete("/", authHandler, userController.deActivateUser);

router.get("/callback", userController.generateAuthGoogleUrl);

router.post("/verify-user-by-email-otp", userController.verifyEmailByOpt);

router.post("/signup", userController.signUpUserReg);

router.post("/signin", userController.signInUserReg);

router.get("/signup/google", userController.signUpOrSignInWithGoogle);

router.get("/signup/github", userController.signUpUserViaGitHub);

export default router;
