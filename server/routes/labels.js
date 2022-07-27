import express from "express";
import { startJob, getAlbum } from "../lib/db/records.js";
import { getTopAlbums } from "../lib/lastfm.js";
import { sendMessage } from "../lib/queues.js";
import { connectToCluster, openDb, closeConnection } from "../lib/db/conn.js";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router()

/*
labels [
  {
    "name": "PC Music",
    "albums": ["7g", "Apple"]
  }
]
*/
router.get("/:username", async (req, res) => {
    const cluster = await connectToCluster();
    const db = await openDb(cluster);
  
    // get a user's top albums from last.fm
    let topAlbums;
    try {
      topAlbums = await getTopAlbums(req.params.username);
    } catch (e) {
      return res.status(404).send("User not found");
    }
  
    // build a dictionary of record labels from the given albums
    const labels = {}
    const missingMBIDs = []
    for (let album of topAlbums.albums) {
      // check if the album info is already in the database
      const dbAlbum = await getAlbum(db, album.mbid)
      if (!dbAlbum) {
        // album information missing, this job needs to finish processing using the long running worker
        missingMBIDs.push(album.mbid) 
        continue
      }

    // no point in building the 
    if (missingMBIDs.length === 0) {
        dbAlbum.labels.forEach(label => {
            const albumEntry = {"name": album.name, "artist": album.artist.name}
            if (!labels[label]) {
                labels[label] = {
                "name": label,
                "albums": [albumEntry]
                }
            }
            else {
                labels[label]["albums"].push(albumEntry)
            }
        })        
    }
  
    }
    
    if (missingMBIDs.length > 0) {
        // if an album exists that isn't in the database, send job to the worker
        // put job status in mongodb as pending
        const jobId = uuidv4();
        const host = req.headers.host;
        const jobUrl = `https://${host}/api/labels/${req.params.username}`
        await startJob(db, jobId, jobUrl);
        const message = JSON.stringify({"jobID": jobId, "mbids": missingMBIDs})
        await sendMessage(message);
        res.status(202).json({"href": `https://${host}/api/jobs/${jobId}`});
    } else {
      const sortedLabels = Object.values(labels).sort((a, b) => a["albums"].length < b["albums"].length ? 1 : -1);
      res.json({"labels": sortedLabels});
    }
    await closeConnection(cluster);
  });
  
export default router;