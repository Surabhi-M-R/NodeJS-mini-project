import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3005;
const DATA_FILE = path.join(__dirname, "data", "links.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const VIEWS_DIR = path.join(__dirname, "views");

app.use(express.static(PUBLIC_DIR));
app.use(express.urlencoded({ extended: true })); // for form data

// Load stored links
const loadLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        throw error;
    }
};

// Save updated links
const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
};

// Serve form and previously shortened links
app.get("/", async (req, res) => {
    try {
        const filePath = path.join(VIEWS_DIR, "index.html");
        const file = await readFile(filePath, "utf-8");
        const links = await loadLinks();

        const shortenedUrls = Object.entries(links).map(([code, url]) => {
            return `<li><a href="/${code}" target="_blank">${req.headers.host}/${code}</a> - ${url}</li>`;
        }).join("");

        const content = file.replace("{{shortened_urls}}", shortenedUrls);
        res.send(content);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Handle form submission
app.post("/", async (req, res) => {
    try {
        const { url, shortCode } = req.body;
        const links = await loadLinks();

        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

        if (links[finalShortCode]) {
            return res.status(400).send("Short code already exists. Please choose another.");
        }

        links[finalShortCode] = url;
        await saveLinks(links);

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Redirect to the original URL
app.get("/:code", async (req, res) => {
    const links = await loadLinks();
    const code = req.params.code;

    if (links[code]) {
        return res.redirect(links[code]);
    }

    res.status(404).send("Short URL not found");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
