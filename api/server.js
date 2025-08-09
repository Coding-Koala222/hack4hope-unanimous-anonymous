import express from 'express';
import bodyParser from 'body-parser';
import fetch_trials from './fetch_trials.js';

// IMPORTANT: this is for dev purposes and only runs for testing

const app = express();
const PORT = 5173;

app.use(bodyParser.json()); // Parse JSON request bodies

app.post('/fetch_trials', fetch_trials);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});