// receive
import "dotenv/config";
import { receiveMessage } from "../lib/queues.js"
import { connectToCluster, openDb, closeConnection } from "../lib/db/conn.js";
import { updateJob, SUCCESS, FAILURE, insertAlbum } from "../lib/db/records.js";
import { getLabels } from "../lib/musicbrainz.js";

const saveRecordLabelInformation = async (msg) => {

  const cluster = await connectToCluster();
  const db = await openDb(cluster);

  const {jobID, albums}= JSON.parse(msg.content.toString());

  for (let album of albums) {
    console.log("processing " + album.title + " - " + album.mbid)
    const labels = await getLabels(album.mbid);
    await insertAlbum(db, album.mbid, album.artist, album.title, labels)
    await new Promise(r => setTimeout(r, 1500)); //musicbrainz api limits calls to one per second
  }

  await updateJob(db, jobID, SUCCESS)
  await closeConnection(cluster);
}

const listen = () => receiveMessage(saveRecordLabelInformation);

export default listen();
