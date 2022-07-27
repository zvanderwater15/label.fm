// server/index.js
import 'dotenv/config'
import express, { static as expressStatic } from "express";
import { resolve, dirname } from 'path';
import {fileURLToPath} from 'url';
import labelRoutes from './routes/labels.js'
import jobRoutes from './routes/jobs.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3001;

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Have Node serve the files for our built React app
app.use(expressStatic(resolve(__dirname, '../client/build')));
app.use('/api/labels', labelRoutes);
app.use('/api/jobs', jobRoutes);

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, '../client/build', 'index.html'));
});
