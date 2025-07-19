import crypto from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Router } from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router =Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");


const DATA_FILE = path.join(__dirname, "data", "links.json");
const VIEWS_DIR = path.join(__dirname, "..", "views");

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

router.get("/report",(req,res)=>{
    const student=[
        {name:"sush",grade:"BE",favSub:'CSE'},
        {name:"sushv",grade:"BEe",favSub:'CSEe'},
        {name:"sush",grade:"BE",favSub:'CSE'},
        {name:"sush",grade:"BE",favSub:'CSE'}]
        
    
    res.render("report",{student});
})




// Serve form and previously shortened links
router.get("/", async (req, res) => {
    try {
        const filePath = path.join(VIEWS_DIR, "index.html");
        const file = await readFile(filePath, "utf-8");
        const links = await loadLinks();

        const shortenedUrls = Object.entries(links).map(([code, url]) => {
            return `<li><a href="/${code}" target="_blank">${req.headers.host}/${code}</a> - ${url}</li>`;
        }).join("");

        // Add this block to show the most recent short code
        let recentMessage = "";
        if (req.query.recent && links[req.query.recent]) {
            recentMessage = `<p>Most recent short URL: <a href="/${req.query.recent}" target="_blank">${req.headers.host}/${req.query.recent}</a></p>`;
        }

        // Insert the recentMessage into your HTML
        const content = file
            .replace("{{recent_message}}", recentMessage)
            .replace("{{shortened_urls}}", shortenedUrls);

        res.send(content);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Handle form submission
router.post("/", async (req, res) => {
    try {
        const { url, shortCode } = req.body;
        const links = await loadLinks();

        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

        if (links[finalShortCode]) {
            return res.status(400).send("Short code already exists. Please choose another.");
        }

        links[finalShortCode] = url;
        await saveLinks(links);

        res.redirect("/?recent=" + finalShortCode);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Redirect to the original URL
router.get("/:code", async (req, res) => {
    const links = await loadLinks();
    const code = req.params.code;

    if (links[code]) {
        return res.redirect(links[code]);
    }

    res.status(404).send("Short URL not found");
});

//export default router;
// named export
 export const shortenedRoutes=router;