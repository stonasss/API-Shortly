import { db } from "../config/database.js";
import { customAlphabet } from "nanoid";

export async function shortUrl(req, res) {
    const { url } = req.body;
    const userAccess = res.locals.session;

    const userid = userAccess.rows[0].userId;
    const nanoid = customAlphabet("1234567890abcdef", 8);
    const shorterUrl = nanoid();

    try {
        const links = await db.query(
            `
            INSERT INTO urls ("userId", url, "shortenedUrl")
            VALUES ($1, $2, $3)
            RETURNING * `,
            [userid, url, shorterUrl]
        );
        return res.status(201).json({
            id: links.rows[0].id,
            shortUrl: links.rows[0].shortenedUrl,
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
            SELECT * FROM urls
            WHERE id = $1`,
            [id]
        );
        if (urlExists.rows.length === 0)
            return res.status(404).send("Id has no urls");

        return res.status(200).json({
            id: urlExists.rows[0].id,
            shortUrl: urlExists.rows[0].shortenedUrl,
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
            SELECT * FROM urls
            WHERE "shortenedUrl" = $1`,
            [shortUrl]
        );
        if (urlExists.rows.length === 0)
            return res.status(404).send("Invalid url");

        const addCount = urlExists.rows[0].visitCount + 1;
        console.log(addCount)
        await db.query(
            `
            UPDATE urls
            SET "visitCount" = $1
            WHERE "shortenedUrl" = $2`,
            [addCount, shortUrl]
        );

        const selectedUrl = urlExists.rows[0].url;
        console.log(selectedUrl)
        return res.redirect(selectedUrl);
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function deleteUrl(req, res) {
    const { id } = req.params;
    const userAccess = res.locals.session;

    const userid = userAccess.rows[0].userId;

    try {
        const idExists = await db.query(
            `
            SELECT * FROM urls
            WHERE id = $1`,
            [id]
        );

        if (idExists.rows.length === 0)
            return res.status(404).send("Invalid id");
        if (idExists.rows[0].userId !== userid)
            return res.status(401).send("Ids do not match");

        await db.query(
            `
            DELETE FROM urls
            WHERE id = $1`,
            [id]
        );
        return res.status(204).send("url successfully deleted");
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function userInfo(req, res) {
    const userAccess = res.locals.session;
    const userid = userAccess.rows[0].userId;

    try {
        const userUrls = await db.query(
            `
            SELECT
            id,
            "shortenedUrl" AS "shortUrl",
            url,
            "visitCount"
            FROM urls
            WHERE "userId" = $1`,
            [userid]
        );

        const userTrack = await db.query(
            `
            SELECT
            id,
            name,
            (SELECT SUM("visitCount")
            FROM urls
            WHERE "userId" = $1) AS "visitCount"
            FROM users
            WHERE id = $1`,
            [userid]
        );

        const completeObj = {
            id: userTrack.rows[0].id,
            name: userTrack.rows[0].name,
            visitCount: userTrack.rows[0].visitCount ? Number(userTrack.rows[0].visitCount) : 0,
            shortenedUrls: userUrls.rows,
        };

        return res.status(200).send(completeObj);
    } catch (err) {
        return res.status(500).send(err.message);
    }
}
