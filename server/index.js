// server/index.js
import 'dotenv/config'
import express, { static as expressStatic } from "express";
import { resolve, dirname } from 'path';
import {fileURLToPath} from 'url';
import { getTopAlbums } from "./lib/lastfm.js";
import { insertAlbum, getAlbum } from "./db/records.js";
import { getLabels } from "./lib/musicbrainz.js";
import { connectToCluster, openDb, closeConnection } from "./db/conn.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3001;

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Have Node serve the files for our built React app
app.use(expressStatic(resolve(__dirname, '../client/build')));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Handle GET requests to /api route
/*
labels [
  {
    "name": "PC Music",
    "albums": ["7g", "Apple"]
  }
]
*/
app.get("/api/:username/producers", async (req, res) => {
  const cluster = await connectToCluster();
  const db = await openDb(cluster)

  // get a user's top albums from last.fm
  const topAlbums = await getTopAlbums(req.params.username)

  // build a dictionary of record labels from the given albums
  const labels = {}
  for (let album of topAlbums.albums) {
    // check if the album info is already in the database
    const dbAlbum = await getAlbum(db, album.mbid)
    let albumLabels;
    if (dbAlbum) {
      albumLabels = dbAlbum.labels;
    }
    else {
      await new Promise(r => setTimeout(r, 1000));
      albumLabels = await getLabels(album.mbid);
      await insertAlbum(db, album.mbid, album.artist.name, album.name, albumLabels)
    }

    console.log(albumLabels)
    albumLabels.forEach(label => {
      if (!labels[label]) {
        labels[label] = {
          "name": label,
          "albums": [{"name": album.name, "artist": album.artist.name}]
        }
      }
      else {
        labels[label]["albums"].push({"name": album.name, "artist": album.artist.name})
      }
    })
  }
  const sortedLabels = Object.values(labels).sort((a, b) => a["albums"].length < b["albums"].length ? 1 : -1);
  await closeConnection(cluster);
  res.json({"labels": sortedLabels});
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, '../client/build', 'index.html'));
});
