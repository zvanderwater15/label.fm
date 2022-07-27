// receive
import "dotenv/config";
import { receiveMessage } from "../lib/queues.js"
import { updateJob, SUCCESS, FAILURE, insertAlbum } from "../lib/db/records.js";
import { getLabels } from "../lib/musicbrainz.js";

const saveRecordLabelInformation = async (msg) => {
  console.log("receiving message", msg.content.toString())

  // const payload = JSON.parse(msg.content.toString());
  // console.log("json", payload)
  // // db connection
  // for (let mbid of payload.mbids) {
  //   const labels = await getLabels(mbid);
  //   console.log("inserting", mbid, labels)
  //   // await insertAlbum(db, mbid, artist, title, labels)
  //   // get info from musicbrainz
  //   // save
  // }
  // // connection close
  // await updateJob(message.job, SUCCESS)
}

const listen = () => receiveMessage(saveRecordLabelInformation);

export default listen();
