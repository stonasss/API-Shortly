import { db } from "../config/database.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function register(req, res) {
    const { email, name, password, confirmPassword } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const emailExists = await db.query(
            `
            SELECT * FROM "public.users"
            WHERE "email" = $1`,
            [email]
        );

        if (emailExists.rows.length > 0)
            return res.status(409).send("Email already registered");

        const newUser = await db.query(
            `
            INSERT INTO "public.users" (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [name, email, hashedPassword]
        );
        return res.status(201).send("New user registered");
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function logIn(req, res) {
    const { email, password } = req.body;
    const token = uuidv4();

    try {
        const userExists = await db.query(
            `
            SELECT * FROM "public.users"
            WHERE "email" = $1`,
            [email]
        );
        const pwCorrect = bcrypt.compareSync(password, userExists.rows[0].password);

        if (userExists.rows.length === 0 || !pwCorrect) {
            return res.status(401).send("Invalid information");
        }

        const userId = userExists.rows[0].id;
        const sessionExists = await db.query(
            `
            SELECT * FROM "public.sessions"
            WHERE "userid" = $1`,
            [userId]
        );
        
        if (sessionExists.rows.length > 0) {
            const userToken = sessionExists.rows[0].token
            return res.status(200).json({ token: userToken });

        } else {
            const newSession = await db.query(
                `
                INSERT INTO "public.sessions" (token, userid)
                VALUES ($1, $2)
                RETURNING *`,
                [token, userId]
            );

            const newToken = newSession.rows[0].token
            return res.status(200).json({ token: newToken });
        }

    } catch (err) {
        return res.status(500).send(err.message);
    }
}