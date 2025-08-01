import express from "express";
import { userController } from "../controllers/users-controller";

const router = express.Router();

router.get("/callback", userController.generateAuthGoogleUrl);

router.get("/:id", userController.getUserByEmail);

router.post("signup", userController.signUpUserReg);

router.post("signup/google", userController.signUpUserViaGoogle);

router.post("signup/linkedin", userController.signUpUserViaLinkedin);

router.post("signup/github", userController.signUpUserViaGitHub);

router.post("signup/telegram", userController.signUpUserViaTelegram);

router.delete("/:id", userController.deActivateUser);

router.patch("/:id", userController.updateUserById);

export default router;
