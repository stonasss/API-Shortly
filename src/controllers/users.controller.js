import { db } from "../config/database.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function register(req, res) {
    const { email, name, password, confirmPassword } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const emailExists = await db.query(
            `
            SELECT * FROM users
            WHERE email = $1`,
            [email]
        );

        if (emailExists.rows.length > 0)
            return res.status(409).send("Email already registered");

        await db.query(
            `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)`,
            [name, email, hashedPassword]
        );
        return res.status(201).send("New user registered");
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function logIn(req, res) {
    const { email, password } = req.body;

    try {
        const userExists = await db.query(
            `
            SELECT * FROM users
            WHERE email = $1`,
            [email]
        );

        if (userExists.rowCount && bcrypt.compareSync(password, userExists.rows[0].password)) {
            const userId = userExists.rows[0].id;
            const token = uuidv4();
            await db.query(
                `
                INSERT INTO sessions (token, "userId")
                VALUES ($1, $2)`,
                [token, userId]
            );
            return res.status(200).send(token)
        } else {
            return res.status(401).send("Invalid information");
        }
        
    } catch (err) {
        return res.status(500).send(err.message);
    }
}