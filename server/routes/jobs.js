
import express from "express";
import { getJob } from "../lib/db/records.js";
import { connectToCluster, openDb, closeConnection } from "../lib/db/conn.js";

const router = express.Router()

router.get("/:jobId", async (req, res) => {
    const cluster = await connectToCluster();
    const db = await openDb(cluster);

    const job = await getJob(db, req.params.jobId);
    await closeConnection(cluster);

    if (job) {
        res.json({"status": job.status, "href": job.href});
    } else {
        res.status(404);
    }
  });
  
export default router;