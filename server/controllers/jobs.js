const { getJob } = require("../lib/db/records.js");
const { connectToCluster, openDb, closeConnection } = require("../lib/db/conn.js");


const checkJob = async (req, res, next) => {
    const cluster = await connectToCluster();
    const db = await openDb(cluster);
    const job = await getJob(db, req.params.jobId);
    await closeConnection(cluster);
    if (job) {
        res.json({"status": job.status, "href": job.href});
    } else {
        res.status(404).end();
    }
}

module.exports = { checkJob }