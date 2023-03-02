import { db } from "../config/database.js";

export async function ranking(req, res) {
    try {
        const rank = await db.query(
            `
            SELECT users.id, users.name, COUNT(urls.id) AS "linksCount", SUM(urls."visitCount") AS "visitCount"
            FROM users
            LEFT JOIN urls ON users.id = urls."userId"
            GROUP BY users.id
            ORDER BY "visitCount" DESC
            LIMIT 10;`
        );
        return res.status(200).send(rank.rows);
        
    } catch (err) {
        return res.status(500).send(err.message);
    }
}