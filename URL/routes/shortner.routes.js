import crypto from 'crypto';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Router } from 'express';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');

// Initialize data directory
const initializeData = async () => {
    try {
        await mkdir(DATA_DIR, { recursive: true });
        await writeFile(DATA_FILE, JSON.stringify({}), { flag: 'wx' });
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
};

// Load stored links
const loadLinks = async () => {
    try {
        await initializeData();
        const data = await readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading links:', error);
        return {};
    }
};

// Save updated links
const saveLinks = async (links) => {
    try {
        await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
    } catch (error) {
        console.error('Error saving links:', error);
        throw error;
    }
};

// Report route
router.get('/report', (req, res) => {
    const students = [
        { name: 'sush', grade: 'BE', favSub: 'CSE' },
        { name: 'sushv', grade: 'BEe', favSub: 'CSEe' },
        { name: 'sush', grade: 'BE', favSub: 'CSE' },
        { name: 'sush', grade: 'BE', favSub: 'CSE' }
    ];
    res.render('report', { students });
});

// Main route
router.get('/', async (req, res) => {
    try {
        const links = await loadLinks();
        
        res.render('index', {
            recent: req.query.recent,
            links: Object.entries(links).map(([code, url]) => ({
                code,
                url,
                shortUrl: `${req.headers.host}/${code}`
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});

// Handle form submission
router.post('/', async (req, res) => {
    try {
        const { url, shortCode } = req.body;
        
        if (!url) {
            return res.status(400).render('error', { message: 'URL is required' });
        }

        const links = await loadLinks();
        const finalShortCode = shortCode || crypto.randomBytes(4).toString('hex');

        if (links[finalShortCode]) {
            return res.status(400).render('error', { 
                message: 'Short code already exists. Please choose another.' 
            });
        }

        links[finalShortCode] = url;
        await saveLinks(links);

        res.redirect(`/?recent=${finalShortCode}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});

// Redirect to the original URL
router.get('/:code', async (req, res) => {
    try {
        const links = await loadLinks();
        const code = req.params.code;

        if (links[code]) {
            return res.redirect(links[code]);
        }

        res.status(404).render('error', { message: 'Short URL not found' });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});

export const shortenedRoutes = router;