import express from 'express';

import {shortenedRoutes} from './routes/shortner.routes.js';

import path from 'path';
const app = express();
app.use(shortenedRoutes);


const PORT = 3005;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // for form data

// Load stored links


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
