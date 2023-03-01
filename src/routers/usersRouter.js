import { Router } from "express";
import { register } from "../controllers/users.controller.js";

const usersRouter = Router();

usersRouter.post("/signup", register);

export default usersRouter;
