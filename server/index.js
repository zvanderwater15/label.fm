// server/index.js
import "dotenv/config";
import express, { static as expressStatic } from "express";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { topLabelsForUser } from "./controllers/labels.js";
import { checkJob } from "./controllers/jobs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3001;

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Have Node serve the files for our built React app
app.use(expressStatic(resolve(__dirname, "../client/build")));

/*
Query params:
limit - integer string
Returns
labels [
  {
    "name": "PC Music",
    "albums": ["7g", "Apple"]
  }
]
*/
app.use("/api/labels/:username", topLabelsForUser);
app.use("/api/jobs/:jobId", checkJob);

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(resolve(__dirname, "../client/build", "index.html"));
});
