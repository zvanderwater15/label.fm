
export const ALBUMS = "albums";
export const USER_ALBUMS = "lastfm_user_albums";
export const USER_FRIENDS = "lastfm_user_friends";
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

export async function insertUserAlbums(db, username, albums) {
  const album = await db.collection(USER_ALBUMS).insertOne({
    username,
    albums,
  });
  return album;
}

export async function getUserAlbums(db, username) {
  const userAlbums = await db.collection(USER_ALBUMS).findOne({ username: username });
  return userAlbums ? userAlbums.albums : null;
}

export async function insertUserFriends(db, username, friends) {
  const userFriends = await db.collection(USER_FRIENDS).insertOne({
    username,
    friends
  });
  return userFriends;
}

export async function getUserFriends(db, username) {
  const userFriends = await db.collection(USER_FRIENDS).findOne({ username: username });
  return userFriends ? userFriends.friends : null;
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
  const album = await db.collection(JOBS).updateOne({jobID: jobID}, {$set: {status: status}});
  return album;
}

export async function getJob(db, jobID) {
  const job = await db.collection(JOBS).findOne({ jobID: jobID });
  return job;
}
