const constants = require("../constants")

async function insertAlbum(db, mbid, artist, title, labels) {
  const album = await db.collection(constants.ALBUMS).insertOne({
    mbid,
    artist,
    title,
    labels,
  });
  return album;
}

async function getAllAlbums(db) {
  const albums = await db.collection(constants.ALBUMS).find();
  return albums;
}

async function getAlbum(db, mbid) {
  const album = await db.collection(constants.ALBUMS).findOne({ mbid: mbid });
  return album;
}

async function updateAlbumLabels(db, mbid, labels) {
  const album = await db
    .collection(constants.ALBUMS)
    .updateOne({ mbid: mbid }, { $set: { labels: labels } });
  return album;
}

async function insertUserAlbums(db, username, albums) {
  const userAlbums = await db.collection(constants.USER_ALBUMS).updateOne(
    { username },
    {
      $set: {
        username,
        albums,
      },
    },
    { upsert: true }
  );
  return userAlbums;
}

async function getAllUserAlbums(db) {
  const cursor = await db.collection(constants.USER_ALBUMS).find();
  return cursor;
}

async function getUserAlbums(db, username) {
  const userAlbums = await db
    .collection(constants.USER_ALBUMS)
    .findOne({ username: username });
  return userAlbums ? userAlbums.albums : null;
}

async function deleteUserAlbums(db, username) {
  const deleted = await db
    .collection(constants.USER_ALBUMS)
    .deleteOne({ username: username });
  return deleted;
}

async function insertUserFriends(db, username, friends) {
  const userFriends = await db.collection(constants.USER_FRIENDS).updateOne(
    { username },
    {
      $set: {
        username,
        friends,
      },
    },
    { upsert: true }
  );

  return userFriends;
}

async function getUserFriends(db, username) {
  const userFriends = await db
    .collection(constants.USER_FRIENDS)
    .findOne({ username: username });
  return userFriends ? userFriends.friends : null;
}

async function deleteJob(db, jobID) {
  const album = await db.collection(constants.JOBS).deleteOne({
    jobID,
  });
  return album;
}

async function insertJob(db, jobID, jobUrl) {
  const album = await db.collection(constants.JOBS).insertOne({
    jobID,
    status: constants.PENDING,
    href: jobUrl,
  });
  return album;
}

async function updateJob(db, jobID, status) {
  if (status != constants.PENDING && status != constants.SUCCESS && status != constants.FAILURE) {
    throw Error(`Invalid job status: ${status}`);
  }
  const album = await db
    .collection(constants.JOBS)
    .updateOne({ jobID: jobID }, { $set: { status: status } });
  return album;
}

async function getJob(db, jobID) {
  const job = await db.collection(constants.JOBS).findOne({ jobID: jobID });
  return job;
}

module.exports = {
  insertAlbum,
  getAllAlbums,
  getAlbum,
  updateAlbumLabels,
  insertUserAlbums,
  getAllUserAlbums,
  getUserAlbums,
  deleteUserAlbums,
  insertUserFriends,
  getUserFriends,
  deleteJob,
  insertJob,
  updateJob,
  getJob,
};
