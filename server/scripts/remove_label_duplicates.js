import "dotenv/config";
import { closeConnection, connectToCluster, openDb } from "../lib/db/conn.js";
import { getAllAlbums, updateAlbumLabels } from "../lib/db/records.js";

async function removeDuplicates() {
  const cluster = await connectToCluster();
  const db = await openDb(cluster);
  const albums = await getAllAlbums(db)

  let document;
  while ((document = await albums.next())) {
    if (document.labels.length > 1) {
        const labels = [... new Set(document.labels)]
        const updated = await updateAlbumLabels(db, document.mbid, labels)
    }
  }
  
  await closeConnection(cluster);
}

(async () => {
  const clientResult = await removeDuplicates();
})();
