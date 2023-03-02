import { Router } from "express";
import { logIn, register } from "../controllers/users.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";

const usersRouter = Router();

usersRouter.post("/signup", validateSchema(registerSchema), register);
usersRouter.post("/signin", validateSchema(loginSchema), logIn)

export default usersRouter;
