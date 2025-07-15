
import { readFile } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { createServer } from 'http';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3005;
const DATA_FILE = path.join(__dirname, "data", "links.json");
const PUBLIC_DIR = path.join(__dirname, "public");

const serveFile = async (res, filePath, contentType) => {
    try {
        const data = await readFile(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 page not found");
    }
};


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


const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
};


const server = createServer(async (req, res) => {
    if (req.method === "GET") {
        if (req.url === "/") {
            return serveFile(res, path.join(PUBLIC_DIR, "index.html"), "text/html");
        } else if (req.url === "/style.css") {
            return serveFile(res, path.join(PUBLIC_DIR, "style.css"), "text/css");
        } else if (req.url === '/links') {
    try {
        const links = await loadLinks();
        
        const entries = Object.entries(links);
        const mostRecent = entries.length > 0 ? entries[entries.length - 1] : null;
        
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(mostRecent ? { 
            [mostRecent[0]]: mostRecent[1] 
        } : {}));
    } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end("Internal Server Error");
    }
}
        } else {
            const links = await loadLinks();
            const shortCode = req.url.slice(1);
            if (links[shortCode]) {
                res.writeHead(302, { Location: links[shortCode] });
                return res.end();
            }
            res.writeHead(404, { "Content-Type": "text/plain" });
            return res.end("404 - Short URL not found");
        }
    }

    if (req.method === "POST" && req.url === "/shorten") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {
            try {
                const { url, shortCode } = JSON.parse(body);
                const links = await loadLinks();

                if (!url) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "URL is required" }));
                }

                const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

                if (links[finalShortCode]) {
                    res.writeHead(409, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "Short code already exists" }));
                }

                links[finalShortCode] = url;
                await saveLinks(links);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ 
                    success: true, 
                    shortCode: finalShortCode,
                    shortUrl: `http://localhost:${PORT}/${finalShortCode}`
                }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Internal Server Error" }));
                console.error("Error:", err);
            }
        });
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});