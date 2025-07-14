import { readFile } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { createServer } from 'http';
import crypto from 'crypto';
import path from 'path';

const PORT = 3005;
const DATA_FILE = path.join("data", "links.json");

// Serve static files
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

// Load saved short links
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

// Save short links
const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links));
};

// Create HTTP server
const server = createServer(async (req, res) => {
    if (req.method === "GET") {
        if (req.url === "/") {
            return serveFile(res, path.join("public", "index.html"), "text/html");
        } else if (req.url === "/style.css") {
            return serveFile(res, path.join("public", "style.css"), "text/css");
        }
    }

    if (req.method === "POST" && req.url === "/shorten") {
        const links = await loadLinks();

        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {
            try {
                const { url, shortCode } = JSON.parse(body);

                if (!url) {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    return res.end("URL is required");
                }

                const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

                if (links[finalShortCode]) {
                    res.writeHead(400, { "Content-Type": "text/plain" });
                    return res.end("Short code already exists. Please choose another");
                }

                links[finalShortCode] = url;
                await saveLinks(links);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, shortCode: finalShortCode }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
                console.error("Error parsing POST body:", err);
            }
        });
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
