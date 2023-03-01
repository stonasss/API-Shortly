import { Router } from "express";
import { register } from "../controllers/users.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { registerSchema } from "../schemas/registerSchema.js";

const usersRouter = Router();

usersRouter.post("/signup", validateSchema(registerSchema), register);

export default usersRouter;
