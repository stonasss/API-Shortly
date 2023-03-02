import { db } from "../config/database.js";

export async function validateToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.status(401).send("Missing token");

    try {
        const userAccess = await db.query(
            `
            SELECT * FROM "public.sessions"
            WHERE "token" = $1`,
            [token]
        );

        if (userAccess.rows.length === 1) {
            res.locals.session = userAccess;
            next();
        }

        return res.status(401).send("Invalid token");
    } catch (err) {
        return res.status(500).send(err.message);
    }
}
