require("dotenv/config");
const { receiveMessage } = require("../lib/queues.js");
const {
  connectToCluster,
  openDb,
  closeConnection,
} = require("../lib/db/conn.js");
const {
  updateJob,
  insertAlbum,
} = require("../lib/db/records.js");
const constants = require("../lib/constants.js")
const { getLabels } = require("../lib/musicbrainz.js");
const { NotFoundError } = require("../lib/errors.js");

const saveRecordLabelInformation = async (msg) => {
  const cluster = await connectToCluster();
  const db = await openDb(cluster);

  const { jobID, albums } = JSON.parse(msg.content.toString());
  console.log("starting job " + jobID);
  for (let album of albums) {
    try {
      if (typeof(album) === "object") {
        console.log("processing " + album.title + " - " + album.mbid);
        const release = await getLabels(album.mbid);
        await insertAlbum(db, album.mbid, album.artist, album.title, release.labels);  
      } else {
        // no album information, just mbid, so get album information from musicbrainz
        const release = await getLabels(album);
        console.log("processing " + release.title + " - " + album);
        await insertAlbum(db, album, release.artist, release.title, release.labels);  
        console.log(album, release.artist, release.title, release.labels)
      }
    } catch (err) {
      if (err instanceof NotFoundError) {
        console.error(err.message);
      } else {
        await updateJob(db, jobID, constants.FAILURE);
        throw err;
      }
    }
    await new Promise((r) => setTimeout(r, 1200)); //musicbrainz api limits calls to one per second
  }

  await updateJob(db, jobID, constants.SUCCESS);
  await closeConnection(cluster);
};

const listen = () => receiveMessage(saveRecordLabelInformation);

module.exports = listen();
