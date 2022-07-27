
export const ALBUMS = "albums";
export const JOBS = "jobs";

export const PENDING = "pending";
export const SUCCESS = "success";
export const FAILURE =  "failure";

export async function insertAlbum(db, mbid, artist, title, labels) {
  const album = await db.collection(ALBUMS).insertOne({
    mbid,
    artist,
    title,
    labels,
  });
  return album;
}

export async function getAlbum(db, mbid) {
  const album = await db.collection(ALBUMS).findOne({ mbid: mbid });
  return album;
}


export async function startJob(db, jobID, jobUrl) {
  const album = await db.collection(JOBS).insertOne({
    jobID,
    "status": PENDING,
    "href": jobUrl
  });
  return album;
}

export async function updateJob(db, jobID, status) {
  if (status != PENDING && status != SUCCESS && status != FAILURE) {
    throw Error(`Invalid job status: ${status}`)
  }
  const album = await db.collection(JOBS).update({jobID: jobID}, {status: status});
  return album;
}

export async function getJob(db, jobID) {
  const job = await db.collection(JOBS).findOne({ jobID: jobID });
  return job;
}
