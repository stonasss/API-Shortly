import { db } from "../config/database.js";
import bcrypt from "bcrypt";

export async function register(req, res) {
    const { email, name, password, confirmPassword } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const emailExists = await db.query(
            `
            SELECT * FROM public.users WHERE "email = $1`,
            [email]
        );

        if (emailExists.rows.length > 0)
            return res.status(409).send("Email already registered");

        const newUser = await db.query(
            `
            INSERT INTO public.users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
            [name, email, hashedPassword]
        );
        return res.status(201).send("New user registered");
    } catch (err) {
        return res.status(500).send(err.message);
    }
}
