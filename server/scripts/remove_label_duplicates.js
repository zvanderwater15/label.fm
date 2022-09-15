require("dotenv/config");
const { closeConnection, connectToCluster, openDb } = require("../lib/db/conn.js");
const { getAllAlbums, updateAlbumLabels } = require("../lib/db/records.js");

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
