import { readFile, writeFile } from 'fs/promises';
import { createServer } from 'http';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';

const app=express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3005;
const DATA_FILE = path.join(__dirname, "data", "links.json");
const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static("public"));

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

app.get("/", async(res,req)=>{
    try {
       const file =await fs.readFile(path.join("views","index.html")) ;
        const links= await loadLinks();
    } catch (error) {
        console.error(err);
        return res.status(500).send(" Internal server error");
    }
})

app.post("/", async(res,req)=>{
    try {
       const { url, shortCode } = req.body; 
       const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

                if (links[finalShortCode]) {
                    res.status(400).send(' Short code already exist . please choose another');

                }
                links[finalShortCode] = url;
                await saveLinks(links);

                const content =file.toString().replaceAll("{{shortened_urls}}",Object.entries(links).map([shortCode,url])=>{`<li><a href="/${shortCode}" target="_blank">${req.host}/${shortCode}</a>- ${url}</li>`}).join(""));
                return res.send(content);
    } catch (error) {
        console.error(err);
        return res.status(500).send(" INternal server error ");
    }
})



app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
