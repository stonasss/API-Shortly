import { Router } from "express";
import { ranking } from "../controllers/ranking.controller.js";

const rankingRouter = Router();

rankingRouter.get("/ranking", ranking)

export default rankingRouter;