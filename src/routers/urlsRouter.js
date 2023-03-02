import { Router } from "express";
import {
    deleteUrl,
    getUrl,
    openUrl,
    shortUrl,
    userInfo,
} from "../controllers/urls.controller.js";
import { validateToken } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { urlSchema } from "../schemas/urlSchema.js";

const urlsRouter = Router();

urlsRouter.post("/urls/shorten", validateToken, validateSchema(urlSchema), shortUrl);
urlsRouter.get("/urls/:id", getUrl);
urlsRouter.get("/urls/open/:shortUrl", openUrl);
urlsRouter.delete("/urls/:id", validateToken, deleteUrl);
urlsRouter.get("/users/me", validateToken, userInfo);

export default urlsRouter;
