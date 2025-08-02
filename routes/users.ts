import express from "express";
import { userController } from "../controllers/users-controller";

const router = express.Router();

router.get("/callback", userController.generateAuthGoogleUrl);

router.get("/:id", userController.getUserByEmail);

router.post("/signup", userController.signUpUserReg);

router.post('/signin',userController.signInUserReg)

router.get("/signup/google", userController.signUpOrSignInWithGoogle);

router.get("/signup/linkedin", userController.signUpUserViaLinkedin);

router.get("/signup/github", userController.signUpUserViaGitHub);

router.delete("/:id", userController.deActivateUser);

router.patch("/:id", userController.updateUserById);

export default router;
