const { v4: uuidv4 } = require("uuid");
const { PENDING, insertJob } = require("./db/records");

async function createJob(db, url) {
  const jobId = uuidv4();
  await insertJob(db, jobId, url, PENDING);
  return jobId;
}

module.exports = { createJob };
