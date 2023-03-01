import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routers/usersRouter.js";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());
app.use([usersRouter]);

app.listen(PORT, () => {
    console.log(`Servidor aberto no port ${PORT}`);
});