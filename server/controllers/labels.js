const { getAlbum, getUserAlbums } = require("../lib/db/records.js");
const lastfm = require("../lib/lastfm.js");
const { createJob } = require("../lib/jobs.js");
const { sendMessage } = require("../lib/queues.js");
const {
  connectToCluster,
  openDb,
  closeConnection,
} = require("../lib/db/conn.js");

const addAlbumLabelsToList = async (labels, album, albumLabels) => {
  albumLabels.labels.forEach((label) => {
    const albumEntry = { name: album.name, artist: album.artist.name };
    if (!labels[label]) {
      labels[label] = {
        name: label,
        albums: [albumEntry],
      };
    } else {
      labels[label]["albums"].push(albumEntry);
    }
  });
};

const topLabelsForUser = async (req, res, next) => {
  let limit = 100; //default
  if (!isNaN(req.query.limit)) {
    limit = parseInt(req.query.limit);
  }
  const cluster = await connectToCluster();

  try {
    const db = await openDb(cluster);

    // get a user's top albums from last.fm
    let topAlbums = await getUserAlbums(db, req.params.username);
    if (!topAlbums) {
      topAlbums = await lastfm.getTopAlbums(req.params.username);
    }

    // build a dictionary of record labels from the given albums
    const labels = {};
    const missingAlbums = [];
    for (let album of topAlbums.albums) {
      // check if the album info is already in the database
      const dbAlbum = await getAlbum(db, album.mbid);
      if (!dbAlbum) {
        // album information missing, this job needs to finish processing using the long running worker
        missingAlbums.push({
          mbid: album.mbid,
          title: album.name,
          artist: album.artist.name,
        });
      }

      // no point in building the response further if we still need to gather missing album info
      if (missingAlbums.length === 0) {
        await addAlbumLabelsToList(labels, album, dbAlbum);
      }
    }

    if (missingAlbums.length > 0) {
      // if an album exists that isn't in the database, send job to the worker
      // put job status in mongodb as pending
      const jobUrl = `/api/labels/${req.params.username}`;
      const jobId = await createJob(db, jobUrl);
      const message = JSON.stringify({ jobID: jobId, albums: missingAlbums });
      await sendMessage(message);
      res.status(202).json({ href: `/api/jobs/${jobId}` });
    } else {
      const sortedLabels = Object.values(labels)
        .sort((a, b) => (a["albums"].length < b["albums"].length ? 1 : -1))
        .slice(0, limit);
      res.json({ labels: sortedLabels });
    }
  } catch (e) {
    throw e;
  } finally {
    await closeConnection(cluster);
  }
};

module.exports = { topLabelsForUser };
