import { db } from "../config/database.js";
import { customAlphabet } from "nanoid";

export async function shortUrl(req, res) {
    const { url } = req.body;
    const userAccess = res.locals.session;

    const id = userAccess.rows[0].userid;
    const nanoid = customAlphabet("1234567890abcdef", 8);
    const shorterUrl = nanoid();

    try {
        const links = await db.query(
            `
            INSERT INTO "public.urls" (userid, url, shortUrl)
            VALUES ($1, $2, $3)`,
            [id, url, shorterUrl]
        );
        return res.status(201).json({
            id: links.rows[0].id,
            shortUrl: links.rows[0].shortUrl,
        });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function getUrl(req, res) {
    const { id } = req.params;

    try {
        const urlExists = await db.query(
            `
            SELECT * FROM "public.urls" WHERE "id" = $1`,
            [id]
        );
        if (urlExists.rows.length === 0)
            return res.status(404).send("Id has no urls");

        return res.status(200).json({
            id: urlExists.rows[0].id,
            shortUrl: urlExists.rows[0].shortUrl,
            url: urlExists.rows[0].url,
        });
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function openUrl(req, res) {
    const { shortUrl } = req.params;

    try {
        const urlExists = await db.query(
            `
            SELECT * FROM "public.urls"
            WHERE "shortURL" = $1`,
            [shortUrl]
        );
        if (urlExists.rows.length === 0)
            return res.status(404).send("Invalid url");

        const addCount = urlExists.rows[0].visitCount + 1;
        await db.query(
            `
            UPDATE "public.urls"
            SET "visitCount" = $1
            WHERE "shortUrl" = $2`,
            [addCount, shortUrl]
        );

        const selectedUrl = urlExists.rows[0].url;
        return res.redirect(selectedUrl);
    } catch (err) {
        return res.status(500).send(err.message);
    }
}
