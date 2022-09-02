export const ALBUMS = "albums";
export const USER_ALBUMS = "lastfm_user_albums";
export const USER_FRIENDS = "lastfm_user_friends";
export const JOBS = "jobs";

export const PENDING = "pending";
export const SUCCESS = "success";
export const FAILURE = "failure";

export async function insertAlbum(db, mbid, artist, title, labels) {
  const album = await db.collection(ALBUMS).insertOne({
    mbid,
    artist,
    title,
    labels,
  });
  return album;
}

export async function getAllAlbums(db) {
  const albums = await db.collection(ALBUMS).find();
  return albums;
}

export async function getAlbum(db, mbid) {
  const album = await db.collection(ALBUMS).findOne({ mbid: mbid });
  return album;
}

export async function updateAlbumLabels(db, mbid, labels) {
  const album = await db
    .collection(ALBUMS)
    .updateOne({ mbid: mbid }, { $set: { labels: labels } });
  return album;
}

export async function insertUserAlbums(db, username, albums) {
  const userAlbums = await db.collection(USER_ALBUMS).updateOne(
    { username },
    {$set: {
      username,
      albums,
    }},
    { upsert: true }
  );
  return userAlbums;
}

export async function getAllUserAlbums(db) {
  const cursor = await db.collection(USER_ALBUMS).find();
  return cursor;
}

export async function getUserAlbums(db, username) {
  const userAlbums = await db
    .collection(USER_ALBUMS)
    .findOne({ username: username });
  return userAlbums ? userAlbums.albums : null;
}

export async function deleteUserAlbums(db, username) {
  const deleted = await db
    .collection(USER_ALBUMS)
    .deleteOne({ username: username });
  return deleted;
}

export async function insertUserFriends(db, username, friends) {
  const userFriends = await db.collection(USER_FRIENDS).updateOne(
    { username },
    {$set: {
      username,
      friends,
    }},
    { upsert: true }
  );

  return userFriends;
}

export async function getUserFriends(db, username) {
  const userFriends = await db
    .collection(USER_FRIENDS)
    .findOne({ username: username });
  return userFriends ? userFriends.friends : null;
}

export async function deleteJob(db, jobID) {
  const album = await db.collection(JOBS).deleteOne({
    jobID,
  });
  return album;
}

export async function insertJob(db, jobID, jobUrl) {
  const album = await db.collection(JOBS).insertOne({
    jobID,
    status: PENDING,
    href: jobUrl,
  });
  return album;
}

export async function updateJob(db, jobID, status) {
  if (status != PENDING && status != SUCCESS && status != FAILURE) {
    throw Error(`Invalid job status: ${status}`);
  }
  const album = await db
    .collection(JOBS)
    .updateOne({ jobID: jobID }, { $set: { status: status } });
  return album;
}

export async function getJob(db, jobID) {
  const job = await db.collection(JOBS).findOne({ jobID: jobID });
  return job;
}
