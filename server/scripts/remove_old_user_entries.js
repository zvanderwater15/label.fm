require("dotenv/config");
const { closeConnection, connectToCluster, openDb } = require("../lib/db/conn.js");
const { deleteUserAlbums, getAllAlbums, getAllUserAlbums, updateAlbumLabels } = require("../lib/db/records.js");

async function removeDuplicates() {
  const cluster = await connectToCluster();
  const db = await openDb(cluster);
  const albums = await getAllUserAlbums(db)
  
  let document;
  while ((document = await albums.next())) {
    if (document.albums.albums.length < 100) {
        const deleted = await deleteUserAlbums(db, document.username);
        console.log(document.username, deleted)
    }
  }
  
  await closeConnection(cluster);
}

(async () => {
  const clientResult = await removeDuplicates();
})();
