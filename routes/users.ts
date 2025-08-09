import { authHandler } from "@/middlewares/auth-handler";
import express from "express";
import { userController } from "@/controllers/users-controller";

const router = express.Router();

router.get("/callback", userController.generateAuthGoogleUrl);

router.get("/get-user", authHandler, userController.getUserInformation);

router.post("/verify-user-by-email-otp", userController.verifyEmailByOpt);

router.post("/signup", userController.signUpUserReg);

router.post("/signin", userController.signInUserReg);

router.get("/signup/google", userController.signUpOrSignInWithGoogle);

router.get("/signup/linkedin", userController.signUpUserViaLinkedin);

router.get("/signup/github", userController.signUpUserViaGitHub);

router.delete("/:id", authHandler, userController.deActivateUser);

router.patch("/:id", authHandler, userController.updateUserById);

export default router;
